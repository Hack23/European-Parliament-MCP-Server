[**European Parliament MCP Server API v1.2.10**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / utils/mepFetcher

# utils/mepFetcher

Shared utility for fetching all current MEPs via paginated batches.

Used by OSINT tools that need full MEP counts (e.g., sentimentTracker,
analyzeCoalitionDynamics) to avoid per-group API calls that each trigger
a full multi-page fetch.

## Interfaces

- [FetchMEPsResult](interfaces/FetchMEPsResult.md)

## Functions

- [fetchAllCurrentMEPs](functions/fetchAllCurrentMEPs.md)
