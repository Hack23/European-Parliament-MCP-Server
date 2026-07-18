import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { getWeeklyCachePath } from './weeklyDataCache.js';

describe('getWeeklyCachePath', () => {
  const originalCacheDir = process.env['EP_CACHE_DIR'];
  const originalWeeklyCacheDir = process.env['EP_WEEKLY_CACHE_DIR'];

  afterEach(() => {
    if (originalCacheDir === undefined) {
      delete process.env['EP_CACHE_DIR'];
    } else {
      process.env['EP_CACHE_DIR'] = originalCacheDir;
    }
    if (originalWeeklyCacheDir === undefined) {
      delete process.env['EP_WEEKLY_CACHE_DIR'];
    } else {
      process.env['EP_WEEKLY_CACHE_DIR'] = originalWeeklyCacheDir;
    }
  });

  it('resolves bundled cache files relative to the package instead of process.cwd()', () => {
    const originalCwd = process.cwd();
    process.chdir('/tmp');
    try {
      expect(getWeeklyCachePath('meps')).toBe(
        fileURLToPath(new URL('../../data/cache/meps.json', import.meta.url)),
      );
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('resolves cache files from an explicit cache directory override', () => {
    process.env['EP_CACHE_DIR'] = '/var/cache/european-parliament';

    expect(getWeeklyCachePath('corporate-bodies')).toBe(
      path.join('/var/cache/european-parliament', 'corporate-bodies.json'),
    );
  });

  it('supports the legacy weekly cache directory override', () => {
    delete process.env['EP_CACHE_DIR'];
    process.env['EP_WEEKLY_CACHE_DIR'] = '/var/cache/legacy-european-parliament';

    expect(getWeeklyCachePath('controlled-vocabularies')).toBe(
      path.join('/var/cache/legacy-european-parliament', 'controlled-vocabularies.json'),
    );
  });
});