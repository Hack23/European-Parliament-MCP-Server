[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / clients/ep/baseClient

# clients/ep/baseClient

## Fileoverview

Base European Parliament API Client

Shared HTTP infrastructure for all EP API sub-clients:
LRU caching, token-bucket rate limiting, timeout/retry logic,
and structured audit/performance instrumentation.

**ISMS Policies:**
- SC-002 (Secure Coding Standards)
- PE-001 (Performance Standards)
- AU-002 (Audit Logging and Monitoring)
- DP-001 (Data Protection and GDPR Compliance)

## See

https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md

## Classes

- [APIError](classes/APIError.md)
- [BaseEPClient](classes/BaseEPClient.md)

## Variables

- [DEFAULT\_CACHE\_TTL\_MS](variables/DEFAULT_CACHE_TTL_MS.md)
- [DEFAULT\_EP\_API\_BASE\_URL](variables/DEFAULT_EP_API_BASE_URL.md)
- [DEFAULT\_MAX\_CACHE\_SIZE](variables/DEFAULT_MAX_CACHE_SIZE.md)
- [DEFAULT\_MAX\_RESPONSE\_BYTES](variables/DEFAULT_MAX_RESPONSE_BYTES.md)
- [DEFAULT\_MAX\_RETRIES](variables/DEFAULT_MAX_RETRIES.md)
- [DEFAULT\_RATE\_LIMIT\_INTERVAL](variables/DEFAULT_RATE_LIMIT_INTERVAL.md)
- [DEFAULT\_RATE\_LIMIT\_TOKENS](variables/DEFAULT_RATE_LIMIT_TOKENS.md)
- [DEFAULT\_REQUEST\_TIMEOUT\_MS](variables/DEFAULT_REQUEST_TIMEOUT_MS.md)
- [DEFAULT\_RETRY\_ENABLED](variables/DEFAULT_RETRY_ENABLED.md)
