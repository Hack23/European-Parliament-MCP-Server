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
export type { Brand, MEPID, SessionID, CommitteeID, DocumentID, GroupID } from './branded.js';
export { isMEPID, isSessionID, isCommitteeID, isDocumentID, isGroupID, createMEPID, createSessionID, createCommitteeID, createDocumentID, createGroupID } from './branded.js';
export { MCPServerError, ValidationError, RateLimitError, EPAPIError, GDPRComplianceError, isMCPServerError, formatMCPError } from './errors.js';
export type { MEP, MEPDetails, PlenarySession, VotingRecord, Committee, LegislativeDocument, ParliamentaryQuestion, PaginatedResponse, MEPId, SessionId, DocumentId, CommitteeId, VotingRecordId, QuestionId, PoliticalGroup, CommitteeMembership, SessionType, SessionStatus, VoteResult, IndividualVote, VoteType, DocumentType, DocumentStatus, RelatedDocument, Rapporteur, CommitteeType, QuestionType, QuestionStatus, QuestionAddressee, ReportType } from '../schemas/europeanParliament.js';
export { safeValidate, formatValidationErrors, EU_MEMBER_STATES, EU_LANGUAGES, EP_PARTY_GROUPS } from '../schemas/europeanParliament.js';
//# sourceMappingURL=index.d.ts.map