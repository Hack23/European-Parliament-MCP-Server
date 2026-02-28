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
import { appendFileSync, renameSync, statSync } from 'node:fs';

vi.mock('node:fs');

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
  const mockAppend = vi.mocked(appendFileSync);
  const mockStat = vi.mocked(statSync);
  const mockRename = vi.mocked(renameSync);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should append NDJSON entry to the file', () => {
    mockStat.mockImplementation(() => { throw new Error('ENOENT'); });
    const sink = new FileAuditSink({ filePath: '/tmp/audit.log' });
    const entry = makeEntry({ action: 'write_test' });
    sink.write(entry);
    expect(mockAppend).toHaveBeenCalledWith(
      '/tmp/audit.log',
      expect.stringContaining('"write_test"'),
      'utf8'
    );
  });

  it('should append a newline after the JSON entry', () => {
    mockStat.mockImplementation(() => { throw new Error('ENOENT'); });
    const sink = new FileAuditSink({ filePath: '/tmp/audit.log' });
    sink.write(makeEntry());
    const callArg = mockAppend.mock.calls[0]?.[1];
    expect(typeof callArg).toBe('string');
    expect((callArg as string).endsWith('\n')).toBe(true);
  });

  it('should rotate the log file when it exceeds maxSizeBytes', () => {
    mockStat.mockReturnValue({ size: 15 * 1024 * 1024 } as ReturnType<typeof statSync>);
    const sink = new FileAuditSink({ filePath: '/tmp/audit.log', maxSizeBytes: 10 * 1024 * 1024 });
    sink.write(makeEntry());
    expect(mockRename).toHaveBeenCalledWith('/tmp/audit.log', expect.stringContaining('/tmp/audit.log.'));
    expect(mockAppend).toHaveBeenCalled();
  });

  it('should not rotate when file is below maxSizeBytes', () => {
    mockStat.mockReturnValue({ size: 100 } as ReturnType<typeof statSync>);
    const sink = new FileAuditSink({ filePath: '/tmp/audit.log' });
    sink.write(makeEntry());
    expect(mockRename).not.toHaveBeenCalled();
    expect(mockAppend).toHaveBeenCalled();
  });

  it('should use 10 MiB as the default maxSizeBytes', () => {
    mockStat.mockReturnValue({ size: 10 * 1024 * 1024 } as ReturnType<typeof statSync>);
    const sink = new FileAuditSink({ filePath: '/tmp/audit.log' });
    sink.write(makeEntry());
    // size === maxSizeBytes triggers rotation
    expect(mockRename).toHaveBeenCalled();
  });

  it('should use a custom maxSizeBytes', () => {
    mockStat.mockReturnValue({ size: 200 } as ReturnType<typeof statSync>);
    const sink = new FileAuditSink({ filePath: '/tmp/audit.log', maxSizeBytes: 100 });
    sink.write(makeEntry());
    expect(mockRename).toHaveBeenCalled();
  });

  it('should include a timestamp in the rotated filename', () => {
    mockStat.mockReturnValue({ size: 20 * 1024 * 1024 } as ReturnType<typeof statSync>);
    const sink = new FileAuditSink({ filePath: '/var/log/ep.log' });
    sink.write(makeEntry());
    const newName = mockRename.mock.calls[0]?.[1] as string;
    expect(newName).toMatch(/^\/var\/log\/ep\.log\.\d+\.bak$/);
  });
});

// ============================================================================
// StructuredJsonSink
// ============================================================================

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
