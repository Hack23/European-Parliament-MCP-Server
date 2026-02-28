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
import type { DataAvailability, MetricResult } from '../types/index.js';
import { auditLogger, toErrorMessage } from '../utils/auditLogger.js';

interface CoalitionPairAnalysis {
  groupA: string;
  groupB: string;
  cohesionScore: number;
  /** null — vote-level data not available from EP API; not a real vote count */
  sharedVotes: number | null;
  /** null — vote-level data not available from EP API; not a real vote count */
  totalVotes: number | null;
  allianceSignal: boolean;
  trend: string;
}

interface GroupCohesionMetrics {
  groupId: string;
  memberCount: number;
  /** null when EP API does not provide per-MEP voting statistics */
  internalCohesion: number | null;
  /** null when EP API does not provide per-MEP voting statistics */
  defectionRate: number | null;
  /** null when EP API does not provide per-MEP voting statistics */
  avgAttendance: number | null;
  /** Voting-derived stress indicator; null when EP API does not provide voting statistics */
  stressIndicator: MetricResult;
  /** Explicit marker indicating whether voting-derived metrics are available */
  dataAvailability: DataAvailability;
  computedAttributes: {
    disciplineScore: number | null;
    fragmentationRisk: number | null;
    unityTrend: string;
    activeParticipationRate: number | null;
  };
}

interface CoalitionDynamicsAnalysis {
  period: { from: string; to: string };
  groupMetrics: GroupCohesionMetrics[];
  coalitionPairs: CoalitionPairAnalysis[];
  dominantCoalition: { groups: string[]; combinedStrength: number | null; cohesion: number };
  stressIndicators: { indicator: string; severity: string; affectedGroups: string[] }[];
  computedAttributes: {
    parliamentaryFragmentation: number;
    effectiveNumberOfParties: number;
    /** null when cohesion data is UNAVAILABLE */
    grandCoalitionViability: number | null;
    oppositionStrength: number;
  };
  confidenceLevel: string;
  dataFreshness: string;
  sourceAttribution: string;
  methodology: string;
}

const POLITICAL_GROUPS = ['EPP', 'S&D', 'Renew', 'Greens/EFA', 'ECR', 'ID', 'The Left', 'NI'];

/**
 * Classify cohesion trend
 */
function classifyCohesionTrend(score: number): string {
  if (score > 0.6) return 'STRENGTHENING';
  if (score > 0.4) return 'STABLE';
  return 'WEAKENING';
}

/**
 * Compute coalition pair cohesion from real member counts
 * Note: Real pairwise voting data requires individual vote-level analysis
 * which is not available from the EP API. Cohesion is derived from group sizes.
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
  const sharedVotes = null; // Not available from EP API without vote-level analysis
  const totalVotes = null;

  return {
    groupA, groupB, cohesionScore, sharedVotes, totalVotes,
    allianceSignal: cohesionScore > minimumCohesion,
    trend: classifyCohesionTrend(cohesionScore)
  };
}

/**
 * Build group metrics from fetched MEP data.
 * Note: The EP API /meps/{id} endpoint does not provide per-MEP voting
 * statistics, so internalCohesion, defectionRate, and avgAttendance are
 * explicitly unavailable (null with dataAvailability 'UNAVAILABLE').
 * memberCount is a sample count capped at the API page limit (50); for
 * groups with more than 50 members the actual seat count will be higher.
 */
