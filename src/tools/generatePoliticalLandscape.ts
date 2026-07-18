/**
 * MCP Tool: generate_political_landscape
 *
 * Generate a comprehensive political landscape overview of the
 * European Parliament — group sizes, power dynamics, coalition
 * patterns, and activity metrics in a single intelligence product.
 *
 * **Intelligence Perspective:** The political landscape tool provides a
 * strategic-level overview combining group composition, voting cohesion,
 * coalition patterns, and activity intensity—the go-to tool for
 * situational awareness across the entire Parliament.
 *
 * **Business Perspective:** Single-call comprehensive overview enables
 * quick onboarding for policy teams and provides context for all
 * subsequent analysis queries.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { z } from 'zod';
import { epClient } from '../clients/europeanParliamentClient.js';
import { auditLogger, toErrorMessage } from '../utils/auditLogger.js';
import { fetchAllCurrentMEPs } from '../utils/mepFetcher.js';
import { normalizePoliticalGroup } from '../utils/politicalGroupNormalization.js';
import { deriveCurrentPoliticalComposition } from '../utils/politicalComposition.js';
import { loadWeeklyMEPCache } from '../utils/weeklyDataCache.js';
import type { ToolResult } from './shared/types.js';
import { withTimeout, TimeoutError } from '../utils/timeout.js';
import { buildTimeoutResponse } from './shared/errorHandler.js';

/**
 * Maximum wall-clock time (ms) allowed for the full landscape generation.
 * Chosen to be comfortably below the integration-test timeout of 120 000 ms
 * so the tool can return a graceful `timedOut: true` response instead of
 * being killed by the test runner.
 */
const OPERATION_TIMEOUT_MS = 100_000;

/**
 * Schema for generate_political_landscape tool input
 */
export const GeneratePoliticalLandscapeSchema = z.object({
  dateFrom: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .describe('Start date for analysis period'),
  dateTo: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .describe('End date for analysis period'),
  live: z.boolean()
    .optional()
    .default(false)
    .describe('When true, bypasses the bundled cache and fetches current MEPs from EP API v2'),
});

/**
 * Political group summary
 */
interface GroupSummary {
  name: string;
  memberCount: number;
  seatShare: number;
  countries: number;
}

/**
 * Political landscape overview
 */
interface PoliticalLandscape {
  period: { from: string; to: string };
  parliament: {
    totalMEPs: number;
    politicalGroups: number;
    countriesRepresented: number;
  };
  groups: GroupSummary[];
  powerDynamics: {
    largestGroup: string;
    majorityThreshold: number;
    grandCoalitionSize: number;
    progressiveBloc: number;
    conservativeBloc: number;
  };
  activityMetrics: {
    averageAttendance: number;
    recentSessionCount: number;
  };
  computedAttributes: {
    fragmentationIndex: string;
    effectiveNumberOfParties: number;
    majorityType: string;
    politicalBalance: string;
    overallEngagement: string;
  };
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  dataFreshness: string;
  sourceAttribution: string;
  methodology: string;
  dataQualityWarnings: string[];
}

/**
 * Classify political group into bloc.
 * Based on European Parliament's traditional left-right spectrum:
 * - Progressive: Greens/EFA, GUE/NGL (The Left), S&D — left-of-centre families
 * - Conservative: ECR, ID/PfE — right-of-centre and eurosceptic families
 * - Centre: EPP, Renew, and others — centrist or cross-spectrum
 * - NI (Non-Inscrits) default to 'center' as they have no formal bloc alignment
 */
function classifyBloc(group: string): 'progressive' | 'conservative' | 'center' {
  const normalised = group.toUpperCase();
  if (normalised.includes('GREEN') || normalised.includes('LEFT') || normalised.includes('S&D')) {
    return 'progressive';
  }
  if (normalised.includes('ECR') || normalised.includes('ID') || normalised.includes('PFE')) {
    return 'conservative';
  }
  return 'center';
}

/**
 * Compute fragmentation index label
 */
