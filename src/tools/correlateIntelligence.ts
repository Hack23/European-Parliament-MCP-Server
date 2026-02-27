/**
 * MCP Tool: correlate_intelligence
 *
 * Cross-tool OSINT intelligence correlation engine that combines outputs from
 * multiple intelligence tools to generate consolidated alerts and insights.
 *
 * **Intelligence Perspective:** Combines influence assessment, voting anomaly
 * detection, coalition dynamics, network analysis, and early warning signals
 * into unified intelligence assessments — surfacing patterns that are invisible
 * when each tool operates independently. Implements three core correlation
 * scenarios: (1) High-influence MEP × voting anomalies → elevated attention
 * flag; (2) Coalition fracture warning × declining cohesion → consolidated
 * alert; (3) Network centrality × cross-committee activity → comprehensive
 * profile.
 *
 * **Business Perspective:** Enables policy analysts, government affairs teams,
 * and intelligence practitioners to identify high-risk MEPs and coalition
 * instability through automated cross-tool correlation — saving hours of
 * manual intelligence synthesis and reducing missed signals.
 *
 * **Marketing Perspective:** Demonstrates the advanced OSINT capability of
 * combining 14 intelligence tools into actionable assessments for policy
 * professionals, researchers, and advocacy organisations tracking EU
 * legislative dynamics.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege), AU-002 (Audit Logging)
 */

import { randomUUID } from 'node:crypto';
import { CorrelateIntelligenceSchema, OsintStandardOutputSchema } from '../schemas/europeanParliament.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult, OsintStandardOutput } from './shared/types.js';

import { handleAssessMepInfluence } from './assessMepInfluence.js';
import { handleDetectVotingAnomalies } from './detectVotingAnomalies.js';
import { handleEarlyWarningSystem } from './earlyWarningSystem.js';
import { handleAnalyzeCoalitionDynamics } from './analyzeCoalitionDynamics.js';
import { handleNetworkAnalysis } from './networkAnalysis.js';
import { handleComparativeIntelligence } from './comparativeIntelligence.js';

// ---------------------------------------------------------------------------
// Internal parsed-result interfaces (subset of each tool's output)
// ---------------------------------------------------------------------------

interface InfluenceResult {
  mepId: string;
  mepName: string;
  overallScore: number;
  rank: string;
  confidenceLevel: string;
}

interface AnomalyResult {
  anomalies: { type: string; severity: string; mepId: string; mepName: string }[];
  summary: { totalAnomalies: number; highSeverity: number };
  confidenceLevel: string;
}

interface EarlyWarningResult {
  warnings: { type: string; severity: string; description: string; affectedEntities: string[] }[];
  riskLevel: string;
  stabilityScore: number;
  computedAttributes: { criticalWarnings: number; highWarnings: number; keyRiskFactor: string };
  confidenceLevel: string;
}

interface CoalitionResult {
  groupMetrics: { groupId: string; stressIndicator: number; computedAttributes: { unityTrend: string } }[];
  stressIndicators: { indicator: string; severity: string; affectedGroups: string[] }[];
  confidenceLevel: string;
}

interface NetworkResult {
  centralMEPs: { mepId: string; mepName: string; centralityScore: number }[];
  bridgingMEPs: { mepId: string; mepName: string }[];
  networkNodes?: { mepId: string; centralityScore: number }[];
  confidenceLevel: string;
}

interface ComparativeResult {
  profiles: { mepId: string; name: string; scores: Record<string, number>; overallScore: number }[];
  outlierMEPs: { mepId: string; name: string; outlierDimension: string; zScore: number }[];
  confidenceLevel: string;
}

// ---------------------------------------------------------------------------
// Correlation output types
// ---------------------------------------------------------------------------

/** A single correlated intelligence alert */
export interface CorrelationAlert {
  alertType: 'ELEVATED_ATTENTION' | 'COALITION_FRACTURE' | 'COMPREHENSIVE_PROFILE';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  mepId?: string;
  mepName?: string;
  groups?: string[];
  evidence: string[];
  recommendation: string;
}

