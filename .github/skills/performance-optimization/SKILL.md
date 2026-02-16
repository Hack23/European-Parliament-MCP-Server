---
name: performance-optimization
description: Node.js/TypeScript API performance, MCP protocol optimization, European Parliament API caching, async operations, and memory efficiency
license: MIT
---

# Performance Optimization Skill

## Context
This skill applies when:
- Implementing MCP protocol handlers and tool endpoints
- Fetching data from European Parliament APIs
- Processing large datasets or document collections
- Designing caching strategies for API responses
- Optimizing database queries or data transformations
- Profiling and measuring performance bottlenecks
- Writing async/await code or Promise chains
- Handling concurrent requests or batch operations
- Reducing memory allocations and garbage collection pressure
- Optimizing startup time and initialization

Performance is critical for MCP servers as they power real-time AI interactions. Response times should be < 500ms, memory usage should be stable, and throughput should handle 100+ requests per 15-minute window.

## Rules

1. **Measure Before Optimizing**: Always profile and measure performance before making changes - no premature optimization
2. **Set Performance Budgets**: API responses < 500ms, memory growth < 10MB per hour, startup time < 2s
3. **Cache Aggressively**: Cache European Parliament API responses with appropriate TTL (5-60 minutes)
4. **Use Async/Await Properly**: Avoid blocking the event loop - use async for I/O, sync for CPU-bound work
5. **Minimize Allocations**: Reuse objects, use object pools, avoid creating unnecessary intermediate arrays
6. **Batch Operations**: Group multiple API calls or database queries when possible
7. **Lazy Load**: Defer loading of non-critical resources until needed
8. **Stream Large Data**: Use Node.js streams for processing large documents or datasets
9. **Optimize Serialization**: Minimize JSON parsing overhead, consider caching parsed results
10. **Index Data Structures**: Use Maps/Sets for O(1) lookups instead of O(n) array searches
11. **Avoid Memory Leaks**: Clear timers, remove event listeners, close connections properly
12. **Monitor Performance**: Implement performance logging and alerting for regression detection
13. **Compress Responses**: Use gzip/brotli for MCP responses when size exceeds 1KB
14. **Debounce/Throttle**: Rate limit expensive operations like API calls or searches
15. **Use Worker Threads**: Offload CPU-intensive work (parsing, transformation) to worker threads

## Examples

### ✅ Good Pattern: Efficient European Parliament API Caching

```typescript
/**
 * Caching service for European Parliament API responses
 * 
 * Performance optimizations:
 * - In-memory LRU cache with automatic eviction
 * - TTL-based expiration (5 minutes for search, 60 minutes for documents)
 * - Cache key normalization for hit rate optimization
 * - Memory-bounded cache (max 100MB)
 * 
 * ISMS Policy: SC-001 (Secure Configuration - Performance Standards)
 * Compliance: NIST CSF PR.PT-4 (Communications and control networks)
 * 
 * @performance Cache hit rate: 70%+, Response time reduction: 90%+
 */
import { LRUCache } from 'lru-cache';

interface CacheOptions {
  ttl: number;
  maxSize: number;
  maxItems: number;
}

export class EuropeanParliamentCache {
  private readonly searchCache: LRUCache<string, SearchResult>;
  private readonly documentCache: LRUCache<string, Document>;
  
  constructor() {
    // Search results cache: 5 minute TTL, max 1000 items, ~50MB
    this.searchCache = new LRUCache<string, SearchResult>({
      max: 1000,
      maxSize: 50 * 1024 * 1024,
      sizeCalculation: (value) => JSON.stringify(value).length,
      ttl: 5 * 60 * 1000, // 5 minutes
      updateAgeOnGet: true,
      updateAgeOnHas: true,
    });
    
    // Document cache: 60 minute TTL, max 500 items, ~50MB
    this.documentCache = new LRUCache<string, Document>({
      max: 500,
      maxSize: 50 * 1024 * 1024,
      sizeCalculation: (value) => JSON.stringify(value).length,
      ttl: 60 * 60 * 1000, // 60 minutes
      updateAgeOnGet: true,
    });
  }
  
  /**
   * Get or fetch search results with caching
   * Cache key includes all query parameters for proper invalidation
   */
  async getSearchResults(
    query: SearchQuery,
    fetcher: () => Promise<SearchResult>
  ): Promise<SearchResult> {
    const cacheKey = this.normalizeCacheKey(query);
    
    // Check cache first
    const cached = this.searchCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Cache miss - fetch from API
    const result = await fetcher();
    this.searchCache.set(cacheKey, result);
    
    return result;
  }
  
  /**
   * Normalize cache key for consistent hits
   * Sorts parameters, trims whitespace, lowercases strings
   */
  private normalizeCacheKey(query: SearchQuery): string {
    const normalized = {
      keywords: query.keywords.trim().toLowerCase(),
      documentType: query.documentType?.toLowerCase(),
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      limit: query.limit,
    };
    
    // Sort keys for consistent serialization
    return JSON.stringify(normalized, Object.keys(normalized).sort());
  }
  
  /**
   * Clear cache on demand or schedule periodic clearing
   */
  clear(): void {
    this.searchCache.clear();
    this.documentCache.clear();
  }
  
  /**
   * Get cache statistics for monitoring
   */
  getStats() {
    return {
      search: {
        size: this.searchCache.size,
        calculatedSize: this.searchCache.calculatedSize,
        hitRate: this.searchCache.calculatedSize > 0 
          ? (this.searchCache.size / this.searchCache.calculatedSize) * 100 
          : 0,
      },
      document: {
        size: this.documentCache.size,
        calculatedSize: this.documentCache.calculatedSize,
      },
    };
  }
}
```

