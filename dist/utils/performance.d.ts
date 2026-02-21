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
export declare class PerformanceMonitor {
    private readonly metrics;
    private readonly maxSamples;
    /**
     * Create a new performance monitor
     *
     * @param maxSamples - Maximum number of samples to retain per operation (default: 1000)
     */
    constructor(maxSamples?: number);
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
    recordDuration(operation: string, durationMs: number): void;
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
    getStats(operation: string): PerformanceStats | null;
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
    private percentile;
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
    getOperations(): string[];
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
    clear(): void;
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
    clearOperation(operation: string): void;
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
export declare function withPerformanceTracking<T>(monitor: PerformanceMonitor, operation: string, fn: () => Promise<T>): Promise<T>;
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
export declare const performanceMonitor: PerformanceMonitor;
//# sourceMappingURL=performance.d.ts.map