/**
 * OSINT Fixture Factory — Single Source of Truth
 *
 * Canonical, deterministic fixtures shared by:
 *  - the OSINT cross-tool contract suite (`tests/integration/osint/contract.test.ts`)
 *  - the per-tool golden-snapshot suite (`tests/integration/osint/snapshots.test.ts`)
 *  - any future mutation-testing harness
 *
 * Two fixture variants are exposed so every snapshot exercises real scoring
 * logic rather than only the empty envelope:
 *
 *  - `installEmptyPathMocks(epClient, doceoClient)` — empty EP + DOCEO responses
 *    (mirrors the no-data baseline from `contract.test.ts`). Useful for tools
 *    that legitimately produce no data on the canonical fixture and for
 *    verifying the no-silent-zero policy.
 *  - `installHotPathMocks(epClient, doceoClient)` — substantive synthetic EP
 *    + DOCEO data that drives every OSINT tool through its scoring,
 *    classification, and attribution code paths.
 *
 * All identifiers, names and metric values are deterministic and clearly
 * synthetic (MEP IDs `101`–`106`, names suffixed `(synthetic)`, vote IDs
 * prefixed `VOTE-`/`RCV-`). Dates are pinned to 2024 so the snapshots remain
 * stable against `vi.setSystemTime('2024-06-15T12:00:00.000Z')`.
 *
 * ISMS Policy: SC-002 (Secure Testing), DP-001 (GDPR — synthetic data only).
 * Compliance: ISO 27001 A.8.29 (Security testing), A.8.34 (Audit-test protection),
 * SLSA Level 3 (verifiable test-artefact provenance).
 *
 * @module tests/fixtures/osint
 */

import {
  osintPhase6MEPs,
  osintPhase6MEPDetails,
  osintPhase6PaginatedMEPs,
} from '../osintPhase6Fixtures.js';

// ── Type aliases (loose intentionally — fixtures cross multiple EP type
//    surfaces and the snapshot suite cares about runtime shape, not nominal
//    types). ───────────────────────────────────────────────────────────────
type Paginated<T> = { data: T[]; total: number; limit: number; offset: number; hasMore: boolean };

/** Re-export canonical MEP roster so callers can keep a single import path. */
export {
  osintPhase6MEPs as canonicalMEPs,
  osintPhase6MEPDetails as canonicalMEPDetails,
  osintPhase6PaginatedMEPs as canonicalPaginatedMEPs,
};

/** Empty paginated EP response — used for tools that have no data on the canonical fixture. */
export const emptyPaginated = <T>(): Paginated<T> => ({
  data: [],
  total: 0,
  limit: 50,
  offset: 0,
  hasMore: false,
});

/** Empty DOCEO response — no plenary-week RCV records available. */
export const emptyDoceoResponse = {
  data: [],
  total: 0,
  datesAvailable: [] as string[],
  datesUnavailable: [] as string[],
  source: { type: 'DOCEO_XML' as const, term: 10, urls: [] as string[] },
  limit: 100,
  offset: 0,
  hasMore: false,
};

// ── Hot-path: DOCEO RCV records ─────────────────────────────────────────────
//
// Six MEPs (101–106) cast votes across three plenary roll-calls in 2024.
// Group breakdown sums to the count of MEPs per group present in the fixture.
// Coverage is intentionally varied so:
//   - MEP 101 (EPP/DE) appears in all three votes → high participation score
//   - MEP 102 (S&D/FR) abstains once → drives anomaly + coalition diff
//   - MEP 106 (Verts/SE) misses one vote → attendance drop signal