/** Detail record for an influence × anomaly correlation */
export interface InfluenceAnomalyCorrelation {
  mepId: string;
  mepName: string;
  influenceScore: number;
  influenceRank: string;
  anomalyCount: number;
  highSeverityAnomalies: number;
  correlationSignificance: 'HIGH' | 'MEDIUM' | 'LOW';
}

/** Detail record for a coalition fracture correlation */
export interface CoalitionFractureCorrelation {
  affectedGroups: string[];
  warningSignals: string[];
  decliningCohesionGroups: string[];
  fractureRisk: 'HIGH' | 'MEDIUM' | 'LOW';
  stabilityScore: number;
}

/** Detail record for a network × committee comprehensive profile */
export interface NetworkProfileCorrelation {
  mepId: string;
  mepName: string;
  centralityScore: number;
  committeeActivityScore: number;
  isBridgingMep: boolean;
  profileSignificance: 'HIGH' | 'MEDIUM' | 'LOW';
}

/** Full correlated intelligence report */
export interface CorrelatedIntelligenceReport extends OsintStandardOutput {
  correlationId: string;
  analysisTime: string;
  scope: {
    mepIds: string[];
    groups: string[];
    sensitivityLevel: string;
    networkAnalysisIncluded: boolean;
  };
  alerts: CorrelationAlert[];
  correlations: {
    influenceAnomaly: InfluenceAnomalyCorrelation[];
    coalitionFracture: CoalitionFractureCorrelation | null;
    networkProfiles: NetworkProfileCorrelation[];
  };
  summary: {
    totalAlerts: number;
    criticalAlerts: number;
    highAlerts: number;
    mediumAlerts: number;
    lowAlerts: number;
    correlationsFound: number;
  };
}

// ---------------------------------------------------------------------------
// Sensitivity thresholds
// ---------------------------------------------------------------------------

const INFLUENCE_THRESHOLDS: Record<'HIGH' | 'MEDIUM' | 'LOW', number> = {
  HIGH: 50,
  MEDIUM: 70,
  LOW: 85,
};

const DEFAULT_COALITION_GROUPS = ['EPP', 'S&D', 'Renew', 'Greens/EFA', 'ECR', 'ID'];

// ---------------------------------------------------------------------------
// Helper: safely parse JSON from a ToolResult
// ---------------------------------------------------------------------------

function parseToolResult(result: ToolResult): unknown {
  const text = result.content[0]?.text;
  if (result.isError === true) {
    const message =
      typeof text === 'string' && text.trim().length > 0
        ? `Dependent tool returned an error result: ${text}`
        : 'Dependent tool returned an error result with no message';
    throw new Error(message);
  }
  try {
    return JSON.parse(text ?? '{}');
  } catch (error) {
    throw new Error(
      `Failed to parse dependent tool result as JSON: ${(error as Error).message}`
    );
  }
}

// ---------------------------------------------------------------------------
// Correlation scenario 1: Influence × Anomaly
// ---------------------------------------------------------------------------

function getCorrelationSignificance(
  isHighInfluence: boolean,
  hasAnomalies: boolean,
  highSeverityAnomalies: number
): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (isHighInfluence && highSeverityAnomalies > 0) return 'HIGH';
  if (isHighInfluence && hasAnomalies) return 'MEDIUM';
  return 'LOW';
}

function getAlertSeverityForAnomalies(highSeverity: number): 'CRITICAL' | 'HIGH' | 'MEDIUM' {
  if (highSeverity > 1) return 'CRITICAL';
  if (highSeverity > 0) return 'HIGH';
  return 'MEDIUM';
}

async function fetchInfluenceData(mepId: string): Promise<InfluenceResult | null> {
  try {
    const ir = await handleAssessMepInfluence({ mepId });
    return parseToolResult(ir) as InfluenceResult;
  } catch {
    return null;
  }
}

async function fetchAnomalyData(mepId: string): Promise<AnomalyResult> {
  try {
    const ar = await handleDetectVotingAnomalies({ mepId });
    return parseToolResult(ar) as AnomalyResult;
  } catch {
    return { anomalies: [], summary: { totalAnomalies: 0, highSeverity: 0 }, confidenceLevel: 'LOW' };
  }
}

