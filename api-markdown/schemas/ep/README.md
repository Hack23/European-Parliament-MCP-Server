[**European Parliament MCP Server API v0.7.2**](../../README.md)

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

### CountryCodeSchema

Re-exports [CountryCodeSchema](common/variables/CountryCodeSchema.md)

***

### DateStringSchema

Re-exports [DateStringSchema](common/variables/DateStringSchema.md)

***

### DetectVotingAnomaliesSchema

Re-exports [DetectVotingAnomaliesSchema](analysis/variables/DetectVotingAnomaliesSchema.md)

***

### GenerateReportSchema

Re-exports [GenerateReportSchema](analysis/variables/GenerateReportSchema.md)

***

### GetAdoptedTextsSchema

Re-exports [GetAdoptedTextsSchema](activities/variables/GetAdoptedTextsSchema.md)

***

### GetCommitteeDocumentsSchema

Re-exports [GetCommitteeDocumentsSchema](document/variables/GetCommitteeDocumentsSchema.md)

***

### GetCommitteeInfoSchema

Re-exports [GetCommitteeInfoSchema](committee/variables/GetCommitteeInfoSchema.md)

***

### GetControlledVocabulariesSchema

Re-exports [GetControlledVocabulariesSchema](activities/variables/GetControlledVocabulariesSchema.md)

***

### GetCurrentMEPsSchema

Re-exports [GetCurrentMEPsSchema](mep/variables/GetCurrentMEPsSchema.md)

***

### GetEventsSchema

Re-exports [GetEventsSchema](activities/variables/GetEventsSchema.md)

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

### GetMEPDeclarationsSchema

Re-exports [GetMEPDeclarationsSchema](activities/variables/GetMEPDeclarationsSchema.md)

***

### GetMEPDetailsSchema

Re-exports [GetMEPDetailsSchema](mep/variables/GetMEPDetailsSchema.md)

***

### GetMEPsSchema

Re-exports [GetMEPsSchema](mep/variables/GetMEPsSchema.md)

***

### GetOutgoingMEPsSchema

Re-exports [GetOutgoingMEPsSchema](mep/variables/GetOutgoingMEPsSchema.md)

***

### GetParliamentaryQuestionsSchema

Re-exports [GetParliamentaryQuestionsSchema](question/variables/GetParliamentaryQuestionsSchema.md)

***

### GetPlenaryDocumentsSchema

Re-exports [GetPlenaryDocumentsSchema](document/variables/GetPlenaryDocumentsSchema.md)

***

### GetPlenarySessionDocumentItemsSchema

Re-exports [GetPlenarySessionDocumentItemsSchema](document/variables/GetPlenarySessionDocumentItemsSchema.md)

***

### GetPlenarySessionDocumentsSchema

Re-exports [GetPlenarySessionDocumentsSchema](document/variables/GetPlenarySessionDocumentsSchema.md)

***

### GetPlenarySessionsSchema

Re-exports [GetPlenarySessionsSchema](plenary/variables/GetPlenarySessionsSchema.md)

***

### GetProcedureEventsSchema

Re-exports [GetProcedureEventsSchema](activities/variables/GetProcedureEventsSchema.md)

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
