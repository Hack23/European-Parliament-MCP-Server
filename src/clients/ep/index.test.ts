/**
 * Tests for src/clients/ep/index.ts barrel re-export
 *
 * Verifies all public exports are accessible from the ep/index barrel,
 * catching broken module references early.
 */

import { describe, it, expect } from 'vitest';
import * as epClients from './index.js';

describe('clients/ep/index barrel exports', () => {
  describe('Infrastructure exports', () => {
    it('should export BaseEPClient', () => {
      expect(epClients.BaseEPClient).toBeDefined();
      expect(typeof epClients.BaseEPClient).toBe('function');
    });

    it('should export APIError', () => {
      expect(epClients.APIError).toBeDefined();
      expect(typeof epClients.APIError).toBe('function');
    });

    it('should export DEFAULT_EP_API_BASE_URL', () => {
      expect(epClients.DEFAULT_EP_API_BASE_URL).toBe('https://data.europarl.europa.eu/api/v2/');
    });

    it('should export DEFAULT_REQUEST_TIMEOUT_MS', () => {
      expect(typeof epClients.DEFAULT_REQUEST_TIMEOUT_MS).toBe('number');
      expect(epClients.DEFAULT_REQUEST_TIMEOUT_MS).toBeGreaterThan(0);
    });

    it('should export DEFAULT_RETRY_ENABLED', () => {
      expect(typeof epClients.DEFAULT_RETRY_ENABLED).toBe('boolean');
    });

    it('should export DEFAULT_MAX_RETRIES', () => {
      expect(typeof epClients.DEFAULT_MAX_RETRIES).toBe('number');
    });

    it('should export DEFAULT_CACHE_TTL_MS', () => {
      expect(typeof epClients.DEFAULT_CACHE_TTL_MS).toBe('number');
      expect(epClients.DEFAULT_CACHE_TTL_MS).toBeGreaterThan(0);
    });

    it('should export DEFAULT_MAX_CACHE_SIZE', () => {
      expect(typeof epClients.DEFAULT_MAX_CACHE_SIZE).toBe('number');
      expect(epClients.DEFAULT_MAX_CACHE_SIZE).toBeGreaterThan(0);
    });

    it('should export DEFAULT_RATE_LIMIT_TOKENS', () => {
      expect(typeof epClients.DEFAULT_RATE_LIMIT_TOKENS).toBe('number');
    });

    it('should export DEFAULT_RATE_LIMIT_INTERVAL', () => {
      expect(epClients.DEFAULT_RATE_LIMIT_INTERVAL).toBe('minute');
    });

    it('should export DEFAULT_MAX_RESPONSE_BYTES', () => {
      expect(typeof epClients.DEFAULT_MAX_RESPONSE_BYTES).toBe('number');
      expect(epClients.DEFAULT_MAX_RESPONSE_BYTES).toBeGreaterThan(0);
    });
  });

  describe('Sub-client exports', () => {
    it('should export MEPClient', () => {
      expect(epClients.MEPClient).toBeDefined();
      expect(typeof epClients.MEPClient).toBe('function');
    });

    it('should export PlenaryClient', () => {
      expect(epClients.PlenaryClient).toBeDefined();
      expect(typeof epClients.PlenaryClient).toBe('function');
    });

    it('should export VotingClient', () => {
      expect(epClients.VotingClient).toBeDefined();
      expect(typeof epClients.VotingClient).toBe('function');
    });

    it('should export CommitteeClient', () => {
      expect(epClients.CommitteeClient).toBeDefined();
      expect(typeof epClients.CommitteeClient).toBe('function');
    });

    it('should export DocumentClient', () => {
      expect(epClients.DocumentClient).toBeDefined();
      expect(typeof epClients.DocumentClient).toBe('function');
    });

    it('should export LegislativeClient', () => {
      expect(epClients.LegislativeClient).toBeDefined();
      expect(typeof epClients.LegislativeClient).toBe('function');
    });

    it('should export QuestionClient', () => {
      expect(epClients.QuestionClient).toBeDefined();
      expect(typeof epClients.QuestionClient).toBe('function');
    });

    it('should export VocabularyClient', () => {
      expect(epClients.VocabularyClient).toBeDefined();
      expect(typeof epClients.VocabularyClient).toBe('function');
    });
  });

  describe('JSON-LD helper exports', () => {
    it('should export toSafeString', () => {
      expect(typeof epClients.toSafeString).toBe('function');
    });

    it('should export firstDefined', () => {
      expect(typeof epClients.firstDefined).toBe('function');
    });

    it('should export extractField', () => {
      expect(typeof epClients.extractField).toBe('function');
    });

    it('should export extractDateValue', () => {
      expect(typeof epClients.extractDateValue).toBe('function');
    });

    it('should export extractActivityDate', () => {
      expect(typeof epClients.extractActivityDate).toBe('function');
    });

    it('should export extractMultilingualText', () => {
      expect(typeof epClients.extractMultilingualText).toBe('function');
    });

    it('should export extractTextFromLangArray', () => {
      expect(typeof epClients.extractTextFromLangArray).toBe('function');
    });

    it('should export extractMemberIds', () => {
      expect(typeof epClients.extractMemberIds).toBe('function');
    });

    it('should export extractAuthorId', () => {
      expect(typeof epClients.extractAuthorId).toBe('function');
    });

    it('should export extractDocumentRefs', () => {
      expect(typeof epClients.extractDocumentRefs).toBe('function');
    });

    it('should export extractLocation', () => {
      expect(typeof epClients.extractLocation).toBe('function');
    });

    it('should export extractVoteCount', () => {
      expect(typeof epClients.extractVoteCount).toBe('function');
    });

    it('should export determineVoteOutcome', () => {
      expect(typeof epClients.determineVoteOutcome).toBe('function');
    });

    it('should export mapDocumentType', () => {
      expect(typeof epClients.mapDocumentType).toBe('function');
    });

    it('should export mapDocumentStatus', () => {
      expect(typeof epClients.mapDocumentStatus).toBe('function');
    });

    it('should export mapQuestionType', () => {
      expect(typeof epClients.mapQuestionType).toBe('function');
    });
  });

  describe('Transformer exports', () => {
    it('should export transformMEP', () => {
      expect(typeof epClients.transformMEP).toBe('function');
    });

    it('should export transformMEPDetails', () => {
      expect(typeof epClients.transformMEPDetails).toBe('function');
    });

    it('should export transformPlenarySession', () => {
      expect(typeof epClients.transformPlenarySession).toBe('function');
    });

    it('should export transformVoteResult', () => {
      expect(typeof epClients.transformVoteResult).toBe('function');
    });

    it('should export transformCorporateBody', () => {
      expect(typeof epClients.transformCorporateBody).toBe('function');
    });

    it('should export transformDocument', () => {
      expect(typeof epClients.transformDocument).toBe('function');
    });

    it('should export transformParliamentaryQuestion', () => {
      expect(typeof epClients.transformParliamentaryQuestion).toBe('function');
    });

    it('should export transformSpeech', () => {
      expect(typeof epClients.transformSpeech).toBe('function');
    });

    it('should export transformProcedure', () => {
      expect(typeof epClients.transformProcedure).toBe('function');
    });

    it('should export transformAdoptedText', () => {
      expect(typeof epClients.transformAdoptedText).toBe('function');
    });

    it('should export transformEvent', () => {
      expect(typeof epClients.transformEvent).toBe('function');
    });

    it('should export transformMeetingActivity', () => {
      expect(typeof epClients.transformMeetingActivity).toBe('function');
    });

    it('should export transformMEPDeclaration', () => {
      expect(typeof epClients.transformMEPDeclaration).toBe('function');
    });
  });

  describe('APIError functionality via barrel', () => {
    it('should create an APIError with correct properties', () => {
      const error = new epClients.APIError('test error', 404, { detail: 'x' });
      expect(error.name).toBe('APIError');
      expect(error.message).toBe('test error');
      expect(error.statusCode).toBe(404);
      expect(error.details).toEqual({ detail: 'x' });
      expect(error).toBeInstanceOf(Error);
    });
  });
});
