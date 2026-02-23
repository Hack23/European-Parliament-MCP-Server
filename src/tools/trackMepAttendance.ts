/**
 * MCP Tool: track_mep_attendance
 * 
 * Track and analyze MEP attendance patterns across plenary sessions
 * with trend detection. Attendance is derived from votingStatistics
 * (plenary vote participation); committee meeting attendance is not
 * currently tracked.
 * 
 * **Intelligence Perspective:** Attendance analysis reveals MEP engagement levels,
 * potential disengagement signals, and participation patterns that correlate with
 * political influence and legislative effectiveness.
 * 
 * **Business Perspective:** Attendance tracking enables stakeholders to identify
 * the most engaged and accessible MEPs for advocacy and outreach.
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { z } from 'zod';
import { epClient } from '../clients/europeanParliamentClient.js';

/**
 * Schema for track_mep_attendance tool input
 */
export const TrackMepAttendanceSchema = z.object({
  mepId: z.string()
    .min(1)
    .max(100)
    .optional()
    .describe('MEP identifier (omit for group/country overview)'),
  country: z.string()
    .length(2)
    .regex(/^[A-Z]{2}$/)
    .optional()
    .describe('Filter by country (ISO 3166-1 alpha-2)'),
  groupId: z.string()
    .min(1)
    .max(50)
    .optional()
    .describe('Filter by political group'),
  dateFrom: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  dateTo: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe('Maximum number of MEPs to return')
});

/**
 * MEP attendance record
 */
interface MepAttendanceRecord {
  mepId: string;
  mepName: string;
  country: string;
  politicalGroup: string;
  attendanceRate: number;
  totalSessions: number;
  sessionsAttended: number;
  trend: string;
  category: string;
}

/**
 * Attendance analysis result
 */
interface AttendanceAnalysis {
  period: { from: string; to: string };
  scope: string;
  records: MepAttendanceRecord[];
  summary: {
    totalMEPs: number;
    averageAttendance: number;
    highAttendance: number;
    mediumAttendance: number;
    lowAttendance: number;
  };
  computedAttributes: {
    overallEngagement: string;
    attendanceTrend: string;
    absenteeismRisk: string;
  };
  confidenceLevel: string;
  methodology: string;
}

/**
 * Classify attendance category
 */
function classifyAttendance(rate: number): string {
  if (rate >= 80) return 'HIGH';
  if (rate >= 60) return 'MODERATE';
  return 'LOW';
}

/**
 * Determine attendance trend from rate
 */
function determineTrend(rate: number): string {
  if (rate >= 85) return 'STABLE_HIGH';
  if (rate >= 70) return 'STABLE';
  if (rate >= 50) return 'DECLINING';
  return 'CONCERNING';
}

/**
 * Compute engagement level from average attendance
 */
function computeEngagement(avgRate: number): string {
  if (avgRate >= 80) return 'HIGH';
  if (avgRate >= 65) return 'MODERATE';
  return 'LOW';
}

/**
 * Compute absenteeism risk level
 */
function computeAbsenteeismRisk(lowCount: number, total: number): string {
  if (total === 0) return 'UNKNOWN';
  const ratio = lowCount / total;
  if (ratio > 0.3) return 'HIGH';
  if (ratio > 0.15) return 'MODERATE';
  return 'LOW';
}

/**
 * Build attendance record from MEP data
 */
function buildAttendanceRecord(
  mep: {
    id: string;
    name: string;
    country: string;
    politicalGroup: string;
    votingStatistics?: {
      totalVotes: number;
      attendanceRate: number;
    };
  }
): MepAttendanceRecord {
  const hasStats = mep.votingStatistics !== undefined;
  const rate = mep.votingStatistics?.attendanceRate ?? 0;
  const total = mep.votingStatistics?.totalVotes ?? 0;
  const attended = Math.round(total * (rate / 100));

  return {
    mepId: mep.id,
    mepName: mep.name,
    country: mep.country,
    politicalGroup: mep.politicalGroup,
    attendanceRate: rate,
    totalSessions: total,
    sessionsAttended: attended,
    trend: hasStats ? determineTrend(rate) : 'UNKNOWN',
    category: hasStats ? classifyAttendance(rate) : 'UNKNOWN'
  };
}

/**
 * Build attendance analysis for a single MEP
 */
async function buildSingleMepAnalysis(
  mepId: string,
  dateFrom: string,
  dateTo: string
): Promise<AttendanceAnalysis> {
  const mepData = await epClient.getMEPDetails(mepId);
  const record = buildAttendanceRecord(mepData);

  return {
    period: { from: dateFrom, to: dateTo },
    scope: `MEP ${mepData.name} (${mepData.id})`,
    records: [record],
    summary: {
      totalMEPs: 1,
      averageAttendance: record.attendanceRate,
      highAttendance: record.category === 'HIGH' ? 1 : 0,
      mediumAttendance: record.category === 'MODERATE' ? 1 : 0,
      lowAttendance: record.category === 'LOW' ? 1 : 0
    },
    computedAttributes: {
      overallEngagement: computeEngagement(record.attendanceRate),
      attendanceTrend: record.trend,
      absenteeismRisk: record.category === 'LOW' ? 'HIGH' : 'LOW'
    },
    confidenceLevel: 'HIGH',
    methodology: 'MEP attendance analysis using EP Open Data voting statistics. '
      + 'Data source: European Parliament Open Data Portal.'
  };
}

