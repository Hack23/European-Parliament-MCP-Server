import { describe, it, expect, beforeEach } from 'vitest';
import { MetricsService } from './MetricsService.js';

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(() => {
    service = new MetricsService();
  });

  describe('Counter Metrics', () => {
    it('should increment a counter', () => {
      service.incrementCounter('test_counter');
      expect(service.getMetric('test_counter')).toBe(1);

      service.incrementCounter('test_counter');
      expect(service.getMetric('test_counter')).toBe(2);
    });

    it('should increment counter by custom value', () => {
      service.incrementCounter('test_counter', 5);
      expect(service.getMetric('test_counter')).toBe(5);

      service.incrementCounter('test_counter', 3);
      expect(service.getMetric('test_counter')).toBe(8);
    });

    it('should support labels for counters', () => {
      service.incrementCounter('http_requests', 1, { method: 'GET', status: '200' });
      service.incrementCounter('http_requests', 1, { method: 'POST', status: '201' });

      expect(service.getMetric('http_requests', { method: 'GET', status: '200' })).toBe(1);
      expect(service.getMetric('http_requests', { method: 'POST', status: '201' })).toBe(1);
    });
  });

  describe('Gauge Metrics', () => {
    it('should set a gauge value', () => {
      service.setGauge('memory_usage', 100);
      expect(service.getMetric('memory_usage')).toBe(100);

      service.setGauge('memory_usage', 150);
      expect(service.getMetric('memory_usage')).toBe(150);
    });

    it('should support labels for gauges', () => {
      service.setGauge('cpu_usage', 50, { core: '0' });
      service.setGauge('cpu_usage', 75, { core: '1' });

      expect(service.getMetric('cpu_usage', { core: '0' })).toBe(50);
      expect(service.getMetric('cpu_usage', { core: '1' })).toBe(75);
    });
  });

  describe('Histogram Metrics', () => {
    it('should observe histogram values', () => {
      service.observeHistogram('request_duration', 100);
      service.observeHistogram('request_duration', 200);
      service.observeHistogram('request_duration', 150);

      const summary = service.getHistogramSummary('request_duration');
      expect(summary?.count).toBe(3);
      expect(summary?.sum).toBe(450);
      expect(summary?.avg).toBe(150);
    });

    it('should calculate percentiles', () => {
      // Add values: 10, 20, 30, ..., 100
      for (let i = 1; i <= 10; i++) {
        service.observeHistogram('latency', i * 10);
      }

      const summary = service.getHistogramSummary('latency');
      expect(summary?.count).toBe(10);
      expect(summary?.p50).toBe(50);
      expect(summary?.p95).toBe(100);
      expect(summary?.p99).toBe(100);
    });

    it('should support labels for histograms', () => {
      service.observeHistogram('api_duration', 100, { endpoint: '/meps' });
      service.observeHistogram('api_duration', 200, { endpoint: '/meps' });
      service.observeHistogram('api_duration', 50, { endpoint: '/committees' });

      const mepsSummary = service.getHistogramSummary('api_duration', { endpoint: '/meps' });
      const committeeSummary = service.getHistogramSummary('api_duration', { endpoint: '/committees' });

      expect(mepsSummary?.count).toBe(2);
      expect(mepsSummary?.avg).toBe(150);
      expect(committeeSummary?.count).toBe(1);
      expect(committeeSummary?.avg).toBe(50);
    });

    it('should return undefined for non-existent histogram', () => {
      const summary = service.getHistogramSummary('nonexistent');
      expect(summary).toBeUndefined();
    });
  });

  describe('Metric Management', () => {
    it('should return undefined for non-existent metric', () => {
      expect(service.getMetric('nonexistent')).toBeUndefined();
    });

    it('should clear all metrics', () => {
      service.incrementCounter('counter1');
      service.setGauge('gauge1', 100);
      service.observeHistogram('histogram1', 50);

      expect(service.getMetric('counter1')).toBe(1);
      expect(service.getMetric('gauge1')).toBe(100);

      service.clear();

      expect(service.getMetric('counter1')).toBeUndefined();
      expect(service.getMetric('gauge1')).toBeUndefined();
      expect(service.getHistogramSummary('histogram1')).toBeUndefined();
    });
  });

  describe('Label Handling', () => {
    it('should treat metrics with different labels as separate', () => {
      service.incrementCounter('requests', 1, { path: '/a' });
      service.incrementCounter('requests', 1, { path: '/b' });

      expect(service.getMetric('requests', { path: '/a' })).toBe(1);
      expect(service.getMetric('requests', { path: '/b' })).toBe(1);
    });

    it('should normalize label order', () => {
      service.incrementCounter('test', 1, { b: '2', a: '1' });
      service.incrementCounter('test', 1, { a: '1', b: '2' });

      // Both should update the same metric
      expect(service.getMetric('test', { a: '1', b: '2' })).toBe(2);
    });
  });

  describe('Histogram Edge Cases', () => {
    it('should handle empty histogram summary', () => {
      // Create histogram but don't add samples
      service.observeHistogram('empty_test', 10);
      service.clear();
      
      const summary = service.getHistogramSummary('empty_test');
      expect(summary).toBeUndefined();
    });

    it('should handle reservoir sampling when exceeding max samples', () => {
      const smallService = new MetricsService(10); // Small max samples
      
      // Add more samples than max
      for (let i = 1; i <= 20; i++) {
        smallService.observeHistogram('test', i);
      }
      
      const summary = smallService.getHistogramSummary('test');
      expect(summary?.count).toBe(20);
      expect(summary?.sum).toBe(210); // Sum of 1 to 20
      expect(summary).toBeDefined();
    });

    it('should handle single value histogram', () => {
      service.observeHistogram('single', 42);
      
      const summary = service.getHistogramSummary('single');
      expect(summary?.count).toBe(1);
      expect(summary?.sum).toBe(42);
      expect(summary?.avg).toBe(42);
      expect(summary?.p50).toBe(42);
      expect(summary?.p95).toBe(42);
      expect(summary?.p99).toBe(42);
    });

    it('should return undefined for histogram getMetric call', () => {
      service.observeHistogram('test_histogram', 100);
      
      // getMetric should return undefined for histograms
      const value = service.getMetric('test_histogram');
      expect(value).toBeUndefined();
    });
  });

  describe('Counter Edge Cases', () => {
    it('should handle incrementing non-existent counter', () => {
      service.incrementCounter('new_counter');
      expect(service.getMetric('new_counter')).toBe(1);
    });

    it('should handle incrementing counter after gauge with same name', () => {
      service.setGauge('metric', 50);
      service.incrementCounter('metric', 10);
      
      // Counter should overwrite gauge
      expect(service.getMetric('metric')).toBe(10);
    });
  });
});
