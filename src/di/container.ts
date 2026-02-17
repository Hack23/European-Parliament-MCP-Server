/**
 * Dependency Injection Container
 * 
 * Provides type-safe service registration and resolution with support for
 * singleton and transient lifetimes.
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

/**
 * Service lifetime options
 */
export type ServiceLifetime = 'singleton' | 'transient';

/**
 * Service factory function type
 */
export type ServiceFactory<T> = (container: DIContainer) => T;

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
   * @throws Error if service is not registered
   * 
   * @example
   * ```typescript
   * const reportService = container.resolve(ReportServiceToken);
   * ```
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
   * @returns True if service is registered
   */
  has(token: symbol): boolean {
    return this.services.has(token);
  }

  /**
   * Clear all registered services and cached instances
   * Cyclomatic complexity: 1
   * 
   * Useful for testing and cleanup
   */
  clear(): void {
    this.services.clear();
  }
}

/**
 * Global DI container instance
 */
export const container = new DIContainer();