/**
 * Compute confidence level from data coverage ratio
 */
function computeConfidence(dataCoverage: number): string {
  if (dataCoverage > 0.8) return 'HIGH';
  if (dataCoverage > 0.4) return 'MEDIUM';
  return 'LOW';
}

/**
 * Fetch MEP details in batches to avoid overwhelming the EP API
 */
async function fetchMepDetailsBatched(
  meps: { id: string }[],
  batchSize: number
): Promise<NonNullable<Awaited<ReturnType<typeof epClient.getMEPDetails>>>[]> {
  const details: NonNullable<Awaited<ReturnType<typeof epClient.getMEPDetails>>>[] = [];
  for (let i = 0; i < meps.length; i += batchSize) {
    const batch = meps.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map((mep) => epClient.getMEPDetails(mep.id))
    );
    for (const r of batchResults) {
      if (r.status === 'fulfilled') {
        details.push(r.value);
      }
    }
  }
  return details;
}

/**
 * Build attendance analysis for multiple MEPs
 */
async function buildGroupAnalysis(
  params: { country?: string; groupId?: string; limit: number },
  dateFrom: string,
  dateTo: string
): Promise<AttendanceAnalysis> {
  const mepParams: Record<string, unknown> = { limit: params.limit };
  if (params.country !== undefined) {
    mepParams['country'] = params.country;
  }
  if (params.groupId !== undefined) {
    mepParams['group'] = params.groupId;
  }

  const mepResult = await epClient.getMEPs(mepParams);
  const meps = Array.isArray(mepResult.data) ? mepResult.data : [];

  const details = await fetchMepDetailsBatched(
    meps.slice(0, params.limit) as { id: string }[],
    5
  );

  const records = details.map(d => buildAttendanceRecord(d));
  records.sort((a, b) => b.attendanceRate - a.attendanceRate);

  const totalMEPs = records.length;
  const avgAttendance = totalMEPs > 0
    ? Math.round(records.reduce((s, r) => s + r.attendanceRate, 0) / totalMEPs * 100) / 100
    : 0;
  const high = records.filter(r => r.category === 'HIGH').length;
  const medium = records.filter(r => r.category === 'MODERATE').length;
  const low = records.filter(r => r.category === 'LOW').length;

  const scopeParts: string[] = [];
  if (params.country !== undefined) scopeParts.push(`Country: ${params.country}`);
  if (params.groupId !== undefined) scopeParts.push(`Group: ${params.groupId}`);
  const scope = scopeParts.length > 0 ? scopeParts.join(', ') : 'All MEPs';

  const withStats = records.filter(r => r.totalSessions > 0).length;
  const dataCoverage = totalMEPs > 0 ? withStats / totalMEPs : 0;

  return {
    period: { from: dateFrom, to: dateTo },
    scope,
    records,
    summary: {
      totalMEPs,
      averageAttendance: avgAttendance,
      highAttendance: high,
      mediumAttendance: medium,
      lowAttendance: low
    },
    computedAttributes: {
      overallEngagement: computeEngagement(avgAttendance),
      attendanceTrend: avgAttendance >= 70 ? 'STABLE' : 'DECLINING',
      absenteeismRisk: computeAbsenteeismRisk(low, totalMEPs)
    },
    confidenceLevel: computeConfidence(dataCoverage),
    methodology: 'Group attendance analysis using EP Open Data voting statistics. '
      + 'Individual attendance rates derived from plenary vote participation. '
      + 'Data source: European Parliament Open Data Portal.'
  };
}

/**
 * Track MEP attendance tool handler
 */
export async function handleTrackMepAttendance(
  args: unknown
): Promise<{ content: { type: string; text: string }[] }> {
  const params = TrackMepAttendanceSchema.parse(args);

  const now = new Date();
  const dateFrom = params.dateFrom ?? new Date(
    now.getFullYear() - 1,
    now.getMonth(),
    now.getDate()
  ).toISOString().split('T')[0] ?? '';
  const dateTo = params.dateTo ?? now.toISOString().split('T')[0] ?? '';

  let analysis: AttendanceAnalysis;

  if (params.mepId !== undefined) {
    analysis = await buildSingleMepAnalysis(params.mepId, dateFrom, dateTo);
  } else {
    const groupParams: { country?: string; groupId?: string; limit: number } = {
      limit: params.limit
    };
    if (params.country !== undefined) {
      groupParams.country = params.country;
    }
    if (params.groupId !== undefined) {
      groupParams.groupId = params.groupId;
    }
    analysis = await buildGroupAnalysis(groupParams, dateFrom, dateTo);
  }

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
export const trackMepAttendanceToolMetadata = {
  name: 'track_mep_attendance',
  description: 'Track and analyze MEP attendance patterns across plenary sessions. Provides attendance rates, trends, and engagement categorization. Filter by individual MEP, country, or political group.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      mepId: {
        type: 'string',
        description: 'MEP identifier (omit for group/country overview)'
      },
      country: {
        type: 'string',
        description: 'Filter by country (ISO 3166-1 alpha-2)'
      },
      groupId: {
        type: 'string',
        description: 'Filter by political group'
      },
      dateFrom: {
        type: 'string',
        description: 'Start date (YYYY-MM-DD)'
      },
      dateTo: {
        type: 'string',
        description: 'End date (YYYY-MM-DD)'
      },
      limit: {
        type: 'number',
        description: 'Maximum number of MEPs to return (default: 20)'
      }
    },
    required: []
  }
};
