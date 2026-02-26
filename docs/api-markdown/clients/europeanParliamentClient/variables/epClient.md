[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [clients/europeanParliamentClient](../README.md) / epClient

# Variable: epClient

> `const` **epClient**: [`EuropeanParliamentClient`](../classes/EuropeanParliamentClient.md)

Defined in: [clients/europeanParliamentClient.ts:745](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/clients/europeanParliamentClient.ts#L745)

Singleton instance of European Parliament API client for global use.

Pre-configured with defaults (15 min cache, 100 req/min rate limit).
Recommended for most use cases to share cache and rate limiter across
the application.

**Environment Variables:**
- `EP_API_URL`: Override base API URL
- `EP_REQUEST_TIMEOUT_MS`: Override request timeout in milliseconds (default: 10000)

## Example

```typescript
import { epClient } from './clients/europeanParliamentClient.js';
const meps = await epClient.getMEPs({ country: 'SE' });
```

## See

[EuropeanParliamentClient](../classes/EuropeanParliamentClient.md)
