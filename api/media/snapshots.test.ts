/**
 * OSINT QA Harness — Per-Tool Golden Snapshot Suite
 *
 * Companion to {@link tests/integration/osint/contract.test.ts}. Where the
 * contract suite asserts the *shape* of the {@link OsintStandardOutput}
 * envelope, this suite locks down the *content* — scoring weights,
 * classification thresholds, alignment buckets, attribution lists — by
 * diff-asserting each tool's response against a checked-in golden snapshot.
 *
 * For every OSINT tool the suite runs two fixture variants:
 *
 *  - **empty-path** — the no-data baseline (`installEmptyPathMocks`). Most
 *    tools degrade gracefully to `confidenceLevel: LOW` with warnings here.
 *  - **hot-path** — substantive synthetic EP + DOCEO data
 *    (`installHotPathMocks`) that drives the tool through its scoring code
 *    path so a methodology regression actually moves a snapshot value.
 *
 * Snapshots live at `tests/integration/osint/__snapshots__/<tool>.<variant>.json`
 * and are serialised with stable key ordering (see `stableStringify`) so
 * spurious diffs from object-property iteration never appear in PRs.
 *
 * Volatile fields (timestamps, generated identifiers, `dataFreshness` deltas
 * derived from wall-clock) are stripped via `stripVolatile` before
 * snapshotting.
 *
 * ## Refresh procedure
 *
 *     npm run test:osint:snapshots -- -u
 *
 * Diffs MUST be reviewer-acknowledged via the "Snapshot refresh
 * acknowledged" checkbox in `PULL_REQUEST_TEMPLATE.md`. See
 * `INTEGRATION_TESTING.md` § "OSINT QA Harness — Golden Snapshots" for the
 * full refresh-and-review workflow.
 *
 * ISMS Policy: SC-002 (Secure Testing), A.8.29 (Security testing in
 * development/acceptance), A.8.34 (Audit-test protection).
 * Compliance: ISO 27001, SLSA Level 3 (verifiable test-artefact provenance).
 *
 * @see tests/fixtures/osint/index.ts — shared fixture factory
 * @see src/server/toolRegistry.ts — `getToolMetadataArray()`
 */

import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// ── Mock the EP client and DOCEO client BEFORE importing tool modules ───────
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
  installHotPathMocks,
  OSINT_TOOL_INPUTS,
  stripVolatile,
  stableStringify,
} from '../../fixtures/osint/index.js';

// ── Snapshot dir resolution (ESM-safe) ──────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SNAPSHOTS_DIR = join(__dirname, '__snapshots__');

/**
 * Snapshot-refresh toggle.
 *
 *  - `npm run test:osint:snapshots -- -u`        (vitest's standard -u flag)
 *  - `UPDATE_OSINT_SNAPSHOTS=1 npx vitest ...`   (env-var alternative for CI)
 *
 * In refresh mode missing/diverging snapshots are *written*; in normal mode a
 * divergence fails the test with a readable JSON-text diff.
 */
const UPDATE_SNAPSHOTS =
  process.argv.includes('-u') ||
  process.argv.includes('--update') ||
  process.env['UPDATE_OSINT_SNAPSHOTS'] === '1';

/** Parse the JSON envelope from an MCP tool response. */
function parseToolPayload(result: { content: { type: string; text: string }[] }): Record<string, unknown> {
  expect(result).toBeDefined();
  expect(Array.isArray(result.content)).toBe(true);
  expect(result.content.length).toBeGreaterThan(0);
  const block = result.content[0];
  expect(block?.type).toBe('text');
  expect(typeof block?.text).toBe('string');
  const parsed: unknown = JSON.parse(block?.text ?? 'null');
  expect(parsed).toBeTypeOf('object');
  expect(parsed).not.toBeNull();
  return parsed as Record<string, unknown>;
}

/**
 * Compare `actual` against the snapshot file `<tool>.<variant>.json`.
 * In refresh mode the snapshot is (re)written; otherwise the test fails on
 * any diff with a readable JSON-text diff in the assertion message.
 */
function assertMatchesSnapshot(snapshotName: string, actual: unknown): void {
  const serialised = stableStringify(actual);
  const snapshotPath = join(SNAPSHOTS_DIR, `${snapshotName}.json`);

  if (UPDATE_SNAPSHOTS) {
    mkdirSync(SNAPSHOTS_DIR, { recursive: true });
    writeFileSync(snapshotPath, serialised, 'utf-8');
    // Refresh: succeed silently — vitest will print the file
    // path in the run report via the normal pass output.
    return;
  }

  if (!existsSync(snapshotPath)) {
    throw new Error(
      `Snapshot file missing: ${snapshotPath}. ` +
        `Run with UPDATE_SNAPSHOTS=1 to create it: npm run test:osint:snapshots -- -u`
    );
  }

  const expected = readFileSync(snapshotPath, 'utf-8');
  expect(
    serialised,
    `Snapshot diff for ${snapshotName}.json — methodology change detected. ` +
      `If intentional, refresh with: npm run test:osint:snapshots -- -u`
  ).toEqual(expected);
}

/** OSINT tool list resolved once at suite-load (registry-driven). */
const OSINT_TOOLS = getToolMetadataArray().filter(t => t.category === 'osint');

/** Variants exercised per tool. Add new variants here to widen coverage. */
const VARIANTS = [
  {
    name: 'empty-path',
    install: () => installEmptyPathMocks(epClientModule.epClient, doceoClientModule.doceoClient),
  },
  {
    name: 'hot-path',
    install: () => installHotPathMocks(epClientModule.epClient, doceoClientModule.doceoClient),
  },
] as const;

describe('OSINT golden-snapshot suite (registry-driven)', () => {
  beforeAll(() => {
    expect(OSINT_TOOLS.length).toBeGreaterThan(0);
    const missing = OSINT_TOOLS.map(t => t.name).filter(n => OSINT_TOOL_INPUTS[n] === undefined);
    expect(
      missing,
      `Add minimal valid input for new OSINT tools in OSINT_TOOL_INPUTS (tests/fixtures/osint/index.ts): ${missing.join(', ')}`
    ).toEqual([]);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    clearDoceoMepAggregatorCache();
    // Pin wall-clock so freshness/period fields render deterministically.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2024-06-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  for (const tool of OSINT_TOOLS) {
    describe(`${tool.name}`, () => {
      const input = OSINT_TOOL_INPUTS[tool.name] ?? {};

      for (const variant of VARIANTS) {
        it(`matches the ${variant.name} golden snapshot`, async () => {
          variant.install();
          const result = await dispatchToolCall(tool.name, input);
          const payload = parseToolPayload(result);
          const stripped = stripVolatile(payload);
          assertMatchesSnapshot(`${tool.name}.${variant.name}`, stripped);
        }, 30_000);
      }
    });
  }
});