/** Hot-path DOCEO voting records — substantive data for scoring/attribution. */
export const hotPathDoceoVotes = [
  {
    id: 'RCV-2024-03-12-001',
    date: '2024-03-12',
    term: 10,
    subject: 'Climate Regulation Amendment (synthetic)',
    reference: 'A10-0042/2024',
    votesFor: 4,
    votesAgainst: 1,
    abstentions: 1,
    result: 'ADOPTED' as const,
    mepVotes: {
      '101': 'FOR' as const,
      '102': 'FOR' as const,
      '103': 'AGAINST' as const,
      '104': 'FOR' as const,
      '105': 'FOR' as const,
      '106': 'ABSTAIN' as const,
    },
    groupBreakdown: {
      EPP: { for: 1, against: 0, abstain: 0 },
      'S&D': { for: 1, against: 0, abstain: 1 },
      ECR: { for: 0, against: 1, abstain: 0 },
      Renew: { for: 1, against: 0, abstain: 0 },
      'Greens/EFA': { for: 1, against: 0, abstain: 0 },
    },
    sourceUrl: 'https://www.europarl.europa.eu/doceo/document/PV-10-2024-03-12-RCV_FR.xml',
    dataSource: 'RCV' as const,
    sittingDate: '2024-03-12',
    sittingNumber: '12',
    officialCounts: { for: 4, against: 1, abstentions: 1 },
  },
  {
    id: 'RCV-2024-04-09-002',
    date: '2024-04-09',
    term: 10,
    subject: 'Digital Economy Package (synthetic)',
    reference: 'A10-0099/2024',
    votesFor: 3,
    votesAgainst: 2,
    abstentions: 1,
    result: 'ADOPTED' as const,
    mepVotes: {
      '101': 'FOR' as const,
      '102': 'ABSTAIN' as const,
      '103': 'AGAINST' as const,
      '104': 'FOR' as const,
      '105': 'AGAINST' as const,
      '106': 'FOR' as const,
    },
    groupBreakdown: {
      EPP: { for: 1, against: 0, abstain: 0 },
      'S&D': { for: 1, against: 0, abstain: 1 },
      ECR: { for: 0, against: 1, abstain: 0 },
      Renew: { for: 1, against: 0, abstain: 0 },
      'Greens/EFA': { for: 0, against: 1, abstain: 0 },
    },
    sourceUrl: 'https://www.europarl.europa.eu/doceo/document/PV-10-2024-04-09-RCV_FR.xml',
    dataSource: 'RCV' as const,
    sittingDate: '2024-04-09',
    sittingNumber: '09',
    officialCounts: { for: 3, against: 2, abstentions: 1 },
  },
  {
    id: 'RCV-2024-05-21-003',
    date: '2024-05-21',
    term: 10,
    subject: 'Agricultural Subsidies Reform (synthetic)',
    reference: 'A10-0140/2024',
    votesFor: 2,
    votesAgainst: 3,
    abstentions: 0,
    result: 'REJECTED' as const,
    mepVotes: {
      '101': 'AGAINST' as const,
      '102': 'FOR' as const,
      '103': 'FOR' as const,
      '104': 'AGAINST' as const,
      '105': 'AGAINST' as const,
      // MEP 106 absent — attendance signal
    },
    groupBreakdown: {
      EPP: { for: 0, against: 1, abstain: 0 },
      'S&D': { for: 1, against: 0, abstain: 0 },
      ECR: { for: 1, against: 0, abstain: 0 },
      Renew: { for: 0, against: 1, abstain: 0 },
      'Greens/EFA': { for: 0, against: 1, abstain: 0 },
    },
    sourceUrl: 'https://www.europarl.europa.eu/doceo/document/PV-10-2024-05-21-RCV_FR.xml',
    dataSource: 'RCV' as const,
    sittingDate: '2024-05-21',
    sittingNumber: '21',
    officialCounts: { for: 2, against: 3, abstentions: 0 },
  },
];

/** Hot-path DOCEO response wrapper (matches doceoClient.getLatestVotes return shape). */
export const hotPathDoceoResponse = {
  data: hotPathDoceoVotes,
  total: hotPathDoceoVotes.length,
  datesAvailable: ['2024-03-12', '2024-04-09', '2024-05-21'],
  datesUnavailable: [] as string[],
  source: {
    type: 'DOCEO_XML' as const,
    term: 10,
    urls: hotPathDoceoVotes.map(v => v.sourceUrl),
  },
  limit: 100,
  offset: 0,
  hasMore: false,
};

// ── Hot-path: EP API supplementary data ─────────────────────────────────────

/** Hot-path EP voting records (legacy aggregate shape consumed by some tools). */
export const hotPathVotingRecords = {
  data: hotPathDoceoVotes.map(v => ({
    id: v.id,
    sessionId: `P10-${v.date}`,
    topic: v.subject,
    date: `${v.date}T14:00:00Z`,
    votesFor: v.votesFor,
    votesAgainst: v.votesAgainst,
    abstentions: v.abstentions,
    result: v.result,
  })),
  total: hotPathDoceoVotes.length,
  limit: 50,
  offset: 0,
  hasMore: false,
};

