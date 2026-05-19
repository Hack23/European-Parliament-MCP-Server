/**
 * MCP Tool: analyze_committee_activity
 *
 * Analyze committee workload and member engagement for EP committees
 * using real data from the European Parliament Open Data Portal.
 *
 * **Intelligence Perspective:** Committee activity analysis reveals institutional
 * priorities, resource allocation patterns, and policy domain intensity—essential
 * for understanding where legislative power concentrates.
 *
 * **Business Perspective:** Committee monitoring enables enterprise government affairs
 * teams to track policy areas relevant to their industry with precision.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege), AU-002 (Audit Logging)
 */

import { z } from 'zod';
import { epClient } from '../clients/europeanParliamentClient.js';
import { auditLogger, toErrorMessage } from '../utils/auditLogger.js';
import { withTimeoutAndAbort, TimeoutError } from '../utils/timeout.js';
import type { ToolResult } from './shared/types.js';
import type { LegislativeDocument } from '../types/ep/document.js';
import type { Procedure } from '../types/ep/activities.js';
import type { PlenarySession } from '../types/ep/plenary.js';
import type { PaginatedResponse } from '../types/ep/common.js';

/**
 * Schema for analyze_committee_activity tool input
 */
export const AnalyzeCommitteeActivitySchema = z.object({
  committeeId: z.string()
    .min(1)
    .max(100)
    .describe('Committee identifier or abbreviation (e.g., "ENVI", "ITRE")'),
  dateFrom: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .describe('Start date for analysis period'),
  dateTo: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .describe('End date for analysis period'),
});

/**
 * Per-source data availability status.
 *
 * - `OK`: fetched and at least one item matched the committee/date filter.
 * - `EMPTY`: fetched successfully but no items matched.
 * - `TIMEOUT`: per-source 5s budget expired; data not populated.
 * - `UNAVAILABLE`: EP API returned an error.
 */
export type DataSourceStatus = 'OK' | 'EMPTY' | 'TIMEOUT' | 'UNAVAILABLE';

interface DataSources {
  documents: DataSourceStatus;
  procedures: DataSourceStatus;
  meetings: DataSourceStatus;
  decisions: DataSourceStatus;
}

/**
 * Committee activity analysis result
 */
interface CommitteeActivityAnalysis {
  committeeId: string;
  committeeName: string;
  period: { from: string; to: string };
  workload: {
    activeLegislativeFiles: number;
    documentsProduced: number;
    meetingsHeld: number;
    decisionsAdopted: number;
    opinionsIssued: number;
  };
  memberEngagement: {
    totalMembers: number;
    averageAttendance: number;
    activeContributors: number;
  };
  legislativeOutput: {
    reportsAdopted: number;
    amendmentsProcessed: number;
    successRate: number;
  };
  derivedMetrics: {
    decisionsPerMeeting: number;
    documentsPerMonth: number;
    activeFilesPerMember: number;
  };
  computedAttributes: {
    workloadIntensity: string;
    productivityScore: number;
    engagementLevel: string;
    policyImpactRating: string;
  };
  dataSources: DataSources;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  dataFreshness: string;
  sourceAttribution: string;
  methodology: string;
  dataQualityWarnings: string[];
  cacheHit?: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Per-source timeout budget (issue: 5 s each). */
const SOURCE_TIMEOUT_MS = 5_000;
/** Page size used when fanning out per-committee filters client-side. */
const FETCH_PAGE_LIMIT = 200;
/** Max number of meetings to fan out for decisions to keep within rate budget. */
const MAX_MEETINGS_FOR_DECISIONS = 8;
/** 10-minute in-memory cache TTL per (committeeId, dateFrom, dateTo). */
const CACHE_TTL_MS = 10 * 60 * 1000;
/** Cache size cap to bound memory usage. */
const MAX_CACHE_ENTRIES = 200;

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

interface CacheEntry {
  expiresAt: number;
  value: CommitteeActivityAnalysis;
}

const analysisCache = new Map<string, CacheEntry>();

function makeCacheKey(committeeId: string, dateFrom: string, dateTo: string): string {
  return `${committeeId.toUpperCase()}|${dateFrom}|${dateTo}`;
}

function readCache(key: string): CommitteeActivityAnalysis | undefined {
  const entry = analysisCache.get(key);
  if (entry === undefined) return undefined;
  if (entry.expiresAt <= Date.now()) {
    analysisCache.delete(key);
    return undefined;
  }
  return { ...entry.value, cacheHit: true };
}

function writeCache(key: string, value: CommitteeActivityAnalysis): void {
  if (analysisCache.size >= MAX_CACHE_ENTRIES) {
    // FIFO eviction: Map iteration order is insertion order in JS, so the
    // first key is the oldest insertion. Sufficient for a small bounded
    // analysis cache; full LRU is not warranted at this scale.
    const firstKey = analysisCache.keys().next().value;
    if (firstKey !== undefined) analysisCache.delete(firstKey);
  }
  analysisCache.set(key, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    value: { ...value, cacheHit: false },
  });
}

