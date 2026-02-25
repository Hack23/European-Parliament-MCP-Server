/**
 * Health Check Service
 *
 * Provides a lightweight, synchronous-friendly health snapshot for the
 * MCP server.  The snapshot is consumed by:
 * - The `--health` CLI flag (human-readable JSON)
 * - Future monitoring integrations (CloudWatch, Prometheus, etc.)
 *
 * **Intelligence Perspective:** Operational health metrics are a
 * prerequisite for reliable intelligence product delivery—degraded
 * connectivity or exhausted rate limits must surface immediately.
 *
 * **Business Perspective:** Health endpoints support SLA dashboards and
 * enable proactive incident response before customers are impacted.
 *
 * ISMS Policy: MO-001 (Monitoring and Alerting), PE-001 (Performance Standards)
 *
 * @module services/HealthService
 */

import type { RateLimiter } from '../utils/rateLimiter.js';
import type { MetricsService } from './MetricsService.js';
import { MetricName } from './MetricsService.js';

// ── Public types ──────────────────────────────────────────────────

/**
 * Overall server health verdict.
 *
 * | Value       | Meaning |
 * |-------------|---------|
 * | `healthy`   | All subsystems operating normally |
 * | `degraded`  | One or more subsystems impaired but functional |
 * | `unhealthy` | Critical subsystem failure |
 */
export type HealthStatusLevel = 'healthy' | 'degraded' | 'unhealthy';

/**
 * Rate-limiter status snapshot for health reporting.
 */
export interface RateLimiterHealthStatus {
  /** Number of tokens currently available */
  availableTokens: number;
  /** Maximum number of tokens in the bucket */
  maxTokens: number;
  /** Percentage of the bucket that is used (0–100) */
  utilizationPercent: number;
}

/**
 * Cache status snapshot for health reporting.
 */
export interface CacheHealthStatus {
  /** Whether the cache is populated (has at least one entry) */
  populated: boolean;
  /** Human-readable description of cache state */
  description: string;
}

/**
 * Full health status returned by {@link HealthService.checkHealth}.
 */
export interface HealthStatus {
  /** Overall health verdict */
  status: HealthStatusLevel;
  /** Whether the EP API base URL is reachable (based on recent metrics) */
  epApiReachable: boolean;
  /** Cache subsystem status */
  cache: CacheHealthStatus;
  /** Rate-limiter subsystem status */
  rateLimiter: RateLimiterHealthStatus;
  /** ISO-8601 timestamp of this health snapshot */
  timestamp: string;
  /** Server uptime in milliseconds */
  uptimeMs: number;
}

// ── HealthService implementation ──────────────────────────────────

/**
 * Health Check Service
 *
 * Aggregates status from the rate limiter and metrics service to
 * produce a structured {@link HealthStatus} snapshot.
 *
 * The check is intentionally **synchronous-safe** – it never makes
 * network calls.  Network reachability is inferred from recent
 * metrics (EP API error rate).
 *
 * @example
 * ```typescript
 * const healthService = new HealthService(rateLimiter, metricsService);
 * const status = healthService.checkHealth();
 * console.log(status.status); // 'healthy' | 'degraded' | 'unhealthy'
 * ```
 */
export class HealthService {
  private readonly startTime: number;

  constructor(
    private readonly rateLimiter: RateLimiter,
    private readonly metricsService: MetricsService
  ) {
    this.startTime = Date.now();
  }

  /**
   * Produce a health status snapshot.
   *
   * Checks:
   * 1. Rate-limiter token availability (degraded if < 10 %)
   * 2. EP API error counter (unhealthy if recent errors > 0 with no successes)
   *
   * @returns Structured {@link HealthStatus} object
   */
  checkHealth(): HealthStatus {
    const rateLimiterStatus = this.buildRateLimiterStatus();
    const epApiReachable = this.isEpApiReachable();
    const cacheStatus = this.buildCacheStatus();
    const status = this.deriveOverallStatus(rateLimiterStatus, epApiReachable);

    return {
      status,
      epApiReachable,
      cache: cacheStatus,
      rateLimiter: rateLimiterStatus,
      timestamp: new Date().toISOString(),
      uptimeMs: Date.now() - this.startTime,
    };
  }

  // ── Private helpers ─────────────────────────────────────────────

  /**
   * Build rate-limiter snapshot by delegating to RateLimiter.getStatus().
   * Cyclomatic complexity: 1
   */
  private buildRateLimiterStatus(): RateLimiterHealthStatus {
    return this.rateLimiter.getStatus();
  }

  /**
   * Determine EP API reachability from recorded metrics.
   * Cyclomatic complexity: 2
   *
   * Returns `true` unless the error counter exists and the call counter
   * is either absent or zero (all calls failed).
   */
  private isEpApiReachable(): boolean {
    const errorCount = this.metricsService.getMetric(MetricName.EP_API_ERROR_COUNT) ?? 0;
    const callCount = this.metricsService.getMetric(MetricName.EP_API_CALL_COUNT) ?? 0;

    if (callCount === 0) {
      // No calls yet — assume reachable until proven otherwise
      return true;
    }

    // Reachable if at least some calls succeeded
    return errorCount < callCount;
  }

  /**
   * Build a descriptive cache status object.
   * Cyclomatic complexity: 2
   */
  private buildCacheStatus(): CacheHealthStatus {
    const hits = this.metricsService.getMetric(MetricName.EP_CACHE_HIT_COUNT) ?? 0;
    const misses = this.metricsService.getMetric(MetricName.EP_CACHE_MISS_COUNT) ?? 0;
    const total = hits + misses;

    const populated = total > 0;
    const description = populated
      ? `${String(hits)} hits / ${String(misses)} misses (${String(total)} total)`
      : 'No cache activity yet';

    return { populated, description };
  }

  /**
   * Derive the overall health verdict from sub-system checks.
   * Cyclomatic complexity: 3
   */
  private deriveOverallStatus(
    rateLimiter: RateLimiterHealthStatus,
    epApiReachable: boolean
  ): HealthStatusLevel {
    if (!epApiReachable) {
      return 'unhealthy';
    }

    // Degraded if less than 10 % of tokens remain
    const rateLimiterLow =
      rateLimiter.maxTokens > 0 &&
      rateLimiter.availableTokens / rateLimiter.maxTokens < 0.1;

    return rateLimiterLow ? 'degraded' : 'healthy';
  }
}
