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
 * Procedure ID – identifies a legislative procedure by its EP API **process-id**.
 *
 * This is the URL path segment used by `/procedures/{process-id}` endpoints.
 * Format: `"YYYY-NNNN"` (e.g. `"2024-0006"`)
 *
 * **Note:** This is distinct from the human-readable procedure reference used in
 * `Procedure.id` (`"COD/2023/0123"`) and `Procedure.reference` (`"2023/0123(COD)"`).
 * Use the process-id format when calling `getProcedureById` / `getProcedureEvents`.
 *
 * @example
 * ```typescript
 * const procId: ProcedureID = '2024-0006' as ProcedureID;
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
 * Type guard: checks that a string looks like an EP procedure ID.
 *
 * Expected format: `"YYYY-NNNN"` (e.g. `"2024-0006"`).
 *
 * @param value - String to validate
 */
export function isProcedureID(value: string): value is ProcedureID {
  return /^\d{4}-\d{4}$/.test(value);
}

/**
 * Type guard: checks that a string looks like an EP speech ID.
 *
 * Expected format: `"SPEECH-{term}-YYYY-MM-DD-NNN"` (e.g. `"SPEECH-9-2024-01-15-001"`).
 *
 * @param value - String to validate
 */
export function isSpeechID(value: string): value is SpeechID {
  return /^SPEECH-\d+-\d{4}-\d{2}-\d{2}-\d+$/.test(value);
}

/**
 * Type guard: checks that a string looks like an EP vocabulary ID.
 *
 * Must be at least 3 characters, contain at least one alphanumeric character,
 * and consist only of letters, digits, hyphens, and underscores.
 *
 * Example: `"eurovoc"`.
 *
 * @param value - String to validate
 */
export function isVocabularyID(value: string): value is VocabularyID {
  return /^(?=.*[A-Za-z0-9])[A-Za-z0-9_-]{3,}$/.test(value);
}

/**
 * Type guard: checks that a string looks like an EP sitting ID.
 *
 * @param value - String to validate
 */
export function isSittingID(value: string): value is SittingID {
  return /^MTG-PL-\d{4}-\d{2}-\d{2}$/.test(value);
}

// ─── Factory functions ─────────────────────────────────────────────────────────

/**
 * Factory: validates and creates a ProcedureID.
 *
 * @throws {Error} If the value does not match the expected ProcedureID format.
 */
export function createProcedureID(value: string): ProcedureID {
  if (!isProcedureID(value)) {
    throw new Error(`Invalid ProcedureID: ${value}`);
  }
  return value;
}

/**
 * Factory: validates and creates a SpeechID.
 *
 * @throws {Error} If the value does not match the expected SpeechID format.
 */
export function createSpeechID(value: string): SpeechID {
  if (!isSpeechID(value)) {
    throw new Error(`Invalid SpeechID: ${value}`);
  }
  return value;
}

/**
 * Factory: validates and creates a VocabularyID.
 *
 * @throws {Error} If the value does not match the expected VocabularyID format.
 */
export function createVocabularyID(value: string): VocabularyID {
  if (!isVocabularyID(value)) {
    throw new Error(`Invalid VocabularyID: ${value}`);
  }
  return value;
}

/**
 * Factory: validates and creates a SittingID.
 *
 * @throws {Error} If the value does not match the expected SittingID format.
 */
export function createSittingID(value: string): SittingID {
  if (!isSittingID(value)) {
    throw new Error(`Invalid SittingID: ${value}`);
  }
  return value;
}
