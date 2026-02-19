/**
 * Type Definitions for European Parliament MCP Server
 * 
 * This module exports all custom type definitions used throughout the server,
 * including branded types for compile-time safety and custom error classes
 * for structured error handling.
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

// Export branded types
export type {
  Brand,
  MEPID,
  SessionID,
  CommitteeID,
  DocumentID,
  GroupID
} from './branded.js';

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

// Export error classes
export {
  MCPServerError,
  ValidationError,
  RateLimitError,
  EPAPIError,
  GDPRComplianceError,
  isMCPServerError,
  formatMCPError
} from './errors.js';

// Export European Parliament types
// Note: Using explicit exports to maintain controlled public API surface.
// Only types and utilities intended for external consumption are exported here.
export type {
  MEP,
  MEPDetails,
  PlenarySession,
  VotingRecord,
  Committee,
  LegislativeDocument,
  ParliamentaryQuestion,
  PaginatedResponse,
  // Branded ID types
  MEPId,
  SessionId,
  DocumentId,
  CommitteeId,
  VotingRecordId,
  QuestionId,
  // Schema helper types
  PoliticalGroup,
  CommitteeMembership,
  SessionType,
  SessionStatus,
  VoteResult,
  IndividualVote,
  VoteType,
  DocumentType,
  DocumentStatus,
  RelatedDocument,
  Rapporteur,
  CommitteeType,
  QuestionType,
  QuestionStatus,
  QuestionAddressee,
  ReportType
} from './europeanParliament.js';

// Export validation helpers and reference data
export {
  safeValidate,
  formatValidationErrors,
  EU_MEMBER_STATES,
  EU_LANGUAGES,
  EP_PARTY_GROUPS
} from './europeanParliament.js';
