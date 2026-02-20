/**
 * Type definitions for European Parliament data structures
 *
 * These types are now automatically inferred from Zod schemas.
 * Import from schemas for the most up-to-date types.
 *
 * ISMS Policy: SC-002 (Secure Coding Standards)
 *
 * @deprecated Import types directly from schemas/europeanParliament.ts instead
 * @see src/schemas/europeanParliament.ts
 */
export type { MEP, MEPDetails, PlenarySession, VotingRecord, Committee, LegislativeDocument, ParliamentaryQuestion, PaginatedResponse, MEPId, SessionId, DocumentId, CommitteeId, VotingRecordId, QuestionId, PoliticalGroup, CommitteeMembership, SessionType, SessionStatus, VoteResult, IndividualVote, VoteType, DocumentType, DocumentStatus, RelatedDocument, Rapporteur, CommitteeType, QuestionType, QuestionStatus, QuestionAddressee, ReportType } from '../schemas/europeanParliament.js';
export type { MEP as MemberOfEuropeanParliament } from '../schemas/europeanParliament.js';
export type { LegislativeDocument as Document } from '../schemas/europeanParliament.js';
export { safeValidate, formatValidationErrors } from '../schemas/europeanParliament.js';
export { EU_MEMBER_STATES, EU_LANGUAGES, EP_PARTY_GROUPS } from '../schemas/europeanParliament.js';
//# sourceMappingURL=europeanParliament.d.ts.map