[**European Parliament MCP Server API v0.6.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [clients/europeanParliamentClient](../README.md) / epClient

# Variable: epClient

> `const` **epClient**: [`EuropeanParliamentClient`](../classes/EuropeanParliamentClient.md)

Defined in: [clients/europeanParliamentClient.ts:3417](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/clients/europeanParliamentClient.ts#L3417)

Singleton instance of European Parliament API client for global use.

Pre-configured client with default settings (15 min cache, 100 req/min rate limit).
Recommended for most use cases to share cache and rate limiter across application.

**Configuration:**
- Base URL: https://data.europarl.europa.eu/api/v2/ (or EP_API_URL env var)
- Timeout: 10 seconds (or EP_REQUEST_TIMEOUT_MS env var)
- Cache: 15 min TTL, 500 entry max
- Rate Limit: 100 requests/minute

**Environment Variables:**
- `EP_API_URL`: Override base API URL
- `EP_REQUEST_TIMEOUT_MS`: Override request timeout in milliseconds (default: 10000)

## Examples

```typescript
import { epClient } from './clients/europeanParliamentClient.js';

// Use singleton instance
const meps = await epClient.getMEPs({ country: 'SE' });
```

```typescript
// Override timeout via environment variable for E2E tests
// EP_REQUEST_TIMEOUT_MS=30000 npm run test:e2e
const stats = epClient.getCacheStats();
console.log(`Global cache: ${stats.size} entries`);
```

## See

[EuropeanParliamentClient](../classes/EuropeanParliamentClient.md) for client class documentation
