[**European Parliament MCP Server API v1.1.0**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / schemas/ep

# schemas/ep

European Parliament Zod validation schemas – barrel re-export.

Organized by bounded context:
- **common** – shared primitives (CountryCode, DateString, PaginatedResponse)
- **mep** – MEP input/output schemas
- **plenary** – plenary session and voting record schemas
- **committee** – committee schemas
- **document** – legislative document schemas
- **question** – parliamentary question schemas
- **analysis** – OSINT intelligence analysis tool schemas
- **activities** – speeches, procedures, events, declarations

## References

### AnalyzeCoalitionDynamicsSchema

Re-exports [AnalyzeCoalitionDynamicsSchema](analysis/variables/AnalyzeCoalitionDynamicsSchema.md)

***

### AnalyzeLegislativeEffectivenessSchema

Re-exports [AnalyzeLegislativeEffectivenessSchema](analysis/variables/AnalyzeLegislativeEffectivenessSchema.md)

***

### AnalyzeVotingPatternsSchema

Re-exports [AnalyzeVotingPatternsSchema](analysis/variables/AnalyzeVotingPatternsSchema.md)

***

### AssessMepInfluenceSchema

Re-exports [AssessMepInfluenceSchema](analysis/variables/AssessMepInfluenceSchema.md)

***

### CommitteeSchema

Re-exports [CommitteeSchema](committee/variables/CommitteeSchema.md)

***

### ComparePoliticalGroupsSchema

Re-exports [ComparePoliticalGroupsSchema](analysis/variables/ComparePoliticalGroupsSchema.md)

***

### CorrelateIntelligenceSchema

Re-exports [CorrelateIntelligenceSchema](analysis/variables/CorrelateIntelligenceSchema.md)

***

### CountryCodeSchema

Re-exports [CountryCodeSchema](common/variables/CountryCodeSchema.md)

***

### DateStringSchema

Re-exports [DateStringSchema](common/variables/DateStringSchema.md)

***

### DetectVotingAnomaliesSchema

Re-exports [DetectVotingAnomaliesSchema](analysis/variables/DetectVotingAnomaliesSchema.md)

***

### FeedTimeframeSchema

Re-exports [FeedTimeframeSchema](feed/variables/FeedTimeframeSchema.md)

***

### GenerateReportSchema

Re-exports [GenerateReportSchema](analysis/variables/GenerateReportSchema.md)

***

### GetAdoptedTextsFeedSchema

Re-exports [GetAdoptedTextsFeedSchema](feed/variables/GetAdoptedTextsFeedSchema.md)

***

### GetAdoptedTextsSchema

Re-exports [GetAdoptedTextsSchema](activities/variables/GetAdoptedTextsSchema.md)

***

### GetCommitteeDocumentsFeedSchema

Re-exports [GetCommitteeDocumentsFeedSchema](feed/variables/GetCommitteeDocumentsFeedSchema.md)

***

### GetCommitteeDocumentsSchema

Re-exports [GetCommitteeDocumentsSchema](document/variables/GetCommitteeDocumentsSchema.md)

***

### GetCommitteeInfoSchema

Re-exports [GetCommitteeInfoSchema](committee/variables/GetCommitteeInfoSchema.md)

***

### GetControlledVocabulariesFeedSchema

Re-exports [GetControlledVocabulariesFeedSchema](feed/variables/GetControlledVocabulariesFeedSchema.md)

***

### GetControlledVocabulariesSchema

Re-exports [GetControlledVocabulariesSchema](activities/variables/GetControlledVocabulariesSchema.md)

***

### GetCorporateBodiesFeedSchema

Re-exports [GetCorporateBodiesFeedSchema](feed/variables/GetCorporateBodiesFeedSchema.md)

***

### GetCurrentMEPsSchema

Re-exports [GetCurrentMEPsSchema](mep/variables/GetCurrentMEPsSchema.md)

***

### GetDocumentsFeedSchema

Re-exports [GetDocumentsFeedSchema](feed/variables/GetDocumentsFeedSchema.md)

***

### GetEventsFeedSchema

Re-exports [GetEventsFeedSchema](feed/variables/GetEventsFeedSchema.md)

***

### GetEventsSchema

Re-exports [GetEventsSchema](activities/variables/GetEventsSchema.md)

***

### GetExternalDocumentsFeedSchema

Re-exports [GetExternalDocumentsFeedSchema](feed/variables/GetExternalDocumentsFeedSchema.md)

***

### GetExternalDocumentsSchema

Re-exports [GetExternalDocumentsSchema](document/variables/GetExternalDocumentsSchema.md)

***

### GetHomonymMEPsSchema

Re-exports [GetHomonymMEPsSchema](mep/variables/GetHomonymMEPsSchema.md)

***

### GetIncomingMEPsSchema

Re-exports [GetIncomingMEPsSchema](mep/variables/GetIncomingMEPsSchema.md)

***

### GetMeetingActivitiesSchema

Re-exports [GetMeetingActivitiesSchema](activities/variables/GetMeetingActivitiesSchema.md)

***

### GetMeetingDecisionsSchema

Re-exports [GetMeetingDecisionsSchema](activities/variables/GetMeetingDecisionsSchema.md)

***

### GetMeetingForeseenActivitiesSchema

Re-exports [GetMeetingForeseenActivitiesSchema](activities/variables/GetMeetingForeseenActivitiesSchema.md)

***

### GetMeetingPlenarySessionDocumentItemsSchema

Re-exports [GetMeetingPlenarySessionDocumentItemsSchema](activities/variables/GetMeetingPlenarySessionDocumentItemsSchema.md)

***

### GetMeetingPlenarySessionDocumentsSchema

Re-exports [GetMeetingPlenarySessionDocumentsSchema](activities/variables/GetMeetingPlenarySessionDocumentsSchema.md)

***

### GetMEPDeclarationsFeedSchema

Re-exports [GetMEPDeclarationsFeedSchema](feed/variables/GetMEPDeclarationsFeedSchema.md)

***

### GetMEPDeclarationsSchema

Re-exports [GetMEPDeclarationsSchema](activities/variables/GetMEPDeclarationsSchema.md)

***

### GetMEPDetailsSchema

Re-exports [GetMEPDetailsSchema](mep/variables/GetMEPDetailsSchema.md)

***

### GetMEPsFeedSchema

Re-exports [GetMEPsFeedSchema](feed/variables/GetMEPsFeedSchema.md)

***

### GetMEPsSchema

Re-exports [GetMEPsSchema](mep/variables/GetMEPsSchema.md)

***

### GetOutgoingMEPsSchema

Re-exports [GetOutgoingMEPsSchema](mep/variables/GetOutgoingMEPsSchema.md)

***

### GetParliamentaryQuestionsFeedSchema

Re-exports [GetParliamentaryQuestionsFeedSchema](feed/variables/GetParliamentaryQuestionsFeedSchema.md)

***

### GetParliamentaryQuestionsSchema

Re-exports [GetParliamentaryQuestionsSchema](question/variables/GetParliamentaryQuestionsSchema.md)

***

### GetPlenaryDocumentsFeedSchema

Re-exports [GetPlenaryDocumentsFeedSchema](feed/variables/GetPlenaryDocumentsFeedSchema.md)

***

### GetPlenaryDocumentsSchema

Re-exports [GetPlenaryDocumentsSchema](document/variables/GetPlenaryDocumentsSchema.md)

***

### GetPlenarySessionDocumentItemsSchema

Re-exports [GetPlenarySessionDocumentItemsSchema](document/variables/GetPlenarySessionDocumentItemsSchema.md)

***

### GetPlenarySessionDocumentsFeedSchema

Re-exports [GetPlenarySessionDocumentsFeedSchema](feed/variables/GetPlenarySessionDocumentsFeedSchema.md)

***

### GetPlenarySessionDocumentsSchema

Re-exports [GetPlenarySessionDocumentsSchema](document/variables/GetPlenarySessionDocumentsSchema.md)

***

### GetPlenarySessionsSchema

Re-exports [GetPlenarySessionsSchema](plenary/variables/GetPlenarySessionsSchema.md)

***

### GetProcedureEventByIdSchema

Re-exports [GetProcedureEventByIdSchema](feed/variables/GetProcedureEventByIdSchema.md)

***

### GetProcedureEventsSchema

Re-exports [GetProcedureEventsSchema](activities/variables/GetProcedureEventsSchema.md)

***

### GetProceduresFeedSchema

Re-exports [GetProceduresFeedSchema](feed/variables/GetProceduresFeedSchema.md)

***

### GetProceduresSchema

Re-exports [GetProceduresSchema](activities/variables/GetProceduresSchema.md)

***

### GetSpeechesSchema

Re-exports [GetSpeechesSchema](activities/variables/GetSpeechesSchema.md)

***

### GetVotingRecordsSchema

Re-exports [GetVotingRecordsSchema](plenary/variables/GetVotingRecordsSchema.md)

***

### LegislativeDocumentSchema

Re-exports [LegislativeDocumentSchema](document/variables/LegislativeDocumentSchema.md)

***

### MEPDetailsSchema

Re-exports [MEPDetailsSchema](mep/variables/MEPDetailsSchema.md)

***

### MEPSchema

Re-exports [MEPSchema](mep/variables/MEPSchema.md)

***

### MonitorLegislativePipelineSchema

Re-exports [MonitorLegislativePipelineSchema](analysis/variables/MonitorLegislativePipelineSchema.md)

***

### OsintStandardOutputSchema

Re-exports [OsintStandardOutputSchema](analysis/variables/OsintStandardOutputSchema.md)

***

### PaginatedResponseSchema

Re-exports [PaginatedResponseSchema](common/functions/PaginatedResponseSchema.md)

***

### ParliamentaryQuestionSchema

Re-exports [ParliamentaryQuestionSchema](question/variables/ParliamentaryQuestionSchema.md)

***

### PlenarySessionSchema

Re-exports [PlenarySessionSchema](plenary/variables/PlenarySessionSchema.md)

***

### SearchDocumentsSchema

Re-exports [SearchDocumentsSchema](document/variables/SearchDocumentsSchema.md)

***

### TrackLegislationSchema

Re-exports [TrackLegislationSchema](analysis/variables/TrackLegislationSchema.md)

***

### VotingRecordSchema

Re-exports [VotingRecordSchema](plenary/variables/VotingRecordSchema.md)
