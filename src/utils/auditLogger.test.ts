/**
 * Tests for Audit Logger and Audit Sink utilities
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AuditLogger, auditLogger as globalAuditLogger } from './auditLogger.js';
import {
  DEFAULT_SENSITIVE_KEYS,
  FileAuditSink,
  MemoryAuditSink,
  RetentionPolicy,
  StderrAuditSink,
  StructuredJsonSink,
  sanitizeParams,
} from './auditSink.js';
import type { AuditLogEntry, AuditSink } from './auditSink.js';
import { appendFile, rename, stat } from 'node:fs/promises';

vi.mock('node:fs/promises');

// ============================================================================
// Helpers
// ============================================================================

function makeEntry(overrides: Partial<Omit<AuditLogEntry, 'timestamp'>> = {}): AuditLogEntry {
  return {
    timestamp: new Date(),
    action: 'test_action',
    ...overrides,
  };
}

// ============================================================================
// sanitizeParams
// ============================================================================

describe('sanitizeParams', () => {
  it('should redact default sensitive keys', () => {
    const result = sanitizeParams({ name: 'Alice', country: 'SE' });
    expect(result['name']).toBe('[REDACTED]');
    expect(result['country']).toBe('SE');
  });

  it('should redact all default sensitive keys', () => {
    const input: Record<string, unknown> = {};
    for (const key of DEFAULT_SENSITIVE_KEYS) {
      input[key] = 'sensitive-value';
    }
    const result = sanitizeParams(input);
    for (const key of DEFAULT_SENSITIVE_KEYS) {
      expect(result[key]).toBe('[REDACTED]');
    }
  });

  it('should pass through non-sensitive values unchanged', () => {
    const result = sanitizeParams({ country: 'SE', limit: 50, active: true });
    expect(result['country']).toBe('SE');
    expect(result['limit']).toBe(50);
    expect(result['active']).toBe(true);
  });

  it('should handle an empty params object', () => {
    expect(sanitizeParams({})).toEqual({});
  });

  it('should use custom sensitive keys when provided', () => {
    const result = sanitizeParams({ mepId: 123, secret: 'abc' }, ['secret']);
    expect(result['secret']).toBe('[REDACTED]');
    expect(result['mepId']).toBe(123);
  });

  it('should not modify non-sensitive keys that happen to have null values', () => {
    const result = sanitizeParams({ country: null, term: 0 });
    expect(result['country']).toBeNull();
    expect(result['term']).toBe(0);
  });
});

// ============================================================================
// RetentionPolicy
// ============================================================================

describe('RetentionPolicy', () => {
  it('should keep fresh entries within retention window', () => {
    const policy = new RetentionPolicy(60_000); // 1 minute
    const fresh = makeEntry();
    expect(policy.enforce([fresh])).toHaveLength(1);
  });

  it('should filter out expired entries', () => {
    const policy = new RetentionPolicy(1); // 1 ms
    const old = makeEntry();
    old.timestamp = new Date(Date.now() - 1000);
    expect(policy.enforce([old])).toHaveLength(0);
  });

  it('should keep only fresh entries when mixed', () => {
    const policy = new RetentionPolicy(500);
    const old = makeEntry();
    old.timestamp = new Date(Date.now() - 1000);
    const fresh = makeEntry();
    const result = policy.enforce([old, fresh]);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(fresh);
  });

  it('isExpired should return true for old entries', () => {
    const policy = new RetentionPolicy(1);
    const old = makeEntry();
    old.timestamp = new Date(Date.now() - 1000);
    expect(policy.isExpired(old)).toBe(true);
  });

  it('isExpired should return false for fresh entries', () => {
    const policy = new RetentionPolicy(60_000);
    expect(policy.isExpired(makeEntry())).toBe(false);
  });

  it('should return empty array when all entries are expired', () => {
    const policy = new RetentionPolicy(1);
    const entries = [makeEntry(), makeEntry()];
    entries.forEach((e) => { e.timestamp = new Date(0); });
    expect(policy.enforce(entries)).toHaveLength(0);
  });
});

// ============================================================================
// MemoryAuditSink
// ============================================================================

describe('MemoryAuditSink', () => {
  let sink: MemoryAuditSink;

  beforeEach(() => {
    sink = new MemoryAuditSink();
  });

  it('should store written entries', () => {
    const entry = makeEntry({ action: 'get_meps' });
    sink.write(entry);
    expect(sink.query({})).toHaveLength(1);
  });

  it('should return all entries with an empty filter', () => {
    sink.write(makeEntry({ action: 'a' }));
    sink.write(makeEntry({ action: 'b' }));
    expect(sink.query({})).toHaveLength(2);
  });

  it('should filter by action', () => {
    sink.write(makeEntry({ action: 'get_meps' }));
    sink.write(makeEntry({ action: 'get_votes' }));
    const result = sink.query({ action: 'get_meps' });
    expect(result).toHaveLength(1);
    expect(result[0]?.action).toBe('get_meps');
  });

  it('should filter by since date', () => {
    const old = makeEntry();
    old.timestamp = new Date(Date.now() - 10_000);
    const fresh = makeEntry();
    sink.write(old);
    sink.write(fresh);
    const result = sink.query({ since: new Date(Date.now() - 5_000) });
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(fresh);
  });

  it('should filter by until date', () => {
    const old = makeEntry();
    old.timestamp = new Date(Date.now() - 10_000);
    const fresh = makeEntry();
    sink.write(old);
    sink.write(fresh);
    const result = sink.query({ until: new Date(Date.now() - 5_000) });
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(old);
  });

  it('should filter by userId', () => {
    const e1 = makeEntry({ userId: 'user-1' });
    const e2 = makeEntry({ userId: 'user-2' });
    const e3 = makeEntry(); // no userId
    sink.write(e1);
    sink.write(e2);
    sink.write(e3);
    expect(sink.query({ userId: 'user-1' })).toHaveLength(1);
    expect(sink.query({ userId: 'user-2' })).toHaveLength(1);
  });

  it('should not match entry with no userId when filtering by userId', () => {
    sink.write(makeEntry()); // no userId
    expect(sink.query({ userId: 'user-1' })).toHaveLength(0);
  });

  it('should clear all entries', () => {
    sink.write(makeEntry());
    sink.clear('any-token');
    expect(sink.query({})).toHaveLength(0);
  });

  it('should erase entries by userId', () => {
    sink.write(makeEntry({ userId: 'user-1' }));
    sink.write(makeEntry({ userId: 'user-2' }));
    sink.eraseByUser('user-1');
    const remaining = sink.query({});
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.userId).toBe('user-2');
  });

  it('should keep entries for other users when erasing by userId', () => {
    sink.write(makeEntry({ userId: 'user-a' }));
    sink.write(makeEntry({ userId: 'user-a' }));
    sink.write(makeEntry({ userId: 'user-b' }));
    sink.eraseByUser('user-a');
    expect(sink.query({})).toHaveLength(1);
  });

  it('should be a no-op eraseByUser when userId has no entries', () => {
    sink.write(makeEntry({ userId: 'user-b' }));
    sink.eraseByUser('non-existent');
    expect(sink.query({})).toHaveLength(1);
  });
});

// ============================================================================
// StderrAuditSink
// ============================================================================

describe('StderrAuditSink', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should write [AUDIT] + JSON to stderr', () => {
    const sink = new StderrAuditSink();
    const entry = makeEntry({ action: 'test' });
    sink.write(entry);
    expect(consoleSpy).toHaveBeenCalledWith('[AUDIT]', JSON.stringify(entry));
  });
});

// ============================================================================
// FileAuditSink
// ============================================================================

describe('FileAuditSink', () => {
  const mockAppend = vi.mocked(appendFile);
  const mockStat = vi.mocked(stat);
  const mockRename = vi.mocked(rename);

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: appendFile and rename succeed
    mockAppend.mockResolvedValue(undefined);
    mockRename.mockResolvedValue(undefined);
  });

  it('should append NDJSON entry to the file', async () => {
    const enoent = Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
    mockStat.mockRejectedValue(enoent);
    const sink = new FileAuditSink({ filePath: '/tmp/audit.log' });
    const entry = makeEntry({ action: 'write_test' });
    await sink.write(entry);
    expect(mockAppend).toHaveBeenCalledWith(
      '/tmp/audit.log',
      expect.stringContaining('"write_test"'),
      'utf8'
    );
  });

  it('should append a newline after the JSON entry', async () => {
    const enoent = Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
    mockStat.mockRejectedValue(enoent);
    const sink = new FileAuditSink({ filePath: '/tmp/audit.log' });
    await sink.write(makeEntry());
    const callArg = mockAppend.mock.calls[0]?.[1];
    expect(typeof callArg).toBe('string');
    expect((callArg as string).endsWith('\n')).toBe(true);
  });

  it('should rotate the log file when it exceeds maxSizeBytes', async () => {
    mockStat.mockResolvedValue({ size: 15 * 1024 * 1024 } as Awaited<ReturnType<typeof stat>>);
    const sink = new FileAuditSink({ filePath: '/tmp/audit.log', maxSizeBytes: 10 * 1024 * 1024 });
    await sink.write(makeEntry());
    expect(mockRename).toHaveBeenCalledWith('/tmp/audit.log', expect.stringContaining('/tmp/audit.log.'));
    expect(mockAppend).toHaveBeenCalled();
  });

  it('should not rotate when file is below maxSizeBytes', async () => {
    mockStat.mockResolvedValue({ size: 100 } as Awaited<ReturnType<typeof stat>>);
    const sink = new FileAuditSink({ filePath: '/tmp/audit.log' });
    await sink.write(makeEntry());
    expect(mockRename).not.toHaveBeenCalled();
    expect(mockAppend).toHaveBeenCalled();
  });

  it('should use 10 MiB as the default maxSizeBytes', async () => {
    mockStat.mockResolvedValue({ size: 10 * 1024 * 1024 } as Awaited<ReturnType<typeof stat>>);
    const sink = new FileAuditSink({ filePath: '/tmp/audit.log' });
    await sink.write(makeEntry());
    // size === maxSizeBytes triggers rotation
    expect(mockRename).toHaveBeenCalled();
  });

  it('should use a custom maxSizeBytes', async () => {
    mockStat.mockResolvedValue({ size: 200 } as Awaited<ReturnType<typeof stat>>);
    const sink = new FileAuditSink({ filePath: '/tmp/audit.log', maxSizeBytes: 100 });
    await sink.write(makeEntry());
    expect(mockRename).toHaveBeenCalled();
  });

  it('should include a timestamp in the rotated filename', async () => {
    mockStat.mockResolvedValue({ size: 20 * 1024 * 1024 } as Awaited<ReturnType<typeof stat>>);
    const sink = new FileAuditSink({ filePath: '/var/log/ep.log' });
    await sink.write(makeEntry());
    const newName = mockRename.mock.calls[0]?.[1] as string;
    expect(newName).toMatch(/^\/var\/log\/ep\.log\.\d+\.bak$/);
  });

  it('should not rotate when stat rejects with ENOENT (file not yet created)', async () => {
    const enoent = Object.assign(new Error('no such file'), { code: 'ENOENT' });
    mockStat.mockRejectedValue(enoent);
    const sink = new FileAuditSink({ filePath: '/tmp/audit.log' });
    await sink.write(makeEntry());
    expect(mockRename).not.toHaveBeenCalled();
    expect(mockAppend).toHaveBeenCalled();
  });

  it('should rethrow non-ENOENT errors from stat', async () => {
    const permError = Object.assign(new Error('Permission denied'), { code: 'EACCES' });
    mockStat.mockRejectedValue(permError);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const sink = new FileAuditSink({ filePath: '/tmp/audit.log' });
    await expect(sink.write(makeEntry())).rejects.toThrow('Permission denied');
    consoleSpy.mockRestore();
  });

  it('should log to stderr and rethrow non-ENOENT rotation errors', async () => {
    const busyError = Object.assign(new Error('EBUSY'), { code: 'EBUSY' });
    mockStat.mockRejectedValue(busyError);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const sink = new FileAuditSink({ filePath: '/tmp/audit.log' });
    await expect(sink.write(makeEntry())).rejects.toThrow();
    expect(consoleSpy).toHaveBeenCalledWith(
      '[FileAuditSink] Failed to rotate audit log file:',
      busyError
    );
    consoleSpy.mockRestore();
  });

  it('should serialise concurrent writes to prevent interleaved stat/rename/append', async () => {
    // Simulate two concurrent write() calls; ensure appendFile calls are
    // sequential (not interleaved) thanks to the internal promise queue.
    const appendOrder: number[] = [];
    let callCount = 0;
    mockStat.mockResolvedValue({ size: 100 } as Awaited<ReturnType<typeof stat>>);
    mockAppend.mockImplementation(async (): Promise<void> => {
      const order = ++callCount;
      // Slight delay to expose ordering issues if writes run in parallel.
      await new Promise<void>((res) => setTimeout(res, 5));
      appendOrder.push(order);
    });
    const sink = new FileAuditSink({ filePath: '/tmp/audit.log' });
    await Promise.all([sink.write(makeEntry({ action: 'first' })), sink.write(makeEntry({ action: 'second' }))]);
    // Both writes completed and appendFile was called exactly twice.
    expect(mockAppend).toHaveBeenCalledTimes(2);
    // Writes were serialised: first=1, second=2 (never concurrent).
    expect(appendOrder).toEqual([1, 2]);
  });

  it('should allow subsequent writes to proceed after a failed write', async () => {
    // Verify the queue reset: if one write fails, the next write should still
    // execute rather than being permanently blocked on a rejected queue.
    const permError = Object.assign(new Error('Permission denied'), { code: 'EACCES' });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    // First write: stat throws a non-ENOENT error → write rejects
    mockStat.mockRejectedValueOnce(permError);
    // Second write: stat returns small file (no rotation needed) → succeeds
    mockStat.mockResolvedValueOnce({ size: 100 } as Awaited<ReturnType<typeof stat>>);
    const sink = new FileAuditSink({ filePath: '/tmp/audit.log' });
    await expect(sink.write(makeEntry({ action: 'fail' }))).rejects.toThrow('Permission denied');
    // Second write should succeed despite the prior failure
    await expect(sink.write(makeEntry({ action: 'recover' }))).resolves.toBeUndefined();
    expect(mockAppend).toHaveBeenCalledTimes(1);
    consoleSpy.mockRestore();
  });
});

describe('StructuredJsonSink', () => {
  it('should call the provided writer with JSON', () => {
    const writer = vi.fn<(json: string) => void>();
    const sink = new StructuredJsonSink(writer);
    const entry = makeEntry({ action: 'structured_test' });
    sink.write(entry);
    expect(writer).toHaveBeenCalledWith(JSON.stringify(entry));
  });

  it('should use console.error with [AUDIT] prefix as default writer', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const sink = new StructuredJsonSink();
    const entry = makeEntry();
    sink.write(entry);
    expect(spy).toHaveBeenCalledWith('[AUDIT]', JSON.stringify(entry));
    spy.mockRestore();
  });
});

// ============================================================================
// AuditLogger — existing tests (preserved for backward compatibility)
// ============================================================================

describe('AuditLogger', () => {
  let logger: AuditLogger;

  beforeEach(() => {
    logger = new AuditLogger();
  });

  describe('log', () => {
    it('should log an audit entry', () => {
      logger.log({
        action: 'get_meps',
        params: { country: 'SE' }
      });

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]?.action).toBe('get_meps');
      expect(logs[0]?.params).toEqual({ country: 'SE' });
      expect(logs[0]?.timestamp).toBeInstanceOf(Date);
    });

    it('should log an entry without params', () => {
      logger.log({ action: 'no_params' });
      const logs = logger.getLogs();
      expect(logs[0]?.action).toBe('no_params');
      expect(logs[0]).not.toHaveProperty('params');
    });

    it('should include result metadata', () => {
      logger.log({
        action: 'get_meps',
        params: { country: 'SE' },
        result: {
          count: 10,
          success: true
        }
      });

      const logs = logger.getLogs();
      expect(logs[0]?.result?.count).toBe(10);
      expect(logs[0]?.result?.success).toBe(true);
    });

    it('should support optional fields', () => {
      logger.log({
        action: 'get_mep_details',
        params: { id: 'MEP-123' },
        userId: 'user-456',
        clientId: 'client-789',
        ipAddress: '192.168.1.1'
      });

      const logs = logger.getLogs();
      expect(logs[0]?.userId).toBe('user-456');
      expect(logs[0]?.clientId).toBe('client-789');
      expect(logs[0]?.ipAddress).toBe('192.168.1.1');
    });
  });

  describe('logDataAccess', () => {
    it('should log successful data access', () => {
      logger.logDataAccess('get_meps', { country: 'SE' }, 15);

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]?.action).toBe('get_meps');
      expect(logs[0]?.result?.count).toBe(15);
      expect(logs[0]?.result?.success).toBe(true);
    });

    it('should record duration when provided', () => {
      logger.logDataAccess('get_meps', {}, 5, 88);
      expect(logger.getLogs()[0]?.duration).toBe(88);
    });
  });

  describe('logError', () => {
    it('should log failed operation', () => {
      logger.logError('get_meps', { country: 'INVALID' }, 'Validation error');

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]?.action).toBe('get_meps');
      expect(logs[0]?.result?.success).toBe(false);
      expect(logs[0]?.result?.error).toBe('Validation error');
    });

    it('should record duration when provided', () => {
      logger.logError('get_meps', {}, 'err', 30);
      expect(logger.getLogs()[0]?.duration).toBe(30);
    });
  });

  describe('getLogs', () => {
    it('should return copy of logs array', () => {
      logger.log({ action: 'test1', params: {} });
      logger.log({ action: 'test2', params: {} });

      const logs1 = logger.getLogs();
      const logs2 = logger.getLogs();

      expect(logs1).toEqual(logs2);
      expect(logs1).not.toBe(logs2); // Should be different arrays
    });

    it('should return logs in order', () => {
      logger.log({ action: 'test1', params: {} });
      logger.log({ action: 'test2', params: {} });
      logger.log({ action: 'test3', params: {} });

      const logs = logger.getLogs();
      expect(logs[0]?.action).toBe('test1');
      expect(logs[1]?.action).toBe('test2');
      expect(logs[2]?.action).toBe('test3');
    });
  });

  describe('clear', () => {
    it('should clear all logs', () => {
      logger.log({ action: 'test1', params: {} });
      logger.log({ action: 'test2', params: {} });

      expect(logger.getLogs()).toHaveLength(2);

      logger.clear();
      expect(logger.getLogs()).toHaveLength(0);
    });

    it('should allow clear() without auth when no token is configured', () => {
      logger.log({ action: 'x', params: {} });
      expect(() => logger.clear()).not.toThrow();
      expect(logger.getLogs()).toHaveLength(0);
    });

    it('should throw on clear() with wrong token when auth is configured', () => {
      const secured = new AuditLogger({ requiredAuthToken: 'tok' });
      secured.log({ action: 'x', params: {} });
      expect(() => secured.clear('bad')).toThrow('Unauthorized');
    });

    it('should allow clear() with correct token', () => {
      const secured = new AuditLogger({ requiredAuthToken: 'tok' });
      secured.log({ action: 'x', params: {} });
      expect(() => secured.clear('tok')).not.toThrow();
      expect(secured.getLogs('tok')).toHaveLength(0);
    });

    it('should throw on clear() with no token when auth is required', () => {
      const secured = new AuditLogger({ requiredAuthToken: 'tok' });
      expect(() => secured.clear()).toThrow('Unauthorized');
    });
  });

  describe('Global instance', () => {
    it('should export global auditLogger instance', () => {
      expect(globalAuditLogger).toBeInstanceOf(AuditLogger);
    });
  });

  describe('logToolCall', () => {
    it('should record a successful tool call in getLogs()', () => {
      logger.logToolCall('get_meps', { country: 'SE' }, true);

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]?.action).toBe('tool_call');
      expect(logs[0]?.result?.success).toBe(true);
    });

    it('should record a failed tool call with error', () => {
      logger.logToolCall('get_mep_details', { id: '999' }, false, undefined, 'Not found');

      const logs = logger.getLogs();
      expect(logs[0]?.result?.success).toBe(false);
      expect(logs[0]?.result?.error).toBe('Not found');
    });

    it('should record optional duration', () => {
      logger.logToolCall('search_documents', { keyword: 'test' }, true, 42);

      const logs = logger.getLogs();
      expect(logs[0]?.duration).toBe(42);
    });

    it('should omit duration when not provided', () => {
      logger.logToolCall('get_meps', {}, true);

      const logs = logger.getLogs();
      expect(logs[0]).not.toHaveProperty('duration');
    });
  });

  describe('GDPR Compliance', () => {
    it('should log all required fields for compliance', () => {
      logger.log({
        action: 'get_mep_details',
        params: { id: 'MEP-123' },
        result: { count: 1, success: true }
      });

      const logs = logger.getLogs();
      const entry = logs[0];

      // Required fields for GDPR compliance
      expect(entry).toHaveProperty('timestamp');
      expect(entry).toHaveProperty('action');
      expect(entry).toHaveProperty('params');
      expect(entry).toHaveProperty('result');
    });

    it('should support audit trail queries by action', () => {
      logger.log({ action: 'get_meps', params: {} });
      logger.log({ action: 'get_mep_details', params: {} });
      logger.log({ action: 'get_meps', params: {} });

      const logs = logger.getLogs();
      const getMepsLogs = logs.filter(l => l.action === 'get_meps');

      expect(getMepsLogs).toHaveLength(2);
    });
  });

  // ============================================================================
  // NEW: Parameter sanitisation
  // ============================================================================

  describe('Parameter sanitisation', () => {
    it('should redact sensitive keys in log() params', () => {
      logger.log({ action: 'search', params: { name: 'Alice', country: 'SE' } });
      const entry = logger.getLogs()[0];
      expect(entry?.params?.['name']).toBe('[REDACTED]');
      expect(entry?.params?.['country']).toBe('SE');
    });

    it('should redact sensitive keys in logToolCall() inner params', () => {
      logger.logToolCall('get_mep', { name: 'Bob', mepId: 42 }, true);
      const entry = logger.getLogs()[0];
      const tool = entry?.params?.['tool'] as Record<string, unknown>;
      const toolParams = tool?.['params'] as Record<string, unknown>;
      expect(toolParams?.['name']).toBe('[REDACTED]');
      expect(toolParams?.['mepId']).toBe(42);
    });

    it('should redact sensitive keys in logDataAccess()', () => {
      logger.logDataAccess('get_meps', { email: 'a@b.com', limit: 10 }, 1);
      const entry = logger.getLogs()[0];
      expect(entry?.params?.['email']).toBe('[REDACTED]');
      expect(entry?.params?.['limit']).toBe(10);
    });

    it('should redact sensitive keys in logError()', () => {
      logger.logError('op', { fullName: 'Jane Doe', id: 1 }, 'err');
      const entry = logger.getLogs()[0];
      expect(entry?.params?.['fullName']).toBe('[REDACTED]');
      expect(entry?.params?.['id']).toBe(1);
    });

    it('should allow custom sensitive keys via constructor options', () => {
      const custom = new AuditLogger({ sensitiveKeys: ['mepId'] });
      custom.log({ action: 'x', params: { mepId: 99, other: 'ok' } });
      const entry = custom.getLogs()[0];
      expect(entry?.params?.['mepId']).toBe('[REDACTED]');
      expect(entry?.params?.['other']).toBe('ok');
    });
  });

  // ============================================================================
  // NEW: Pluggable sinks
  // ============================================================================

  describe('Pluggable sinks', () => {
    it('should call provided extra sinks on log()', () => {
      const customSink: AuditSink = { write: vi.fn<AuditSink['write']>() };
      const logger2 = new AuditLogger({ sinks: [customSink] });
      logger2.log({ action: 'sink_test', params: {} });
      expect(customSink.write).toHaveBeenCalledTimes(1);
    });

    it('should pass the fully-formed entry (with timestamp) to sinks', () => {
      const received: AuditLogEntry[] = [];
      const customSink: AuditSink = { write: (e) => { received.push(e); } };
      const logger2 = new AuditLogger({ sinks: [customSink] });
      logger2.log({ action: 'ts_test', params: {} });
      expect(received[0]?.timestamp).toBeInstanceOf(Date);
    });

    it('should still write to memorySink even with custom extra sinks', () => {
      const customSink: AuditSink = { write: vi.fn<AuditSink['write']>() };
      const logger2 = new AuditLogger({ sinks: [customSink] });
      logger2.log({ action: 'mem_test', params: {} });
      expect(logger2.getLogs()).toHaveLength(1);
    });

    it('should call multiple sinks', () => {
      const sink1: AuditSink = { write: vi.fn<AuditSink['write']>() };
      const sink2: AuditSink = { write: vi.fn<AuditSink['write']>() };
      const logger2 = new AuditLogger({ sinks: [sink1, sink2] });
      logger2.log({ action: 'multi_sink', params: {} });
      expect(sink1.write).toHaveBeenCalledTimes(1);
      expect(sink2.write).toHaveBeenCalledTimes(1);
    });

    it('should support async sinks (Promise<void>) via fire-and-forget', async () => {
      let resolveWrite!: () => void;
      const writePromise = new Promise<void>((res) => { resolveWrite = res; });
      const asyncSink: AuditSink = { write: vi.fn<AuditSink['write']>().mockReturnValue(writePromise) };
      const logger2 = new AuditLogger({ sinks: [asyncSink] });
      // log() should return synchronously even though the sink is async
      logger2.log({ action: 'async_sink', params: {} });
      expect(asyncSink.write).toHaveBeenCalledTimes(1);
      // Resolve the promise and verify no unhandled rejection
      resolveWrite();
      await writePromise;
    });

    it('should surface async sink errors to stderr without throwing', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const asyncSink: AuditSink = {
        write: vi.fn<AuditSink['write']>().mockRejectedValue(new Error('disk full')),
      };
      const logger2 = new AuditLogger({ sinks: [asyncSink] });
      logger2.log({ action: 'fail_sink', params: {} });
      // Allow microtask queue to drain so the .catch() fires
      await Promise.resolve();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[AuditLogger] Async sink write failed:',
        expect.objectContaining({ message: 'disk full' })
      );
      consoleSpy.mockRestore();
    });

    it('should surface synchronous sink errors to stderr without throwing', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const syncThrowingSink: AuditSink = {
        write: vi.fn<AuditSink['write']>().mockImplementation((): void => {
          throw new Error('sync write failure');
        }),
      };
      const logger2 = new AuditLogger({ sinks: [syncThrowingSink] });
      // log() must not throw even when the sink throws synchronously
      expect(() => logger2.log({ action: 'sync_fail', params: {} })).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[AuditLogger] Sync sink write failed:',
        expect.objectContaining({ message: 'sync write failure' })
      );
      consoleSpy.mockRestore();
    });
  });

  // ============================================================================
  // NEW: Data retention
  // ============================================================================

  describe('Data retention', () => {
    it('should filter expired entries in getLogs()', () => {
      vi.useFakeTimers();
      const logger2 = new AuditLogger({ retentionMs: 1000 });
      logger2.log({ action: 'old', params: {} });
      // Advance time past the retention window
      vi.advanceTimersByTime(2000);
      expect(logger2.getLogs()).toHaveLength(0);
      vi.useRealTimers();
    });

    it('should keep fresh entries within retention window', () => {
      vi.useFakeTimers();
      const logger2 = new AuditLogger({ retentionMs: 60_000 });
      logger2.log({ action: 'fresh', params: {} });
      vi.advanceTimersByTime(1000);
      expect(logger2.getLogs()).toHaveLength(1);
      vi.useRealTimers();
    });

    it('should return all entries when no retention policy is set', () => {
      // Default logger has no retentionMs
      logger.log({ action: 'a', params: {} });
      logger.log({ action: 'b', params: {} });
      expect(logger.getLogs()).toHaveLength(2);
    });

    it('should apply retention in queryLogs()', () => {
      vi.useFakeTimers();
      const logger2 = new AuditLogger({ retentionMs: 1000 });
      logger2.log({ action: 'recent', params: {} });
      vi.advanceTimersByTime(2000);
      expect(logger2.queryLogs({ action: 'recent' })).toHaveLength(0);
      vi.useRealTimers();
    });

    it('should prune expired entries from memory on log() to prevent unbounded growth', () => {
      vi.useFakeTimers();
      const logger2 = new AuditLogger({ retentionMs: 1000 });
      logger2.log({ action: 'old1', params: {} });
      logger2.log({ action: 'old2', params: {} });
      // Advance past retention window
      vi.advanceTimersByTime(2000);
      // Writing a new entry should trigger pruning of old entries
      logger2.log({ action: 'fresh', params: {} });
      // getLogs should return only the fresh entry (no retention filter needed,
      // since pruning already removed them from the buffer)
      const logs = logger2.getLogs();
      expect(logs.every((e) => e.action === 'fresh')).toBe(true);
      vi.useRealTimers();
    });

    it('should prune expired anonymous entries (no userId) from memory on log()', () => {
      vi.useFakeTimers();
      const logger2 = new AuditLogger({ retentionMs: 500 });
      // Log entries without userId
      logger2.log({ action: 'anon1', params: {} });
      logger2.log({ action: 'anon2', params: {} });
      vi.advanceTimersByTime(1000);
      // New write should trigger pruning of the anonymous expired entries
      logger2.log({ action: 'new', params: {} });
      const logs = logger2.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]?.action).toBe('new');
      vi.useRealTimers();
    });

    it('should not prune entries when no retention policy is configured', () => {
      logger.log({ action: 'keep1', params: {} });
      logger.log({ action: 'keep2', params: {} });
      logger.log({ action: 'keep3', params: {} });
      expect(logger.getLogs()).toHaveLength(3);
    });

    it('should retain fresh entries for a user who also has expired entries', () => {
      // Tests the critical correctness: pruning must NOT use eraseByUser() which
      // would delete ALL entries for a user, including non-expired ones.
      vi.useFakeTimers();
      const logger2 = new AuditLogger({ retentionMs: 1000 });
      // T=0: expired entry for user-a
      logger2.log({ action: 'old-entry', params: {}, userId: 'user-a' });
      // T=800: fresh entry for user-a (will be 200ms old when pruning runs at T=1200)
      vi.advanceTimersByTime(800);
      logger2.log({ action: 'fresh-entry', params: {}, userId: 'user-a' });
      // T=1200: old-entry expired (1200ms > 1000ms), fresh-entry still valid (400ms old)
      vi.advanceTimersByTime(400);
      logger2.log({ action: 'trigger', params: {} }); // triggers pruning
      const logs = logger2.getLogs();
      // old-entry (expired) must be gone
      expect(logs.some((e) => e.action === 'old-entry')).toBe(false);
      // fresh-entry (not expired) must be retained
      expect(logs.some((e) => e.action === 'fresh-entry')).toBe(true);
      vi.useRealTimers();
    });

    it('should prune only by timestamp, not by userId', () => {
      vi.useFakeTimers();
      const logger2 = new AuditLogger({ retentionMs: 1000 });
      logger2.log({ action: 'user-old', params: {}, userId: 'alice' });
      logger2.log({ action: 'user-fresh', params: {}, userId: 'alice' });
      vi.advanceTimersByTime(500); // both entries are 500ms old (not yet expired)
      logger2.log({ action: 'trigger', params: {} });
      const logs = logger2.getLogs();
      // Neither alice entry should be pruned - neither is expired
      expect(logs.some((e) => e.action === 'user-old')).toBe(true);
      expect(logs.some((e) => e.action === 'user-fresh')).toBe(true);
      vi.useRealTimers();
    });
  });

  // ============================================================================
  // NEW: Access control on getLogs()
  // ============================================================================

  describe('Access control', () => {
    it('should allow getLogs() without auth when no token is configured', () => {
      logger.log({ action: 'a', params: {} });
      expect(() => logger.getLogs()).not.toThrow();
      expect(logger.getLogs()).toHaveLength(1);
    });

    it('should throw when required token is missing', () => {
      const secured = new AuditLogger({ requiredAuthToken: 'secret' });
      secured.log({ action: 'x', params: {} });
      expect(() => secured.getLogs()).toThrow('Unauthorized');
    });

    it('should throw when required token is wrong', () => {
      const secured = new AuditLogger({ requiredAuthToken: 'secret' });
      expect(() => secured.getLogs('wrong')).toThrow('Unauthorized');
    });

    it('should allow getLogs() with correct token', () => {
      const secured = new AuditLogger({ requiredAuthToken: 'secret' });
      secured.log({ action: 'x', params: {} });
      expect(secured.getLogs('secret')).toHaveLength(1);
    });

    it('should throw on queryLogs() with wrong token', () => {
      const secured = new AuditLogger({ requiredAuthToken: 'tok' });
      expect(() => secured.queryLogs({}, 'bad')).toThrow('Unauthorized');
    });

    it('should allow queryLogs() with correct token', () => {
      const secured = new AuditLogger({ requiredAuthToken: 'tok' });
      secured.log({ action: 'q', params: {} });
      expect(secured.queryLogs({}, 'tok')).toHaveLength(1);
    });

    it('should throw on eraseByUser() with wrong token', () => {
      const secured = new AuditLogger({ requiredAuthToken: 'tok' });
      expect(() => secured.eraseByUser('user-1', 'bad')).toThrow('Unauthorized');
    });

    it('should allow eraseByUser() without token when none configured', () => {
      logger.log({ action: 'a', params: {}, userId: 'user-1' });
      expect(() => logger.eraseByUser('user-1')).not.toThrow();
    });
  });

  // ============================================================================
  // NEW: queryLogs
  // ============================================================================

  describe('queryLogs', () => {
    it('should return matching entries', () => {
      logger.log({ action: 'get_meps', params: {} });
      logger.log({ action: 'get_votes', params: {} });
      const results = logger.queryLogs({ action: 'get_meps' });
      expect(results).toHaveLength(1);
      expect(results[0]?.action).toBe('get_meps');
    });

    it('should return all entries with empty filter', () => {
      logger.log({ action: 'a', params: {} });
      logger.log({ action: 'b', params: {} });
      expect(logger.queryLogs({})).toHaveLength(2);
    });
  });

  // ============================================================================
  // NEW: Right to erasure (GDPR Art. 17)
  // ============================================================================

  describe('eraseByUser (GDPR Art. 17)', () => {
    it('should remove all entries for the specified userId', () => {
      logger.log({ action: 'a', params: {}, userId: 'user-1' });
      logger.log({ action: 'b', params: {}, userId: 'user-2' });
      logger.eraseByUser('user-1');
      const remaining = logger.getLogs();
      expect(remaining).toHaveLength(1);
      expect(remaining[0]?.userId).toBe('user-2');
    });

    it('should be a no-op when userId has no entries', () => {
      logger.log({ action: 'a', params: {}, userId: 'user-2' });
      logger.eraseByUser('non-existent');
      expect(logger.getLogs()).toHaveLength(1);
    });

    it('should allow erasure with correct auth token', () => {
      const secured = new AuditLogger({ requiredAuthToken: 'tok' });
      secured.log({ action: 'a', params: {}, userId: 'u1' });
      expect(() => secured.eraseByUser('u1', 'tok')).not.toThrow();
      expect(secured.getLogs('tok')).toHaveLength(0);
    });
  });
});
