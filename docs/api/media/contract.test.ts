/**
 * OSINT QA Harness — Cross-Tool Contract Test
 *
 * A single, registry-driven contract test that every OSINT tool must satisfy.
 * Iterates {@link getToolMetadataArray} for tools with `category === 'osint'`
 * so new OSINT tools are automatically picked up by this suite.
 *
 * For every tool the test asserts:
 *  1. Response parses against {@link OsintStandardOutputSchema}
 *     ({@link OsintStandardOutput} envelope: `confidenceLevel`, `methodology`,
 *     `dataFreshness`, `sourceAttribution`, `dataQualityWarnings`).
 *  2. `confidenceLevel ∈ {HIGH, MEDIUM, LOW}` (already enforced by the schema,
 *     restated here for documentation).
 *  3. `methodology`, `dataFreshness`, `sourceAttribution` are non-empty strings.
 *  4. **No-silent-zero policy**: when the underlying data is empty
 *     (mocked-empty EP API) and `confidenceLevel` therefore degrades to
 *     `LOW`, `dataQualityWarnings` MUST be non-empty so consumers can see why
 *     numeric metrics are zero.
 *  5. **Determinism**: invoking each tool twice with the same input yields
 *     byte-identical JSON payloads after stripping volatile fields
 *     (timestamps, generated identifiers, vitest-injected wall-clock).
 *
 * ISMS Policy: SC-002 (Secure Testing), A.8.29 (Security testing in development
 * and acceptance), A.8.34 (Protection during audit testing).
 * Compliance: ISO 27001, SLSA Level 3 (verifiable test evidence), EU CRA.
 *
 * @see src/tools/shared/types.ts — `OsintStandardOutput`
 * @see src/schemas/ep/analysis.ts — `OsintStandardOutputSchema`
 * @see src/server/toolRegistry.ts — `getToolMetadataArray()`
 */

import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { OsintStandardOutputSchema } from '../../../src/schemas/europeanParliament.js';

// ── Mock the EP client and DOCEO client ──────────────────────────────────────
// `vi.mock` calls must precede any imports that transitively pull in the
// mocked modules — this is the established pattern in the per-tool unit tests
// (see e.g. src/tools/assessMepInfluence.test.ts).

vi.mock('../../../src/clients/europeanParliamentClient.js', () => ({
  epClient: {
    getCurrentMEPs: vi.fn(),
    getMEPDetails: vi.fn(),
    getVotingRecords: vi.fn(),
    getProcedures: vi.fn(),
    getProcedureEvents: vi.fn(),
    getCommitteeInfo: vi.fn(),
    getCommitteeDocuments: vi.fn(),
    getAdoptedTexts: vi.fn(),
    getPlenarySessions: vi.fn(),
    getMeetingDecisions: vi.fn(),
    getParliamentaryQuestions: vi.fn(),
    getPlenarySessionDocumentItems: vi.fn(),
  },
}));

vi.mock('../../../src/clients/ep/doceoClient.js', () => ({
  doceoClient: {
    getLatestVotes: vi.fn(),
  },
}));

import * as epClientModule from '../../../src/clients/europeanParliamentClient.js';
import * as doceoClientModule from '../../../src/clients/ep/doceoClient.js';
import { dispatchToolCall, getToolMetadataArray } from '../../../src/server/toolRegistry.js';
import { clearDoceoMepAggregatorCache } from '../../../src/utils/doceoMepAggregator.js';
import {
  installEmptyPathMocks,
  OSINT_TOOL_INPUTS as TOOL_INPUTS,
  stripVolatile,
} from '../../fixtures/osint/index.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Parse the JSON envelope from an MCP tool response.
 * Throws if the response is not a single text content block with parseable JSON.
 */
function parseToolPayload(result: { content: { type: string; text: string }[] }): Record<string, unknown> {
  expect(result).toBeDefined();
  expect(Array.isArray(result.content)).toBe(true);
  expect(result.content.length).toBeGreaterThan(0);
  const block = result.content[0];
  expect(block).toBeDefined();
  expect(block?.type).toBe('text');
  expect(typeof block?.text).toBe('string');
  const parsed: unknown = JSON.parse(block?.text ?? 'null');
  expect(parsed).toBeTypeOf('object');
  expect(parsed).not.toBeNull();
  return parsed as Record<string, unknown>;
}

// `stripVolatile` and `TOOL_INPUTS` are imported from the shared OSINT fixture
// factory (`tests/fixtures/osint/index.ts`) so the contract suite and the
// per-tool golden-snapshot suite cannot drift apart.

/**
 * Install default mock implementations for every EP API method an OSINT
 * tool may transitively call. Defaults return synthetic, redacted data
 * derived from the existing Phase 6 fixtures so the contract test
 * exercises the "happy path" envelope; per-test overrides can simulate
 * data-unavailable scenarios.
 */
function installDefaultMocks(): void {
  installEmptyPathMocks(epClientModule.epClient, doceoClientModule.doceoClient);
}

// ── Driver ───────────────────────────────────────────────────────────────────

