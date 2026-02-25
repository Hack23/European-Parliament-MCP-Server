/**
 * Tests for Audit Logger utility
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AuditLogger, auditLogger as globalAuditLogger } from './auditLogger.js';

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
});