async function correlateInfluenceAnomaly(
  mepId: string,
  influenceThreshold: number
): Promise<{
  correlation: InfluenceAnomalyCorrelation | null;
  alert: CorrelationAlert | null;
  toolConfidenceLevels: string[];
}> {
  const influenceData = await fetchInfluenceData(mepId);
  if (influenceData === null) return { correlation: null, alert: null, toolConfidenceLevels: [] };

  const anomalyData = await fetchAnomalyData(mepId);
  const toolConfidenceLevels = [influenceData.confidenceLevel, anomalyData.confidenceLevel];

  const isHighInfluence = influenceData.overallScore >= influenceThreshold;
  const hasAnomalies = anomalyData.summary.totalAnomalies > 0;

  if (!isHighInfluence && !hasAnomalies) return { correlation: null, alert: null, toolConfidenceLevels };

  const significance = getCorrelationSignificance(isHighInfluence, hasAnomalies, anomalyData.summary.highSeverity);

  const correlation: InfluenceAnomalyCorrelation = {
    mepId,
    mepName: influenceData.mepName,
    influenceScore: influenceData.overallScore,
    influenceRank: influenceData.rank,
    anomalyCount: anomalyData.summary.totalAnomalies,
    highSeverityAnomalies: anomalyData.summary.highSeverity,
    correlationSignificance: significance,
  };

  let alert: CorrelationAlert | null = null;
  if (isHighInfluence && hasAnomalies) {
    const severity = getAlertSeverityForAnomalies(anomalyData.summary.highSeverity);
    alert = {
      alertType: 'ELEVATED_ATTENTION',
      severity,
      mepId,
      mepName: influenceData.mepName,
      evidence: [
        `Influence score ${String(influenceData.overallScore)}/100 (rank: ${influenceData.rank}) meets threshold of ${String(influenceThreshold)}`,
        `${String(anomalyData.summary.totalAnomalies)} voting ${anomalyData.summary.totalAnomalies === 1 ? 'anomaly' : 'anomalies'} detected (${String(anomalyData.summary.highSeverity)} HIGH severity)`,
      ],
      recommendation:
        'Flag this MEP for elevated monitoring. High-influence actors exhibiting anomalous voting patterns may indicate a political realignment, external pressure, or coalition strategy shift.',
    };
  }

  return { correlation, alert, toolConfidenceLevels };
}

// ---------------------------------------------------------------------------
// Correlation scenario 2: Early Warning × Coalition Dynamics
// ---------------------------------------------------------------------------

function mapSensitivityToEws(sensitivityLevel: 'HIGH' | 'MEDIUM' | 'LOW'): 'low' | 'medium' | 'high' {
  if (sensitivityLevel === 'HIGH') return 'high';
  if (sensitivityLevel === 'LOW') return 'low';
  return 'medium';
}

function getFractureRisk(
  criticalWarnings: number,
  highStressCount: number,
  hasFractureSignals: boolean
): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (criticalWarnings > 0 || highStressCount > 1) return 'HIGH';
  if (hasFractureSignals) return 'MEDIUM';
  return 'LOW';
}

function isCoalitionWarning(w: { type: string; severity: string }): boolean {
  return w.type.includes('COALITION') || w.type.includes('FRAGMENTATION') ||
    w.severity === 'CRITICAL' || w.severity === 'HIGH';
}

