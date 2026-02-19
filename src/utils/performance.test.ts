/**
 * Tests for performance monitoring utilities
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  PerformanceMonitor,
  withPerformanceTracking
} from './performance.js';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;
  
  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });
  
  describe('recordDuration', () => {
    it('should record a single duration', () => {
      monitor.recordDuration('operation1', 100);
      
      const stats = monitor.getStats('operation1');
      expect(stats).not.toBeNull();
      expect(stats?.count).toBe(1);
      expect(stats?.avg).toBe(100);
    });
    
    it('should record multiple durations for same operation', () => {
      monitor.recordDuration('operation1', 100);
      monitor.recordDuration('operation1', 200);
      monitor.recordDuration('operation1', 300);
      
      const stats = monitor.getStats('operation1');
      expect(stats?.count).toBe(3);
      expect(stats?.avg).toBe(200);
    });
    
    it('should track different operations independently', () => {
      monitor.recordDuration('op1', 100);
      monitor.recordDuration('op2', 200);
      
      const stats1 = monitor.getStats('op1');
      const stats2 = monitor.getStats('op2');
      
      expect(stats1?.avg).toBe(100);
      expect(stats2?.avg).toBe(200);
    });
    
    it('should limit number of samples per operation', () => {
      const smallMonitor = new PerformanceMonitor(5); // Max 5 samples
      
      // Record 10 samples
      for (let i = 0; i < 10; i++) {
        smallMonitor.recordDuration('op', i * 10);
      }
      
      const stats = smallMonitor.getStats('op');
      expect(stats?.count).toBe(5); // Only last 5 retained
    });
  });
  
  describe('getStats', () => {
    it('should return null for unknown operation', () => {
      const stats = monitor.getStats('unknown');
      
      expect(stats).toBeNull();
    });
    
    it('should calculate p50 correctly', () => {
      // Record values: 100, 200, 300, 400, 500
      for (let i = 1; i <= 5; i++) {
        monitor.recordDuration('op', i * 100);
      }
      
      const stats = monitor.getStats('op');
      expect(stats?.p50).toBe(300); // Median
    });
    
    it('should calculate p95 correctly', () => {
      // Record 100 values from 1 to 100
      for (let i = 1; i <= 100; i++) {
        monitor.recordDuration('op', i);
      }
      
      const stats = monitor.getStats('op');
      // With linear interpolation: (99-1) * 0.95 = 93.05 + 1 = 94.05
      // Between values 95 and 96, weight 0.05: 95 * 0.95 + 96 * 0.05 = 95.05
      expect(stats?.p95).toBeCloseTo(95.05, 1);
    });
    
    it('should calculate p99 correctly', () => {
      // Record 100 values from 1 to 100
      for (let i = 1; i <= 100; i++) {
        monitor.recordDuration('op', i);
      }
      
      const stats = monitor.getStats('op');
      // With linear interpolation: (sorted.length - 1) * 0.99 = 99 * 0.99 = 98.01
      // Between values 99 and 100, weight 0.01: 99 * 0.99 + 100 * 0.01 = 99.01
      expect(stats?.p99).toBeCloseTo(99.01, 1);
    });
    
    it('should calculate min and max correctly', () => {
      monitor.recordDuration('op', 50);
      monitor.recordDuration('op', 10);
      monitor.recordDuration('op', 100);
      monitor.recordDuration('op', 25);
      
      const stats = monitor.getStats('op');
      expect(stats?.min).toBe(10);
      expect(stats?.max).toBe(100);
    });
    
    it('should calculate average correctly', () => {
      monitor.recordDuration('op', 100);
      monitor.recordDuration('op', 200);
      monitor.recordDuration('op', 300);
      
      const stats = monitor.getStats('op');
      expect(stats?.avg).toBe(200);
    });
    
    it('should include count in statistics', () => {
      for (let i = 0; i < 42; i++) {
        monitor.recordDuration('op', i);
      }
      
      const stats = monitor.getStats('op');
      expect(stats?.count).toBe(42);
    });
  });
  
  describe('getOperations', () => {
    it('should return empty array when no operations recorded', () => {
      const operations = monitor.getOperations();
      
      expect(operations).toEqual([]);
    });
    
    it('should return all tracked operation names', () => {
      monitor.recordDuration('op1', 100);
      monitor.recordDuration('op2', 200);
      monitor.recordDuration('op3', 300);
      
      const operations = monitor.getOperations();
      
      expect(operations).toHaveLength(3);
      expect(operations).toContain('op1');
      expect(operations).toContain('op2');
      expect(operations).toContain('op3');
    });
  });
  
  describe('clear', () => {
    it('should clear all metrics', () => {
      monitor.recordDuration('op1', 100);
      monitor.recordDuration('op2', 200);
      
      monitor.clear();
      
      expect(monitor.getOperations()).toEqual([]);
      expect(monitor.getStats('op1')).toBeNull();
      expect(monitor.getStats('op2')).toBeNull();
    });
  });
  
  describe('clearOperation', () => {
    it('should clear metrics for specific operation', () => {
      monitor.recordDuration('op1', 100);
      monitor.recordDuration('op2', 200);
      
      monitor.clearOperation('op1');
      
      expect(monitor.getStats('op1')).toBeNull();
      expect(monitor.getStats('op2')).not.toBeNull();
    });
    
    it('should not affect other operations', () => {
      monitor.recordDuration('op1', 100);
      monitor.recordDuration('op1', 150);
      monitor.recordDuration('op2', 200);
      
      monitor.clearOperation('op1');
      
      const stats2 = monitor.getStats('op2');
      expect(stats2?.count).toBe(1);
      expect(stats2?.avg).toBe(200);
    });
  });
});

describe('withPerformanceTracking', () => {
  let monitor: PerformanceMonitor;
  
  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });
  
  it('should execute function and record duration', async () => {
    const fn = async () => {
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 10));
      return 'result';
    };
    
    const result = await withPerformanceTracking(monitor, 'test_op', fn);
    
    expect(result).toBe('result');
    
    const stats = monitor.getStats('test_op');
    expect(stats).not.toBeNull();
    expect(stats?.count).toBe(1);
    expect(stats?.avg).toBeGreaterThan(0);
  });
  
  it('should record duration even if function throws', async () => {
    const fn = async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      throw new Error('Test error');
    };
    
    await expect(
      withPerformanceTracking(monitor, 'failing_op', fn)
    ).rejects.toThrow('Test error');
    
    const stats = monitor.getStats('failing_op');
    expect(stats).not.toBeNull();
    expect(stats?.count).toBe(1);
    expect(stats?.avg).toBeGreaterThan(0);
  });
  
  it('should track multiple executions', async () => {
    const fn = async () => {
      await new Promise(resolve => setTimeout(resolve, 5));
      return 'result';
    };
    
    await withPerformanceTracking(monitor, 'multi_op', fn);
    await withPerformanceTracking(monitor, 'multi_op', fn);
    await withPerformanceTracking(monitor, 'multi_op', fn);
    
    const stats = monitor.getStats('multi_op');
    expect(stats?.count).toBe(3);
  });
  
  it('should propagate return value', async () => {
    const fn = async () => {
      return { data: 'test', count: 42 };
    };
    
    const result = await withPerformanceTracking(monitor, 'op', fn);
    
    expect(result).toEqual({ data: 'test', count: 42 });
  });
});

describe('Performance statistics edge cases', () => {
  it('should handle single sample correctly', () => {
    const monitor = new PerformanceMonitor();
    monitor.recordDuration('op', 100);
    
    const stats = monitor.getStats('op');
    expect(stats?.p50).toBe(100);
    expect(stats?.p95).toBe(100);
    expect(stats?.p99).toBe(100);
    expect(stats?.avg).toBe(100);
    expect(stats?.min).toBe(100);
    expect(stats?.max).toBe(100);
  });
  
  it('should handle very small durations', () => {
    const monitor = new PerformanceMonitor();
    monitor.recordDuration('op', 0.001);
    monitor.recordDuration('op', 0.002);
    
    const stats = monitor.getStats('op');
    expect(stats?.avg).toBeCloseTo(0.0015, 4);
    expect(stats?.min).toBe(0.001);
    expect(stats?.max).toBe(0.002);
  });
  
  it('should handle very large durations', () => {
    const monitor = new PerformanceMonitor();
    monitor.recordDuration('op', 1000000);
    monitor.recordDuration('op', 2000000);
    
    const stats = monitor.getStats('op');
    expect(stats?.avg).toBe(1500000);
    expect(stats?.min).toBe(1000000);
    expect(stats?.max).toBe(2000000);
  });
});