/** Hot-path procedures — two adopted, one ongoing, drives effectiveness/pipeline tools. */
export const hotPathProcedures = {
  data: [
    {
      id: 'COD-2024-0042',
      reference: '2024/0042(COD)',
      title: 'Climate Regulation Amendment (synthetic)',
      type: 'COD',
      status: 'ADOPTED',
      committee: 'ENVI',
      rapporteur: { id: '101', name: 'Thomas Weber (synthetic)' },
      dateLastActivity: '2024-03-12',
      stage: 'FINAL_ACT',
    },
    {
      id: 'COD-2024-0099',
      reference: '2024/0099(COD)',
      title: 'Digital Economy Package (synthetic)',
      type: 'COD',
      status: 'ADOPTED',
      committee: 'ITRE',
      rapporteur: { id: '102', name: 'Marie Leclerc (synthetic)' },
      dateLastActivity: '2024-04-09',
      stage: 'FINAL_ACT',
    },
    {
      id: 'COD-2024-0140',
      reference: '2024/0140(COD)',
      title: 'Agricultural Subsidies Reform (synthetic)',
      type: 'COD',
      status: 'ONGOING',
      committee: 'AGRI',
      rapporteur: { id: '103', name: 'Piotr Kowalski (synthetic)' },
      dateLastActivity: '2024-05-21',
      stage: 'COMMITTEE',
    },
  ],
  total: 3,
  limit: 50,
  offset: 0,
  hasMore: false,
};

/** Hot-path procedure events — minimal lifecycle for monitor_legislative_pipeline. */
export const hotPathProcedureEvents = {
  data: [
    { id: 'EV-001', procedureId: 'COD-2024-0042', date: '2024-01-15', stage: 'COMMITTEE_REPORT' },
    { id: 'EV-002', procedureId: 'COD-2024-0042', date: '2024-02-12', stage: 'PLENARY_VOTE' },
    { id: 'EV-003', procedureId: 'COD-2024-0042', date: '2024-03-12', stage: 'FINAL_ACT' },
    { id: 'EV-004', procedureId: 'COD-2024-0099', date: '2024-02-01', stage: 'COMMITTEE_REPORT' },
    { id: 'EV-005', procedureId: 'COD-2024-0099', date: '2024-04-09', stage: 'PLENARY_VOTE' },
  ],
  total: 5,
  limit: 50,
  offset: 0,
  hasMore: false,
};

/** Hot-path committee documents — two reports for committee-activity scoring. */
export const hotPathCommitteeDocuments = {
  data: [
    {
      id: 'AFET-DOC-001',
      reference: 'A10-0042/2024',
      title: 'Committee report on Foreign Policy Strategy (synthetic)',
      committee: 'AFET',
      date: '2024-02-15',
      type: 'REPORT',
    },
    {
      id: 'AFET-DOC-002',
      reference: 'A10-0066/2024',
      title: 'Opinion on EU-Latin America Relations (synthetic)',
      committee: 'AFET',
      date: '2024-03-20',
      type: 'OPINION',
    },
  ],
  total: 2,
  limit: 50,
  offset: 0,
  hasMore: false,
};

/** Hot-path adopted texts — one item to satisfy attribution paths. */
export const hotPathAdoptedTexts = {
  data: [
    {
      id: 'TA-2024-0042',
      reference: 'P10_TA(2024)0042',
      title: 'Texts adopted — Climate Regulation Amendment (synthetic)',
      date: '2024-03-12',
      procedureId: 'COD-2024-0042',
    },
  ],
  total: 1,
  limit: 50,
  offset: 0,
  hasMore: false,
};

/** Hot-path plenary sessions — single session per RCV date. */
export const hotPathPlenarySessions = {
  data: hotPathDoceoVotes.map(v => ({
    id: `P10-${v.date}`,
    date: v.date,
    term: 10,
    location: 'Strasbourg',
  })),
  total: hotPathDoceoVotes.length,
  limit: 50,
  offset: 0,
  hasMore: false,
};

/** Hot-path meeting decisions — empty (most OSINT tools don't fan into this). */
export const hotPathMeetingDecisions = emptyPaginated();

