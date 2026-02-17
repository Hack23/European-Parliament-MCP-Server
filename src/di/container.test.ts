import { describe, it, expect, beforeEach } from 'vitest';
import { DIContainer } from './container.js';

describe('DIContainer', () => {
  let container: DIContainer;

  beforeEach(() => {
    container = new DIContainer();
  });

  describe('Service Registration', () => {
    it('should register a singleton service', () => {
      const token = Symbol('TestService');
      const factory = (): string => 'test';

      container.register(token, factory, 'singleton');

      expect(container.has(token)).toBe(true);
    });

    it('should register a transient service', () => {
      const token = Symbol('TestService');
      const factory = (): string => 'test';

      container.register(token, factory, 'transient');

      expect(container.has(token)).toBe(true);
    });

    it('should default to singleton lifetime', () => {
      const token = Symbol('TestService');
      const factory = (): string => 'test';

      container.register(token, factory);

      const instance1 = container.resolve<string>(token);
      const instance2 = container.resolve<string>(token);

      expect(instance1).toBe(instance2);
    });
  });

  describe('Service Resolution', () => {
    it('should resolve a singleton service', () => {
      const token = Symbol('TestService');
      const factory = (): string => 'test-value';

      container.register(token, factory, 'singleton');
      const resolved = container.resolve<string>(token);

      expect(resolved).toBe('test-value');
    });

    it('should return same instance for singleton', () => {
      const token = Symbol('TestService');
      let callCount = 0;
      const factory = (): { id: number } => {
        callCount++;
        return { id: callCount };
      };

      container.register(token, factory, 'singleton');
      const instance1 = container.resolve<{ id: number }>(token);
      const instance2 = container.resolve<{ id: number }>(token);

      expect(instance1).toBe(instance2);
      expect(instance1.id).toBe(1);
      expect(callCount).toBe(1);
    });

    it('should return new instance for transient', () => {
      const token = Symbol('TestService');
      let callCount = 0;
      const factory = (): { id: number } => {
        callCount++;
        return { id: callCount };
      };

      container.register(token, factory, 'transient');
      const instance1 = container.resolve<{ id: number }>(token);
      const instance2 = container.resolve<{ id: number }>(token);

      expect(instance1).not.toBe(instance2);
      expect(instance1.id).toBe(1);
      expect(instance2.id).toBe(2);
      expect(callCount).toBe(2);
    });

    it('should throw error for unregistered service', () => {
      const token = Symbol('UnregisteredService');

      expect(() => container.resolve(token)).toThrow('Service not registered');
    });

    it('should support dependency injection', () => {
      const depToken = Symbol('Dependency');
      const serviceToken = Symbol('Service');

      container.register(depToken, () => 'dependency', 'singleton');
      container.register(
        serviceToken,
        (c) => `service-${c.resolve<string>(depToken)}`,
        'singleton'
      );

      const resolved = container.resolve<string>(serviceToken);
      expect(resolved).toBe('service-dependency');
    });
  });

  describe('Service Management', () => {
    it('should check if service is registered', () => {
      const token = Symbol('TestService');
      expect(container.has(token)).toBe(false);

      container.register(token, () => 'test');
      expect(container.has(token)).toBe(true);
    });

    it('should clear all services', () => {
      const token1 = Symbol('Service1');
      const token2 = Symbol('Service2');

      container.register(token1, () => 'test1');
      container.register(token2, () => 'test2');

      expect(container.has(token1)).toBe(true);
      expect(container.has(token2)).toBe(true);

      container.clear();

      expect(container.has(token1)).toBe(false);
      expect(container.has(token2)).toBe(false);
    });

    it('should clear singleton instances on clear', () => {
      const token = Symbol('TestService');
      let callCount = 0;
      const factory = (): { id: number } => {
        callCount++;
        return { id: callCount };
      };

      container.register(token, factory, 'singleton');
      const instance1 = container.resolve<{ id: number }>(token);
      expect(instance1.id).toBe(1);

      container.clear();
      container.register(token, factory, 'singleton');
      const instance2 = container.resolve<{ id: number }>(token);

      expect(instance2.id).toBe(2);
      expect(callCount).toBe(2);
    });
  });
});
