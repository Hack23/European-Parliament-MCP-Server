[**European Parliament MCP Server API v0.8.1**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / clients/europeanParliamentClient

# clients/europeanParliamentClient

## Fileoverview

European Parliament API Client – Facade

Thin facade that delegates every public method to a bounded-context
sub-client while keeping all public method signatures identical.
All sub-clients share the same LRU cache and rate-limiter bucket.

**Architecture:** Facade pattern over 8 domain sub-clients:
MEPClient · PlenaryClient · VotingClient · CommitteeClient ·
DocumentClient · LegislativeClient · QuestionClient · VocabularyClient

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

- [EuropeanParliamentClient](classes/EuropeanParliamentClient.md)

## Variables

- [epClient](variables/epClient.md)

## References

### APIError

Re-exports [APIError](../ep/baseClient/classes/APIError.md)

***

### DEFAULT\_CACHE\_TTL\_MS

Re-exports [DEFAULT_CACHE_TTL_MS](../ep/baseClient/variables/DEFAULT_CACHE_TTL_MS.md)

***

### DEFAULT\_EP\_API\_BASE\_URL

Re-exports [DEFAULT_EP_API_BASE_URL](../ep/baseClient/variables/DEFAULT_EP_API_BASE_URL.md)

***

### DEFAULT\_MAX\_CACHE\_SIZE

Re-exports [DEFAULT_MAX_CACHE_SIZE](../ep/baseClient/variables/DEFAULT_MAX_CACHE_SIZE.md)

***

### DEFAULT\_MAX\_RETRIES

Re-exports [DEFAULT_MAX_RETRIES](../ep/baseClient/variables/DEFAULT_MAX_RETRIES.md)

***

### DEFAULT\_RATE\_LIMIT\_INTERVAL

Re-exports [DEFAULT_RATE_LIMIT_INTERVAL](../ep/baseClient/variables/DEFAULT_RATE_LIMIT_INTERVAL.md)

***

### DEFAULT\_RATE\_LIMIT\_TOKENS

Re-exports [DEFAULT_RATE_LIMIT_TOKENS](../ep/baseClient/variables/DEFAULT_RATE_LIMIT_TOKENS.md)

***

### DEFAULT\_REQUEST\_TIMEOUT\_MS

Re-exports [DEFAULT_REQUEST_TIMEOUT_MS](../ep/baseClient/variables/DEFAULT_REQUEST_TIMEOUT_MS.md)

***

### DEFAULT\_RETRY\_ENABLED

Re-exports [DEFAULT_RETRY_ENABLED](../ep/baseClient/variables/DEFAULT_RETRY_ENABLED.md)
