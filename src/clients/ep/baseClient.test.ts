/**
 * Unit tests for BaseEPClient
 *
 * Covers the constructor (both standalone and shared-resources paths),
 * public helpers (getCacheStats, clearCache) and the protected `get()`
 * method via a lightweight test subclass.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  BaseEPClient,
  APIError,
  DEFAULT_EP_API_BASE_URL,
  DEFAULT_REQUEST_TIMEOUT_MS,
  DEFAULT_RETRY_ENABLED,
  DEFAULT_MAX_RETRIES,
  DEFAULT_CACHE_TTL_MS,
  DEFAULT_MAX_CACHE_SIZE,
  DEFAULT_RATE_LIMIT_TOKENS,
  DEFAULT_RATE_LIMIT_INTERVAL,
  DEFAULT_MAX_RESPONSE_BYTES,
  type EPClientConfig,
  type EPSharedResources,
} from './baseClient.js';
import { LRUCache } from 'lru-cache';
import { RateLimiter } from '../../utils/rateLimiter.js';
import { DEFAULT_TIMEOUTS } from '../../utils/timeout.js';

// Mock undici so no real HTTP calls are made
vi.mock('undici', () => ({
  fetch: vi.fn(),
}));

import { fetch } from 'undici';
const mockFetch = fetch as ReturnType<typeof vi.fn>;

// ─── Test subclass exposing the protected get() helper ───────────────────────

class TestEPClient extends BaseEPClient {
  /** Exposes the protected get() method for testing */
  async testGet<T extends Record<string, unknown>>(
    endpoint: string,
    params?: Record<string, unknown>,
    minimumTimeoutMs?: number
  ): Promise<T> {
    return this.get<T>(endpoint, params, minimumTimeoutMs);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeSuccessResponse(body: Record<string, unknown>): Response {
  return {
    ok: true,
    headers: new Headers(),
    json: async () => body,
  } as unknown as Response;
}

// ─── APIError ────────────────────────────────────────────────────────────────

describe('APIError', () => {
  it('should have name APIError', () => {
    const error = new APIError('test error');
    expect(error.name).toBe('APIError');
  });

  it('should expose message, statusCode, and details', () => {
    const details = { extra: 'info' };
    const error = new APIError('bad request', 400, details);
    expect(error.message).toBe('bad request');
    expect(error.statusCode).toBe(400);
    expect(error.details).toBe(details);
  });

  it('should be instanceof Error', () => {
    const error = new APIError('test');
    expect(error).toBeInstanceOf(Error);
  });

  it('should work without statusCode and details', () => {
    const error = new APIError('simple');
    expect(error.statusCode).toBeUndefined();
    expect(error.details).toBeUndefined();
  });
});

// ─── Exported constants ───────────────────────────────────────────────────────

describe('Default configuration constants', () => {
  it('DEFAULT_EP_API_BASE_URL should be the EP API base URL', () => {
    expect(DEFAULT_EP_API_BASE_URL).toBe('https://data.europarl.europa.eu/api/v2/');
  });

  it('DEFAULT_REQUEST_TIMEOUT_MS should equal DEFAULT_TIMEOUTS.EP_API_REQUEST_MS (single source of truth)', () => {
    expect(DEFAULT_REQUEST_TIMEOUT_MS).toBe(DEFAULT_TIMEOUTS.EP_API_REQUEST_MS);
  });

  it('DEFAULT_RETRY_ENABLED should be true', () => {
    expect(DEFAULT_RETRY_ENABLED).toBe(true);
  });

  it('DEFAULT_MAX_RETRIES should be 2', () => {
    expect(DEFAULT_MAX_RETRIES).toBe(2);
  });

  it('DEFAULT_CACHE_TTL_MS should be 900000', () => {
    expect(DEFAULT_CACHE_TTL_MS).toBe(900_000);
  });

  it('DEFAULT_MAX_CACHE_SIZE should be 500', () => {
    expect(DEFAULT_MAX_CACHE_SIZE).toBe(500);
  });

  it('DEFAULT_RATE_LIMIT_TOKENS should be 100', () => {
    expect(DEFAULT_RATE_LIMIT_TOKENS).toBe(100);
  });

  it('DEFAULT_RATE_LIMIT_INTERVAL should be minute', () => {
    expect(DEFAULT_RATE_LIMIT_INTERVAL).toBe('minute');
  });

  it('DEFAULT_MAX_RESPONSE_BYTES should be 10 MiB', () => {
    expect(DEFAULT_MAX_RESPONSE_BYTES).toBe(10_485_760);
  });
});

// ─── Constructor: standalone (else branch, lines 158-176) ────────────────────

describe('BaseEPClient constructor — standalone (no shared)', () => {
  it('should use default base URL when no config provided', () => {
    const client = new TestEPClient();
    const stats = client.getCacheStats();
    expect(stats.maxSize).toBe(DEFAULT_MAX_CACHE_SIZE);
  });

  it('should respect custom baseURL in config', () => {
    // Instantiating without shared triggers the else branch (lines 158-176)
    const config: EPClientConfig = { baseURL: 'https://custom.api.example.com/' };
    const client = new TestEPClient(config);
    expect(client.getCacheStats()).toBeDefined();
  });

  it('should respect custom maxCacheSize in config', () => {
    const config: EPClientConfig = { maxCacheSize: 42 };
    const client = new TestEPClient(config);
    expect(client.getCacheStats().maxSize).toBe(42);
  });

  it('should respect custom cacheTTL in config', () => {
    const config: EPClientConfig = { cacheTTL: 60_000 };
    const client = new TestEPClient(config);
    // Cache is created — no error thrown
    expect(client.getCacheStats()).toBeDefined();
  });

  it('should accept a custom rateLimiter in config', () => {
    const customRateLimiter = new RateLimiter({
      tokensPerInterval: 10,
      interval: 'minute',
    });
    const config: EPClientConfig = { rateLimiter: customRateLimiter };
    const client = new TestEPClient(config);
    expect(client.getCacheStats()).toBeDefined();
  });

  it('should respect custom timeoutMs in config', () => {
    const config: EPClientConfig = { timeoutMs: 5_000 };
    const client = new TestEPClient(config);
    expect(client.getCacheStats()).toBeDefined();
  });

  it('should respect enableRetry: false in config', () => {
    const config: EPClientConfig = { enableRetry: false };
    const client = new TestEPClient(config);
    expect(client.getCacheStats()).toBeDefined();
  });

  it('should respect custom maxRetries in config', () => {
    const config: EPClientConfig = { maxRetries: 5 };
    const client = new TestEPClient(config);
    expect(client.getCacheStats()).toBeDefined();
  });

  it('should use defaults when empty config provided', () => {
    const client = new TestEPClient({});
    const stats = client.getCacheStats();
    expect(stats.maxSize).toBe(DEFAULT_MAX_CACHE_SIZE);
    expect(stats.size).toBe(0);
  });
});

// ─── Constructor: shared resources path (if branch) ──────────────────────────

describe('BaseEPClient constructor — with shared resources', () => {
  it('should use shared cache and rateLimiter from shared resources', () => {
    const sharedCache = new LRUCache<string, Record<string, unknown>>({
      max: 99,
      ttl: 60_000,
    });
    const sharedRateLimiter = new RateLimiter({
      tokensPerInterval: 50,
      interval: 'minute',
    });
    const shared: EPSharedResources = {
      cache: sharedCache,
      rateLimiter: sharedRateLimiter,
      baseURL: 'https://shared.api.example.com/',
      timeoutMs: 7_500,
      enableRetry: false,
      maxRetries: 1,
      maxResponseBytes: 5_242_880,
      cacheCounters: { hits: 0, misses: 0 },
    };

    const client = new TestEPClient({}, shared);
    const stats = client.getCacheStats();
    expect(stats.maxSize).toBe(99);
  });
});

// ─── getCacheStats ────────────────────────────────────────────────────────────

describe('getCacheStats', () => {
  let client: TestEPClient;

  beforeEach(() => {
    client = new TestEPClient();
    vi.clearAllMocks();
  });

  it('should return size 0 for empty cache', () => {
    const stats = client.getCacheStats();
    expect(stats.size).toBe(0);
    expect(stats.maxSize).toBe(DEFAULT_MAX_CACHE_SIZE);
    expect(stats.hitRate).toBe(0);
  });

  it('should include maxSize equal to DEFAULT_MAX_CACHE_SIZE', () => {
    const stats = client.getCacheStats();
    expect(stats.maxSize).toBe(DEFAULT_MAX_CACHE_SIZE);
  });
});

// ─── clearCache ───────────────────────────────────────────────────────────────

describe('clearCache', () => {
  let client: TestEPClient;

  beforeEach(() => {
    client = new TestEPClient({ enableRetry: false });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should clear all cached entries', async () => {
    const payload = { data: [{ id: 'MEP-1' }], '@context': [] };
    mockFetch.mockResolvedValue(makeSuccessResponse(payload));

    // Populate cache via a request
    await client.testGet('meps');
    expect(client.getCacheStats().size).toBe(1);

    client.clearCache();
    expect(client.getCacheStats().size).toBe(0);
  });

  it('should allow a subsequent fetch after clearing', async () => {
    const payload = { data: [{ id: 'MEP-2' }], '@context': [] };
    mockFetch.mockResolvedValue(makeSuccessResponse(payload));

    await client.testGet('meps');
    client.clearCache();

    mockFetch.mockResolvedValue(makeSuccessResponse(payload));
    await client.testGet('meps');
    // fetch called twice: once before clear, once after
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

// ─── get() — caching behaviour ───────────────────────────────────────────────

describe('BaseEPClient.get() caching', () => {
  let client: TestEPClient;

  beforeEach(() => {
    client = new TestEPClient({ enableRetry: false });
    client.clearCache();
    vi.clearAllMocks();
  });

  it('should return data from API on first call', async () => {
    const payload = { data: [{ id: 'mep/1' }], '@context': [] };
    mockFetch.mockResolvedValueOnce(makeSuccessResponse(payload));

    const result = await client.testGet<typeof payload>('meps');
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('mep/1');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should return cached result on second call without hitting fetch', async () => {
    const payload = { data: [{ id: 'mep/2' }], '@context': [] };
    mockFetch.mockResolvedValueOnce(makeSuccessResponse(payload));

    await client.testGet('meps');
    await client.testGet('meps');

    // fetch should only be called once (cache hit on second call)
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should differentiate cache entries for different endpoints', async () => {
    const payload1 = { data: [{ id: 'mep/1' }], '@context': [] };
    const payload2 = { data: [{ id: 'session/1' }], '@context': [] };
    mockFetch
      .mockResolvedValueOnce(makeSuccessResponse(payload1))
      .mockResolvedValueOnce(makeSuccessResponse(payload2));

    const r1 = await client.testGet<typeof payload1>('meps');
    const r2 = await client.testGet<typeof payload2>('plenary-sessions');

    expect(r1.data[0].id).toBe('mep/1');
    expect(r2.data[0].id).toBe('session/1');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should differentiate cache entries for same endpoint with different params', async () => {
    const payload1 = { data: [{ id: 'mep/DE' }], '@context': [] };
    const payload2 = { data: [{ id: 'mep/FR' }], '@context': [] };
    mockFetch
      .mockResolvedValueOnce(makeSuccessResponse(payload1))
      .mockResolvedValueOnce(makeSuccessResponse(payload2));

    const r1 = await client.testGet<typeof payload1>('meps', { country: 'DE' });
    const r2 = await client.testGet<typeof payload2>('meps', { country: 'FR' });

    expect(r1.data[0].id).toBe('mep/DE');
    expect(r2.data[0].id).toBe('mep/FR');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should produce same cache key regardless of param insertion order', async () => {
    const payload = { data: [{ id: 'mep/1' }], '@context': [] };
    mockFetch.mockResolvedValueOnce(makeSuccessResponse(payload));

    // First call with { a, b } order
    await client.testGet('meps', { a: '1', b: '2' });
    // Second call with { b, a } order — should be a cache hit
    await client.testGet('meps', { b: '2', a: '1' });

    // Only one fetch call means the second was served from cache
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

// ─── get() — query parameter serialisation ───────────────────────────────────

describe('BaseEPClient.get() URL parameter handling', () => {
  let client: TestEPClient;

  beforeEach(() => {
    client = new TestEPClient({ enableRetry: false });
    client.clearCache();
    vi.clearAllMocks();
  });

  it('should append string params to URL', async () => {
    const payload = { data: [], '@context': [] };
    mockFetch.mockResolvedValueOnce(makeSuccessResponse(payload));

    await client.testGet('meps', { country: 'DE', term: '10' });

    const calledUrl = (mockFetch.mock.calls[0] as [string, ...unknown[]])[0];
    expect(calledUrl).toContain('country=DE');
    expect(calledUrl).toContain('term=10');
  });

  it('should append number params as strings', async () => {
    const payload = { data: [], '@context': [] };
    mockFetch.mockResolvedValueOnce(makeSuccessResponse(payload));

    await client.testGet('meps', { limit: 50 });

    const calledUrl = (mockFetch.mock.calls[0] as [string, ...unknown[]])[0];
    expect(calledUrl).toContain('limit=50');
  });

  it('should append boolean params as strings', async () => {
    const payload = { data: [], '@context': [] };
    mockFetch.mockResolvedValueOnce(makeSuccessResponse(payload));

    await client.testGet('meps', { active: true });

    const calledUrl = (mockFetch.mock.calls[0] as [string, ...unknown[]])[0];
    expect(calledUrl).toContain('active=true');
  });

  it('should serialize object params as JSON (line 201 — JSON.stringify fallback)', async () => {
    const payload = { data: [], '@context': [] };
    mockFetch.mockResolvedValueOnce(makeSuccessResponse(payload));

    // Object value triggers the JSON.stringify branch
    await client.testGet('meps', { filter: { political_group: 'EPP' } });

    const calledUrl = (mockFetch.mock.calls[0] as [string, ...unknown[]])[0];
    expect(calledUrl).toContain('filter=');
    expect(calledUrl).toContain('EPP');
  });

  it('should serialize array params as JSON', async () => {
    const payload = { data: [], '@context': [] };
    mockFetch.mockResolvedValueOnce(makeSuccessResponse(payload));

    // Array value also triggers the JSON.stringify branch
    await client.testGet('meps', { ids: ['1', '2', '3'] });

    const calledUrl = (mockFetch.mock.calls[0] as [string, ...unknown[]])[0];
    expect(calledUrl).toContain('ids=');
  });

  it('should skip null param values', async () => {
    const payload = { data: [], '@context': [] };
    mockFetch.mockResolvedValueOnce(makeSuccessResponse(payload));

    await client.testGet('meps', { country: null, limit: 50 });

    const calledUrl = (mockFetch.mock.calls[0] as [string, ...unknown[]])[0];
    expect(calledUrl).not.toContain('country=');
    expect(calledUrl).toContain('limit=50');
  });

  it('should skip undefined param values', async () => {
    const payload = { data: [], '@context': [] };
    mockFetch.mockResolvedValueOnce(makeSuccessResponse(payload));

    await client.testGet('meps', { country: undefined, limit: 25 });

    const calledUrl = (mockFetch.mock.calls[0] as [string, ...unknown[]])[0];
    expect(calledUrl).not.toContain('country=');
    expect(calledUrl).toContain('limit=25');
  });

  it('should make request without params when none provided', async () => {
    const payload = { data: [], '@context': [] };
    mockFetch.mockResolvedValueOnce(makeSuccessResponse(payload));

    await client.testGet('meps');

    const calledUrl = (mockFetch.mock.calls[0] as [string, ...unknown[]])[0];
    expect(calledUrl).toContain('/api/v2/meps');
    expect(calledUrl).not.toContain('?');
  });
});

// ─── get() — HTTP error handling ─────────────────────────────────────────────

describe('BaseEPClient.get() error handling', () => {
  let client: TestEPClient;

  beforeEach(() => {
    client = new TestEPClient({ enableRetry: false });
    client.clearCache();
    vi.clearAllMocks();
  });

  it('should throw APIError on 404 response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers(),
    });

    await expect(client.testGet('meps/9999')).rejects.toBeInstanceOf(APIError);
  });

  it('should throw APIError on 500 response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      headers: new Headers(),
    });

    await expect(client.testGet('meps')).rejects.toBeInstanceOf(APIError);
  });

  it('should include HTTP status code in thrown APIError', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      headers: new Headers(),
    });

    let thrownError: APIError | undefined;
    try {
      await client.testGet('meps');
    } catch (err) {
      thrownError = err as APIError;
    }
    expect(thrownError?.statusCode).toBe(403);
  });

  it('should throw APIError when content-length exceeds limit', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-length': String(DEFAULT_MAX_RESPONSE_BYTES + 1) }),
      json: async () => ({ data: [], '@context': [] }),
      body: { cancel: vi.fn().mockResolvedValue(undefined) },
    });

    await expect(client.testGet('meps')).rejects.toBeInstanceOf(APIError);
  });

  it('should throw APIError when network call throws a non-API error', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('network error'));

    await expect(client.testGet('meps')).rejects.toBeInstanceOf(APIError);
  });

  it('should throw APIError when response content-type is not JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'text/html; charset=utf-8' }),
      json: async () => ({ data: [], '@context': [] }),
    });

    await expect(client.testGet('meps')).rejects.toThrow(/unexpected content-type/);
  });

  it('should accept response when content-type includes json', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({
        'content-type': 'application/ld+json; charset=utf-8',
        'content-length': '30',
      }),
      text: async () => JSON.stringify({ data: [], '@context': [] }),
    });

    const result = await client.testGet<{ data: unknown[] }>('meps');
    expect(result.data).toEqual([]);
  });

  it('should accept response when content-type header is absent', async () => {
    const payload = { data: [{ id: 'ok' }], '@context': [] };
    mockFetch.mockResolvedValueOnce(makeSuccessResponse(payload));

    const result = await client.testGet<typeof payload>('meps');
    expect(result.data).toHaveLength(1);
  });

  it('should accept response with case-insensitive JSON content-type', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({
        'content-type': 'Application/JSON',
        'content-length': '30',
      }),
      text: async () => JSON.stringify({ data: [], '@context': [] }),
    });

    const result = await client.testGet<{ data: unknown[] }>('meps');
    expect(result.data).toEqual([]);
  });

  it('should return empty data when response body is empty (with content-length)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-length': '42' }),
      text: async () => '',
    });

    const result = await client.testGet<{ data: unknown[]; '@context': unknown[] }>('adopted-texts');
    expect(result).toEqual({ data: [], '@context': [] });
  });

  it('should return empty data for HTTP 204 No Content (e.g. controlled-vocabularies/feed)', async () => {
    const cancelMock = vi.fn();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      headers: new Headers(),
      body: { cancel: cancelMock },
    });

    const result = await client.testGet<{ data: unknown[]; '@context': unknown[] }>('controlled-vocabularies/feed');
    expect(result).toEqual({ data: [], '@context': [] });
    expect(cancelMock).toHaveBeenCalled();
  });

  it('should return empty data when response body is whitespace-only (with content-length)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-length': '5' }),
      text: async () => '\n  \t',
    });

    const result = await client.testGet<{ data: unknown[]; '@context': unknown[] }>('adopted-texts');
    expect(result).toEqual({ data: [], '@context': [] });
  });

  it('should fall back to readStreamedBody when content-length is non-finite', async () => {
    const payload = { data: [{ id: 'doc/1' }], '@context': [] };
    const encoded = new TextEncoder().encode(JSON.stringify(payload));
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoded);
        controller.close();
      },
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-length': 'garbage' }),
      body: stream,
    });

    const result = await client.testGet<{ data: unknown[]; '@context': unknown[] }>('adopted-texts');
    expect(result).toEqual(payload);
  });

  it('should throw on non-empty invalid JSON body (with content-length)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-length': '42' }),
      text: async () => 'not valid json{',
    });

    await expect(client.testGet('adopted-texts')).rejects.toBeInstanceOf(APIError);
  });

  it('should return empty data when streamed body is empty (zero bytes)', async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.close();
      },
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers(), // no content-length → triggers readStreamedBody
      body: stream,
    });

    const result = await client.testGet<{ data: unknown[]; '@context': unknown[] }>('adopted-texts');
    expect(result).toEqual({ data: [], '@context': [] });
  });

  it('should throw when streamed body contains non-empty invalid JSON', async () => {
    const invalidChunk = new TextEncoder().encode('not valid json{');
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(invalidChunk);
        controller.close();
      },
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers(), // no content-length → triggers readStreamedBody
      body: stream,
    });

    await expect(client.testGet('adopted-texts')).rejects.toBeInstanceOf(APIError);
  });
});

