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
type ServiceLifetime = 'singleton' | 'transient';
/**
 * Service factory function type
 */
type ServiceFactory<T> = (container: DIContainer) => T;
/**
 * Dependency Injection Container
 * Cyclomatic complexity: 5
 */
export declare class DIContainer {
    private readonly services;
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
    register<T>(token: symbol, factory: ServiceFactory<T>, lifetime?: ServiceLifetime): void;
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
    resolve<T>(token: symbol): T;
    /**
     * Check if a service is registered
     * Cyclomatic complexity: 1
     *
     * @param token - Service identifier token
     * @returns True if service is registered
     */
    has(token: symbol): boolean;
    /**
     * Clear all registered services and cached instances
     * Cyclomatic complexity: 1
     *
     * Useful for testing and cleanup
     */
    clear(): void;
}
export {};
//# sourceMappingURL=container.d.ts.map