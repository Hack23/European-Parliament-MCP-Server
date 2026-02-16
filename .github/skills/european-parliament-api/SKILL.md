---
name: european-parliament-api
description: European Parliament API integration patterns, data source navigation, response validation, and cache optimization
license: MIT
---

# European Parliament API Integration Skill

## Context

This skill applies when:
- Integrating with European Parliament Open Data Portal API
- Fetching MEP, plenary, committee, document, or question data
- Implementing API caching strategies
- Handling rate limits and retries
- Validating European Parliament data structures
- Supporting multilingual data (24 EU languages)
- Ensuring GDPR compliance for personal data
- Adding proper data attribution

The European Parliament Open Data Portal (`data.europarl.europa.eu`) is the authoritative source for all parliamentary data accessed through this MCP server.

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

## Examples

### ✅ Good Pattern: API Client with Caching

```typescript
import { LRUCache } from 'lru-cache';

// Cache configuration by data type
const mepCache = new LRUCache<string, MEP>({
  max: 1000,
  ttl: 1000 * 60 * 60, // 1 hour
});

// Fetch MEP with caching
async function getMEP(id: number): Promise<MEP> {
  const cacheKey = `mep:${id}`;
  
  // Check cache
  const cached = mepCache.get(cacheKey);
  if (cached) return cached;
  
  // Fetch from API
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
  
  // Cache result
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
  
  // Handle rate limit
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

### ❌ Bad: No Rate Limiting
```typescript
// NEVER - will hit rate limits!
async function bad() {
  const promises = ids.map(id => fetch(`https://data.europarl.europa.eu/api/v2/meps/${id}`));
  return await Promise.all(promises); // Too many concurrent requests!
}
```

### ❌ Bad: No Attribution
```typescript
// NEVER - violates EP terms of use!
async function bad() {
  const data = await fetchFromEP(url);
  return data; // Missing source attribution!
}
```

## ISMS Compliance

- **PR-001**: GDPR compliance for MEP personal data
- **AU-002**: Audit logging for API access
- **PE-001**: Performance optimization through caching

Reference: [Hack23 ISMS Policies](https://github.com/Hack23/ISMS-PUBLIC)