// ─── get() — retry behaviour ─────────────────────────────────────────────────

describe('BaseEPClient.get() retry behaviour', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retry on 429 when retry is enabled', async () => {
    vi.useFakeTimers();
    try {
      const client = new TestEPClient({ enableRetry: true, maxRetries: 1 });
      client.clearCache();

      const payload = { data: [{ id: 'mep/1' }], '@context': [] };
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          headers: new Headers(),
        })
        .mockResolvedValueOnce(makeSuccessResponse(payload));

      const requestPromise = client.testGet('meps');
      await vi.runAllTimersAsync();
      const result = await requestPromise;

      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('should not retry on 404 when retry is enabled', async () => {
    const client = new TestEPClient({ enableRetry: true, maxRetries: 2 });
    client.clearCache();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers(),
    });

    await expect(client.testGet('meps/9999')).rejects.toBeInstanceOf(APIError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should not retry when enableRetry is false', async () => {
    const client = new TestEPClient({ enableRetry: false });
    client.clearCache();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      headers: new Headers(),
    });

    await expect(client.testGet('meps')).rejects.toBeInstanceOf(APIError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should retry on SyntaxError with "Unexpected end of JSON input" (truncated response)', async () => {
    vi.useFakeTimers();
    try {
      const client = new TestEPClient({ enableRetry: true, maxRetries: 2 });
      client.clearCache();

      // When response.body is null, readStreamedBody falls back to response.json().
      // A SyntaxError thrown there is NOT caught inside fetchWithTimeout (no
      // content-length header → streamed path), so it reaches shouldRetryRequest().
      // "Unexpected end of JSON input" indicates a truncated response (transient),
      // so it IS retried.
      const makeTruncatedResponse = () => ({
        ok: true,
        headers: new Headers(), // no content-length → triggers readStreamedBody
        body: null,             // null body → readStreamedBody falls back to response.json()
        json: async () => { throw new SyntaxError('Unexpected end of JSON input'); },
      } as unknown as Response);

      mockFetch
        .mockResolvedValueOnce(makeTruncatedResponse())
        .mockResolvedValueOnce(makeTruncatedResponse())
        .mockResolvedValueOnce(makeTruncatedResponse());

      // Truncated JSON should be retried (maxRetries: 2 → 3 total attempts).
      // Capture the promise, advance fake timers, then assert the rejection.
      const requestPromise = client.testGet('adopted-texts').catch((e: unknown) => e);
      await vi.runAllTimersAsync();
      const error = await requestPromise;
      expect(error).toBeInstanceOf(APIError);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    } finally {
      vi.useRealTimers();
    }
  });

  it('should not retry on SyntaxError with other messages', async () => {
    const client = new TestEPClient({ enableRetry: true, maxRetries: 2 });
    client.clearCache();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers(),
      body: null,
      json: async () => { throw new SyntaxError('Unexpected token < in JSON'); },
    });

    // Non-truncation SyntaxError should NOT be retried
    await expect(client.testGet('adopted-texts')).rejects.toBeInstanceOf(APIError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

describe('BaseEPClient.get() per-request minimum timeout', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should apply extended timeout when minimumTimeoutMs exceeds global timeout', async () => {
    vi.useFakeTimers();
    // Global timeout is 5 ms; per-request minimum is 120_000 ms.
    // Math.max(120_000, 5) = 120_000 should be the effective timeout.
    const client = new TestEPClient({ timeoutMs: 5, enableRetry: false });
    client.clearCache();

    // fetch never resolves, so the request will time out at the effective timeout
    mockFetch.mockReturnValue(new Promise<Response>(() => { /* never resolves */ }));

    // Register .catch() BEFORE advancing timers to avoid unhandled rejection
    const promise = client.testGet('procedures/feed', {}, 120_000).catch((e: unknown) => e);

    // Advance past the 5 ms global timeout — request should still be pending
    // because the effective timeout is 120_000 ms
    await vi.advanceTimersByTimeAsync(10);
    // Advance past the 120_000 ms effective timeout
    await vi.advanceTimersByTimeAsync(120_000);

    const error = await promise as APIError;
    expect(error).toBeInstanceOf(APIError);
    expect(error.statusCode).toBe(408);
    expect(error.message).toContain('120000ms');
  });

  it('should use global timeout when minimumTimeoutMs is smaller', async () => {
    vi.useFakeTimers();
    // Global timeout is 60_000 ms; per-request minimum is 5 ms.
    // Math.max(5, 60_000) = 60_000 should be the effective timeout.
    const client = new TestEPClient({ timeoutMs: 60_000, enableRetry: false });
    client.clearCache();

    mockFetch.mockReturnValue(new Promise<Response>(() => { /* never resolves */ }));

    // Register .catch() BEFORE advancing timers to avoid unhandled rejection
    const promise = client.testGet('events/feed', {}, 5).catch((e: unknown) => e);

    await vi.advanceTimersByTimeAsync(60_001);

    const error = await promise as APIError;
    expect(error).toBeInstanceOf(APIError);
    expect(error.statusCode).toBe(408);
    expect(error.message).toContain('60000ms');
  });

  it('should ignore invalid minimumTimeoutMs values (NaN, 0, negative)', async () => {
    vi.useFakeTimers();
    const client = new TestEPClient({ timeoutMs: 50, enableRetry: false });
    client.clearCache();

    mockFetch.mockReturnValue(new Promise<Response>(() => { /* never resolves */ }));

    // NaN should be ignored — falls back to global 50ms
    // Register .catch() BEFORE advancing timers to avoid unhandled rejection
    const p1 = client.testGet('procedures/feed', {}, NaN).catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(51);
    const err1 = await p1 as APIError;
    expect(err1).toBeInstanceOf(APIError);
    expect(err1.statusCode).toBe(408);

    client.clearCache();
    vi.clearAllMocks();
    mockFetch.mockReturnValue(new Promise<Response>(() => { /* never resolves */ }));

    // 0 should be ignored — falls back to global 50ms
    const p2 = client.testGet('events/feed', {}, 0).catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(51);
    const err2 = await p2 as APIError;
    expect(err2).toBeInstanceOf(APIError);
    expect(err2.statusCode).toBe(408);

    client.clearCache();
    vi.clearAllMocks();
    mockFetch.mockReturnValue(new Promise<Response>(() => { /* never resolves */ }));

    // Negative should be ignored — falls back to global 50ms
    const p3 = client.testGet('procedures/feed', {}, -100).catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(51);
    const err3 = await p3 as APIError;
    expect(err3).toBeInstanceOf(APIError);
    expect(err3.statusCode).toBe(408);
  });

  it('should use default global timeout when minimumTimeoutMs is undefined', async () => {
    vi.useFakeTimers();
    const client = new TestEPClient({ timeoutMs: 50, enableRetry: false });
    client.clearCache();

    mockFetch.mockReturnValue(new Promise<Response>(() => { /* never resolves */ }));

    // Register .catch() BEFORE advancing timers to avoid unhandled rejection
    const promise = client.testGet('meps', {}, undefined).catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(51);

    const error = await promise as APIError;
    expect(error).toBeInstanceOf(APIError);
    expect(error.statusCode).toBe(408);
    expect(error.message).toContain('50ms');
  });
});
