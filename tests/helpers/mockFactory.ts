/**
 * Centralized Mock Factory for Tool Tests
 *
 * Provides the `setupToolTest()` convenience helper that registers a
 * `beforeEach(() => vi.clearAllMocks())` in the calling test suite.
 *
 * ## Usage
 *
 * Tool test files must still call `vi.mock()` at module level (Vitest hoists it).
 * Use this helper to reduce per-test boilerplate:
 *
 * ```typescript
 * import { vi } from 'vitest';
 * import { setupToolTest } from '../../tests/helpers/mockFactory.js';
 * import { expectValidMCPResponse } from '../../tests/helpers/assertions.js';
 * import * as epClientModule from '../clients/europeanParliamentClient.js';
 *
 * vi.mock('../clients/europeanParliamentClient.js', () => ({
 *   epClient: { getHomonymMEPs: vi.fn() },
 * }));
 *
 * setupToolTest(); // registers beforeEach(vi.clearAllMocks)
 *
 * describe('...', () => {
 *   beforeEach(() => {
 *     vi.mocked(epClientModule.epClient.getHomonymMEPs).mockResolvedValue({ ... });
 *   });
 * });
 * ```
 *
 * ISMS Policy: SC-002 (Secure Testing), DP-001 (GDPR Compliance)
 */

import { vi, beforeEach } from 'vitest';

/**
 * Convenience helper for tool test suites.
 *
 * Registers a `beforeEach(() => vi.clearAllMocks())` so per-test setup can
 * configure mock return values without having to clear leftover state from
 * prior tests.
 *
 * Note: `vi.mock()` itself must still be declared at the top of each test file
 * because Vitest hoists `vi.mock()` calls to before any imports. This function
 * only manages test lifecycle hooks.
 *
 * @example
 * ```typescript
 * vi.mock('../clients/europeanParliamentClient.js', () => ({ epClient: { getMEPs: vi.fn() } }));
 *
 * setupToolTest(); // registers beforeEach(vi.clearAllMocks)
 * ```
 */
export function setupToolTest(): void {
  beforeEach(() => {
    vi.clearAllMocks();
  });
}