/**
 * Clear the analyze_committee_activity cache (test-only helper).
 *
 * @internal
 */
export function clearAnalyzeCommitteeActivityCache(): void {
  analysisCache.clear();
}

// ---------------------------------------------------------------------------
// Filter helpers
// ---------------------------------------------------------------------------

/**
 * Tolerant committee match.
 *
 * EP API mixes representations: documents use `committee: "COMM-ENVI"`,
 * procedures use `responsibleCommittee: "ENVI"`, and some payloads use the
 * raw URI suffix. We accept any of: exact match, substring match in either
 * direction (case-insensitive), or the canonical `COMM-{abbrev}` form.
 */
function matchesCommittee(value: string | undefined | null, committeeId: string): boolean {
  if (value === undefined || value === null || value === '') return false;
  const v = value.toUpperCase();
  const id = committeeId.toUpperCase();
  if (v === id) return true;
  if (v === `COMM-${id}`) return true;
  if (v.includes(id)) return true;
  if (id.includes(v) && v.length >= 3) return true;
  return false;
}

/**
 * Inclusive ISO-date range check. Returns `false` for missing/invalid dates so
 * callers can treat unknown dates as out-of-window.
 */
function isWithinDateWindow(date: string | undefined | null, dateFrom: string, dateTo: string): boolean {
  if (date === undefined || date === null || date === '') return false;
  const d = date.length >= 10 ? date.slice(0, 10) : date;
  return d >= dateFrom && d <= dateTo;
}

/** Procedure statuses interpreted as "ongoing" (case-insensitive substring). */
const ONGOING_PROCEDURE_STATUSES = ['ongoing', 'open', 'in progress', 'awaiting', 'pending'];

function isOngoingProcedure(status: string | undefined | null): boolean {
  // Unknown/missing status defaults to ongoing rather than filtered out:
  // EP procedure payloads sometimes omit status, and dropping silently would
  // under-count active legislative files for committees.
  if (status === undefined || status === null || status === '') return true;
  const s = status.toLowerCase();
  return ONGOING_PROCEDURE_STATUSES.some((token) => s.includes(token));
}

// ---------------------------------------------------------------------------
// Source result modelling
// ---------------------------------------------------------------------------

interface SourceFetchResult<T> {
  status: DataSourceStatus;
  count: number;
  items: T[];
  error?: string;
}

/**
 * Run a per-source fetch under a 5 s budget, mapping outcomes into a
 * `DataSourceStatus`. Per-source failures never bubble — callers see a
 * structured envelope so unrelated sources continue to populate values.
 */
