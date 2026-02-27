/**
 * Dependency Injection Container
 * 
 * Provides type-safe service registration and resolution with support for
 * singleton and transient lifetimes.
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

// Re-export tokens so callers only need one import
export { TOKENS } from './tokens.js';
export type { DIToken } from './tokens.js';

import { TOKENS } from './tokens.js';
import type { RateLimiter } from '../utils/rateLimiter.js';
import { createStandardRateLimiter } from '../utils/rateLimiter.js';
import { MetricsService } from '../services/MetricsService.js';
import { auditLogger } from '../utils/auditLogger.js';
import { HealthService } from '../services/HealthService.js';

/**
 * Service lifetime options
 */
type ServiceLifetime = 'singleton' | 'transient';

/**
 * Service factory function type
 */
type ServiceFactory<T> = (container: DIContainer) => T;

/**
 * Service descriptor
 */
interface ServiceDescriptor<T> {
  factory: ServiceFactory<T>;
  lifetime: ServiceLifetime;
  instance?: T;
}

/**
 * Dependency Injection Container
 * Cyclomatic complexity: 5
 */
export class DIContainer {
  private readonly services = new Map<symbol, ServiceDescriptor<unknown>>();

  /**
   * Register a service with the container
   * Cyclomatic complexity: 1
   * 
   * @param token - Service identifier token
   * @param factory - Factory function to create service instances
   * @param lifetime - Service lifetime ('singleton' or 'transient')
   *
   * @example
   * ```typescript
   * const ReportServiceToken = Symbol('ReportService');
   * container.register(
   *   ReportServiceToken,
   *   (c) => new ReportService(c.resolve(EPClientToken)),
   *   'singleton'
   * );
   * ```
   *
   * @since 0.8.0
   */
  register<T>(
    token: symbol,
    factory: ServiceFactory<T>,
    lifetime: ServiceLifetime = 'singleton'
  ): void {
    this.services.set(token, { factory, lifetime });
  }

  /**
   * Resolve a service from the container
   * Cyclomatic complexity: 4
   * 
   * @param token - Service identifier token
   * @returns Resolved service instance
   * @throws {Error} If service is not registered
   *
   * @example
   * ```typescript
   * const reportService = container.resolve(ReportServiceToken);
   * ```
   *
   * @since 0.8.0
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  resolve<T>(token: symbol): T {
    const descriptor = this.services.get(token) as ServiceDescriptor<T> | undefined;

    if (descriptor === undefined) {
      throw new Error(`Service not registered: ${String(token)}`);
    }

    // Return singleton instance if already created
    if (descriptor.lifetime === 'singleton' && descriptor.instance !== undefined) {
      return descriptor.instance;
    }

    // Create new instance
    const instance = descriptor.factory(this);

    // Cache singleton instances
    if (descriptor.lifetime === 'singleton') {
      descriptor.instance = instance;
    }

    return instance;
  }

  /**
   * Check if a service is registered
   * Cyclomatic complexity: 1
   * 
   * @param token - Service identifier token
   * @returns `true` if the token is registered, `false` otherwise
   *
   * @since 0.8.0
   */
  has(token: symbol): boolean {
    return this.services.has(token);
  }

  /**
   * Clear all registered services and cached instances.
   *
   * Useful for testing and cleanup between test suites.
   *
   * @example
   * ```typescript
   * afterEach(() => {
   *   container.clear();
   * });
   * ```
   *
   * @since 0.8.0
   */
  clear(): void {
    this.services.clear();
  }
}

/**
 * Create a pre-configured DI container with the standard MCP server services
 * registered as singletons.
 *
 * Registered services:
 * - `TOKENS.RateLimiter`   → {@link RateLimiter} (standard EP API configuration)
 * - `TOKENS.MetricsService` → {@link MetricsService}
 * - `TOKENS.AuditLogger`   → {@link AuditLogger} (global singleton)
 * - `TOKENS.HealthService` → {@link HealthService}
 *
 * @returns A fully configured {@link DIContainer} with all standard services registered
 *
 * @example
 * ```typescript
 * const container = createDefaultContainer();
 * const health = container.resolve<HealthService>(TOKENS.HealthService);
 * console.log(health.checkHealth());
 * ```
 *
 * @since 0.8.0
 */
export function createDefaultContainer(): DIContainer {
  const container = new DIContainer();

  container.register(TOKENS.RateLimiter, () => createStandardRateLimiter());
  container.register(TOKENS.MetricsService, () => new MetricsService());
  container.register(TOKENS.AuditLogger, () => auditLogger);
  container.register(TOKENS.HealthService, (c) =>
    new HealthService(
      c.resolve<RateLimiter>(TOKENS.RateLimiter),
      c.resolve<MetricsService>(TOKENS.MetricsService)
    )
  );

  return container;
}
