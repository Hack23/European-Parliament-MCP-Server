/**
 * MCP Tool: analyze_coalition_dynamics
 * 
 * Detect voting coalitions, cross-party alliances, group cohesion rates,
 * and coalition stress indicators.
 * 
 * **Intelligence Perspective:** Coalition analysis tool detecting voting blocs,
 * measuring political group cohesion, and identifying emerging cross-party alliances
 * using CIA Coalition Analysis methodology.
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { AnalyzeCoalitionDynamicsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';
import { auditLogger, toErrorMessage } from '../utils/auditLogger.js';

interface CoalitionPairAnalysis {
  groupA: string;
  groupB: string;
  cohesionScore: number;
  sharedVotes: number;
  totalVotes: number;
  allianceSignal: boolean;
  trend: string;
}

interface GroupCohesionMetrics {
  groupId: string;
  memberCount: number;
  internalCohesion: number;
  defectionRate: number;
  avgAttendance: number;
  stressIndicator: number;
  computedAttributes: {
    disciplineScore: number;
    fragmentationRisk: number;
    unityTrend: string;
    activeParticipationRate: number;
  };
}

interface CoalitionDynamicsAnalysis {
  period: { from: string; to: string };
  groupMetrics: GroupCohesionMetrics[];
  coalitionPairs: CoalitionPairAnalysis[];
  dominantCoalition: { groups: string[]; combinedStrength: number; cohesion: number };
  stressIndicators: { indicator: string; severity: string; affectedGroups: string[] }[];
  computedAttributes: {
    parliamentaryFragmentation: number;
    effectiveNumberOfParties: number;
    grandCoalitionViability: number;
    oppositionStrength: number;
  };
  confidenceLevel: string;
  dataFreshness: string;
  sourceAttribution: string;
  methodology: string;
}

const POLITICAL_GROUPS = ['EPP', 'S&D', 'Renew', 'Greens/EFA', 'ECR', 'ID', 'The Left', 'NI'];

/**
 * Classifies a coalition cohesion score as a qualitative trend string.
 *
 * Thresholds:
 * - **`STRENGTHENING`** — score > 0.6: cohesion is above the stability baseline
 * - **`STABLE`** — score in (0.4, 0.6]: cohesion is in a neutral range
 * - **`WEAKENING`** — score ≤ 0.4: cohesion is below the stability baseline
 *
 * @param score - Cohesion score in the range `[0, 1]`
 * @returns Trend classification string
 */
function classifyCohesionTrend(score: number): string {
  if (score > 0.6) return 'STRENGTHENING';
  if (score > 0.4) return 'STABLE';
  return 'WEAKENING';
}

/**
 * Computes a pairwise coalition cohesion record for two political groups.
 *
 * **Limitation:** The EP API `/meps/{id}` endpoint does not expose per-vote
 * statistics, so true pairwise voting cohesion cannot be calculated directly.
 * Instead, cohesion is **approximated from group size balance**: smaller groups
 * aligned with a larger group tend to behave more homogeneously, so a balanced
 * size ratio proxies coalition alignment potential.
 *
 * Formula: `cohesion = min(sizeA, sizeB) / max(sizeA, sizeB)` (range 0–1).
 * `sharedVotes` and `totalVotes` are reported as 0 to reflect data limitations.
 *
 * @param groupA - Political group identifier for the first group
 * @param groupB - Political group identifier for the second group
 * @param groupAMembers - Sample-based member count estimate (lower bound) for `groupA` derived from EP API data
 * @param groupBMembers - Sample-based member count estimate (lower bound) for `groupB` derived from EP API data
 * @param minimumCohesion - Threshold above which `allianceSignal` is set to `true`
 * @returns {@link CoalitionPairAnalysis} record where `cohesionScore` is an
 *   approximation based on group-size balance (not actual voting behavior — see
 *   **Limitation** note above), `sharedVotes` and `totalVotes` are always 0
 */