async function runSource<T>(
  source: keyof DataSources,
  fetcher: (signal: AbortSignal) => Promise<T[]>,
): Promise<SourceFetchResult<T>> {
  const startedAt = Date.now();
  try {
    const items = await withTimeoutAndAbort(
      fetcher,
      SOURCE_TIMEOUT_MS,
      `analyze_committee_activity:${source} timed out after ${String(SOURCE_TIMEOUT_MS)}ms`,
    );
    const count = items.length;
    auditLogger.logDataAccess(
      `analyze_committee_activity.${source}`,
      { source, truncated: count > 1000 ? '1000+' : count },
      count,
      Date.now() - startedAt,
    );
    return {
      status: count > 0 ? 'OK' : 'EMPTY',
      count,
      items,
    };
  } catch (error: unknown) {
    const message = toErrorMessage(error);
    const isTimeout = error instanceof TimeoutError;
    auditLogger.logError(
      `analyze_committee_activity.${source}`,
      { source, timedOut: isTimeout },
      message,
      Date.now() - startedAt,
    );
    return {
      status: isTimeout ? 'TIMEOUT' : 'UNAVAILABLE',
      count: 0,
      items: [],
      error: message,
    };
  }
}

// ---------------------------------------------------------------------------
// Per-source fetchers
// ---------------------------------------------------------------------------

async function fetchDocumentsForCommittee(
  committeeId: string,
  dateFrom: string,
  dateTo: string,
): Promise<SourceFetchResult<LegislativeDocument>> {
  return runSource<LegislativeDocument>('documents', async () => {
    const response: PaginatedResponse<LegislativeDocument> = await epClient.getCommitteeDocuments({
      limit: FETCH_PAGE_LIMIT,
    });
    const items = Array.isArray(response.data) ? response.data : [];
    return items.filter((doc) =>
      matchesCommittee(doc.committee, committeeId)
      && isWithinDateWindow(doc.date, dateFrom, dateTo),
    );
  });
}

async function fetchActiveProceduresForCommittee(
  committeeId: string,
  dateFrom: string,
  dateTo: string,
): Promise<SourceFetchResult<Procedure>> {
  return runSource<Procedure>('procedures', async () => {
    const response: PaginatedResponse<Procedure> = await epClient.getProcedures({
      limit: FETCH_PAGE_LIMIT,
    });
    const items = Array.isArray(response.data) ? response.data : [];
    return items.filter((proc) =>
      matchesCommittee(proc.responsibleCommittee, committeeId)
      && isOngoingProcedure(proc.status)
      && (isWithinDateWindow(proc.dateLastActivity, dateFrom, dateTo)
        || isWithinDateWindow(proc.dateInitiated, dateFrom, dateTo)),
    );
  });
}

async function fetchMeetingsInWindow(
  dateFrom: string,
  dateTo: string,
): Promise<SourceFetchResult<PlenarySession>> {
  return runSource<PlenarySession>('meetings', async () => {
    const response: PaginatedResponse<PlenarySession> = await epClient.getPlenarySessions({
      dateFrom,
      dateTo,
      limit: 100,
    });
    const items = Array.isArray(response.data) ? response.data : [];
    return items.filter((s) => isWithinDateWindow(s.date, dateFrom, dateTo));
  });
}

/**
 * Fan-out helper: aggregate decisions across up to {@link MAX_MEETINGS_FOR_DECISIONS}
 * sittings, filtering by the requested committee where the response carries
 * committee metadata. Runs under the same 5 s budget.
 */
async function fetchDecisionsForCommittee(
  committeeId: string,
  meetings: PlenarySession[],
): Promise<SourceFetchResult<LegislativeDocument>> {
  return runSource<LegislativeDocument>('decisions', async (signal) => {
    if (meetings.length === 0) return [];
    const targetMeetings = meetings.slice(0, MAX_MEETINGS_FOR_DECISIONS);
    const settled = await Promise.allSettled(
      targetMeetings.map(async (meeting): Promise<LegislativeDocument[]> => {
        if (signal.aborted) return [];
        const resp = await epClient.getMeetingDecisions(meeting.id, { limit: 100 });
        const decisions = Array.isArray(resp.data) ? resp.data : [];
        // Filter by committee when the decision payload carries that metadata;
        // otherwise (most plenary decisions are EP-wide) keep all and rely on
        // the meeting-level window filter that already applied upstream.
        return decisions.filter((d) => {
          if (d.committee === undefined || d.committee === '') return true;
          return matchesCommittee(d.committee, committeeId);
        });
      }),
    );
    const out: LegislativeDocument[] = [];
    for (const r of settled) {
      if (r.status === 'fulfilled') out.push(...r.value);
    }
    return out;
  });
}

