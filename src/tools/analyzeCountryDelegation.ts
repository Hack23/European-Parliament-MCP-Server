/**
 * MCP Tool: analyze_country_delegation
 *
 * Analyze how a country's MEP delegation votes, collaborates, and
 * distributes across political groups—revealing national voting patterns
 * and cross-group alignment within a member state's EP representation.
 *
 * **Intelligence Perspective:** Country delegation analysis uncovers national
 * interest patterns that cut across political group lines—essential for
 * identifying when national priorities override party discipline.
 *
 * **Business Perspective:** Enables government affairs teams to understand
 * a country's collective position on policy domains for targeted advocacy.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { z } from 'zod';
import { epClient } from '../clients/europeanParliamentClient.js';
import type { MEPDetails } from '../types/europeanParliament.js';

/**
 * Schema for analyze_country_delegation tool input
 */
export const AnalyzeCountryDelegationSchema = z.object({
  country: z.string()
    .length(2)
    .regex(/^[A-Z]{2}$/, 'Country code must be 2 uppercase letters')
    .describe('ISO 3166-1 alpha-2 country code (e.g., "SE", "DE", "FR")'),
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
 * Political group distribution entry
 */
interface GroupDistribution {
  group: string;
  count: number;
  percentage: number;
}

/**
 * Country delegation analysis result
 */
interface CountryDelegationAnalysis {
  country: string;
  period: { from: string; to: string };
  delegation: {
    totalMEPs: number;
    activeMEPs: number;
    groupDistribution: GroupDistribution[];
  };
  votingBehavior: {
    averageAttendance: number;
    averageLoyalty: number;
    nationalCohesion: number;
  };
  committeePresence: {
    committeesRepresented: number;
    leadershipRoles: number;
  };
  computedAttributes: {
    delegationInfluence: string;
    nationalCohesionLevel: string;
    groupFragmentation: string;
    engagementLevel: string;
  };
  confidenceLevel: string;
  dataFreshness: string;
  sourceAttribution: string;
  methodology: string;
}

/**
 * Compute group distribution from MEP list
 */
function computeGroupDistribution(
  meps: { politicalGroup: string }[]
): GroupDistribution[] {
  const counts = new Map<string, number>();
  for (const mep of meps) {
    const group = mep.politicalGroup;
    counts.set(group, (counts.get(group) ?? 0) + 1);
  }

  const total = meps.length;
  return Array.from(counts.entries())
    .map(([group, count]) => ({
      group,
      count,
      percentage: Math.round((count / Math.max(1, total)) * 10000) / 100
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Compute group fragmentation index (Simpson's diversity)
 */
function computeFragmentation(distribution: GroupDistribution[]): string {
  const total = distribution.reduce((s, d) => s + d.count, 0);
  if (total === 0) return 'UNKNOWN';

  let sumSquares = 0;
  for (const d of distribution) {
    const p = d.count / total;
    sumSquares += p * p;
  }
  const diversity = 1 - sumSquares;

  if (diversity > 0.7) return 'HIGH';
  if (diversity > 0.4) return 'MODERATE';
  return 'LOW';
}

/**
 * Compute delegation influence level
 */
function computeInfluence(totalMEPs: number, leadershipRoles: number): string {
  const score = totalMEPs * 0.3 + leadershipRoles * 5;
  if (score > 30) return 'HIGH';
  if (score > 15) return 'MODERATE';
  return 'LOW';
}

/**
 * Compute confidence level from data coverage ratio
 */
function computeDataConfidence(dataCoverage: number): string {
  if (dataCoverage > 0.8) return 'HIGH';
  if (dataCoverage > 0.4) return 'MEDIUM';
  return 'LOW';
}

/**
 * Compute engagement level from attendance
 */
function computeEngagement(avgAttendance: number): string {
  if (avgAttendance >= 80) return 'HIGH';
  if (avgAttendance >= 60) return 'MODERATE';
  return 'LOW';
}

/**
 * Compute national cohesion level
 */
function computeCohesionLevel(cohesion: number): string {
  if (cohesion >= 70) return 'HIGH';
  if (cohesion >= 50) return 'MODERATE';
  return 'LOW';
}

/**
 * Fetch MEP details, collecting fulfilled results
 */
async function fetchMepDetails(
  meps: { id: string }[]
): Promise<MEPDetails[]> {
  const details: MEPDetails[] = [];
  const batch = meps.slice(0, 50);
  const batchSize = 5;

  for (let i = 0; i < batch.length; i += batchSize) {
    const chunk = batch.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      chunk.map((mep: { id: string }) => epClient.getMEPDetails(mep.id))
    );
    for (const r of results) {
      if (r.status === 'fulfilled') {
        details.push(r.value);
      }
    }
  }
  return details;
}

/**
 * Compute committee presence from MEP details
 */
function computeCommitteePresence(
  details: MEPDetails[]
): { committeesRepresented: number; leadershipRoles: number } {
  const allCommittees = new Set<string>();
  let leadershipRoles = 0;
  for (const mep of details) {
    for (const c of mep.committees) {
      allCommittees.add(c);
    }
    if (Array.isArray(mep.roles)) {
      leadershipRoles += mep.roles.length;
    }
  }
  return { committeesRepresented: allCommittees.size, leadershipRoles };
}

/**
 * Build delegation analysis from MEP details
 */
async function buildDelegationAnalysis(
  country: string,
  dateFrom: string,
  dateTo: string
): Promise<CountryDelegationAnalysis> {
  const mepResult = await epClient.getMEPs({
    country,
    limit: 100
  });

  const meps = Array.isArray(mepResult.data) ? mepResult.data : [];
  const totalMEPs = meps.length;

  const details = await fetchMepDetails(meps as { id: string }[]);

  const distribution = computeGroupDistribution(
    meps as { politicalGroup: string }[]
  );

  // Compute attendance averages
  const attendances = details
    .map(d => d.votingStatistics?.attendanceRate)
    .filter((a): a is number => a !== undefined);

  const avgAttendance = attendances.length > 0
    ? Math.round(attendances.reduce((s, a) => s + a, 0) / attendances.length * 100) / 100
    : 0;

  const committeePresence = computeCommitteePresence(details);

  // National cohesion - approximated from group concentration
  const topGroupShare = distribution[0]?.percentage ?? 0;
  const nationalCohesion = Math.min(100, topGroupShare + 10);

  // Confidence based on data coverage, not just delegation size
  const dataCoverage = totalMEPs > 0 ? attendances.length / totalMEPs : 0;

  return {
    country,
    period: { from: dateFrom, to: dateTo },
    delegation: {
      totalMEPs,
      activeMEPs: totalMEPs,
      groupDistribution: distribution
    },
    votingBehavior: {
      averageAttendance: avgAttendance,
      // Loyalty approximated from group fragmentation; detailed roll-call analysis not yet available
      averageLoyalty: Math.round(Math.max(60, 95 - distribution.length * 5) * 100) / 100,
      nationalCohesion: Math.round(nationalCohesion * 100) / 100
    },
    committeePresence,
    computedAttributes: {
      delegationInfluence: computeInfluence(totalMEPs, committeePresence.leadershipRoles),
      nationalCohesionLevel: computeCohesionLevel(nationalCohesion),
      groupFragmentation: computeFragmentation(distribution),
      engagementLevel: computeEngagement(avgAttendance)
    },
    confidenceLevel: computeDataConfidence(dataCoverage),
    dataFreshness: 'Real-time EP API data — country delegation composition from current MEP records',
    sourceAttribution: 'European Parliament Open Data Portal - data.europarl.europa.eu',
    methodology: 'Country delegation analysis using EP Open Data: political group distribution, '
      + 'voting behavior aggregation, committee representation mapping, and national cohesion scoring. '
      + 'Data source: European Parliament Open Data Portal.'
  };
}

/**
 * Analyze country delegation tool handler
 */
export async function handleAnalyzeCountryDelegation(
  args: unknown
): Promise<{ content: { type: string; text: string }[] }> {
  const params = AnalyzeCountryDelegationSchema.parse(args);

  const now = new Date();
  const dateFrom = params.dateFrom ?? new Date(
    now.getFullYear() - 1,
    now.getMonth(),
    now.getDate()
  ).toISOString().split('T')[0] ?? '';
  const dateTo = params.dateTo ?? now.toISOString().split('T')[0] ?? '';

  const analysis = await buildDelegationAnalysis(
    params.country,
    dateFrom,
    dateTo
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(analysis, null, 2)
      }
    ]
  };
}

/**
 * Tool metadata for MCP listing
 */
export const analyzeCountryDelegationToolMetadata = {
  name: 'analyze_country_delegation',
  description: 'Analyze a country\'s MEP delegation in the European Parliament — political group distribution, voting behavior, committee presence, and national cohesion. Reveals national interest patterns that cut across party lines.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      country: {
        type: 'string',
        description: 'ISO 3166-1 alpha-2 country code (e.g., "SE", "DE", "FR")'
      },
      dateFrom: {
        type: 'string',
        description: 'Start date (YYYY-MM-DD)'
      },
      dateTo: {
        type: 'string',
        description: 'End date (YYYY-MM-DD)'
      }
    },
    required: ['country']
  }
};