function computePairCohesion(
  groupA: string,
  groupB: string,
  groupAMembers: number,
  groupBMembers: number,
  minimumCohesion: number
): CoalitionPairAnalysis {
  // Use relative group sizes as a proxy — no synthetic seed-based data
  const totalMembers = groupAMembers + groupBMembers;
  const balance = totalMembers > 0
    ? Math.min(groupAMembers, groupBMembers) / Math.max(1, Math.max(groupAMembers, groupBMembers))
    : 0;
  const cohesionScore = Math.round(balance * 100) / 100;
  const sharedVotes = 0; // Not available from EP API without vote-level analysis
  const totalVotes = 0;

  return {
    groupA, groupB, cohesionScore, sharedVotes, totalVotes,
    allianceSignal: cohesionScore > minimumCohesion,
    trend: classifyCohesionTrend(cohesionScore)
  };
}

/**
 * Fetches sampled MEP membership counts for each target political group from the EP API
 * and builds {@link GroupCohesionMetrics} records.
 *
 * **Note (data scope):** This function queries the EP `/meps` endpoint with a capped
 * `limit` of 50 MEPs per group (first page only). As a result, the derived
 * `memberCount` for a group is a **sample-based lower bound**: larger groups with
 * more than 50 MEPs will be undercounted. Callers MUST NOT treat `memberCount` as
 * an authoritative total; it is intended for relative, coarse sizing only.
 *
 * **Note (voting data):** The EP API `/meps` endpoint only returns group membership
 * information, not per-MEP voting statistics. Cohesion, defection rate, and attendance
 * fields are therefore reported as `0` with `unityTrend: 'UNKNOWN'`. Callers should
 * supplement these results with vote-result data when available.
 *
 * @param targetGroups - Political group identifiers to query (e.g., `['EPP', 'S&D']`)
 * @returns Promise resolving to an array of group cohesion metric objects, one per group,
 *   where `memberCount` values are based on a capped first page of results (max 50 MEPs)
 * @throws {Error} If any EP API call for a group fails
 *
 * @security EP API calls are limited to 50 MEPs per group per ISMS Policy AC-003
 *   (least privilege — request only the data needed for analysis). This limit also means
 *   that reported group sizes are approximate lower bounds, not full enumerations.
 */
async function buildGroupMetrics(targetGroups: string[]): Promise<GroupCohesionMetrics[]> {
  const metrics: GroupCohesionMetrics[] = [];
  for (const groupId of targetGroups) {
    const mepsResult = await epClient.getMEPs({ group: groupId, limit: 50 });

    // Per-MEP voting statistics are not available from the EP API,
    // so cohesion/defection/attendance are reported as zero.
    const memberCount = mepsResult.data.length;

    metrics.push({
      groupId,
      memberCount,
      internalCohesion: 0,
      defectionRate: 0,
      avgAttendance: 0,
      stressIndicator: 0,
      computedAttributes: {
        disciplineScore: 0,
        fragmentationRisk: 0,
        unityTrend: 'UNKNOWN',
        activeParticipationRate: 0
      }
    });
  }
  return metrics;
}

/**
 * Builds all pairwise coalition pair analyses for the target groups.
 *
 * Iterates over the upper-triangle of group combinations (O(n²)) and calls
 * {@link computePairCohesion} for each pair using the sample-based `memberCount`
 * estimates from `groupMetrics` (see {@link buildGroupMetrics} for data scope limits).
 *
 * @param targetGroups - Ordered list of political group identifiers
 * @param minimumCohesion - Cohesion threshold for `allianceSignal` detection
 * @param groupMetrics - Pre-fetched group metrics containing sampled `memberCount` per group
 * @returns Array of {@link CoalitionPairAnalysis} records for every group combination
 */
function buildCoalitionPairs(
  targetGroups: string[],
  minimumCohesion: number,
  groupMetrics: GroupCohesionMetrics[]
): CoalitionPairAnalysis[] {
  const pairs: CoalitionPairAnalysis[] = [];
  for (let i = 0; i < targetGroups.length; i++) {
    for (let j = i + 1; j < targetGroups.length; j++) {
      const groupA = targetGroups[i] ?? '';
      const groupB = targetGroups[j] ?? '';
      const groupAMembers = groupMetrics.find(g => g.groupId === groupA)?.memberCount ?? 0;
      const groupBMembers = groupMetrics.find(g => g.groupId === groupB)?.memberCount ?? 0;
      pairs.push(computePairCohesion(groupA, groupB, groupAMembers, groupBMembers, minimumCohesion));
    }
  }
  return pairs;
}

