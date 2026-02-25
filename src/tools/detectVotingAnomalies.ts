/**
 * MCP Tool: detect_voting_anomalies
 * 
 * Flag unusual voting patterns — party defections, sudden alignment shifts,
 * abstention spikes, and behavioral anomalies.
 * 
 * **Intelligence Perspective:** Anomaly detection tool identifying deviations from
 * expected voting behavior—enables early warning for party splits, political
 * realignments, and emerging cross-party movements.
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { DetectVotingAnomaliesSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import { handleDataUnavailable } from './shared/errorHandler.js';
import type { ToolResult } from './shared/types.js';

interface VotingAnomaly {
  type: string;
  severity: string;
  mepId: string;
  mepName: string;
  description: string;
  metrics: { expectedValue: number; actualValue: number; deviation: number };
  detectedDate: string;
}

interface VotingAnomalyAnalysis {
  period: { from: string; to: string };
  targetScope: string;
  anomalies: VotingAnomaly[];
  summary: { totalAnomalies: number; highSeverity: number; mediumSeverity: number; lowSeverity: number };
  computedAttributes: {
    anomalyRate: number;
    groupStabilityScore: number;
    defectionTrend: string;
    riskLevel: string;
  };
  confidenceLevel: string;
  methodology: string;
}

/**
 * Classify attendance severity
 */
function classifyAttendanceSeverity(rate: number): string {
  return rate < 50 ? 'HIGH' : 'MEDIUM';
}

/**
 * Classify abstention severity
 */
function classifyAbstentionSeverity(rate: number): string {
  return rate > 30 ? 'HIGH' : 'MEDIUM';
}

/**
 * Classify defection severity
 */
function classifyDefectionSeverity(rate: number): string {
  if (rate > 40) return 'HIGH';
  if (rate > 25) return 'MEDIUM';
  return 'LOW';
}

/**
 * Classify defection trend
 */
function classifyDefectionTrend(highCount: number): string {
  if (highCount > 2) return 'INCREASING';
  if (highCount > 0) return 'STABLE';
  return 'DECREASING';
}

/**
 * Classify risk level
 */
function classifyRiskLevel(highCount: number): string {
  if (highCount > 3) return 'CRITICAL';
  if (highCount > 1) return 'ELEVATED';
  if (highCount > 0) return 'MODERATE';
  return 'LOW';
}

/**
 * Determine confidence based on data volume, not anomaly count
 */
function getDataVolumeConfidence(scope: string, isSingleMep: boolean): string {
  if (isSingleMep) return 'MEDIUM';
  if (scope === 'All MEPs') return 'HIGH';
  return 'MEDIUM';
}

/**
 * Check for low attendance anomaly
 */
function checkAttendanceAnomaly(
  mep: { id: string; name: string; politicalGroup: string },
  stats: { attendanceRate: number },
  threshold: number,
  detectedDate: string
): VotingAnomaly | undefined {
  const expectedAttendance = Math.round((1 - threshold) * 100 * 100) / 100;

  if (stats.attendanceRate < expectedAttendance) {
    return {
      type: 'LOW_ATTENDANCE',
      severity: classifyAttendanceSeverity(stats.attendanceRate),
      mepId: mep.id,
      mepName: mep.name,
      description: `Attendance rate ${String(stats.attendanceRate)}% below expected threshold of ${String(expectedAttendance)}% for ${mep.politicalGroup}`,
      metrics: { expectedValue: expectedAttendance, actualValue: stats.attendanceRate, deviation: Math.round((expectedAttendance - stats.attendanceRate) * 100) / 100 },
      detectedDate
    };
  }
  return undefined;
}

/**
 * Check for high abstention anomaly
 */
function checkAbstentionAnomaly(
  mep: { id: string; name: string },
  stats: { abstentions: number; totalVotes: number },
  threshold: number,
  detectedDate: string
): VotingAnomaly | undefined {
  if (stats.totalVotes === 0) return undefined;
  const rate = (stats.abstentions / stats.totalVotes) * 100;
  if (rate > threshold * 50) {
    return {
      type: 'ABSTENTION_SPIKE',
      severity: classifyAbstentionSeverity(rate),
      mepId: mep.id,
      mepName: mep.name,
      description: `Abstention rate of ${String(Math.round(rate))}% significantly above group average`,
      metrics: { expectedValue: 10, actualValue: Math.round(rate * 100) / 100, deviation: Math.round((rate - 10) * 100) / 100 },
      detectedDate
    };
  }
  return undefined;
}

