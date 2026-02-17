# Performance Guide

<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="128" height="128">
</p>

<h1 align="center">European Parliament MCP Server - Performance Guide</h1>

<p align="center">
  <strong>Optimization strategies for maximum performance</strong><br>
  <em>Caching, rate limiting, query optimization, and monitoring</em>
</p>

---

## 📋 Table of Contents

- [Performance Goals](#performance-goals)
- [Caching Strategies](#caching-strategies)
- [Rate Limit Optimization](#rate-limit-optimization)
- [Query Optimization](#query-optimization)
- [Monitoring & Metrics](#monitoring--metrics)
- [Benchmarking](#benchmarking)
- [Troubleshooting Performance](#troubleshooting-performance)

---

## 🎯 Performance Goals

### Target Metrics

| Metric | Target | Acceptable | Critical |
|--------|--------|------------|----------|
| Cached response time | <1ms | <5ms | >10ms |
| API response time | <200ms | <500ms | >1000ms |
| Cache hit rate | >80% | >60% | <40% |
| Throughput (cached) | >10,000 req/s | >5,000 req/s | <1,000 req/s |
| Throughput (API) | >5 req/s | >2 req/s | <1 req/s |
| Memory usage | <256MB | <512MB | >1GB |

### Performance Requirements

- **P95 latency**: <200ms for API calls
- **P99 latency**: <500ms for API calls
- **Uptime**: 99.9%
- **Rate limit compliance**: 100 requests per 15 minutes

---

## 💾 Caching Strategies

### LRU Cache Configuration

**Optimal Settings**:

```typescript
const cache = new LRUCache<string, any>({
  max: 500,              // Maximum entries
  ttl: 15 * 60 * 1000,  // 15 minutes
  allowStale: false,     // Don't return stale data
  updateAgeOnGet: false  // Don't refresh TTL on access
});
```

**Cache Size Calculation**:

```typescript
// Estimate memory usage
const avgEntrySize = 5 * 1024;  // 5KB per entry
const maxEntries = 500;
const estimatedMemory = avgEntrySize * maxEntries / (1024 * 1024);
console.log(`Estimated cache memory: ${estimatedMemory}MB`);
```

### Cache Key Strategy

**Good cache keys**:

```typescript
// Unique and deterministic
function getCacheKey(method: string, params: Record<string, any>): string {
  const sorted = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);
  
  return `${method}:${JSON.stringify(sorted)}`;
}

// Example keys
getCacheKey('getMEPs', { country: 'SE', limit: 50 });
// => "getMEPs:{"country":"SE","limit":50}"

getCacheKey('getMEPs', { limit: 50, country: 'SE' });
// => "getMEPs:{"country":"SE","limit":50}"  (same key!)
```

### Cache Invalidation

**Time-based (TTL)**:

```typescript
// Set per-entry TTL
cache.set('key', value, { ttl: 10 * 60 * 1000 }); // 10 minutes

// Or use default TTL from config
cache.set('key', value); // Uses default 15 minutes
```

**Manual invalidation**:

```typescript
// Clear specific entry
cache.delete('key');

// Clear all entries matching pattern
for (const key of cache.keys()) {
  if (key.startsWith('getMEPs:')) {
    cache.delete(key);
  }
}

// Clear entire cache
cache.clear();
```

**Event-based invalidation**:

```typescript
// Invalidate when data changes
async function updateMEP(mepId: string, data: any) {
  await epClient.updateMEP(mepId, data);
  
  // Invalidate related cache entries
  cache.delete(`mep:${mepId}`);
  
  // Invalidate list caches that might include this MEP
  for (const key of cache.keys()) {
    if (key.startsWith('meps:')) {
      cache.delete(key);
    }
  }
}
```

### Cache Monitoring

```typescript
// Monitor cache statistics
setInterval(() => {
  console.log({
    size: cache.size,
    max: cache.max,
    hitRate: calculateHitRate()
  });
}, 60000); // Every minute

let hits = 0;
let misses = 0;

function calculateHitRate(): number {
  const total = hits + misses;
  return total > 0 ? (hits / total) * 100 : 0;
}

// Track hits/misses
function get(key: string) {
  const value = cache.get(key);
  if (value !== undefined) {
    hits++;
  } else {
    misses++;
  }
  return value;
}
```

---

## ⚡ Rate Limit Optimization

### Token Bucket Implementation

**Configuration**:

```typescript
class RateLimiter {
  constructor(
    private maxTokens: number = 100,
    private refillRate: number = 100, // tokens per window
    private windowMs: number = 15 * 60 * 1000  // 15 minutes
  ) {}

  async tryRemoveTokens(count: number = 1): Promise<boolean> {
    this.refill();
    
    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }
    
    return false;
  }

  private refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = (elapsed / this.windowMs) * this.refillRate;
    
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}
```

### Request Throttling

**Client-side throttling**:

```typescript
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private readonly delayMs = 1000; // 1 request per second

  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        this.process();
      }
    });
  }

  private async process() {
    this.processing = true;

    while (this.queue.length > 0) {
      const fn = this.queue.shift();
      if (fn) {
        await fn();
        await new Promise(resolve => setTimeout(resolve, this.delayMs));
      }
    }

    this.processing = false;
  }
}
```

### Batch Requests

**Combine multiple requests**:

```typescript
// Bad: Sequential individual requests
async function getMEPsFromCountries(countries: string[]) {
  const results = [];
  for (const country of countries) {
    const meps = await client.callTool('get_meps', { country });
    results.push(meps);
  }
  return results;
}

// Good: Parallel batch with concurrency limit
async function getMEPsFromCountriesBatch(
  countries: string[],
  concurrency: number = 5
) {
  const results = [];
  
  for (let i = 0; i < countries.length; i += concurrency) {
    const batch = countries.slice(i, i + concurrency);
    const promises = batch.map(country =>
      client.callTool('get_meps', { country })
    );
    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
  }
  
  return results;
}
```

---

## 🔍 Query Optimization

### Pagination Best Practices

**Use appropriate page sizes**:

```typescript
// Too small: Many requests, high overhead
const result1 = await client.callTool('get_meps', { limit: 10 });

// Optimal: Balance between response size and requests
const result2 = await client.callTool('get_meps', { limit: 50 });

// Too large: Large payloads, slow parsing
const result3 = await client.callTool('get_meps', { limit: 100 });
```

**Efficient pagination**:

```typescript
async function getAllMEPs(): Promise<MEP[]> {
  const allMEPs: MEP[] = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    const result = await client.callTool('get_meps', { limit, offset });
    const data = JSON.parse(result.content[0].text);
    
    allMEPs.push(...data.data);
    
    // Stop if we got fewer results than requested
    if (data.data.length < limit) {
      break;
    }
    
    offset += limit;
  }

  return allMEPs;
}
```

### Filter Optimization

**Push filters to API**:

```typescript
// Bad: Fetch all, filter locally
const allMEPs = await client.callTool('get_meps', { limit: 100 });
const swedishMEPs = allMEPs.data.filter(mep => mep.country === 'SE');

// Good: Filter at API level
const swedishMEPs = await client.callTool('get_meps', {
  country: 'SE',
  limit: 50
});
```

### Parallel Queries

**Combine independent queries**:

```typescript
// Bad: Sequential
const meps = await client.callTool('get_meps', { country: 'SE' });
const sessions = await client.callTool('get_plenary_sessions', {});
const committee = await client.callTool('get_committee_info', {
  abbreviation: 'ENVI'
});

// Good: Parallel
const [meps, sessions, committee] = await Promise.all([
  client.callTool('get_meps', { country: 'SE' }),
  client.callTool('get_plenary_sessions', {}),
  client.callTool('get_committee_info', { abbreviation: 'ENVI' })
]);
```

---

## 📊 Monitoring & Metrics

### Metrics Collection

**MetricsService usage**:

```typescript
import { MetricsService } from '../services/MetricsService.js';

const metrics = new MetricsService();

// Counter: Total requests
metrics.incrementCounter('tool_requests_total', {
  tool: 'get_meps',
  status: 'success'
});

// Gauge: Cache size
metrics.setGauge('cache_size', cache.size);

// Histogram: Response times
const start = Date.now();
const result = await fetchData();
const duration = Date.now() - start;
metrics.observeHistogram('response_time_ms', duration, { tool: 'get_meps' });
```

### Key Performance Indicators

**Track these metrics**:

```typescript
// Response time percentiles
const p50 = metrics.getPercentile('response_time_ms', 50);
const p95 = metrics.getPercentile('response_time_ms', 95);
const p99 = metrics.getPercentile('response_time_ms', 99);

console.log(`Response times: P50=${p50}ms, P95=${p95}ms, P99=${p99}ms`);

// Cache performance
const cacheHits = metrics.getCounter('cache_hits');
const cacheMisses = metrics.getCounter('cache_misses');
const hitRate = (cacheHits / (cacheHits + cacheMisses)) * 100;

console.log(`Cache hit rate: ${hitRate.toFixed(2)}%`);

// Throughput
const requests = metrics.getCounter('tool_requests_total');
const duration = 60; // seconds
const throughput = requests / duration;

console.log(`Throughput: ${throughput.toFixed(2)} req/s`);
```

### Logging Performance

**Structured logging**:

```typescript
import { logger } from './utils/logger.js';

// Log slow requests
const threshold = 500; // ms
if (duration > threshold) {
  logger.warn('Slow request detected', {
    tool: 'get_meps',
    duration,
    params: { country: 'SE' }
  });
}

// Log cache statistics
logger.info('Cache statistics', {
  size: cache.size,
  hitRate,
  evictions: metrics.getCounter('cache_evictions')
});
```

---

## 🏆 Benchmarking

### Performance Tests

**Cached request benchmark**:

```typescript
// tests/performance/cached-requests.test.ts
import { describe, it, expect } from 'vitest';

describe('Cached Request Performance', () => {
  it('should respond in <1ms for cached requests', async () => {
    // Warm cache
    await client.callTool('get_meps', { country: 'SE' });

    // Measure cached response
    const start = performance.now();
    await client.callTool('get_meps', { country: 'SE' });
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(1); // <1ms
  });
});
```

**Concurrent request benchmark**:

```typescript
it('should handle 50 concurrent requests', async () => {
  const requests = Array(50).fill(null).map((_, i) =>
    client.callTool('get_meps', {
      country: 'SE',
      offset: i * 10,
      limit: 10
    })
  );

  const start = performance.now();
  await Promise.all(requests);
  const duration = performance.now() - start;

  expect(duration).toBeLessThan(10000); // <10s for 50 requests
});
```

### Load Testing

**Using autocannon**:

```bash
# Install autocannon
npm install -g autocannon

# Basic load test
autocannon -c 10 -d 30 http://localhost:3000/tools/get_meps

# Results:
# Latency:
#   Avg: 125ms
#   Stdev: 45ms
#   Max: 250ms
# Req/Sec: 80
# Total: 2400 requests
```

**Using k6**:

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  const payload = JSON.stringify({
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'get_meps',
      arguments: { country: 'SE' }
    },
    id: 1
  });

  const res = http.post('http://localhost:3000', payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
```

---

## 🐛 Troubleshooting Performance

### Slow Responses

**Diagnosis**:

```typescript
// Add timing logs
console.time('total');

console.time('validation');
const params = schema.parse(args);
console.timeEnd('validation'); // ~1-3ms

console.time('cache_check');
const cached = cache.get(key);
console.timeEnd('cache_check'); // <1ms

console.time('api_call');
const data = await epClient.getData(params);
console.timeEnd('api_call'); // ~150-200ms

console.timeEnd('total');
```

**Solutions**:

1. **Optimize validation**: Use simpler regex patterns
2. **Increase cache size**: More cached responses
3. **Reduce API calls**: Better cache hit rate
4. **Use CDN**: For static content
5. **Enable compression**: Reduce payload size

### High Memory Usage

**Diagnosis**:

```bash
# Monitor memory
node --expose-gc dist/index.js &
PID=$!

while true; do
  ps -p $PID -o rss,vsz,pmem,cmd
  sleep 5
done
```

**Solutions**:

```typescript
// 1. Reduce cache size
const cache = new LRUCache({ max: 100 }); // Reduce from 500

// 2. Use shorter TTL
const cache = new LRUCache({
  max: 500,
  ttl: 5 * 60 * 1000  // 5 minutes instead of 15
});

// 3. Manual garbage collection
if (global.gc) {
  setInterval(() => {
    global.gc();
  }, 60000); // Every minute
}
```

### Low Cache Hit Rate

**Diagnosis**:

```typescript
// Track cache statistics
let hits = 0;
let misses = 0;

const originalGet = cache.get.bind(cache);
cache.get = (key: string) => {
  const value = originalGet(key);
  if (value !== undefined) hits++;
  else misses++;
  return value;
};

setInterval(() => {
  const total = hits + misses;
  const hitRate = total > 0 ? (hits / total) * 100 : 0;
  console.log(`Cache hit rate: ${hitRate.toFixed(2)}%`);
}, 10000);
```

**Solutions**:

1. **Increase TTL**: Longer cache lifetime
2. **Increase cache size**: Store more entries
3. **Normalize cache keys**: Consistent key format
4. **Pre-warm cache**: Load common queries on startup

---

## 📚 Additional Resources

- [API Usage Guide](./API_USAGE_GUIDE.md)
- [Architecture Diagrams](./ARCHITECTURE_DIAGRAMS.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://hack23.com">Hack23 AB</a></strong><br>
  <em>ISMS-compliant performance optimization demonstrating excellence</em>
</p>
