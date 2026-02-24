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

  const createMockVoteResultsResponse = (count: number = 2) => ({
    data: Array.from({ length: count }, (_, i) => ({
      id: `vote-result-${i + 1}`,
      activity_id: `VOTE-2024-${String(i + 1).padStart(3, '0')}`,
      notation: `Vote ${i + 1}`,
      label: `Resolution on topic ${i + 1}`,
      'eli-dl:activity_date': {
        '@value': `2024-01-${String(15 + i)}T14:00:00Z`,
        type: 'xsd:dateTime'
      },
      number_of_votes_favor: 350 + i * 10,
      number_of_votes_against: 100 + i * 5,
      number_of_votes_abstention: 30 + i * 2
    })),
    '@context': [
      { data: '@graph', '@base': 'https://data.europarl.europa.eu/' },
      'https://data.europarl.europa.eu/api/v2/context.jsonld'
    ]
  });

  const createMockDocumentsResponse = (count: number = 2) => ({
    data: Array.from({ length: count }, (_, i) => ({
      id: `doc-${i + 1}`,
      work_id: `A-9-2024-${String(i + 1).padStart(4, '0')}`,
      work_type: 'REPORT_PLENARY',
      title_dcterms: [{ '@language': 'en', '@value': `Climate report ${i + 1}` }],
      work_date_document: `2024-01-${String(10 + i)}`,
      was_attributed_to: 'ENVI',
      status: 'ADOPTED'
    })),
    '@context': [
      { data: '@graph', '@base': 'https://data.europarl.europa.eu/' },
      'https://data.europarl.europa.eu/api/v2/context.jsonld'
    ]
  });

  const createMockCorporateBodyResponse = () => ({
    data: [{
      id: 'org/ENVI',
      body_id: 'ENVI',
      label: [{ '@language': 'en', '@value': 'Committee on Environment, Public Health and Food Safety' }],
      notation: 'ENVI',
      classification: 'COMMITTEE_PARLIAMENTARY_STANDING',
      hasMembership: [
        { person: 'person/124810' },
        { person: 'person/124811' }
      ]
    }],
    '@context': [
      { data: '@graph', '@base': 'https://data.europarl.europa.eu/' },
      'https://data.europarl.europa.eu/api/v2/context.jsonld'
    ]
  });

  const createMockQuestionsResponse = (count: number = 2) => ({
    data: Array.from({ length: count }, (_, i) => ({
      id: `q-${i + 1}`,
      work_id: `E-9-2024-${String(i + 1).padStart(6, '0')}`,
      work_type: 'QUESTION_WRITTEN',
      title_dcterms: [{ '@language': 'en', '@value': `Question about climate policy ${i + 1}` }],
      work_date_document: `2024-01-${String(10 + i)}`,
      was_created_by: `person/12481${i}`,
      was_realized_by: i === 0 ? 'answer-ref' : null
    })),
    '@context': [
      { data: '@graph', '@base': 'https://data.europarl.europa.eu/' },
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
    it('should return paginated voting records with sessionId', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockVoteResultsResponse()
      });

      const result = await client.getVotingRecords({ sessionId: 'MTG-PL-2024-01-15', limit: 10 });

      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should include vote counts', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockVoteResultsResponse()
      });

      const result = await client.getVotingRecords({ sessionId: 'MTG-PL-2024-01-15', limit: 10 });

      if (result.data.length > 0) {
        const vote = result.data[0];
        expect(vote).toHaveProperty('votesFor');
        expect(vote).toHaveProperty('votesAgainst');
        expect(vote).toHaveProperty('abstentions');
        expect(vote).toHaveProperty('result');
      }
    });

    it('should fetch recent meetings when no sessionId given', async () => {
      // First call: meetings list
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockMeetingsResponse(1)
      });
      // Second call: vote results for that meeting
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockVoteResultsResponse()
      });

      const result = await client.getVotingRecords({ limit: 10 });
      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('searchDocuments', () => {
    it('should search documents by keyword', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockDocumentsResponse()
      });

      const result = await client.searchDocuments({
        keyword: 'climate',
        limit: 10
      });

      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should include document metadata', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockDocumentsResponse()
      });

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

    it('should map document types correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockDocumentsResponse()
      });

      const result = await client.searchDocuments({
        keyword: 'climate',
        documentType: 'REPORT',
        limit: 10
      });

      expect(result).toHaveProperty('data');
    });
  });

  describe('getCommitteeInfo', () => {
    it('should return committee details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockCorporateBodyResponse()
      });

      const result = await client.getCommitteeInfo({ abbreviation: 'ENVI' });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('abbreviation');
      expect(result).toHaveProperty('members');
    });

    it('should include committee composition', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockCorporateBodyResponse()
      });

      const result = await client.getCommitteeInfo({ id: 'ENVI' });

      expect(result.members).toBeDefined();
      expect(Array.isArray(result.members)).toBe(true);
    });

    it('should search committees list when body not found by ID', async () => {
      // First call fails (specific body not found)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
        status: 404
      });
      // Second call: list all committees
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockCorporateBodyResponse()
      });

      // The first call throws, then client falls back to list search
      // Since ENVI is in the mock, it should match
      const result = await client.getCommitteeInfo({ abbreviation: 'ENVI' });
      expect(result).toHaveProperty('abbreviation');
    });
  });

  describe('getParliamentaryQuestions', () => {
    it('should return paginated questions', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockQuestionsResponse()
      });

      const result = await client.getParliamentaryQuestions({ limit: 10 });

      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should include question details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockQuestionsResponse()
      });

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

    it('should filter by question type', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockQuestionsResponse()
      });

      const result = await client.getParliamentaryQuestions({ type: 'WRITTEN', limit: 10 });
      expect(result).toHaveProperty('data');
    });

    it('should detect answered status from was_realized_by', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockQuestionsResponse()
      });

      const result = await client.getParliamentaryQuestions({ limit: 10 });
      // First question has was_realized_by set, should be ANSWERED
      if (result.data.length > 0) {
        expect(result.data[0]?.status).toBe('ANSWERED');
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

    it('should retry requests on 5xx errors when retry is enabled', async () => {
      vi.useFakeTimers();
      try {
        // First call fails with 500, second call succeeds
        mockFetch
          .mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error'
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => createMockMEPsResponse(1)
          } as Response);

        const requestPromise = client.getMEPs({ limit: 10 });

        // Advance timers to trigger retry delay
        await vi.runAllTimersAsync();

        const result = await requestPromise;

        expect(result.data).toHaveLength(1);
        // Should have retried once after the initial 5xx
        expect(mockFetch).toHaveBeenCalledTimes(2);
      } finally {
        vi.useRealTimers();
      }
    });

    it('should not retry requests on 4xx errors', async () => {
      // Mock a client error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      } as Response);

      await expect(client.getMEPs({ limit: 10 })).rejects.toThrow(APIError);
      // 4xx errors should not be retried
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should convert TimeoutError to APIError with 408 status code', async () => {
      // Mock TimeoutError directly by rejecting with it
      const { TimeoutError } = await import('../utils/timeout.js');
      mockFetch.mockRejectedValueOnce(new TimeoutError('Request timed out', 10000));

      await expect(client.getMEPs({ limit: 10 })).rejects.toMatchObject({
        name: 'APIError',
        statusCode: 408
      });
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