async function correlateCoalitionFracture(
  groups: string[],
  sensitivityLevel: 'HIGH' | 'MEDIUM' | 'LOW'
): Promise<{
  correlation: CoalitionFractureCorrelation | null;
  alert: CorrelationAlert | null;
  toolConfidenceLevels: string[];
}> {
  const ewsSensitivity = mapSensitivityToEws(sensitivityLevel);

  let ewsData: EarlyWarningResult;
  let coalitionData: CoalitionResult;

  try {
    const er = await handleEarlyWarningSystem({ sensitivity: ewsSensitivity, focusArea: 'coalitions' });
    ewsData = parseToolResult(er) as EarlyWarningResult;
  } catch {
    return { correlation: null, alert: null, toolConfidenceLevels: [] };
  }

  try {
    const cr = await handleAnalyzeCoalitionDynamics({ groupIds: groups });
    coalitionData = parseToolResult(cr) as CoalitionResult;
  } catch {
    return { correlation: null, alert: null, toolConfidenceLevels: [] };
  }

  const toolConfidenceLevels = [ewsData.confidenceLevel, coalitionData.confidenceLevel];

  const coalitionWarnings = ewsData.warnings.filter(isCoalitionWarning);

  const decliningGroups = coalitionData.groupMetrics
    .filter(gm => gm.computedAttributes.unityTrend === 'WEAKENING' || gm.stressIndicator > 0.5)
    .map(gm => gm.groupId);

  const highStressIndicators = coalitionData.stressIndicators.filter(
    si => si.severity === 'CRITICAL' || si.severity === 'HIGH'
  );

  const hasFractureSignals = coalitionWarnings.length > 0 || highStressIndicators.length > 0;
  const hasDecliningCohesion = decliningGroups.length > 0;

  if (!hasFractureSignals && !hasDecliningCohesion) return { correlation: null, alert: null, toolConfidenceLevels };

  const fractureRisk = getFractureRisk(
    ewsData.computedAttributes.criticalWarnings,
    highStressIndicators.length,
    hasFractureSignals
  );

  const correlation: CoalitionFractureCorrelation = {
    affectedGroups: groups,
    warningSignals: coalitionWarnings.map(w => w.description),
    decliningCohesionGroups: decliningGroups,
    fractureRisk,
    stabilityScore: ewsData.stabilityScore,
  };

  let alert: CorrelationAlert | null = null;
  if (hasFractureSignals) {
    alert = {
      alertType: 'COALITION_FRACTURE',
      severity: fractureRisk,
      groups: decliningGroups.length > 0 ? decliningGroups : groups,
      evidence: [
        `Early Warning System: ${String(coalitionWarnings.length)} coalition warning(s) at ${ewsData.riskLevel} risk level`,
        hasDecliningCohesion
          ? `Coalition Dynamics: ${String(decliningGroups.length)} group(s) showing declining cohesion (${decliningGroups.join(', ')})`
          : `Coalition Dynamics: no declining cohesion detected (EP API per-group voting data limited)`,
        `Stability score: ${String(ewsData.stabilityScore)}/100 — key risk: ${ewsData.computedAttributes.keyRiskFactor}`,
      ],
      recommendation:
        'Monitor coalition stability closely. Converging fracture signals from both early warning and coalition dynamics indicate elevated risk of realignment or fragmentation.',
    };
  }

  return { correlation, alert, toolConfidenceLevels };
}

// ---------------------------------------------------------------------------
// Correlation scenario 3: Network Centrality × Comparative Intelligence
// ---------------------------------------------------------------------------

function getProfileSignificance(
  isHighCentrality: boolean,
  isHighCommitteeActivity: boolean,
  isBridging: boolean
): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (isHighCentrality && isHighCommitteeActivity && isBridging) return 'HIGH';
  if (isHighCentrality && (isHighCommitteeActivity || isBridging)) return 'MEDIUM';
  return 'LOW';
}

/**
 * Builds a {@link NetworkProfileCorrelation} record and optional
 * {@link CorrelationAlert} for a single MEP profile.
 *
 * Centrality is looked up first from the full `networkNodes` map (all MEPs in
 * the network), falling back to the truncated `centralMEPs` top-10 list so
 * that MEPs outside the top-10 are not silently scored as 0.
 */
