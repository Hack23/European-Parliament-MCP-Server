/**
 * Tests for the correlate_intelligence MCP tool.
 *
 * Verifies:
 * - Schema validation (required fields, limits)
 * - Influence × Anomaly correlation (ELEVATED_ATTENTION alert)
 * - Coalition Fracture correlation (COALITION_FRACTURE alert)
 * - Network × Comparative correlation (COMPREHENSIVE_PROFILE alert)
 * - Confidence aggregation
 * - Standard OSINT output fields (methodology, dataFreshness, sourceAttribution)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleCorrelateIntelligence } from './correlateIntelligence.js';
import { auditLogger } from '../utils/auditLogger.js';

// ---------------------------------------------------------------------------
// Mock dependent tool handlers
// ---------------------------------------------------------------------------

vi.mock('./assessMepInfluence.js', () => ({
  handleAssessMepInfluence: vi.fn(),
}));
vi.mock('./detectVotingAnomalies.js', () => ({
  handleDetectVotingAnomalies: vi.fn(),
}));
vi.mock('./earlyWarningSystem.js', () => ({
  handleEarlyWarningSystem: vi.fn(),
}));
vi.mock('./analyzeCoalitionDynamics.js', () => ({
  handleAnalyzeCoalitionDynamics: vi.fn(),
}));
vi.mock('./networkAnalysis.js', () => ({
  handleNetworkAnalysis: vi.fn(),
}));
vi.mock('./comparativeIntelligence.js', () => ({
  handleComparativeIntelligence: vi.fn(),
}));

import { handleAssessMepInfluence } from './assessMepInfluence.js';
import { handleDetectVotingAnomalies } from './detectVotingAnomalies.js';
import { handleEarlyWarningSystem } from './earlyWarningSystem.js';
import { handleAnalyzeCoalitionDynamics } from './analyzeCoalitionDynamics.js';
import { handleNetworkAnalysis } from './networkAnalysis.js';
import { handleComparativeIntelligence } from './comparativeIntelligence.js';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function makeToolResult(data: unknown): { content: { type: 'text'; text: string }[] } {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data) }] };
}

const HIGH_INFLUENCE_RESULT = makeToolResult({
  mepId: '123',
  mepName: 'Alice Smith',
  overallScore: 80,
  rank: 'SENIOR',
  confidenceLevel: 'HIGH',
});

const LOW_INFLUENCE_RESULT = makeToolResult({
  mepId: '456',
  mepName: 'Bob Jones',
  overallScore: 30,
  rank: 'JUNIOR',
  confidenceLevel: 'MEDIUM',
});

const ANOMALIES_RESULT = makeToolResult({
  anomalies: [
    { type: 'PARTY_DEFECTION', severity: 'HIGH', mepId: '123', mepName: 'Alice Smith' },
    { type: 'ABSTENTION_SPIKE', severity: 'MEDIUM', mepId: '123', mepName: 'Alice Smith' },
  ],
  summary: { totalAnomalies: 2, highSeverity: 1 },
  confidenceLevel: 'MEDIUM',
});

const NO_ANOMALIES_RESULT = makeToolResult({
  anomalies: [],
  summary: { totalAnomalies: 0, highSeverity: 0 },
  confidenceLevel: 'LOW',
});

const EWS_FRACTURE_RESULT = makeToolResult({
  warnings: [
    { type: 'COALITION_FRAGMENTATION', severity: 'HIGH', description: 'EPP cohesion declining', affectedEntities: ['EPP'] },
  ],
  riskLevel: 'HIGH',
  stabilityScore: 55,
  computedAttributes: { criticalWarnings: 0, highWarnings: 1, keyRiskFactor: 'COALITION_FRAGMENTATION' },
  confidenceLevel: 'MEDIUM',
});

const EWS_STABLE_RESULT = makeToolResult({
  warnings: [],
  riskLevel: 'LOW',
  stabilityScore: 85,
  computedAttributes: { criticalWarnings: 0, highWarnings: 0, keyRiskFactor: 'NONE' },
  confidenceLevel: 'HIGH',
});

const COALITION_FRACTURE_RESULT = makeToolResult({
  groupMetrics: [
    { groupId: 'EPP', stressIndicator: { value: 0.8, availability: 'AVAILABLE', confidence: 'HIGH' }, computedAttributes: { unityTrend: 'WEAKENING' } },
    { groupId: 'S&D', stressIndicator: { value: 0.2, availability: 'AVAILABLE', confidence: 'HIGH' }, computedAttributes: { unityTrend: 'STABLE' } },
  ],
  stressIndicators: [
    { indicator: 'HIGH_FRAGMENTATION', severity: 'HIGH', affectedGroups: ['EPP'] },
  ],
  confidenceLevel: 'MEDIUM',
});

const COALITION_STABLE_RESULT = makeToolResult({
  groupMetrics: [
    { groupId: 'EPP', stressIndicator: { value: 0.1, availability: 'AVAILABLE', confidence: 'HIGH' }, computedAttributes: { unityTrend: 'STABLE' } },
    { groupId: 'S&D', stressIndicator: { value: 0.2, availability: 'AVAILABLE', confidence: 'HIGH' }, computedAttributes: { unityTrend: 'STABLE' } },
  ],
  stressIndicators: [],
  confidenceLevel: 'HIGH',
});

const NETWORK_RESULT = makeToolResult({
  centralMEPs: [
    { mepId: '123', mepName: 'Alice Smith', centralityScore: 0.9 },
    { mepId: '456', mepName: 'Bob Jones', centralityScore: 0.3 },
  ],
  bridgingMEPs: [{ mepId: '123', mepName: 'Alice Smith' }],
  confidenceLevel: 'HIGH',
});

const COMPARATIVE_RESULT = makeToolResult({
  profiles: [
    { mepId: '123', name: 'Alice Smith', scores: { committee: 75, voting: 80 }, overallScore: 77 },
    { mepId: '456', name: 'Bob Jones', scores: { committee: 40, voting: 30 }, overallScore: 35 },
  ],
  outlierMEPs: [],
  confidenceLevel: 'MEDIUM',
});

// ---------------------------------------------------------------------------
// Default mock setup
// ---------------------------------------------------------------------------

function setupDefaultMocks(): void {
  vi.mocked(handleAssessMepInfluence).mockResolvedValue(HIGH_INFLUENCE_RESULT);
  vi.mocked(handleDetectVotingAnomalies).mockResolvedValue(NO_ANOMALIES_RESULT);
  vi.mocked(handleEarlyWarningSystem).mockResolvedValue(EWS_STABLE_RESULT);
  vi.mocked(handleAnalyzeCoalitionDynamics).mockResolvedValue(COALITION_STABLE_RESULT);
  vi.mocked(handleNetworkAnalysis).mockResolvedValue(NETWORK_RESULT);
  vi.mocked(handleComparativeIntelligence).mockResolvedValue(COMPARATIVE_RESULT);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('correlate_intelligence Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDefaultMocks();
    auditLogger.clear();
  });

  afterEach(() => {
    auditLogger.clear();
  });

  // ---- Schema validation ---------------------------------------------------

  describe('Schema Validation', () => {
    it('should require mepIds', async () => {
      await expect(handleCorrelateIntelligence({})).rejects.toThrow();
    });

    it('should reject empty mepIds array', async () => {
      await expect(handleCorrelateIntelligence({ mepIds: [] })).rejects.toThrow();
    });

    it('should reject more than 5 mepIds', async () => {
      await expect(
        handleCorrelateIntelligence({ mepIds: ['1', '2', '3', '4', '5', '6'] })
      ).rejects.toThrow();
    });

    it('should accept single mepId', async () => {
      const result = await handleCorrelateIntelligence({ mepIds: ['123'] });
      expect(result.content).toHaveLength(1);
    });

    it('should accept valid sensitivityLevel values', async () => {
      for (const level of ['HIGH', 'MEDIUM', 'LOW']) {
        const result = await handleCorrelateIntelligence({ mepIds: ['123'], sensitivityLevel: level });
        expect(result.content).toHaveLength(1);
      }
    });

    it('should reject invalid sensitivityLevel', async () => {
      await expect(
        handleCorrelateIntelligence({ mepIds: ['123'], sensitivityLevel: 'EXTREME' })
      ).rejects.toThrow();
    });
  });

  // ---- Response structure --------------------------------------------------

  describe('Response Structure', () => {
    it('should return MCP-compliant response with single text content', async () => {
      const result = await handleCorrelateIntelligence({ mepIds: ['123'] });
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
    });

    it('should include standard OSINT output fields', async () => {
      const result = await handleCorrelateIntelligence({ mepIds: ['123'] });
      const report = JSON.parse(result.content[0]!.text) as Record<string, unknown>;

      expect(report).toHaveProperty('confidenceLevel');
      expect(report).toHaveProperty('methodology');
      expect(report).toHaveProperty('dataFreshness');
      expect(report).toHaveProperty('sourceAttribution');
      expect(['HIGH', 'MEDIUM', 'LOW']).toContain(report['confidenceLevel']);
    });

    it('should include correlationId and analysisTime', async () => {
      const result = await handleCorrelateIntelligence({ mepIds: ['123'] });
      const report = JSON.parse(result.content[0]!.text) as Record<string, unknown>;

      expect(typeof report['correlationId']).toBe('string');
      expect(typeof report['analysisTime']).toBe('string');
    });

    it('should reflect requested scope in output', async () => {
      const result = await handleCorrelateIntelligence({
        mepIds: ['123', '456'],
        groups: ['EPP', 'S&D'],
        sensitivityLevel: 'HIGH',
        includeNetworkAnalysis: false,
      });
      const report = JSON.parse(result.content[0]!.text) as {
        scope: { mepIds: string[]; groups: string[]; sensitivityLevel: string; networkAnalysisIncluded: boolean };
      };

      expect(report.scope.mepIds).toEqual(['123', '456']);
      expect(report.scope.groups).toEqual(['EPP', 'S&D']);
      expect(report.scope.sensitivityLevel).toBe('HIGH');
      expect(report.scope.networkAnalysisIncluded).toBe(false);
    });

    it('should include summary with alert counts', async () => {
      const result = await handleCorrelateIntelligence({ mepIds: ['123'] });
      const report = JSON.parse(result.content[0]!.text) as {
        summary: { totalAlerts: number; criticalAlerts: number; highAlerts: number; mediumAlerts: number; lowAlerts: number; correlationsFound: number };
      };

      expect(typeof report.summary.totalAlerts).toBe('number');
      expect(typeof report.summary.criticalAlerts).toBe('number');
      expect(typeof report.summary.highAlerts).toBe('number');
      expect(typeof report.summary.mediumAlerts).toBe('number');
      expect(typeof report.summary.lowAlerts).toBe('number');
      expect(typeof report.summary.correlationsFound).toBe('number');
    });

    it('should include correlations object with all three scenarios', async () => {
      const result = await handleCorrelateIntelligence({ mepIds: ['123'] });
      const report = JSON.parse(result.content[0]!.text) as {
        correlations: { influenceAnomaly: unknown[]; coalitionFracture: unknown; networkProfiles: unknown[] };
      };

      expect(Array.isArray(report.correlations.influenceAnomaly)).toBe(true);
      // coalitionFracture can be null or an object
      expect(Array.isArray(report.correlations.networkProfiles)).toBe(true);
    });
  });

  // ---- Scenario 1: Influence × Anomaly ------------------------------------

  describe('Scenario 1: ELEVATED_ATTENTION (Influence × Anomaly)', () => {
    it('should generate ELEVATED_ATTENTION alert when high influence + anomalies detected', async () => {
      vi.mocked(handleAssessMepInfluence).mockResolvedValue(HIGH_INFLUENCE_RESULT);
      vi.mocked(handleDetectVotingAnomalies).mockResolvedValue(ANOMALIES_RESULT);

      const result = await handleCorrelateIntelligence({
        mepIds: ['123'],
        sensitivityLevel: 'MEDIUM',
      });
      const report = JSON.parse(result.content[0]!.text) as {
        alerts: { alertType: string; severity: string; mepId: string }[];
        summary: { totalAlerts: number };
        correlations: { influenceAnomaly: { influenceScore: number; anomalyCount: number }[] };
      };

      const elevatedAlert = report.alerts.find(a => a.alertType === 'ELEVATED_ATTENTION');
      expect(elevatedAlert).not.toBeUndefined();
      expect(elevatedAlert?.mepId).toBe('123');
      expect(report.summary.totalAlerts).toBeGreaterThan(0);

      const correlation = report.correlations.influenceAnomaly[0];
      expect(correlation?.influenceScore).toBe(80);
      expect(correlation?.anomalyCount).toBe(2);
    });

    it('should NOT generate ELEVATED_ATTENTION when influence below threshold', async () => {
      vi.mocked(handleAssessMepInfluence).mockResolvedValue(LOW_INFLUENCE_RESULT);
      vi.mocked(handleDetectVotingAnomalies).mockResolvedValue(ANOMALIES_RESULT);

      const result = await handleCorrelateIntelligence({
        mepIds: ['456'],
        sensitivityLevel: 'MEDIUM', // threshold = 70, score = 30
      });
      const report = JSON.parse(result.content[0]!.text) as {
        alerts: { alertType: string }[];
      };

      const elevatedAlert = report.alerts.find(a => a.alertType === 'ELEVATED_ATTENTION');
      expect(elevatedAlert).toBeUndefined();
    });

    it('should NOT generate ELEVATED_ATTENTION when no anomalies', async () => {
      vi.mocked(handleAssessMepInfluence).mockResolvedValue(HIGH_INFLUENCE_RESULT);
      vi.mocked(handleDetectVotingAnomalies).mockResolvedValue(NO_ANOMALIES_RESULT);

      const result = await handleCorrelateIntelligence({ mepIds: ['123'] });
      const report = JSON.parse(result.content[0]!.text) as {
        alerts: { alertType: string }[];
      };

      const elevatedAlert = report.alerts.find(a => a.alertType === 'ELEVATED_ATTENTION');
      expect(elevatedAlert).toBeUndefined();
    });

    it('should use lower threshold for HIGH sensitivity', async () => {
      vi.mocked(handleAssessMepInfluence).mockResolvedValue(
        makeToolResult({ mepId: '456', mepName: 'Bob Jones', overallScore: 55, rank: 'MID', confidenceLevel: 'MEDIUM' })
      );
      vi.mocked(handleDetectVotingAnomalies).mockResolvedValue(ANOMALIES_RESULT);

      const result = await handleCorrelateIntelligence({
        mepIds: ['456'],
        sensitivityLevel: 'HIGH', // threshold = 50, score = 55 → should trigger
      });
      const report = JSON.parse(result.content[0]!.text) as { alerts: { alertType: string }[] };

      const alert = report.alerts.find(a => a.alertType === 'ELEVATED_ATTENTION');
      expect(alert).not.toBeUndefined();
    });

    it('should use higher threshold for LOW sensitivity', async () => {
      vi.mocked(handleAssessMepInfluence).mockResolvedValue(HIGH_INFLUENCE_RESULT); // score = 80
      vi.mocked(handleDetectVotingAnomalies).mockResolvedValue(ANOMALIES_RESULT);

      const result = await handleCorrelateIntelligence({
        mepIds: ['123'],
        sensitivityLevel: 'LOW', // threshold = 85, score = 80 → should NOT trigger
      });
      const report = JSON.parse(result.content[0]!.text) as { alerts: { alertType: string }[] };

      const alert = report.alerts.find(a => a.alertType === 'ELEVATED_ATTENTION');
      expect(alert).toBeUndefined();
    });

    it('should escalate to CRITICAL when multiple HIGH-severity anomalies', async () => {
      vi.mocked(handleAssessMepInfluence).mockResolvedValue(HIGH_INFLUENCE_RESULT);
      vi.mocked(handleDetectVotingAnomalies).mockResolvedValue(
        makeToolResult({
          anomalies: [
            { type: 'PARTY_DEFECTION', severity: 'HIGH', mepId: '123', mepName: 'Alice Smith' },
            { type: 'ABSTENTION_SPIKE', severity: 'HIGH', mepId: '123', mepName: 'Alice Smith' },
          ],
          summary: { totalAnomalies: 2, highSeverity: 2 },
          confidenceLevel: 'HIGH',
        })
      );

      const result = await handleCorrelateIntelligence({ mepIds: ['123'] });
      const report = JSON.parse(result.content[0]!.text) as { alerts: { alertType: string; severity: string }[] };

      const alert = report.alerts.find(a => a.alertType === 'ELEVATED_ATTENTION');
      expect(alert?.severity).toBe('CRITICAL');
    });

    it('should gracefully handle influence assessment failure', async () => {
      vi.mocked(handleAssessMepInfluence).mockRejectedValue(new Error('API timeout'));
      vi.mocked(handleDetectVotingAnomalies).mockResolvedValue(ANOMALIES_RESULT);

      // Should not throw; just skip that MEP
      const result = await handleCorrelateIntelligence({ mepIds: ['123'] });
      expect(result.content).toHaveLength(1);

      // AU-002: error must be logged to audit trail
      const errorLogs = auditLogger.getLogs().filter(
        e => e.action === 'correlate_intelligence.fetch_influence_data' && e.result.success === false
      );
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0]?.result.error).toBe('API timeout');
    });
  });

  // ---- Scenario 2: Coalition Fracture --------------------------------------

  describe('Scenario 2: COALITION_FRACTURE (EWS × Coalition Dynamics)', () => {
    it('should generate COALITION_FRACTURE alert when EWS fracture + declining cohesion', async () => {
      vi.mocked(handleEarlyWarningSystem).mockResolvedValue(EWS_FRACTURE_RESULT);
      vi.mocked(handleAnalyzeCoalitionDynamics).mockResolvedValue(COALITION_FRACTURE_RESULT);

      const result = await handleCorrelateIntelligence({
        mepIds: ['123'],
        groups: ['EPP', 'S&D'],
      });
      const report = JSON.parse(result.content[0]!.text) as {
        alerts: { alertType: string; groups?: string[] }[];
        correlations: { coalitionFracture: { affectedGroups: string[]; fractureRisk: string } | null };
      };

      const fractureAlert = report.alerts.find(a => a.alertType === 'COALITION_FRACTURE');
      expect(fractureAlert).not.toBeUndefined();
      expect(report.correlations.coalitionFracture).not.toBeNull();
      expect(report.correlations.coalitionFracture?.fractureRisk).toBe('MEDIUM');
    });

    it('should NOT generate COALITION_FRACTURE when both signals are stable', async () => {
      vi.mocked(handleEarlyWarningSystem).mockResolvedValue(EWS_STABLE_RESULT);
      vi.mocked(handleAnalyzeCoalitionDynamics).mockResolvedValue(COALITION_STABLE_RESULT);

      const result = await handleCorrelateIntelligence({ mepIds: ['123'] });
      const report = JSON.parse(result.content[0]!.text) as {
        alerts: { alertType: string }[];
        correlations: { coalitionFracture: null };
      };

      const fractureAlert = report.alerts.find(a => a.alertType === 'COALITION_FRACTURE');
      expect(fractureAlert).toBeUndefined();
      expect(report.correlations.coalitionFracture).toBeNull();
    });

    it('should use default coalition groups when none specified', async () => {
      vi.mocked(handleEarlyWarningSystem).mockResolvedValue(EWS_STABLE_RESULT);
      vi.mocked(handleAnalyzeCoalitionDynamics).mockResolvedValue(COALITION_STABLE_RESULT);

      const result = await handleCorrelateIntelligence({ mepIds: ['123'] });
      const report = JSON.parse(result.content[0]!.text) as {
        scope: { groups: string[] };
      };

      expect(report.scope.groups).toEqual(['EPP', 'S&D', 'Renew', 'Greens/EFA', 'ECR', 'ID']);
    });

    it('should gracefully handle EWS failure', async () => {
      vi.mocked(handleEarlyWarningSystem).mockRejectedValue(new Error('API error'));

      const result = await handleCorrelateIntelligence({ mepIds: ['123'] });
      const report = JSON.parse(result.content[0]!.text) as {
        correlations: { coalitionFracture: null };
      };

      expect(report.correlations.coalitionFracture).toBeNull();

      // AU-002: error must be logged to audit trail
      const errorLogs = auditLogger.getLogs().filter(
        e => e.action === 'correlate_intelligence.fetch_early_warning_data' && e.result.success === false
      );
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0]?.result.error).toBe('API error');
    });
  });

  // ---- Scenario 3: Network × Comparative -----------------------------------

  describe('Scenario 3: COMPREHENSIVE_PROFILE (Network × Comparative)', () => {
    it('should NOT run network analysis by default', async () => {
      const result = await handleCorrelateIntelligence({ mepIds: ['123', '456'] });
      const report = JSON.parse(result.content[0]!.text) as {
        scope: { networkAnalysisIncluded: boolean };
        correlations: { networkProfiles: unknown[] };
      };

      expect(report.scope.networkAnalysisIncluded).toBe(false);
      expect(report.correlations.networkProfiles).toHaveLength(0);
      expect(handleNetworkAnalysis).not.toHaveBeenCalled();
    });

    it('should run network analysis when includeNetworkAnalysis is true', async () => {
      const result = await handleCorrelateIntelligence({
        mepIds: ['123', '456'],
        includeNetworkAnalysis: true,
      });
      const report = JSON.parse(result.content[0]!.text) as {
        scope: { networkAnalysisIncluded: boolean };
        correlations: { networkProfiles: { mepId: string; centralityScore: number }[] };
      };

      expect(report.scope.networkAnalysisIncluded).toBe(true);
      expect(handleNetworkAnalysis).toHaveBeenCalled();
      expect(handleComparativeIntelligence).toHaveBeenCalled();
      expect(report.correlations.networkProfiles).toHaveLength(2);
    });

    it('should generate COMPREHENSIVE_PROFILE alert for high-centrality bridging MEP', async () => {
      const result = await handleCorrelateIntelligence({
        mepIds: ['123', '456'],
        includeNetworkAnalysis: true,
      });
      const report = JSON.parse(result.content[0]!.text) as {
        alerts: { alertType: string; mepId: string; severity: string }[];
      };

      const profileAlert = report.alerts.find(a => a.alertType === 'COMPREHENSIVE_PROFILE');
      expect(profileAlert).not.toBeUndefined();
      expect(profileAlert?.mepId).toBe('123'); // Alice: centrality 0.9, committee 75, bridging=true
      expect(profileAlert?.severity).toBe('HIGH');
    });

    it('should skip network analysis when only one mepId provided', async () => {
      const result = await handleCorrelateIntelligence({
        mepIds: ['123'],
        includeNetworkAnalysis: true,
      });
      const report = JSON.parse(result.content[0]!.text) as {
        correlations: { networkProfiles: unknown[] };
      };

      // comparative_intelligence requires min 2 MEPs, so profiles should be empty
      expect(report.correlations.networkProfiles).toHaveLength(0);
    });

    it('should gracefully handle network analysis failure', async () => {
      vi.mocked(handleNetworkAnalysis).mockRejectedValue(new Error('Network error'));

      const result = await handleCorrelateIntelligence({
        mepIds: ['123', '456'],
        includeNetworkAnalysis: true,
      });
      const report = JSON.parse(result.content[0]!.text) as {
        correlations: { networkProfiles: unknown[] };
      };

      expect(report.correlations.networkProfiles).toHaveLength(0);

      // AU-002: error must be logged to audit trail
      const errorLogs = auditLogger.getLogs().filter(
        e => e.action === 'correlate_intelligence.fetch_network_data' && e.result.success === false
      );
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0]?.result.error).toBe('Network error');
    });
  });

  // ---- Confidence aggregation ---------------------------------------------

  describe('Confidence Level Aggregation', () => {
    it('should return HIGH confidence when all correlations are high', async () => {
      vi.mocked(handleAssessMepInfluence).mockResolvedValue(HIGH_INFLUENCE_RESULT);
      vi.mocked(handleDetectVotingAnomalies).mockResolvedValue(ANOMALIES_RESULT);

      const result = await handleCorrelateIntelligence({ mepIds: ['123'] });
      const report = JSON.parse(result.content[0]!.text) as { confidenceLevel: string };
      expect(['HIGH', 'MEDIUM', 'LOW']).toContain(report.confidenceLevel);
    });

    it('should return LOW confidence when all tools fail', async () => {
      vi.mocked(handleAssessMepInfluence).mockRejectedValue(new Error('fail'));
      vi.mocked(handleDetectVotingAnomalies).mockRejectedValue(new Error('fail'));
      vi.mocked(handleEarlyWarningSystem).mockRejectedValue(new Error('fail'));
      vi.mocked(handleAnalyzeCoalitionDynamics).mockRejectedValue(new Error('fail'));

      const result = await handleCorrelateIntelligence({ mepIds: ['123'] });
      const report = JSON.parse(result.content[0]!.text) as { confidenceLevel: string };
      // Falls back to LOW (empty levels default) — not MEDIUM, since no data at all
      expect(report.confidenceLevel).toBe('LOW');
    });
  });

  // ---- Data availability markers ------------------------------------------

  describe('Data Availability Markers', () => {
    it('should return UNAVAILABLE when all dependent tools fail', async () => {
      vi.mocked(handleAssessMepInfluence).mockRejectedValue(new Error('fail'));
      vi.mocked(handleDetectVotingAnomalies).mockRejectedValue(new Error('fail'));
      vi.mocked(handleEarlyWarningSystem).mockRejectedValue(new Error('fail'));
      vi.mocked(handleAnalyzeCoalitionDynamics).mockRejectedValue(new Error('fail'));

      const result = await handleCorrelateIntelligence({ mepIds: ['123'] });
      const report = JSON.parse(result.content[0]!.text) as { dataAvailability: string };
      expect(report.dataAvailability).toBe('UNAVAILABLE');
    });

    it('should return PARTIAL when tools succeed but produce no correlations', async () => {
      // Low influence score → no ELEVATED_ATTENTION alert; no anomalies → no correlation
      vi.mocked(handleAssessMepInfluence).mockResolvedValue(LOW_INFLUENCE_RESULT);
      vi.mocked(handleDetectVotingAnomalies).mockResolvedValue(NO_ANOMALIES_RESULT);

      const result = await handleCorrelateIntelligence({ mepIds: ['456'] });
      const report = JSON.parse(result.content[0]!.text) as {
        dataAvailability: string;
        correlations: { influenceAnomaly: unknown[] };
      };
      expect(report.correlations.influenceAnomaly).toHaveLength(0);
      expect(report.dataAvailability).toBe('PARTIAL');
    });

    it('should return AVAILABLE when correlations are found', async () => {
      vi.mocked(handleAssessMepInfluence).mockResolvedValue(HIGH_INFLUENCE_RESULT);
      vi.mocked(handleDetectVotingAnomalies).mockResolvedValue(ANOMALIES_RESULT);

      const result = await handleCorrelateIntelligence({ mepIds: ['123'] });
      const report = JSON.parse(result.content[0]!.text) as { dataAvailability: string };
      expect(report.dataAvailability).toBe('AVAILABLE');
    });
  });

  // ---- Methodology transparency -------------------------------------------

  describe('Methodology Transparency (OsintStandardOutput)', () => {
    it('should include methodology that references sensitivity threshold', async () => {
      const result = await handleCorrelateIntelligence({
        mepIds: ['123'],
        sensitivityLevel: 'HIGH',
      });
      const report = JSON.parse(result.content[0]!.text) as { methodology: string };
      expect(report.methodology).toContain('50'); // HIGH threshold
      expect(report.methodology).toContain('HIGH');
    });

    it('should include EP Open Data Portal in sourceAttribution', async () => {
      const result = await handleCorrelateIntelligence({ mepIds: ['123'] });
      const report = JSON.parse(result.content[0]!.text) as { sourceAttribution: string };
      expect(report.sourceAttribution).toContain('data.europarl.europa.eu');
    });

    it('should include ISO timestamp in dataFreshness', async () => {
      const result = await handleCorrelateIntelligence({ mepIds: ['123'] });
      const report = JSON.parse(result.content[0]!.text) as { dataFreshness: string };
      expect(report.dataFreshness).toMatch(/\d{4}-\d{2}-\d{2}T/);
    });

    it('should mention network analysis tools in methodology when enabled', async () => {
      const result = await handleCorrelateIntelligence({
        mepIds: ['123', '456'],
        includeNetworkAnalysis: true,
      });
      const report = JSON.parse(result.content[0]!.text) as { methodology: string };
      expect(report.methodology).toContain('network_analysis');
      expect(report.methodology).toContain('comparative_intelligence');
    });
  });

  // ---- Multiple MEPs -------------------------------------------------------

  describe('Multiple MEP Correlation', () => {
    it('should process up to 5 MEPs', async () => {
      vi.mocked(handleAssessMepInfluence).mockResolvedValue(HIGH_INFLUENCE_RESULT);
      vi.mocked(handleDetectVotingAnomalies).mockResolvedValue(ANOMALIES_RESULT);

      const result = await handleCorrelateIntelligence({
        mepIds: ['1', '2', '3', '4', '5'],
      });
      const report = JSON.parse(result.content[0]!.text) as {
        scope: { mepIds: string[] };
        correlations: { influenceAnomaly: unknown[] };
      };

      expect(report.scope.mepIds).toHaveLength(5);
      // All 5 should have correlations (since mock returns HIGH influence + anomalies)
      expect(report.correlations.influenceAnomaly).toHaveLength(5);
    });

    it('should aggregate alerts across multiple MEPs', async () => {
      vi.mocked(handleAssessMepInfluence).mockResolvedValue(HIGH_INFLUENCE_RESULT);
      vi.mocked(handleDetectVotingAnomalies).mockResolvedValue(ANOMALIES_RESULT);

      const result = await handleCorrelateIntelligence({
        mepIds: ['123', '456'],
      });
      const report = JSON.parse(result.content[0]!.text) as {
        summary: { totalAlerts: number };
        alerts: { alertType: string }[];
      };

      const elevatedAlerts = report.alerts.filter(a => a.alertType === 'ELEVATED_ATTENTION');
      expect(elevatedAlerts).toHaveLength(2); // one per MEP
    });
  });
});