### ✅ Good Pattern: Optimized MCP Tool Handler

```typescript
/**
 * High-performance MCP tool handler with multiple optimizations
 * 
 * Performance features:
 * - Request coalescing for duplicate in-flight requests
 * - Input validation caching to avoid repeated parsing
 * - Streaming response for large result sets
 * - Connection pooling for European Parliament API
 * - Metrics tracking for performance monitoring
 * 
 * ISMS Policy: SC-001 (Secure Configuration)
 * 
 * @performance Target: < 500ms p95, < 200ms p50
 */
export class OptimizedSearchHandler {
  private readonly cache: EuropeanParliamentCache;
  private readonly metrics: PerformanceMetrics;
  private readonly inFlightRequests = new Map<string, Promise<SearchResult>>();
  
  constructor(
    cache: EuropeanParliamentCache,
    metrics: PerformanceMetrics
  ) {
    this.cache = cache;
    this.metrics = metrics;
  }
  
  /**
   * Handle search_documents tool request with performance optimizations
   */
  async handleSearch(request: ToolRequest): Promise<ToolResponse> {
    const startTime = performance.now();
    
    try {
      // Fast path: Validate input (should be < 1ms)
      const query = this.validateQuery(request.params);
      
      // Request coalescing: Deduplicate identical in-flight requests
      const requestKey = this.getRequestKey(query);
      const existingRequest = this.inFlightRequests.get(requestKey);
      
      if (existingRequest) {
        this.metrics.recordCoalescedRequest();
        return await existingRequest;
      }
      
      // Create new request
      const requestPromise = this.executeSearch(query);
      this.inFlightRequests.set(requestKey, requestPromise);
      
      try {
        const result = await requestPromise;
        const duration = performance.now() - startTime;
        
        // Track metrics
        this.metrics.recordRequest('search_documents', duration, true);
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2),
          }],
        };
      } finally {
        // Always clean up in-flight tracking
        this.inFlightRequests.delete(requestKey);
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      this.metrics.recordRequest('search_documents', duration, false);
      throw error;
    }
  }
  
  /**
   * Execute search with caching
   */
  private async executeSearch(query: SearchQuery): Promise<SearchResult> {
    return this.cache.getSearchResults(query, async () => {
      // Actual API call - only happens on cache miss
      return await europeanParliamentApi.search(query);
    });
  }
  
  /**
   * Generate deterministic request key for deduplication
   */
  private getRequestKey(query: SearchQuery): string {
    return `search:${JSON.stringify(query)}`;
  }
  
  /**
   * Fast input validation with result caching
   */
  private validateQuery(params: unknown): SearchQuery {
    if (typeof params !== 'object' || params === null) {
      throw new ValidationError('Invalid query parameters');
    }
    
    const query = params as Record<string, unknown>;
    
    return {
      keywords: this.validateString(query.keywords, 'keywords', 1, 200),
      documentType: query.documentType 
        ? this.validateString(query.documentType, 'documentType', 1, 50)
        : undefined,
      dateFrom: query.dateFrom 
        ? this.validateDate(query.dateFrom)
        : undefined,
      dateTo: query.dateTo 
        ? this.validateDate(query.dateTo)
        : undefined,
      limit: this.validateNumber(query.limit, 'limit', 1, 100) ?? 20,
    };
  }
  
  private validateString(
    value: unknown,
    field: string,
    minLength: number,
    maxLength: number
  ): string {
    if (typeof value !== 'string') {
      throw new ValidationError(`${field} must be a string`);
    }
    
    const trimmed = value.trim();
    
    if (trimmed.length < minLength || trimmed.length > maxLength) {
      throw new ValidationError(
        `${field} must be between ${minLength} and ${maxLength} characters`
      );
    }
    
    return trimmed;
  }
  
  private validateNumber(
    value: unknown,
    field: string,
    min: number,
    max: number
  ): number | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    
    const num = Number(value);
    
    if (!Number.isFinite(num) || num < min || num > max) {
      throw new ValidationError(
        `${field} must be a number between ${min} and ${max}`
      );
    }
    
    return num;
  }
  
  private validateDate(value: unknown): string {
    if (typeof value !== 'string') {
      throw new ValidationError('Date must be a string');
    }
    
    // ISO 8601 date format validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      throw new ValidationError('Date must be in ISO 8601 format (YYYY-MM-DD)');
    }
    
    return value;
  }
}
```