// ---------------------------------------------------------------------------
// Legacy aggregations retained for backward compatibility
// ---------------------------------------------------------------------------

/**
 * Legacy `reportsAdopted` proxy via `/adopted-texts` (parliament-wide).
 *
 * Kept for compatibility with downstream consumers that read
 * `legislativeOutput.reportsAdopted`; the new committee-scoped signal lives
 * in `workload.decisionsAdopted`.
 */
async function fetchReportsAdoptedProxy(dateFrom: string): Promise<{ count: number; status: DataSourceStatus }> {
  const startedAt = Date.now();
  try {
    const year = parseInt(dateFrom.substring(0, 4), 10);
    const resp = await withTimeoutAndAbort(
      () => epClient.getAdoptedTexts({ year, limit: 100 }),
      SOURCE_TIMEOUT_MS,
      'analyze_committee_activity:reports_adopted timed out',
    );
    const count = Array.isArray(resp.data) ? resp.data.length : 0;
    auditLogger.logDataAccess(
      'analyze_committee_activity.reports_adopted_proxy',
      { year },
      count,
      Date.now() - startedAt,
    );
    return { count, status: count > 0 ? 'OK' : 'EMPTY' };
  } catch (error: unknown) {
    const message = toErrorMessage(error);
    const isTimeout = error instanceof TimeoutError;
    auditLogger.logError(
      'analyze_committee_activity.reports_adopted_proxy',
      { timedOut: isTimeout },
      message,
      Date.now() - startedAt,
    );
    return { count: 0, status: isTimeout ? 'TIMEOUT' : 'UNAVAILABLE' };
  }
}

// ---------------------------------------------------------------------------
// Derived attributes
// ---------------------------------------------------------------------------

/**
 * Compute workload intensity from metrics.
 */
function computeWorkloadIntensity(activeLegFiles: number, meetings: number): string {
  const combined = activeLegFiles + meetings;
  if (combined > 100) return 'VERY_HIGH';
  if (combined > 60) return 'HIGH';
  if (combined > 30) return 'MODERATE';
  return 'LOW';
}

/**
 * Compute engagement level from attendance.
 */
function computeEngagementLevel(avgAttendance: number): string {
  if (avgAttendance >= 80) return 'HIGH';
  if (avgAttendance >= 60) return 'MODERATE';
  return 'LOW';
}

/**
 * Compute policy impact rating from output and success rate.
 */
function computePolicyImpactRating(reportsAdopted: number, successRate: number): string {
  const impactScore = reportsAdopted * successRate;
  if (impactScore > 15) return 'HIGH';
  if (impactScore > 5) return 'MEDIUM';
  return 'LOW';
}

/**
 * Round to two decimals.
 */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Compute the approximate inclusive month span between two ISO dates,
 * using a 30-day month approximation. Clamped to >= 1 to avoid division
 * by zero in derived per-month metrics. Sufficient for window-length
 * normalisation; not used where calendar accuracy is required.
 */
function monthsBetween(dateFrom: string, dateTo: string): number {
  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 1;
  const ms = Math.max(0, to.getTime() - from.getTime());
  const days = ms / (1000 * 60 * 60 * 24);
  return Math.max(1, days / 30);
}

// ---------------------------------------------------------------------------
// Default date window
// ---------------------------------------------------------------------------

/**
 * Default date window: trailing 6 months ending today (issue requirement).
 */
function resolveDateWindow(
  dateFrom: string | undefined,
  dateTo: string | undefined,
): { dateFrom: string; dateTo: string } {
  const now = new Date();
  const resolvedTo = dateTo ?? (now.toISOString().split('T')[0] ?? '');
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  const resolvedFrom = dateFrom ?? (sixMonthsAgo.toISOString().split('T')[0] ?? '');
  return { dateFrom: resolvedFrom, dateTo: resolvedTo };
}

