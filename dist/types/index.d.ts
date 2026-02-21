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
export type { Brand, MEPID, SessionID, CommitteeID, DocumentID, GroupID } from './branded.js';
export { isMEPID, isSessionID, isCommitteeID, isDocumentID, isGroupID, createMEPID, createSessionID, createCommitteeID, createDocumentID, createGroupID } from './branded.js';
export { MCPServerError, ValidationError, RateLimitError, EPAPIError, GDPRComplianceError, isMCPServerError, formatMCPError } from './errors.js';
//# sourceMappingURL=index.d.ts.map