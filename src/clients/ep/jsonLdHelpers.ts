/**
 * JSON-LD parsing helpers for European Parliament API data.
 *
 * Pure utility functions for extracting and converting values from
 * EP API JSON-LD responses. Used by transform functions and the
 * EP client to safely handle heterogeneous API field formats.
 *
 * @module clients/ep/jsonLdHelpers
 */

import type { DocumentType, DocumentStatus } from '../../types/europeanParliament.js';

// ─── Primitive helpers ──────────────────────────────────────────

/**
 * Safely converts an unknown value to a string.
 *
 * @param value - Value to convert
 * @returns String representation or empty string for unsupported types
 */
export function toSafeString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return String(value);
  return '';
}

/**
 * Returns the first non-undefined value from a record, looked up by key list.
 *
 * @param data - Record to search
 * @param keys - Field names to try in order
 * @returns First non-undefined value, or `undefined` if none found
 */
export function firstDefined(data: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    if (data[k] !== undefined) return data[k];
  }
  return undefined;
}

// ─── Field extraction ───────────────────────────────────────────

/**
 * Extracts a string value from the first matching field name.
 *
 * @param data - Record to search
 * @param fields - Field names to try in order
 * @returns String value from first matching field, or empty string
 */
export function extractField(data: Record<string, unknown>, fields: string[]): string {
  for (const field of fields) {
    const value = data[field];
    if (value !== undefined && value !== null) {
      return toSafeString(value);
    }
  }
  return '';
}

// ─── Date handling ──────────────────────────────────────────────

/**
 * Extracts an ISO 8601 date string from various EP API date formats.
 *
 * @param dateField - Raw date field from EP API
 * @returns `YYYY-MM-DD` string, or empty string if not parseable
 */
export function extractDateValue(dateField: unknown): string {
  if (dateField === null || dateField === undefined) return '';
  if (typeof dateField === 'string') {
    const parts = dateField.split('T');
    return parts[0] ?? '';
  }
  if (typeof dateField === 'object' && '@value' in dateField) {
    const val = (dateField as Record<string, unknown>)['@value'];
    if (typeof val === 'string') {
      const parts = val.split('T');
      return parts[0] ?? '';
    }
  }
  return '';
}

/**
 * Extracts a date from activity-specific EP API date formats.
 *
 * @param activityDate - Raw activity_date field from EP API
 * @returns `YYYY-MM-DD` string, or empty string
 */
export function extractActivityDate(activityDate: unknown): string {
  if (activityDate === null || activityDate === undefined) return '';
  if (typeof activityDate === 'object' && '@value' in activityDate) {
    const dateValue = (activityDate as Record<string, unknown>)['@value'];
    if (typeof dateValue === 'string') {
      const parts = dateValue.split('T');
      return parts[0] ?? '';
    }
  }
  return '';
}

// ─── Multilingual text ──────────────────────────────────────────

/**
 * Extracts preferred-language text from an array of language-tagged objects.
 * Prefers English (`en`) or multilingual (`mul`).
 *
 * @param items - Array of JSON-LD language-tagged objects
 * @returns Text in preferred language, or first available
 */
export function extractTextFromLangArray(items: unknown[]): string {
  let fallback = '';
  for (const item of items) {
    if (typeof item !== 'object' || item === null) continue;
    const obj = item as Record<string, unknown>;
    const lang = toSafeString(obj['@language']);
    const value = toSafeString(obj['@value']);
    if (lang === 'en' || lang === 'mul') return value;
    if (fallback === '') fallback = value;
  }
  return fallback;
}

/**
 * Extracts a multilingual text value from an EP API JSON-LD field.
 *
 * Handles plain strings, language-tagged objects, and arrays of language variants.
 *
 * @param field - Raw field from EP API
 * @returns Extracted text string, or empty string
 */
export function extractMultilingualText(field: unknown): string {
  if (field === null || field === undefined) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'number' || typeof field === 'boolean') return String(field);
  if (Array.isArray(field)) return extractTextFromLangArray(field);
  if (typeof field === 'object') {
    const obj = field as Record<string, unknown>;
    return toSafeString(obj['en'] ?? obj['@value'] ?? obj['mul']);
  }
  return '';
}

// ─── Member / Author extraction ─────────────────────────────────

/**
 * Extracts member IDs from EP API membership data.
 *
 * @param memberships - Raw membership field from EP API
 * @returns Array of member ID strings
 */
export function extractMemberIds(memberships: unknown): string[] {
  const members: string[] = [];
  if (!Array.isArray(memberships)) return members;
  for (const m of memberships) {
    if (typeof m === 'string') {
      members.push(m);
    } else if (typeof m === 'object' && m !== null) {
      const mObj = m as Record<string, unknown>;
      const memberId = toSafeString(mObj['person'] ?? mObj['id'] ?? mObj['@id']);
      if (memberId !== '') members.push(memberId);
    }
  }
  return members;
}