function buildProfileAndAlert(
  profile: ComparativeResult['profiles'][number],
  networkNodesMap: Map<string, number>,
  centralMEPs: NetworkResult['centralMEPs'],
  bridgingIds: Set<string>
): { correlation: NetworkProfileCorrelation; alert: CorrelationAlert | null } {
  const centralityScore =
    networkNodesMap.get(profile.mepId) ??
    centralMEPs.find(c => c.mepId === profile.mepId)?.centralityScore ??
    0;
  const committeeScore = profile.scores['committee'] ?? 0;
  const isHighCentrality = centralityScore > 0.5;
  const isHighCommitteeActivity = committeeScore > 60;
  const isBridging = bridgingIds.has(profile.mepId);
  const significance = getProfileSignificance(isHighCentrality, isHighCommitteeActivity, isBridging);

  const correlation: NetworkProfileCorrelation = {
    mepId: profile.mepId,
    mepName: profile.name,
    centralityScore,
    committeeActivityScore: committeeScore,
    isBridgingMep: isBridging,
    profileSignificance: significance,
  };

  const alert: CorrelationAlert | null =
    significance === 'HIGH'
      ? {
          alertType: 'COMPREHENSIVE_PROFILE',
          severity: 'HIGH',
          mepId: profile.mepId,
          mepName: profile.name,
          evidence: [
            `Network centrality score: ${String(centralityScore)} (> 0.5 threshold)`,
            `Committee activity score: ${String(committeeScore)}/100 (cross-committee active)`,
            `Bridging MEP: ${String(isBridging)} — connects multiple political clusters`,
          ],
          recommendation:
            'Generate a comprehensive intelligence profile. High network centrality combined with cross-committee activity indicates a key informal power broker warranting deeper analysis.',
        }
      : null;

  return { correlation, alert };
}

async function correlateNetworkProfiles(
  mepIds: string[]
): Promise<{
  correlations: NetworkProfileCorrelation[];
  alerts: CorrelationAlert[];
  toolConfidenceLevels: string[];
}> {
  const numericIds = mepIds.map(id => parseInt(id, 10)).filter(n => !isNaN(n));

  let networkData: NetworkResult;
  try {
    const nr = await handleNetworkAnalysis({});
    networkData = parseToolResult(nr) as NetworkResult;
  } catch {
    return { correlations: [], alerts: [], toolConfidenceLevels: [] };
  }

  if (numericIds.length < 2) return { correlations: [], alerts: [], toolConfidenceLevels: [] };

  let comparativeData: ComparativeResult;
  try {
    const cr = await handleComparativeIntelligence({ mepIds: numericIds });
    comparativeData = parseToolResult(cr) as ComparativeResult;
  } catch {
    return { correlations: [], alerts: [], toolConfidenceLevels: [] };
  }

  const toolConfidenceLevels = [networkData.confidenceLevel, comparativeData.confidenceLevel];

  const networkNodesMap = new Map<string, number>(
    (networkData.networkNodes ?? []).map(n => [n.mepId, n.centralityScore])
  );
  const bridgingIds = new Set(networkData.bridgingMEPs.map(b => b.mepId));

  const profileResults = comparativeData.profiles.map(
    profile => buildProfileAndAlert(profile, networkNodesMap, networkData.centralMEPs, bridgingIds)
  );
  const correlations = profileResults.map(r => r.correlation);
  const alerts = profileResults.flatMap(r => (r.alert !== null ? [r.alert] : []));

  return { correlations, alerts, toolConfidenceLevels };
}

// ---------------------------------------------------------------------------
// Confidence aggregation
// ---------------------------------------------------------------------------

function aggregateConfidence(levels: string[]): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (levels.includes('HIGH') && !levels.includes('LOW')) return 'HIGH';
  if (levels.every(l => l === 'LOW')) return 'LOW';
  return 'MEDIUM';
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

function buildAlertSummary(allAlerts: CorrelationAlert[], correlationsFound: number): CorrelatedIntelligenceReport['summary'] {
  return {
    totalAlerts: allAlerts.length,
    criticalAlerts: allAlerts.filter(a => a.severity === 'CRITICAL').length,
    highAlerts: allAlerts.filter(a => a.severity === 'HIGH').length,
    mediumAlerts: allAlerts.filter(a => a.severity === 'MEDIUM').length,
    lowAlerts: allAlerts.filter(a => a.severity === 'LOW').length,
    correlationsFound,
  };
}

function buildMethodology(influenceThreshold: number, sensitivityLevel: string, includeNetworkAnalysis: boolean): string {
  const networkTools = includeNetworkAnalysis ? ', network_analysis, comparative_intelligence' : '';
  return `Cross-tool OSINT correlation engine — orchestrates assess_mep_influence, detect_voting_anomalies, early_warning_system, analyze_coalition_dynamics${networkTools}. Correlation thresholds: influence ≥ ${String(influenceThreshold)} (sensitivity: ${sensitivityLevel}). Data source: European Parliament Open Data Portal (data.europarl.europa.eu).`;
}

