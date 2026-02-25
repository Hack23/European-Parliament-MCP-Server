/**
 * @fileoverview EP-domain branded types for European Parliament MCP Server
 *
 * Extends the root branded types with additional EP API-specific identifiers.
 * These ensure compile-time safety when passing IDs between sub-clients and
 * tool layers.
 *
 * @module types/ep/branded
 * @see {@link module:types/branded} for root brand utilities
 */

export type {
  Brand,
  MEPID,
  SessionID,
  CommitteeID,
  DocumentID,
  GroupID,
} from '../branded.js';

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
  createGroupID,
} from '../branded.js';

import type { Brand } from '../branded.js';

// ─── Additional EP-specific branded types ─────────────────────────────────────

/**
 * Procedure ID – identifies a legislative procedure.
 *
 * Format: `"YYYY/NNNN(type)"` (e.g. `"2024/0006(COD)"`)
 *
 * @example
 * ```typescript
 * const procId: ProcedureID = '2024/0006(COD)' as ProcedureID;
 * ```
 */
export type ProcedureID = Brand<string, 'ProcedureID'>;

/**
 * Speech ID – identifies a plenary speech record.
 *
 * Format: alphanumeric string issued by the EP API.
 *
 * @example
 * ```typescript
 * const speechId: SpeechID = 'SPEECH-9-2024-01-15-001' as SpeechID;
 * ```
 */
export type SpeechID = Brand<string, 'SpeechID'>;

/**
 * Vocabulary ID – identifies a controlled-vocabulary entry.
 *
 * @example
 * ```typescript
 * const vocId: VocabularyID = 'eurovoc' as VocabularyID;
 * ```
 */
export type VocabularyID = Brand<string, 'VocabularyID'>;

/**
 * Meeting/Sitting ID – identifies a plenary sitting.
 *
 * Format: `"MTG-PL-YYYY-MM-DD"` (e.g. `"MTG-PL-2024-01-15"`)
 *
 * @example
 * ```typescript
 * const sittingId: SittingID = 'MTG-PL-2024-01-15' as SittingID;
 * ```
 */
export type SittingID = Brand<string, 'SittingID'>;

// ─── Type guards ───────────────────────────────────────────────────────────────

/**
 * Type guard: checks that a string looks like an EP sitting ID.
 *
 * @param value - String to validate
 */
export function isSittingID(value: string): value is SittingID {
  return /^MTG-PL-\d{4}-\d{2}-\d{2}/.test(value);
}
