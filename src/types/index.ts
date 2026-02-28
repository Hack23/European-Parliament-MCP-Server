/**
 * Type Definitions for European Parliament MCP Server
 * 
 * This module exports all custom type definitions used throughout the server,
 * including branded types for compile-time safety and custom error classes
 * for structured error handling.
 * 
 * **Intelligence Perspective:** Type-safe identifiers (MEPID, SessionID, CommitteeID) ensure
 * data integrity across intelligence analysis pipelines and prevent cross-contamination of
 * different entity types in analytical products.
 * 
 * **Business Perspective:** Branded types and structured errors provide enterprise-grade
 * reliability guarantees—essential for premium API tier customers and partner integrations.
 * 
 * **Marketing Perspective:** Advanced TypeScript patterns demonstrate technical excellence—
 * key for developer advocacy and attracting TypeScript-savvy contributors and customers.
 * 
 * **Branded Types:**
 * - Prevent mixing of different ID types at compile time
 * - Include type guards and factory functions for validation
 * - Ensure type safety for European Parliament data identifiers
 * 
 * **Error Classes:**
 * - Structured error handling with proper status codes
 * - GDPR-compliant error sanitization
 * - Type-safe error formatting for MCP responses
 * 
 * @module types
 * @see {@link branded} - Branded type definitions
 * @see {@link errors} - Custom error classes
 */

/** Branded type definitions for compile-time type safety of EP entity identifiers */
export type {
  Brand,
  MEPID,
  SessionID,
  CommitteeID,
  DocumentID,
  GroupID
} from './branded.js';

/** Type guard and factory functions for branded EP entity identifiers */
export {
  isMEPID,
  isSessionID,
  isCommitteeID,
  isDocumentID,
  isGroupID,
  createMEPID,
  createSessionID,
  createCommitteeID,
  createDocumentID,
  createGroupID
} from './branded.js';

/** EP API-specific branded types (ProcedureID, SpeechID, VocabularyID, SittingID) */
export type { ProcedureID, SpeechID, VocabularyID, SittingID } from './ep/branded.js';
export {
  isProcedureID,
  isSpeechID,
  isVocabularyID,
  isSittingID,
  createProcedureID,
  createSpeechID,
  createVocabularyID,
  createSittingID,
} from './ep/branded.js';

/** Structured error classes for MCP-compliant error responses with GDPR-safe sanitization */
export {
  MCPServerError,
  ValidationError,
  RateLimitError,
  EPAPIError,
  GDPRComplianceError,
  isMCPServerError,
  formatMCPError
} from './errors.js';

/**
 * Data availability status for intelligence analysis metrics.
 *
 * - `AVAILABLE`   — Full data retrieved from EP API; metric is reliable.
 * - `PARTIAL`     — Some data retrieved; metric may be incomplete.
 * - `ESTIMATED`   — Metric derived from proxy/indirect data sources.
 * - `UNAVAILABLE` — Required data not provided by the EP API endpoint;
 *                   the associated metric value is `null`.
 */
export type DataAvailability = 'AVAILABLE' | 'PARTIAL' | 'ESTIMATED' | 'UNAVAILABLE';

/**
 * Wrapper for a single analysis metric that explicitly communicates
 * data availability alongside the computed value.
 *
 * When `availability` is `'UNAVAILABLE'`, `value` is always `null` and
 * `confidence` should typically be `'LOW'` or `'NONE'` to signal that no
 * meaningful confidence can be assigned. The exact value depends on whether
 * the containing tool's OSINT output schema supports `'NONE'`.
 *
 * @template T - The type of the metric value (defaults to `number`).
 */
export interface MetricResult<T = number> {
  /** Computed metric value, or `null` when unavailable. */
  value: T | null;
  /** Availability status of the underlying EP API data. */
  availability: DataAvailability;
  /** Confidence in the computed value given the available data. */
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  /** Human-readable data source description (optional). */
  source?: string;
  /** Explanation of why the data is unavailable or estimated (optional). */
  reason?: string;
}
