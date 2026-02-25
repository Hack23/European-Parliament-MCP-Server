/**
 * Tests for HealthService
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { HealthService } from './HealthService.js';
import { RateLimiter } from '../utils/rateLimiter.js';
import { MetricsService, MetricName } from './MetricsService.js';

describe('HealthService', () => {
  let rateLimiter: RateLimiter;
  let metricsService: MetricsService;

  beforeEach(() => {
    rateLimiter = new RateLimiter({ tokensPerInterval: 100, interval: 'minute' });
    metricsService = new MetricsService();
  });

  describe('checkHealth', () => {
    it('should return a status object with required fields', () => {
      const svc = new HealthService(rateLimiter, metricsService);
      const status = svc.checkHealth();

      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('uptimeMs');
      expect(status).toHaveProperty('timestamp');
      expect(status).toHaveProperty('epApiReachable');
      expect(status).toHaveProperty('cache');
      expect(status).toHaveProperty('rateLimiter');
    });

    it('should report healthy when no API calls have been made', () => {
      const svc = new HealthService(rateLimiter, metricsService);
      const status = svc.checkHealth();

      // No calls yet → EP API assumed reachable
      expect(status.epApiReachable).toBe(true);
      expect(status.status).toBe('healthy');
    });

    it('should report healthy when API calls succeed', () => {
      metricsService.incrementCounter(MetricName.EP_API_CALL_COUNT, 10);
      // zero errors recorded
      const svc = new HealthService(rateLimiter, metricsService);
      const status = svc.checkHealth();

      expect(status.epApiReachable).toBe(true);
      expect(status.status).toBe('healthy');
    });

    it('should report unhealthy when all API calls fail', () => {
      metricsService.incrementCounter(MetricName.EP_API_CALL_COUNT, 5);
      metricsService.incrementCounter(MetricName.EP_API_ERROR_COUNT, 5);

      const svc = new HealthService(rateLimiter, metricsService);
      const status = svc.checkHealth();

      expect(status.epApiReachable).toBe(false);
      expect(status.status).toBe('unhealthy');
    });

    it('should report rate limiter status from RateLimiter.getStatus()', () => {
      rateLimiter.tryRemoveTokens(50);
      const svc = new HealthService(rateLimiter, metricsService);
      const status = svc.checkHealth();

      expect(status.rateLimiter.availableTokens).toBe(50);
      expect(status.rateLimiter.maxTokens).toBe(100);
      expect(status.rateLimiter.utilizationPercent).toBe(50);
    });

    it('should report degraded when rate limiter utilization is above 90%', () => {
      rateLimiter.tryRemoveTokens(96); // >90% used → <10% remaining
      const svc = new HealthService(rateLimiter, metricsService);
      const status = svc.checkHealth();

      expect(status.status).toBe('degraded');
    });

    it('should report cache activity when hits/misses are recorded', () => {
      metricsService.incrementCounter(MetricName.EP_CACHE_HIT_COUNT, 80);
      metricsService.incrementCounter(MetricName.EP_CACHE_MISS_COUNT, 20);

      const svc = new HealthService(rateLimiter, metricsService);
      const status = svc.checkHealth();

      expect(status.cache.populated).toBe(true);
      expect(status.cache.description).toContain('80');
      expect(status.cache.description).toContain('20');
    });

    it('should report no cache activity when no metrics recorded', () => {
      const svc = new HealthService(rateLimiter, metricsService);
      const status = svc.checkHealth();

      expect(status.cache.populated).toBe(false);
      expect(status.cache.description).toContain('No cache activity');
    });

    it('should report uptime as a non-negative number', () => {
      const svc = new HealthService(rateLimiter, metricsService);
      const status = svc.checkHealth();

      expect(typeof status.uptimeMs).toBe('number');
      expect(status.uptimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should report timestamp as a valid ISO string', () => {
      const svc = new HealthService(rateLimiter, metricsService);
      const status = svc.checkHealth();

      expect(typeof status.timestamp).toBe('string');
      expect(() => new Date(status.timestamp)).not.toThrow();
      expect(new Date(status.timestamp).toISOString()).toBe(status.timestamp);
    });

    it('should report partial API failures as unhealthy when all calls fail', () => {
      metricsService.incrementCounter(MetricName.EP_API_CALL_COUNT, 3);
      metricsService.incrementCounter(MetricName.EP_API_ERROR_COUNT, 3);

      const svc = new HealthService(rateLimiter, metricsService);
      const status = svc.checkHealth();

      expect(status.epApiReachable).toBe(false);
    });

    it('should remain healthy with partial API failures (some success)', () => {
      metricsService.incrementCounter(MetricName.EP_API_CALL_COUNT, 10);
      metricsService.incrementCounter(MetricName.EP_API_ERROR_COUNT, 3);

      const svc = new HealthService(rateLimiter, metricsService);
      const status = svc.checkHealth();

      // 3 errors out of 10 calls → still reachable
      expect(status.epApiReachable).toBe(true);
    });
  });
});
