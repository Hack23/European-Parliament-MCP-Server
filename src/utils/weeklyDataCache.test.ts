import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { getWeeklyCachePath } from './weeklyDataCache.js';

describe('getWeeklyCachePath', () => {
  const originalCacheDir = process.env['EP_WEEKLY_CACHE_DIR'];

  afterEach(() => {
    if (originalCacheDir === undefined) {
      delete process.env['EP_WEEKLY_CACHE_DIR'];
    } else {
      process.env['EP_WEEKLY_CACHE_DIR'] = originalCacheDir;
    }
  });

  it('resolves bundled cache files relative to the package instead of process.cwd()', () => {
    const originalCwd = process.cwd();
    process.chdir('/tmp');
    try {
      expect(getWeeklyCachePath('meps')).toBe(
        fileURLToPath(new URL('../../data/weekly/meps/latest.json', import.meta.url)),
      );
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('resolves cache files from an explicit cache directory override', () => {
    process.env['EP_WEEKLY_CACHE_DIR'] = '/var/cache/european-parliament';

    expect(getWeeklyCachePath('corporate-bodies')).toBe(
      path.join('/var/cache/european-parliament', 'corporate-bodies', 'latest.json'),
    );
  });
});