/** Hot-path parliamentary questions — two questions for sentiment_tracker. */
export const hotPathParliamentaryQuestions = {
  data: [
    {
      id: 'QE-2024-001234',
      reference: 'E-001234/2024',
      title: 'Written question on climate policy implementation (synthetic)',
      date: '2024-02-20',
      authorMepId: '101',
      type: 'WRITTEN',
    },
    {
      id: 'QE-2024-002345',
      reference: 'E-002345/2024',
      title: 'Written question on digital sovereignty (synthetic)',
      date: '2024-03-15',
      authorMepId: '102',
      type: 'WRITTEN',
    },
  ],
  total: 2,
  limit: 50,
  offset: 0,
  hasMore: false,
};

/** Hot-path plenary session document items — empty (advanced tool, not required for snapshots). */
export const hotPathPlenarySessionDocumentItems = emptyPaginated();

// ── Mock-installer helpers ──────────────────────────────────────────────────
//
// These accept the `vi.mocked(...)` proxies from the test file (untyped here
// because vitest's `MockedFunction` is heavy to surface across test boundaries
// without coupling the factory to vitest's type exports). Tests call:
//
//   installEmptyPathMocks(epClientModule.epClient, doceoClientModule.doceoClient);
//
// after `vi.mock(...)` has stubbed the real client modules.

/** Minimal contract for an EP-client mock surface used by OSINT tools. */
interface EPClientMockSurface {
  getCurrentMEPs: { mockResolvedValue: (v: unknown) => unknown };
  getMEPDetails: { mockImplementation: (fn: (id: string) => Promise<unknown>) => unknown };
  getVotingRecords: { mockResolvedValue: (v: unknown) => unknown };
  getProcedures: { mockResolvedValue: (v: unknown) => unknown };
  getProcedureEvents: { mockResolvedValue: (v: unknown) => unknown };
  getCommitteeInfo: { mockResolvedValue: (v: unknown) => unknown };
  getCommitteeDocuments: { mockResolvedValue: (v: unknown) => unknown };
  getAdoptedTexts: { mockResolvedValue: (v: unknown) => unknown };
  getPlenarySessions: { mockResolvedValue: (v: unknown) => unknown };
  getMeetingDecisions: { mockResolvedValue: (v: unknown) => unknown };
  getParliamentaryQuestions: { mockResolvedValue: (v: unknown) => unknown };
  getPlenarySessionDocumentItems: { mockResolvedValue: (v: unknown) => unknown };
}

interface DoceoClientMockSurface {
  getLatestVotes: { mockResolvedValue: (v: unknown) => unknown };
}

/** Canonical committee-info payload (used by both variants). */
const canonicalCommitteeInfo = {
  id: 'COMM-AFET',
  name: 'Committee on Foreign Affairs (synthetic)',
  abbreviation: 'AFET',
  members: osintPhase6MEPs.filter(m => m.committees?.includes('AFET')),
  viceChairs: [],
};

/**
 * Install **empty-path** mocks: MEP roster present, every other source empty.
 * Mirrors the baseline in `tests/integration/osint/contract.test.ts`.
 */
export function installEmptyPathMocks(epMock: EPClientMockSurface, doceoMock: DoceoClientMockSurface): void {
  epMock.getCurrentMEPs.mockResolvedValue(osintPhase6PaginatedMEPs);
  epMock.getMEPDetails.mockImplementation((id: string) => {
    const detail =
      osintPhase6MEPDetails.find(m => m.id === id) ??
      { ...osintPhase6MEPs[0], ...osintPhase6MEPDetails[0], id };
    return Promise.resolve(detail);
  });
  epMock.getVotingRecords.mockResolvedValue(emptyPaginated());
  epMock.getProcedures.mockResolvedValue(emptyPaginated());
  epMock.getProcedureEvents.mockResolvedValue(emptyPaginated());
  epMock.getCommitteeInfo.mockResolvedValue({ ...canonicalCommitteeInfo, members: [] });
  epMock.getCommitteeDocuments.mockResolvedValue(emptyPaginated());
  epMock.getAdoptedTexts.mockResolvedValue(emptyPaginated());
  epMock.getPlenarySessions.mockResolvedValue(emptyPaginated());
  epMock.getMeetingDecisions.mockResolvedValue(emptyPaginated());
  epMock.getParliamentaryQuestions.mockResolvedValue(emptyPaginated());
  epMock.getPlenarySessionDocumentItems.mockResolvedValue(emptyPaginated());
  doceoMock.getLatestVotes.mockResolvedValue(emptyDoceoResponse);
}

