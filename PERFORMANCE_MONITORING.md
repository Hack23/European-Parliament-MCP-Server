# Performance Monitoring and Optimization Guide

This guide explains how to use the performance monitoring utilities and timeout handling in the European Parliament MCP Server.

## Overview

The server includes comprehensive performance monitoring and timeout handling to ensure:
- API response times < 200ms (target)
- Request timeout handling (10s default)
- Retry logic for transient failures
- Performance metrics collection and analysis

## Performance Monitoring

### PerformanceMonitor Class

The `PerformanceMonitor` class tracks operation durations and provides statistical analysis.

#### Basic Usage

```typescript
import { PerformanceMonitor } from './utils/performance.js';

const monitor = new PerformanceMonitor();

// Record operation durations
monitor.recordDuration('api_call', 150);
monitor.recordDuration('api_call', 200);
monitor.recordDuration('api_call', 175);

// Get statistics
const stats = monitor.getStats('api_call');
console.log(`
  p50: ${stats?.p50}ms
  p95: ${stats?.p95}ms
  p99: ${stats?.p99}ms
  avg: ${stats?.avg}ms
  min: ${stats?.min}ms
  max: ${stats?.max}ms
  count: ${stats?.count}
`);
```

#### With Async Operations

```typescript
import { withPerformanceTracking } from './utils/performance.js';

const result = await withPerformanceTracking(
  monitor,
  'fetch_meps',
  async () => {
    return await client.getMEPs({ limit: 100 });
  }
);
```

#### Global Monitor

Use the global performance monitor for application-wide tracking:

```typescript
import { performanceMonitor } from './utils/performance.js';

performanceMonitor.recordDuration('operation', 100);
const stats = performanceMonitor.getStats('operation');
```

### Performance Metrics

The European Parliament client automatically tracks:

- `ep_api_request` - Successful API requests
- `ep_api_request_failed` - Failed API requests
- `ep_api_cache_hit` - Cache hits

```typescript
import { performanceMonitor } from './utils/performance.js';

// Get performance statistics for all operations
const operations = performanceMonitor.getOperations();
operations.forEach(op => {
  const stats = performanceMonitor.getStats(op);
  if (stats && stats.p95 > 1000) {
    console.warn(`${op} is slow (p95: ${stats.p95}ms)`);
  }
});
```

## Timeout Handling

### withTimeout Function

Add timeout to any promise:

```typescript
import { withTimeout, TimeoutError } from './utils/timeout.js';

try {
  const result = await withTimeout(
    fetch('https://api.example.com'),
    5000, // 5 second timeout
    'API request timed out'
  );
} catch (error) {
  if (error instanceof TimeoutError) {
    console.error('Operation timed out after', error.timeoutMs, 'ms');
  }
}
```

### withRetry Function

Add retry logic with exponential backoff:

```typescript
import { withRetry } from './utils/timeout.js';

const data = await withRetry(
  () => fetchFromAPI('/endpoint'),
  {
    maxRetries: 3,
    timeoutMs: 5000,
    retryDelayMs: 1000, // Base delay, doubles each retry
    shouldRetry: (error) => {
      // Only retry 5xx errors
      return error.statusCode >= 500;
    }
  }
);
```

**Retry behavior**:
- Retry 1: Wait 1000ms
- Retry 2: Wait 2000ms
- Retry 3: Wait 4000ms

**Note**: Timeout errors are not retried by default.

## European Parliament Client Configuration

Configure timeout and retry behavior when creating the client:

```typescript
import { EuropeanParliamentClient } from './clients/europeanParliamentClient.js';

const client = new EuropeanParliamentClient({
  timeoutMs: 10000,      // 10 second timeout (default)
  enableRetry: true,     // Enable retry logic (default)
  maxRetries: 2,         // Maximum retry attempts (default)
  cacheTTL: 900000,      // 15 minute cache (default)
  maxCacheSize: 500      // 500 cache entries (default)
});
```

### Request Flow

1. **Rate limiting** - Check if request allowed
2. **Cache check** - Return cached data if available
3. **API request** - Make HTTP request with timeout
4. **Retry logic** - Retry on transient failures (5xx errors)
5. **Performance tracking** - Record duration
6. **Audit logging** - Log access with duration

## Audit Logging with Duration

All API operations now include duration tracking:

