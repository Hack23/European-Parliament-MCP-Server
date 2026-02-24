/**
 * European Parliament domain type definitions.
 *
 * Barrel re-export organized by bounded context:
 * - **mep** – MEP, MEPDetails, VotingStatistics
 * - **plenary** – PlenarySession, VotingRecord
 * - **committee** – Committee
 * - **document** – LegislativeDocument, DocumentType, DocumentStatus
 * - **question** – ParliamentaryQuestion
 * - **common** – PaginatedResponse
 * - **activities** – Speech, Procedure, AdoptedText, EPEvent, MeetingActivity, MEPDeclaration
 *
 * @module types/ep
 */

export type { MEP, MEPDetails, VotingStatistics } from './mep.js';
export type { PlenarySession, VotingRecord } from './plenary.js';
export type { Committee } from './committee.js';
export type { LegislativeDocument, DocumentType, DocumentStatus } from './document.js';
export type { ParliamentaryQuestion } from './question.js';
export type { PaginatedResponse } from './common.js';
export type {
  Speech,
  Procedure,
  AdoptedText,
  EPEvent,
  MeetingActivity,
  MEPDeclaration,
} from './activities.js';
