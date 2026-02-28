/**
 * Unit tests for the shared `buildApiParams` utility.
 */

import { describe, it, expect } from 'vitest';
import { buildApiParams } from './paramBuilder.js';

describe('buildApiParams', () => {
  describe('basic mapping', () => {
    it('maps a single defined value using the provided key alias', () => {
      const result = buildApiParams({ country: 'SE' }, [
        { from: 'country', to: 'country-of-representation' },
      ]);
      expect(result).toEqual({ 'country-of-representation': 'SE' });
    });

    it('maps multiple defined values', () => {
      const result = buildApiParams(
        { country: 'DE', group: 'EPP' },
        [
          { from: 'country', to: 'country-of-representation' },
          { from: 'group', to: 'political-group' },
        ]
      );
      expect(result).toEqual({
        'country-of-representation': 'DE',
        'political-group': 'EPP',
      });
    });

    it('uses the same key name when from and to are identical', () => {
      const result = buildApiParams({ limit: 20 }, [{ from: 'limit', to: 'limit' }]);
      expect(result).toEqual({ limit: 20 });
    });
  });

  describe('undefined / null handling', () => {
    it('omits keys whose value is undefined', () => {
      const result = buildApiParams(
        { country: 'SE', group: undefined },
        [
          { from: 'country', to: 'country-of-representation' },
          { from: 'group', to: 'political-group' },
        ]
      );
      expect(result).toEqual({ 'country-of-representation': 'SE' });
      expect(result).not.toHaveProperty('political-group');
    });

    it('omits keys whose value is null', () => {
      const result = buildApiParams(
        { country: null, group: 'EPP' } as Record<string, unknown>,
        [
          { from: 'country', to: 'country-of-representation' },
          { from: 'group', to: 'political-group' },
        ]
      );
      expect(result).toEqual({ 'political-group': 'EPP' });
      expect(result).not.toHaveProperty('country-of-representation');
    });

    it('omits keys whose value is an object (non-primitive)', () => {
      const result = buildApiParams(
        { meta: { nested: true }, label: 'test' } as Record<string, unknown>,
        [
          { from: 'meta', to: 'meta' },
          { from: 'label', to: 'label' },
        ]
      );
      expect(result).toEqual({ label: 'test' });
      expect(result).not.toHaveProperty('meta');
    });

    it('returns an empty object when all values are undefined', () => {
      const result = buildApiParams(
        { a: undefined, b: undefined } as Record<string, unknown>,
        [
          { from: 'a', to: 'alpha' },
          { from: 'b', to: 'beta' },
        ]
      );
      expect(result).toEqual({});
    });
  });

  describe('falsy-but-valid values are preserved', () => {
    it('preserves empty string values', () => {
      const result = buildApiParams({ keyword: '' }, [
        { from: 'keyword', to: 'keyword' },
      ]);
      expect(result).toEqual({ keyword: '' });
    });

    it('preserves numeric zero', () => {
      const result = buildApiParams({ offset: 0 }, [
        { from: 'offset', to: 'offset' },
      ]);
      expect(result).toEqual({ offset: 0 });
    });

    it('preserves boolean false', () => {
      const result = buildApiParams({ active: false }, [
        { from: 'active', to: 'active' },
      ]);
      expect(result).toEqual({ active: false });
    });
  });

  describe('multiple mappings', () => {
    it('handles a large mapping array with mixed defined/undefined values', () => {
      const params = {
        type: 'written',
        author: undefined,
        topic: 'climate',
        status: undefined,
        dateFrom: '2024-01-01',
        dateTo: undefined,
      };
      const result = buildApiParams(params, [
        { from: 'type', to: 'type' },
        { from: 'author', to: 'author' },
        { from: 'topic', to: 'topic' },
        { from: 'status', to: 'status' },
        { from: 'dateFrom', to: 'dateFrom' },
        { from: 'dateTo', to: 'dateTo' },
      ]);
      expect(result).toEqual({
        type: 'written',
        topic: 'climate',
        dateFrom: '2024-01-01',
      });
    });
  });

  describe('empty mapping array', () => {
    it('returns an empty object when mapping is empty', () => {
      const result = buildApiParams({ country: 'SE', group: 'EPP' }, []);
      expect(result).toEqual({});
    });
  });

  describe('number and boolean values', () => {
    it('maps numeric values correctly', () => {
      const result = buildApiParams({ mepId: 12345 }, [
        { from: 'mepId', to: 'mepId' },
      ]);
      expect(result).toEqual({ mepId: 12345 });
    });

    it('maps boolean true correctly', () => {
      const result = buildApiParams({ active: true }, [
        { from: 'active', to: 'active' },
      ]);
      expect(result).toEqual({ active: true });
    });
  });
});
