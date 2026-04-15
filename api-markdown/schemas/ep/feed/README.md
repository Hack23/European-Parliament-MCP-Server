[**European Parliament MCP Server API v1.2.7**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / schemas/ep/feed

# schemas/ep/feed

Feed-endpoint Zod validation schemas.

EP API v2 `/…/feed` endpoints fall into two groups:

**Group A — Fixed-window feeds** (no timeframe parameter per OpenAPI spec):
  `documents/feed`, `plenary-documents/feed`, `committee-documents/feed`,
  `plenary-session-documents/feed`, `parliamentary-questions/feed`,
  `corporate-bodies/feed`, `controlled-vocabularies/feed`
  These return updates from a server-defined default window (typically one month).

**Group B — Configurable-window feeds** (accept `timeframe` + `start-date`):
  `meps/feed`, `events/feed`, `procedures/feed`, `adopted-texts/feed`,
  `meps-declarations/feed`, `external-documents/feed`
  Some also accept a domain-specific type filter (`workType`, `activityType`,
  `processType`).

## See

https://data.europarl.europa.eu/api/v2/ (OpenAPI spec)

## Variables

- [FeedTimeframeSchema](variables/FeedTimeframeSchema.md)
- [GetAdoptedTextsFeedSchema](variables/GetAdoptedTextsFeedSchema.md)
- [GetCommitteeDocumentsFeedSchema](variables/GetCommitteeDocumentsFeedSchema.md)
- [GetControlledVocabulariesFeedSchema](variables/GetControlledVocabulariesFeedSchema.md)
- [GetCorporateBodiesFeedSchema](variables/GetCorporateBodiesFeedSchema.md)
- [GetDocumentsFeedSchema](variables/GetDocumentsFeedSchema.md)
- [GetEventsFeedSchema](variables/GetEventsFeedSchema.md)
- [GetExternalDocumentsFeedSchema](variables/GetExternalDocumentsFeedSchema.md)
- [GetMEPDeclarationsFeedSchema](variables/GetMEPDeclarationsFeedSchema.md)
- [GetMEPsFeedSchema](variables/GetMEPsFeedSchema.md)
- [GetParliamentaryQuestionsFeedSchema](variables/GetParliamentaryQuestionsFeedSchema.md)
- [GetPlenaryDocumentsFeedSchema](variables/GetPlenaryDocumentsFeedSchema.md)
- [GetPlenarySessionDocumentsFeedSchema](variables/GetPlenarySessionDocumentsFeedSchema.md)
- [GetProcedureEventByIdSchema](variables/GetProcedureEventByIdSchema.md)
- [GetProceduresFeedSchema](variables/GetProceduresFeedSchema.md)
