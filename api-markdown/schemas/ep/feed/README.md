[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / schemas/ep/feed

# schemas/ep/feed

Feed-endpoint Zod validation schemas.

All EP API v2 `/…/feed` endpoints share a common parameter pattern:
- `timeframe` — one of `today | one-day | one-week | one-month | custom`
- `startDate` — YYYY-MM-DD, required when `timeframe` is `custom`

Some feeds add a domain-specific type filter (`workType`, `activityType`,
`processType`).  Each schema below covers one feed endpoint.

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
