/**
 * Tests for Rate Limiter utility
 */

import { describe, it, expect, vi } from 'vitest';
import { RateLimiter, createStandardRateLimiter } from './rateLimiter.js';

describe('RateLimiter', () => {
  describe('Token Bucket Algorithm', () => {
    it('should allow requests within rate limit', async () => {
      const limiter = new RateLimiter({
        tokensPerInterval: 10,
        interval: 'second'
      });

      // Should allow 10 requests
      for (let i = 0; i < 10; i++) {
        const result = await limiter.removeTokens(1);
        expect(result.allowed).toBe(true);
      }
    });

    it('should return allowed:false when rate limit exceeded and timeout is 0', async () => {
      const limiter = new RateLimiter({
        tokensPerInterval: 5,
        interval: 'second'
      });

      // Use up all tokens
      for (let i = 0; i < 5; i++) {
        await limiter.removeTokens(1);
      }

      // Next request with zero timeout should return immediately with allowed:false
      const result = await limiter.removeTokens(1, { timeoutMs: 0 });
      expect(result.allowed).toBe(false);
      expect(result.retryAfterMs).toBeGreaterThan(0);
      expect(result.remainingTokens).toBe(0);
    });

    it('should refill tokens over time', async () => {
      vi.useFakeTimers();
      
      const limiter = new RateLimiter({
        tokensPerInterval: 10,
        interval: 'second',
        initialTokens: 5
      });

      // Use 5 tokens
      await limiter.removeTokens(5);
      expect(limiter.getAvailableTokens()).toBe(0);

      // Advance time by 500ms (half the interval)
      vi.advanceTimersByTime(500);

      // Should have refilled 5 tokens
      expect(limiter.getAvailableTokens()).toBe(5);

      vi.useRealTimers();
    });

    it('should not exceed maximum tokens', () => {
      vi.useFakeTimers();
      
      const limiter = new RateLimiter({
        tokensPerInterval: 10,
        interval: 'second'
      });

      // Wait for 2 intervals
      vi.advanceTimersByTime(2000);

      // Should still have max 10 tokens, not 20
      expect(limiter.getAvailableTokens()).toBe(10);

      vi.useRealTimers();
    });
  });

  describe('async waiting', () => {
    it('should wait for token refill and return allowed:true', async () => {
      vi.useFakeTimers();

      const limiter = new RateLimiter({
        tokensPerInterval: 10,
        interval: 'second'
      });

      // Exhaust all tokens synchronously
      limiter.tryRemoveTokens(10);
      expect(limiter.getAvailableTokens()).toBe(0);

      // Start async wait with generous timeout
      const promise = limiter.removeTokens(1, { timeoutMs: 5000 });

      // Advance fake time past the refill point (≥100 ms for 1 token at 10/second)
      await vi.advanceTimersByTimeAsync(200);

      const result = await promise;
      expect(result.allowed).toBe(true);
      expect(result.remainingTokens).toBeGreaterThanOrEqual(0);

      vi.useRealTimers();
    });

    it('should return allowed:false when wait exceeds timeout', async () => {
      const limiter = new RateLimiter({
        tokensPerInterval: 1,
        interval: 'minute',   // 60 s refill – very slow
        initialTokens: 0
      });

      // Timeout of 100 ms, but refill needs 60 000 ms → immediate false
      const result = await limiter.removeTokens(1, { timeoutMs: 100 });
      expect(result.allowed).toBe(false);
      expect(result.retryAfterMs).toBeGreaterThan(100);
    });

    it('should include retryAfterMs in result when not allowed', async () => {
      const limiter = new RateLimiter({
        tokensPerInterval: 10,
        interval: 'second',
        initialTokens: 0
      });

      const result = await limiter.removeTokens(1, { timeoutMs: 0 });
      expect(result.allowed).toBe(false);
      expect(typeof result.retryAfterMs).toBe('number');
      expect(result.retryAfterMs).toBeGreaterThan(0);
    });

    it('should return correct remainingTokens after consuming', async () => {
      const limiter = new RateLimiter({
        tokensPerInterval: 10,
        interval: 'second'
      });

      const result = await limiter.removeTokens(3);
      expect(result.allowed).toBe(true);
      expect(result.remainingTokens).toBe(7);
    });
  });

  describe('removeTokens input validation', () => {
    it('should throw when count is 0', async () => {
      const limiter = new RateLimiter({ tokensPerInterval: 10, interval: 'second' });
      await expect(limiter.removeTokens(0)).rejects.toThrow(/count must be a finite integer >= 1/);
    });

    it('should throw when count is negative', async () => {
      const limiter = new RateLimiter({ tokensPerInterval: 10, interval: 'second' });
      await expect(limiter.removeTokens(-1)).rejects.toThrow(/count must be a finite integer >= 1/);
    });

    it('should throw when count is non-integer', async () => {
      const limiter = new RateLimiter({ tokensPerInterval: 10, interval: 'second' });
      await expect(limiter.removeTokens(1.5)).rejects.toThrow(/count must be a finite integer >= 1/);
    });

    it('should throw when count exceeds bucket capacity', async () => {
      const limiter = new RateLimiter({ tokensPerInterval: 5, interval: 'second' });
      await expect(limiter.removeTokens(6)).rejects.toThrow(/exceeds bucket capacity/);
    });

    it('should treat NaN timeoutMs as 0 and return allowed:false immediately', async () => {
      const limiter = new RateLimiter({ tokensPerInterval: 10, interval: 'second', initialTokens: 0 });
      const result = await limiter.removeTokens(1, { timeoutMs: NaN });
      expect(result.allowed).toBe(false);
    });

    it('should treat Infinity timeoutMs as 0 and return allowed:false immediately', async () => {
      const limiter = new RateLimiter({ tokensPerInterval: 10, interval: 'second', initialTokens: 0 });
      const result = await limiter.removeTokens(1, { timeoutMs: Infinity });
      expect(result.allowed).toBe(false);
    });

    it('should treat negative timeoutMs as 0 and return allowed:false immediately', async () => {
      const limiter = new RateLimiter({ tokensPerInterval: 10, interval: 'second', initialTokens: 0 });
      const result = await limiter.removeTokens(1, { timeoutMs: -100 });
      expect(result.allowed).toBe(false);
    });
  });

  describe('tryRemoveTokens', () => {
    it('should return true when tokens available', () => {
      vi.useFakeTimers();
      
      const limiter = new RateLimiter({
        tokensPerInterval: 10,
        interval: 'second'
      });

      expect(limiter.tryRemoveTokens(5)).toBe(true);
      expect(limiter.getAvailableTokens()).toBe(5);
      
      vi.useRealTimers();
    });

    it('should return false when tokens not available', () => {
      vi.useFakeTimers();
      
      const limiter = new RateLimiter({
        tokensPerInterval: 5,
        interval: 'second'
      });

      limiter.tryRemoveTokens(5);
      expect(limiter.tryRemoveTokens(1)).toBe(false);
      expect(limiter.getAvailableTokens()).toBe(0);
      
      vi.useRealTimers();
    });
  });

  describe('reset', () => {
    it('should reset tokens to full capacity', () => {
      vi.useFakeTimers();
      
      const limiter = new RateLimiter({
        tokensPerInterval: 10,
        interval: 'second'
      });

      limiter.tryRemoveTokens(8);
      expect(limiter.getAvailableTokens()).toBe(2);

      limiter.reset();
      expect(limiter.getAvailableTokens()).toBe(10);
      
      vi.useRealTimers();
    });
  });

  describe('Interval Types', () => {
    it('should support second interval', () => {
      const limiter = new RateLimiter({
        tokensPerInterval: 10,
        interval: 'second'
      });
      expect(limiter).toBeDefined();
    });

    it('should support minute interval', () => {
      const limiter = new RateLimiter({
        tokensPerInterval: 100,
        interval: 'minute'
      });
      expect(limiter).toBeDefined();
    });

    it('should support hour interval', () => {
      const limiter = new RateLimiter({
        tokensPerInterval: 1000,
        interval: 'hour'
      });
      expect(limiter).toBeDefined();
    });
  });

  describe('createStandardRateLimiter', () => {
    it('should create limiter with standard config', () => {
      const limiter = createStandardRateLimiter();
      expect(limiter).toBeDefined();
      expect(limiter.getAvailableTokens()).toBe(100);
    });
  });

  describe('getMaxTokens', () => {
    it('should return the configured token capacity', () => {
      const limiter = new RateLimiter({ tokensPerInterval: 42, interval: 'minute' });
      expect(limiter.getMaxTokens()).toBe(42);
    });
  });

  describe('getStatus', () => {
    it('should return full status when bucket is full', () => {
      const limiter = new RateLimiter({ tokensPerInterval: 100, interval: 'minute' });
      const status = limiter.getStatus();
      expect(status.maxTokens).toBe(100);
      expect(status.availableTokens).toBe(100);
      expect(status.utilizationPercent).toBe(0);
    });

    it('should reflect consumed tokens in utilization', () => {
      vi.useFakeTimers();
      const limiter = new RateLimiter({ tokensPerInterval: 100, interval: 'minute' });
      limiter.tryRemoveTokens(50);
      const status = limiter.getStatus();
      expect(status.availableTokens).toBe(50);
      expect(status.utilizationPercent).toBe(50);
      vi.useRealTimers();
    });

    it('should floor availableTokens and round utilizationPercent', () => {
      vi.useFakeTimers();
      const limiter = new RateLimiter({ tokensPerInterval: 3, interval: 'minute' });
      limiter.tryRemoveTokens(1);
      const status = limiter.getStatus();
      // 2 of 3 available → utilization = round((1/3)*100) = 33
      expect(status.utilizationPercent).toBe(33);
      expect(Number.isInteger(status.availableTokens)).toBe(true);
      vi.useRealTimers();
    });

    it('should handle empty bucket (utilization 100%)', () => {
      vi.useFakeTimers();
      const limiter = new RateLimiter({ tokensPerInterval: 10, interval: 'second' });
      limiter.tryRemoveTokens(10);
      const status = limiter.getStatus();
      expect(status.availableTokens).toBe(0);
      expect(status.utilizationPercent).toBe(100);
      vi.useRealTimers();
    });
  });
});
