/**
 * Tests for European Parliament API Client
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EuropeanParliamentClient, APIError } from './europeanParliamentClient.js';

// Mock the undici fetch
vi.mock('undici', () => ({
  fetch: vi.fn()
}));

import { fetch } from 'undici';
const mockFetch = fetch as ReturnType<typeof vi.fn>;

describe('EuropeanParliamentClient', () => {
  let client: EuropeanParliamentClient;

  beforeEach(() => {
    client = new EuropeanParliamentClient();
    client.clearCache();
    vi.clearAllMocks();
  });

  // Helper to create mock API responses
  const createMockMEPsResponse = (count: number = 2) => ({
    data: Array.from({ length: count }, (_, i) => ({
      id: `person/${i + 1}`,
      type: 'Person',
      identifier: String(i + 1),
      label: `Test MEP ${i + 1}`,
      familyName: `LastName${i + 1}`,
      givenName: `FirstName${i + 1}`,
      sortLabel: `LASTNAME${i + 1}`
    })),
    '@context': [
      {
        data: '@graph',
        '@base': 'https://data.europarl.europa.eu/'
      },
      'https://data.europarl.europa.eu/api/v2/context.jsonld'
    ]
  });

  const createMockMeetingsResponse = (count: number = 1) => ({
    data: Array.from({ length: count }, (_, i) => ({
      id: `eli/dl/event/MTG-PL-2024-01-${10 + i}`,
      type: 'Activity',
      'eli-dl:activity_date': {
        '@value': `2024-01-${10 + i}T00:00:00+01:00`,
        type: 'xsd:dateTime'
      },
      activity_id: `MTG-PL-2024-01-${10 + i}`,
      activity_label: {
        en: `Meeting ${i + 1}`
      },
      hasLocality: 'http://publications.europa.eu/resource/authority/place/FRA_SXB'
    })),
    '@context': [
      {
        data: '@graph',
        '@base': 'https://data.europarl.europa.eu/'
      },
      'https://data.europarl.europa.eu/api/v2/context.jsonld'
    ]
  });

  describe('Initialization', () => {
    it('should create client with default config', () => {
      const client = new EuropeanParliamentClient();
      expect(client).toBeDefined();
    });

    it('should create client with custom config', () => {
      const client = new EuropeanParliamentClient({
        baseURL: 'https://custom.api.eu/',
        cacheTTL: 5000,
        maxCacheSize: 100
      });
      expect(client).toBeDefined();
    });
  });

  describe('getMEPs', () => {
    it('should return paginated MEP data', async () => {
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockMEPsResponse(10)
      } as Response);

      const result = await client.getMEPs({ limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('limit', 10);
      expect(result).toHaveProperty('offset', 0);
      expect(result).toHaveProperty('hasMore');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(10);
    });

    it('should respect country filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockMEPsResponse(2)
      } as Response);

      const result = await client.getMEPs({ country: 'SE' });
      
      expect(result.data).toBeDefined();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('country-code=SE'),
        expect.any(Object)
      );
    });

    it('should respect limit parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockMEPsResponse(25)
      } as Response);

      const result = await client.getMEPs({ limit: 25 });
      
      expect(result.limit).toBe(25);
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response);

      await expect(client.getMEPs({ limit: 10 })).rejects.toThrow(APIError);
    });

    it('should use cache for repeated requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockMEPsResponse(2)
      } as Response);

      // First request
      await client.getMEPs({ limit: 10 });
      
      // Second request should use cache
      await client.getMEPs({ limit: 10 });
      
      // Fetch should only be called once
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getMEPDetails', () => {
    it('should return detailed MEP information', async () => {
      // Mock successful API response for MEP details
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{
            id: 'person/124810',
            type: 'Person',
            identifier: '124810',
            label: 'Test MEP',
            familyName: 'Testson',
            givenName: 'Test',
            bday: '1970-01-01',
            hasMembership: []
          }],
          '@context': [
            { data: '@graph', '@base': 'https://data.europarl.europa.eu/' },
            'https://data.europarl.europa.eu/api/v2/context.jsonld'
          ]
        })
      } as Response);

      const result = await client.getMEPDetails('MEP-124810');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('country');
      expect(result).toHaveProperty('politicalGroup');
      expect(result).toHaveProperty('votingStatistics');
    });

    it('should include voting statistics', async () => {
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{
            id: 'person/124810',
            identifier: '124810',
            label: 'Test MEP',
            familyName: 'Testson',
            givenName: 'Test',
            bday: '1970-01-01'
          }],
          '@context': []
        })
      } as Response);

      const result = await client.getMEPDetails('MEP-124810');

      expect(result.votingStatistics).toBeDefined();
      expect(result.votingStatistics?.totalVotes).toBeGreaterThanOrEqual(0);
      expect(result.votingStatistics?.attendanceRate).toBeGreaterThanOrEqual(0);
      expect(result.votingStatistics?.attendanceRate).toBeLessThanOrEqual(100);
    });
  });

  describe('getPlenarySessions', () => {
    it('should return paginated session data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockMeetingsResponse(10)
      } as Response);

      const result = await client.getPlenarySessions({ limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should include session details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockMeetingsResponse(1)
      } as Response);

      const result = await client.getPlenarySessions({ limit: 10 });

      if (result.data.length > 0) {
        const session = result.data[0];
        expect(session).toHaveProperty('id');
        expect(session).toHaveProperty('date');
        expect(session).toHaveProperty('location');
        expect(session).toHaveProperty('agendaItems');
      }
    });

    it('should transform location correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockMeetingsResponse(1)
      } as Response);

      const result = await client.getPlenarySessions({ limit: 1 });

      expect(result.data[0]?.location).toBe('Strasbourg');
    });
  });

  describe('getVotingRecords', () => {
    it('should return paginated voting records', async () => {
      const result = await client.getVotingRecords({ limit: 10 });

      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should include vote counts', async () => {
      const result = await client.getVotingRecords({ limit: 10 });

      if (result.data.length > 0) {
        const vote = result.data[0];
        expect(vote).toHaveProperty('votesFor');
        expect(vote).toHaveProperty('votesAgainst');
        expect(vote).toHaveProperty('abstentions');
        expect(vote).toHaveProperty('result');
      }
    });
  });

  describe('searchDocuments', () => {
    it('should search documents by keyword', async () => {
      const result = await client.searchDocuments({
        keyword: 'climate',
        limit: 10
      });

      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should include document metadata', async () => {
      const result = await client.searchDocuments({
        keyword: 'climate',
        limit: 10
      });

      if (result.data.length > 0) {
        const doc = result.data[0];
        expect(doc).toHaveProperty('id');
        expect(doc).toHaveProperty('title');
        expect(doc).toHaveProperty('type');
        expect(doc).toHaveProperty('date');
      }
    });
  });

  describe('getCommitteeInfo', () => {
    it('should return committee details', async () => {
      const result = await client.getCommitteeInfo({ abbreviation: 'ENVI' });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('abbreviation');
      expect(result).toHaveProperty('members');
    });

    it('should include committee composition', async () => {
      const result = await client.getCommitteeInfo({ id: 'COMM-ENVI' });

      expect(result.members).toBeDefined();
      expect(Array.isArray(result.members)).toBe(true);
    });
  });

  describe('getParliamentaryQuestions', () => {
    it('should return paginated questions', async () => {
      const result = await client.getParliamentaryQuestions({ limit: 10 });

      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should include question details', async () => {
      const result = await client.getParliamentaryQuestions({ limit: 10 });

      if (result.data.length > 0) {
        const question = result.data[0];
        expect(question).toHaveProperty('id');
        expect(question).toHaveProperty('type');
        expect(question).toHaveProperty('author');
        expect(question).toHaveProperty('questionText');
        expect(question).toHaveProperty('status');
      }
    });
  });

  describe('Caching', () => {
    it('should cache API responses', async () => {
      // Mock API response
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => createMockMEPsResponse(2)
      } as Response);

      // First call
      const result1 = await client.getMEPs({ country: 'SE', limit: 10 });
      
      // Second call with same params should be cached
      const result2 = await client.getMEPs({ country: 'SE', limit: 10 });
      
      expect(result1).toEqual(result2);
      // Should only call fetch once due to caching
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should provide cache statistics', () => {
      const stats = client.getCacheStats();
      
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('maxSize');
      expect(stats).toHaveProperty('hitRate');
    });

    it('should clear cache', async () => {
      // Mock API response
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => createMockMEPsResponse(2)
      } as Response);

      // First call should populate cache
      await client.getMEPs({ limit: 10 });
      
      // Clear cache
      client.clearCache();
      
      // After clear, cache should be empty
      const stats = client.getCacheStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should throw APIError for invalid requests', async () => {
      // Create client with retry disabled for this test
      const clientNoRetry = new EuropeanParliamentClient({
        enableRetry: false
      });
      
      // Mock failed response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response);

      await expect(clientNoRetry.getMEPs({ limit: 10 })).rejects.toThrow(APIError);
    });
  });

  describe('Edge Cases - Data Transformation', () => {
    it('should handle missing fields in MEP data', async () => {
      // Mock response with minimal fields
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{
            // Only minimal fields
          }],
          '@context': []
        })
      } as Response);

      const result = await client.getMEPs({ limit: 1 });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBeDefined();
      expect(result.data[0].name).toBeDefined();
    });

    it('should handle MEP with no identifier', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{
            label: 'Test MEP',
            familyName: 'Doe',
            givenName: 'John'
          }],
          '@context': []
        })
      } as Response);

      const result = await client.getMEPs({ limit: 1 });
      expect(result.data[0].id).toContain('person/');
      expect(result.data[0].name).toBe('Test MEP');
    });

    it('should construct name from givenName and familyName when label missing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{
            identifier: '123',
            familyName: 'Smith',
            givenName: 'Jane'
          }],
          '@context': []
        })
      } as Response);

      const result = await client.getMEPs({ limit: 1 });
      expect(result.data[0].name).toBe('Jane Smith');
    });

    it('should handle plenary session with missing activity date', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{
            activity_id: 'session-1',
            label: 'Test Session',
            hasLocality: 'http://example.com/FRA_SXB'
            // No eli-dl:activity_date field
          }],
          '@context': []
        })
      } as Response);

      const result = await client.getPlenarySessions({ limit: 1 });
      expect(result.data[0].date).toBe('');
    });

    it('should handle plenary session with null activity date', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{
            activity_id: 'session-1',
            label: 'Test Session',
            hasLocality: 'http://example.com/BEL_BRU',
            'eli-dl:activity_date': null
          }],
          '@context': []
        })
      } as Response);

      const result = await client.getPlenarySessions({ limit: 1 });
      expect(result.data[0].date).toBe('');
      expect(result.data[0].location).toBe('Brussels');
    });

    it('should handle location with unknown locality', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{
            activity_id: 'session-1',
            label: 'Test Session',
            hasLocality: 'http://example.com/OTHER_CITY'
          }],
          '@context': []
        })
      } as Response);

      const result = await client.getPlenarySessions({ limit: 1 });
      expect(result.data[0].location).toBe('Unknown');
    });

    it('should handle MEP details with missing birth date', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{
            identifier: '123',
            label: 'Test MEP',
            familyName: 'Doe',
            givenName: 'John'
            // No bday field
          }],
          '@context': []
        })
      } as Response);

      const result = await client.getMEPDetails('123');
      expect(result.biography).toBe('Born: Unknown');
    });

    it('should handle MEP details with null organization in membership', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{
            identifier: '123',
            label: 'Test MEP',
            familyName: 'Doe',
            givenName: 'John',
            hasMembership: [
              { organization: null },
              { organization: '' }
            ]
          }],
          '@context': []
        })
      } as Response);

      const result = await client.getMEPDetails('123');
      // With null/empty organizations, should fall back to empty committees array from transformMEP
      expect(result.committees).toEqual([]);
    });

    it('should normalize MEP ID by stripping MEP- prefix', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{
            identifier: '124810',
            label: 'Test MEP'
          }],
          '@context': []
        })
      } as Response);

      const result = await client.getMEPDetails('MEP-124810');
      expect(result).toBeDefined();
      
      // Verify the normalized ID (124810) was used in the URL
      expect(mockFetch).toHaveBeenCalledWith(
        'https://data.europarl.europa.eu/api/v2/meps/124810',
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: 'application/ld+json'
          })
        })
      );
    });

    it('should normalize MEP ID by extracting from person/ format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{
            identifier: '124810',
            label: 'Test MEP'
          }],
          '@context': []
        })
      } as Response);

      const result = await client.getMEPDetails('person/124810');
      expect(result).toBeDefined();
      
      // Verify the normalized ID (124810) was used in the URL
      expect(mockFetch).toHaveBeenCalledWith(
        'https://data.europarl.europa.eu/api/v2/meps/124810',
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: 'application/ld+json'
          })
        })
      );
    });
  });
});
