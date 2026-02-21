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
    metrics = new Map();
    maxSamples;
    /**
     * Create a new performance monitor
     *
     * @param maxSamples - Maximum number of samples to retain per operation (default: 1000)
     */
    constructor(maxSamples = 1000) {
        if (!Number.isFinite(maxSamples) || !Number.isInteger(maxSamples) || maxSamples <= 0) {
            throw new RangeError('maxSamples must be a positive integer');
        }
        this.maxSamples = maxSamples;
    }
    /**
     * Record an operation duration
     *
     * @param operation - Operation name/identifier
     * @param durationMs - Duration in milliseconds
     *
     * @example
     * ```typescript
     * const start = performance.now();
     * await doWork();
     * monitor.recordDuration('work', performance.now() - start);
     * ```
     */
    recordDuration(operation, durationMs) {
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
     * Get performance statistics for an operation
     *
     * Calculates percentiles and averages from recorded durations.
     * Returns null if no measurements exist for the operation.
     *
     * @param operation - Operation name/identifier
     * @returns Performance statistics or null if no data
     *
     * @example
     * ```typescript
     * const stats = monitor.getStats('api_call');
     * if (stats && stats.p95 > 1000) {
     *   console.warn('API calls are slow (p95 > 1s)');
     * }
     * ```
     */
    getStats(operation) {
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
    percentile(sorted, p) {
        if (sorted.length === 0)
            return 0;
        const first = sorted[0];
        if (sorted.length === 1 && first !== undefined)
            return first;
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
     * Get all operation names being tracked
     *
     * @returns Array of operation names
     *
     * @example
     * ```typescript
     * const operations = monitor.getOperations();
     * operations.forEach(op => {
     *   const stats = monitor.getStats(op);
     *   console.log(`${op}: ${stats?.p95}ms`);
     * });
     * ```
     */
    getOperations() {
        return Array.from(this.metrics.keys());
    }
    /**
     * Clear all recorded metrics
     *
     * Useful for testing or when starting a new monitoring period.
     *
     * @example
     * ```typescript
     * // Reset metrics after each test
     * afterEach(() => {
     *   monitor.clear();
     * });
     * ```
     */
    clear() {
        this.metrics.clear();
    }
    /**
     * Clear metrics for a specific operation
     *
     * @param operation - Operation name to clear
     *
     * @example
     * ```typescript
     * monitor.clearOperation('api_call');
     * ```
     */
    clearOperation(operation) {
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
 * @param monitor - Performance monitor to record duration
 * @param operation - Operation name for tracking
 * @param fn - Async function to execute
 * @returns Promise that resolves with the function result
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
 */
export async function withPerformanceTracking(monitor, operation, fn) {
    const start = performance.now();
    try {
        return await fn();
    }
    finally {
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
//# sourceMappingURL=performance.js.map