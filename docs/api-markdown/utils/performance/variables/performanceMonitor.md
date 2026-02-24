[**European Parliament MCP Server API v0.6.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/performance](../README.md) / performanceMonitor

# Variable: performanceMonitor

> `const` **performanceMonitor**: [`PerformanceMonitor`](../classes/PerformanceMonitor.md)

Defined in: [utils/performance.ts:302](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/utils/performance.ts#L302)

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