// ---------------------------------------------------------------------------
// Analysis builder
// ---------------------------------------------------------------------------

interface SourceCounts {
  documents: SourceFetchResult<LegislativeDocument>;
  procedures: SourceFetchResult<Procedure>;
  meetings: SourceFetchResult<PlenarySession>;
  decisions: SourceFetchResult<LegislativeDocument>;
  reportsAdoptedCount: number;
  reportsAdoptedStatus: DataSourceStatus;
}

/**
 * Fan out all four EP sources in parallel via `Promise.allSettled` and a
 * legacy `reportsAdopted` proxy. Per-source timeouts are independent so a
 * single slow endpoint cannot starve the others.
 *
 * The `decisions` fan-out depends on the meetings result (it needs sitting
 * IDs); it still runs under its own 5 s budget once meetings settle, so the
 * overall worst case is ~10 s rather than 4×5 s.
 */
async function fetchAllSources(
  committeeId: string,
  dateFrom: string,
  dateTo: string,
): Promise<SourceCounts> {
  const [documents, procedures, meetings, reportsAdopted] = await Promise.all([
    fetchDocumentsForCommittee(committeeId, dateFrom, dateTo),
    fetchActiveProceduresForCommittee(committeeId, dateFrom, dateTo),
    fetchMeetingsInWindow(dateFrom, dateTo),
    fetchReportsAdoptedProxy(dateFrom),
  ]);

  // Decisions fan out from the meetings result. If meetings is unavailable,
  // surface a matching status without spending the budget.
  let decisions: SourceFetchResult<LegislativeDocument>;
  if (meetings.status === 'OK') {
    decisions = await fetchDecisionsForCommittee(committeeId, meetings.items);
  } else {
    decisions = {
      status: meetings.status === 'EMPTY' ? 'EMPTY' : meetings.status,
      count: 0,
      items: [],
    };
  }

  return {
    documents,
    procedures,
    meetings,
    decisions,
    reportsAdoptedCount: reportsAdopted.count,
    reportsAdoptedStatus: reportsAdopted.status,
  };
}

/**
 * Translate per-source status flags into human-readable warnings for the
 * `dataQualityWarnings` envelope.
 */
function buildQualityWarnings(sources: SourceCounts): string[] {
  const warnings: string[] = [];
  const sourceLabels: Record<keyof DataSources, string> = {
    documents: 'committee documents',
    procedures: 'procedures',
    meetings: 'plenary meetings',
    decisions: 'meeting decisions',
  };
  for (const key of ['documents', 'procedures', 'meetings', 'decisions'] as const) {
    const status = sources[key].status;
    if (status === 'TIMEOUT') {
      warnings.push(`${sourceLabels[key]} fetch timed out after ${String(SOURCE_TIMEOUT_MS)}ms — value reported as zero`);
    } else if (status === 'UNAVAILABLE') {
      warnings.push(`${sourceLabels[key]} unavailable from EP API — value reported as zero`);
    } else if (status === 'EMPTY') {
      warnings.push(`${sourceLabels[key]} returned no items matching committee or date window`);
    }
  }
  warnings.push('Meeting attendance and amendment counts are not exposed by the EP API and remain zero.');
  return warnings;
}

/**
 * Aggregate raw counts from settled sources into derived workload metrics.
 */
