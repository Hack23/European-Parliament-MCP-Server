/**
 * Typed Dependency Injection tokens.
 *
 * Each token is a unique Symbol used to register and resolve a service
 * from the {@link DIContainer}.  Centralising them here avoids "magic"
 * inline Symbol literals and guarantees consistent identifiers across
 * the whole application.
 *
 * ISMS Policy: AC-003 (Least Privilege), SC-002 (Input Validation)
 *
 * @module di/tokens
 *
 * @example
 * ```typescript
 * import { TOKENS } from './tokens.js';
 * import { container } from './container.js';
 *
 * const metricsService = container.resolve<MetricsService>(TOKENS.MetricsService);
 * ```
 */

/**
 * Centralised DI token registry.
 *
 * `as const` makes the registry object itself readonly and ensures each
 * property value is inferred as `symbol` (not widened to `object`).
 * For type-level uniqueness, each `Symbol(...)` is a distinct runtime value;
 * `DIToken` is the union of all token values for generic container utilities.
 *
 * @since 0.8.0
 */
export const TOKENS = {
  /**
   * European Parliament API client
   * (`EuropeanParliamentClient` from `clients/europeanParliamentClient`)
   */
  EPClient: Symbol('EPClient'),

  /**
   * Performance metrics collection service
   * (`MetricsService` from `services/MetricsService`)
   */
  MetricsService: Symbol('MetricsService'),

  /**
   * GDPR-compliant audit logger
   * (`AuditLogger` from `utils/auditLogger`)
   */
  AuditLogger: Symbol('AuditLogger'),

  /**
   * Token-bucket rate limiter for EP API calls
   * (`RateLimiter` from `utils/rateLimiter`)
   */
  RateLimiter: Symbol('RateLimiter'),

  /**
   * Server health-check service
   * (`HealthService` from `services/HealthService`)
   */
  HealthService: Symbol('HealthService'),
} as const;

/**
 * Union type of all registered DI token values.
 * Useful for writing type-safe generic container utilities.
 *
 * @since 0.8.0
 */
export type DIToken = (typeof TOKENS)[keyof typeof TOKENS];