/**
 * Handles the `correlate_intelligence` MCP tool request.
 *
 * Orchestrates six OSINT tools — `assess_mep_influence`,
 * `detect_voting_anomalies`, `early_warning_system`,
 * `analyze_coalition_dynamics`, `network_analysis`, and
 * `comparative_intelligence` — and cross-correlates their outputs to produce
 * consolidated intelligence alerts.
 *
 * Three correlation scenarios are evaluated:
 * 1. **Influence × Anomaly** — When an MEP's influence score exceeds the
 *    sensitivity threshold and voting anomalies are detected simultaneously,
 *    an `ELEVATED_ATTENTION` alert is raised.
 * 2. **Coalition Fracture** — When the early warning system flags coalition
 *    instability and coalition dynamics shows declining cohesion for the same
 *    groups, a `COALITION_FRACTURE` alert is generated.
 * 3. **Comprehensive Profile** — When network analysis reveals high centrality
 *    and comparative intelligence confirms cross-committee activity for the
 *    same MEP, a `COMPREHENSIVE_PROFILE` alert is issued.
 *
 * @param args - Raw tool arguments, validated against
 *   {@link CorrelateIntelligenceSchema}
 * @returns MCP tool result containing a {@link CorrelatedIntelligenceReport}
 *   with alerts, correlations, and standard OSINT output fields
 * @throws If `args` fails schema validation
 * @throws If all underlying EP API calls fail simultaneously
 *
 * @example
 * ```typescript
 * // Correlate two MEPs with default MEDIUM sensitivity
 * const result = await handleCorrelateIntelligence({
 *   mepIds: ['197558', '124810'],
 * });
 * const report = JSON.parse(result.content[0].text);
 * console.log(`Alerts: ${report.summary.totalAlerts}`);
 * ```
 *
 * @example
 * ```typescript
 * // High-sensitivity scan with network analysis and explicit group scope
 * const result = await handleCorrelateIntelligence({
 *   mepIds: ['197558', '124810', '23456'],
 *   groups: ['EPP', 'S&D', 'Renew'],
 *   sensitivityLevel: 'HIGH',
 *   includeNetworkAnalysis: true,
 * });
 * ```
 *
 * @security Input validated by Zod. Cross-tool access to MEP personal data
 *   is minimised per GDPR Article 5(1)(c). EP data-access operations are
 *   logged through the underlying EP API client per ISMS Policy AU-002.
 * @since 1.0.0
 * @see {@link correlateIntelligenceToolMetadata} for MCP schema registration
 * @see {@link handleAssessMepInfluence} for the influence dimension
 * @see {@link handleDetectVotingAnomalies} for the anomaly dimension
 * @see {@link handleEarlyWarningSystem} for coalition risk signals
 */
