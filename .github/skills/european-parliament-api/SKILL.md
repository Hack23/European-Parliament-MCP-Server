---
name: european-parliament-api
description: "Queries European Parliament API endpoints to fetch legislative documents, MEP profiles, voting records, and committee data with caching and rate limiting. Use when integrating EP Open Data Portal, fetching EU parliamentary data, accessing Europarl endpoints, or configuring API caching strategies."
license: MIT
---

# European Parliament API Integration Skill

## Context

This skill applies when:
- Integrating with European Parliament Open Data Portal API
- Fetching MEP profiles, plenary sessions, committee data, or legislative documents
- Configuring API caching, rate limiting, or retry strategies
- Validating EP API responses or handling multilingual data (24 EU languages)
- Adding EP source attribution or ensuring GDPR compliance

## Rules

1. **Use Official API**: Always use `https://data.europarl.europa.eu/api/v2/` endpoints
2. **Add Attribution**: Include European Parliament source attribution in all responses
3. **Respect Rate Limits**: Implement rate limiting (recommended: 60 requests/minute)
4. **Cache Appropriately**: Cache MEP data (1h), documents (6h), plenary votes (24h)
5. **Handle Multilingual Data**: Support all 24 official EU languages
6. **Validate Data**: Use Zod schemas to validate API responses
7. **Retry on Failure**: Implement exponential backoff for retries
8. **Handle 429 Responses**: Respect `Retry-After` header from API
9. **Log API Access**: Log all European Parliament API calls for audit
10. **Support GDPR**: Implement data minimization and cache time limits

## Workflow

1. Initialize API client with `User-Agent` header and base URL (`https://data.europarl.europa.eu/api/v2/`)
2. Configure rate limiter (60 req/min) — check burst limits before each request
3. Set up caches with TTLs per data type (MEPs: 1h, documents: 6h, votes: 24h)
4. Make request through rate limiter → validate response with Zod schema → add attribution
5. Return cached result on subsequent calls; purge stale entries hourly

## Examples

### ✅ Good Pattern: API Client with Caching

```typescript
import { LRUCache } from 'lru-cache';

const mepCache = new LRUCache<string, MEP>({
  max: 1000,
  ttl: 1000 * 60 * 60, // 1 hour
});

async function getMEP(id: number): Promise<MEP> {
  const cacheKey = `mep:${id}`;
  const cached = mepCache.get(cacheKey);
  if (cached) return cached;

  const response = await fetch(
    `https://data.europarl.europa.eu/api/v2/meps/${id}`,
    {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'European-Parliament-MCP-Server/1.0',
      },
    }
  );

  if (!response.ok) {
    throw new APIError(`EP API error: ${response.status}`);
  }

  const mep = await response.json();
  mepCache.set(cacheKey, mep);
  return mep;
}
```

### ✅ Good Pattern: Rate Limiter

```typescript
class EPAPIRateLimiter {
  private requests: number[] = [];
  private readonly maxPerMinute = 60;
  
  async waitForSlot(): Promise<void> {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    this.requests = this.requests.filter(t => t > oneMinuteAgo);
    
    if (this.requests.length >= this.maxPerMinute) {
      const waitTime = this.requests[0] + 60000 - now;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requests.push(now);
  }
}

const rateLimiter = new EPAPIRateLimiter();

async function fetchFromEP(url: string): Promise<Response> {
  await rateLimiter.waitForSlot();
  const response = await fetch(url);

  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
    await new Promise(resolve => setTimeout(resolve, waitTime));
    return fetchFromEP(url);
  }
  
  return response;
}
```

### ✅ Good Pattern: Data Attribution

```typescript
function addEPAttribution<T>(data: T): T & { _attribution: Attribution } {
  return {
    ...data,
    _attribution: {
      source: 'European Parliament',
      sourceUrl: 'https://data.europarl.europa.eu/',
      license: 'European Parliament copyright policy',
      retrievedAt: new Date().toISOString(),
    },
  };
}

interface Attribution {
  source: string;
  sourceUrl: string;
  license: string;
  retrievedAt: string;
}
```

## Anti-Patterns

- **No rate limiting**: Do not fire unbounded `Promise.all` against EP endpoints — always route through the rate limiter.
- **Missing attribution**: Every response must include EP source attribution; omitting it violates terms of use.
- **Unbounded caches**: Always set `max` size and `ttl` on caches to avoid memory leaks and stale data.

## ISMS Compliance

- **PR-001**: GDPR compliance for MEP personal data
- **AU-002**: Audit logging for API access
- **PE-001**: Performance optimization through caching

Reference: [Hack23 ISMS Policies](https://github.com/Hack23/ISMS-PUBLIC)