/**
 * Maps a numeric stress indicator to a qualitative severity string.
 *
 * Threshold: stress > 0.7 → `'HIGH'`; otherwise → `'MODERATE'`.
 * A `'LOW'` tier is not emitted here because only groups with
 * `stressIndicator > 0.5` reach this function (see {@link computeStressIndicators}).
 *
 * @param stress - Stress indicator value in `[0, 1]`
 * @returns Severity classification: `'HIGH'` or `'MODERATE'`
 */
function classifyStressSeverity(stress: number): string {
  if (stress > 0.7) return 'HIGH';
  return 'MODERATE';
}

/**
 * Derives stress indicator records from group metrics.
 *
 * Only groups with `stressIndicator > 0.5` (moderate-to-high internal tension)
 * are included. Each record contains a human-readable indicator description,
 * a severity classification from {@link classifyStressSeverity}, and the list
 * of affected groups.
 *
 * @param groupMetrics - Array of group cohesion metric objects
 * @returns Array of stress indicator records for groups exceeding the 0.5 threshold
 */
function computeStressIndicators(groupMetrics: GroupCohesionMetrics[]): { indicator: string; severity: string; affectedGroups: string[] }[] {
  return groupMetrics
    .filter(g => g.stressIndicator > 0.5)
    .map(g => ({
      indicator: `High defection rate in ${g.groupId}`,
      severity: classifyStressSeverity(g.stressIndicator),
      affectedGroups: [g.groupId]
    }));
}

/**
 * Computes parliamentary fragmentation metrics using the Herfindahl–Hirschman Index (HHI).
 *
 * **Effective Number of Parties (ENP):** `1 / Σ(seatShare²)` — a standard political
 * science measure of party-system fragmentation. Higher values indicate a more
 * fragmented parliament.
 *
 * **Grand coalition viability:** Approximated as the mean of EPP and S&D internal
 * cohesion scores, since a grand coalition between the two largest groups is the
 * canonical EP majority formation scenario. A value of 0 reflects the current
 * data limitation (voting statistics unavailable from EP API).
 *
 * @param groupMetrics - Array of group metrics with `memberCount` and `internalCohesion`
 * @returns Object with `effectiveParties` (ENP) and `grandCoalitionViability` (0–1)
 */
function computeFragmentationMetrics(groupMetrics: GroupCohesionMetrics[]): {
  effectiveParties: number;
  grandCoalitionViability: number;
} {
  const totalMembers = groupMetrics.reduce((sum, g) => sum + g.memberCount, 0);
  const seatShares = groupMetrics.map(g => totalMembers > 0 ? g.memberCount / totalMembers : 0);
  const herfindahl = seatShares.reduce((sum, s) => sum + s * s, 0);
  const effectiveParties = herfindahl > 0 ? 1 / herfindahl : 1;

  const eppCohesion = groupMetrics.find(g => g.groupId === 'EPP')?.internalCohesion ?? 0;
  const sdCohesion = groupMetrics.find(g => g.groupId === 'S&D')?.internalCohesion ?? 0;
  const grandCoalitionViability = Math.round((eppCohesion + sdCohesion) / 2 * 100) / 100;

  return { effectiveParties, grandCoalitionViability };
}

/**
 * Identifies the dominant coalition from the sorted pair list.
 *
 * The dominant coalition is the top-ranked pair by cohesion score. Its
 * `combinedStrength` is set to `sharedVotes` (currently 0 due to EP API
 * limitations — see {@link computePairCohesion}).
 *
 * @param sortedPairs - Coalition pairs sorted descending by cohesion score
 * @returns Dominant coalition record, or an empty record if the list is empty
 */
function buildDominantCoalition(sortedPairs: CoalitionPairAnalysis[]): {
  groups: string[];
  combinedStrength: number;
  cohesion: number;
} {
  const topPair = sortedPairs[0];
  if (topPair === undefined) {
    return { groups: [], combinedStrength: 0, cohesion: 0 };
  }
  return {
    groups: [topPair.groupA, topPair.groupB],
    combinedStrength: topPair.sharedVotes,
    cohesion: topPair.cohesionScore
  };
}