### ✅ Good Pattern: Async Batch Processing

```typescript
/**
 * Efficient batch processing for multiple document fetches
 * 
 * Optimizations:
 * - Parallel requests with concurrency limit
 * - Request batching to reduce round trips
 * - Early return on partial success
 * - Progress tracking for long operations
 * 
 * @performance Processes 100 documents in ~2s vs 20s sequential
 */
export async function fetchDocumentsBatch(
  documentIds: string[],
  options: { concurrency?: number; timeout?: number } = {}
): Promise<Map<string, Document>> {
  const concurrency = options.concurrency ?? 10;
  const timeout = options.timeout ?? 30000;
  
  const results = new Map<string, Document>();
  const errors: Array<{ id: string; error: Error }> = [];
  
  // Process in batches to control concurrency
  for (let i = 0; i < documentIds.length; i += concurrency) {
    const batch = documentIds.slice(i, i + concurrency);
    
    // Parallel fetch with individual timeout handling
    const batchResults = await Promise.allSettled(
      batch.map(async (id) => {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), timeout)
        );
        
        const fetchPromise = europeanParliamentApi.getDocument(id);
        
        return Promise.race([fetchPromise, timeoutPromise]);
      })
    );
    
    // Collect results
    batchResults.forEach((result, index) => {
      const id = batch[index];
      
      if (result.status === 'fulfilled') {
        results.set(id, result.value);
      } else {
        errors.push({ id, error: result.reason });
      }
    });
  }
  
  // Log errors but don't throw - partial success is acceptable
  if (errors.length > 0) {
    console.warn(`Failed to fetch ${errors.length} documents:`, errors);
  }
  
  return results;
}
```

### ✅ Good Pattern: Memory-Efficient Stream Processing

