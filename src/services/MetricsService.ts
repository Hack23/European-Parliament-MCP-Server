/**
 * Performance Metrics Service
 * 
 * Provides Prometheus-style metrics collection for monitoring and observability
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

/**
 * Typed metric name constants for MCP server and EP API instrumentation.
 *
 * Using an enum prevents typos in metric names and enables IDE
 * auto-complete throughout the codebase.
 *
 * @example
 * ```typescript
 * metricsService.incrementCounter(MetricName.TOOL_CALL_COUNT, 1, { tool: 'get_meps' });
 * metricsService.observeHistogram(MetricName.EP_API_LATENCY, responseTimeMs);
 * ```
 */
export enum MetricName {
  /** Total MCP tool call invocations (label: `tool`) */
  TOOL_CALL_COUNT = 'tool_call_count',
  /** Failed MCP tool call invocations (label: `tool`) */
  TOOL_ERROR_COUNT = 'tool_error_count',
  /** EP API HTTP round-trip latency in milliseconds (histogram) */
  EP_API_LATENCY = 'ep_api_latency',
  /** Total EP API calls (label: `endpoint`) */
  EP_API_CALL_COUNT = 'ep_api_call_count',
  /** Failed EP API calls */
  EP_API_ERROR_COUNT = 'ep_api_error_count',
  /** Cache hits for EP API responses */
  EP_CACHE_HIT_COUNT = 'ep_cache_hit_count',
  /** Cache misses for EP API responses */
  EP_CACHE_MISS_COUNT = 'ep_cache_miss_count',
  /** Rate limiter token consumption per interval */
  RATE_LIMIT_CONSUMED = 'rate_limit_consumed',
  /** Server uptime in seconds (gauge) */
  SERVER_UPTIME_SECONDS = 'server_uptime_seconds',
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
   * Increment a counter metric
   * Cyclomatic complexity: 2
   * 
   * @param name - Metric name
   * @param value - Increment value (default: 1)
   * @param labels - Optional labels for metric dimensions
   */
  incrementCounter(name: string, value = 1, labels?: Record<string, string>): void {
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
   * Set a gauge metric value
   * Cyclomatic complexity: 1
   * 
   * @param name - Metric name
   * @param value - Gauge value
   * @param labels - Optional labels for metric dimensions
   */
  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.buildKey(name, labels);
    this.metrics.set(key, {
      type: 'gauge',
      value,
      labels,
      timestamp: Date.now()
    });
  }

  /**
   * Record a histogram observation
   * Cyclomatic complexity: 3
   * 
   * @param name - Metric name
   * @param value - Observed value
   * @param labels - Optional labels for metric dimensions
   */
  observeHistogram(name: string, value: number, labels?: Record<string, string>): void {
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
   * Get current metric value
   * Cyclomatic complexity: 3
   * 
   * @param name - Metric name
   * @param labels - Optional labels
   * @returns Current metric value or undefined
   */
  getMetric(name: string, labels?: Record<string, string>): number | undefined {
    const key = this.buildKey(name, labels);
    const metric = this.metrics.get(key);
    
    return metric?.type === 'histogram' ? undefined : metric?.value;
  }

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
   * Clear all metrics
   * Cyclomatic complexity: 1
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Build metric key from name and labels
   * Cyclomatic complexity: 2
   */
  private buildKey(name: string, labels?: Record<string, string>): string {
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
