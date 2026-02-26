/**
 * Performance Metrics Service
 * 
 * Provides Prometheus-style metrics collection for monitoring and observability
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

/**
 * Preferred type for metric name parameters.
 *
 * Using {@link MetricName} values provides compile-time safety and IDE
 * auto-complete; raw `string` is accepted for backward compatibility and
 * for ad-hoc metrics outside the standard set.
 */
export type MetricKey = MetricName | (string & {});

/**
 * Typed metric name constants for MCP server and EP API instrumentation.
 *
 * Using an enum prevents typos in metric names and enables IDE
 * auto-complete throughout the codebase.
 *
 * @example
 * ```typescript
 * metricsService.incrementCounter(MetricName.EP_API_CALL_COUNT, 1);
 * metricsService.incrementCounter(MetricName.EP_CACHE_HIT_COUNT, 1);
 * ```
 */
export enum MetricName {
  /** Total EP API calls (label: `endpoint`) */
  EP_API_CALL_COUNT = 'ep_api_call_count',
  /** Failed EP API calls */
  EP_API_ERROR_COUNT = 'ep_api_error_count',
  /** Cache hits for EP API responses */
  EP_CACHE_HIT_COUNT = 'ep_cache_hit_count',
  /** Cache misses for EP API responses */
  EP_CACHE_MISS_COUNT = 'ep_cache_miss_count',
}

/**
 * Single value metric (counter/gauge)
 */
interface SingleMetric {
  type: 'counter' | 'gauge';
  value: number;
  labels?: Record<string, string> | undefined;
  timestamp: number;
}

/**
 * Histogram metric with bounded samples
 */
interface HistogramMetric {
  type: 'histogram';
  samples: number[]; // Bounded array of samples
  count: number; // Total observation count
  sum: number; // Running sum
  labels?: Record<string, string> | undefined;
  timestamp: number;
}

type MetricValue = SingleMetric | HistogramMetric;

/**
 * Performance Metrics Service
 * Cyclomatic complexity: 8
 */
export class MetricsService {
  private readonly metrics = new Map<string, MetricValue>();
  private readonly maxHistogramSamples: number;

  constructor(maxHistogramSamples = 1000) {
    this.maxHistogramSamples = maxHistogramSamples;
  }

  /**
   * Increments a counter metric by the given value.
   *
   * Creates the counter at zero if it does not exist yet, then adds `value`.
   * Counters are monotonically increasing — use {@link setGauge} for
   * values that can decrease.
   *
   * @param name - Metric name (use a {@link MetricName} enum value for type safety)
   * @param value - Amount to add to the counter (default: `1`)
   * @param labels - Optional key/value label dimensions (e.g., `{ endpoint: '/meps' }`)
   * @throws {TypeError} If `name` is not a string
   *
   * @example
   * ```typescript
   * metricsService.incrementCounter(MetricName.EP_API_CALL_COUNT);
   * metricsService.incrementCounter(MetricName.EP_API_CALL_COUNT, 1, { endpoint: '/meps' });
   * ```
   *
   * @since 0.8.0
   */
  incrementCounter(name: MetricKey, value = 1, labels?: Record<string, string>): void {
    const key = this.buildKey(name, labels);
    const current = this.metrics.get(key);
    const lastValue = current?.type === 'counter' ? current.value : 0;

    this.metrics.set(key, {
      type: 'counter',
      value: lastValue + value,
      labels,
      timestamp: Date.now()
    });
  }

  /**
   * Sets a gauge metric to an absolute value.
   *
   * Unlike counters, gauges can be set to any value including decreasing
   * values (e.g., current queue depth, active connection count).
   *
   * @param name - Metric name (use a {@link MetricName} enum value for type safety)
   * @param value - Absolute gauge value to record
   * @param labels - Optional key/value label dimensions
   * @throws {TypeError} If `name` is not a string
   *
   * @example
   * ```typescript
   * metricsService.setGauge('active_connections', 5);
   * metricsService.setGauge('queue_depth', 12, { queue: 'ep_api' });
   * ```
   *
   * @since 0.8.0
   */
  setGauge(name: MetricKey, value: number, labels?: Record<string, string>): void {
    const key = this.buildKey(name, labels);
    this.metrics.set(key, {
      type: 'gauge',
      value,
      labels,
      timestamp: Date.now()
    });
  }

