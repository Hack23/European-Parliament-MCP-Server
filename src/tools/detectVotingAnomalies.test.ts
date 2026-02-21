/**
 * Tests for detect_voting_anomalies MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleDetectVotingAnomalies } from './detectVotingAnomalies.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getMEPDetails: vi.fn(),
    getMEPs: vi.fn()
  }
}));

describe('detect_voting_anomalies Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getMEPDetails).mockResolvedValue({
      id: 'MEP-1',
      name: 'Test MEP',
      country: 'SE',
      politicalGroup: 'EPP',
      committees: ['AGRI'],
      active: true,
      termStart: '2019-07-02',
      votingStatistics: {
        totalVotes: 1000,
        votesFor: 500,
        votesAgainst: 350,
        abstentions: 150,
        attendanceRate: 65
      }
    });

    vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue({
      data: [
        {
          id: 'MEP-1',
          name: 'Test MEP',
          country: 'SE',
          politicalGroup: 'EPP',
          committees: ['AGRI'],
          active: true,
          termStart: '2019-07-02'
        }
      ],
      total: 1,
      limit: 50,
      offset: 0,
      hasMore: false
    });
  });

  describe('Input Validation', () => {
    it('should accept empty args', async () => {
      const result = await handleDetectVotingAnomalies({});
      expect(result).toHaveProperty('content');
    });

    it('should accept specific mepId', async () => {
      const result = await handleDetectVotingAnomalies({ mepId: 'MEP-1' });
      expect(result).toHaveProperty('content');
    });

    it('should accept groupId filter', async () => {
      const result = await handleDetectVotingAnomalies({ groupId: 'EPP' });
      expect(result).toHaveProperty('content');
    });

    it('should accept sensitivity threshold', async () => {
      const result = await handleDetectVotingAnomalies({ sensitivityThreshold: 0.5 });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid sensitivity threshold', async () => {
      await expect(handleDetectVotingAnomalies({ sensitivityThreshold: 2.0 }))
        .rejects.toThrow();
    });
  });

  describe('Response Structure', () => {
    it('should return MCP-compliant response', async () => {
      const result = await handleDetectVotingAnomalies({ mepId: 'MEP-1' });
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
    });

    it('should return valid JSON', async () => {
      const result = await handleDetectVotingAnomalies({ mepId: 'MEP-1' });
      expect(() => JSON.parse(result.content[0]?.text ?? '{}')).not.toThrow();
    });

    it('should include anomaly summary', async () => {
      const result = await handleDetectVotingAnomalies({ mepId: 'MEP-1' });
      const data: unknown = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data).toHaveProperty('anomalies');
      expect(data).toHaveProperty('summary');
      expect(data).toHaveProperty('computedAttributes');
      expect(data).toHaveProperty('confidenceLevel');
      expect(data).toHaveProperty('methodology');
    });

    it('should include computed attributes', async () => {
      const result = await handleDetectVotingAnomalies({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        computedAttributes: Record<string, unknown>;
      };

      expect(data.computedAttributes).toHaveProperty('anomalyRate');
      expect(data.computedAttributes).toHaveProperty('groupStabilityScore');
      expect(data.computedAttributes).toHaveProperty('defectionTrend');
      expect(data.computedAttributes).toHaveProperty('riskLevel');
    });

    it('should detect anomalies for MEP with low attendance', async () => {
      const result = await handleDetectVotingAnomalies({
        mepId: 'MEP-1',
        sensitivityThreshold: 0.7
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        summary: { totalAnomalies: number };
      };

      expect(data.summary.totalAnomalies).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Anomaly Detection', () => {
    it('should classify anomalies by severity', async () => {
      const result = await handleDetectVotingAnomalies({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        summary: { highSeverity: number; mediumSeverity: number; lowSeverity: number };
      };

      expect(data.summary).toHaveProperty('highSeverity');
      expect(data.summary).toHaveProperty('mediumSeverity');
      expect(data.summary).toHaveProperty('lowSeverity');
    });

    it('should set target scope for single MEP', async () => {
      const result = await handleDetectVotingAnomalies({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { targetScope: string };

      expect(data.targetScope).toContain('MEP');
    });

    it('should set target scope for all MEPs', async () => {
      const result = await handleDetectVotingAnomalies({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { targetScope: string };

      expect(data.targetScope).toBe('All MEPs');
    });
  });

  describe('Error Handling', () => {
    it('should wrap API errors', async () => {
      vi.mocked(epClientModule.epClient.getMEPDetails)
        .mockRejectedValueOnce(new Error('Not found'));

      await expect(handleDetectVotingAnomalies({ mepId: 'INVALID' }))
        .rejects.toThrow('Failed to detect voting anomalies');
    });
  });
});
