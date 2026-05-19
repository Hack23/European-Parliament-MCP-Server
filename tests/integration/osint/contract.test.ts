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
import {
  osintPhase6MEPs,
  osintPhase6MEPDetails,
  osintPhase6PaginatedMEPs,
} from '../../fixtures/osintPhase6Fixtures.js';

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

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Empty paginated EP response for any EP API method returning data lists. */
const emptyPaginated = <T>(): { data: T[]; total: number; limit: number; offset: number; hasMore: boolean } => ({
  data: [],
  total: 0,
  limit: 50,
  offset: 0,
  hasMore: false,
});

/** Empty DOCEO response — no plenary-week RCV records available. */
const emptyDoceoResponse = {
  data: [],
  total: 0,
  datesAvailable: [] as string[],
  datesUnavailable: [] as string[],
  source: { type: 'DOCEO_XML' as const, term: 10, urls: [] as string[] },
  limit: 100,
  offset: 0,
  hasMore: false,
};

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

/**
 * Return a deep copy of `value` with volatile keys removed recursively.
 * Pure function — does NOT mutate the input; new arrays and objects are
 * always allocated.
 *
 * Volatile keys recognised (timestamp / per-run identifier fields):
 *  `analysisTime`, `assessmentTime`, `generatedAt`, `timestamp`,
 *  `correlationId`, `runId`, `requestId`, `computedAt`, `asOf`.
 *
 * Note: filtering is key-based only — embedded timestamp values inside
 * non-volatile fields are not stripped. If a tool ever embeds a wall-clock
 * timestamp in a non-volatile field, add the field name to {@link VOLATILE_KEYS}.
 */
const VOLATILE_KEYS = new Set([
  'analysisTime',
  'assessmentTime',
  'generatedAt',
  'timestamp',
  'correlationId',
  'runId',
  'requestId',
  'computedAt',
  'asOf',
]);

function stripVolatile(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripVolatile);
  }
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (VOLATILE_KEYS.has(k)) continue;
      out[k] = stripVolatile(v);
    }
    return out;
  }
  return value;
}

/**
 * Per-tool minimal valid inputs.
 *
 * The contract test invokes each OSINT tool with the simplest input that
 * passes Zod validation. Tools without required fields receive `{}`.
 *
 * NOTE: adding a new OSINT tool only requires adding an entry here; the
 * test driver below auto-discovers tools from `getToolMetadataArray()`.
 */
const TOOL_INPUTS: Record<string, Record<string, unknown>> = {
  assess_mep_influence: { mepId: '101' },
  analyze_coalition_dynamics: {},
  detect_voting_anomalies: { mepId: '101' },
  compare_political_groups: { groupIds: ['EPP', 'S&D'] },
  analyze_legislative_effectiveness: { subjectType: 'COMMITTEE', subjectId: 'AFET' },
  monitor_legislative_pipeline: { status: 'ALL', limit: 5 },
  analyze_committee_activity: { committeeId: 'AFET' },
  track_mep_attendance: { limit: 5 },
  analyze_country_delegation: { country: 'SE' },
  generate_political_landscape: {},
  network_analysis: {},
  sentiment_tracker: {},
  early_warning_system: {},
  comparative_intelligence: { mepIds: [101, 102] },
  correlate_intelligence: { mepIds: ['101', '102'] },
};

/**
 * Install default mock implementations for every EP API method an OSINT
 * tool may transitively call. Defaults return synthetic, redacted data
 * derived from the existing Phase 6 fixtures so the contract test
 * exercises the "happy path" envelope; per-test overrides can simulate
 * data-unavailable scenarios.
 */
function installDefaultMocks(): void {
  vi.mocked(epClientModule.epClient.getCurrentMEPs).mockResolvedValue(osintPhase6PaginatedMEPs);
  vi.mocked(epClientModule.epClient.getMEPDetails).mockImplementation((id: string) => {
    const detail = osintPhase6MEPDetails.find(m => m.id === id)
      ?? { ...osintPhase6MEPs[0], ...osintPhase6MEPDetails[0], id };
    return Promise.resolve(detail);
  });
  vi.mocked(epClientModule.epClient.getVotingRecords).mockResolvedValue(emptyPaginated());
  vi.mocked(epClientModule.epClient.getProcedures).mockResolvedValue(emptyPaginated());
  vi.mocked(epClientModule.epClient.getProcedureEvents).mockResolvedValue(emptyPaginated());
  vi.mocked(epClientModule.epClient.getCommitteeInfo).mockResolvedValue({
    id: 'COMM-AFET',
    name: 'Committee on Foreign Affairs (synthetic)',
    abbreviation: 'AFET',
    members: [],
    viceChairs: [],
  });
  vi.mocked(epClientModule.epClient.getCommitteeDocuments).mockResolvedValue(emptyPaginated());
  vi.mocked(epClientModule.epClient.getAdoptedTexts).mockResolvedValue(emptyPaginated());
  vi.mocked(epClientModule.epClient.getPlenarySessions).mockResolvedValue(emptyPaginated());
  vi.mocked(epClientModule.epClient.getMeetingDecisions).mockResolvedValue(emptyPaginated());
  vi.mocked(epClientModule.epClient.getParliamentaryQuestions).mockResolvedValue(emptyPaginated());
  vi.mocked(epClientModule.epClient.getPlenarySessionDocumentItems).mockResolvedValue(emptyPaginated());
  vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue(emptyDoceoResponse);
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