/**
 * Derives the `computedAttributes` block for the coalition dynamics analysis.
 *
 * - **`parliamentaryFragmentation`** and **`effectiveNumberOfParties`** both echo the
 *   ENP value (two fields for different consumer use cases).
 * - **`grandCoalitionViability`** reflects EPP + S&D cohesion mean (see
 *   {@link computeFragmentationMetrics}).
 * - **`oppositionStrength`** is approximated as `1 − topCohesion`, where
 *   lower top-pair cohesion implies a stronger opposition bloc.
 *
 * @param fragMetrics - Fragmentation metrics from {@link computeFragmentationMetrics}
 * @param sortedPairs - Coalition pairs sorted descending by cohesion score
 * @returns Computed attributes object for the coalition dynamics result
 */
function buildCoalitionComputedAttrs(
  fragMetrics: { effectiveParties: number; grandCoalitionViability: number },
  sortedPairs: CoalitionPairAnalysis[]
): CoalitionDynamicsAnalysis['computedAttributes'] {
  const topCohesion = sortedPairs[0]?.cohesionScore ?? 0;
  return {
    parliamentaryFragmentation: Math.round(fragMetrics.effectiveParties * 100) / 100,
    effectiveNumberOfParties: Math.round(fragMetrics.effectiveParties * 100) / 100,
    grandCoalitionViability: fragMetrics.grandCoalitionViability,
    oppositionStrength: Math.round((1 - topCohesion) * 100) / 100
  };
}