```typescript
// Successful operation
auditLogger.logDataAccess(
  'get_meps',
  { country: 'SE' },
  10,        // count of records
  150.5      // duration in milliseconds
);

// Failed operation
auditLogger.logError(
  'get_meps',
  { country: 'SE' },
  'API Error',
  150.5      // duration in milliseconds
);
```

Audit log format:
```json
{
  "timestamp": "2026-02-18T07:44:59.489Z",
  "action": "get_meps",
  "params": { "limit": 10 },
  "result": { "count": 10, "success": true },
  "duration": 1.277
}
```

## Performance Targets

### API Response Times

| Operation | Target | p95 Threshold | p99 Threshold |
|-----------|--------|---------------|---------------|
| Cache Hit | < 1ms | 5ms | 10ms |
| API Call | < 200ms | 500ms | 1000ms |
| Bulk Operation | < 1s | 2s | 5s |

### Error Budget

- **Timeout Rate**: < 1% of requests
- **Retry Rate**: < 5% of requests
- **Cache Hit Rate**: > 80%

## Monitoring Best Practices

### 1. Regular Statistics Review

```typescript
// Check performance every hour
setInterval(() => {
  const operations = performanceMonitor.getOperations();
  operations.forEach(op => {
    const stats = performanceMonitor.getStats(op);
    if (stats) {
      console.log(`${op}: p95=${stats.p95}ms, count=${stats.count}`);
    }
  });
}, 3600000);
```

### 2. Alert on Degradation

```typescript
const stats = performanceMonitor.getStats('ep_api_request');
if (stats && stats.p95 > 1000) {
  // Send alert - API is slow
  console.error('API performance degraded:', stats);
}
```

### 3. Clear Metrics Periodically

```typescript
// Reset metrics daily to prevent memory growth
setInterval(() => {
  performanceMonitor.clear();
}, 86400000);
```

## Troubleshooting

### High Timeout Rate

If timeout rate > 1%:
1. Check `timeoutMs` configuration - may be too aggressive
2. Verify European Parliament API status
3. Check network connectivity
4. Consider increasing timeout for specific operations

### Low Cache Hit Rate

If cache hit rate < 80%:
1. Increase `maxCacheSize` if memory allows
2. Increase `cacheTTL` for less frequently changing data
3. Review query patterns - highly variable queries won't cache well

### High Retry Rate

If retry rate > 5%:
1. European Parliament API may be unstable
2. Check network reliability
3. Review `shouldRetry` logic - may be too aggressive

## Performance Testing

Run performance benchmarks:

```bash
npm run test:performance
```

Example benchmark:

```typescript
describe('Performance Benchmarks', () => {
  it('should handle 100 concurrent requests', async () => {
    const requests = Array.from({ length: 100 }, () =>
      client.getMEPs({ limit: 10 })
    );
    
    const start = performance.now();
    await Promise.all(requests);
    const duration = performance.now() - start;
    
    // Should complete in < 5 seconds (50ms per request avg)
    expect(duration).toBeLessThan(5000);
  });
});
```

## Security Considerations

### Timeout Values

- **Too short**: May cause false failures
- **Too long**: Resource exhaustion risk
- **Recommended**: 10s for API calls, 30s for bulk operations

### Retry Logic

- **Exponential backoff**: Prevents retry storms
- **Max retries**: Prevents infinite loops
- **Selective retry**: Only retry transient failures (5xx)

### Performance Data

- **Aggregated only**: Don't log individual request details
- **No PII**: Performance logs must not contain personal data
- **Retention**: Clear old metrics to prevent memory leaks

## ISMS Compliance

### PE-001 (Performance Standards)

- ✅ API response time < 200ms (target)
- ✅ Performance monitoring and metrics
- ✅ Regular performance review and optimization

### MO-001 (Monitoring)

- ✅ Operation duration tracking
- ✅ Error rate monitoring
- ✅ Performance degradation alerting

### SC-002 (Secure Coding)

- ✅ Timeout handling prevents resource exhaustion
- ✅ Retry logic prevents cascading failures
- ✅ Performance data does not contain PII

## References

- [Secure Development Policy - Performance](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md#performance)
- [ISMS Monitoring Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Monitoring_Policy.md)
- [Performance Guide](./PERFORMANCE_GUIDE.md)
