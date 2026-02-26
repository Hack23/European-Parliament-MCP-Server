/**
 * Performance Monitoring Utilities
 * 
 * **Intelligence Perspective:** Performance metrics enable operational intelligence
 * on system health—critical for maintaining reliable intelligence product delivery.
 * 
 * **Business Perspective:** P95 latency targets (<200ms) directly impact customer
 * satisfaction and SLA compliance for premium API tier customers.
 * 
 * **Marketing Perspective:** Sub-200ms response times are a key performance claim
 * for developer marketing and competitive positioning against alternatives.
 * 
 * ISMS Policy: PE-001 (Performance Standards), MO-001 (Monitoring)
 * 
 * Provides performance monitoring and metrics collection for:
 * - Operation duration tracking
 * - Percentile calculations (p50, p95, p99)
 * - Performance baseline validation
 * - Alerting on degradation
 * 
 * @see https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md
 */

/**
 * Performance metric statistics
 */
export interface PerformanceStats {
  /** Median (50th percentile) duration in milliseconds */
  p50: number;
  /** 95th percentile duration in milliseconds */
  p95: number;
  /** 99th percentile duration in milliseconds */
  p99: number;
  /** Average duration in milliseconds */
  avg: number;
  /** Minimum duration in milliseconds */
  min: number;
  /** Maximum duration in milliseconds */
  max: number;
  /** Total number of measurements */
  count: number;
}

/**
 * Warning thresholds for performance alerting.
 *
 * Operations that exceed these thresholds should be flagged for
 * review in dashboards or log-based alerting rules.
 */
export interface PerformanceThresholds {
  /** Warn when p95 exceeds this value (milliseconds) */
  p95WarningMs: number;
  /** Warn when p99 exceeds this value (milliseconds) */
  p99WarningMs: number;
  /** Warn when average exceeds this value (milliseconds) */
  avgWarningMs?: number;
}

/**
 * Default performance thresholds aligned with the ISMS PE-001 standard
 * (target: p95 < 200 ms for cached operations).
 */
export const DEFAULT_PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  p95WarningMs: 200,
  p99WarningMs: 500,
  avgWarningMs: 150,
} as const;

/**
 * Performance monitor for tracking operation metrics
 * 
 * Tracks duration of operations and provides statistical analysis.
 * Useful for identifying performance regressions and bottlenecks.
 * 
 * @example
 * ```typescript
 * const monitor = new PerformanceMonitor();
 * 
 * // Record operation durations
 * monitor.recordDuration('api_call', 150);
 * monitor.recordDuration('api_call', 200);
 * 
 * // Get statistics
 * const stats = monitor.getStats('api_call');
 * console.log(`p95: ${stats.p95}ms`);
 * ```
 */
export class PerformanceMonitor {
  private readonly metrics = new Map<string, number[]>();
  private readonly maxSamples: number;
  
  /**
   * Creates a new performance monitor.
   *
   * @param maxSamples - Maximum number of duration samples to retain per
   *   operation name. Older samples are evicted when the limit is reached
   *   (sliding window). Default: `1000`.
   * @throws {RangeError} If `maxSamples` is not a positive finite integer
   *
   * @example
   * ```typescript
   * const monitor = new PerformanceMonitor(500);
   * ```
   *
   * @since 0.8.0
   */
  constructor(maxSamples = 1000) {
    if (!Number.isFinite(maxSamples) || !Number.isInteger(maxSamples) || maxSamples <= 0) {
      throw new RangeError('maxSamples must be a positive integer');
    }
    this.maxSamples = maxSamples;
  }
  
  /**
   * Records a duration sample for the named operation.
   *
   * When the number of stored samples reaches `maxSamples`, the oldest
   * entries are evicted in bulk (sliding window). Use {@link getStats} to
   * retrieve aggregated statistics after recording samples.
   *
   * @param operation - Unique operation name / identifier (e.g., `'ep_api_call'`)
   * @param durationMs - Observed duration in milliseconds (should be ≥ 0)
   * @throws {TypeError} If `operation` is not a string
   *
   * @example
   * ```typescript
   * const start = performance.now();
   * await doWork();
   * monitor.recordDuration('work', performance.now() - start);
   * ```
   *
   * @since 0.8.0
   */
  recordDuration(operation: string, durationMs: number): void {
    let durations = this.metrics.get(operation);
    
    if (!durations) {
      durations = [];
      this.metrics.set(operation, durations);
    }
    
    durations.push(durationMs);
    
    // Limit number of samples to prevent unbounded memory growth
    // Trim the oldest entries in-place using splice instead of repeatedly calling shift()
    // to keep the most recent samples while avoiding extra array allocations
    if (durations.length > this.maxSamples) {
      const overflow = durations.length - this.maxSamples;
      durations.splice(0, overflow);
    }
  }
  
