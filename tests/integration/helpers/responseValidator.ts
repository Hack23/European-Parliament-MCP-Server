/**
 * Response Validation Helpers for Integration Tests
 * 
 * ISMS Policy: SC-002 (Secure Testing), SI-10 (Information Input Validation)
 * 
 * Validates MCP tool responses against schemas and expected structures
 */

import { z } from 'zod';
import { expect } from 'vitest';
import type { PaginatedResponse } from '../../../src/types/europeanParliament.js';

/**
 * Validate MCP response structure
 */
export function validateMCPStructure(
  result: unknown
): asserts result is { content: Array<{ type: string; text: string }> } {
  expect(result).toBeDefined();
  expect(result).toHaveProperty('content');
  expect(Array.isArray((result as { content: unknown }).content)).toBe(true);
  expect((result as { content: unknown[] }).content.length).toBeGreaterThan(0);
  expect((result as { content: Array<{ type: string }> }).content[0]).toHaveProperty('type');
  expect((result as { content: Array<{ type: string }> }).content[0]?.type).toBe('text');
  expect((result as { content: Array<{ text: unknown }> }).content[0]).toHaveProperty('text');
  expect(typeof (result as { content: Array<{ text: unknown }> }).content[0]?.text).toBe('string');
}

/**
 * Validate and parse MCP response against a Zod schema
 * 
 * @param result - MCP tool result
 * @param schema - Zod schema to validate against
 * @returns Validated data
 * 
 * @example
 * ```typescript
 * const data = validateAPIResponse(result, MEPSchema);
 * ```
 */
export function validateAPIResponse<T>(
  result: { content: Array<{ type: string; text: string }> },
  schema: z.ZodType<T>
): T {
  validateMCPStructure(result);
  
  const textContent = result.content[0];
  if (!textContent) {
    throw new Error('No content in MCP response');
  }
  
  const parsed = JSON.parse(textContent.text) as unknown;
  
  // Validate against schema
  const validated = schema.parse(parsed);
  
  return validated;
}

/**
 * Validate paginated response structure
 * 
 * @param result - MCP tool result
 * @returns Paginated response data
 */
export function validatePaginatedResponse<T>(
  result: { content: Array<{ type: string; text: string }> }
): PaginatedResponse<T> {
  validateMCPStructure(result);
  
  const textContent = result.content[0];
  if (!textContent) {
    throw new Error('No content in MCP response');
  }
  
  const parsed = JSON.parse(textContent.text) as unknown;
  
  // Validate paginated structure
  expect(parsed).toHaveProperty('data');
  expect(parsed).toHaveProperty('total');
  expect(parsed).toHaveProperty('limit');
  expect(parsed).toHaveProperty('offset');
  
  expect(Array.isArray((parsed as { data: unknown }).data)).toBe(true);
  expect(typeof (parsed as { total: unknown }).total).toBe('number');
  expect(typeof (parsed as { limit: unknown }).limit).toBe('number');
  expect(typeof (parsed as { offset: unknown }).offset).toBe('number');
  
  return parsed as PaginatedResponse<T>;
}

/**
 * Validate MEP data structure
 */
export function validateMEPStructure(mep: unknown): void {
  expect(mep).toHaveProperty('id');
  expect(mep).toHaveProperty('name');
  expect(mep).toHaveProperty('country');
  
  expect(typeof (mep as { id: unknown }).id).toBe('string');
  expect(typeof (mep as { name: unknown }).name).toBe('string');
  expect(typeof (mep as { country: unknown }).country).toBe('string');
  expect((mep as { country: string }).country).toMatch(/^[A-Z]{2}$/);
}

/**
 * Validate plenary session data structure
 */
export function validatePlenarySessionStructure(session: unknown): void {
  expect(session).toHaveProperty('id');
  expect(session).toHaveProperty('date');
  
  expect(typeof (session as { id: unknown }).id).toBe('string');
  expect(typeof (session as { date: unknown }).date).toBe('string');
  expect((session as { date: string }).date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
}

/**
 * Validate voting record data structure
 */
export function validateVotingRecordStructure(record: unknown): void {
  expect(record).toHaveProperty('id');
  expect(record).toHaveProperty('sessionId');
  expect(record).toHaveProperty('date');
  
  expect(typeof (record as { id: unknown }).id).toBe('string');
  expect(typeof (record as { sessionId: unknown }).sessionId).toBe('string');
  expect(typeof (record as { date: unknown }).date).toBe('string');
}

/**
 * Validate document data structure
 */
export function validateDocumentStructure(document: unknown): void {
  expect(document).toHaveProperty('id');
  expect(document).toHaveProperty('title');
  expect(document).toHaveProperty('type');
  
  expect(typeof (document as { id: unknown }).id).toBe('string');
  expect(typeof (document as { title: unknown }).title).toBe('string');
  expect(typeof (document as { type: unknown }).type).toBe('string');
}

/**
 * Validate committee data structure
 */
export function validateCommitteeStructure(committee: unknown): void {
  expect(committee).toHaveProperty('id');
  expect(committee).toHaveProperty('name');
  expect(committee).toHaveProperty('abbreviation');
  
  expect(typeof (committee as { id: unknown }).id).toBe('string');
  expect(typeof (committee as { name: unknown }).name).toBe('string');
  expect(typeof (committee as { abbreviation: unknown }).abbreviation).toBe('string');
}

/**
 * Validate parliamentary question data structure
 */
export function validateParliamentaryQuestionStructure(question: unknown): void {
  expect(question).toHaveProperty('id');
  expect(question).toHaveProperty('title');
  expect(question).toHaveProperty('type');
  
  expect(typeof (question as { id: unknown }).id).toBe('string');
  expect(typeof (question as { title: unknown }).title).toBe('string');
  expect(typeof (question as { type: unknown }).type).toBe('string');
}