/**
 * Check for party defection anomaly
 */
function checkDefectionAnomaly(
  mep: { id: string; name: string; politicalGroup: string },
  stats: { votesFor: number; votesAgainst: number },
  threshold: number,
  detectedDate: string
): VotingAnomaly | undefined {
  const decisive = stats.votesFor + stats.votesAgainst;
  const rate = decisive > 0 ? (stats.votesAgainst / decisive) * 100 : 0;
  if (rate > threshold * 60) {
    return {
      type: 'PARTY_DEFECTION',
      severity: classifyDefectionSeverity(rate),
      mepId: mep.id,
      mepName: mep.name,
      description: `Defection rate of ${String(Math.round(rate))}% — voting against ${mep.politicalGroup} party line`,
      metrics: { expectedValue: 10, actualValue: Math.round(rate * 100) / 100, deviation: Math.round((rate - 10) * 100) / 100 },
      detectedDate
    };
  }
  return undefined;
}

/**
 * Detect anomalies from voting statistics
 */
function detectMepAnomalies(
  mep: { id: string; name: string; politicalGroup: string },
  stats: { totalVotes: number; votesFor: number; votesAgainst: number; abstentions: number; attendanceRate: number } | undefined,
  threshold: number,
  detectedDate: string
): VotingAnomaly[] {
  if (stats === undefined || stats.totalVotes === 0) return [];

  const anomalies: VotingAnomaly[] = [];
  const att = checkAttendanceAnomaly(mep, stats, threshold, detectedDate);
  if (att !== undefined) anomalies.push(att);
  const abs = checkAbstentionAnomaly(mep, stats, threshold, detectedDate);
  if (abs !== undefined) anomalies.push(abs);
  const def = checkDefectionAnomaly(mep, stats, threshold, detectedDate);
  if (def !== undefined) anomalies.push(def);
  return anomalies;
}

/**
 * Detect anomalies for a single MEP
 */
async function detectSingleMepAnomalies(
  mepId: string, threshold: number, period: { from: string; to: string }
): Promise<{ scope: string; anomalies: VotingAnomaly[]; dataAvailable: boolean }> {
  const mep = await epClient.getMEPDetails(mepId);
  const mepStats = mep.votingStatistics;
  const dataAvailable = mepStats !== undefined && mepStats.totalVotes > 0;
  const anomalies = detectMepAnomalies(
    { id: mep.id, name: mep.name, politicalGroup: mep.politicalGroup },
    mepStats,
    threshold,
    period.to
  );
  return { scope: `MEP: ${mepId}`, anomalies, dataAvailable };
}

/**
 * Detect anomalies for a group or all MEPs.
 * Note: The EP API /meps/{id} endpoint does not provide per-MEP voting
 * statistics, so group-level anomaly detection reports data unavailability
 * with LOW confidence rather than fabricating values.
 */
async function detectGroupAnomalies(
  groupId: string | undefined, _threshold: number, _period: { from: string; to: string }
): Promise<{ scope: string; anomalies: VotingAnomaly[]; mepCount: number }> {
  const groupFilter: { group?: string } = {};
  if (groupId !== undefined) {
    groupFilter.group = groupId;
  }
  const scope = groupId !== undefined ? `Group: ${groupId}` : 'All MEPs';
  const mepsResult = await epClient.getMEPs({ ...groupFilter, limit: 50 });
  // Per-MEP voting statistics are not available from the EP API /meps/{id}
  // endpoint, so we cannot detect group-wide anomalies from individual stats.
  return { scope, anomalies: [], mepCount: mepsResult.data.length };
}

/**
 * Build the anomaly analysis result object from anomaly detection results.
 */