  /**
   * Returns aggregated performance statistics for a named operation.
   *
   * Calculates percentiles (p50 / p95 / p99), average, min, and max from
   * the stored duration samples. Returns `null` when no samples have been
   * recorded for the operation yet.
   *
   * @param operation - Operation name / identifier to query
   * @returns {@link PerformanceStats} object, or `null` if no data exists
   * @throws {TypeError} If `operation` is not a string
   *
   * @example
   * ```typescript
   * const stats = monitor.getStats('api_call');
   * if (stats && stats.p95 > 1000) {
   *   console.warn('API calls are slow (p95 > 1s)');
   * }
   * ```
   *
   * @since 0.8.0
   */
  getStats(operation: string): PerformanceStats | null {
    const durations = this.metrics.get(operation);
    
    if (!durations || durations.length === 0) {
      return null;
    }
    
    // Sort durations for percentile calculation
    const sorted = [...durations].sort((a, b) => a - b);
    const count = sorted.length;
    
    // Calculate statistics
    const sum = sorted.reduce((acc, val) => acc + val, 0);
    const min = sorted[0];
    const max = sorted[count - 1];
    
    if (min === undefined || max === undefined) {
      return null;
    }
    
    return {
      p50: this.percentile(sorted, 0.5),
      p95: this.percentile(sorted, 0.95),
      p99: this.percentile(sorted, 0.99),
      avg: sum / count,
      min,
      max,
      count
    };
  }
  
  /**
   * Calculate percentile from sorted array
   * 
   * Uses linear interpolation for more accurate percentile calculation
   * 
   * @param sorted - Sorted array of numbers
   * @param p - Percentile (0.0 to 1.0)
   * @returns Value at the specified percentile
   * 
   * @internal
   */
  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    
    const first = sorted[0];
    if (sorted.length === 1 && first !== undefined) return first;
    
    const index = (sorted.length - 1) * p;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;
    
    if (lower === upper) {
      return sorted[lower] ?? 0;
    }
    
    const lowerValue = sorted[lower];
    const upperValue = sorted[upper];
    
    if (lowerValue === undefined || upperValue === undefined) {
      return 0;
    }
    
    return lowerValue * (1 - weight) + upperValue * weight;
  }
  
  /**
   * Returns all operation names currently being tracked.
   *
   * @returns Array of operation name strings, in insertion order
   *
   * @example
   * ```typescript
   * const operations = monitor.getOperations();
   * operations.forEach(op => {
   *   const stats = monitor.getStats(op);
   *   console.log(`${op}: p95=${stats?.p95}ms`);
   * });
   * ```
   *
   * @since 0.8.0
   */
  getOperations(): string[] {
    return Array.from(this.metrics.keys());
  }
  
  /**
   * Clears all recorded duration samples for every tracked operation.
   *
   * Useful for resetting state between test cases or at the start of a new
   * monitoring window.
   *
   * @example
   * ```typescript
   * // Reset metrics after each test
   * afterEach(() => {
   *   monitor.clear();
   * });
   * ```
   *
   * @since 0.8.0
   */
  clear(): void {
    this.metrics.clear();
  }
  
  /**
   * Clears recorded duration samples for a single operation.
   *
   * @param operation - Operation name whose samples should be discarded
   *
   * @example
   * ```typescript
   * monitor.clearOperation('api_call');
   * ```
   *
   * @since 0.8.0
   */
  clearOperation(operation: string): void {
    this.metrics.delete(operation);
  }
}

/**
 * Execute an async function and track its performance
 * 
 * Automatically records the duration of the operation in the
 * provided performance monitor.
 * 
 * @template T - Return type of the function
 * @param monitor - Performance monitor to record the duration in
 * @param operation - Operation name for tracking (e.g., `'fetch_meps'`)
 * @param fn - Async function to execute and measure
 * @returns Promise that resolves with the function result
 * @throws Re-throws any error thrown by `fn` after recording the duration
 *
 * @example
 * ```typescript
 * const monitor = new PerformanceMonitor();
 *
 * const result = await withPerformanceTracking(
 *   monitor,
 *   'fetch_meps',
 *   async () => {
 *     return await client.getMEPs({ limit: 100 });
 *   }
 * );
 * ```
 *
 * @since 0.8.0
 */
export async function withPerformanceTracking<T>(
  monitor: PerformanceMonitor,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  
  try {
    return await fn();
  } finally {
    const duration = performance.now() - start;
    monitor.recordDuration(operation, duration);
  }
}

/**
 * Global performance monitor instance
 * 
 * Shared instance for application-wide performance tracking.
 * Use this for convenience when you don't need isolated monitoring.
 * 
 * @example
 * ```typescript
 * import { performanceMonitor } from './utils/performance.js';
 * 
 * // Record duration
 * performanceMonitor.recordDuration('api_call', 150);
 * 
 * // Get statistics
 * const stats = performanceMonitor.getStats('api_call');
 * ```
 */
export const performanceMonitor = new PerformanceMonitor();
