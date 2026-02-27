/**
 * Tests for schemas/europeanParliament.ts barrel re-export
 *
 * Verifies that all schema exports are accessible and properly re-exported
 * from the top-level barrel, catching broken module references early.
 */

import { describe, it, expect } from 'vitest';
import * as allSchemas from './europeanParliament.js';

describe('schemas/europeanParliament barrel exports', () => {
  it('should export PaginatedResponseSchema', () => {
    expect(allSchemas.PaginatedResponseSchema).toBeDefined();
    // PaginatedResponseSchema is a factory function (not a Zod schema directly),
    // so we verify it is a callable function rather than checking for .parse
    expect(typeof allSchemas.PaginatedResponseSchema).toBe('function');
  });

  describe('MEP schemas', () => {
    it('should export GetMEPsSchema', () => {
      expect(allSchemas.GetMEPsSchema).toBeDefined();
      expect(typeof allSchemas.GetMEPsSchema.parse).toBe('function');
    });

    it('should export GetMEPDetailsSchema', () => {
      expect(allSchemas.GetMEPDetailsSchema).toBeDefined();
      expect(typeof allSchemas.GetMEPDetailsSchema.parse).toBe('function');
    });

    it('should export MEPSchema', () => {
      expect(allSchemas.MEPSchema).toBeDefined();
      expect(typeof allSchemas.MEPSchema.parse).toBe('function');
    });

    it('should export MEPDetailsSchema', () => {
      expect(allSchemas.MEPDetailsSchema).toBeDefined();
      expect(typeof allSchemas.MEPDetailsSchema.parse).toBe('function');
    });

    it('should export GetCurrentMEPsSchema', () => {
      expect(allSchemas.GetCurrentMEPsSchema).toBeDefined();
      expect(typeof allSchemas.GetCurrentMEPsSchema.parse).toBe('function');
    });

    it('should export GetIncomingMEPsSchema', () => {
      expect(allSchemas.GetIncomingMEPsSchema).toBeDefined();
      expect(typeof allSchemas.GetIncomingMEPsSchema.parse).toBe('function');
    });

    it('should export GetOutgoingMEPsSchema', () => {
      expect(allSchemas.GetOutgoingMEPsSchema).toBeDefined();
      expect(typeof allSchemas.GetOutgoingMEPsSchema.parse).toBe('function');
    });

    it('should export GetHomonymMEPsSchema', () => {
      expect(allSchemas.GetHomonymMEPsSchema).toBeDefined();
      expect(typeof allSchemas.GetHomonymMEPsSchema.parse).toBe('function');
    });
  });

  describe('Plenary schemas', () => {
    it('should export GetPlenarySessionsSchema', () => {
      expect(allSchemas.GetPlenarySessionsSchema).toBeDefined();
      expect(typeof allSchemas.GetPlenarySessionsSchema.parse).toBe('function');
    });

    it('should export PlenarySessionSchema', () => {
      expect(allSchemas.PlenarySessionSchema).toBeDefined();
      expect(typeof allSchemas.PlenarySessionSchema.parse).toBe('function');
    });

    it('should export GetVotingRecordsSchema', () => {
      expect(allSchemas.GetVotingRecordsSchema).toBeDefined();
      expect(typeof allSchemas.GetVotingRecordsSchema.parse).toBe('function');
    });

    it('should export VotingRecordSchema', () => {
      expect(allSchemas.VotingRecordSchema).toBeDefined();
      expect(typeof allSchemas.VotingRecordSchema.parse).toBe('function');
    });
  });

  describe('Committee schemas', () => {
    it('should export GetCommitteeInfoSchema', () => {
      expect(allSchemas.GetCommitteeInfoSchema).toBeDefined();
      expect(typeof allSchemas.GetCommitteeInfoSchema.parse).toBe('function');
    });

    it('should export CommitteeSchema', () => {
      expect(allSchemas.CommitteeSchema).toBeDefined();
      expect(typeof allSchemas.CommitteeSchema.parse).toBe('function');
    });
  });

  describe('Document schemas', () => {
    it('should export SearchDocumentsSchema', () => {
      expect(allSchemas.SearchDocumentsSchema).toBeDefined();
      expect(typeof allSchemas.SearchDocumentsSchema.parse).toBe('function');
    });

    it('should export LegislativeDocumentSchema', () => {
      expect(allSchemas.LegislativeDocumentSchema).toBeDefined();
      expect(typeof allSchemas.LegislativeDocumentSchema.parse).toBe('function');
    });

    it('should export GetPlenaryDocumentsSchema', () => {
      expect(allSchemas.GetPlenaryDocumentsSchema).toBeDefined();
      expect(typeof allSchemas.GetPlenaryDocumentsSchema.parse).toBe('function');
    });

    it('should export GetCommitteeDocumentsSchema', () => {
      expect(allSchemas.GetCommitteeDocumentsSchema).toBeDefined();
      expect(typeof allSchemas.GetCommitteeDocumentsSchema.parse).toBe('function');
    });

    it('should export GetPlenarySessionDocumentsSchema', () => {
      expect(allSchemas.GetPlenarySessionDocumentsSchema).toBeDefined();
      expect(typeof allSchemas.GetPlenarySessionDocumentsSchema.parse).toBe('function');
    });

    it('should export GetPlenarySessionDocumentItemsSchema', () => {
      expect(allSchemas.GetPlenarySessionDocumentItemsSchema).toBeDefined();
      expect(typeof allSchemas.GetPlenarySessionDocumentItemsSchema.parse).toBe('function');
    });

    it('should export GetExternalDocumentsSchema', () => {
      expect(allSchemas.GetExternalDocumentsSchema).toBeDefined();
      expect(typeof allSchemas.GetExternalDocumentsSchema.parse).toBe('function');
    });
  });

  describe('Question schemas', () => {
    it('should export GetParliamentaryQuestionsSchema', () => {
      expect(allSchemas.GetParliamentaryQuestionsSchema).toBeDefined();
      expect(typeof allSchemas.GetParliamentaryQuestionsSchema.parse).toBe('function');
    });

    it('should export ParliamentaryQuestionSchema', () => {
      expect(allSchemas.ParliamentaryQuestionSchema).toBeDefined();
      expect(typeof allSchemas.ParliamentaryQuestionSchema.parse).toBe('function');
    });
  });

  describe('Analysis/OSINT schemas', () => {
    it('should export AnalyzeVotingPatternsSchema', () => {
      expect(allSchemas.AnalyzeVotingPatternsSchema).toBeDefined();
      expect(typeof allSchemas.AnalyzeVotingPatternsSchema.parse).toBe('function');
    });

    it('should export TrackLegislationSchema', () => {
      expect(allSchemas.TrackLegislationSchema).toBeDefined();
      expect(typeof allSchemas.TrackLegislationSchema.parse).toBe('function');
    });

    it('should export GenerateReportSchema', () => {
      expect(allSchemas.GenerateReportSchema).toBeDefined();
      expect(typeof allSchemas.GenerateReportSchema.parse).toBe('function');
    });

    it('should export AssessMepInfluenceSchema', () => {
      expect(allSchemas.AssessMepInfluenceSchema).toBeDefined();
      expect(typeof allSchemas.AssessMepInfluenceSchema.parse).toBe('function');
    });

    it('should export AnalyzeCoalitionDynamicsSchema', () => {
      expect(allSchemas.AnalyzeCoalitionDynamicsSchema).toBeDefined();
      expect(typeof allSchemas.AnalyzeCoalitionDynamicsSchema.parse).toBe('function');
    });

    it('should export DetectVotingAnomaliesSchema', () => {
      expect(allSchemas.DetectVotingAnomaliesSchema).toBeDefined();
      expect(typeof allSchemas.DetectVotingAnomaliesSchema.parse).toBe('function');
    });

    it('should export ComparePoliticalGroupsSchema', () => {
      expect(allSchemas.ComparePoliticalGroupsSchema).toBeDefined();
      expect(typeof allSchemas.ComparePoliticalGroupsSchema.parse).toBe('function');
    });

    it('should export AnalyzeLegislativeEffectivenessSchema', () => {
      expect(allSchemas.AnalyzeLegislativeEffectivenessSchema).toBeDefined();
      expect(typeof allSchemas.AnalyzeLegislativeEffectivenessSchema.parse).toBe('function');
    });

    it('should export MonitorLegislativePipelineSchema', () => {
      expect(allSchemas.MonitorLegislativePipelineSchema).toBeDefined();
      expect(typeof allSchemas.MonitorLegislativePipelineSchema.parse).toBe('function');
    });
  });

  describe('Activity schemas', () => {
    it('should export GetSpeechesSchema', () => {
      expect(allSchemas.GetSpeechesSchema).toBeDefined();
      expect(typeof allSchemas.GetSpeechesSchema.parse).toBe('function');
    });

    it('should export GetProceduresSchema', () => {
      expect(allSchemas.GetProceduresSchema).toBeDefined();
      expect(typeof allSchemas.GetProceduresSchema.parse).toBe('function');
    });

    it('should export GetAdoptedTextsSchema', () => {
      expect(allSchemas.GetAdoptedTextsSchema).toBeDefined();
      expect(typeof allSchemas.GetAdoptedTextsSchema.parse).toBe('function');
    });

    it('should export GetEventsSchema', () => {
      expect(allSchemas.GetEventsSchema).toBeDefined();
      expect(typeof allSchemas.GetEventsSchema.parse).toBe('function');
    });

    it('should export GetMeetingActivitiesSchema', () => {
      expect(allSchemas.GetMeetingActivitiesSchema).toBeDefined();
      expect(typeof allSchemas.GetMeetingActivitiesSchema.parse).toBe('function');
    });

    it('should export GetMeetingDecisionsSchema', () => {
      expect(allSchemas.GetMeetingDecisionsSchema).toBeDefined();
      expect(typeof allSchemas.GetMeetingDecisionsSchema.parse).toBe('function');
    });

    it('should export GetMEPDeclarationsSchema', () => {
      expect(allSchemas.GetMEPDeclarationsSchema).toBeDefined();
      expect(typeof allSchemas.GetMEPDeclarationsSchema.parse).toBe('function');
    });

    it('should export GetControlledVocabulariesSchema', () => {
      expect(allSchemas.GetControlledVocabulariesSchema).toBeDefined();
      expect(typeof allSchemas.GetControlledVocabulariesSchema.parse).toBe('function');
    });

    it('should export GetMeetingForeseenActivitiesSchema', () => {
      expect(allSchemas.GetMeetingForeseenActivitiesSchema).toBeDefined();
      expect(typeof allSchemas.GetMeetingForeseenActivitiesSchema.parse).toBe('function');
    });

    it('should export GetProcedureEventsSchema', () => {
      expect(allSchemas.GetProcedureEventsSchema).toBeDefined();
      expect(typeof allSchemas.GetProcedureEventsSchema.parse).toBe('function');
    });

    it('should export GetMeetingPlenarySessionDocumentsSchema', () => {
      expect(allSchemas.GetMeetingPlenarySessionDocumentsSchema).toBeDefined();
      expect(typeof allSchemas.GetMeetingPlenarySessionDocumentsSchema.parse).toBe('function');
    });

    it('should export GetMeetingPlenarySessionDocumentItemsSchema', () => {
      expect(allSchemas.GetMeetingPlenarySessionDocumentItemsSchema).toBeDefined();
      expect(typeof allSchemas.GetMeetingPlenarySessionDocumentItemsSchema.parse).toBe('function');
    });
  });
});
