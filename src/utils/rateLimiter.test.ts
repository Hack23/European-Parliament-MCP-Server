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
        await expect(limiter.removeTokens(1)).resolves.toBeUndefined();
      }
    });

    it('should throw error when rate limit exceeded', async () => {
      const limiter = new RateLimiter({
        tokensPerInterval: 5,
        interval: 'second'
      });

      // Use up all tokens
      for (let i = 0; i < 5; i++) {
        await limiter.removeTokens(1);
      }

      // Next request should fail
      await expect(limiter.removeTokens(1)).rejects.toThrow(/Rate limit exceeded/);
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

    it('should not exceed maximum tokens', async () => {
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

  describe('tryRemoveTokens', () => {
    it('should return true when tokens available', () => {
      const limiter = new RateLimiter({
        tokensPerInterval: 10,
        interval: 'second'
      });

      expect(limiter.tryRemoveTokens(5)).toBe(true);
      expect(limiter.getAvailableTokens()).toBe(5);
    });

    it('should return false when tokens not available', () => {
      const limiter = new RateLimiter({
        tokensPerInterval: 5,
        interval: 'second'
      });

      limiter.tryRemoveTokens(5);
      expect(limiter.tryRemoveTokens(1)).toBe(false);
      expect(limiter.getAvailableTokens()).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset tokens to full capacity', () => {
      const limiter = new RateLimiter({
        tokensPerInterval: 10,
        interval: 'second'
      });

      limiter.tryRemoveTokens(8);
      expect(limiter.getAvailableTokens()).toBe(2);

      limiter.reset();
      expect(limiter.getAvailableTokens()).toBe(10);
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
});
