/**
 * Unit tests for JSON-LD parsing helpers.
 *
 * Covers all exported functions in jsonLdHelpers.ts with edge cases,
 * null/undefined inputs, and type coercion scenarios.
 */

import { describe, it, expect } from 'vitest';
import {
  toSafeString,
  firstDefined,
  extractField,
  extractDateValue,
  extractActivityDate,
  extractTextFromLangArray,
  extractMultilingualText,
  extractMemberIds,
  extractAuthorId,
  extractDocumentRefs,
  mapDocumentType,
  mapDocumentStatus,
  extractLocation,
  extractVoteCount,
  determineVoteOutcome,
  mapQuestionType,
} from './jsonLdHelpers.js';

// ─── toSafeString ───────────────────────────────────────────────

describe('toSafeString', () => {
  it('returns string values as-is', () => {
    expect(toSafeString('hello')).toBe('hello');
    expect(toSafeString('')).toBe('');
  });

  it('converts numbers to string', () => {
    expect(toSafeString(42)).toBe('42');
    expect(toSafeString(0)).toBe('0');
    expect(toSafeString(-1.5)).toBe('-1.5');
  });

  it('converts booleans to string', () => {
    expect(toSafeString(true)).toBe('true');
    expect(toSafeString(false)).toBe('false');
  });

  it('returns empty string for null', () => {
    expect(toSafeString(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(toSafeString(undefined)).toBe('');
  });

  it('returns empty string for objects', () => {
    expect(toSafeString({})).toBe('');
    expect(toSafeString({ key: 'val' })).toBe('');
  });

  it('returns empty string for arrays', () => {
    expect(toSafeString([])).toBe('');
    expect(toSafeString([1, 2])).toBe('');
  });
});

// ─── firstDefined ───────────────────────────────────────────────

describe('firstDefined', () => {
  it('returns the first key that exists', () => {
    const data = { b: 'found', c: 'other' };
    expect(firstDefined(data, 'a', 'b', 'c')).toBe('found');
  });

  it('returns undefined when no key exists', () => {
    expect(firstDefined({ a: 1 }, 'x', 'y')).toBeUndefined();
  });

  it('returns value even when it is falsy (0, false, empty string)', () => {
    expect(firstDefined({ a: 0 }, 'a', 'b')).toBe(0);
    expect(firstDefined({ a: false }, 'a', 'b')).toBe(false);
    expect(firstDefined({ a: '' }, 'a', 'b')).toBe('');
  });

  it('skips keys with undefined values', () => {
    const data: Record<string, unknown> = { a: undefined, b: 'second' };
    expect(firstDefined(data, 'a', 'b')).toBe('second');
  });

  it('returns null when null is stored', () => {
    const data: Record<string, unknown> = { a: null };
    expect(firstDefined(data, 'a', 'b')).toBeNull();
  });

  it('works with a single key', () => {
    expect(firstDefined({ x: 'val' }, 'x')).toBe('val');
    expect(firstDefined({ x: 'val' }, 'y')).toBeUndefined();
  });
});

// ─── extractField ───────────────────────────────────────────────

describe('extractField', () => {
  it('returns string value from first matching field', () => {
    expect(extractField({ a: 'hello' }, ['a', 'b'])).toBe('hello');
  });

  it('falls through to second field when first is missing', () => {
    expect(extractField({ b: 'world' }, ['a', 'b'])).toBe('world');
  });

  it('returns empty string when no field matches', () => {
    expect(extractField({ c: 'x' }, ['a', 'b'])).toBe('');
  });

  it('converts numbers to string', () => {
    expect(extractField({ id: 42 }, ['id'])).toBe('42');
  });

  it('skips null and undefined values', () => {
    const data: Record<string, unknown> = { a: null, b: undefined, c: 'found' };
    expect(extractField(data, ['a', 'b', 'c'])).toBe('found');
  });

  it('returns empty string for empty fields list', () => {
    expect(extractField({ a: 'v' }, [])).toBe('');
  });
});

// ─── extractDateValue ───────────────────────────────────────────

describe('extractDateValue', () => {
  it('extracts date portion from ISO datetime string', () => {
    expect(extractDateValue('2024-01-15T14:30:00Z')).toBe('2024-01-15');
  });

  it('returns date-only string unchanged', () => {
    expect(extractDateValue('2024-06-01')).toBe('2024-06-01');
  });

  it('extracts date from JSON-LD @value object', () => {
    expect(extractDateValue({ '@value': '2024-03-20T00:00:00+01:00' })).toBe('2024-03-20');
  });

  it('returns empty string for null', () => {
    expect(extractDateValue(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(extractDateValue(undefined)).toBe('');
  });

  it('returns empty string for non-string non-object', () => {
    expect(extractDateValue(12345)).toBe('');
    expect(extractDateValue(true)).toBe('');
    expect(extractDateValue([])).toBe('');
  });

  it('returns empty string for @value object with non-string value', () => {
    expect(extractDateValue({ '@value': 99 })).toBe('');
  });

  it('handles plain date string without T separator', () => {
    expect(extractDateValue('2024-12-31')).toBe('2024-12-31');
  });
});

// ─── extractActivityDate ────────────────────────────────────────

describe('extractActivityDate', () => {
  it('extracts date from @value object', () => {
    const activityDate = { '@value': '2024-01-15T09:00:00+01:00' };
    expect(extractActivityDate(activityDate)).toBe('2024-01-15');
  });

  it('returns empty string for null', () => {
    expect(extractActivityDate(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(extractActivityDate(undefined)).toBe('');
  });

  it('returns empty string for plain string (not @value wrapped)', () => {
    expect(extractActivityDate('2024-01-15')).toBe('');
  });

  it('returns empty string when @value is not a string', () => {
    expect(extractActivityDate({ '@value': 123 })).toBe('');
  });

  it('returns empty string for object without @value', () => {
    expect(extractActivityDate({ value: '2024-01-15' })).toBe('');
  });

  it('returns empty string for non-object types', () => {
    expect(extractActivityDate(42)).toBe('');
    expect(extractActivityDate(true)).toBe('');
  });
});

// ─── extractTextFromLangArray ───────────────────────────────────

describe('extractTextFromLangArray', () => {
  it('prefers English language text', () => {
    const items = [
      { '@language': 'fr', '@value': 'Bonjour' },
      { '@language': 'en', '@value': 'Hello' },
      { '@language': 'de', '@value': 'Hallo' },
    ];
    expect(extractTextFromLangArray(items)).toBe('Hello');
  });

  it('prefers mul (multilingual) language text', () => {
    const items = [
      { '@language': 'fr', '@value': 'Bonjour' },
      { '@language': 'mul', '@value': 'Multilingual' },
    ];
    expect(extractTextFromLangArray(items)).toBe('Multilingual');
  });

  it('falls back to first available item', () => {
    const items = [
      { '@language': 'de', '@value': 'Hallo' },
      { '@language': 'fr', '@value': 'Bonjour' },
    ];
    expect(extractTextFromLangArray(items)).toBe('Hallo');
  });

  it('returns empty string for empty array', () => {
    expect(extractTextFromLangArray([])).toBe('');
  });

  it('skips non-object items', () => {
    const items = [null, undefined, 'string', 42, { '@language': 'en', '@value': 'Valid' }];
    expect(extractTextFromLangArray(items)).toBe('Valid');
  });

  it('returns empty string when all items lack @value', () => {
    // First item has no @value, so toSafeString returns '' and fallback stays ''
    expect(extractTextFromLangArray([{ '@language': 'de' }])).toBe('');
  });

  it('handles items with empty @value', () => {
    const items = [
      { '@language': 'de', '@value': '' },
      { '@language': 'en', '@value': 'English' },
    ];
    expect(extractTextFromLangArray(items)).toBe('English');
  });
});

// ─── extractMultilingualText ────────────────────────────────────

describe('extractMultilingualText', () => {
  it('returns string values as-is', () => {
    expect(extractMultilingualText('plain text')).toBe('plain text');
  });

  it('returns empty string for null', () => {
    expect(extractMultilingualText(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(extractMultilingualText(undefined)).toBe('');
  });

  it('converts numbers to string', () => {
    expect(extractMultilingualText(42)).toBe('42');
  });

  it('converts booleans to string', () => {
    expect(extractMultilingualText(true)).toBe('true');
  });

  it('extracts English from lang array', () => {
    const field = [
      { '@language': 'fr', '@value': 'Texte' },
      { '@language': 'en', '@value': 'Text' },
    ];
    expect(extractMultilingualText(field)).toBe('Text');
  });

  it('extracts en key from object', () => {
    expect(extractMultilingualText({ en: 'English text', fr: 'French text' })).toBe('English text');
  });

  it('extracts @value from object when no en key', () => {
    expect(extractMultilingualText({ '@value': 'value text' })).toBe('value text');
  });

  it('extracts mul key from object as fallback', () => {
    expect(extractMultilingualText({ mul: 'multilingual text', de: 'Deutsch' })).toBe('multilingual text');
  });

  it('returns empty string for empty array', () => {
    expect(extractMultilingualText([])).toBe('');
  });

  it('returns empty string for object with no recognized keys', () => {
    expect(extractMultilingualText({ xyz: 'unknown' })).toBe('');
  });
});

// ─── extractMemberIds ───────────────────────────────────────────

describe('extractMemberIds', () => {
  it('extracts string items directly', () => {
    expect(extractMemberIds(['person/1', 'person/2'])).toEqual(['person/1', 'person/2']);
  });

  it('extracts person field from objects', () => {
    const memberships = [{ person: 'person/10' }, { person: 'person/20' }];
    expect(extractMemberIds(memberships)).toEqual(['person/10', 'person/20']);
  });

  it('extracts id field from objects when person is missing', () => {
    const memberships = [{ id: 'member-1' }];
    expect(extractMemberIds(memberships)).toEqual(['member-1']);
  });

  it('extracts @id field from objects', () => {
    const memberships = [{ '@id': 'https://example.com/person/5' }];
    expect(extractMemberIds(memberships)).toEqual(['https://example.com/person/5']);
  });

  it('returns empty array for non-array input', () => {
    expect(extractMemberIds(null)).toEqual([]);
    expect(extractMemberIds(undefined)).toEqual([]);
    expect(extractMemberIds('string')).toEqual([]);
    expect(extractMemberIds(42)).toEqual([]);
  });

  it('returns empty array for empty array', () => {
    expect(extractMemberIds([])).toEqual([]);
  });

  it('skips objects with empty resolved id', () => {
    const memberships = [{ unrelated: 'field' }, { person: 'person/valid' }];
    expect(extractMemberIds(memberships)).toEqual(['person/valid']);
  });

  it('handles mixed string and object entries', () => {
    const memberships = ['person/1', { person: 'person/2' }, { id: 'person/3' }];
    expect(extractMemberIds(memberships)).toEqual(['person/1', 'person/2', 'person/3']);
  });
});

// ─── extractAuthorId ────────────────────────────────────────────

describe('extractAuthorId', () => {
  it('returns string value as-is', () => {
    expect(extractAuthorId('person/123')).toBe('person/123');
  });

  it('returns first element of array', () => {
    expect(extractAuthorId(['person/1', 'person/2'])).toBe('person/1');
  });

  it('returns empty string for empty array', () => {
    expect(extractAuthorId([])).toBe('');
  });

  it('extracts @id from object', () => {
    expect(extractAuthorId({ '@id': 'person/42' })).toBe('person/42');
  });

  it('extracts id from object when no @id', () => {
    expect(extractAuthorId({ id: 'person/99' })).toBe('person/99');
  });

  it('returns empty string for null', () => {
    expect(extractAuthorId(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(extractAuthorId(undefined)).toBe('');
  });

  it('returns empty string for number', () => {
    expect(extractAuthorId(42)).toBe('');
  });

  it('returns empty string for empty object', () => {
    expect(extractAuthorId({})).toBe('');
  });
});

// ─── extractDocumentRefs ────────────────────────────────────────

describe('extractDocumentRefs', () => {
  it('wraps a single string in an array', () => {
    expect(extractDocumentRefs('doc-ref-1')).toEqual(['doc-ref-1']);
  });

  it('returns string items from array', () => {
    expect(extractDocumentRefs(['doc/1', 'doc/2'])).toEqual(['doc/1', 'doc/2']);
  });

  it('extracts id from object items', () => {
    expect(extractDocumentRefs([{ id: 'doc/3' }])).toEqual(['doc/3']);
  });

  it('extracts identifier from object items', () => {
    expect(extractDocumentRefs([{ identifier: 'A-9-2024-001' }])).toEqual(['A-9-2024-001']);
  });

  it('filters out empty strings from results', () => {
    expect(extractDocumentRefs([{ unrelated: 'x' }, { id: 'valid' }])).toEqual(['valid']);
  });

  it('returns empty array for null', () => {
    expect(extractDocumentRefs(null)).toEqual([]);
  });

  it('returns empty array for undefined', () => {
    expect(extractDocumentRefs(undefined)).toEqual([]);
  });

  it('returns empty array for empty array', () => {
    expect(extractDocumentRefs([])).toEqual([]);
  });

  it('handles mixed string and object arrays', () => {
    const docs = ['ref/1', { id: 'ref/2' }, { identifier: 'ref/3' }];
    expect(extractDocumentRefs(docs)).toEqual(['ref/1', 'ref/2', 'ref/3']);
  });
});

// ─── mapDocumentType ────────────────────────────────────────────

describe('mapDocumentType', () => {
  it('maps REPORT type', () => {
    expect(mapDocumentType('REPORT_PLENARY')).toBe('REPORT');
  });

  it('maps RESOLUTION type', () => {
    expect(mapDocumentType('RESOLUTION_MOTION')).toBe('RESOLUTION');
  });

  it('maps DECISION type', () => {
    expect(mapDocumentType('DECISION')).toBe('DECISION');
  });

  it('maps DIRECTIVE type', () => {
    expect(mapDocumentType('DIRECTIVE_PROPOSAL')).toBe('DIRECTIVE');
  });

  it('maps REGULATION type', () => {
    expect(mapDocumentType('REGULATION')).toBe('REGULATION');
  });

  it('maps OPINION type', () => {
    expect(mapDocumentType('OPINION')).toBe('OPINION');
  });

  it('maps AMENDMENT type', () => {
    expect(mapDocumentType('AMENDMENT_LIST')).toBe('AMENDMENT');
  });

  it('defaults to REPORT for unknown types', () => {
    expect(mapDocumentType('UNKNOWN_TYPE')).toBe('REPORT');
  });

  it('defaults to REPORT for empty string', () => {
    expect(mapDocumentType('')).toBe('REPORT');
  });

  it('strips URL prefix before matching', () => {
    expect(mapDocumentType('https://data.europarl.europa.eu/def/RESOLUTION')).toBe('RESOLUTION');
  });

  it('is case-insensitive via normalization to uppercase', () => {
    expect(mapDocumentType('report_plenary')).toBe('REPORT');
  });
});

// ─── mapDocumentStatus ──────────────────────────────────────────

describe('mapDocumentStatus', () => {
  it('maps DRAFT status', () => {
    expect(mapDocumentStatus('DRAFT')).toBe('DRAFT');
  });

  it('maps SUBMITTED status', () => {
    expect(mapDocumentStatus('SUBMITTED')).toBe('SUBMITTED');
  });

  it('maps IN_COMMITTEE status', () => {
    expect(mapDocumentStatus('IN_COMMITTEE')).toBe('IN_COMMITTEE');
  });

  it('maps PLENARY status', () => {
    expect(mapDocumentStatus('PLENARY_STAGE')).toBe('PLENARY');
  });

  it('maps ADOPTED status', () => {
    expect(mapDocumentStatus('ADOPTED')).toBe('ADOPTED');
  });

  it('maps REJECTED status', () => {
    expect(mapDocumentStatus('REJECTED')).toBe('REJECTED');
  });

  it('defaults to SUBMITTED for unknown status', () => {
    expect(mapDocumentStatus('UNKNOWN')).toBe('SUBMITTED');
  });

  it('is case-insensitive', () => {
    expect(mapDocumentStatus('adopted')).toBe('ADOPTED');
    expect(mapDocumentStatus('draft')).toBe('DRAFT');
  });
});

// ─── extractLocation ────────────────────────────────────────────

describe('extractLocation', () => {
  it('returns Strasbourg for FRA_SXB', () => {
    expect(extractLocation('http://publications.europa.eu/resource/authority/place/FRA_SXB')).toBe('Strasbourg');
  });

  it('returns Brussels for BEL_BRU', () => {
    expect(extractLocation('http://publications.europa.eu/resource/authority/place/BEL_BRU')).toBe('Brussels');
  });

  it('returns Unknown for unrecognized URL', () => {
    expect(extractLocation('http://example.com/somewhere')).toBe('Unknown');
  });

  it('returns Unknown for empty string', () => {
    expect(extractLocation('')).toBe('Unknown');
  });

  it('matches FRA_SXB anywhere in the string', () => {
    expect(extractLocation('FRA_SXB')).toBe('Strasbourg');
  });

  it('matches BEL_BRU anywhere in the string', () => {
    expect(extractLocation('BEL_BRU')).toBe('Brussels');
  });
});

// ─── extractVoteCount ───────────────────────────────────────────

describe('extractVoteCount', () => {
  it('returns number values as-is', () => {
    expect(extractVoteCount(350)).toBe(350);
    expect(extractVoteCount(0)).toBe(0);
  });

  it('parses integer string', () => {
    expect(extractVoteCount('250')).toBe(250);
    expect(extractVoteCount('0')).toBe(0);
  });

  it('returns 0 for null', () => {
    expect(extractVoteCount(null)).toBe(0);
  });

  it('returns 0 for undefined', () => {
    expect(extractVoteCount(undefined)).toBe(0);
  });

  it('returns 0 for non-numeric string', () => {
    expect(extractVoteCount('not-a-number')).toBe(0);
    expect(extractVoteCount('')).toBe(0);
  });

  it('returns array length for arrays', () => {
    expect(extractVoteCount(['a', 'b', 'c'])).toBe(3);
    expect(extractVoteCount([])).toBe(0);
  });

  it('extracts count from @value object', () => {
    expect(extractVoteCount({ '@value': 120 })).toBe(120);
    expect(extractVoteCount({ '@value': '75' })).toBe(75);
  });

  it('returns 0 for boolean', () => {
    expect(extractVoteCount(true)).toBe(0);
    expect(extractVoteCount(false)).toBe(0);
  });

  it('handles nested @value objects', () => {
    expect(extractVoteCount({ '@value': { '@value': 50 } })).toBe(50);
  });
});

// ─── determineVoteOutcome ───────────────────────────────────────

describe('determineVoteOutcome', () => {
  it('returns ADOPTED when decision string contains ADOPTED', () => {
    expect(determineVoteOutcome('DECISION_ADOPTED', 300, 100)).toBe('ADOPTED');
  });

  it('returns ADOPTED when decision string contains APPROVED', () => {
    expect(determineVoteOutcome('APPROVED_BY_SIMPLE_MAJORITY', 400, 50)).toBe('ADOPTED');
  });

  it('returns REJECTED when decision string contains REJECTED', () => {
    expect(determineVoteOutcome('MOTION_REJECTED', 100, 300)).toBe('REJECTED');
  });

  it('uses vote counts when decision string is ambiguous - more for = ADOPTED', () => {
    expect(determineVoteOutcome('UNKNOWN', 300, 100)).toBe('ADOPTED');
  });

  it('uses vote counts when decision string is ambiguous - more against = REJECTED', () => {
    expect(determineVoteOutcome('UNKNOWN', 100, 300)).toBe('REJECTED');
  });

  it('returns ADOPTED on tie (for >= against)', () => {
    expect(determineVoteOutcome('', 200, 200)).toBe('ADOPTED');
  });

  it('handles empty decision string with vote fallback', () => {
    expect(determineVoteOutcome('', 0, 0)).toBe('ADOPTED');
  });

  it('ADOPTED keyword takes priority over vote counts', () => {
    expect(determineVoteOutcome('ADOPTED', 0, 500)).toBe('ADOPTED');
  });

  it('REJECTED keyword takes priority over vote counts', () => {
    expect(determineVoteOutcome('REJECTED', 500, 0)).toBe('REJECTED');
  });
});

// ─── mapQuestionType ────────────────────────────────────────────

describe('mapQuestionType', () => {
  it('maps ORAL type', () => {
    expect(mapQuestionType('ORAL_QUESTION')).toBe('ORAL');
  });

  it('maps INTERPELLATION to ORAL', () => {
    expect(mapQuestionType('INTERPELLATION')).toBe('ORAL');
  });

  it('maps QUESTION_TIME to ORAL', () => {
    expect(mapQuestionType('QUESTION_TIME')).toBe('ORAL');
  });

  it('defaults to WRITTEN for unknown type', () => {
    expect(mapQuestionType('WRITTEN_QUESTION')).toBe('WRITTEN');
    expect(mapQuestionType('QUESTION_FOR_WRITTEN_ANSWER')).toBe('WRITTEN');
  });

  it('defaults to WRITTEN for empty string', () => {
    expect(mapQuestionType('')).toBe('WRITTEN');
  });

  it('defaults to WRITTEN for unrecognized type', () => {
    expect(mapQuestionType('UNKNOWN')).toBe('WRITTEN');
  });
});