function computeFragmentation(groupCount: number): string {
  if (groupCount >= 8) return 'HIGH';
  if (groupCount >= 5) return 'MODERATE';
  return 'LOW';
}

function computeEffectiveNumberOfParties(groups: readonly GroupSummary[]): number {
  const sumSquares = groups.reduce((sum, group) => sum + (group.seatShare / 100) ** 2, 0);
  return sumSquares === 0 ? 0 : Math.round((1 / sumSquares) * 100) / 100;
}

/**
 * Compute majority type
 */
function computeMajorityType(largestShare: number, grandShare: number): string {
  if (largestShare > 50) return 'SINGLE_GROUP_MAJORITY';
  if (grandShare > 60) return 'GRAND_COALITION_DOMINANT';
  return 'MULTI_COALITION_REQUIRED';
}

/**
 * Compute political balance label
 */
function computePoliticalBalance(
  progressive: number,
  conservative: number
): string {
  const ratio = progressive / Math.max(1, conservative);
  if (ratio > 1.3) return 'PROGRESSIVE_LEANING';
  if (ratio < 0.77) return 'CONSERVATIVE_LEANING';
  return 'BALANCED';
}

/**
 * Compute engagement label
 */
function computeEngagement(avgAttendance: number): string {
  if (avgAttendance >= 80) return 'HIGH';
  if (avgAttendance >= 65) return 'MODERATE';
  return 'LOW';
}

/**
 * Aggregate MEPs by political group
 */
function aggregateByGroup(
  meps: { politicalGroup: string; country: string }[]
): { groups: GroupSummary[]; countriesRepresented: number; totalMEPs: number } {
  const groupMap = new Map<string, { count: number; countries: Set<string> }>();
  const allCountries = new Set<string>();
  const totalMEPs = meps.length;

  for (const mep of meps) {
    allCountries.add(mep.country);
    const groupKey = normalizePoliticalGroup(mep.politicalGroup);
    const existing = groupMap.get(groupKey);
    if (existing !== undefined) {
      existing.count++;
      existing.countries.add(mep.country);
    } else {
      groupMap.set(groupKey, {
        count: 1,
        countries: new Set([mep.country])
      });
    }
  }

  const groups: GroupSummary[] = Array.from(groupMap.entries())
    .map(([name, data]) => ({
      name,
      memberCount: data.count,
      seatShare: Math.round((data.count / Math.max(1, totalMEPs)) * 10000) / 100,
      countries: data.countries.size
    }))
    .sort((a, b) => b.memberCount - a.memberCount);

  return { groups, countriesRepresented: allCountries.size, totalMEPs };
}

/**
 * Compute power dynamics from group summaries
 */
function computePowerDynamics(
  groups: GroupSummary[],
  totalMEPs: number
): PoliticalLandscape['powerDynamics'] {
  const largestGroup = groups[0]?.name ?? 'Unknown';
  const majorityThreshold = Math.floor(totalMEPs / 2) + 1;
  const grandSize = (groups[0]?.memberCount ?? 0) + (groups[1]?.memberCount ?? 0);

  let progressive = 0;
  let conservative = 0;
  for (const g of groups) {
    const bloc = classifyBloc(g.name);
    if (bloc === 'progressive') progressive += g.memberCount;
    if (bloc === 'conservative') conservative += g.memberCount;
  }

  return {
    largestGroup,
    majorityThreshold,
    grandCoalitionSize: grandSize,
    progressiveBloc: progressive,
    conservativeBloc: conservative
  };
}

/**
 * Composition source resolved for a landscape build — either derived from
 * the bundled cache (default) or fetched live from the EP API.
 */
interface ResolvedComposition {
  groups: GroupSummary[];
  countriesRepresented: number;
  totalMEPs: number;
  cachedGeneratedAt: string | null;
  cachedWarnings: string[];
  mepComplete: boolean | null;
  mepFailureOffset: number | undefined;
}

/**
 * Resolve group composition either from the bundled cache (default) or via
 * a live EP API fetch (when `live` is true or no cache is available).
 */