/**
 * Resolve the OSINT tool list once at suite-load. Driving the suite from
 * `getToolMetadataArray()` ensures that any newly registered OSINT tool is
 * auto-covered without editing this file (other than its TOOL_INPUTS entry).
 */
const OSINT_TOOLS = getToolMetadataArray().filter(t => t.category === 'osint');

describe('OSINT contract suite (registry-driven)', () => {
  beforeAll(() => {
    expect(OSINT_TOOLS.length).toBeGreaterThan(0);
    // Sanity: every registered OSINT tool must have a minimal-input entry.
    const missing = OSINT_TOOLS.map(t => t.name).filter(n => TOOL_INPUTS[n] === undefined);
    expect(missing, `Add minimal valid input for new OSINT tools in TOOL_INPUTS: ${missing.join(', ')}`).toEqual([]);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    clearDoceoMepAggregatorCache();
    installDefaultMocks();
    // Pin Date.now() to a deterministic instant so timestamp-derived fields
    // (e.g. analysisTime, dataFreshness "as-of" wording) are stable across
    // both determinism invocations within a single test.
    //
    // `vi.setSystemTime` requires fake timers; we fake ONLY `Date` so any
    // setTimeout/setInterval/queueMicrotask used by tools or their HTTP
    // stack continues to run on the real clock. `vi.useRealTimers()` in
    // `afterEach` prevents mocked time from leaking into other suites.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2024-06-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  for (const tool of OSINT_TOOLS) {
    describe(`${tool.name}`, () => {
      const input = TOOL_INPUTS[tool.name] ?? {};

      it('returns a payload matching OsintStandardOutputSchema with populated envelope', async () => {
        const result = await dispatchToolCall(tool.name, input);
        const payload = parseToolPayload(result);

        // Some tools may return an in-band error envelope when input validation
        // succeeds but downstream calls fail. The OSINT envelope is still
        // mandatory on the success path, so assert it directly.
        const envelope = {
          confidenceLevel: payload['confidenceLevel'],
          methodology: payload['methodology'],
          dataFreshness: payload['dataFreshness'],
          sourceAttribution: payload['sourceAttribution'],
          dataQualityWarnings: payload['dataQualityWarnings'],
        };

        const parsed = OsintStandardOutputSchema.safeParse(envelope);
        expect(
          parsed.success,
          `OSINT tool ${tool.name} failed envelope schema validation: ${parsed.success ? '' : JSON.stringify(parsed.error.issues)}`
        ).toBe(true);

        if (parsed.success) {
          expect(['HIGH', 'MEDIUM', 'LOW']).toContain(parsed.data.confidenceLevel);
          expect(parsed.data.methodology.length).toBeGreaterThan(0);
          expect(parsed.data.dataFreshness.length).toBeGreaterThan(0);
          expect(parsed.data.sourceAttribution.length).toBeGreaterThan(0);
          // sourceAttribution must reference the EP Open Data Portal.
          expect(parsed.data.sourceAttribution.toLowerCase()).toMatch(/europ(ean parliament|arl)/);
          // dataQualityWarnings is required to be an array (may be empty).
          expect(Array.isArray(parsed.data.dataQualityWarnings)).toBe(true);
        }
      }, 60_000);

      it('respects the no-silent-zero policy when data is unavailable', async () => {
        // Force every EP source to be empty so any numeric metric the tool
        // emits must be either zero+warning-explained, or a placeholder
        // sentinel. Tools that silently emit zeros without warnings violate
        // the data-quality intent of the envelope.
        vi.mocked(epClientModule.epClient.getCurrentMEPs).mockResolvedValue({
          data: [], total: 0, limit: 50, offset: 0, hasMore: false,
        });
        // Keep getMEPDetails functional for tools that REQUIRE a single MEP
        // (assess_mep_influence, detect_voting_anomalies with mepId,
        // comparative_intelligence, correlate_intelligence) — they should
        // still emit warnings for the absent companion data sources.
        const result = await dispatchToolCall(tool.name, input);
        const payload = parseToolPayload(result);

        const warnings = payload['dataQualityWarnings'];
        const confidence = payload['confidenceLevel'];

        // Either the envelope explicitly warns about missing data, OR the
        // tool returns HIGH confidence backed by the per-MEP data that is
        // still present. Tools must NEVER silently degrade to LOW/MEDIUM
        // without any warning.
        if (confidence === 'LOW' || confidence === 'MEDIUM') {
          expect(
            Array.isArray(warnings) && (warnings as unknown[]).length > 0,
            `Tool ${tool.name} returned confidenceLevel=${String(confidence)} with empty dataQualityWarnings — violates no-silent-zero policy`
          ).toBe(true);
        }
      }, 60_000);

      it('is deterministic — invoking twice with the same input yields identical payloads', async () => {
        const first = await dispatchToolCall(tool.name, input);
        const second = await dispatchToolCall(tool.name, input);

        const firstStripped = stripVolatile(parseToolPayload(first));
        const secondStripped = stripVolatile(parseToolPayload(second));

        expect(
          JSON.stringify(firstStripped),
          `Tool ${tool.name} returned non-deterministic output across two identical invocations`
        ).toEqual(JSON.stringify(secondStripped));
      }, 60_000);
    });
  }
});
