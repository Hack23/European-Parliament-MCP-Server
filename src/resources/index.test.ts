/**
 * Tests for MCP Resources
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getResourceTemplateArray, handleReadResource, parseResourceUri } from './index.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getMEPs: vi.fn().mockResolvedValue({
      data: [
        { id: '124936', name: 'Test MEP', country: 'SE', politicalGroup: 'EPP' },
        { id: '124937', name: 'Test MEP 2', country: 'DE', politicalGroup: 'S&D' }
      ],
      total: 2,
      limit: 50,
      offset: 0,
      hasMore: false
    }),
    getMEPDetails: vi.fn().mockResolvedValue({
      id: '124936',
      name: 'Test MEP',
      country: 'SE',
      politicalGroup: 'EPP',
      committees: ['ENVI'],
      active: true,
      termStart: '2024-07-16'
    }),
    getCommitteeInfo: vi.fn().mockResolvedValue({
      id: 'ENVI',
      name: 'Environment, Public Health and Food Safety',
      abbreviation: 'ENVI',
      members: ['124936']
    }),
    getPlenarySessions: vi.fn().mockResolvedValue({
      data: [{ id: 'session-1', date: '2024-01-15', location: 'Strasbourg' }],
      total: 1,
      limit: 20,
      offset: 0,
      hasMore: false
    }),
    getVotingRecords: vi.fn().mockResolvedValue({
      data: [{ id: 'vote-1', sessionId: 'session-1', topic: 'Test' }],
      total: 1,
      limit: 50,
      offset: 0,
      hasMore: false
    }),
    getProcedureById: vi.fn().mockResolvedValue({
      id: '2024-0006',
      title: 'Test Procedure',
      status: 'in progress'
    }),
    getMeetingById: vi.fn().mockResolvedValue({
      id: 'session-1',
      date: '2024-01-15',
      location: 'Strasbourg'
    }),
    getDocumentById: vi.fn().mockResolvedValue({
      id: 'A-9-2024-0001',
      title: 'Test Document',
      type: 'REPORT'
    })
  }
}));

describe('MCP Resources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getResourceTemplateArray', () => {
    it('should return all resource templates', () => {
      const templates = getResourceTemplateArray();

      expect(templates).toBeDefined();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBe(9);
    });

    it('should have required metadata fields', () => {
      const templates = getResourceTemplateArray();

      for (const template of templates) {
        expect(template).toHaveProperty('uriTemplate');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('mimeType');
        expect(template.mimeType).toBe('application/json');
      }
    });

    it('should include expected URI templates', () => {
      const templates = getResourceTemplateArray();
      const uris = templates.map(t => t.uriTemplate);

      expect(uris).toContain('ep://meps/{mepId}');
      expect(uris).toContain('ep://meps');
      expect(uris).toContain('ep://committees/{committeeId}');
      expect(uris).toContain('ep://plenary-sessions');
      expect(uris).toContain('ep://votes/{sessionId}');
      expect(uris).toContain('ep://political-groups');
      expect(uris).toContain('ep://procedures/{procedureId}');
      expect(uris).toContain('ep://plenary/{plenaryId}');
      expect(uris).toContain('ep://documents/{documentId}');
    });
  });

  describe('parseResourceUri', () => {
    it('should parse MEP detail URI', () => {
      const result = parseResourceUri('ep://meps/124936');

      expect(result.template).toBe('mep_detail');
      expect(result.params['mepId']).toBe('124936');
    });

    it('should parse MEP list URI', () => {
      const result = parseResourceUri('ep://meps');

      expect(result.template).toBe('mep_list');
    });

    it('should parse committee detail URI', () => {
      const result = parseResourceUri('ep://committees/ENVI');

      expect(result.template).toBe('committee_detail');
      expect(result.params['committeeId']).toBe('ENVI');
    });

    it('should parse plenary sessions URI', () => {
      const result = parseResourceUri('ep://plenary-sessions');

      expect(result.template).toBe('plenary_sessions');
    });

    it('should parse voting record URI', () => {
      const result = parseResourceUri('ep://votes/session-1');

      expect(result.template).toBe('voting_record');
      expect(result.params['sessionId']).toBe('session-1');
    });

    it('should parse political groups URI', () => {
      const result = parseResourceUri('ep://political-groups');

      expect(result.template).toBe('political_groups');
    });

    it('should parse procedure detail URI', () => {
      const result = parseResourceUri('ep://procedures/2024-0006');

      expect(result.template).toBe('procedure_detail');
      expect(result.params['procedureId']).toBe('2024-0006');
    });

    it('should parse plenary detail URI', () => {
      const result = parseResourceUri('ep://plenary/session-42');

      expect(result.template).toBe('plenary_detail');
      expect(result.params['plenaryId']).toBe('session-42');
    });

    it('should parse document detail URI', () => {
      const result = parseResourceUri('ep://documents/A-9-2024-0001');

      expect(result.template).toBe('document_detail');
      expect(result.params['documentId']).toBe('A-9-2024-0001');
    });

    it('should throw for invalid scheme', () => {
      expect(() => parseResourceUri('http://meps/123')).toThrow('Invalid resource URI scheme');
    });

    it('should throw for unknown resource', () => {
      expect(() => parseResourceUri('ep://unknown/123')).toThrow('Unknown resource URI');
    });

    it('should throw for empty path', () => {
      expect(() => parseResourceUri('ep://')).toThrow('Invalid resource URI');
    });
  });

  describe('handleReadResource', () => {
    it('should read MEP detail resource', async () => {
      const result = await handleReadResource('ep://meps/124936');

      expect(result).toHaveProperty('contents');
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0]?.uri).toBe('ep://meps/124936');
      expect(result.contents[0]?.mimeType).toBe('application/json');

      const data = JSON.parse(result.contents[0]?.text ?? '{}');
      expect(data._source).toBe('European Parliament Open Data Portal');
      expect(data._accessedAt).toBeDefined();
    });

    it('should read MEP list resource', async () => {
      const result = await handleReadResource('ep://meps');

      expect(result.contents).toHaveLength(1);
      expect(result.contents[0]?.uri).toBe('ep://meps');
    });

    it('should read committee resource', async () => {
      const result = await handleReadResource('ep://committees/ENVI');

      expect(result.contents).toHaveLength(1);
      expect(result.contents[0]?.uri).toBe('ep://committees/ENVI');
    });

    it('should read plenary sessions resource', async () => {
      const result = await handleReadResource('ep://plenary-sessions');

      expect(result.contents).toHaveLength(1);
      expect(result.contents[0]?.uri).toBe('ep://plenary-sessions');
    });

    it('should read voting record resource', async () => {
      const result = await handleReadResource('ep://votes/session-1');

      expect(result.contents).toHaveLength(1);
      expect(result.contents[0]?.uri).toBe('ep://votes/session-1');
    });

    it('should read political groups resource', async () => {
      const result = await handleReadResource('ep://political-groups');

      expect(result.contents).toHaveLength(1);

      const data = JSON.parse(result.contents[0]?.text ?? '{}');
      expect(data).toHaveProperty('politicalGroups');
      expect(Array.isArray(data.politicalGroups)).toBe(true);
    });

    it('should throw for invalid URI', async () => {
      await expect(handleReadResource('invalid://uri')).rejects.toThrow();
    });

    it('should throw for unknown resource type', async () => {
      await expect(handleReadResource('ep://unknown')).rejects.toThrow();
    });

    it('should validate MEP ID input', async () => {
      await expect(handleReadResource('ep://meps/')).rejects.toThrow();
    });

    it('should read procedure detail resource', async () => {
      const result = await handleReadResource('ep://procedures/2024-0006');

      expect(result.contents).toHaveLength(1);
      expect(result.contents[0]?.uri).toBe('ep://procedures/2024-0006');
      expect(result.contents[0]?.mimeType).toBe('application/json');
      const data = JSON.parse(result.contents[0]?.text ?? '{}');
      expect(data._source).toBe('European Parliament Open Data Portal');
      expect(data.id).toBe('2024-0006');
    });

    it('should read plenary detail resource', async () => {
      const result = await handleReadResource('ep://plenary/session-1');

      expect(result.contents).toHaveLength(1);
      expect(result.contents[0]?.uri).toBe('ep://plenary/session-1');
      const data = JSON.parse(result.contents[0]?.text ?? '{}');
      expect(data.plenaryId).toBe('session-1');
      expect(data.session).toBeDefined();
      expect(data._source).toBe('European Parliament Open Data Portal');
    });

    it('should read document detail resource', async () => {
      const result = await handleReadResource('ep://documents/A-9-2024-0001');

      expect(result.contents).toHaveLength(1);
      expect(result.contents[0]?.uri).toBe('ep://documents/A-9-2024-0001');
      const data = JSON.parse(result.contents[0]?.text ?? '{}');
      expect(data._source).toBe('European Parliament Open Data Portal');
      expect(data.id).toBe('A-9-2024-0001');
    });

    it('should reject procedure IDs that do not match YYYY-NNNN format', async () => {
      await expect(handleReadResource('ep://procedures/COD/2024/0001')).rejects.toThrow();
      await expect(handleReadResource('ep://procedures/invalid')).rejects.toThrow();
    });
  });
});