async function resolveComposition(live: boolean): Promise<ResolvedComposition> {
  const cached = live ? null : await loadWeeklyMEPCache();
  if (cached !== null) {
    const composition = deriveCurrentPoliticalComposition(cached);
    return {
      groups: composition.groups,
      countriesRepresented: composition.countriesRepresented,
      totalMEPs: composition.totalMEPs,
      cachedGeneratedAt: cached.metadata.generatedAt,
      cachedWarnings: composition.dataQualityWarnings,
      mepComplete: null,
      mepFailureOffset: undefined,
    };
  }

  const mepResult = await fetchAllCurrentMEPs();
  const liveComposition = aggregateByGroup(mepResult.meps);
  return {
    groups: liveComposition.groups,
    countriesRepresented: liveComposition.countriesRepresented,
    totalMEPs: liveComposition.totalMEPs,
    cachedGeneratedAt: null,
    cachedWarnings: [],
    mepComplete: mepResult.complete,
    mepFailureOffset: mepResult.failureOffset,
  };
}

/** Fetch the recent plenary session count for the given date range, tolerating failures. */
async function fetchRecentSessionCount(dateFrom: string, dateTo: string): Promise<number> {
  try {
    const year = parseInt(dateFrom.substring(0, 4), 10);
    const sessions = await epClient.getPlenarySessions({ year, limit: 100 });
    return sessions.data.length;
  } catch (error: unknown) {
    auditLogger.logError('generate_political_landscape.fetch_sessions', { dateFrom, dateTo }, toErrorMessage(error));
    return 0;
  }
}

/** Classify overall confidence in the collected composition. */
function computeConfidenceLevel(mepComplete: boolean | null, totalMEPs: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (mepComplete === false) return 'LOW';
  if (totalMEPs >= 600) return 'HIGH';
  if (totalMEPs >= 200) return 'MEDIUM';
  return 'LOW';
}

/** Build the list of data-quality warnings for the resolved composition. */
function buildDataQualityWarnings(resolved: ResolvedComposition): string[] {
  const warnings: string[] = [
    ...resolved.cachedWarnings,
    'Bloc classification (progressive/conservative/centre) uses hardcoded group mapping — NI members classified as centre by default',
    'Attendance data unavailable from EP API — average attendance reported as zero',
  ];
  if (resolved.mepComplete === false) {
    const offsetLabel = resolved.mepFailureOffset !== undefined
      ? `offset ${String(resolved.mepFailureOffset)}`
      : 'an unknown offset';
    warnings.push(
      `MEP pagination failed at ${offsetLabel}; seat shares are computed from the partial roster collected before the failure.`
    );
  }
  return warnings;
}

/**
 * Build political landscape from EP data
 */
async function buildLandscape(
  dateFrom: string,
  dateTo: string,
  live: boolean,
): Promise<PoliticalLandscape> {
  const resolved = await resolveComposition(live);
  const { groups, countriesRepresented, totalMEPs } = resolved;

  const powerDynamics = computePowerDynamics(groups, totalMEPs);
  const largestShare = groups[0]?.seatShare ?? 0;
  const grandShare = Math.round(
    (powerDynamics.grandCoalitionSize / Math.max(1, totalMEPs)) * 10000
  ) / 100;

  const recentSessionCount = await fetchRecentSessionCount(dateFrom, dateTo);
  const confidenceLevel = computeConfidenceLevel(resolved.mepComplete, totalMEPs);
  const dataQualityWarnings = buildDataQualityWarnings(resolved);

  return {
    period: { from: dateFrom, to: dateTo },
    parliament: {
      totalMEPs,
      politicalGroups: groups.length,
      countriesRepresented
    },
    groups,
    powerDynamics,
    activityMetrics: {
      averageAttendance: 0,
      recentSessionCount
    },
    computedAttributes: {
      fragmentationIndex: computeFragmentation(groups.length),
      effectiveNumberOfParties: computeEffectiveNumberOfParties(groups),
      majorityType: computeMajorityType(largestShare, grandShare),
      politicalBalance: computePoliticalBalance(
        powerDynamics.progressiveBloc,
        powerDynamics.conservativeBloc
      ),
      overallEngagement: computeEngagement(0)
    },
    confidenceLevel,
    dataFreshness: resolved.cachedGeneratedAt === null
      ? 'Live EP API v2 current-MEP data'
      : `Bundled EP API v2 cache generated ${resolved.cachedGeneratedAt}`,
    sourceAttribution: 'European Parliament Open Data Portal - data.europarl.europa.eu',
    methodology: 'Political landscape analysis using European Parliament Open Data. Cached mode '
      + 'assigns every current MEP from dated hasMembership records classified EU_POLITICAL_GROUP, '
      + 'with normalized list data used only as a completeness fallback. Live mode uses the full '
      + 'paginated current-MEP roster. Group labels use native-language acronym normalisation, bloc '
      + 'classification, coalition threshold calculation, fragmentation indexing, and plenary '
      + 'session counts (fetched page count, lower bound). Attendance data is not available '
      + 'from the EP API and is reported as zero. Data source: European Parliament Open Data Portal.',
    dataQualityWarnings,
  };
}

