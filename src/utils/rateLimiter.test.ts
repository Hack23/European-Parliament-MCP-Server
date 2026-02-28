/**
 * Tests for Rate Limiter utility
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { RateLimiter, createStandardRateLimiter } from './rateLimiter.js';

describe('RateLimiter', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

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
      vi.useFakeTimers();
      try {
        const limiter = new RateLimiter({
          tokensPerInterval: 5,
          interval: 'second'
        });

        // Use up all tokens (fake timers freeze Date.now(), preventing accidental refills)
        for (let i = 0; i < 5; i++) {
          await limiter.removeTokens(1);
        }

        // Next request with zero timeout should return immediately with allowed:false
        const result = await limiter.removeTokens(1, { timeoutMs: 0 });
        expect(result.allowed).toBe(false);
        expect(result.retryAfterMs).toBeGreaterThan(0);
        expect(result.remainingTokens).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });

    it('should refill tokens over time', async () => {
      vi.useFakeTimers();
      try {
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
      } finally {
        vi.useRealTimers();
      }
    });

    it('should not exceed maximum tokens', () => {
      vi.useFakeTimers();
      try {
        const limiter = new RateLimiter({
          tokensPerInterval: 10,
          interval: 'second'
        });

        // Wait for 2 intervals
        vi.advanceTimersByTime(2000);

        // Should still have max 10 tokens, not 20
        expect(limiter.getAvailableTokens()).toBe(10);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('async waiting', () => {
    it('should wait for token refill and return allowed:true', async () => {
      vi.useFakeTimers();
      try {
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
      } finally {
        vi.useRealTimers();
      }
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
      vi.useFakeTimers();
      try {
        const limiter = new RateLimiter({
          tokensPerInterval: 10,
          interval: 'second',
          initialTokens: 0
        });

        const result = await limiter.removeTokens(1, { timeoutMs: 0 });
        expect(result.allowed).toBe(false);
        expect(typeof result.retryAfterMs).toBe('number');
        expect(result.retryAfterMs).toBeGreaterThan(0);
      } finally {
        vi.useRealTimers();
      }
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

  describe('concurrent callers', () => {
    it('should serialise concurrent waiters so each gets exactly one token without over-consuming', async () => {
      vi.useFakeTimers();
      try {
        // 1 token per second starting empty – each refill cycle satisfies exactly one waiter
        const limiter = new RateLimiter({ tokensPerInterval: 1, interval: 'second', initialTokens: 0 });

        let r1: Awaited<ReturnType<typeof limiter.removeTokens>> | undefined;
        let r2: Awaited<ReturnType<typeof limiter.removeTokens>> | undefined;

        const p1 = limiter.removeTokens(1, { timeoutMs: 3000 });
        const p2 = limiter.removeTokens(1, { timeoutMs: 3000 });
        void p1.then(r => { r1 = r; });
        void p2.then(r => { r2 = r; });

        // After ~1.1 s the first token refills; only p1 (the earlier waiter) should be resolved
        await vi.advanceTimersByTimeAsync(1100);
        expect(r1?.allowed).toBe(true);  // p1 consumed the first token
        expect(r2).toBeUndefined();       // p2 is still waiting for the next refill

        // After another ~1.1 s the second token refills; p2 should now succeed
        await vi.advanceTimersByTimeAsync(1100);
        const [result1, result2] = await Promise.all([p1, p2]);
        expect(result1.allowed).toBe(true);
        expect(result2.allowed).toBe(true);
      } finally {
        vi.useRealTimers();
      }
    });

    it('should deny the second concurrent caller when its timeout expires before the next refill', async () => {
      vi.useFakeTimers();
      try {
        // 1 token per second starting empty
        const limiter = new RateLimiter({ tokensPerInterval: 1, interval: 'second', initialTokens: 0 });

        // p1 has generous timeout; p2 only has 1.5 s.
        // After p1 takes the first token at ~1.1 s, p2 needs another ~1 s but only
        // has ~0.4 s left in its budget → must return allowed:false immediately.
        const p1 = limiter.removeTokens(1, { timeoutMs: 3000 });
        const p2 = limiter.removeTokens(1, { timeoutMs: 1500 });

        // Advance 1.1 s – p1 gets the token; p2 detects insufficient remaining time and returns denied
        await vi.advanceTimersByTimeAsync(1100);
        const [r1, r2] = await Promise.all([p1, p2]);
        expect(r1.allowed).toBe(true);
        expect(r2.allowed).toBe(false);
        expect(r2.retryAfterMs).toBeGreaterThan(0);
      } finally {
        vi.useRealTimers();
      }
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
      vi.useFakeTimers();
      try {
        const limiter = new RateLimiter({ tokensPerInterval: 10, interval: 'second', initialTokens: 0 });
        const result = await limiter.removeTokens(1, { timeoutMs: NaN });
        expect(result.allowed).toBe(false);
      } finally {
        vi.useRealTimers();
      }
    });

    it('should treat Infinity timeoutMs as 0 and return allowed:false immediately', async () => {
      vi.useFakeTimers();
      try {
        const limiter = new RateLimiter({ tokensPerInterval: 10, interval: 'second', initialTokens: 0 });
        const result = await limiter.removeTokens(1, { timeoutMs: Infinity });
        expect(result.allowed).toBe(false);
      } finally {
        vi.useRealTimers();
      }
    });

    it('should treat negative timeoutMs as 0 and return allowed:false immediately', async () => {
      vi.useFakeTimers();
      try {
        const limiter = new RateLimiter({ tokensPerInterval: 10, interval: 'second', initialTokens: 0 });
        const result = await limiter.removeTokens(1, { timeoutMs: -100 });
        expect(result.allowed).toBe(false);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('constructor validation', () => {
    it('should throw when tokensPerInterval is 0', () => {
      expect(() => new RateLimiter({ tokensPerInterval: 0, interval: 'second' }))
        .toThrow(/tokensPerInterval must be a finite integer >= 1/);
    });

    it('should throw when tokensPerInterval is negative', () => {
      expect(() => new RateLimiter({ tokensPerInterval: -5, interval: 'second' }))
        .toThrow(/tokensPerInterval must be a finite integer >= 1/);
    });

    it('should throw when tokensPerInterval is NaN', () => {
      expect(() => new RateLimiter({ tokensPerInterval: NaN, interval: 'second' }))
        .toThrow(/tokensPerInterval must be a finite integer >= 1/);
    });

    it('should throw when tokensPerInterval is a fractional number', () => {
      expect(() => new RateLimiter({ tokensPerInterval: 0.5, interval: 'second' }))
        .toThrow(/tokensPerInterval must be a finite integer >= 1/);
    });

    it('should throw when initialTokens is negative', () => {
      expect(() => new RateLimiter({ tokensPerInterval: 10, interval: 'second', initialTokens: -1 }))
        .toThrow(/initialTokens must be a finite non-negative number/);
    });

    it('should throw when initialTokens is NaN', () => {
      expect(() => new RateLimiter({ tokensPerInterval: 10, interval: 'second', initialTokens: NaN }))
        .toThrow(/initialTokens must be a finite non-negative number/);
    });

    it('should allow initialTokens of 0', () => {
      const limiter = new RateLimiter({ tokensPerInterval: 10, interval: 'second', initialTokens: 0 });
      expect(limiter.getAvailableTokens()).toBe(0);
    });

    it('should throw when initialTokens exceeds tokensPerInterval', () => {
      expect(() => new RateLimiter({ tokensPerInterval: 5, interval: 'second', initialTokens: 6 }))
        .toThrow(/initialTokens.*must not exceed tokensPerInterval/);
    });
  });

  describe('tryRemoveTokens', () => {
    it('should return true when tokens available', () => {
      vi.useFakeTimers();
      try {
        const limiter = new RateLimiter({
          tokensPerInterval: 10,
          interval: 'second'
        });

        expect(limiter.tryRemoveTokens(5)).toBe(true);
        expect(limiter.getAvailableTokens()).toBe(5);
      } finally {
        vi.useRealTimers();
      }
    });

    it('should return false when tokens not available', () => {
      vi.useFakeTimers();
      try {
        const limiter = new RateLimiter({
          tokensPerInterval: 5,
          interval: 'second'
        });

        limiter.tryRemoveTokens(5);
        expect(limiter.tryRemoveTokens(1)).toBe(false);
        expect(limiter.getAvailableTokens()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });

    it('should throw when count is 0', () => {
      const limiter = new RateLimiter({ tokensPerInterval: 10, interval: 'second' });
      expect(() => limiter.tryRemoveTokens(0)).toThrow(/count must be a finite integer >= 1/);
    });

    it('should throw when count is negative', () => {
      const limiter = new RateLimiter({ tokensPerInterval: 10, interval: 'second' });
      expect(() => limiter.tryRemoveTokens(-1)).toThrow(/count must be a finite integer >= 1/);
    });

    it('should throw when count exceeds bucket capacity', () => {
      const limiter = new RateLimiter({ tokensPerInterval: 5, interval: 'second' });
      expect(() => limiter.tryRemoveTokens(6)).toThrow(/exceeds bucket capacity/);
    });
  });

  describe('reset', () => {
    it('should reset tokens to full capacity', () => {
      vi.useFakeTimers();
      try {
        const limiter = new RateLimiter({
          tokensPerInterval: 10,
          interval: 'second'
        });

        limiter.tryRemoveTokens(8);
        expect(limiter.getAvailableTokens()).toBe(2);

        limiter.reset();
        expect(limiter.getAvailableTokens()).toBe(10);
      } finally {
        vi.useRealTimers();
      }
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
      try {
        const limiter = new RateLimiter({ tokensPerInterval: 100, interval: 'minute' });
        limiter.tryRemoveTokens(50);
        const status = limiter.getStatus();
        expect(status.availableTokens).toBe(50);
        expect(status.utilizationPercent).toBe(50);
      } finally {
        vi.useRealTimers();
      }
    });

    it('should floor availableTokens and round utilizationPercent', () => {
      vi.useFakeTimers();
      try {
        const limiter = new RateLimiter({ tokensPerInterval: 3, interval: 'minute' });
        limiter.tryRemoveTokens(1);
        const status = limiter.getStatus();
        // 2 of 3 available → utilization = round((1/3)*100) = 33
        expect(status.utilizationPercent).toBe(33);
        expect(Number.isInteger(status.availableTokens)).toBe(true);
      } finally {
        vi.useRealTimers();
      }
    });

    it('should handle empty bucket (utilization 100%)', () => {
      vi.useFakeTimers();
      try {
        const limiter = new RateLimiter({ tokensPerInterval: 10, interval: 'second' });
        limiter.tryRemoveTokens(10);
        const status = limiter.getStatus();
        expect(status.availableTokens).toBe(0);
        expect(status.utilizationPercent).toBe(100);
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