async function buildGroupMetrics(targetGroups: string[]): Promise<GroupCohesionMetrics[]> {
  const metrics: GroupCohesionMetrics[] = [];
  for (const groupId of targetGroups) {
    const mepsResult = await epClient.getMEPs({ group: groupId, limit: 50 });

    // Per-MEP voting statistics are not available from the EP API,
    // so cohesion/defection/attendance are reported as null with UNAVAILABLE marker.
    // memberCount is capped at 50 (single API page) and may undercount large groups.
    const memberCount = mepsResult.data.length;

    metrics.push({
      groupId,
      memberCount,
      internalCohesion: null,
      defectionRate: null,
      avgAttendance: null,
      stressIndicator: {
        value: null,
        availability: 'UNAVAILABLE',
        confidence: 'LOW',
        reason: 'Per-MEP voting statistics not available from EP API'
      },
      dataAvailability: 'UNAVAILABLE',
      computedAttributes: {
        disciplineScore: null,
        fragmentationRisk: null,
        unityTrend: 'UNKNOWN',
        activeParticipationRate: null
      }
    });
  }
  return metrics;
}

/**
 * Build pairwise coalition pairs using real group member counts
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
 * Classify stress severity
 */
function classifyStressSeverity(stress: number): string {
  if (stress > 0.7) return 'HIGH';
  return 'MODERATE';
}

/**
 * Compute stress indicators from group metrics
 */
function computeStressIndicators(groupMetrics: GroupCohesionMetrics[]): { indicator: string; severity: string; affectedGroups: string[] }[] {
  const results: { indicator: string; severity: string; affectedGroups: string[] }[] = [];
  for (const g of groupMetrics) {
    const stress = g.stressIndicator.value;
    if (stress !== null && stress > 0.5) {
      results.push({
        indicator: `High defection rate in ${g.groupId}`,
        severity: classifyStressSeverity(stress),
        affectedGroups: [g.groupId]
      });
    }
  }
  return results;
}

/**
 * Compute parliamentary fragmentation metrics
 */
function computeFragmentationMetrics(groupMetrics: GroupCohesionMetrics[]): {
  effectiveParties: number;
  grandCoalitionViability: number | null;
} {
  const totalMembers = groupMetrics.reduce((sum, g) => sum + g.memberCount, 0);
  const seatShares = groupMetrics.map(g => totalMembers > 0 ? g.memberCount / totalMembers : 0);
  const herfindahl = seatShares.reduce((sum, s) => sum + s * s, 0);
  const effectiveParties = herfindahl > 0 ? 1 / herfindahl : 1;

  const eppCohesion = groupMetrics.find(g => g.groupId === 'EPP')?.internalCohesion ?? null;
  const sdCohesion = groupMetrics.find(g => g.groupId === 'S&D')?.internalCohesion ?? null;
  // Return null when cohesion data is unavailable to avoid misleading computed score
  const grandCoalitionViability = (eppCohesion !== null && sdCohesion !== null)
    ? Math.round((eppCohesion + sdCohesion) / 2 * 100) / 100
    : null;

  return { effectiveParties, grandCoalitionViability };
}

/**
 * Build dominant coalition from sorted pairs
 */
function buildDominantCoalition(sortedPairs: CoalitionPairAnalysis[]): {
  groups: string[];
  combinedStrength: number | null;
  cohesion: number;
} {
  const topPair = sortedPairs[0];
  if (topPair === undefined) {
    return { groups: [], combinedStrength: null, cohesion: 0 };
  }
  return {
    groups: [topPair.groupA, topPair.groupB],
    combinedStrength: topPair.sharedVotes,
    cohesion: topPair.cohesionScore
  };
}

/**
 * Build computed attributes from fragmentation metrics
 */
function buildCoalitionComputedAttrs(
  fragMetrics: { effectiveParties: number; grandCoalitionViability: number | null },
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
 * > **Note:** Confidence level is `LOW` because per-MEP voting statistics
 * > are unavailable from the current EP API. Cohesion/defection/attendance
 * > metrics are null with `dataAvailability: 'UNAVAILABLE'` and should be
 * > supplemented with vote-result data when available.
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
        + 'each group metric has dataAvailability: UNAVAILABLE with null cohesion/defection/attendance. '
        + 'Coalition pair cohesion is currently derived from group size ratios only; '
        + 'coalitionPairs.sharedVotes and coalitionPairs.totalVotes are null (not computed from vote-level data). '
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
