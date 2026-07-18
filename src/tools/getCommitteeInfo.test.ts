/**
 * Tests for get_committee_info MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetCommitteeInfo } from './getCommitteeInfo.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';
import * as weeklyCacheModule from '../utils/weeklyDataCache.js';
import * as auditLoggerModule from '../utils/auditLogger.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getCommitteeInfo: vi.fn(),
    getCurrentCorporateBodies: vi.fn()
  }
}));

vi.mock('../utils/weeklyDataCache.js', () => ({
  loadWeeklyCorporateBodiesCache: vi.fn(),
  loadWeeklyMEPCache: vi.fn(),
}));

vi.mock('../utils/auditLogger.js', () => ({
  auditLogger: {
    logDataAccess: vi.fn(),
  },
}));

describe('get_committee_info Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementation
    vi.mocked(epClientModule.epClient.getCommitteeInfo).mockResolvedValue({
      id: 'ENVI',
      name: 'Committee on Environment, Public Health and Food Safety',
      abbreviation: 'ENVI',
      members: ['person/124810', 'person/124811'],
      chair: 'person/124810',
      viceChairs: ['person/124811'],
      responsibilities: ['COMMITTEE_PARLIAMENTARY_STANDING']
    });
    vi.mocked(weeklyCacheModule.loadWeeklyCorporateBodiesCache).mockResolvedValue(null);
    vi.mocked(weeklyCacheModule.loadWeeklyMEPCache).mockResolvedValue(null);
  });

  describe('Input Validation', () => {
    it('should accept valid committee abbreviation', async () => {
      const result = await handleGetCommitteeInfo({ abbreviation: 'ENVI' });
      expect(result).toHaveProperty('content');
      expect(result.content[0]?.type).toBe('text');
    });

    it('should accept valid committee ID', async () => {
      const result = await handleGetCommitteeInfo({ id: 'COMMITTEE-001' });
      expect(result).toHaveProperty('content');
    });

    it('should accept both ID and abbreviation', async () => {
      const result = await handleGetCommitteeInfo({ 
        id: 'COMMITTEE-001',
        abbreviation: 'ENVI'
      });
      expect(result).toHaveProperty('content');
    });

    it('should reject abbreviation that is too long', async () => {
      const longAbbr = 'A'.repeat(21);
      await expect(handleGetCommitteeInfo({ abbreviation: longAbbr }))
        .rejects.toThrow();
    });

    it('should reject ID that is too long', async () => {
      const longId = 'A'.repeat(101);
      await expect(handleGetCommitteeInfo({ id: longId }))
        .rejects.toThrow();
    });

    it('should reject non-string abbreviation', async () => {
      await expect(handleGetCommitteeInfo({ abbreviation: 123 }))
        .rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const result = await handleGetCommitteeInfo({ abbreviation: 'ENVI' });

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const result = await handleGetCommitteeInfo({ abbreviation: 'ENVI' });
      const text = result.content[0]?.text;

      expect(() => {
        const parsed: unknown = JSON.parse(text ?? '');
        return parsed;
      }).not.toThrow();
    });

    it('should include required committee fields', async () => {
      const result = await handleGetCommitteeInfo({ abbreviation: 'ENVI' });
      const text = result.content[0]?.text ?? '{}';
      const committee: unknown = JSON.parse(text);

      if (typeof committee === 'object' && committee !== null) {
        expect(committee).toHaveProperty('id');
        expect(committee).toHaveProperty('name');
        expect(committee).toHaveProperty('abbreviation');
        expect(committee).toHaveProperty('members');
      }
    });

    it.each(['ECON', 'ENVI'])(
      'should preserve full current membership records for %s',
      async (abbreviation) => {
        vi.mocked(epClientModule.epClient.getCommitteeInfo).mockResolvedValueOnce({
          id: `org/${abbreviation}`,
          name: `Committee ${abbreviation}`,
          abbreviation,
          members: ['person/124810'],
          memberships: [{
            member: 'person/124810',
            id: 'membership/124810-f-100',
            type: 'Membership',
            identifier: '124810-f-100',
            notation_codictFunctionId: '100',
            memberDuring: {
              id: 'time-period/20240716',
              type: 'PeriodOfTime',
              startDate: '2024-07-16',
            },
            organization: `org/${abbreviation}`,
            role: 'def/ep-roles/MEMBER',
            membershipClassification: 'def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING',
            contactPoint: [{ email: 'public@example.eu' }],
          }],
          responsibilities: ['COMMITTEE_PARLIAMENTARY_STANDING'],
        });

        const result = await handleGetCommitteeInfo({ abbreviation });
        const committee = JSON.parse(result.content[0]?.text ?? '{}') as Record<string, unknown>;

        expect(committee['memberships']).toEqual([
          expect.objectContaining({
            member: 'person/124810',
            notation_codictFunctionId: '100',
            organization: `org/${abbreviation}`,
            role: 'def/ep-roles/MEMBER',
            contactPoint: [{ email: 'public@example.eu' }],
          }),
        ]);
      },
    );
  });

  describe('Error Handling', () => {
    it('should handle invalid input gracefully', async () => {
      await expect(handleGetCommitteeInfo({ abbreviation: 123 }))
        .rejects.toThrow();
    });

    it('should provide clean error messages', async () => {
      try {
        await handleGetCommitteeInfo({ abbreviation: '' });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const err = error as Error;
        expect(err.message).toBeTruthy();
      }
    });

    it('should not expose internal errors', async () => {
      const spy = vi.spyOn(epClientModule.epClient, 'getCommitteeInfo')
        .mockRejectedValueOnce(new Error('Database connection failed'));

      try {
        await handleGetCommitteeInfo({ abbreviation: 'ENVI' });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const err = error as Error;
        expect(err.message).toContain('Failed to retrieve committee information');
      }

      spy.mockRestore();
    });
  });

  describe('showCurrent branch', () => {
    it('should use weekly cache by default when available', async () => {
      vi.mocked(weeklyCacheModule.loadWeeklyCorporateBodiesCache).mockResolvedValueOnce({
        metadata: {
          schemaVersion: 1,
          generatedAt: '2026-01-01T00:00:00.000Z',
          weekKey: '2026-W01',
          source: 'test',
        },
        corporateBodies: [
          {
            id: 'ENVI',
            name: 'Cached Committee',
            abbreviation: 'ENVI',
            members: [],
            responsibilities: [],
          },
        ],
      });

      const result = await handleGetCommitteeInfo({ abbreviation: 'ENVI' });
      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as { name?: string };
      expect(parsed.name).toBe('Cached Committee');
      expect(epClientModule.epClient.getCommitteeInfo).not.toHaveBeenCalled();
      expect(auditLoggerModule.auditLogger.logDataAccess).toHaveBeenCalledWith(
        'get_committee_info',
        { id: undefined, abbreviation: 'ENVI' },
        1,
      );
    });

    it('should derive current committee roster when listing and detail IDs differ', async () => {
      vi.mocked(weeklyCacheModule.loadWeeklyCorporateBodiesCache).mockResolvedValueOnce({
        metadata: {
          schemaVersion: 1,
          generatedAt: '2026-07-13T00:00:00.000Z',
          weekKey: '2026-W29',
          source: 'test',
        },
        corporateBodies: [{
          id: '6570',
          name: 'Committee on Economic and Monetary Affairs',
          abbreviation: 'ECON',
          members: [],
          responsibilities: ['COMMITTEE_PARLIAMENTARY_STANDING'],
        }],
        corporateBodyDetails: {
          '6570': {
            id: '1237',
            name: 'Committee on Economic and Monetary Affairs',
            abbreviation: 'ECON',
            members: [],
            responsibilities: ['COMMITTEE_PARLIAMENTARY_STANDING'],
          },
        },
      });
      vi.mocked(weeklyCacheModule.loadWeeklyMEPCache).mockResolvedValueOnce({
        metadata: {
          schemaVersion: 1,
          generatedAt: '2026-07-17T00:00:00.000Z',
          weekKey: '2026-W29',
          source: 'test',
        },
        meps: [
          { id: 'person/1', name: 'Chair', country: 'SE', politicalGroup: 'EPP', committees: [], active: true, termStart: '' },
          { id: 'person/2', name: 'Vice Chair', country: 'DE', politicalGroup: 'S&D', committees: [], active: true, termStart: '' },
          { id: 'person/3', name: 'Member', country: 'FR', politicalGroup: 'Renew', committees: [], active: true, termStart: '' },
          { id: 'person/4', name: 'Substitute', country: 'FI', politicalGroup: 'Renew', committees: [], active: true, termStart: '' },
        ],
        mepDetails: {
          'person/1': {
            id: 'person/1', name: 'Chair', country: 'SE', politicalGroup: 'EPP', committees: [], active: true, termStart: '',
            hasMembership: [{             organization: 'org/6570', role: 'def/ep-roles/CHAIR', membershipClassification: 'def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING', contactPoint: [] }],
          },
          'person/2': {
            id: 'person/2', name: 'Vice Chair', country: 'DE', politicalGroup: 'S&D', committees: [], active: true, termStart: '',
            hasMembership: [{             organization: 'org/6570', role: 'def/ep-roles/CHAIR_VICE', membershipClassification: 'def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING', contactPoint: [] }],
          },
          'person/3': {
            id: 'person/3', name: 'Member', country: 'FR', politicalGroup: 'Renew', committees: [], active: true, termStart: '',
            hasMembership: [{             organization: 'org/6570', role: 'def/ep-roles/MEMBER', membershipClassification: 'def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING', contactPoint: [] }],
          },
          'person/4': {
            id: 'person/4', name: 'Substitute', country: 'FI', politicalGroup: 'Renew', committees: [], active: true, termStart: '',
            hasMembership: [{             organization: 'org/6570', role: 'def/ep-roles/MEMBER_SUBSTITUTE', membershipClassification: 'def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING', contactPoint: [] }],
          },
        },
      });

      const result = await handleGetCommitteeInfo({ abbreviation: 'ECON' });
      const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
        members: string[];
        memberships: Array<{ member: string; role?: string }>;
        chair?: string;
        viceChairs?: string[];
      };

      expect(parsed.members).toEqual(['person/1', 'person/2', 'person/3']);
      expect(parsed.chair).toBe('person/1');
      expect(parsed.viceChairs).toEqual(['person/2']);
      expect(parsed.memberships).toHaveLength(4);
      expect(parsed.memberships).toContainEqual(expect.objectContaining({
        member: 'person/4',
        role: 'def/ep-roles/MEMBER_SUBSTITUTE',
      }));
      expect(epClientModule.epClient.getCommitteeInfo).not.toHaveBeenCalled();
    });

    it('should bypass cache when live=true', async () => {
      await handleGetCommitteeInfo({ abbreviation: 'ENVI', live: true });
      expect(epClientModule.epClient.getCommitteeInfo).toHaveBeenCalled();
    });

    it('should call getCurrentCorporateBodies when showCurrent is true', async () => {
      const mockBodies = {
        data: [
          { id: 'ENVI', name: 'Committee on Environment', abbreviation: 'ENVI', members: [], responsibilities: [] },
          { id: 'ITRE', name: 'Committee on Industry', abbreviation: 'ITRE', members: [], responsibilities: [] }
        ],
        total: 2,
        limit: 50,
        offset: 0,
        hasMore: false
      };
      vi.mocked(epClientModule.epClient.getCurrentCorporateBodies).mockResolvedValue(mockBodies);

      const result = await handleGetCommitteeInfo({ showCurrent: true });
      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text) as Record<string, unknown>;
      expect(parsed).toHaveProperty('data');
      expect(Array.isArray(parsed.data)).toBe(true);
    });

    it('should use a current-scoped weekly cache for showCurrent', async () => {
      vi.mocked(weeklyCacheModule.loadWeeklyCorporateBodiesCache).mockResolvedValueOnce({
        metadata: {
          schemaVersion: 2,
          generatedAt: '2026-07-18T00:00:00.000Z',
          weekKey: '2026-W29',
          source: 'test',
          dataset: 'corporate-bodies',
          scope: 'current',
        },
        corporateBodies: [{
          id: '7913',
          name: 'Environment Committee',
          abbreviation: 'ENVI',
          members: [],
          responsibilities: ['COMMITTEE_PARLIAMENTARY_STANDING'],
        }],
      });

      const result = await handleGetCommitteeInfo({ showCurrent: true });
      const parsed = JSON.parse(result.content[0].text) as { data: Array<{ id: string }> };

      expect(parsed.data).toEqual([expect.objectContaining({ id: '7913' })]);
      expect(epClientModule.epClient.getCurrentCorporateBodies).not.toHaveBeenCalled();
    });

    it('should fall back to the API for a legacy cache without current scope', async () => {
      vi.mocked(weeklyCacheModule.loadWeeklyCorporateBodiesCache).mockResolvedValueOnce({
        metadata: {
          schemaVersion: 1,
          generatedAt: '2026-01-01T00:00:00.000Z',
          weekKey: '2026-W01',
          source: 'test',
        },
        corporateBodies: [
          {
            id: 'HIST',
            name: 'Historical Body',
            abbreviation: 'HIST',
            members: [],
            responsibilities: [],
          },
        ],
      });
      vi.mocked(epClientModule.epClient.getCurrentCorporateBodies).mockResolvedValue({
        data: [
          { id: 'ENVI', name: 'Current Body', abbreviation: 'ENVI', members: [], responsibilities: [] },
        ],
        total: 1,
        limit: 50,
        offset: 0,
        hasMore: false,
      });

      const result = await handleGetCommitteeInfo({ showCurrent: true });
      const parsed = JSON.parse(result.content[0].text) as { data: Array<{ id: string }> };
      expect(parsed.data[0]?.id).toBe('ENVI');
      expect(epClientModule.epClient.getCurrentCorporateBodies).toHaveBeenCalledTimes(1);
    });
  });
});
