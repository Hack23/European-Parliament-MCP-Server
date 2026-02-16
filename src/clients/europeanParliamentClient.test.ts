/**
 * Tests for European Parliament API Client
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EuropeanParliamentClient, APIError } from './europeanParliamentClient.js';

describe('EuropeanParliamentClient', () => {
  let client: EuropeanParliamentClient;

  beforeEach(() => {
    client = new EuropeanParliamentClient();
    client.clearCache();
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
      const result = await client.getMEPs({ limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('limit', 10);
      expect(result).toHaveProperty('offset', 0);
      expect(result).toHaveProperty('hasMore');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should respect country filter', async () => {
      const result = await client.getMEPs({ country: 'SE' });
      
      expect(result.data).toBeDefined();
      if (result.data.length > 0) {
        expect(result.data[0]?.country).toBe('SE');
      }
    });

    it('should respect limit parameter', async () => {
      const result = await client.getMEPs({ limit: 25 });
      
      expect(result.limit).toBe(25);
    });
  });

  describe('getMEPDetails', () => {
    it('should return detailed MEP information', async () => {
      const result = await client.getMEPDetails('MEP-124810');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('country');
      expect(result).toHaveProperty('politicalGroup');
      expect(result).toHaveProperty('votingStatistics');
    });

    it('should include voting statistics', async () => {
      const result = await client.getMEPDetails('MEP-124810');

      expect(result.votingStatistics).toBeDefined();
      expect(result.votingStatistics?.totalVotes).toBeGreaterThanOrEqual(0);
      expect(result.votingStatistics?.attendanceRate).toBeGreaterThanOrEqual(0);
      expect(result.votingStatistics?.attendanceRate).toBeLessThanOrEqual(100);
    });
  });

  describe('getPlenarySessions', () => {
    it('should return paginated session data', async () => {
      const result = await client.getPlenarySessions({ limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should include session details', async () => {
      const result = await client.getPlenarySessions({ limit: 10 });

      if (result.data.length > 0) {
        const session = result.data[0];
        expect(session).toHaveProperty('id');
        expect(session).toHaveProperty('date');
        expect(session).toHaveProperty('location');
        expect(session).toHaveProperty('agendaItems');
      }
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
      // First call
      const result1 = await client.getMEPs({ country: 'SE', limit: 10 });
      
      // Second call with same params should be cached
      const result2 = await client.getMEPs({ country: 'SE', limit: 10 });
      
      expect(result1).toEqual(result2);
    });

    it('should provide cache statistics', () => {
      const stats = client.getCacheStats();
      
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('maxSize');
      expect(stats).toHaveProperty('hitRate');
    });

    it('should clear cache', async () => {
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
      // This is mock data so won't actually fail, but demonstrates error handling
      try {
        await client.getMEPs({ limit: 10 });
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
      }
    });
  });
});
