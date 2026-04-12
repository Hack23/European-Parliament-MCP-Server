[**European Parliament MCP Server API v1.2.3**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/errors](../README.md) / ErrorCode

# Type Alias: ErrorCode

> **ErrorCode** = `"UPSTREAM_404"` \| `"UPSTREAM_500"` \| `"UPSTREAM_503"` \| `"UPSTREAM_TIMEOUT"` \| `"RATE_LIMITED"` \| `"INVALID_PARAMS"` \| `"FEED_FALLBACK"` \| `"UNKNOWN_TOOL"` \| `"INTERNAL_ERROR"`

Defined in: [tools/shared/errors.ts:11](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errors.ts#L11)

Machine-readable error codes for MCP tool error categorization.
Enables programmatic retry/skip/fallback logic by clients.