function buildAnomalySummary(
  anomalies: VotingAnomaly[]
): { highSeverity: number; mediumSeverity: number; lowSeverity: number; anomalyRate: number } {
  const highSeverity = anomalies.filter(a => a.severity === 'HIGH').length;
  const mediumSeverity = anomalies.filter(a => a.severity === 'MEDIUM').length;
  const lowSeverity = anomalies.filter(a => a.severity === 'LOW').length;
  const anomalyRate = anomalies.length > 0
    ? Math.round((highSeverity * 3 + mediumSeverity * 2 + lowSeverity) / anomalies.length * 100) / 100
    : 0;
  return { highSeverity, mediumSeverity, lowSeverity, anomalyRate };
}

/**
 * Resolve confidence level based on MEP scope and anomaly availability.
 */
function resolveConfidence(isSingleMep: boolean, scope: string, anomalyCount: number): string {
  if (isSingleMep && anomalyCount > 0) {
    return getDataVolumeConfidence(scope, true);
  }
  return 'LOW';
}

/**
 * Detect voting anomalies tool handler
 */
export async function handleDetectVotingAnomalies(
  args: unknown
): Promise<ToolResult> {
  const params = DetectVotingAnomaliesSchema.parse(args);

  try {
    const period = { from: params.dateFrom ?? '2024-01-01', to: params.dateTo ?? '2024-12-31' };
    const mepId = params.mepId;
    const isSingleMep = mepId !== undefined;

    const result = mepId !== undefined
      ? await detectSingleMepAnomalies(mepId, params.sensitivityThreshold, period)
      : await detectGroupAnomalies(params.groupId, params.sensitivityThreshold, period);

    // When single MEP has no voting data, report unavailability honestly
    if (isSingleMep && 'dataAvailable' in result && !result.dataAvailable) {
      return handleDataUnavailable(
        'detect_voting_anomalies',
        'The EP API /meps/{id} endpoint does not return voting statistics. '
        + 'Anomaly detection requires voting data which is unavailable for this MEP.'
      );
    }

    const { highSeverity, mediumSeverity, lowSeverity, anomalyRate } = buildAnomalySummary(result.anomalies);
    const confidence = resolveConfidence(isSingleMep, result.scope, result.anomalies.length);

    const analysis: VotingAnomalyAnalysis = {
      period,
      targetScope: result.scope,
      anomalies: result.anomalies,
      summary: { totalAnomalies: result.anomalies.length, highSeverity, mediumSeverity, lowSeverity },
      computedAttributes: {
        anomalyRate,
        groupStabilityScore: Math.round((1 - anomalyRate / 3) * 100 * 100) / 100,
        defectionTrend: classifyDefectionTrend(highSeverity),
        riskLevel: classifyRiskLevel(highSeverity)
      },
      confidenceLevel: confidence,
      methodology: 'Heuristic statistical analysis using aggregated voting statistics and MEP metadata '
        + 'from /meps/{id} on the European Parliament Open Data API. Vote-level records are not fetched; '
        + 'many voting statistic fields may be zero or unavailable from the EP API. Group-level analysis '
        + 'reflects data availability — detected anomalies are approximate and indicative only. '
        + 'Data source: European Parliament Open Data Portal (MEP metadata endpoints).'
    };

    return buildToolResponse(analysis);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to detect voting anomalies: ${errorMessage}`);
  }
}

/**
 * Tool metadata for MCP registration
 */
export const detectVotingAnomaliesToolMetadata = {
  name: 'detect_voting_anomalies',
  description: 'Detect unusual voting patterns including party defections, abstention spikes, and low attendance anomalies. Configurable sensitivity threshold with severity classification (HIGH/MEDIUM/LOW). Returns anomaly details, group stability score, defection trend, and risk level assessment.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      mepId: {
        type: 'string',
        description: 'MEP identifier (omit for broad analysis)',
        minLength: 1,
        maxLength: 100
      },
      groupId: {
        type: 'string',
        description: 'Political group to analyze',
        minLength: 1,
        maxLength: 50
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
      sensitivityThreshold: {
        type: 'number',
        description: 'Anomaly sensitivity (0-1, lower = more anomalies detected)',
        minimum: 0,
        maximum: 1,
        default: 0.3
      }
    }
  }
};
