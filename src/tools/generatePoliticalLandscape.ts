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
import type { ToolResult } from './shared/types.js';

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
    .describe('End date for analysis period')
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
    majorityType: string;
    politicalBalance: string;
    overallEngagement: string;
  };
  confidenceLevel: string;
  dataFreshness: string;
  sourceAttribution: string;
  methodology: string;
}

/**
 * Classify political group into bloc
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
    const existing = groupMap.get(mep.politicalGroup);
    if (existing !== undefined) {
      existing.count++;
      existing.countries.add(mep.country);
    } else {
      groupMap.set(mep.politicalGroup, {
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
  const majorityThreshold = Math.ceil(totalMEPs / 2) + 1;
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
 * Build political landscape from EP data
 */
async function buildLandscape(
  dateFrom: string,
  dateTo: string
): Promise<PoliticalLandscape> {
  const mepResult = await epClient.getMEPs({ limit: 100 });
  const meps = Array.isArray(mepResult.data) ? mepResult.data : [];

  const { groups, countriesRepresented, totalMEPs } = aggregateByGroup(
    meps as { politicalGroup: string; country: string }[]
  );

  const powerDynamics = computePowerDynamics(groups, totalMEPs);
  const largestShare = groups[0]?.seatShare ?? 0;
  const grandShare = Math.round(
    (powerDynamics.grandCoalitionSize / Math.max(1, totalMEPs)) * 10000
  ) / 100;

  // Fetch real plenary session data from EP API
  // Use data.length instead of total because total is a lower-bound estimate
  // capped by the page size at offset 0
  let recentSessionCount = 0;
  try {
    const sessions = await epClient.getPlenarySessions({
      dateFrom,
      dateTo,
      limit: 100
    });
    recentSessionCount = sessions.data.length;
  } catch (error: unknown) {
    auditLogger.logError('generate_political_landscape.fetch_sessions', { dateFrom, dateTo }, toErrorMessage(error));
    // API may not return sessions for this date range — report zero
  }

  return {
    period: { from: dateFrom, to: dateTo },
    parliament: {
      totalMEPs,
      politicalGroups: groups.length,
      countriesRepresented
    },
    groups,
    powerDynamics,
    // Activity metrics from real EP API data
    activityMetrics: {
      averageAttendance: 0, // EP API does not provide attendance data
      recentSessionCount
    },
    computedAttributes: {
      fragmentationIndex: computeFragmentation(groups.length),
      majorityType: computeMajorityType(largestShare, grandShare),
      politicalBalance: computePoliticalBalance(
        powerDynamics.progressiveBloc,
        powerDynamics.conservativeBloc
      ),
      overallEngagement: computeEngagement(0)
    },
    confidenceLevel: totalMEPs > 50 ? 'MEDIUM' : 'LOW',
    dataFreshness: 'Real-time EP API data — MEP records and plenary sessions from EP Open Data',
    sourceAttribution: 'European Parliament Open Data Portal - data.europarl.europa.eu',
    methodology: 'Political landscape analysis using real EP Open Data: MEP records, '
      + 'group composition mapping, bloc classification, coalition threshold calculation, '
      + 'fragmentation indexing, and plenary session counts (fetched page count, lower bound). '
      + 'Attendance data is not available from the EP API and is reported as zero. '
      + 'Data source: European Parliament Open Data Portal.'
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

  const landscape = await buildLandscape(dateFrom, dateTo);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(landscape, null, 2)
      }
    ]
  };
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
      }
    },
    required: []
  }
};
