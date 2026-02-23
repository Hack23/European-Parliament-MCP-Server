/**
 * Tests for track_mep_attendance MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleTrackMepAttendance } from './trackMepAttendance.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getMEPs: vi.fn(),
    getMEPDetails: vi.fn()
  }
}));

describe('track_mep_attendance Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getMEPDetails).mockResolvedValue({
      id: 'MEP-1',
      name: 'Test MEP',
      country: 'SE',
      politicalGroup: 'EPP',
      committees: ['ENVI'],
      active: true,
      termStart: '2019-07-02',
      votingStatistics: {
        totalVotes: 1000,
        votesFor: 500,
        votesAgainst: 350,
        abstentions: 150,
        attendanceRate: 78
      }
    });

    vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue({
      data: [
        {
          id: 'MEP-1',
          name: 'Test MEP',
          country: 'SE',
          politicalGroup: 'EPP',
          committees: ['ENVI'],
          active: true,
          termStart: '2019-07-02'
        },
        {
          id: 'MEP-2',
          name: 'Test MEP 2',
          country: 'DE',
          politicalGroup: 'S&D',
          committees: ['ITRE'],
          active: true,
          termStart: '2019-07-02'
        }
      ],
      total: 2,
      limit: 20,
      offset: 0,
      hasMore: false
    });
  });

  describe('Input Validation', () => {
    it('should accept empty args for all MEPs', async () => {
      const result = await handleTrackMepAttendance({});
      expect(result).toHaveProperty('content');
      expect(result.content).toHaveLength(1);
    });

    it('should accept mepId for single MEP', async () => {
      const result = await handleTrackMepAttendance({ mepId: 'MEP-1' });
      expect(result).toHaveProperty('content');
    });

    it('should accept country filter', async () => {
      const result = await handleTrackMepAttendance({ country: 'SE' });
      expect(result).toHaveProperty('content');
    });

    it('should accept groupId filter', async () => {
      const result = await handleTrackMepAttendance({ groupId: 'EPP' });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid country code', async () => {
      await expect(handleTrackMepAttendance({ country: 'invalid' }))
        .rejects.toThrow();
    });

    it('should accept date range', async () => {
      const result = await handleTrackMepAttendance({
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      });
      expect(result).toHaveProperty('content');
    });
  });

  describe('Single MEP Response', () => {
    it('should return single MEP attendance data', async () => {
      const result = await handleTrackMepAttendance({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data).toHaveProperty('scope');
      expect(data.scope).toContain('MEP-1');
      expect(data.records).toHaveLength(1);
      expect(data.records[0]?.attendanceRate).toBe(78);
    });

    it('should include attendance classification', async () => {
      const result = await handleTrackMepAttendance({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data.records[0]).toHaveProperty('category');
      expect(data.records[0]).toHaveProperty('trend');
    });

    it('should include computed attributes', async () => {
      const result = await handleTrackMepAttendance({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data.computedAttributes).toHaveProperty('overallEngagement');
      expect(data.computedAttributes).toHaveProperty('attendanceTrend');
      expect(data.computedAttributes).toHaveProperty('absenteeismRisk');
    });
  });

  describe('Group Response', () => {
    it('should return multiple MEP attendance records', async () => {
      const result = await handleTrackMepAttendance({});
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data.records.length).toBeGreaterThan(0);
      expect(data.summary).toHaveProperty('totalMEPs');
      expect(data.summary).toHaveProperty('averageAttendance');
    });

    it('should include summary statistics', async () => {
      const result = await handleTrackMepAttendance({});
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data.summary).toHaveProperty('highAttendance');
      expect(data.summary).toHaveProperty('mediumAttendance');
      expect(data.summary).toHaveProperty('lowAttendance');
    });

    it('should sort records by attendance rate descending', async () => {
      const result = await handleTrackMepAttendance({});
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      if (data.records.length > 1) {
        for (let i = 1; i < data.records.length; i++) {
          expect(data.records[i - 1].attendanceRate)
            .toBeGreaterThanOrEqual(data.records[i].attendanceRate);
        }
      }
    });
  });

  describe('Response Format', () => {
    it('should include methodology and confidence', async () => {
      const result = await handleTrackMepAttendance({ mepId: 'MEP-1' });
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data).toHaveProperty('confidenceLevel');
      expect(data).toHaveProperty('methodology');
      expect(data.methodology).toContain('European Parliament');
    });

    it('should include period in response', async () => {
      const result = await handleTrackMepAttendance({
        mepId: 'MEP-1',
        dateFrom: '2024-01-01',
        dateTo: '2024-06-30'
      });
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data.period.from).toBe('2024-01-01');
      expect(data.period.to).toBe('2024-06-30');
    });
  });

  describe('Error Handling', () => {
    it('should propagate API errors for single MEP', async () => {
      vi.mocked(epClientModule.epClient.getMEPDetails).mockRejectedValue(
        new Error('MEP not found')
      );

      await expect(handleTrackMepAttendance({ mepId: 'INVALID' }))
        .rejects.toThrow('MEP not found');
    });

    it('should handle partial failures in group query', async () => {
      vi.mocked(epClientModule.epClient.getMEPDetails)
        .mockResolvedValueOnce({
          id: 'MEP-1',
          name: 'Test MEP',
          country: 'SE',
          politicalGroup: 'EPP',
          committees: ['ENVI'],
          active: true,
          termStart: '2019-07-02',
          votingStatistics: {
            totalVotes: 500,
            votesFor: 300,
            votesAgainst: 150,
            abstentions: 50,
            attendanceRate: 85
          }
        })
        .mockRejectedValueOnce(new Error('MEP not found'));

      const result = await handleTrackMepAttendance({});
      const data = JSON.parse(result.content[0]?.text ?? '{}');

      // Should still return results for the successful MEP
      expect(data.records.length).toBe(1);
    });
  });
});
