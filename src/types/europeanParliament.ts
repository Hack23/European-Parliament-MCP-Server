/**
 * Type definitions for European Parliament data structures.
 *
 * Barrel re-export from domain-specific modules organized by bounded context.
 * Each sub-module contains well-documented, strictly-typed interfaces for
 * a single EP data domain.
 *
 * **Sub-modules:**
 * - {@link module:types/ep/mep} – MEP profiles and voting statistics
 * - {@link module:types/ep/plenary} – Plenary sessions and voting records
 * - {@link module:types/ep/committee} – Committee information
 * - {@link module:types/ep/document} – Legislative documents, types, and statuses
 * - {@link module:types/ep/question} – Parliamentary questions
 * - {@link module:types/ep/common} – Shared pagination types
 * - {@link module:types/ep/activities} – Speeches, procedures, events, declarations
 *
 * @module europeanParliament
 * @see https://data.europarl.europa.eu/api/v2/
 */

export type { MEP, MEPDetails, VotingStatistics } from './ep/mep.js';
export type { PlenarySession, VotingRecord } from './ep/plenary.js';
export type { Committee } from './ep/committee.js';
export type { LegislativeDocument, DocumentType, DocumentStatus } from './ep/document.js';
export type { ParliamentaryQuestion } from './ep/question.js';
export type { PaginatedResponse } from './ep/common.js';
export type {
  Speech,
  Procedure,
  AdoptedText,
  EPEvent,
  MeetingActivity,
  MEPDeclaration,
} from './ep/activities.js';