export async function handleCorrelateIntelligence(
  args: unknown
): Promise<ToolResult> {
  const params = CorrelateIntelligenceSchema.parse(args);
  const { mepIds, groups, sensitivityLevel, includeNetworkAnalysis } = params;

  const resolvedGroups = groups ?? DEFAULT_COALITION_GROUPS;
  const influenceThreshold = INFLUENCE_THRESHOLDS[sensitivityLevel];
  const analysisTime = new Date().toISOString();
  const correlationId = `CORR-${randomUUID().replace(/-/g, '').toUpperCase().slice(0, 12)}`;

  // Scenario 1: Per-MEP influence × anomaly correlation (parallelised)
  const influenceAnomalyResults = await Promise.all(
    mepIds.map((mepId) => correlateInfluenceAnomaly(mepId, influenceThreshold)),
  );
  const influenceAnomalyCorrelations: InfluenceAnomalyCorrelation[] = [];
  const influenceAnomalyAlerts: CorrelationAlert[] = [];
  const influenceToolConfidenceLevels: string[] = [];

  for (const { correlation, alert, toolConfidenceLevels } of influenceAnomalyResults) {
    if (correlation !== null) influenceAnomalyCorrelations.push(correlation);
    if (alert !== null) influenceAnomalyAlerts.push(alert);
    influenceToolConfidenceLevels.push(...toolConfidenceLevels);
  }

  // Scenario 2: Coalition fracture
  const { correlation: coalitionCorrelation, alert: coalitionAlert, toolConfidenceLevels: coalitionConfidenceLevels } =
    await correlateCoalitionFracture(resolvedGroups, sensitivityLevel);

  // Scenario 3: Network × comparative profiles
  const { correlations: networkCorrelations, alerts: networkAlerts, toolConfidenceLevels: networkConfidenceLevels } =
    includeNetworkAnalysis
      ? await correlateNetworkProfiles(mepIds)
      : { correlations: [], alerts: [], toolConfidenceLevels: [] };

  const allAlerts: CorrelationAlert[] = [
    ...influenceAnomalyAlerts,
    ...(coalitionAlert !== null ? [coalitionAlert] : []),
    ...networkAlerts,
  ];

  const correlationsFound =
    influenceAnomalyCorrelations.length +
    (coalitionCorrelation !== null ? 1 : 0) +
    networkCorrelations.length;

  const confidenceLevels: string[] = [
    ...influenceToolConfidenceLevels,
    ...coalitionConfidenceLevels,
    ...networkConfidenceLevels,
  ];

  const report: CorrelatedIntelligenceReport = {
    correlationId,
    analysisTime,
    scope: {
      mepIds,
      groups: resolvedGroups,
      sensitivityLevel,
      networkAnalysisIncluded: includeNetworkAnalysis,
    },
    alerts: allAlerts,
    correlations: {
      influenceAnomaly: influenceAnomalyCorrelations,
      coalitionFracture: coalitionCorrelation,
      networkProfiles: networkCorrelations,
    },
    summary: buildAlertSummary(allAlerts, correlationsFound),
    confidenceLevel: aggregateConfidence(confidenceLevels.length > 0 ? confidenceLevels : ['MEDIUM']),
    methodology: buildMethodology(influenceThreshold, sensitivityLevel, includeNetworkAnalysis),
    dataFreshness: `Real-time EP API data — correlated at ${analysisTime}`,
    sourceAttribution: 'European Parliament Open Data Portal - data.europarl.europa.eu',
  };

  // Validate the standard OSINT output fields before returning
  try {
    OsintStandardOutputSchema.parse({
      confidenceLevel: report.confidenceLevel,
      methodology: report.methodology,
      dataFreshness: report.dataFreshness,
      sourceAttribution: report.sourceAttribution,
    });
  } catch (validationError) {
    throw new Error(
      `Report failed OSINT standard output schema validation: ${(validationError as Error).message}`,
    );
  }

  return buildToolResponse(report);
}

// ---------------------------------------------------------------------------
// Tool metadata
// ---------------------------------------------------------------------------

/**
 * MCP tool metadata for `correlate_intelligence` registration.
 */
export const correlateIntelligenceToolMetadata = {
  name: 'correlate_intelligence',
  description:
    'Cross-tool OSINT intelligence correlation engine. Combines outputs from ' +
    'assess_mep_influence + detect_voting_anomalies (ELEVATED_ATTENTION alerts), ' +
    'early_warning_system + analyze_coalition_dynamics (COALITION_FRACTURE alerts), ' +
    'and optionally network_analysis + comparative_intelligence (COMPREHENSIVE_PROFILE alerts). ' +
    'Returns consolidated intelligence alerts with evidence chains and recommendations.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      mepIds: {
        type: 'array',
        items: { type: 'string', minLength: 1, maxLength: 100 },
        minItems: 1,
        maxItems: 5,
        description: 'MEP identifiers to cross-correlate (1–5 MEPs)',
      },
      groups: {
        type: 'array',
        items: { type: 'string', minLength: 1, maxLength: 50 },
        maxItems: 8,
        description: 'Political groups for coalition fracture analysis (omit to use all major groups)',
      },
      sensitivityLevel: {
        type: 'string',
        enum: ['HIGH', 'MEDIUM', 'LOW'],
        default: 'MEDIUM',
        description: 'Alert sensitivity — HIGH surfaces more signals, LOW reduces noise',
      },
      includeNetworkAnalysis: {
        type: 'boolean',
        default: false,
        description: 'Run network centrality analysis (increases response time)',
      },
    },
    required: ['mepIds'],
  },
};
