/**
 * Shared Test Assertion Helpers
 *
 * Provides reusable assertion utilities for MCP tool tests, reducing
 * boilerplate when checking response structure and content.
 *
 * ## Usage
 *
 * ```typescript
 * import { expectValidMCPResponse, expectValidPaginatedMCPResponse } from '../../tests/helpers/assertions.js';
 *
 * it('should return valid MCP response', async () => {
 *   const result = await handleGetMEPs({});
 *   const parsed = expectValidMCPResponse(result);
 *   expect(parsed).toHaveProperty('data');
 * });
 *
 * it('should return paginated data', async () => {
 *   const result = await handleGetMEPs({});
 *   const parsed = expectValidPaginatedMCPResponse(result);
 *   expect(Array.isArray(parsed.data)).toBe(true);
 * });
 * ```
 *
 * ISMS Policy: SC-002 (Secure Testing)
 */

import { expect } from 'vitest';

/** Shape of a single MCP content item. */
interface MCPContentItem {
  type: string;
  text?: string;
}

/** Minimal MCP tool response shape. */
interface MCPToolResponse {
  content: MCPContentItem[];
}

/** Minimal paginated response shape. */
interface PaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Asserts that `response` is a valid MCP tool response and returns the parsed
 * JSON value from the first text content item.
 *
 * Checks:
 * - `response.content` is a non-empty array
 * - `response.content[0].type === 'text'`
 * - `response.content[0].text` is valid JSON
 *
 * The return type is `unknown` — the JSON payload may be any valid JSON value
 * (object, array, string, number, `null`). Callers can narrow the type as
 * needed, or use {@link expectValidPaginatedMCPResponse} when an object with
 * `data`/`total`/`limit`/`offset`/`hasMore` is expected.
 *
 * @param response - The raw value returned by a tool handler.
 * @returns The parsed JSON value from the text content.
 * @throws If any structural expectation fails.
 */
export function expectValidMCPResponse(response: unknown): unknown {
  expect(response).toHaveProperty('content');
  const r = response as MCPToolResponse;
  expect(Array.isArray(r.content)).toBe(true);
  expect(r.content.length).toBeGreaterThan(0);
  expect(r.content[0]).toHaveProperty('type', 'text');
  expect(typeof r.content[0]?.text).toBe('string');

  const parsed: unknown = JSON.parse(r.content[0]!.text!);
  return parsed;
}

/**
 * Asserts that `response` is a valid MCP tool response containing a paginated
 * payload, and returns the parsed paginated object.
 *
 * In addition to all checks performed by {@link expectValidMCPResponse}, this
 * helper also verifies:
 * - `data` is an array
 * - `total`, `limit`, `offset` are numbers
 * - `hasMore` is a boolean
 *
 * @param response - The raw value returned by a tool handler.
 * @returns The parsed paginated response object.
 * @throws If any structural expectation fails.
 */
export function expectValidPaginatedMCPResponse(
  response: unknown
): PaginatedResponse {
  const rawParsed = expectValidMCPResponse(response);
  expect(typeof rawParsed).toBe('object');
  expect(rawParsed).not.toBeNull();
  const parsed = rawParsed as Record<string, unknown>;

  expect(parsed).toHaveProperty('data');
  expect(Array.isArray(parsed['data'])).toBe(true);
  expect(typeof parsed['total']).toBe('number');
  expect(typeof parsed['limit']).toBe('number');
  expect(typeof parsed['offset']).toBe('number');
  expect(typeof parsed['hasMore']).toBe('boolean');

  return parsed as unknown as PaginatedResponse;
}

/**
 * Asserts that invoking `fn` rejects (i.e. throws or returns a rejected
 * promise). Optionally checks that the error message contains `messageFragment`.
 *
 * @param fn - Async function expected to throw.
 * @param messageFragment - Optional substring expected in the error message.
 */
export async function expectToolError(
  fn: () => Promise<unknown>,
  messageFragment?: string
): Promise<void> {
  if (messageFragment !== undefined) {
    await expect(fn()).rejects.toThrow(messageFragment);
  } else {
    await expect(fn()).rejects.toThrow();
  }
}
