/**
 * Tests for schemas/ep/index.ts barrel re-export
 *
 * Verifies that all schema exports from each domain module are accessible
 * via the ep barrel index, catching broken module references early.
 */

import { describe, it, expect } from 'vitest';
import * as epSchemas from './index.js';

describe('schemas/ep/index barrel exports', () => {
  describe('Common schemas', () => {
    it('should export CountryCodeSchema', () => {
      expect(epSchemas.CountryCodeSchema).toBeDefined();
      expect(typeof epSchemas.CountryCodeSchema.parse).toBe('function');
    });

    it('should export DateStringSchema', () => {
      expect(epSchemas.DateStringSchema).toBeDefined();
      expect(typeof epSchemas.DateStringSchema.parse).toBe('function');
    });

    it('should export PaginatedResponseSchema', () => {
      expect(epSchemas.PaginatedResponseSchema).toBeDefined();
      // PaginatedResponseSchema is a factory function (not a plain Zod schema),
      // so we verify callable rather than checking for .parse directly
      expect(typeof epSchemas.PaginatedResponseSchema).toBe('function');
    });

    it('CountryCodeSchema should accept valid 2-letter code', () => {
      expect(() => epSchemas.CountryCodeSchema.parse('DE')).not.toThrow();
    });

    it('CountryCodeSchema should reject invalid codes', () => {
      expect(() => epSchemas.CountryCodeSchema.parse('usa')).toThrow();
      expect(() => epSchemas.CountryCodeSchema.parse('D')).toThrow();
    });

    it('DateStringSchema should accept valid YYYY-MM-DD date', () => {
      expect(() => epSchemas.DateStringSchema.parse('2024-01-15')).not.toThrow();
    });

    it('DateStringSchema should reject invalid date formats', () => {
      expect(() => epSchemas.DateStringSchema.parse('01-15-2024')).toThrow();
      expect(() => epSchemas.DateStringSchema.parse('2024/01/15')).toThrow();
    });
  });

  describe('MEP schemas', () => {
    it('should export GetMEPsSchema', () => {
      expect(epSchemas.GetMEPsSchema).toBeDefined();
      expect(typeof epSchemas.GetMEPsSchema.parse).toBe('function');
    });

    it('should export GetMEPDetailsSchema', () => {
      expect(epSchemas.GetMEPDetailsSchema).toBeDefined();
      expect(typeof epSchemas.GetMEPDetailsSchema.parse).toBe('function');
    });

    it('should export MEPSchema', () => {
      expect(epSchemas.MEPSchema).toBeDefined();
      expect(typeof epSchemas.MEPSchema.parse).toBe('function');
    });

    it('should export MEPDetailsSchema', () => {
      expect(epSchemas.MEPDetailsSchema).toBeDefined();
      expect(typeof epSchemas.MEPDetailsSchema.parse).toBe('function');
    });

    it('should export GetCurrentMEPsSchema', () => {
      expect(epSchemas.GetCurrentMEPsSchema).toBeDefined();
      expect(typeof epSchemas.GetCurrentMEPsSchema.parse).toBe('function');
    });

    it('should export GetIncomingMEPsSchema', () => {
      expect(epSchemas.GetIncomingMEPsSchema).toBeDefined();
      expect(typeof epSchemas.GetIncomingMEPsSchema.parse).toBe('function');
    });

    it('should export GetOutgoingMEPsSchema', () => {
      expect(epSchemas.GetOutgoingMEPsSchema).toBeDefined();
      expect(typeof epSchemas.GetOutgoingMEPsSchema.parse).toBe('function');
    });

    it('should export GetHomonymMEPsSchema', () => {
      expect(epSchemas.GetHomonymMEPsSchema).toBeDefined();
      expect(typeof epSchemas.GetHomonymMEPsSchema.parse).toBe('function');
    });

    it('GetMEPsSchema should apply default limit of 50', () => {
      const result = epSchemas.GetMEPsSchema.parse({});
      expect(result.limit).toBe(50);
    });
  });

  describe('Plenary schemas', () => {
    it('should export GetPlenarySessionsSchema', () => {
      expect(epSchemas.GetPlenarySessionsSchema).toBeDefined();
      expect(typeof epSchemas.GetPlenarySessionsSchema.parse).toBe('function');
    });

    it('should export PlenarySessionSchema', () => {
      expect(epSchemas.PlenarySessionSchema).toBeDefined();
      expect(typeof epSchemas.PlenarySessionSchema.parse).toBe('function');
    });

    it('should export GetVotingRecordsSchema', () => {
      expect(epSchemas.GetVotingRecordsSchema).toBeDefined();
      expect(typeof epSchemas.GetVotingRecordsSchema.parse).toBe('function');
    });

    it('should export VotingRecordSchema', () => {
      expect(epSchemas.VotingRecordSchema).toBeDefined();
      expect(typeof epSchemas.VotingRecordSchema.parse).toBe('function');
    });
  });

  describe('Committee schemas', () => {
    it('should export GetCommitteeInfoSchema', () => {
      expect(epSchemas.GetCommitteeInfoSchema).toBeDefined();
      expect(typeof epSchemas.GetCommitteeInfoSchema.parse).toBe('function');
    });

    it('should export CommitteeSchema', () => {
      expect(epSchemas.CommitteeSchema).toBeDefined();
      expect(typeof epSchemas.CommitteeSchema.parse).toBe('function');
    });
  });

  describe('Document schemas', () => {
    it('should export SearchDocumentsSchema', () => {
      expect(epSchemas.SearchDocumentsSchema).toBeDefined();
      expect(typeof epSchemas.SearchDocumentsSchema.parse).toBe('function');
    });

    it('should export LegislativeDocumentSchema', () => {
      expect(epSchemas.LegislativeDocumentSchema).toBeDefined();
      expect(typeof epSchemas.LegislativeDocumentSchema.parse).toBe('function');
    });

    it('should export GetPlenaryDocumentsSchema', () => {
      expect(epSchemas.GetPlenaryDocumentsSchema).toBeDefined();
      expect(typeof epSchemas.GetPlenaryDocumentsSchema.parse).toBe('function');
    });

    it('should export GetCommitteeDocumentsSchema', () => {
      expect(epSchemas.GetCommitteeDocumentsSchema).toBeDefined();
      expect(typeof epSchemas.GetCommitteeDocumentsSchema.parse).toBe('function');
    });

    it('should export GetPlenarySessionDocumentsSchema', () => {
      expect(epSchemas.GetPlenarySessionDocumentsSchema).toBeDefined();
      expect(typeof epSchemas.GetPlenarySessionDocumentsSchema.parse).toBe('function');
    });

    it('should export GetPlenarySessionDocumentItemsSchema', () => {
      expect(epSchemas.GetPlenarySessionDocumentItemsSchema).toBeDefined();
      expect(typeof epSchemas.GetPlenarySessionDocumentItemsSchema.parse).toBe('function');
    });

    it('should export GetExternalDocumentsSchema', () => {
      expect(epSchemas.GetExternalDocumentsSchema).toBeDefined();
      expect(typeof epSchemas.GetExternalDocumentsSchema.parse).toBe('function');
    });
  });

  describe('Question schemas', () => {
    it('should export GetParliamentaryQuestionsSchema', () => {
      expect(epSchemas.GetParliamentaryQuestionsSchema).toBeDefined();
      expect(typeof epSchemas.GetParliamentaryQuestionsSchema.parse).toBe('function');
    });

    it('should export ParliamentaryQuestionSchema', () => {
      expect(epSchemas.ParliamentaryQuestionSchema).toBeDefined();
      expect(typeof epSchemas.ParliamentaryQuestionSchema.parse).toBe('function');
    });
  });

  describe('Analysis schemas', () => {
    it('should export AnalyzeVotingPatternsSchema', () => {
      expect(epSchemas.AnalyzeVotingPatternsSchema).toBeDefined();
      expect(typeof epSchemas.AnalyzeVotingPatternsSchema.parse).toBe('function');
    });

    it('should export TrackLegislationSchema', () => {
      expect(epSchemas.TrackLegislationSchema).toBeDefined();
      expect(typeof epSchemas.TrackLegislationSchema.parse).toBe('function');
    });

    it('should export GenerateReportSchema', () => {
      expect(epSchemas.GenerateReportSchema).toBeDefined();
      expect(typeof epSchemas.GenerateReportSchema.parse).toBe('function');
    });

    it('should export AssessMepInfluenceSchema', () => {
      expect(epSchemas.AssessMepInfluenceSchema).toBeDefined();
      expect(typeof epSchemas.AssessMepInfluenceSchema.parse).toBe('function');
    });

    it('should export AnalyzeCoalitionDynamicsSchema', () => {
      expect(epSchemas.AnalyzeCoalitionDynamicsSchema).toBeDefined();
      expect(typeof epSchemas.AnalyzeCoalitionDynamicsSchema.parse).toBe('function');
    });

    it('should export DetectVotingAnomaliesSchema', () => {
      expect(epSchemas.DetectVotingAnomaliesSchema).toBeDefined();
      expect(typeof epSchemas.DetectVotingAnomaliesSchema.parse).toBe('function');
    });

    it('should export ComparePoliticalGroupsSchema', () => {
      expect(epSchemas.ComparePoliticalGroupsSchema).toBeDefined();
      expect(typeof epSchemas.ComparePoliticalGroupsSchema.parse).toBe('function');
    });

    it('should export AnalyzeLegislativeEffectivenessSchema', () => {
      expect(epSchemas.AnalyzeLegislativeEffectivenessSchema).toBeDefined();
      expect(typeof epSchemas.AnalyzeLegislativeEffectivenessSchema.parse).toBe('function');
    });

    it('should export MonitorLegislativePipelineSchema', () => {
      expect(epSchemas.MonitorLegislativePipelineSchema).toBeDefined();
      expect(typeof epSchemas.MonitorLegislativePipelineSchema.parse).toBe('function');
    });
  });

  describe('Activity schemas', () => {
    it('should export GetSpeechesSchema', () => {
      expect(epSchemas.GetSpeechesSchema).toBeDefined();
      expect(typeof epSchemas.GetSpeechesSchema.parse).toBe('function');
    });

    it('should export GetProceduresSchema', () => {
      expect(epSchemas.GetProceduresSchema).toBeDefined();
      expect(typeof epSchemas.GetProceduresSchema.parse).toBe('function');
    });

    it('should export GetAdoptedTextsSchema', () => {
      expect(epSchemas.GetAdoptedTextsSchema).toBeDefined();
      expect(typeof epSchemas.GetAdoptedTextsSchema.parse).toBe('function');
    });

    it('should export GetEventsSchema', () => {
      expect(epSchemas.GetEventsSchema).toBeDefined();
      expect(typeof epSchemas.GetEventsSchema.parse).toBe('function');
    });

    it('should export GetMeetingActivitiesSchema', () => {
      expect(epSchemas.GetMeetingActivitiesSchema).toBeDefined();
      expect(typeof epSchemas.GetMeetingActivitiesSchema.parse).toBe('function');
    });

    it('should export GetMeetingDecisionsSchema', () => {
      expect(epSchemas.GetMeetingDecisionsSchema).toBeDefined();
      expect(typeof epSchemas.GetMeetingDecisionsSchema.parse).toBe('function');
    });

    it('should export GetMEPDeclarationsSchema', () => {
      expect(epSchemas.GetMEPDeclarationsSchema).toBeDefined();
      expect(typeof epSchemas.GetMEPDeclarationsSchema.parse).toBe('function');
    });

    it('should export GetControlledVocabulariesSchema', () => {
      expect(epSchemas.GetControlledVocabulariesSchema).toBeDefined();
      expect(typeof epSchemas.GetControlledVocabulariesSchema.parse).toBe('function');
    });

    it('should export GetMeetingForeseenActivitiesSchema', () => {
      expect(epSchemas.GetMeetingForeseenActivitiesSchema).toBeDefined();
      expect(typeof epSchemas.GetMeetingForeseenActivitiesSchema.parse).toBe('function');
    });

    it('should export GetProcedureEventsSchema', () => {
      expect(epSchemas.GetProcedureEventsSchema).toBeDefined();
      expect(typeof epSchemas.GetProcedureEventsSchema.parse).toBe('function');
    });

    it('should export GetMeetingPlenarySessionDocumentsSchema', () => {
      expect(epSchemas.GetMeetingPlenarySessionDocumentsSchema).toBeDefined();
      expect(typeof epSchemas.GetMeetingPlenarySessionDocumentsSchema.parse).toBe('function');
    });

    it('should export GetMeetingPlenarySessionDocumentItemsSchema', () => {
      expect(epSchemas.GetMeetingPlenarySessionDocumentItemsSchema).toBeDefined();
      expect(typeof epSchemas.GetMeetingPlenarySessionDocumentItemsSchema.parse).toBe('function');
    });
  });
});