/**
 * Handles the generate_political_landscape MCP tool request.
 *
 * Generates a comprehensive snapshot of the current European Parliament political
 * landscape including group seat shares, bloc analysis (progressive vs. conservative),
 * coalition viability, and power-balance metrics. Provides single-call situational
 * awareness for strategic intelligence briefings.
 *
 * @param args - Raw tool arguments, validated against {@link GeneratePoliticalLandscapeSchema}
 * @returns MCP tool result containing group seat distributions, power dynamics,
 *   activity metrics, fragmentation index, majority type, and political balance score
 * @throws - If `args` fails schema validation (e.g., missing required fields or invalid format)
 * - If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * const result = await handleGeneratePoliticalLandscape({
 *   dateFrom: '2024-01-01',
 *   dateTo: '2024-12-31'
 * });
 * // Returns full landscape with group sizes, bloc analysis,
 * // fragmentation index, and majority-type classification
 * ```
 *
 * @security - Input is validated with Zod before any API call.
 * - Personal data in responses is minimised per GDPR Article 5(1)(c).
 * - All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link generatePoliticalLandscapeToolMetadata} for MCP schema registration
 * @see {@link handleComparePoliticalGroups} for detailed per-group dimension comparison
 */
export async function handleGeneratePoliticalLandscape(
  args: unknown
): Promise<ToolResult> {
  const params = GeneratePoliticalLandscapeSchema.parse(args);

  const now = new Date();
  const dateFrom = params.dateFrom ?? new Date(
    now.getFullYear() - 1,
    now.getMonth(),
    now.getDate()
  ).toISOString().split('T')[0] ?? '';
  const dateTo = params.dateTo ?? now.toISOString().split('T')[0] ?? '';

  try {
    const landscape = await withTimeout(
      buildLandscape(dateFrom, dateTo, params.live),
      OPERATION_TIMEOUT_MS,
      'generate_political_landscape operation timed out'
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(landscape, null, 2)
        }
      ]
    };
  } catch (error: unknown) {
    if (error instanceof TimeoutError) {
      return buildTimeoutResponse('generate_political_landscape', OPERATION_TIMEOUT_MS);
    }
    throw error;
  }
}

/**
 * Tool metadata for MCP listing
 */
export const generatePoliticalLandscapeToolMetadata = {
  name: 'generate_political_landscape',
  description: 'Generate a comprehensive political landscape overview of the European Parliament — group sizes, seat shares, coalition dynamics, bloc analysis, and power balance. Single-call situational awareness for strategic intelligence.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      dateFrom: {
        type: 'string',
        description: 'Start date (YYYY-MM-DD)'
      },
      dateTo: {
        type: 'string',
        description: 'End date (YYYY-MM-DD)'
      },
      live: {
        type: 'boolean',
        description: 'Bypass bundled current-MEP cache and fetch live EP API v2 data',
        default: false,
      }
    },
    required: []
  }
};