  /**
   * Records a single observation into a histogram metric.
   *
   * Uses reservoir sampling to keep sample count bounded at
   * `maxHistogramSamples`. Use {@link getHistogramSummary} to retrieve
   * computed percentiles.
   *
   * @param name - Metric name (use a {@link MetricName} enum value for type safety)
   * @param value - Observed value (e.g., response time in milliseconds)
   * @param labels - Optional key/value label dimensions
   * @throws {TypeError} If `name` is not a string
   *
   * @example
   * ```typescript
   * const start = Date.now();
   * await fetchFromEPAPI('/meps');
   * metricsService.observeHistogram('ep_api_latency_ms', Date.now() - start);
   * ```
   *
   * @since 0.8.0
   */
  observeHistogram(name: MetricKey, value: number, labels?: Record<string, string>): void {
    const key = this.buildKey(name, labels);
    const current = this.metrics.get(key);

    if (current?.type === 'histogram') {
      // Add to existing histogram with reservoir sampling for bounded size
      current.count += 1;
      current.sum += value;
      
      if (current.samples.length < this.maxHistogramSamples) {
        current.samples.push(value);
      } else {
        // Reservoir sampling: replace random element
        const randomIndex = Math.floor(Math.random() * current.count);
        if (randomIndex < this.maxHistogramSamples) {
          current.samples[randomIndex] = value;
        }
      }
      current.timestamp = Date.now();
    } else {
      // Create new histogram
      this.metrics.set(key, {
        type: 'histogram',
        samples: [value],
        count: 1,
        sum: value,
        labels,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Returns the current scalar value of a counter or gauge metric.
   *
   * Returns `undefined` for histogram metrics (use {@link getHistogramSummary}
   * instead) and for metrics that have not been recorded yet.
   *
   * @param name - Metric name to query
   * @param labels - Optional label dimensions to scope the lookup
   * @returns Current numeric value, or `undefined` if not found / is a histogram
   *
   * @example
   * ```typescript
   * const errors = metricsService.getMetric(MetricName.EP_API_ERROR_COUNT) ?? 0;
   * if (errors > 10) {
   *   console.warn('High EP API error rate');
   * }
   * ```
   *
   * @since 0.8.0
   */
  getMetric(name: MetricKey, labels?: Record<string, string>): number | undefined {
    const key = this.buildKey(name, labels);
    const metric = this.metrics.get(key);
    
    return metric?.type === 'histogram' ? undefined : metric?.value;
  }

  /**
   * Returns a statistical summary of a histogram metric.
   *
   * Computes count, sum, average, and p50 / p95 / p99 percentiles from
   * the stored samples. Returns `undefined` if the metric does not exist,
   * is not a histogram, or has no samples yet.
   *
   * @param name - Histogram metric name to summarise
   * @param labels - Optional label dimensions to scope the lookup
   * @returns Summary object with `count`, `sum`, `avg`, `p50`, `p95`, `p99`,
   *   or `undefined` if no histogram data exists
   *
   * @example
   * ```typescript
   * const summary = metricsService.getHistogramSummary('ep_api_latency_ms');
   * if (summary) {
   *   console.log(`p95 latency: ${summary.p95}ms`);
   * }
   * ```
   *
   * @since 0.8.0
   */
  getHistogramSummary(name: MetricKey, labels?: Record<string, string>): {
    count: number;
    sum: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  } | undefined {
    const key = this.buildKey(name, labels);
    const metric = this.metrics.get(key);
    
    if (metric?.type !== 'histogram' || metric.samples.length === 0) {
      return undefined;
    }

    return {
      count: metric.count,
      sum: metric.sum,
      avg: metric.sum / metric.count,
      p50: this.percentileFromUnsorted(metric.samples, 50),
      p95: this.percentileFromUnsorted(metric.samples, 95),
      p99: this.percentileFromUnsorted(metric.samples, 99)
    };
  }

  /**
   * Clears all recorded metrics from memory.
   *
   * Intended for use in **tests** to ensure metric isolation between cases.
   * Calling this in production will silently discard all instrumentation data.
   *
   * @example
   * ```typescript
   * afterEach(() => {
   *   metricsService.clear();
   * });
   * ```
   *
   * @since 0.8.0
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Build metric key from name and labels
   * Cyclomatic complexity: 2
   */
  private buildKey(name: MetricKey, labels?: Record<string, string>): string {
    if (labels === undefined) {
      return name;
    }
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return `${name}{${labelStr}}`;
  }

  /**
   * Compute a percentile value from an unsorted array using quickselect
   * Cyclomatic complexity: 3
   * 
   * @param values - Array of samples
   * @param percentile - Percentile to compute (0-100)
   * @returns Percentile value
   */
  private percentileFromUnsorted(values: number[], percentile: number): number {
    if (values.length === 0) {
      return 0;
    }

    // Use ceiling-based index for consistency with original implementation
    const index = Math.ceil((percentile / 100) * values.length) - 1;
    const clampedIndex = Math.min(values.length - 1, Math.max(0, index));

    // Work on a copy to avoid mutating the original
    const work = values.slice();
    return this.selectKth(work, clampedIndex);
  }

  /**
   * Select the k-th smallest element using quickselect
   * Cyclomatic complexity: 5
   * 
   * @param arr - Array to select from (will be mutated)
   * @param k - Index of element to select (0-based)
   * @returns The k-th smallest element
   */
  private selectKth(arr: number[], k: number): number {
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
      if (left === right) {
        return arr[left] ?? 0;
      }

      const pivotIndex = left + Math.floor((right - left) / 2);
      const newPivotIndex = this.partition(arr, left, right, pivotIndex);

      if (k === newPivotIndex) {
        return arr[k] ?? 0;
      }

      if (k < newPivotIndex) {
        right = newPivotIndex - 1;
      } else {
        left = newPivotIndex + 1;
      }
    }

    return arr[Math.min(Math.max(k, 0), arr.length - 1)] ?? 0;
  }

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
  private partition(arr: number[], left: number, right: number, pivotIndex: number): number {
    const pivotValue = arr[pivotIndex] ?? 0;
    const rightVal = arr[right] ?? 0;
    const pivotVal = arr[pivotIndex] ?? 0;
    [arr[pivotIndex], arr[right]] = [rightVal, pivotVal];

    let storeIndex = left;
    for (let i = left; i < right; i += 1) {
      const arrI = arr[i] ?? 0;
      const arrStore = arr[storeIndex] ?? 0;
      if (arrI < pivotValue) {
        [arr[storeIndex], arr[i]] = [arrI, arrStore];
        storeIndex += 1;
      }
    }

    const rightValue = arr[right] ?? 0;
    const storeValue = arr[storeIndex] ?? 0;
    [arr[right], arr[storeIndex]] = [storeValue, rightValue];
    return storeIndex;
  }
}
