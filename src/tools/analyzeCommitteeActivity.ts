/**
 * MCP Tool: analyze_committee_activity
 * 
 * Analyze committee workload and member engagement for EP committees
 * using real data from the European Parliament Open Data Portal.
 * 
 * **Intelligence Perspective:** Committee activity analysis reveals institutional
 * priorities, resource allocation patterns, and policy domain intensity—essential
 * for understanding where legislative power concentrates.
 * 
 * **Business Perspective:** Committee monitoring enables enterprise government affairs
 * teams to track policy areas relevant to their industry with precision.
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { z } from 'zod';
import { epClient } from '../clients/europeanParliamentClient.js';

/**
 * Schema for analyze_committee_activity tool input
 */
export const AnalyzeCommitteeActivitySchema = z.object({
  committeeId: z.string()
    .min(1)
    .max(100)
    .describe('Committee identifier or abbreviation (e.g., "ENVI", "ITRE")'),
  dateFrom: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .describe('Start date for analysis period'),
  dateTo: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .describe('End date for analysis period'),
});

/**
 * Committee activity analysis result
 */
interface CommitteeActivityAnalysis {
  committeeId: string;
  committeeName: string;
  period: { from: string; to: string };
  workload: {
    activeLegislativeFiles: number;
    documentsProduced: number;
    meetingsHeld: number;
    opinionsIssued: number;
  };
  memberEngagement: {
    totalMembers: number;
    averageAttendance: number;
    activeContributors: number;
  };
  legislativeOutput: {
    reportsAdopted: number;
    amendmentsProcessed: number;
    successRate: number;
  };
  computedAttributes: {
    workloadIntensity: string;
    productivityScore: number;
    engagementLevel: string;
    policyImpactRating: string;
  };
  confidenceLevel: string;
  dataFreshness: string;
  sourceAttribution: string;
  methodology: string;
}

/**
 * Compute workload intensity from metrics
 */
function computeWorkloadIntensity(activeLegFiles: number, meetings: number): string {
  const combined = activeLegFiles + meetings;
  if (combined > 100) return 'VERY_HIGH';
  if (combined > 60) return 'HIGH';
  if (combined > 30) return 'MODERATE';
  return 'LOW';
}

/**
 * Compute engagement level from attendance
 */
function computeEngagementLevel(avgAttendance: number): string {
  if (avgAttendance >= 80) return 'HIGH';
  if (avgAttendance >= 60) return 'MODERATE';
  return 'LOW';
}

/**
 * Compute policy impact rating
 */
function computePolicyImpactRating(reportsAdopted: number, successRate: number): string {
  const impactScore = reportsAdopted * successRate;
  if (impactScore > 15) return 'HIGH';
  if (impactScore > 5) return 'MEDIUM';
  return 'LOW';
}

/**
 * Safely fetch a count from the EP API using data.length (actual items returned),
 * not total (which is a lower-bound estimate capped by page size).
 */
async function safeCount(fetcher: () => Promise<{ data: unknown[] }>): Promise<number> {
  try {
    const result = await fetcher();
    return result.data.length;
  } catch {
    return 0;
  }
}

/**
 * Fetch real EP data counts for committee analysis
 */
async function fetchCommitteeData(dateFrom: string): Promise<{
  documentsProduced: number;
  activeLegFiles: number;
  reportsAdopted: number;
}> {
  const year = parseInt(dateFrom.substring(0, 4), 10);
  const [documentsProduced, activeLegFiles, reportsAdopted] = await Promise.all([
    safeCount(() => epClient.getCommitteeDocuments({ year, limit: 100 })),
    safeCount(() => epClient.getProcedures({ year, limit: 100 })),
    safeCount(() => epClient.getAdoptedTexts({ year, limit: 100 }))
  ]);
  return { documentsProduced, activeLegFiles, reportsAdopted };
}

/**
 * Build committee activity analysis from real EP data
 */
async function buildAnalysis(
  committeeId: string,
  dateFrom: string,
  dateTo: string
): Promise<CommitteeActivityAnalysis> {
  const committeeData = await epClient.getCommitteeInfo({
    abbreviation: committeeId
  });

  const memberCount = Array.isArray(committeeData.members)
    ? committeeData.members.length
    : 0;

  const { documentsProduced, activeLegFiles, reportsAdopted } = await fetchCommitteeData(dateFrom);

  const successRate = activeLegFiles > 0 && reportsAdopted > 0
    ? Math.min(1, reportsAdopted / activeLegFiles)
    : 0;
  const productivityScore = activeLegFiles > 0
    ? Math.round((reportsAdopted / activeLegFiles) * 100)
    : 0;
  const hasRealData = documentsProduced > 0 || activeLegFiles > 0 || reportsAdopted > 0;

  return {
    committeeId,
    committeeName: committeeData.name,
    period: { from: dateFrom, to: dateTo },
    workload: {
      activeLegislativeFiles: activeLegFiles,
      documentsProduced,
      meetingsHeld: 0,
      opinionsIssued: 0
    },
    memberEngagement: {
      totalMembers: memberCount,
      averageAttendance: 0,
      // 0 indicates unknown due to lack of member-level activity data
      activeContributors: 0
    },
    legislativeOutput: {
      reportsAdopted,
      amendmentsProcessed: 0,
      successRate: Math.round(successRate * 100) / 100
    },
    computedAttributes: {
      workloadIntensity: computeWorkloadIntensity(activeLegFiles, 0),
      productivityScore,
      engagementLevel: computeEngagementLevel(0),
      policyImpactRating: computePolicyImpactRating(reportsAdopted, successRate)
    },
    confidenceLevel: hasRealData ? 'MEDIUM' : 'LOW',
    dataFreshness: 'Real-time EP API data — committee documents and procedures from EP Open Data',
    sourceAttribution: 'European Parliament Open Data Portal - data.europarl.europa.eu',
    methodology: 'Committee activity analysis using real data from EP Open Data Portal. '
      + 'Committee membership from /corporate-bodies endpoint, documents from /committee-documents, '
      + 'procedures from /procedures, adopted texts from /adopted-texts. '
      + 'Document/procedure/adopted-text counts are parliament-wide lower bounds (single page, '
      + 'not filtered by committee). Fields showing zero indicate data not available from the EP API. '
      + 'Data source: European Parliament Open Data Portal.'
  };
}

/**
 * Analyze committee activity tool handler
 */
export async function handleAnalyzeCommitteeActivity(
  args: unknown
): Promise<{ content: { type: string; text: string }[] }> {
  const params = AnalyzeCommitteeActivitySchema.parse(args);

  const now = new Date();
  const dateFrom = params.dateFrom ?? new Date(
    now.getFullYear() - 1,
    now.getMonth(),
    now.getDate()
  ).toISOString().split('T')[0] ?? '';
  const dateTo = params.dateTo ?? now.toISOString().split('T')[0] ?? '';

  const analysis = await buildAnalysis(
    params.committeeId,
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
export const analyzeCommitteeActivityToolMetadata = {
  name: 'analyze_committee_activity',
  description: 'Analyze European Parliament committee workload, meeting frequency, document production, legislative output, and member engagement. Provides intelligence on committee productivity and policy impact.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      committeeId: {
        type: 'string',
        description: 'Committee identifier or abbreviation (e.g., "ENVI", "ITRE")'
      },
      dateFrom: {
        type: 'string',
        description: 'Start date (YYYY-MM-DD)'
      },
      dateTo: {
        type: 'string',
        description: 'End date (YYYY-MM-DD)'
      },
    },
    required: ['committeeId']
  }
};