/**
 * Extracts author ID from EP API author field.
 *
 * @param authorField - Raw author/attributed-to field
 * @returns Author ID string or empty string
 */
export function extractAuthorId(authorField: unknown): string {
  if (typeof authorField === 'string') return authorField;
  if (Array.isArray(authorField) && authorField.length > 0) {
    return toSafeString(authorField[0]);
  }
  if (typeof authorField === 'object' && authorField !== null) {
    const obj = authorField as Record<string, unknown>;
    return toSafeString(obj['@id'] ?? obj['id']);
  }
  return '';
}

/**
 * Extracts document reference strings from EP API document fields.
 *
 * @param docs - Raw document reference field
 * @returns Array of document reference strings
 */
export function extractDocumentRefs(docs: unknown): string[] {
  if (docs === null || docs === undefined) return [];
  if (typeof docs === 'string') return [docs];
  if (Array.isArray(docs)) {
    return docs.map(d => {
      if (typeof d === 'string') return d;
      if (typeof d === 'object' && d !== null) {
        const obj = d as Record<string, unknown>;
        return toSafeString(obj['id'] ?? obj['identifier'] ?? '');
      }
      return '';
    }).filter(s => s !== '');
  }
  return [];
}

// ─── Document type / status mapping ─────────────────────────────

/**
 * Maps a raw work-type string to a valid DocumentType.
 *
 * @param rawType - Raw type string from EP API
 * @returns Valid DocumentType
 */
export function mapDocumentType(rawType: string): DocumentType {
  const normalized = (rawType !== '' ? rawType : 'REPORT').replace(/.*\//, '').toUpperCase();
  const validTypes: DocumentType[] = ['REPORT', 'RESOLUTION', 'DECISION', 'DIRECTIVE', 'REGULATION', 'OPINION', 'AMENDMENT'];
  return validTypes.find(t => normalized.includes(t)) ?? 'REPORT';
}

/**
 * Maps a raw status string to a valid DocumentStatus.
 *
 * @param rawStatus - Raw status string from EP API
 * @returns Valid DocumentStatus
 */
export function mapDocumentStatus(rawStatus: string): DocumentStatus {
  const validStatuses: DocumentStatus[] = ['DRAFT', 'SUBMITTED', 'IN_COMMITTEE', 'PLENARY', 'ADOPTED', 'REJECTED'];
  return validStatuses.find(s => rawStatus.toUpperCase().includes(s)) ?? 'SUBMITTED';
}

// ─── Location extraction ────────────────────────────────────────

/**
 * Extracts location string from EP API locality URL.
 *
 * @param localityUrl - Raw locality URL or string
 * @returns Human-readable location string
 */
export function extractLocation(localityUrl: string): string {
  if (localityUrl.includes('FRA_SXB')) return 'Strasbourg';
  if (localityUrl.includes('BEL_BRU')) return 'Brussels';
  return 'Unknown';
}

// ─── Vote helpers ───────────────────────────────────────────────

/**
 * Extracts a numeric vote count from an EP API value.
 *
 * @param value - Raw vote count value
 * @returns Parsed integer count, or 0
 */
export function extractVoteCount(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  if (Array.isArray(value)) return value.length;
  const objValue = (value as Record<string, unknown>)['@value'];
  if (objValue !== undefined) {
    return extractVoteCount(objValue);
  }
  return 0;
}

/**
 * Determines vote outcome from EP API decision string.
 *
 * @param decisionStr - Raw decision string from EP API
 * @param votesFor - Number of votes for
 * @param votesAgainst - Number of votes against
 * @returns `'ADOPTED'` or `'REJECTED'`
 */
export function determineVoteOutcome(
  decisionStr: string,
  votesFor: number,
  votesAgainst: number
): 'ADOPTED' | 'REJECTED' {
  if (decisionStr.includes('ADOPTED') || decisionStr.includes('APPROVED')) return 'ADOPTED';
  if (decisionStr.includes('REJECTED')) return 'REJECTED';
  return votesFor >= votesAgainst ? 'ADOPTED' : 'REJECTED';
}

/**
 * Maps raw question type string to normalized question type.
 *
 * @param workType - Raw work type string from EP API
 * @returns `'WRITTEN'` or `'ORAL'`
 */
export function mapQuestionType(workType: string): 'WRITTEN' | 'ORAL' {
  if (workType.includes('ORAL') || workType.includes('INTERPELLATION') || workType.includes('QUESTION_TIME')) {
    return 'ORAL';
  }
  return 'WRITTEN';
}
