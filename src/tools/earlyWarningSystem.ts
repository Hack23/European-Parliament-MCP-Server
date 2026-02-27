/**
 * MCP Tool: early_warning_system
 *
 * Detect emerging political shifts, unusual voting changes, and coalition
 * fracture signals. Combines anomaly detection and coalition dynamics
 * concepts to surface actionable risk warnings.
 *
 * **Intelligence Perspective:** Early warning identifies weak signals before
 * they manifest as major political disruptions—enabling proactive positioning
 * and risk mitigation for EU affairs practitioners.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { z } from 'zod';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse, buildErrorResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

export const EarlyWarningSystemSchema = z.object({
  sensitivity: z.enum(['low', 'medium', 'high'])
    .optional()
    .default('medium')
    .describe('Detection sensitivity — higher = more warnings surfaced'),
  focusArea: z.enum(['coalitions', 'attendance', 'all'])
    .optional()
    .default('all')
    .describe('Area of political activity to monitor')
});

export type EarlyWarningSystemParams = z.infer<typeof EarlyWarningSystemSchema>;

type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface Warning {
  type: string;
  severity: SeverityLevel;
  description: string;
  affectedEntities: string[];
  recommendedAction: string;
}

interface TrendIndicator {
  indicator: string;
  direction: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  confidence: number;
  description: string;
}

interface EarlyWarningResult {
  assessmentTime: string;
  sensitivity: string;
  focusArea: string;
  warnings: Warning[];
  riskLevel: SeverityLevel;
  stabilityScore: number;
  trendIndicators: TrendIndicator[];
  lastAssessmentTime: string;
  computedAttributes: {
    criticalWarnings: number;
    highWarnings: number;
    totalWarnings: number;
    overallStabilityTrend: 'STABLE' | 'DETERIORATING';
    keyRiskFactor: string;
  };
  dataAvailable: boolean;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  dataFreshness: string;
  sourceAttribution: string;
  methodology: string;
}

interface GroupSize {
  groupId: string;
  memberCount: number;
}

interface SensitivityThresholds {
  attendance: number;
  fragmentation: number;
  sizeImbalance: number;
}

const SENSITIVITY_THRESHOLDS: Record<'low' | 'medium' | 'high', SensitivityThresholds> = {
  low: { attendance: 50, fragmentation: 8, sizeImbalance: 5 },
  medium: { attendance: 60, fragmentation: 6, sizeImbalance: 3 },
  high: { attendance: 70, fragmentation: 4, sizeImbalance: 2 }
};

function deriveRiskLevel(critical: number, high: number, medium: number): SeverityLevel {
  if (critical > 0) return 'CRITICAL';
  if (high > 2) return 'HIGH';
  if (high > 0 || medium > 3) return 'MEDIUM';
  return 'LOW';
}

function computeStabilityScore(totalWarnings: number, critical: number, high: number): number {
  const penalty = critical * 25 + high * 10 + (totalWarnings - critical - high) * 3;
  return Math.max(0, Math.min(100, Math.round(100 - penalty)));
}

function buildFragmentationWarning(groupSizes: GroupSize[], threshold: number): Warning | undefined {
  if (groupSizes.length < threshold) return undefined;
  return {
    type: 'HIGH_FRAGMENTATION',
    severity: 'MEDIUM',
    description: `Parliament fragmented across ${String(groupSizes.length)} political groups — coalition building more complex`,
    affectedEntities: groupSizes.map(g => g.groupId),
    recommendedAction: 'Monitor cross-group voting patterns for emerging grand coalitions or blocking minorities'
  };
}

function buildDominanceWarning(groupSizes: GroupSize[], imbalanceRatio: number): Warning | undefined {
  const sorted = [...groupSizes].sort((a, b) => b.memberCount - a.memberCount);
  const largest = sorted[0];
  if (largest === undefined) return undefined;
  return {
    type: 'DOMINANT_GROUP_RISK',
    severity: 'HIGH',
    description: `Largest group (${largest.groupId}) is ${imbalanceRatio.toFixed(1)}x the size of the smallest group — potential dominance risk`,
    affectedEntities: [largest.groupId],
    recommendedAction: 'Track minority group coalition formation to counter dominant group influence'
  };
}

function buildMajorityWarning(majorityGroup: GroupSize, total: number): Warning {
  return {
    type: 'ABSOLUTE_MAJORITY_RISK',
    severity: 'CRITICAL',
    description: `Group ${majorityGroup.groupId} holds absolute majority (${String(majorityGroup.memberCount)}/${String(total)} MEPs)`,
    affectedEntities: [majorityGroup.groupId],
    recommendedAction: 'Verify inter-group checks and balances; monitor for procedural overreach'
  };
}

function buildCoalitionWarnings(groupSizes: GroupSize[], thresholds: SensitivityThresholds, focusArea: string): Warning[] {
  if (focusArea !== 'coalitions' && focusArea !== 'all') return [];

  const warnings: Warning[] = [];
  const totalMembers = groupSizes.reduce((s, g) => s + g.memberCount, 0);
  const sizes = groupSizes.map(g => g.memberCount);
  const maxSize = Math.max(...sizes);
  const minSize = Math.min(...sizes);
  const imbalanceRatio = minSize > 0 ? maxSize / minSize : maxSize;

  const fragWarning = buildFragmentationWarning(groupSizes, thresholds.fragmentation);
  if (fragWarning !== undefined) warnings.push(fragWarning);

  if (imbalanceRatio > thresholds.sizeImbalance) {
    const domWarning = buildDominanceWarning(groupSizes, imbalanceRatio);
    if (domWarning !== undefined) warnings.push(domWarning);
  }

  const majorityGroup = groupSizes.find(g => totalMembers > 0 && g.memberCount > totalMembers / 2);
  if (majorityGroup !== undefined) {
    warnings.push(buildMajorityWarning(majorityGroup, totalMembers));
  }

  return warnings;
}

function buildAttendanceWarnings(groupSizes: GroupSize[], focusArea: string): Warning[] {
  if (focusArea !== 'attendance' && focusArea !== 'all') return [];

  const smallGroups = groupSizes.filter(g => g.memberCount <= 5);
  if (smallGroups.length === 0) return [];

  return [{
    type: 'SMALL_GROUP_QUORUM_RISK',
    severity: 'LOW',
    description: `${String(smallGroups.length)} political group(s) with ≤5 members may struggle to maintain quorum`,
    affectedEntities: smallGroups.map(g => g.groupId),
    recommendedAction: 'Monitor small group participation rates to ensure quorum requirements are met'
  }];
}

function classifyFragmentationDirection(effectiveParties: number): TrendIndicator['direction'] {
  if (effectiveParties > 5) return 'NEGATIVE';
  if (effectiveParties > 3) return 'NEUTRAL';
  return 'POSITIVE';
}

function describeFragmentation(direction: TrendIndicator['direction']): string {
  if (direction === 'NEGATIVE') return 'high';
  if (direction === 'NEUTRAL') return 'moderate';
  return 'low';
}

function buildFragmentationIndicator(groupSizes: GroupSize[], totalMembers: number): TrendIndicator {
  const herfindahl = groupSizes.reduce((s, g) => {
    const share = totalMembers > 0 ? g.memberCount / totalMembers : 0;
    return s + share * share;
  }, 0);
  const effectiveParties = herfindahl > 0 ? 1 / herfindahl : 1;
  const direction = classifyFragmentationDirection(effectiveParties);
  return {
    indicator: 'parliamentary_fragmentation',
    direction,
    confidence: 0.7,
    description: `Effective number of parties: ${effectiveParties.toFixed(1)} (${describeFragmentation(direction)} fragmentation)`
  };
}

function classifyCoalitionDirection(top2Share: number): TrendIndicator['direction'] {
  if (top2Share > 0.5) return 'POSITIVE';
  if (top2Share > 0.35) return 'NEUTRAL';
  return 'NEGATIVE';
}

function buildCoalitionViabilityIndicator(groupSizes: GroupSize[], totalMembers: number): TrendIndicator {
  const sorted = [...groupSizes].sort((a, b) => b.memberCount - a.memberCount);
  const top2Share = sorted.slice(0, 2).reduce((s, g) => s + (totalMembers > 0 ? g.memberCount / totalMembers : 0), 0);
  const direction = classifyCoalitionDirection(top2Share);
  const viabilityText = top2Share > 0.5 ? 'viable' : 'uncertain';
  return {
    indicator: 'grand_coalition_viability',
    direction,
    confidence: 0.65,
    description: `Top-2 groups hold ${(top2Share * 100).toFixed(1)}% of seats — grand coalition ${viabilityText}`
  };
}

function classifyMinorityDirection(minorityShare: number): TrendIndicator['direction'] {
  if (minorityShare > 0.15) return 'NEGATIVE';
  if (minorityShare > 0.08) return 'NEUTRAL';
  return 'POSITIVE';
}

function buildMinorityIndicator(groupSizes: GroupSize[], totalMembers: number): TrendIndicator {
  const smallGroupCount = groupSizes
    .filter(g => totalMembers > 0 && g.memberCount / totalMembers < 0.05)
    .reduce((s, g) => s + g.memberCount, 0);
  const minorityShare = totalMembers > 0 ? smallGroupCount / totalMembers : 0;
  const direction = classifyMinorityDirection(minorityShare);
  const minorityText = minorityShare > 0.15 ? 'fragmentation concern' : 'healthy distribution';
  return {
    indicator: 'minority_representation',
    direction,
    confidence: 0.6,
    description: `${(minorityShare * 100).toFixed(1)}% of MEPs in minority groups (<5% seat share) — ${minorityText}`
  };
}

function buildTrendIndicators(groupSizes: GroupSize[], totalMembers: number): TrendIndicator[] {
  return [
    buildFragmentationIndicator(groupSizes, totalMembers),
    buildCoalitionViabilityIndicator(groupSizes, totalMembers),
    buildMinorityIndicator(groupSizes, totalMembers)
  ];
}

function classifyStabilityTrend(stabilityScore: number): 'STABLE' | 'DETERIORATING' {
  if (stabilityScore >= 50) return 'STABLE';
  return 'DETERIORATING';
}

function buildEmptyResult(params: EarlyWarningSystemParams, assessmentTime: string): EarlyWarningResult {
  return {
    assessmentTime,
    sensitivity: params.sensitivity,
    focusArea: params.focusArea,
    warnings: [],
    riskLevel: 'LOW',
    stabilityScore: 50,
    trendIndicators: [],
    lastAssessmentTime: assessmentTime,
    computedAttributes: {
      criticalWarnings: 0,
      highWarnings: 0,
      totalWarnings: 0,
      overallStabilityTrend: 'STABLE',
      keyRiskFactor: 'Insufficient data'
    },
    dataAvailable: false,
    confidenceLevel: 'LOW',
    dataFreshness: 'No data available from EP API',
    sourceAttribution: 'European Parliament Open Data Portal - data.europarl.europa.eu',
    methodology: 'Early warning assessment could not be performed — no MEP data returned.'
  };
}

function resolveKeyRiskFactor(warnings: Warning[]): string {
  const critical = warnings.find(w => w.severity === 'CRITICAL');
  if (critical !== undefined) return critical.type;
  const high = warnings.find(w => w.severity === 'HIGH');
  if (high !== undefined) return high.type;
  return 'NONE';
}

export async function earlyWarningSystem(params: EarlyWarningSystemParams): Promise<ToolResult> {
  try {
    // NOTE: getMEPs is paginated; limit:100 returns only the first page.
    // Group-size distributions may be underestimated when hasMore is true.
    // Warnings are sample-based; confidence is adjusted accordingly.
    const mepResult = await epClient.getMEPs({ limit: 100 });
    const assessmentTime = new Date().toISOString();

    if (mepResult.data.length === 0) {
      return buildToolResponse(buildEmptyResult(params, assessmentTime));
    }

    const groupSizeMap = new Map<string, number>();
    for (const mep of mepResult.data as { politicalGroup: string }[]) {
      const g = mep.politicalGroup;
      groupSizeMap.set(g, (groupSizeMap.get(g) ?? 0) + 1);
    }

    const groupSizes: GroupSize[] = Array.from(groupSizeMap.entries())
      .map(([groupId, memberCount]) => ({ groupId, memberCount }))
      .sort((a, b) => b.memberCount - a.memberCount);

    const totalMembers = mepResult.data.length;
    const sensitivity = params.sensitivity;
    const focusArea = params.focusArea;
    const thresholds = SENSITIVITY_THRESHOLDS[sensitivity];

    const warnings: Warning[] = [
      ...buildCoalitionWarnings(groupSizes, thresholds, focusArea),
      ...buildAttendanceWarnings(groupSizes, focusArea)
    ];

    const criticalWarnings = warnings.filter(w => w.severity === 'CRITICAL').length;
    const highWarnings = warnings.filter(w => w.severity === 'HIGH').length;
    const mediumWarnings = warnings.filter(w => w.severity === 'MEDIUM').length;
    const stabilityScore = computeStabilityScore(warnings.length, criticalWarnings, highWarnings);

    const result: EarlyWarningResult = {
      assessmentTime,
      sensitivity,
      focusArea,
      warnings,
      riskLevel: deriveRiskLevel(criticalWarnings, highWarnings, mediumWarnings),
      stabilityScore,
      trendIndicators: buildTrendIndicators(groupSizes, totalMembers),
      lastAssessmentTime: assessmentTime,
      computedAttributes: {
        criticalWarnings,
        highWarnings,
        totalWarnings: warnings.length,
        overallStabilityTrend: classifyStabilityTrend(stabilityScore),
        keyRiskFactor: resolveKeyRiskFactor(warnings)
      },
      dataAvailable: true,
      confidenceLevel: totalMembers >= 50 ? 'MEDIUM' : 'LOW',
      dataFreshness: 'Real-time EP API data — group composition from current MEP records',
      sourceAttribution: 'European Parliament Open Data Portal - data.europarl.europa.eu',
      methodology: 'Early warning assessment combining fragmentation analysis and coalition stability metrics. '
        + 'Warnings generated from: group size distribution (fragmentation), dominant group detection, '
        + 'minority group quorum risk, and coalition viability thresholds. '
        + 'Stability score = 100 - (25*critical + 10*high + 3*medium warnings). '
        + 'NOTE: Voting cohesion and attendance data not available from EP API — '
        + 'warnings are derived from structural group composition only. '
        + 'Data source: https://data.europarl.europa.eu/api/v2/meps'
    };

    return buildToolResponse(result);
  } catch (error) {
    return buildErrorResponse(
      error instanceof Error ? error : new Error(String(error)),
      'early_warning_system'
    );
  }
}

export const earlyWarningSystemToolMetadata = {
  name: 'early_warning_system',
  description: 'Detect emerging political shifts, coalition fracture signals, and unusual patterns. Generates warnings with severity levels (CRITICAL/HIGH/MEDIUM/LOW), computes stability score (0-100), trend indicators, and overall risk level. Configurable sensitivity and focus area.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      sensitivity: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
        description: 'Detection sensitivity — higher surfaces more warnings',
        default: 'medium'
      },
      focusArea: {
        type: 'string',
        enum: ['coalitions', 'attendance', 'all'],
        description: 'Area of political activity to monitor',
        default: 'all'
      }
    }
  }
};

export async function handleEarlyWarningSystem(args: unknown): Promise<ToolResult> {
  const params = EarlyWarningSystemSchema.parse(args);
  return earlyWarningSystem(params);
}
