/**
 * Service tokens for dependency injection
 * 
 * ISMS Policy: SC-002 (Input Validation)
 */

/**
 * European Parliament Client service token
 */
export const EPClientToken = Symbol('EuropeanParliamentClient');

/**
 * Report Service token
 */
export const ReportServiceToken = Symbol('ReportService');

/**
 * Legislation Service token
 */
export const LegislationServiceToken = Symbol('LegislationService');

/**
 * Analytics Service token
 */
export const AnalyticsServiceToken = Symbol('AnalyticsService');

/**
 * Metrics Service token
 */
export const MetricsServiceToken = Symbol('MetricsService');