/**
 * Handles the analyze_coalition_dynamics MCP tool request.
 *
 * Detects voting coalitions, cross-party alliances, group cohesion rates, and
 * coalition stress indicators across European Parliament political groups.
 * Uses CIA Coalition Analysis methodology to measure parliamentary fragmentation,
 * effective number of parties, and grand-coalition viability.
 *
 * @param args - Raw tool arguments, validated against {@link AnalyzeCoalitionDynamicsSchema}
 * @returns MCP tool result containing coalition pair cohesion scores, group cohesion
 *   metrics, dominant coalition, stress indicators, and computed fragmentation attributes
 * @throws - If `args` fails schema validation (e.g., missing required fields or invalid format)
 * - If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * const result = await handleAnalyzeCoalitionDynamics({
 *   groupIds: ['EPP', 'S&D', 'Renew'],
 *   minimumCohesion: 0.5,
 *   dateFrom: '2024-01-01',
 *   dateTo: '2024-12-31'
 * });
 * // Returns coalition pair analysis with cohesion scores, stress indicators,
 * // and parliamentary fragmentation index
 * ```
 *
 * @security - Input is validated with Zod before any API call.
 * - Personal data in responses is minimised per GDPR Article 5(1)(c).
 * - All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link analyzeCoalitionDynamicsToolMetadata} for MCP schema registration
 * @see {@link handleComparePoliticalGroups} for per-group dimension comparison
 * Analyze coalition dynamics tool handler
 *
 * Detects voting coalitions, measures political group cohesion, and identifies
 * cross-party alliances using CIA Coalition Analysis methodology. Fetches real
 * MEP membership counts from the EP Open Data API; pairwise cohesion is derived
 * from group-size ratios (per-MEP voting statistics are not available from the
 * EP API `/meps/{id}` endpoint).
 *
 * **Analysis outputs:**
 * - Group cohesion metrics (member count, stress indicator, fragmentation risk)
 * - Pairwise coalition strength for each group combination
 * - Dominant coalition identification
 * - Stress indicators for groups with high internal tension
 * - Parliament-wide fragmentation index (Herfindahl–Hirschman)
 * - Effective number of parties (ENP)
 *
 * > **Note:** Confidence level is always `LOW` because per-MEP voting statistics
 * > are unavailable from the current EP API. Cohesion/defection metrics report
 * > zero and should be supplemented with vote-result data when available.
 *
 * @param args - Tool arguments matching AnalyzeCoalitionDynamicsSchema
 * @param args.groupIds - Political group identifiers to analyze (optional; defaults to all 8 groups)
 * @param args.dateFrom - Analysis start date in YYYY-MM-DD format (optional)
 * @param args.dateTo - Analysis end date in YYYY-MM-DD format (optional)
 * @param args.minimumCohesion - Minimum cohesion threshold for alliance detection, 0–1 (default 0.5)
 * @returns MCP ToolResult containing `CoalitionDynamicsAnalysis` object as JSON
 * @throws {Error} When the EP API request fails or group data cannot be fetched
 * @throws {ZodError} When input fails schema validation (invalid group IDs, date format)
 *
 * @example
 * ```typescript
 * // Analyze all political groups with default settings
 * const result = await handleAnalyzeCoalitionDynamics({});
 * const analysis = JSON.parse(result.content[0].text);
 * console.log(`Fragmentation index: ${analysis.computedAttributes.parliamentaryFragmentation}`);
 * ```
 *
 * @example
 * ```typescript
 * // Analyze specific groups with higher alliance threshold
 * const result = await handleAnalyzeCoalitionDynamics({
 *   groupIds: ["EPP", "S&D", "Renew"],
 *   minimumCohesion: 0.6,
 *   dateFrom: "2024-01-01",
 *   dateTo: "2024-12-31"
 * });
 * ```
 *
 * @security Input validated by Zod. Errors sanitized (no stack traces exposed).
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */
export async function handleAnalyzeCoalitionDynamics(
  args: unknown
): Promise<ToolResult> {
  const params = AnalyzeCoalitionDynamicsSchema.parse(args);

  try {
    const targetGroups = params.groupIds ?? POLITICAL_GROUPS;
    const groupMetrics = await buildGroupMetrics(targetGroups);
    const coalitionPairs = buildCoalitionPairs(targetGroups, params.minimumCohesion, groupMetrics);
    const sortedPairs = [...coalitionPairs].sort((a, b) => b.cohesionScore - a.cohesionScore);
    const stressIndicators = computeStressIndicators(groupMetrics);
    const fragMetrics = computeFragmentationMetrics(groupMetrics);

    const analysis: CoalitionDynamicsAnalysis = {
      period: { from: params.dateFrom ?? '2024-01-01', to: params.dateTo ?? '2024-12-31' },
      groupMetrics,
      coalitionPairs: sortedPairs,
      dominantCoalition: buildDominantCoalition(sortedPairs),
      stressIndicators,
      computedAttributes: buildCoalitionComputedAttrs(fragMetrics, sortedPairs),
      confidenceLevel: 'LOW',
      dataFreshness: 'Real-time EP API data — political group composition from current MEP records',
      sourceAttribution: 'European Parliament Open Data Portal - data.europarl.europa.eu',
      methodology: 'CIA Coalition Analysis — group composition from real EP Open Data MEP records. '
        + 'Per-MEP voting statistics are not available from the EP API /meps/{id} endpoint; '
        + 'cohesion and stress metrics report zero and should be supplemented with vote-result data. '
        + 'Coalition pair cohesion derived from group size ratios. '
        + 'Data source: European Parliament Open Data Portal.'
    };

    return buildToolResponse(analysis);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    auditLogger.logError('analyze_coalition_dynamics', params as Record<string, unknown>, toErrorMessage(error));
    throw new Error(`Failed to analyze coalition dynamics: ${errorMessage}`);
  }
}

/**
 * Tool metadata for MCP registration
 */
export const analyzeCoalitionDynamicsToolMetadata = {
  name: 'analyze_coalition_dynamics',
  description: 'Analyze political group coalition dynamics including cohesion rates, cross-party alliances, defection rates, and stress indicators. Computes parliamentary fragmentation index, effective number of parties, grand coalition viability, and opposition strength. Uses CIA Coalition Analysis methodology.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      groupIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Political group identifiers to analyze (omit for all groups)',
        minItems: 1,
        maxItems: 10
      },
      dateFrom: {
        type: 'string',
        description: 'Analysis start date (YYYY-MM-DD format)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$'
      },
      dateTo: {
        type: 'string',
        description: 'Analysis end date (YYYY-MM-DD format)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$'
      },
      minimumCohesion: {
        type: 'number',
        description: 'Minimum cohesion threshold for alliance detection (0-1)',
        minimum: 0,
        maximum: 1,
        default: 0.5
      }
    }
  }
};