/**
 * Install **hot-path** mocks: substantive synthetic EP + DOCEO data so that
 * tool scoring, classification, and attribution code paths are exercised by
 * the snapshot suite (not just the empty envelope).
 */
export function installHotPathMocks(epMock: EPClientMockSurface, doceoMock: DoceoClientMockSurface): void {
  epMock.getCurrentMEPs.mockResolvedValue(osintPhase6PaginatedMEPs);
  epMock.getMEPDetails.mockImplementation((id: string) => {
    const detail =
      osintPhase6MEPDetails.find(m => m.id === id) ??
      { ...osintPhase6MEPs[0], ...osintPhase6MEPDetails[0], id };
    return Promise.resolve(detail);
  });
  epMock.getVotingRecords.mockResolvedValue(hotPathVotingRecords);
  epMock.getProcedures.mockResolvedValue(hotPathProcedures);
  epMock.getProcedureEvents.mockResolvedValue(hotPathProcedureEvents);
  epMock.getCommitteeInfo.mockResolvedValue(canonicalCommitteeInfo);
  epMock.getCommitteeDocuments.mockResolvedValue(hotPathCommitteeDocuments);
  epMock.getAdoptedTexts.mockResolvedValue(hotPathAdoptedTexts);
  epMock.getPlenarySessions.mockResolvedValue(hotPathPlenarySessions);
  epMock.getMeetingDecisions.mockResolvedValue(hotPathMeetingDecisions);
  epMock.getParliamentaryQuestions.mockResolvedValue(hotPathParliamentaryQuestions);
  epMock.getPlenarySessionDocumentItems.mockResolvedValue(hotPathPlenarySessionDocumentItems);
  doceoMock.getLatestVotes.mockResolvedValue(hotPathDoceoResponse);
}

// ── Per-tool minimal inputs ─────────────────────────────────────────────────
//
// Mirrors `TOOL_INPUTS` in `contract.test.ts`. Centralised here so the
// contract + snapshot suites cannot drift from each other.

/** Minimal valid inputs for every registered OSINT tool. */
export const OSINT_TOOL_INPUTS: Record<string, Record<string, unknown>> = {
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

// ── Snapshot serializer helpers ─────────────────────────────────────────────

/**
 * Volatile keys removed by {@link stripVolatile} before snapshotting.
 *
 * Includes per-run timestamps (`generatedAt`, `analysisTime`, ...), generated
 * correlation/run identifiers, and cache-observability fields that are not
 * stable across runs (`cacheHit`, `dataFreshness` ISO timestamps, the
 * caller-omitted `period.from` / `period.to` that some tools backfill from
 * `Date.now()`).
 *
 * NOTE — `dataFreshness` is included even though `vi.setSystemTime` pins it,
 * because the field's wording embeds a `now-…` delta that is meaningful for
 * the contract test but adds noise to a per-tool golden snapshot.
 */
export const VOLATILE_KEYS = new Set([
  'analysisTime',
  'assessmentTime',
  'generatedAt',
  'timestamp',
  'correlationId',
  'runId',
  'requestId',
  'computedAt',
  'asOf',
  'cacheHit',
  'dataFreshness',
]);

/** Recursive, non-mutating deep copy that drops keys in {@link VOLATILE_KEYS}. */
export function stripVolatile(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripVolatile);
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
 * Stable JSON serializer for snapshot files.
 *
 * Sorts object keys ascending at every depth so spurious diffs from
 * non-deterministic key-insertion order never appear in PRs. Arrays preserve
 * their original element order (OSINT scoring is order-sensitive, e.g.
 * coalition rankings).
 *
 * Output format: 2-space indented JSON with a trailing newline.
 */
export function stableStringify(value: unknown): string {
  return JSON.stringify(sortKeys(value), null, 2) + '\n';
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([k, v]) => [k, sortKeys(v)] as const);
    return Object.fromEntries(entries);
  }
  return value;
}
