/**
 * Performance Metrics Service
 *
 * Provides Prometheus-style metrics collection for monitoring and observability
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */
/**
 * Performance Metrics Service
 * Cyclomatic complexity: 8
 */
export declare class MetricsService {
    private readonly metrics;
    private readonly maxHistogramSamples;
    constructor(maxHistogramSamples?: number);
    /**
     * Increment a counter metric
     * Cyclomatic complexity: 2
     *
     * @param name - Metric name
     * @param value - Increment value (default: 1)
     * @param labels - Optional labels for metric dimensions
     */
    incrementCounter(name: string, value?: number, labels?: Record<string, string>): void;
    /**
     * Set a gauge metric value
     * Cyclomatic complexity: 1
     *
     * @param name - Metric name
     * @param value - Gauge value
     * @param labels - Optional labels for metric dimensions
     */
    setGauge(name: string, value: number, labels?: Record<string, string>): void;
    /**
     * Record a histogram observation
     * Cyclomatic complexity: 3
     *
     * @param name - Metric name
     * @param value - Observed value
     * @param labels - Optional labels for metric dimensions
     */
    observeHistogram(name: string, value: number, labels?: Record<string, string>): void;
    /**
     * Get current metric value
     * Cyclomatic complexity: 3
     *
     * @param name - Metric name
     * @param labels - Optional labels
     * @returns Current metric value or undefined
     */
    getMetric(name: string, labels?: Record<string, string>): number | undefined;
    /**
     * Get histogram summary
     * Cyclomatic complexity: 3
     *
     * @param name - Metric name
     * @param labels - Optional labels
     * @returns Histogram summary with percentiles
     */
    getHistogramSummary(name: string, labels?: Record<string, string>): {
        count: number;
        sum: number;
        avg: number;
        p50: number;
        p95: number;
        p99: number;
    } | undefined;
    /**
     * Clear all metrics
     * Cyclomatic complexity: 1
     */
    clear(): void;
    /**
     * Build metric key from name and labels
     * Cyclomatic complexity: 2
     */
    private buildKey;
    /**
     * Compute a percentile value from an unsorted array using quickselect
     * Cyclomatic complexity: 3
     *
     * @param values - Array of samples
     * @param percentile - Percentile to compute (0-100)
     * @returns Percentile value
     */
    private percentileFromUnsorted;
    /**
     * Select the k-th smallest element using quickselect
     * Cyclomatic complexity: 5
     *
     * @param arr - Array to select from (will be mutated)
     * @param k - Index of element to select (0-based)
     * @returns The k-th smallest element
     */
    private selectKth;
    /**
     * Partition helper for quickselect (Lomuto-style)
     * Cyclomatic complexity: 4
     *
     * @param arr - Array to partition
     * @param left - Left bound
     * @param right - Right bound
     * @param pivotIndex - Pivot index
     * @returns New pivot index
     */
    private partition;
}
//# sourceMappingURL=MetricsService.d.ts.map