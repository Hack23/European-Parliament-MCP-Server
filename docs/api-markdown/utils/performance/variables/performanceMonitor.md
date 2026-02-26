[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/performance](../README.md) / performanceMonitor

# Variable: performanceMonitor

> `const` **performanceMonitor**: [`PerformanceMonitor`](../classes/PerformanceMonitor.md)

Defined in: [utils/performance.ts:358](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/utils/performance.ts#L358)

Global performance monitor instance

Shared instance for application-wide performance tracking.
Use this for convenience when you don't need isolated monitoring.

## Example

```typescript
import { performanceMonitor } from './utils/performance.js';

// Record duration
performanceMonitor.recordDuration('api_call', 150);

// Get statistics
const stats = performanceMonitor.getStats('api_call');
```
