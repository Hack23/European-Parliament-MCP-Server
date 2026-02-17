/**
 * Performance Metrics Service
 * 
 * Provides Prometheus-style metrics collection for monitoring and observability
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

/**
 * Metric types
 */
type MetricType = 'counter' | 'gauge' | 'histogram';

/**
 * Metric value
 */
interface MetricValue {
  type: MetricType;
  value: number;
  labels?: Record<string, string> | undefined;
  timestamp: number;
}

/**
 * Performance Metrics Service
 * Cyclomatic complexity: 8
 */
export class MetricsService {
  private readonly metrics = new Map<string, MetricValue[]>();

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
    const lastValue = current?.[current.length - 1]?.value ?? 0;

    this.recordMetric(key, {
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
    this.recordMetric(key, {
      type: 'gauge',
      value,
      labels,
      timestamp: Date.now()
    });
  }

  /**
   * Record a histogram observation
   * Cyclomatic complexity: 2
   * 
   * @param name - Metric name
   * @param value - Observed value
   * @param labels - Optional labels for metric dimensions
   */
  observeHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.buildKey(name, labels);
    this.recordMetric(key, {
      type: 'histogram',
      value,
      labels,
      timestamp: Date.now()
    });
  }

  /**
   * Get current metric value
   * Cyclomatic complexity: 2
   * 
   * @param name - Metric name
   * @param labels - Optional labels
   * @returns Current metric value or undefined
   */
  getMetric(name: string, labels?: Record<string, string>): number | undefined {
    const key = this.buildKey(name, labels);
    const values = this.metrics.get(key);
    return values?.[values.length - 1]?.value;
  }

  /**
   * Get histogram summary
   * Cyclomatic complexity: 5
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
    const values = this.metrics.get(key);
    
    if (values === undefined || values.length === 0) {
      return undefined;
    }

    const sorted = [...values.map(v => v.value)].sort((a, b) => a - b);
    const count = sorted.length;
    const sum = sorted.reduce((acc, val) => acc + val, 0);

    return {
      count,
      sum,
      avg: sum / count,
      p50: this.percentile(sorted, 50),
      p95: this.percentile(sorted, 95),
      p99: this.percentile(sorted, 99)
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
   * Record a metric value
   * Cyclomatic complexity: 2
   */
  private recordMetric(key: string, value: MetricValue): void {
    const existing = this.metrics.get(key);
    if (existing === undefined) {
      this.metrics.set(key, [value]);
    } else {
      existing.push(value);
    }
  }

  /**
   * Calculate percentile
   * Cyclomatic complexity: 2
   */
  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)] ?? 0;
  }
}
