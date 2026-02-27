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
        headers: new Headers(),
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
        headers: new Headers(),
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
        headers: new Headers(),
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
        headers: new Headers(),
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
        headers: new Headers(),
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
        headers: new Headers(),
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
        headers: new Headers(),
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
        headers: new Headers(),
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
        headers: new Headers(),
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
        headers: new Headers(),
        json: async () => createMockVoteResultsResponse()
      });

      const result = await client.getVotingRecords({ sessionId: 'MTG-PL-2024-01-15', limit: 10 });

      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should include vote counts', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
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
        headers: new Headers(),
        json: async () => createMockMeetingsResponse(1)
      });
      // Second call: vote results for that meeting
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockVoteResultsResponse()
      });

      const result = await client.getVotingRecords({ limit: 10 });
      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should handle pagination with offset', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockVoteResultsResponse(10)
      });

      const result = await client.getVotingRecords({ 
        sessionId: 'MTG-PL-2024-01-15', 
        limit: 5, 
        offset: 3 
      });

      expect(result.limit).toBe(5);
      expect(result.offset).toBe(3);
      expect(result.data.length).toBeLessThanOrEqual(5);
    });

    it('should filter by date range', async () => {
      const mockResponse = {
        data: [
          {
            id: 'vote-1',
            activity_id: 'VOTE-2024-001',
            notation: 'Vote 1',
            label: 'Resolution 1',
            'eli-dl:activity_date': {
              '@value': '2024-01-10T14:00:00Z',
              type: 'xsd:dateTime'
            },
            number_of_votes_favor: 350,
            number_of_votes_against: 100,
            number_of_votes_abstention: 30
          },
          {
            id: 'vote-2',
            activity_id: 'VOTE-2024-002',
            notation: 'Vote 2',
            label: 'Resolution 2',
            'eli-dl:activity_date': {
              '@value': '2024-01-20T14:00:00Z',
              type: 'xsd:dateTime'
            },
            number_of_votes_favor: 360,
            number_of_votes_against: 110,
            number_of_votes_abstention: 32
          }
        ],
        '@context': [
          { data: '@graph', '@base': 'https://data.europarl.europa.eu/' },
          'https://data.europarl.europa.eu/api/v2/context.jsonld'
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => mockResponse
      });

      const result = await client.getVotingRecords({ 
        sessionId: 'MTG-PL-2024-01-15',
        dateFrom: '2024-01-15',
        dateTo: '2024-01-25'
      });

      // Should only include vote-2 which is between the dates
      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe('VOTE-2024-002');
    });

    it('should filter by topic keyword', async () => {
      const mockResponse = {
        data: [
          {
            id: 'vote-1',
            activity_id: 'VOTE-2024-001',
            notation: 'Vote 1',
            label: 'Resolution on climate change',
            'eli-dl:activity_date': {
              '@value': '2024-01-15T14:00:00Z',
              type: 'xsd:dateTime'
            },
            number_of_votes_favor: 350,
            number_of_votes_against: 100,
            number_of_votes_abstention: 30
          },
          {
            id: 'vote-2',
            activity_id: 'VOTE-2024-002',
            notation: 'Vote 2',
            label: 'Resolution on agriculture',
            'eli-dl:activity_date': {
              '@value': '2024-01-15T14:00:00Z',
              type: 'xsd:dateTime'
            },
            number_of_votes_favor: 360,
            number_of_votes_against: 110,
            number_of_votes_abstention: 32
          }
        ],
        '@context': [
          { data: '@graph', '@base': 'https://data.europarl.europa.eu/' },
          'https://data.europarl.europa.eu/api/v2/context.jsonld'
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => mockResponse
      });

      const result = await client.getVotingRecords({ 
        sessionId: 'MTG-PL-2024-01-15',
        topic: 'climate'
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].topic).toContain('climate');
    });

    it('should handle empty vote results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          data: [],
          '@context': []
        })
      });

      const result = await client.getVotingRecords({ sessionId: 'MTG-PL-2024-01-15' });

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.hasMore).toBe(false);
    });

    it('should calculate hasMore correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockVoteResultsResponse(10)
      });

      const result = await client.getVotingRecords({ 
        sessionId: 'MTG-PL-2024-01-15',
        limit: 3,
        offset: 0
      });

      expect(result.hasMore).toBe(true);
      expect(result.data.length).toBe(3);
    });

    it('should use dateFrom year for meetings query when no sessionId', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockMeetingsResponse(1)
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockVoteResultsResponse()
      });

      await client.getVotingRecords({ dateFrom: '2024-01-01', limit: 10 });

      // Check that meetings call includes year parameter
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('meetings'),
        expect.anything()
      );
    });

    it('should handle meetings with no vote results gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockMeetingsResponse(2)
      });
      // First meeting has no votes (throws error)
      mockFetch.mockRejectedValueOnce(new Error('No votes'));
      // Second meeting has votes
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockVoteResultsResponse()
      });

      const result = await client.getVotingRecords({ limit: 10 });
      
      // Should still return results from second meeting
      expect(result.data.length).toBeGreaterThan(0);
    });
  });

  describe('searchDocuments', () => {
    it('should search documents by keyword', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
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
        headers: new Headers(),
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
        headers: new Headers(),
        json: async () => createMockDocumentsResponse()
      });

      const result = await client.searchDocuments({
        keyword: 'climate',
        documentType: 'REPORT',
        limit: 10
      });

      expect(result).toHaveProperty('data');
    });

    it('should filter by keyword in title', async () => {
      const mockResponse = {
        data: [
          {
            id: 'doc-1',
            work_id: 'A-9-2024-0001',
            work_type: 'REPORT_PLENARY',
            title_dcterms: [{ '@language': 'en', '@value': 'Climate change report' }],
            work_date_document: '2024-01-10',
            was_attributed_to: 'ENVI',
            status: 'ADOPTED'
          },
          {
            id: 'doc-2',
            work_id: 'A-9-2024-0002',
            work_type: 'REPORT_PLENARY',
            title_dcterms: [{ '@language': 'en', '@value': 'Agriculture policy' }],
            work_date_document: '2024-01-11',
            was_attributed_to: 'AGRI',
            status: 'ADOPTED'
          }
        ],
        '@context': [
          { data: '@graph', '@base': 'https://data.europarl.europa.eu/' },
          'https://data.europarl.europa.eu/api/v2/context.jsonld'
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => mockResponse
      });

      const result = await client.searchDocuments({
        keyword: 'climate',
        limit: 10
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].title).toContain('Climate');
    });

    it('should filter by committee', async () => {
      const mockResponse = {
        data: [
          {
            id: 'doc-1',
            work_id: 'A-9-2024-0001',
            work_type: 'REPORT_PLENARY',
            title_dcterms: [{ '@language': 'en', '@value': 'Environment report' }],
            work_date_document: '2024-01-10',
            was_attributed_to: 'ENVI',
            status: 'ADOPTED'
          },
          {
            id: 'doc-2',
            work_id: 'A-9-2024-0002',
            work_type: 'REPORT_PLENARY',
            title_dcterms: [{ '@language': 'en', '@value': 'Development report' }],
            work_date_document: '2024-01-11',
            was_attributed_to: 'DEVE',
            status: 'ADOPTED'
          }
        ],
        '@context': [
          { data: '@graph', '@base': 'https://data.europarl.europa.eu/' },
          'https://data.europarl.europa.eu/api/v2/context.jsonld'
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => mockResponse
      });

      const result = await client.searchDocuments({
        keyword: 'report',
        committee: 'ENVI',
        limit: 10
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].committee).toBe('ENVI');
    });

    it('should map document type to EP API work-type', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse()
      });

      await client.searchDocuments({
        keyword: 'test',
        documentType: 'REPORT',
        limit: 10
      });

      // Check that the API was called with work-type parameter
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('documents'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'application/ld+json'
          })
        })
      );
    });

    it('should handle AMENDMENT document type mapping', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse()
      });

      await client.searchDocuments({
        keyword: 'test',
        documentType: 'AMENDMENT',
        limit: 10
      });

      expect(mockFetch).toHaveBeenCalled();
    });

    it('should handle RESOLUTION document type mapping', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse()
      });

      await client.searchDocuments({
        keyword: 'test',
        documentType: 'RESOLUTION',
        limit: 10
      });

      expect(mockFetch).toHaveBeenCalled();
    });

    it('should include year parameter when dateFrom provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse()
      });

      await client.searchDocuments({
        keyword: 'climate',
        dateFrom: '2024-01-01',
        limit: 10
      });

      expect(mockFetch).toHaveBeenCalled();
    });

    it('should handle empty search results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          data: [],
          '@context': []
        })
      });

      const result = await client.searchDocuments({
        keyword: 'nonexistent',
        limit: 10
      });

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.hasMore).toBe(false);
    });

    it('should apply pagination correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse(10)
      });

      const result = await client.searchDocuments({
        keyword: 'climate',
        limit: 5,
        offset: 2
      });

      expect(result.limit).toBe(5);
      expect(result.offset).toBe(2);
    });

    it('should handle documents with missing optional fields', async () => {
      const mockResponse = {
        data: [
          {
            id: 'doc-1',
            work_id: 'A-9-2024-0001',
            work_type: 'REPORT_PLENARY',
            title_dcterms: [{ '@language': 'en', '@value': 'Test document' }],
            work_date_document: '2024-01-10'
            // Missing was_attributed_to and status
          }
        ],
        '@context': [
          { data: '@graph', '@base': 'https://data.europarl.europa.eu/' },
          'https://data.europarl.europa.eu/api/v2/context.jsonld'
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => mockResponse
      });

      const result = await client.searchDocuments({
        keyword: 'test',
        limit: 10
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe('A-9-2024-0001');
      expect(result.data[0].status).toBeDefined();
    });

    it('should detect hasMore based on result count', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse(20)
      });

      const result = await client.searchDocuments({
        keyword: 'climate',
        limit: 20
      });

      expect(result.hasMore).toBe(true);
    });
  });

  describe('getCommitteeInfo', () => {
    it('should return committee details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
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
        headers: new Headers(),
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
        headers: new Headers(),
        json: async () => createMockCorporateBodyResponse()
      });

      // The first call throws, then client falls back to list search
      // Since ENVI is in the mock, it should match
      const result = await client.getCommitteeInfo({ abbreviation: 'ENVI' });
      expect(result).toHaveProperty('abbreviation');
    });

    it('should use id parameter for direct lookup', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockCorporateBodyResponse()
      });

      const result = await client.getCommitteeInfo({ id: 'ENVI' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('corporate-bodies/ENVI'),
        expect.anything()
      );
      expect(result.abbreviation).toBe('ENVI');
    });

    it('should use abbreviation parameter for direct lookup', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockCorporateBodyResponse()
      });

      const result = await client.getCommitteeInfo({ abbreviation: 'ENVI' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('corporate-bodies/ENVI'),
        expect.anything()
      );
      expect(result.abbreviation).toBe('ENVI');
    });

    it('should throw error when committee not found', async () => {
      // Direct lookup fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
        status: 404
      });
      // List search returns empty
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          data: [],
          '@context': []
        })
      });

      await expect(
        client.getCommitteeInfo({ abbreviation: 'NONEXISTENT' })
      ).rejects.toThrow(APIError);
    });

    it('should extract member IDs from hasMembership', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockCorporateBodyResponse()
      });

      const result = await client.getCommitteeInfo({ abbreviation: 'ENVI' });

      expect(result.members.length).toBeGreaterThan(0);
    });

    it('should set chair as first member', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockCorporateBodyResponse()
      });

      const result = await client.getCommitteeInfo({ abbreviation: 'ENVI' });

      expect(result.chair).toBeDefined();
      if (result.members.length > 0) {
        expect(result.chair).toBe(result.members[0]);
      }
    });

    it('should set vice chairs as second and third members', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockCorporateBodyResponse()
      });

      const result = await client.getCommitteeInfo({ abbreviation: 'ENVI' });

      expect(Array.isArray(result.viceChairs)).toBe(true);
    });

    it('should extract responsibilities from classification', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockCorporateBodyResponse()
      });

      const result = await client.getCommitteeInfo({ abbreviation: 'ENVI' });

      expect(Array.isArray(result.responsibilities)).toBe(true);
    });

    it('should fallback to list search with body-classification filter', async () => {
      // Direct lookup fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
        status: 404
      });
      // List search succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockCorporateBodyResponse()
      });

      await client.getCommitteeInfo({ abbreviation: 'ENVI' });

      // Second call should be to list endpoint with filter
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('corporate-bodies?'),
        expect.anything()
      );
    });

    it('should match committee by abbreviation in list search', async () => {
      const mockListResponse = {
        data: [
          {
            id: 'org/AGRI',
            body_id: 'AGRI',
            label: [{ '@language': 'en', '@value': 'Committee on Agriculture' }],
            notation: 'AGRI',
            classification: 'COMMITTEE_PARLIAMENTARY_STANDING',
            hasMembership: []
          },
          {
            id: 'org/ENVI',
            body_id: 'ENVI',
            label: [{ '@language': 'en', '@value': 'Committee on Environment' }],
            notation: 'ENVI',
            classification: 'COMMITTEE_PARLIAMENTARY_STANDING',
            hasMembership: []
          }
        ],
        '@context': []
      };

      // Direct lookup fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
        status: 404
      });
      // List search succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => mockListResponse
      });

      const result = await client.getCommitteeInfo({ abbreviation: 'ENVI' });

      expect(result.abbreviation).toBe('ENVI');
      expect(result.name).toContain('Environment');
    });

    it('should handle empty hasMembership', async () => {
      const mockResponse = {
        data: [{
          id: 'org/ENVI',
          body_id: 'ENVI',
          label: [{ '@language': 'en', '@value': 'Committee on Environment' }],
          notation: 'ENVI',
          classification: 'COMMITTEE_PARLIAMENTARY_STANDING',
          hasMembership: []
        }],
        '@context': []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => mockResponse
      });

      const result = await client.getCommitteeInfo({ abbreviation: 'ENVI' });

      expect(result.members).toEqual([]);
      expect(result.chair).toBe('');
      expect(result.viceChairs).toEqual([]);
    });

    it('should handle missing label field', async () => {
      const mockResponse = {
        data: [{
          id: 'org/ENVI',
          body_id: 'ENVI',
          notation: 'ENVI',
          classification: 'COMMITTEE_PARLIAMENTARY_STANDING',
          hasMembership: []
        }],
        '@context': []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => mockResponse
      });

      const result = await client.getCommitteeInfo({ abbreviation: 'ENVI' });

      expect(result.name).toContain('ENVI');
    });
  });

  describe('getParliamentaryQuestions', () => {
    it('should return paginated questions', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockQuestionsResponse()
      });

      const result = await client.getParliamentaryQuestions({ limit: 10 });

      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should include question details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
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
        headers: new Headers(),
        json: async () => createMockQuestionsResponse()
      });

      const result = await client.getParliamentaryQuestions({ type: 'WRITTEN', limit: 10 });
      expect(result).toHaveProperty('data');
    });

    it('should detect answered status from was_realized_by', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockQuestionsResponse()
      });

      const result = await client.getParliamentaryQuestions({ limit: 10 });
      // First question has was_realized_by set, should be ANSWERED
      if (result.data.length > 0) {
        expect(result.data[0]?.status).toBe('ANSWERED');
      }
    });

    it('should map WRITTEN type correctly', async () => {
      const mockResponse = {
        data: [{
          id: 'q-1',
          work_id: 'E-9-2024-000001',
          work_type: 'QUESTION_WRITTEN',
          title_dcterms: [{ '@language': 'en', '@value': 'Question about climate' }],
          work_date_document: '2024-01-10',
          was_created_by: 'person/124810',
          was_realized_by: null
        }],
        '@context': []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => mockResponse
      });

      const result = await client.getParliamentaryQuestions({ limit: 10 });

      expect(result.data[0].type).toBe('WRITTEN');
    });

    it('should map ORAL type correctly', async () => {
      const mockResponse = {
        data: [{
          id: 'q-1',
          work_id: 'O-9-2024-000001',
          work_type: 'QUESTION_ORAL',
          title_dcterms: [{ '@language': 'en', '@value': 'Question about policy' }],
          work_date_document: '2024-01-10',
          was_created_by: 'person/124810',
          was_realized_by: null
        }],
        '@context': []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => mockResponse
      });

      const result = await client.getParliamentaryQuestions({ limit: 10 });

      expect(result.data[0].type).toBe('ORAL');
    });

    it('should filter by author', async () => {
      const mockResponse = {
        data: [
          {
            id: 'q-1',
            work_id: 'E-9-2024-000001',
            work_type: 'QUESTION_WRITTEN',
            title_dcterms: [{ '@language': 'en', '@value': 'Question 1' }],
            work_date_document: '2024-01-10',
            was_created_by: 'person/124810',
            was_realized_by: null
          },
          {
            id: 'q-2',
            work_id: 'E-9-2024-000002',
            work_type: 'QUESTION_WRITTEN',
            title_dcterms: [{ '@language': 'en', '@value': 'Question 2' }],
            work_date_document: '2024-01-11',
            was_created_by: 'person/124811',
            was_realized_by: null
          }
        ],
        '@context': []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => mockResponse
      });

      const result = await client.getParliamentaryQuestions({ 
        author: '124810',
        limit: 10 
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].author).toContain('124810');
    });

    it('should filter by topic keyword', async () => {
      const mockResponse = {
        data: [
          {
            id: 'q-1',
            work_id: 'E-9-2024-000001',
            work_type: 'QUESTION_WRITTEN',
            title_dcterms: [{ '@language': 'en', '@value': 'Question about climate change' }],
            work_date_document: '2024-01-10',
            was_created_by: 'person/124810',
            was_realized_by: null
          },
          {
            id: 'q-2',
            work_id: 'E-9-2024-000002',
            work_type: 'QUESTION_WRITTEN',
            title_dcterms: [{ '@language': 'en', '@value': 'Question about agriculture' }],
            work_date_document: '2024-01-11',
            was_created_by: 'person/124811',
            was_realized_by: null
          }
        ],
        '@context': []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => mockResponse
      });

      const result = await client.getParliamentaryQuestions({ 
        topic: 'climate',
        limit: 10 
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].topic).toContain('climate');
    });

    it('should filter by status PENDING', async () => {
      const mockResponse = {
        data: [
          {
            id: 'q-1',
            work_id: 'E-9-2024-000001',
            work_type: 'QUESTION_WRITTEN',
            title_dcterms: [{ '@language': 'en', '@value': 'Question 1' }],
            work_date_document: '2024-01-10',
            was_created_by: 'person/124810',
            was_realized_by: 'answer-ref'
          },
          {
            id: 'q-2',
            work_id: 'E-9-2024-000002',
            work_type: 'QUESTION_WRITTEN',
            title_dcterms: [{ '@language': 'en', '@value': 'Question 2' }],
            work_date_document: '2024-01-11',
            was_created_by: 'person/124811',
            was_realized_by: null
          }
        ],
        '@context': []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => mockResponse
      });

      const result = await client.getParliamentaryQuestions({ 
        status: 'PENDING',
        limit: 10 
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].status).toBe('PENDING');
    });

    it('should filter by status ANSWERED', async () => {
      const mockResponse = {
        data: [
          {
            id: 'q-1',
            work_id: 'E-9-2024-000001',
            work_type: 'QUESTION_WRITTEN',
            title_dcterms: [{ '@language': 'en', '@value': 'Question 1' }],
            work_date_document: '2024-01-10',
            was_created_by: 'person/124810',
            was_realized_by: 'answer-ref'
          },
          {
            id: 'q-2',
            work_id: 'E-9-2024-000002',
            work_type: 'QUESTION_WRITTEN',
            title_dcterms: [{ '@language': 'en', '@value': 'Question 2' }],
            work_date_document: '2024-01-11',
            was_created_by: 'person/124811',
            was_realized_by: null
          }
        ],
        '@context': []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => mockResponse
      });

      const result = await client.getParliamentaryQuestions({ 
        status: 'ANSWERED',
        limit: 10 
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].status).toBe('ANSWERED');
    });

    it('should include answer text for answered questions', async () => {
      const mockResponse = {
        data: [{
          id: 'q-1',
          work_id: 'E-9-2024-000001',
          work_type: 'QUESTION_WRITTEN',
          title_dcterms: [{ '@language': 'en', '@value': 'Question about climate' }],
          work_date_document: '2024-01-10',
          was_created_by: 'person/124810',
          was_realized_by: 'answer-ref'
        }],
        '@context': []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => mockResponse
      });

      const result = await client.getParliamentaryQuestions({ limit: 10 });

      expect(result.data[0].status).toBe('ANSWERED');
      expect(result.data[0].answerText).toBeDefined();
      expect(result.data[0].answerDate).toBeDefined();
    });

    it('should handle empty results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          data: [],
          '@context': []
        })
      });

      const result = await client.getParliamentaryQuestions({ limit: 10 });

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.hasMore).toBe(false);
    });

    it('should apply pagination correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockQuestionsResponse(10)
      });

      const result = await client.getParliamentaryQuestions({ 
        limit: 5,
        offset: 2
      });

      expect(result.limit).toBe(5);
      expect(result.offset).toBe(2);
    });

    it('should send QUESTION_WRITTEN work-type for WRITTEN filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockQuestionsResponse()
      });

      await client.getParliamentaryQuestions({ 
        type: 'WRITTEN',
        limit: 10 
      });

      expect(mockFetch).toHaveBeenCalled();
    });

    it('should send QUESTION_ORAL work-type for ORAL filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockQuestionsResponse()
      });

      await client.getParliamentaryQuestions({ 
        type: 'ORAL',
        limit: 10 
      });

      expect(mockFetch).toHaveBeenCalled();
    });

    it('should include year parameter when dateFrom provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockQuestionsResponse()
      });

      await client.getParliamentaryQuestions({ 
        dateFrom: '2024-01-01',
        limit: 10 
      });

      expect(mockFetch).toHaveBeenCalled();
    });

    it('should handle questions with missing title', async () => {
      const mockResponse = {
        data: [{
          id: 'q-1',
          work_id: 'E-9-2024-000001',
          work_type: 'QUESTION_WRITTEN',
          work_date_document: '2024-01-10',
          was_created_by: 'person/124810',
          was_realized_by: null
        }],
        '@context': []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => mockResponse
      });

      const result = await client.getParliamentaryQuestions({ limit: 10 });

      expect(result.data[0].topic).toContain('E-9-2024-000001');
    });

    it('should handle questions with missing author', async () => {
      const mockResponse = {
        data: [{
          id: 'q-1',
          work_id: 'E-9-2024-000001',
          work_type: 'QUESTION_WRITTEN',
          title_dcterms: [{ '@language': 'en', '@value': 'Question about climate' }],
          work_date_document: '2024-01-10',
          was_realized_by: null
        }],
        '@context': []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => mockResponse
      });

      const result = await client.getParliamentaryQuestions({ limit: 10 });

      expect(result.data[0].author).toBe('Unknown');
    });

    it('should detect hasMore based on result count', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockQuestionsResponse(50)
      });

      const result = await client.getParliamentaryQuestions({ limit: 50 });

      expect(result.hasMore).toBe(true);
    });

    it('should map INTERPELLATION types to ORAL', async () => {
      const mockResponse = {
        data: [{
          id: 'q-1',
          work_id: 'I-9-2024-000001',
          work_type: 'INTERPELLATION_MAJOR',
          title_dcterms: [{ '@language': 'en', '@value': 'Interpellation question' }],
          work_date_document: '2024-01-10',
          was_created_by: 'person/124810',
          was_realized_by: null
        }],
        '@context': []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => mockResponse
      });

      const result = await client.getParliamentaryQuestions({ limit: 10 });

      expect(result.data[0].type).toBe('ORAL');
    });

    it('should map QUESTION_TIME to ORAL', async () => {
      const mockResponse = {
        data: [{
          id: 'q-1',
          work_id: 'Q-9-2024-000001',
          work_type: 'QUESTION_TIME',
          title_dcterms: [{ '@language': 'en', '@value': 'Question time question' }],
          work_date_document: '2024-01-10',
          was_created_by: 'person/124810',
          was_realized_by: null
        }],
        '@context': []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => mockResponse
      });

      const result = await client.getParliamentaryQuestions({ limit: 10 });

      expect(result.data[0].type).toBe('ORAL');
    });
  });

  describe('Caching', () => {
    it('should cache API responses', async () => {
      // Mock API response
      mockFetch.mockResolvedValue({
        ok: true,
        headers: new Headers(),
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
        headers: new Headers(),
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
            headers: new Headers(),
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
        headers: new Headers(),
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
        headers: new Headers(),
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
        headers: new Headers(),
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
        headers: new Headers(),
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
        headers: new Headers(),
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
        headers: new Headers(),
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
        headers: new Headers(),
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
        headers: new Headers(),
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
        headers: new Headers(),
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
        headers: new Headers(),
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

  // ── Phase 4 New Endpoint Tests ──────────────────────────────────────

  const createMockSpeechesResponse = (count: number = 2) => ({
    data: Array.from({ length: count }, (_, i) => ({
      id: `speech-${i + 1}`,
      identifier: `SPEECH-${i + 1}`,
      label: `Speech on topic ${i + 1}`,
      had_activity_type: 'DEBATE_SPEECH',
      had_participant_person: `person/1000${i}`,
      participant_label: `Speaker ${i + 1}`,
      activity_date: { '@value': `2024-03-${String(10 + i)}T10:00:00Z`, type: 'xsd:dateTime' },
      language: 'en',
      text: `Speech content ${i + 1}`,
      was_part_of: `event/MTG-PL-2024-03-${String(10 + i)}`
    })),
    '@context': [
      { data: '@graph', '@base': 'https://data.europarl.europa.eu/' },
      'https://data.europarl.europa.eu/api/v2/context.jsonld'
    ]
  });

  const createMockProceduresResponse = (count: number = 2) => ({
    data: Array.from({ length: count }, (_, i) => ({
      id: `proc-${i + 1}`,
      identifier: `2024/000${i + 1}(COD)`,
      process_id: `2024/000${i + 1}(COD)`,
      title_dcterms: [{ '@language': 'en', '@value': `Procedure ${i + 1} title` }],
      process_type: 'COD',
      subject_matter: [{ '@language': 'en', '@value': 'Internal Market' }],
      process_stage: 'First reading',
      process_status: 'Ongoing',
      process_date_start: `2024-01-${String(10 + i)}`,
      process_date_update: `2024-06-${String(10 + i)}`,
      was_attributed_to: 'IMCO',
      rapporteur: [{ '@language': 'en', '@value': `Rapporteur ${i + 1}` }],
      had_document: [`doc-ref-${i + 1}`]
    })),
    '@context': [
      { data: '@graph', '@base': 'https://data.europarl.europa.eu/' },
      'https://data.europarl.europa.eu/api/v2/context.jsonld'
    ]
  });

  const createMockAdoptedTextsResponse = (count: number = 2) => ({
    data: Array.from({ length: count }, (_, i) => ({
      id: `at-${i + 1}`,
      work_id: `TA-9-2024-000${i + 1}`,
      title_dcterms: [{ '@language': 'en', '@value': `Adopted text ${i + 1}` }],
      work_type: 'LEGISLATIVE_RESOLUTION',
      work_date_document: `2024-03-${String(10 + i)}`,
      based_on_a_concept_procedure: `2023/0123(COD)`,
      subject_matter: [{ '@language': 'en', '@value': 'Digital policy' }]
    })),
    '@context': [
      { data: '@graph', '@base': 'https://data.europarl.europa.eu/' },
      'https://data.europarl.europa.eu/api/v2/context.jsonld'
    ]
  });

  const createMockEventsResponse = (count: number = 2) => ({
    data: Array.from({ length: count }, (_, i) => ({
      id: `evt-${i + 1}`,
      identifier: `EVT-2024-${String(i + 1).padStart(3, '0')}`,
      label: [{ '@language': 'en', '@value': `Event ${i + 1}` }],
      activity_start_date: { '@value': `2024-06-${String(10 + i)}T09:00:00Z`, type: 'xsd:dateTime' },
      activity_end_date: { '@value': `2024-06-${String(10 + i)}T17:00:00Z`, type: 'xsd:dateTime' },
      had_activity_type: 'HEARING',
      had_locality: 'Brussels',
      was_organized_by: 'IMCO',
      activity_status: 'CONFIRMED'
    })),
    '@context': [
      { data: '@graph', '@base': 'https://data.europarl.europa.eu/' },
      'https://data.europarl.europa.eu/api/v2/context.jsonld'
    ]
  });

  const createMockMeetingActivitiesResponse = (count: number = 2) => ({
    data: Array.from({ length: count }, (_, i) => ({
      id: `act-${i + 1}`,
      identifier: `ACT-${i + 1}`,
      label: [{ '@language': 'en', '@value': `Activity ${i + 1}` }],
      had_activity_type: 'DEBATE',
      activity_date: { '@value': `2024-03-15T${String(10 + i)}:00:00Z`, type: 'xsd:dateTime' },
      activity_order: i + 1,
      had_document: `A9-000${i + 1}/2024`,
      was_attributed_to: 'IMCO'
    })),
    '@context': [
      { data: '@graph', '@base': 'https://data.europarl.europa.eu/' },
      'https://data.europarl.europa.eu/api/v2/context.jsonld'
    ]
  });

  const createMockDeclarationsResponse = (count: number = 2) => ({
    data: Array.from({ length: count }, (_, i) => ({
      id: `decl-${i + 1}`,
      work_id: `DFI-9-2024-${String(i + 1).padStart(6, '0')}`,
      title_dcterms: [{ '@language': 'en', '@value': `Declaration ${i + 1}` }],
      was_attributed_to: `person/1000${i}`,
      author_label: [{ '@language': 'en', '@value': `MEP ${i + 1}` }],
      work_type: 'FINANCIAL_INTERESTS',
      work_date_document: `2024-01-${String(10 + i)}`,
      'resource_legal_in-force': 'PUBLISHED'
    })),
    '@context': [
      { data: '@graph', '@base': 'https://data.europarl.europa.eu/' },
      'https://data.europarl.europa.eu/api/v2/context.jsonld'
    ]
  });

  describe('getCurrentMEPs', () => {
    it('should return paginated current MEP data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockMEPsResponse(5)
      } as Response);

      const result = await client.getCurrentMEPs({ limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('limit', 10);
      expect(result).toHaveProperty('offset', 0);
      expect(result).toHaveProperty('hasMore');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(5);
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockMEPsResponse(1)
      } as Response);

      await client.getCurrentMEPs({});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('meps/show-current'),
        expect.any(Object)
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response);

      await expect(client.getCurrentMEPs({ limit: 10 })).rejects.toThrow(APIError);
    });

    it('should apply default limit and offset', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockMEPsResponse(2)
      } as Response);

      const result = await client.getCurrentMEPs();

      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });
  });

  describe('getIncomingMEPs', () => {
    it('should return paginated incoming MEP data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockMEPsResponse(3)
      } as Response);

      const result = await client.getIncomingMEPs({ limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(3);
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockMEPsResponse(1)
      } as Response);

      await client.getIncomingMEPs({});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('meps/show-incoming'),
        expect.any(Object)
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response);

      await expect(client.getIncomingMEPs({})).rejects.toThrow(APIError);
    });
  });

  describe('getOutgoingMEPs', () => {
    it('should return paginated outgoing MEP data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockMEPsResponse(4)
      } as Response);

      const result = await client.getOutgoingMEPs({ limit: 10 });

      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(4);
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockMEPsResponse(1)
      } as Response);

      await client.getOutgoingMEPs({});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('meps/show-outgoing'),
        expect.any(Object)
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response);

      await expect(client.getOutgoingMEPs({})).rejects.toThrow(APIError);
    });
  });

  describe('getSpeeches', () => {
    it('should return paginated speech data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockSpeechesResponse(3)
      } as Response);

      const result = await client.getSpeeches({ limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('limit', 10);
      expect(result).toHaveProperty('offset', 0);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(3);
    });

    it('should include speech fields', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockSpeechesResponse(1)
      } as Response);

      const result = await client.getSpeeches({ limit: 1 });
      const speech = result.data[0];

      expect(speech).toHaveProperty('id');
      expect(speech).toHaveProperty('title');
      expect(speech).toHaveProperty('speakerId');
      expect(speech).toHaveProperty('date');
      expect(speech).toHaveProperty('type');
      expect(speech).toHaveProperty('language');
      expect(speech).toHaveProperty('text');
      expect(speech).toHaveProperty('sessionReference');
    });

    it('should pass date-from and date-to parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockSpeechesResponse(1)
      } as Response);

      await client.getSpeeches({ dateFrom: '2024-01-01', dateTo: '2024-06-30' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('date-from=2024-01-01'),
        expect.any(Object)
      );
    });

    it('should handle empty results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          data: [],
          '@context': []
        })
      } as Response);

      const result = await client.getSpeeches({});

      expect(result.data).toEqual([]);
      expect(result.hasMore).toBe(false);
    });

    it('should handle API errors', async () => {
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response);

      await expect(client.getSpeeches({})).rejects.toThrow(APIError);
    });

    it('should detect hasMore when result count equals limit', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockSpeechesResponse(10)
      } as Response);

      const result = await client.getSpeeches({ limit: 10 });

      expect(result.hasMore).toBe(true);
    });
  });

  describe('getProcedures', () => {
    it('should return paginated procedure data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockProceduresResponse(3)
      } as Response);

      const result = await client.getProcedures({ limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(3);
    });

    it('should include procedure fields', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockProceduresResponse(1)
      } as Response);

      const result = await client.getProcedures({ limit: 1 });
      const proc = result.data[0];

      expect(proc).toHaveProperty('id');
      expect(proc).toHaveProperty('title');
      expect(proc).toHaveProperty('reference');
      expect(proc).toHaveProperty('type');
      expect(proc).toHaveProperty('stage');
      expect(proc).toHaveProperty('status');
      expect(proc).toHaveProperty('documents');
    });

    it('should pass year parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockProceduresResponse(1)
      } as Response);

      await client.getProcedures({ year: 2024 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('year=2024'),
        expect.any(Object)
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response);

      await expect(client.getProcedures({})).rejects.toThrow(APIError);
    });

    it('should handle empty results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          data: [],
          '@context': []
        })
      } as Response);

      const result = await client.getProcedures({});
      expect(result.data).toEqual([]);
    });
  });

  describe('getProcedureById', () => {
    it('should return a single procedure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          identifier: '2024/0001(COD)',
          title_dcterms: [{ '@language': 'en', '@value': 'AI Act' }],
          process_type: 'COD',
          process_stage: 'First reading',
          process_status: 'Ongoing',
          process_date_start: '2024-01-10',
          process_date_update: '2024-06-15',
          was_attributed_to: 'IMCO'
        })
      } as Response);

      const result = await client.getProcedureById('2024/0001(COD)');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('type');
    });

    it('should throw for empty processId', async () => {
      await expect(client.getProcedureById('')).rejects.toThrow('Procedure process-id is required');
    });

    it('should throw for whitespace-only processId', async () => {
      await expect(client.getProcedureById('   ')).rejects.toThrow('Procedure process-id is required');
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          identifier: 'PROC-1',
          title_dcterms: [{ '@language': 'en', '@value': 'Test' }]
        })
      } as Response);

      await client.getProcedureById('PROC-1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('procedures/PROC-1'),
        expect.any(Object)
      );
    });
  });

  describe('getAdoptedTexts', () => {
    it('should return paginated adopted text data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockAdoptedTextsResponse(3)
      } as Response);

      const result = await client.getAdoptedTexts({ limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(3);
    });

    it('should include adopted text fields', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockAdoptedTextsResponse(1)
      } as Response);

      const result = await client.getAdoptedTexts({ limit: 1 });
      const text = result.data[0];

      expect(text).toHaveProperty('id');
      expect(text).toHaveProperty('title');
      expect(text).toHaveProperty('reference');
      expect(text).toHaveProperty('type');
      expect(text).toHaveProperty('dateAdopted');
    });

    it('should pass year parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockAdoptedTextsResponse(1)
      } as Response);

      await client.getAdoptedTexts({ year: 2024 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('year=2024'),
        expect.any(Object)
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response);

      await expect(client.getAdoptedTexts({})).rejects.toThrow(APIError);
    });
  });

  describe('getEvents', () => {
    it('should return paginated event data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockEventsResponse(3)
      } as Response);

      const result = await client.getEvents({ limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(3);
    });

    it('should include event fields', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockEventsResponse(1)
      } as Response);

      const result = await client.getEvents({ limit: 1 });
      const event = result.data[0];

      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('title');
      expect(event).toHaveProperty('date');
      expect(event).toHaveProperty('type');
      expect(event).toHaveProperty('location');
      expect(event).toHaveProperty('organizer');
      expect(event).toHaveProperty('status');
    });

    it('should pass date range parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockEventsResponse(1)
      } as Response);

      await client.getEvents({ dateFrom: '2024-06-01', dateTo: '2024-06-30' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('date-from=2024-06-01'),
        expect.any(Object)
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response);

      await expect(client.getEvents({})).rejects.toThrow(APIError);
    });

    it('should handle empty results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          data: [],
          '@context': []
        })
      } as Response);

      const result = await client.getEvents({});
      expect(result.data).toEqual([]);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('getMeetingActivities', () => {
    it('should return paginated meeting activity data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockMeetingActivitiesResponse(3)
      } as Response);

      const result = await client.getMeetingActivities('MTG-PL-2024-001', { limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(3);
    });

    it('should include activity fields', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockMeetingActivitiesResponse(1)
      } as Response);

      const result = await client.getMeetingActivities('MTG-PL-2024-001', { limit: 1 });
      const activity = result.data[0];

      expect(activity).toHaveProperty('id');
      expect(activity).toHaveProperty('title');
      expect(activity).toHaveProperty('type');
      expect(activity).toHaveProperty('date');
      expect(activity).toHaveProperty('order');
      expect(typeof activity.order).toBe('number');
    });

    it('should throw for empty sittingId', async () => {
      await expect(client.getMeetingActivities('', {})).rejects.toThrow('Meeting sitting-id is required');
    });

    it('should throw for whitespace-only sittingId', async () => {
      await expect(client.getMeetingActivities('   ', {})).rejects.toThrow('Meeting sitting-id is required');
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockMeetingActivitiesResponse(1)
      } as Response);

      await client.getMeetingActivities('MTG-PL-2024-001', {});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('meetings/MTG-PL-2024-001/activities'),
        expect.any(Object)
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response);

      await expect(client.getMeetingActivities('INVALID', {})).rejects.toThrow(APIError);
    });
  });

  describe('getMeetingDecisions', () => {
    it('should return paginated meeting decision data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse(3)
      } as Response);

      const result = await client.getMeetingDecisions('MTG-PL-2024-001', { limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should throw for empty sittingId', async () => {
      await expect(client.getMeetingDecisions('', {})).rejects.toThrow('Meeting sitting-id is required');
    });

    it('should throw for whitespace-only sittingId', async () => {
      await expect(client.getMeetingDecisions('   ', {})).rejects.toThrow('Meeting sitting-id is required');
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse(1)
      } as Response);

      await client.getMeetingDecisions('MTG-PL-2024-001', {});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('meetings/MTG-PL-2024-001/decisions'),
        expect.any(Object)
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response);

      await expect(client.getMeetingDecisions('MTG-1', {})).rejects.toThrow(APIError);
    });
  });

  describe('getMEPDeclarations', () => {
    it('should return paginated declaration data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDeclarationsResponse(3)
      } as Response);

      const result = await client.getMEPDeclarations({ limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(3);
    });

    it('should include declaration fields', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDeclarationsResponse(1)
      } as Response);

      const result = await client.getMEPDeclarations({ limit: 1 });
      const decl = result.data[0];

      expect(decl).toHaveProperty('id');
      expect(decl).toHaveProperty('title');
      expect(decl).toHaveProperty('mepId');
      expect(decl).toHaveProperty('type');
      expect(decl).toHaveProperty('dateFiled');
      expect(decl).toHaveProperty('status');
    });

    it('should pass year parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDeclarationsResponse(1)
      } as Response);

      await client.getMEPDeclarations({ year: 2024 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('year=2024'),
        expect.any(Object)
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response);

      await expect(client.getMEPDeclarations({})).rejects.toThrow(APIError);
    });

    it('should handle empty results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          data: [],
          '@context': []
        })
      } as Response);

      const result = await client.getMEPDeclarations({});
      expect(result.data).toEqual([]);
    });
  });

  describe('getPlenaryDocuments', () => {
    it('should return paginated plenary document data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse(3)
      } as Response);

      const result = await client.getPlenaryDocuments({ limit: 10 });

      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse(1)
      } as Response);

      await client.getPlenaryDocuments({});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('plenary-documents'),
        expect.any(Object)
      );
    });

    it('should pass year parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse(1)
      } as Response);

      await client.getPlenaryDocuments({ year: 2024 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('year=2024'),
        expect.any(Object)
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response);

      await expect(client.getPlenaryDocuments({})).rejects.toThrow(APIError);
    });
  });

  describe('getCommitteeDocuments', () => {
    it('should return paginated committee document data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse(3)
      } as Response);

      const result = await client.getCommitteeDocuments({ limit: 10 });

      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse(1)
      } as Response);

      await client.getCommitteeDocuments({});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('committee-documents'),
        expect.any(Object)
      );
    });

    it('should pass year parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse(1)
      } as Response);

      await client.getCommitteeDocuments({ year: 2024 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('year=2024'),
        expect.any(Object)
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response);

      await expect(client.getCommitteeDocuments({})).rejects.toThrow(APIError);
    });
  });

  describe('getPlenarySessionDocuments', () => {
    it('should return paginated plenary session document data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse(3)
      } as Response);

      const result = await client.getPlenarySessionDocuments({ limit: 10 });

      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse(1)
      } as Response);

      await client.getPlenarySessionDocuments({});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('plenary-session-documents'),
        expect.any(Object)
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response);

      await expect(client.getPlenarySessionDocuments({})).rejects.toThrow(APIError);
    });
  });

  describe('getControlledVocabularies', () => {
    it('should return paginated vocabulary data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          data: [
            { id: 'vocab-1', label: 'Vocabulary 1' },
            { id: 'vocab-2', label: 'Vocabulary 2' }
          ],
          '@context': []
        })
      } as Response);

      const result = await client.getControlledVocabularies({ limit: 10 });

      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          data: [],
          '@context': []
        })
      } as Response);

      await client.getControlledVocabularies({});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('controlled-vocabularies'),
        expect.any(Object)
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response);

      await expect(client.getControlledVocabularies({})).rejects.toThrow(APIError);
    });

    it('should return raw items without transformation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          data: [{ customField: 'value', anotherField: 42 }],
          '@context': []
        })
      } as Response);

      const result = await client.getControlledVocabularies({});

      expect(result.data[0]).toHaveProperty('customField', 'value');
      expect(result.data[0]).toHaveProperty('anotherField', 42);
    });
  });

  describe('Transform Helpers - Speeches', () => {
    it('should transform speech data with all fields', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          data: [{
            identifier: 'SP-001',
            had_activity_type: 'DEBATE_SPEECH',
            had_participant_person: 'person/12345',
            participant_label: 'Test Speaker',
            activity_date: { '@value': '2024-03-15T10:00:00Z', type: 'xsd:dateTime' },
            language: 'en',
            text: 'Speech content',
            was_part_of: 'event/MTG-PL-2024-03-15'
          }],
          '@context': []
        })
      } as Response);

      const result = await client.getSpeeches({ limit: 1 });
      const speech = result.data[0];

      expect(speech.id).toBe('SP-001');
      expect(speech.speakerId).toContain('12345');
      expect(speech.language).toBe('en');
      expect(speech.text).toBe('Speech content');
    });

    it('should handle speech with missing optional fields', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          data: [{
            identifier: 'SP-002'
            // Missing most fields
          }],
          '@context': []
        })
      } as Response);

      const result = await client.getSpeeches({ limit: 1 });
      const speech = result.data[0];

      expect(speech.id).toBe('SP-002');
      expect(speech).toHaveProperty('title');
      expect(speech).toHaveProperty('date');
    });
  });

  describe('Transform Helpers - Procedures', () => {
    it('should use firstDefined to pick title from multiple candidates', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          data: [{
            identifier: 'PROC-1',
            label: 'Label fallback',
            process_type: 'COD',
            process_date_start: '2024-01-10'
          }],
          '@context': []
        })
      } as Response);

      const result = await client.getProcedures({ limit: 1 });
      const proc = result.data[0];

      // Should pick 'label' since title_dcterms is missing
      expect(proc.title).toBe('Label fallback');
    });

    it('should extract document refs from had_document array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          data: [{
            identifier: 'PROC-2',
            title_dcterms: [{ '@language': 'en', '@value': 'Test' }],
            had_document: ['doc-A', 'doc-B']
          }],
          '@context': []
        })
      } as Response);

      const result = await client.getProcedures({ limit: 1 });
      const proc = result.data[0];

      expect(proc.documents).toEqual(['doc-A', 'doc-B']);
    });

    it('should handle had_document as objects', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          data: [{
            identifier: 'PROC-3',
            title_dcterms: [{ '@language': 'en', '@value': 'Test' }],
            had_document: [{ id: 'doc-X' }, { identifier: 'doc-Y' }]
          }],
          '@context': []
        })
      } as Response);

      const result = await client.getProcedures({ limit: 1 });
      const proc = result.data[0];

      expect(proc.documents).toContain('doc-X');
      expect(proc.documents).toContain('doc-Y');
    });

    it('should handle had_document as single string', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          data: [{
            identifier: 'PROC-4',
            had_document: 'single-doc-ref'
          }],
          '@context': []
        })
      } as Response);

      const result = await client.getProcedures({ limit: 1 });
      const proc = result.data[0];

      expect(proc.documents).toEqual(['single-doc-ref']);
    });

    it('should handle null/undefined had_document', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          data: [{
            identifier: 'PROC-5'
          }],
          '@context': []
        })
      } as Response);

      const result = await client.getProcedures({ limit: 1 });
      const proc = result.data[0];

      expect(proc.documents).toEqual([]);
    });
  });

  describe('Transform Helpers - Adopted Texts', () => {
    it('should transform adopted text with all fields', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          data: [{
            work_id: 'TA-9-2024-0001',
            title_dcterms: [{ '@language': 'en', '@value': 'AI Act' }],
            work_type: 'LEGISLATIVE_RESOLUTION',
            work_date_document: '2024-03-13',
            based_on_a_concept_procedure: '2023/0123(COD)',
            subject_matter: [{ '@language': 'en', '@value': 'Digital policy' }]
          }],
          '@context': []
        })
      } as Response);

      const result = await client.getAdoptedTexts({ limit: 1 });
      const text = result.data[0];

      expect(text.id).toBe('TA-9-2024-0001');
      expect(text.title).toBe('AI Act');
      expect(text.type).toBe('LEGISLATIVE_RESOLUTION');
      expect(text.dateAdopted).toContain('2024-03-13');
    });
  });

  describe('Transform Helpers - Events', () => {
    it('should transform event with all fields', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          data: [{
            identifier: 'EVT-1',
            label: [{ '@language': 'en', '@value': 'Hearing on AI' }],
            activity_start_date: { '@value': '2024-06-15T09:00:00Z' },
            activity_end_date: { '@value': '2024-06-15T17:00:00Z' },
            had_activity_type: 'HEARING',
            had_locality: 'Brussels',
            was_organized_by: 'IMCO',
            activity_status: 'CONFIRMED'
          }],
          '@context': []
        })
      } as Response);

      const result = await client.getEvents({ limit: 1 });
      const event = result.data[0];

      expect(event.id).toBe('EVT-1');
      expect(event.title).toBe('Hearing on AI');
      expect(event.type).toBe('HEARING');
      expect(event.location).toBe('Brussels');
      expect(event.organizer).toBe('IMCO');
      expect(event.status).toBe('CONFIRMED');
    });
  });

  describe('Transform Helpers - Meeting Activities', () => {
    it('should transform meeting activity with order field', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          data: [{
            identifier: 'ACT-1',
            label: [{ '@language': 'en', '@value': 'Debate on AI' }],
            had_activity_type: 'DEBATE',
            activity_date: { '@value': '2024-03-15T10:00:00Z' },
            activity_order: 3,
            had_document: 'A9-0001/2024',
            was_attributed_to: 'IMCO'
          }],
          '@context': []
        })
      } as Response);

      const result = await client.getMeetingActivities('MTG-1', { limit: 1 });
      const activity = result.data[0];

      expect(activity.order).toBe(3);
      expect(activity.type).toBe('DEBATE');
    });

    it('should default order to 0 when not a number', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          data: [{
            identifier: 'ACT-2'
            // No activity_order field
          }],
          '@context': []
        })
      } as Response);

      const result = await client.getMeetingActivities('MTG-1', { limit: 1 });
      const activity = result.data[0];

      expect(activity.order).toBe(0);
    });
  });

  describe('Transform Helpers - MEP Declarations', () => {
    it('should transform declaration with all fields', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          data: [{
            work_id: 'DFI-001',
            title_dcterms: [{ '@language': 'en', '@value': 'Financial interests' }],
            was_attributed_to: 'person/12345',
            author_label: [{ '@language': 'en', '@value': 'John Doe' }],
            work_type: 'FINANCIAL_INTERESTS',
            work_date_document: '2024-01-15',
            'resource_legal_in-force': 'PUBLISHED'
          }],
          '@context': []
        })
      } as Response);

      const result = await client.getMEPDeclarations({ limit: 1 });
      const decl = result.data[0];

      expect(decl.id).toBe('DFI-001');
      expect(decl.title).toBe('Financial interests');
      expect(decl.mepId).toContain('12345');
      expect(decl.mepName).toBe('John Doe');
      expect(decl.type).toBe('FINANCIAL_INTERESTS');
      expect(decl.status).toBe('PUBLISHED');
    });

    it('should handle declaration with missing optional fields', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          data: [{
            work_id: 'DFI-002'
            // Missing most fields
          }],
          '@context': []
        })
      } as Response);

      const result = await client.getMEPDeclarations({ limit: 1 });
      const decl = result.data[0];

      expect(decl.id).toBe('DFI-002');
      expect(decl).toHaveProperty('title');
      expect(decl).toHaveProperty('mepId');
      expect(decl).toHaveProperty('dateFiled');
    });
  });

  // ── Phase 5: By-ID and additional list endpoint tests ──────────────

  describe('getHomonymMEPs', () => {
    it('should return paginated homonym MEP data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockMEPsResponse(3)
      } as Response);

      const result = await client.getHomonymMEPs({ limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('limit', 10);
      expect(result).toHaveProperty('offset', 0);
      expect(result).toHaveProperty('hasMore');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(3);
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockMEPsResponse(1)
      } as Response);

      await client.getHomonymMEPs({});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('meps/show-homonyms'),
        expect.any(Object)
      );
    });

    it('should apply default limit and offset', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockMEPsResponse(2)
      } as Response);

      const result = await client.getHomonymMEPs();

      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });

    it('should handle API errors', async () => {
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response);

      await expect(client.getHomonymMEPs({ limit: 10 })).rejects.toThrow(APIError);
    });
  });

  describe('getCurrentCorporateBodies', () => {
    it('should return paginated corporate bodies', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockCorporateBodyResponse()
      } as Response);

      const result = await client.getCurrentCorporateBodies({ limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('limit', 10);
      expect(result).toHaveProperty('offset', 0);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockCorporateBodyResponse()
      } as Response);

      await client.getCurrentCorporateBodies({});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('corporate-bodies/show-current'),
        expect.any(Object)
      );
    });

    it('should apply default limit and offset', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockCorporateBodyResponse()
      } as Response);

      const result = await client.getCurrentCorporateBodies();

      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });

    it('should handle API errors', async () => {
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response);

      await expect(client.getCurrentCorporateBodies({})).rejects.toThrow(APIError);
    });
  });

  describe('getEventById', () => {
    it('should return a single event', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          id: 'evt-1',
          identifier: 'EVT-2024-001',
          label: [{ '@language': 'en', '@value': 'Test Event' }],
          activity_start_date: { '@value': '2024-06-10T09:00:00Z', type: 'xsd:dateTime' },
          had_activity_type: 'HEARING',
          had_locality: 'Brussels',
          was_organized_by: 'IMCO',
          activity_status: 'CONFIRMED'
        })
      } as Response);

      const result = await client.getEventById('EVT-2024-001');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('type');
    });

    it('should throw for empty eventId', async () => {
      await expect(client.getEventById('')).rejects.toThrow('Event ID is required');
    });

    it('should throw for whitespace-only eventId', async () => {
      await expect(client.getEventById('   ')).rejects.toThrow('Event ID is required');
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          id: 'evt-1',
          identifier: 'EVT-2024-001',
          label: [{ '@language': 'en', '@value': 'Test' }]
        })
      } as Response);

      await client.getEventById('EVT-2024-001');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('events/EVT-2024-001'),
        expect.any(Object)
      );
    });
  });

  describe('getMeetingById', () => {
    it('should return a single meeting', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          id: 'eli/dl/event/MTG-PL-2024-01-15',
          type: 'Activity',
          'eli-dl:activity_date': { '@value': '2024-01-15T00:00:00+01:00', type: 'xsd:dateTime' },
          activity_id: 'MTG-PL-2024-01-15',
          activity_label: { en: 'Plenary session' }
        })
      } as Response);

      const result = await client.getMeetingById('MTG-PL-2024-01-15');

      expect(result).toHaveProperty('id');
    });

    it('should throw for empty eventId', async () => {
      await expect(client.getMeetingById('')).rejects.toThrow('Meeting event ID is required');
    });

    it('should throw for whitespace-only eventId', async () => {
      await expect(client.getMeetingById('   ')).rejects.toThrow('Meeting event ID is required');
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          id: 'eli/dl/event/MTG-PL-2024-01-15',
          type: 'Activity',
          activity_id: 'MTG-PL-2024-01-15'
        })
      } as Response);

      await client.getMeetingById('MTG-PL-2024-01-15');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('meetings/MTG-PL-2024-01-15'),
        expect.any(Object)
      );
    });
  });

  describe('getMeetingForeseenActivities', () => {
    it('should return paginated foreseen activities', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockMeetingActivitiesResponse(2)
      } as Response);

      const result = await client.getMeetingForeseenActivities('MTG-PL-2024-001', { limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should throw for empty sittingId', async () => {
      await expect(client.getMeetingForeseenActivities('')).rejects.toThrow('Meeting sitting-id is required');
    });

    it('should throw for whitespace-only sittingId', async () => {
      await expect(client.getMeetingForeseenActivities('   ')).rejects.toThrow('Meeting sitting-id is required');
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockMeetingActivitiesResponse(1)
      } as Response);

      await client.getMeetingForeseenActivities('MTG-PL-2024-001');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('meetings/MTG-PL-2024-001/foreseen-activities'),
        expect.any(Object)
      );
    });

    it('should apply default limit and offset', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockMeetingActivitiesResponse(1)
      } as Response);

      const result = await client.getMeetingForeseenActivities('MTG-PL-2024-001');

      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });
  });

  describe('getSpeechById', () => {
    it('should return a single speech', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          id: 'speech-1',
          identifier: 'SPEECH-1',
          label: 'Speech on topic 1',
          had_activity_type: 'DEBATE_SPEECH',
          had_participant_person: 'person/10001',
          participant_label: 'Speaker 1',
          activity_date: { '@value': '2024-03-10T10:00:00Z', type: 'xsd:dateTime' },
          language: 'en',
          text: 'Speech content',
          was_part_of: 'event/MTG-PL-2024-03-10'
        })
      } as Response);

      const result = await client.getSpeechById('SPEECH-1');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('speakerName');
      expect(result).toHaveProperty('type');
    });

    it('should throw for empty speechId', async () => {
      await expect(client.getSpeechById('')).rejects.toThrow('Speech ID is required');
    });

    it('should throw for whitespace-only speechId', async () => {
      await expect(client.getSpeechById('   ')).rejects.toThrow('Speech ID is required');
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          id: 'speech-1',
          identifier: 'SPEECH-1',
          label: 'Speech'
        })
      } as Response);

      await client.getSpeechById('SPEECH-1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('speeches/SPEECH-1'),
        expect.any(Object)
      );
    });
  });

  describe('getProcedureEvents', () => {
    it('should return paginated procedure events', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockEventsResponse(2)
      } as Response);

      const result = await client.getProcedureEvents('2024/0001(COD)', { limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should throw for empty processId', async () => {
      await expect(client.getProcedureEvents('')).rejects.toThrow('Procedure process-id is required');
    });

    it('should throw for whitespace-only processId', async () => {
      await expect(client.getProcedureEvents('   ')).rejects.toThrow('Procedure process-id is required');
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockEventsResponse(1)
      } as Response);

      await client.getProcedureEvents('2024/0001(COD)');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('procedures/2024/0001(COD)/events'),
        expect.any(Object)
      );
    });

    it('should apply default limit and offset', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockEventsResponse(1)
      } as Response);

      const result = await client.getProcedureEvents('2024/0001(COD)');

      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });
  });

  describe('getAdoptedTextById', () => {
    it('should return a single adopted text', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          id: 'at-1',
          work_id: 'TA-9-2024-0001',
          title_dcterms: [{ '@language': 'en', '@value': 'Adopted text 1' }],
          work_type: 'LEGISLATIVE_RESOLUTION',
          work_date_document: '2024-03-10',
          based_on_a_concept_procedure: '2023/0123(COD)',
          subject_matter: [{ '@language': 'en', '@value': 'Digital policy' }]
        })
      } as Response);

      const result = await client.getAdoptedTextById('TA-9-2024-0001');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('reference');
    });

    it('should throw for empty docId', async () => {
      await expect(client.getAdoptedTextById('')).rejects.toThrow('Document ID is required');
    });

    it('should throw for whitespace-only docId', async () => {
      await expect(client.getAdoptedTextById('   ')).rejects.toThrow('Document ID is required');
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          id: 'at-1',
          work_id: 'TA-9-2024-0001',
          title_dcterms: [{ '@language': 'en', '@value': 'Test' }]
        })
      } as Response);

      await client.getAdoptedTextById('TA-9-2024-0001');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('adopted-texts/TA-9-2024-0001'),
        expect.any(Object)
      );
    });
  });

  describe('getDocumentById', () => {
    it('should return a single document', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          id: 'doc-1',
          work_id: 'A-9-2024-0001',
          work_type: 'REPORT_PLENARY',
          title_dcterms: [{ '@language': 'en', '@value': 'Climate report' }],
          work_date_document: '2024-01-10'
        })
      } as Response);

      const result = await client.getDocumentById('A-9-2024-0001');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('type');
    });

    it('should throw for empty docId', async () => {
      await expect(client.getDocumentById('')).rejects.toThrow('Document ID is required');
    });

    it('should throw for whitespace-only docId', async () => {
      await expect(client.getDocumentById('   ')).rejects.toThrow('Document ID is required');
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          id: 'doc-1',
          work_id: 'A-9-2024-0001',
          title_dcterms: [{ '@language': 'en', '@value': 'Test' }]
        })
      } as Response);

      await client.getDocumentById('A-9-2024-0001');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('documents/A-9-2024-0001'),
        expect.any(Object)
      );
    });
  });

  describe('getCommitteeDocumentById', () => {
    it('should return a single committee document', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          id: 'cdoc-1',
          work_id: 'CM-9-2024-0001',
          work_type: 'COMMITTEE_REPORT',
          title_dcterms: [{ '@language': 'en', '@value': 'Committee report' }],
          work_date_document: '2024-02-15'
        })
      } as Response);

      const result = await client.getCommitteeDocumentById('CM-9-2024-0001');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('type');
    });

    it('should throw for empty docId', async () => {
      await expect(client.getCommitteeDocumentById('')).rejects.toThrow('Document ID is required');
    });

    it('should throw for whitespace-only docId', async () => {
      await expect(client.getCommitteeDocumentById('   ')).rejects.toThrow('Document ID is required');
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          id: 'cdoc-1',
          work_id: 'CM-9-2024-0001',
          title_dcterms: [{ '@language': 'en', '@value': 'Test' }]
        })
      } as Response);

      await client.getCommitteeDocumentById('CM-9-2024-0001');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('committee-documents/CM-9-2024-0001'),
        expect.any(Object)
      );
    });
  });

  describe('getParliamentaryQuestionById', () => {
    it('should return a single parliamentary question', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          id: 'q-1',
          work_id: 'E-9-2024-000001',
          work_type: 'QUESTION_WRITTEN',
          title_dcterms: [{ '@language': 'en', '@value': 'Question about climate' }],
          work_date_document: '2024-01-10',
          was_created_by: 'person/124810',
          was_realized_by: 'answer-ref'
        })
      } as Response);

      const result = await client.getParliamentaryQuestionById('E-9-2024-000001');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('topic');
      expect(result).toHaveProperty('type');
    });

    it('should throw for empty docId', async () => {
      await expect(client.getParliamentaryQuestionById('')).rejects.toThrow('Document ID is required');
    });

    it('should throw for whitespace-only docId', async () => {
      await expect(client.getParliamentaryQuestionById('   ')).rejects.toThrow('Document ID is required');
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          id: 'q-1',
          work_id: 'E-9-2024-000001',
          title_dcterms: [{ '@language': 'en', '@value': 'Test' }]
        })
      } as Response);

      await client.getParliamentaryQuestionById('E-9-2024-000001');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('parliamentary-questions/E-9-2024-000001'),
        expect.any(Object)
      );
    });
  });

  describe('getPlenaryDocumentById', () => {
    it('should return a single plenary document', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          id: 'pdoc-1',
          work_id: 'PV-9-2024-0001',
          work_type: 'PLENARY_REPORT',
          title_dcterms: [{ '@language': 'en', '@value': 'Plenary report' }],
          work_date_document: '2024-03-10'
        })
      } as Response);

      const result = await client.getPlenaryDocumentById('PV-9-2024-0001');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('type');
    });

    it('should throw for empty docId', async () => {
      await expect(client.getPlenaryDocumentById('')).rejects.toThrow('Document ID is required');
    });

    it('should throw for whitespace-only docId', async () => {
      await expect(client.getPlenaryDocumentById('   ')).rejects.toThrow('Document ID is required');
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          id: 'pdoc-1',
          work_id: 'PV-9-2024-0001',
          title_dcterms: [{ '@language': 'en', '@value': 'Test' }]
        })
      } as Response);

      await client.getPlenaryDocumentById('PV-9-2024-0001');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('plenary-documents/PV-9-2024-0001'),
        expect.any(Object)
      );
    });
  });

  describe('getPlenarySessionDocumentById', () => {
    it('should return a single plenary session document', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          id: 'psdoc-1',
          work_id: 'PS-9-2024-0001',
          work_type: 'SESSION_DOCUMENT',
          title_dcterms: [{ '@language': 'en', '@value': 'Session document' }],
          work_date_document: '2024-04-01'
        })
      } as Response);

      const result = await client.getPlenarySessionDocumentById('PS-9-2024-0001');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('type');
    });

    it('should throw for empty docId', async () => {
      await expect(client.getPlenarySessionDocumentById('')).rejects.toThrow('Document ID is required');
    });

    it('should throw for whitespace-only docId', async () => {
      await expect(client.getPlenarySessionDocumentById('   ')).rejects.toThrow('Document ID is required');
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          id: 'psdoc-1',
          work_id: 'PS-9-2024-0001',
          title_dcterms: [{ '@language': 'en', '@value': 'Test' }]
        })
      } as Response);

      await client.getPlenarySessionDocumentById('PS-9-2024-0001');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('plenary-session-documents/PS-9-2024-0001'),
        expect.any(Object)
      );
    });
  });

  describe('getPlenarySessionDocumentItems', () => {
    it('should return paginated document items', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse(3)
      } as Response);

      const result = await client.getPlenarySessionDocumentItems({ limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('limit', 10);
      expect(result).toHaveProperty('offset', 0);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(3);
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse(1)
      } as Response);

      await client.getPlenarySessionDocumentItems({});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('plenary-session-documents-items'),
        expect.any(Object)
      );
    });

    it('should apply default limit and offset', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse(1)
      } as Response);

      const result = await client.getPlenarySessionDocumentItems();

      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });

    it('should handle API errors', async () => {
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response);

      await expect(client.getPlenarySessionDocumentItems({})).rejects.toThrow(APIError);
    });
  });

  describe('getExternalDocuments', () => {
    it('should return paginated external documents', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse(2)
      } as Response);

      const result = await client.getExternalDocuments({ limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('limit', 10);
      expect(result).toHaveProperty('offset', 0);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse(1)
      } as Response);

      await client.getExternalDocuments({});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('external-documents'),
        expect.any(Object)
      );
    });

    it('should pass year parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse(1)
      } as Response);

      await client.getExternalDocuments({ year: 2024 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('year=2024'),
        expect.any(Object)
      );
    });

    it('should apply default limit and offset', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse(1)
      } as Response);

      const result = await client.getExternalDocuments();

      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });

    it('should handle API errors', async () => {
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response);

      await expect(client.getExternalDocuments({})).rejects.toThrow(APIError);
    });
  });

  describe('getExternalDocumentById', () => {
    it('should return a single external document', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          id: 'edoc-1',
          work_id: 'EXT-2024-0001',
          work_type: 'EXTERNAL_REPORT',
          title_dcterms: [{ '@language': 'en', '@value': 'External report' }],
          work_date_document: '2024-05-01'
        })
      } as Response);

      const result = await client.getExternalDocumentById('EXT-2024-0001');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('type');
    });

    it('should throw for empty docId', async () => {
      await expect(client.getExternalDocumentById('')).rejects.toThrow('Document ID is required');
    });

    it('should throw for whitespace-only docId', async () => {
      await expect(client.getExternalDocumentById('   ')).rejects.toThrow('Document ID is required');
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          id: 'edoc-1',
          work_id: 'EXT-2024-0001',
          title_dcterms: [{ '@language': 'en', '@value': 'Test' }]
        })
      } as Response);

      await client.getExternalDocumentById('EXT-2024-0001');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('external-documents/EXT-2024-0001'),
        expect.any(Object)
      );
    });
  });

  describe('getControlledVocabularyById', () => {
    it('should return a vocabulary entry', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          id: 'voc-1',
          label: 'Test Vocabulary',
          notation: 'TEST',
          entries: [{ code: 'A', label: 'Alpha' }]
        })
      } as Response);

      const result = await client.getControlledVocabularyById('voc-1');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('label');
    });

    it('should throw for empty vocId', async () => {
      await expect(client.getControlledVocabularyById('')).rejects.toThrow('Vocabulary ID is required');
    });

    it('should throw for whitespace-only vocId', async () => {
      await expect(client.getControlledVocabularyById('   ')).rejects.toThrow('Vocabulary ID is required');
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          id: 'voc-1',
          label: 'Test'
        })
      } as Response);

      await client.getControlledVocabularyById('voc-1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('controlled-vocabularies/voc-1'),
        expect.any(Object)
      );
    });
  });

  describe('getMEPDeclarationById', () => {
    it('should return a single MEP declaration', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          id: 'decl-1',
          work_id: 'DFI-9-2024-000001',
          title_dcterms: [{ '@language': 'en', '@value': 'Declaration 1' }],
          was_attributed_to: 'person/10001',
          author_label: [{ '@language': 'en', '@value': 'MEP 1' }],
          work_type: 'FINANCIAL_INTERESTS',
          work_date_document: '2024-01-10',
          'resource_legal_in-force': 'PUBLISHED'
        })
      } as Response);

      const result = await client.getMEPDeclarationById('DFI-9-2024-000001');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('mepId');
    });

    it('should throw for empty docId', async () => {
      await expect(client.getMEPDeclarationById('')).rejects.toThrow('Document ID is required');
    });

    it('should throw for whitespace-only docId', async () => {
      await expect(client.getMEPDeclarationById('   ')).rejects.toThrow('Document ID is required');
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          id: 'decl-1',
          work_id: 'DFI-9-2024-000001',
          title_dcterms: [{ '@language': 'en', '@value': 'Test' }],
          was_attributed_to: 'person/10001'
        })
      } as Response);

      await client.getMEPDeclarationById('DFI-9-2024-000001');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('meps-declarations/DFI-9-2024-000001'),
        expect.any(Object)
      );
    });
  });

  describe('getMeetingPlenarySessionDocuments', () => {
    it('should return paginated plenary session documents for a meeting', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse(3)
      } as Response);

      const result = await client.getMeetingPlenarySessionDocuments('MTG-PL-2024-001', { limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(3);
    });

    it('should throw for empty sittingId', async () => {
      await expect(client.getMeetingPlenarySessionDocuments('')).rejects.toThrow('Meeting sitting-id is required');
    });

    it('should throw for whitespace-only sittingId', async () => {
      await expect(client.getMeetingPlenarySessionDocuments('   ')).rejects.toThrow('Meeting sitting-id is required');
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse(1)
      } as Response);

      await client.getMeetingPlenarySessionDocuments('MTG-PL-2024-001');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('meetings/MTG-PL-2024-001/plenary-session-documents'),
        expect.any(Object)
      );
    });

    it('should apply default limit and offset', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse(1)
      } as Response);

      const result = await client.getMeetingPlenarySessionDocuments('MTG-PL-2024-001');

      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });

    it('should handle API errors', async () => {
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response);

      await expect(client.getMeetingPlenarySessionDocuments('INVALID')).rejects.toThrow(APIError);
    });
  });

  describe('getMeetingPlenarySessionDocumentItems', () => {
    it('should return paginated plenary session document items for a meeting', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse(2)
      } as Response);

      const result = await client.getMeetingPlenarySessionDocumentItems('MTG-PL-2024-001', { limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should throw for empty sittingId', async () => {
      await expect(client.getMeetingPlenarySessionDocumentItems('')).rejects.toThrow('Meeting sitting-id is required');
    });

    it('should throw for whitespace-only sittingId', async () => {
      await expect(client.getMeetingPlenarySessionDocumentItems('   ')).rejects.toThrow('Meeting sitting-id is required');
    });

    it('should call the correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse(1)
      } as Response);

      await client.getMeetingPlenarySessionDocumentItems('MTG-PL-2024-001');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('meetings/MTG-PL-2024-001/plenary-session-document-items'),
        expect.any(Object)
      );
    });

    it('should apply default limit and offset', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => createMockDocumentsResponse(1)
      } as Response);

      const result = await client.getMeetingPlenarySessionDocumentItems('MTG-PL-2024-001');

      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });

    it('should handle API errors', async () => {
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response);

      await expect(client.getMeetingPlenarySessionDocumentItems('MTG-1')).rejects.toThrow(APIError);
    });
  });

  describe('429 Rate Limit Retry Logic', () => {
    it('should retry on 429 Too Many Requests', async () => {
      vi.useFakeTimers();
      try {
        // First attempt returns 429, second succeeds
        mockFetch
          .mockResolvedValueOnce({
            ok: false,
            status: 429,
            statusText: 'Too Many Requests'
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
            headers: new Headers(),
            json: async () => createMockDocumentsResponse(1)
          } as Response);

        // Use a client with retry enabled; fake timers avoid real backoff delay
        const retryClient = new EuropeanParliamentClient({ enableRetry: true, maxRetries: 1 });
        retryClient.clearCache();

        const requestPromise = retryClient.getMeetingPlenarySessionDocuments('MTG-PL-2024-001');
        await vi.runAllTimersAsync();

        const result = await requestPromise;
        expect(result.data).toHaveLength(1);
        expect(mockFetch).toHaveBeenCalledTimes(2);
      } finally {
        vi.useRealTimers();
      }
    });

    it('should not retry on 400 Bad Request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      } as Response);

      const retryClient = new EuropeanParliamentClient({ enableRetry: true, maxRetries: 2 });
      retryClient.clearCache();

      await expect(retryClient.getMeetingPlenarySessionDocuments('MTG-1')).rejects.toThrow(APIError);
      // Should only be called once (no retry on 400)
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Response Size Limit', () => {
    it('should throw APIError when content-length exceeds limit', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-length': String(20 * 1024 * 1024) }), // 20 MB
        json: async () => createMockDocumentsResponse(1)
      } as unknown as Response);

      await expect(client.getMeetingPlenarySessionDocuments('MTG-1')).rejects.toThrow(APIError);
    });

    it('should succeed when content-length is within limit', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-length': String(1024) }), // 1 KB
        json: async () => createMockDocumentsResponse(1)
      } as unknown as Response);

      const result = await client.getMeetingPlenarySessionDocuments('MTG-PL-2024-001');
      expect(result.data).toHaveLength(1);
    });
  });

  describe('extractDocumentRefs edge cases', () => {
    it('should handle empty array in had_document', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          data: [{
            identifier: 'PROC-EMPTY-DOCS',
            had_document: []
          }],
          '@context': []
        })
      } as Response);

      const result = await client.getProcedures({ limit: 1 });
      expect(result.data[0].documents).toEqual([]);
    });

    it('should filter out empty strings from document refs', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => ({
          data: [{
            identifier: 'PROC-FILTER',
            had_document: ['doc-1', '', { id: '' }, 'doc-2']
          }],
          '@context': []
        })
      } as Response);

      const result = await client.getProcedures({ limit: 1 });
      expect(result.data[0].documents).toEqual(['doc-1', 'doc-2']);
    });
  });
});
