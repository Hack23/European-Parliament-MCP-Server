# European Parliament API Integration Guide

This document provides comprehensive information about the integration between the European Parliament MCP Server and the European Parliament Open Data Portal API.

## 📋 Table of Contents

- [API Overview](#api-overview)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Response Formats](#response-formats)
- [Data Transformation](#data-transformation)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Data-Quality Warning Codes](#-data-quality-warning-codes)
- [Caching Strategy](#caching-strategy)
- [Testing](#testing)

## 🌐 API Overview

**Base URL:** `https://data.europarl.europa.eu/api/v2/`  
**Documentation:** https://data.europarl.europa.eu/en/developer-corner  
**OpenAPI Spec:** https://data.europarl.europa.eu/api/v2/

The European Parliament Open Data Portal provides access to:
- Members of European Parliament (MEPs)
- Plenary sessions and meetings
- Committee information
- Legislative documents and procedures
- Parliamentary questions
- Voting records

## 🔐 Authentication

**No authentication required!** The EP Open Data API is publicly accessible.

### Key Points:
- ✅ No API keys needed
- ✅ No OAuth flow required
- ✅ No registration process
- ⚠️ Rate limits apply (see below)

This simplifies deployment significantly compared to the original OAuth 2.0 implementation plan.

## 📡 API Endpoints

### Currently Implemented (Real API)

| Endpoint | EP API Path | Status | Notes |
|----------|------------|--------|-------|
| `getMEPs()` | `/meps` | ✅ Live | Returns list of MEPs with basic info |
| `getPlenarySessions()` | `/meetings` | ✅ Live | Returns plenary sessions |
| `getMEPDetails()` | `/meps/{id}` | ✅ Live | Returns detailed MEP information |

### Still Using Mock Data

| Endpoint | Target EP API | Status | Next Steps |
|----------|--------------|--------|------------|
| `getVotingRecords()` | `/meetings/{id}/vote-results` | 🔄 Mock | Map to vote results endpoint |
| `searchDocuments()` | `/documents` | 🔄 Mock | Implement document search |
| `getCommitteeInfo()` | `/corporate-bodies` | 🔄 Mock | Map to corporate bodies |
| `getParliamentaryQuestions()` | `/speeches` or custom | 🔄 Mock | Research EP equivalent |

## 📦 Response Formats

The EP API supports multiple formats:
- **RDF/XML** (default)
- **JSON-LD** (recommended) ← We use this
- **Turtle (TTL)**

### JSON-LD Format

```json
{
  "data": [
    {
      "id": "person/1",
      "type": "Person",
      "identifier": "1",
      "label": "Georg JARZEMBOWSKI",
      "familyName": "Jarzembowski",
      "givenName": "Georg",
      "sortLabel": "JARZEMBOWSKI"
    }
  ],
  "@context": [
    {
      "data": "@graph",
      "@base": "https://data.europarl.europa.eu/"
    },
    "https://data.europarl.europa.eu/api/v2/context.jsonld"
  ]
}
```

### Request Headers

We use the following headers:
```typescript
{
  'Accept': 'application/ld+json',
  'User-Agent': 'European-Parliament-MCP-Server/1.0'
}
```

## 🔄 Data Transformation

### MEP Transformation

EP API → Internal Format:

```typescript
// EP API (JSON-LD)
{
  "id": "person/1",
  "identifier": "1",
  "label": "Georg JARZEMBOWSKI",
  "familyName": "Jarzembowski",
  "givenName": "Georg"
}

// Internal Format
{
  "id": "1",
  "name": "Georg JARZEMBOWSKI",
  "country": "Unknown",  // Not in basic list
  "politicalGroup": "Unknown",  // Not in basic list
  "committees": [],  // Extracted from memberships
  "active": true,
  "termStart": "Unknown"  // Set to "Unknown" when not available from API
}
```

**Note:** Country, political group, and term start date are not available in the basic MEP list. This requires fetching individual MEP details or using additional queries.

### Plenary Session Transformation

```typescript
// EP API
{
  "id": "eli/dl/event/MTG-PL-2024-01-13",
  "activity_id": "MTG-PL-2024-01-13",
  "eli-dl:activity_date": {
    "@value": "2024-01-13T00:00:00+01:00",
    "type": "xsd:dateTime"
  },
  "hasLocality": "http://publications.europa.eu/resource/authority/place/FRA_SXB"
}

// Internal Format
{
  "id": "MTG-PL-2024-01-13",
  "date": "2024-01-13",
  "location": "Strasbourg",  // Mapped from hasLocality
  "agendaItems": [],
  "attendanceCount": 0,
  "documents": []
}
```

**Location Mapping:**
- `FRA_SXB` → "Strasbourg"
- `BEL_BRU` → "Brussels"
- Other → "Unknown"

## ⚠️ Error Handling

### Error Types

```typescript
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}
```

### Common Error Scenarios

| Status Code | Meaning | Handling |
|------------|---------|----------|
| 404 | Resource not found | Return empty result or throw APIError |
| 429 | Rate limit exceeded | Retry with exponential backoff |
| 500 | Server error | Log error, retry once |
| 503 | Service unavailable | Wait and retry |

### Example Error Handling

```typescript
try {
  const meps = await client.getMEPs({ country: 'SE' });
} catch (error) {
  if (error instanceof APIError) {
    if (error.statusCode === 429) {
      // Rate limit hit - wait before retry
      console.error('Rate limit exceeded');
    } else if (error.statusCode === 404) {
      // Not found - return empty result
      return { data: [], total: 0 };
    }
  }
  throw error;
}
```

## 🚦 Rate Limiting

### EP API Rate Limits

**Official Limit:** 500 requests per 5 minutes per endpoint

### Our Implementation

**Client-side limit:** 100 requests per minute (more conservative)

```typescript
const rateLimiter = new RateLimiter({
  tokensPerInterval: 100,
  interval: 'minute'
});
```

### Best Practices

1. **Use caching** - Cache responses for 15 minutes (our default)
2. **Batch requests** - Combine multiple queries when possible
3. **Pagination** - Use reasonable page sizes (default: 50 items)
4. **Exponential backoff** - Retry with increasing delays on 429

## 🛎️ Data-Quality Warning Codes

Feed-style tools (`get_*_feed`, `get_adopted_texts_feed`, `get_procedures_feed`,
`get_meps_feed`, …) and a small number of analytical tools surface a uniform
`dataQualityWarnings: string[]` field in their response envelope so consumers
can detect upstream degradation **mechanically** (without parsing prose). Each
entry begins with one of the structured codes documented below, followed by a
human-readable diagnostic. The envelope's `status` is automatically set to
`"degraded"` whenever any warning is present.

| Code | Emitted by | Trigger | Retryable? | Recommended consumer action |
|------|------------|---------|:---------:|-----------------------------|
| `FRESHNESS_FALLBACK` | `get_adopted_texts_feed` | Feed payload has zero items dated within the current calendar year, but the augmentation call to `/adopted-texts?year={Y}` succeeded. | ✅ Yes | Use the augmented `items[]` as fresh content; do NOT downgrade the freshness grade — the items are confirmable, current-year, EP-published documents. |
| `FRESHNESS_FALLBACK_FAILED` | `get_adopted_texts_feed` | Both the feed and the augmentation `/adopted-texts?year={Y}` returned no usable items. | ✅ Yes | Treat as `ANALYSIS_ONLY` — no current content available; do not synthesise narrative claims that require fresh source material. |
| `STALENESS_WARNING` | `get_procedures_feed` | Feed envelope is structurally healthy but no item carries a current-year `dateLastActivity` or `reference` (`YYYY/NNNN(...)`). | ✅ Yes | Fall back to `get_procedures(limit=100)` and sort client-side by `dateLastActivity` descending — the EP `/procedures` endpoint accepts no date filter, so this is the only reliable way to surface fresh procedures during the regression. |
| `OVERSIZED_PAYLOAD` | `get_meps_feed` | Item count exceeds the delta-vs-census threshold (200) — upstream delta-pagination has likely failed open to a full census dump. | ✅ Yes | Switch to `get_meps` for census queries; re-issue `get_meps_feed` with a narrower timeframe to see if the delta path recovers. |
| `ENRICHMENT_FAILED` | `get_*_feed` family (via `feedUtils`) | EP API returned a `200 OK` envelope containing an `error` body marker (the upstream enrichment step failed). The response includes `errorCode`, `retryable`, and an `upstream: { statusCode?, errorMessage? }` block. | ✅ Yes (typically) | Inspect `upstream.statusCode` (often 502/503/504); back off then retry. For `get_procedures_feed` the tool also auto-falls back to `GET /procedures` (non-feed) and surfaces the **degraded** payload along with this warning. |
| `UPSTREAM_TIMEOUT` | `get_procedures_feed` (and others using `feedUtils`) | The EP API request timed out (the procedures-feed endpoint is the most prone). | ✅ Yes | Retry with back-off, OR fall back to `get_procedures(limit=…)` for a single page of bounded-size results. |
| `RATE_LIMIT` | `get_*_feed` family (via `feedUtils`) | Upstream returned HTTP 429. | ✅ Yes | Honour the embedded `upstream.errorMessage` if it includes a `Retry-After` hint; otherwise back off exponentially. |

**Envelope shape with warnings (example):**

```jsonc
{
  "status": "degraded",                        // automatically derived
  "@context": [],
  "data": [ /* items as returned by the EP API */ ],
  "items": [ /* same items, plus fallback augmentations when applicable */ ],
  "dataQualityWarnings": [
    "FRESHNESS_FALLBACK: EP /adopted-texts/feed returned no items from the current year (2026). Augmented response with 12 item(s) from /adopted-texts?year=2026 …"
  ],
  "errorCode": "ENRICHMENT_FAILED",            // present only on enrichment failures
  "retryable": true,                            // present only on enrichment failures
  "upstream": { "statusCode": 502, "errorMessage": "…" }  // present only on enrichment failures
}
```

**Origin:** these codes were introduced in response to the
`Hack23/euparliamentmonitor` 2026-04-24 daily MCP-reliability audits — see
[`docs/EUPARLIAMENTMONITOR_RELIABILITY_RESPONSE.md`](EUPARLIAMENTMONITOR_RELIABILITY_RESPONSE.md)
for the full triage and the cross-repo issue trail. Consumer-side guidance for
each code is also tracked in `Hack23/euparliamentmonitor` issues
[#1422](https://github.com/Hack23/euparliamentmonitor/issues/1422)–[#1427](https://github.com/Hack23/euparliamentmonitor/issues/1427).

## 💾 Caching Strategy

### Cache Configuration

```typescript
const cache = new LRUCache({
  max: 500,                    // Maximum 500 entries
  ttl: 1000 * 60 * 15,        // 15 minutes TTL
  allowStale: false,           // Don't return stale data
  updateAgeOnGet: true         // Refresh age on access
});
```

### Cache Key Generation

```typescript
const cacheKey = JSON.stringify({ 
  endpoint: 'meps',
  params: { country: 'SE', limit: 10 }
});
```

### GDPR Compliance

⚠️ **Important:** Personal data (MEP information) should not be cached longer than necessary.

- Maximum cache TTL: 15 minutes
- Cache cleared on client restart
- No persistent storage of personal data

## 🧪 Testing

### Unit Tests (Mocked)

Client tests mock the `fetch` function:

```typescript
import { vi } from 'vitest';
import { fetch } from 'undici';

vi.mock('undici', () => ({
  fetch: vi.fn()
}));

mockFetch.mockResolvedValueOnce({
  ok: true,
  json: async () => ({
    data: [/* mock data */],
    '@context': [/* context */]
  })
});
```

### Tool Tests (Mocked)

Tool tests mock the `epClient`:

```typescript
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getMEPs: vi.fn()
  }
}));

vi.mocked(epClient.getMEPs).mockResolvedValue({
  data: [/* mock MEPs */],
  total: 1,
  limit: 50,
  offset: 0,
  hasMore: false
});
```

## 📚 Additional Resources

- [EP Open Data Portal](https://data.europarl.europa.eu/)
- [Developer Corner](https://data.europarl.europa.eu/en/developer-corner)
- [OpenAPI Specification](https://data.europarl.europa.eu/api/v2/)
- [EP Data Model Documentation](https://data.europarl.europa.eu/en/data-model)
- [JSON-LD Specification](https://json-ld.org/)

## 🔗 Related Documentation

- [README.md](../README.md) - Project overview
- [ARCHITECTURE.md](../ARCHITECTURE.md) - System architecture
- [SECURITY.md](../SECURITY.md) - Security policy
- [Hack23 ISMS Policies](https://github.com/Hack23/ISMS-PUBLIC)

---

**Last Updated:** 2026-02-17  
**API Version:** v2  
**MCP Server Version:** 0.5.0