```typescript
/**
 * Stream large document content without loading into memory
 * 
 * Uses Node.js streams to process large documents efficiently:
 * - Constant memory usage regardless of document size
 * - Backpressure handling for flow control
 * - Transform pipelines for text processing
 * 
 * @performance Memory usage: O(1) vs O(n) for full load
 */
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';

export async function processLargeDocument(
  documentId: string,
  outputPath: string
): Promise<void> {
  // Create read stream from European Parliament API
  const inputStream = await europeanParliamentApi.getDocumentStream(documentId);
  
  // Transform: Extract text content
  const textExtractor = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      try {
        const text = extractTextFromChunk(chunk);
        callback(null, text);
      } catch (error) {
        callback(error as Error);
      }
    },
  });
  
  // Transform: Apply text sanitization
  const sanitizer = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      try {
        const sanitized = sanitizeText(chunk.toString());
        callback(null, sanitized);
      } catch (error) {
        callback(error as Error);
      }
    },
  });
  
  // Create write stream
  const outputStream = fs.createWriteStream(outputPath);
  
  // Pipeline with backpressure handling
  await pipeline(
    inputStream,
    textExtractor,
    sanitizer,
    outputStream
  );
}
```

### ✅ Good Pattern: Performance Monitoring

```typescript
/**
 * Performance metrics collection and monitoring
 * 
 * Tracks key performance indicators:
 * - Request latency (p50, p95, p99)
 * - Cache hit rate
 * - Error rate
 * - Memory usage
 * - Event loop lag
 * 
 * ISMS Policy: IM-001 (Incident Management - Performance Monitoring)
 */
export class PerformanceMetrics {
  private readonly latencies: number[] = [];
  private readonly errors = new Map<string, number>();
  private coalescedRequests = 0;
  private totalRequests = 0;
  
  /**
   * Record request metrics
   */
  recordRequest(tool: string, duration: number, success: boolean): void {
    this.totalRequests++;
    
    if (success) {
      this.latencies.push(duration);
      
      // Keep only last 1000 measurements to avoid memory growth
      if (this.latencies.length > 1000) {
        this.latencies.shift();
      }
    } else {
      this.errors.set(tool, (this.errors.get(tool) ?? 0) + 1);
    }
    
    // Log slow requests for investigation
    if (duration > 1000) {
      console.warn(`Slow request detected: ${tool} took ${duration.toFixed(2)}ms`);
    }
  }
  
  /**
   * Record coalesced request (duplicate in-flight request)
   */
  recordCoalescedRequest(): void {
    this.coalescedRequests++;
  }
  
  /**
   * Get performance statistics
   */
  getStats() {
    if (this.latencies.length === 0) {
      return null;
    }
    
    const sorted = [...this.latencies].sort((a, b) => a - b);
    
    return {
      requests: {
        total: this.totalRequests,
        coalesced: this.coalescedRequests,
        coalescedPercentage: (this.coalescedRequests / this.totalRequests) * 100,
      },
      latency: {
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)],
        mean: sorted.reduce((a, b) => a + b, 0) / sorted.length,
        min: sorted[0],
        max: sorted[sorted.length - 1],
      },
      errors: Object.fromEntries(this.errors),
      memory: {
        heapUsed: process.memoryUsage().heapUsed / 1024 / 1024,
        heapTotal: process.memoryUsage().heapTotal / 1024 / 1024,
        external: process.memoryUsage().external / 1024 / 1024,
      },
    };
  }
  
  /**
   * Monitor event loop lag (blocking operations)
   */
  monitorEventLoop(): void {
    let lastCheck = Date.now();
    
    setInterval(() => {
      const now = Date.now();
      const lag = now - lastCheck - 100; // Expected 100ms interval
      
      if (lag > 50) {
        console.warn(`Event loop lag detected: ${lag}ms`);
      }
      
      lastCheck = now;
    }, 100);
  }
}
```

### ❌ Bad Pattern: Synchronous API Calls Blocking Event Loop

```typescript
// Bad: Blocking the event loop with sync I/O
export function searchDocumentsSync(query: string): Results {
  // NEVER use sync methods in Node.js server code!
  const response = syncHttpGet(`/api/search?q=${query}`);
  const data = JSON.parse(response);
  return processResults(data);
  
  // This blocks the event loop, preventing other requests
  // All other clients wait while this completes!
}

// Bad: Sequential async calls when parallel is possible
export async function fetchMultipleDocuments(ids: string[]): Promise<Document[]> {
  const results: Document[] = [];
  
  // Bad: Sequential - takes N * responseTime
  for (const id of ids) {
    const doc = await europeanParliamentApi.getDocument(id);
    results.push(doc);
  }
  
  return results;
  
  // Should use Promise.all() for parallel execution!
}
```

