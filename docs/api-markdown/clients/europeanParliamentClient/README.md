[**European Parliament MCP Server API v0.6.2**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / clients/europeanParliamentClient

# clients/europeanParliamentClient

## Fileoverview

European Parliament API Client

Provides type-safe access to European Parliament Open Data Portal with
comprehensive security and performance features.

**Intelligence Perspective:** Primary OSINT data collection interface—implements
rate-limited, cached access to all EP datasets for intelligence product generation.

**Business Perspective:** Core API client powering all data products—reliability,
caching, and rate limiting directly impact SLA commitments and customer experience.

**Marketing Perspective:** Client performance metrics (cache hit rate, response time)
serve as key technical differentiators in developer marketing materials.

**ISMS Policies:**
- SC-002 (Secure Coding Standards)
- PE-001 (Performance Standards)
- AU-002 (Audit Logging and Monitoring)
- DP-001 (Data Protection and GDPR Compliance)

## See

https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md

## Classes

- [APIError](classes/APIError.md)
- [EuropeanParliamentClient](classes/EuropeanParliamentClient.md)

## Variables

- [DEFAULT\_CACHE\_TTL\_MS](variables/DEFAULT_CACHE_TTL_MS.md)
- [DEFAULT\_EP\_API\_BASE\_URL](variables/DEFAULT_EP_API_BASE_URL.md)
- [DEFAULT\_MAX\_CACHE\_SIZE](variables/DEFAULT_MAX_CACHE_SIZE.md)
- [DEFAULT\_MAX\_RETRIES](variables/DEFAULT_MAX_RETRIES.md)
- [DEFAULT\_RATE\_LIMIT\_INTERVAL](variables/DEFAULT_RATE_LIMIT_INTERVAL.md)
- [DEFAULT\_RATE\_LIMIT\_TOKENS](variables/DEFAULT_RATE_LIMIT_TOKENS.md)
- [DEFAULT\_REQUEST\_TIMEOUT\_MS](variables/DEFAULT_REQUEST_TIMEOUT_MS.md)
- [DEFAULT\_RETRY\_ENABLED](variables/DEFAULT_RETRY_ENABLED.md)
- [epClient](variables/epClient.md)