function aggregateCounts(sources: SourceCounts, memberCount: number, dateFrom: string, dateTo: string): {
  documentsProduced: number;
  activeLegFiles: number;
  meetingsHeld: number;
  decisionsAdopted: number;
  reportsAdopted: number;
  successRate: number;
  productivityScore: number;
  derivedMetrics: { decisionsPerMeeting: number; documentsPerMonth: number; activeFilesPerMember: number };
} {
  const documentsProduced = sources.documents.count;
  const activeLegFiles = sources.procedures.count;
  const meetingsHeld = sources.meetings.count;
  const decisionsAdopted = sources.decisions.count;
  const reportsAdopted = sources.reportsAdoptedCount;

  const successRate = activeLegFiles > 0 && reportsAdopted > 0
    ? Math.min(1, reportsAdopted / activeLegFiles)
    : 0;
  const productivityScore = activeLegFiles > 0
    ? Math.round((reportsAdopted / activeLegFiles) * 100)
    : 0;
  const months = monthsBetween(dateFrom, dateTo);

  return {
    documentsProduced,
    activeLegFiles,
    meetingsHeld,
    decisionsAdopted,
    reportsAdopted,
    successRate,
    productivityScore,
    derivedMetrics: {
      decisionsPerMeeting: meetingsHeld > 0 ? round2(decisionsAdopted / meetingsHeld) : 0,
      documentsPerMonth: round2(documentsProduced / months),
      activeFilesPerMember: memberCount > 0 ? round2(activeLegFiles / memberCount) : 0,
    },
  };
}

/**
 * Derive the overall confidence level from source statuses and aggregate
 * data presence.
 */
function deriveConfidenceLevel(
  dataSources: DataSources,
  hasRealData: boolean,
): 'HIGH' | 'MEDIUM' | 'LOW' {
  const okSources = (Object.values(dataSources) as DataSourceStatus[])
    .filter((s) => s === 'OK').length;
  if (okSources >= 3) return 'HIGH';
  if (hasRealData) return 'MEDIUM';
  return 'LOW';
}

/**
 * Build committee activity analysis from real EP data using a resilient
 * fan-out across documents, procedures, meetings, and decisions sources.
 */
async function buildAnalysis(
  committeeId: string,
  dateFrom: string,
  dateTo: string,
): Promise<CommitteeActivityAnalysis> {
  const committeeData = await epClient.getCommitteeInfo({ abbreviation: committeeId });
  const memberCount = Array.isArray(committeeData.members) ? committeeData.members.length : 0;

  const sources = await fetchAllSources(committeeId, dateFrom, dateTo);
  const agg = aggregateCounts(sources, memberCount, dateFrom, dateTo);

  const dataSources: DataSources = {
    documents: sources.documents.status,
    procedures: sources.procedures.status,
    meetings: sources.meetings.status,
    decisions: sources.decisions.status,
  };
  const hasRealData = agg.documentsProduced > 0 || agg.activeLegFiles > 0
    || agg.meetingsHeld > 0 || agg.decisionsAdopted > 0 || agg.reportsAdopted > 0;
  const confidenceLevel = deriveConfidenceLevel(dataSources, hasRealData);

  return {
    committeeId,
    committeeName: committeeData.name,
    period: { from: dateFrom, to: dateTo },
    workload: {
      activeLegislativeFiles: agg.activeLegFiles,
      documentsProduced: agg.documentsProduced,
      meetingsHeld: agg.meetingsHeld,
      decisionsAdopted: agg.decisionsAdopted,
      opinionsIssued: 0,
    },
    memberEngagement: {
      totalMembers: memberCount,
      averageAttendance: 0,
      activeContributors: 0,
    },
    legislativeOutput: {
      reportsAdopted: agg.reportsAdopted,
      amendmentsProcessed: 0,
      successRate: round2(agg.successRate),
    },
    derivedMetrics: agg.derivedMetrics,
    computedAttributes: {
      workloadIntensity: computeWorkloadIntensity(agg.activeLegFiles, agg.meetingsHeld),
      productivityScore: agg.productivityScore,
      engagementLevel: computeEngagementLevel(0),
      policyImpactRating: computePolicyImpactRating(agg.reportsAdopted, agg.successRate),
    },
    dataSources,
    confidenceLevel,
    dataFreshness: 'Real-time EP API data — committee documents, procedures, meetings, and decisions',
    sourceAttribution: 'European Parliament Open Data Portal - data.europarl.europa.eu',
    methodology: 'Committee activity analysis using real data from the EP Open Data Portal. '
      + 'Four sources fan out in parallel under a 5s per-source timeout (Promise.allSettled): '
      + '/committee-documents (filtered client-side by committee + date), '
      + '/procedures (filtered by responsibleCommittee + ongoing status + date), '
      + '/meetings (filtered by date window), and '
      + '/meetings/{id}/decisions (fan-out across the meetings settled above, capped at '
      + `${String(MAX_MEETINGS_FOR_DECISIONS)} sittings to honour the per-process rate-limit budget). `
      + 'Each field is tagged with a per-source data-availability status so downstream tools can '
      + 'branch on real coverage. Committee membership comes from /corporate-bodies; '
      + 'legislativeOutput.reportsAdopted is a parliament-wide /adopted-texts proxy retained for '
      + 'backward compatibility (not committee-filtered). Member attendance and amendment counts '
      + 'are not exposed by the EP API and remain zero. '
      + 'Data source: European Parliament Open Data Portal.',
    dataQualityWarnings: buildQualityWarnings(sources),
  };
}