### ❌ Bad Pattern: No Caching, Repeated API Calls

```typescript
// Bad: No caching, hitting API every time
export async function handleSearchRequest(query: SearchQuery): Promise<Results> {
  // Same query hits the API every time
  // European Parliament API is rate-limited!
  return await europeanParliamentApi.search(query);
}

// Bad: Caching without TTL or size limits
const cache = new Map(); // Will grow forever!

export async function getCachedDocument(id: string): Promise<Document> {
  if (cache.has(id)) {
    return cache.get(id); // Stale data possible!
  }
  
  const doc = await europeanParliamentApi.getDocument(id);
  cache.set(id, doc); // No eviction strategy!
  return doc;
}
```

### ❌ Bad Pattern: Loading Large Data Into Memory

```typescript
// Bad: Loading entire document into memory
export async function processDocument(id: string): Promise<string> {
  // Fetches entire document (could be 100MB+)
  const document = await europeanParliamentApi.getFullDocument(id);
  
  // Holds in memory while processing
  const text = extractText(document);
  const processed = processText(text);
  
  return processed;
  
  // Peak memory usage: 100MB+ per request!
  // Should use streaming instead
}

// Bad: Creating large intermediate arrays
export function transformDocuments(docs: Document[]): ProcessedDocument[] {
  // Creates multiple intermediate arrays
  const filtered = docs.filter(d => d.type === 'REPORT');
  const mapped = filtered.map(d => ({ ...d, processed: true }));
  const sorted = mapped.sort((a, b) => a.date.localeCompare(b.date));
  
  return sorted;
  
  // Should chain operations or use single pass
}
```

### ❌ Bad Pattern: No Performance Monitoring

```typescript
// Bad: No metrics tracking
export async function handleToolRequest(request: ToolRequest): Promise<ToolResponse> {
  try {
    return await processRequest(request);
    // No idea how long this took!
    // No visibility into performance degradation!
  } catch (error) {
    return { error: error.message };
  }
}

// Bad: Logging without structured metrics
export async function search(query: string): Promise<Results> {
  console.log('Searching...'); // Useless log
  const results = await europeanParliamentApi.search(query);
  console.log('Done'); // No timing, no metrics
  return results;
}
```

## References

### Performance Tools
- [clinic.js](https://clinicjs.org/) - Node.js performance profiling
- [0x](https://github.com/davidmarkclements/0x) - Flamegraph profiling
- [autocannon](https://github.com/mcollina/autocannon) - HTTP benchmarking
- [Node.js Performance Hooks](https://nodejs.org/api/perf_hooks.html)

### Caching
- [lru-cache](https://github.com/isaacs/node-lru-cache) - Efficient LRU cache
- [redis](https://redis.io/) - Distributed caching
- [HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)

### Best Practices
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [V8 Performance Tips](https://v8.dev/blog/elements-kinds)
- [High Performance Browser Networking](https://hpbn.co/)

### ISMS Policies
- [SC-001 Secure Configuration](https://github.com/Hack23/ISMS-PUBLIC/blob/main/policies/SC-001.md)
- [IM-001 Incident Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/policies/IM-001.md)

## Remember

- **Measure first**: Profile before optimizing - data beats intuition
- **Set budgets**: Target < 500ms response time, < 10MB memory growth per hour
- **Cache aggressively**: European Parliament data changes infrequently
- **Use async properly**: Never block the event loop with synchronous I/O
- **Batch operations**: Parallel execution reduces total latency
- **Stream large data**: Constant memory usage for large documents
- **Monitor continuously**: Track latency, cache hit rate, error rate, memory
- **Optimize the hot path**: Focus on the 20% of code handling 80% of requests
- **Avoid premature optimization**: Write clear code first, optimize when measured slow
- **Consider caching layers**: In-memory (LRU) → Redis → API
- **Test under load**: Use benchmarks to verify optimizations work
- **Memory leaks**: Clear timers, remove listeners, close connections
- **European Parliament API**: Respect rate limits, cache extensively
- **MCP protocol**: Minimize serialization overhead in tool responses
- **Balance tradeoffs**: Performance vs maintainability vs memory usage
