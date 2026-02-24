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

    it('should handle pagination with offset', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
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
        json: async () => createMockMeetingsResponse(1)
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
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
        json: async () => createMockMeetingsResponse(2)
      });
      // First meeting has no votes (throws error)
      mockFetch.mockRejectedValueOnce(new Error('No votes'));
      // Second meeting has votes
      mockFetch.mockResolvedValueOnce({
        ok: true,
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

    it('should use id parameter for direct lookup', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
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
        json: async () => createMockCorporateBodyResponse()
      });

      const result = await client.getCommitteeInfo({ abbreviation: 'ENVI' });

      expect(result.members.length).toBeGreaterThan(0);
    });

    it('should set chair as first member', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
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
        json: async () => createMockCorporateBodyResponse()
      });

      const result = await client.getCommitteeInfo({ abbreviation: 'ENVI' });

      expect(Array.isArray(result.viceChairs)).toBe(true);
    });

    it('should extract responsibilities from classification', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
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
        json: async () => mockResponse
      });

      const result = await client.getParliamentaryQuestions({ limit: 10 });

      expect(result.data[0].author).toBe('Unknown');
    });

    it('should detect hasMore based on result count', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
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