// ---------------------------------------------------------------------------
// Public handler
// ---------------------------------------------------------------------------

/**
 * Handles the analyze_committee_activity MCP tool request.
 *
 * Analyses an EP committee's workload, meeting frequency, document production,
 * member engagement, and legislative output over a given period using real
 * data from the European Parliament Open Data Portal. Provides computed
 * attributes including workload intensity, productivity score, engagement
 * level, policy impact rating, and per-source data-availability tags.
 *
 * @param args - Raw tool arguments, validated against {@link AnalyzeCommitteeActivitySchema}
 * @returns MCP tool result containing a {@link CommitteeActivityAnalysis}
 * @throws If `args` fails schema validation or the committee lookup fails.
 *
 * @example
 * ```typescript
 * const result = await handleAnalyzeCommitteeActivity({
 *   committeeId: 'ENVI',
 *   dateFrom: '2024-01-01',
 *   dateTo: '2024-06-30'
 * });
 * ```
 *
 * @security Input is validated with Zod before any API call. All sub-fetches
 *   are audit-logged with truncated counts (ISMS AU-002). Per-source 5 s
 *   timeouts use AbortController to prevent dangling fetch connections.
 *
 * @performance Warm cache: <200 ms. Cold: ~5–10 s (per-source 5 s budgets).
 *
 * @since 0.8.0
 * @see {@link analyzeCommitteeActivityToolMetadata}
 */
export async function handleAnalyzeCommitteeActivity(
  args: unknown,
): Promise<ToolResult> {
  const params = AnalyzeCommitteeActivitySchema.parse(args);
  const { dateFrom, dateTo } = resolveDateWindow(params.dateFrom, params.dateTo);
  const cacheKey = makeCacheKey(params.committeeId, dateFrom, dateTo);

  const cached = readCache(cacheKey);
  if (cached !== undefined) {
    return {
      content: [{ type: 'text', text: JSON.stringify(cached, null, 2) }],
    };
  }

  const analysis = await buildAnalysis(params.committeeId, dateFrom, dateTo);
  writeCache(cacheKey, analysis);

  return {
    content: [
      { type: 'text', text: JSON.stringify({ ...analysis, cacheHit: false }, null, 2) },
    ],
  };
}

/**
 * Tool metadata for MCP listing
 */
export const analyzeCommitteeActivityToolMetadata = {
  name: 'analyze_committee_activity',
  description: 'Analyze European Parliament committee workload, meeting frequency, document production, decisions adopted, legislative output, and member engagement. Fans out four EP sources in parallel with per-source timeouts and reports data availability per source.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      committeeId: {
        type: 'string',
        description: 'Committee identifier or abbreviation (e.g., "ENVI", "ITRE")',
      },
      dateFrom: {
        type: 'string',
        description: 'Start date (YYYY-MM-DD). Defaults to trailing 6 months.',
      },
      dateTo: {
        type: 'string',
        description: 'End date (YYYY-MM-DD). Defaults to today.',
      },
    },
    required: ['committeeId'],
  },
};
