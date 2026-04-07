/**
 * Feed Health Tracker Service
 *
 * Tracks the outcome of feed tool invocations to provide
 * cached health status without making upstream API calls.
 *
 * The tracker is a module-level singleton that records success/error
 * outcomes for each feed tool call. The {@link getServerHealth} tool
 * reads from this tracker to report feed availability.
 *
 * ISMS Policy: MO-001 (Monitoring and Alerting), PE-001 (Performance Standards)
 *
 * @module services/FeedHealthTracker
 */

// ── Public types ──────────────────────────────────────────────────

/**
 * Per-feed health status.
 *
 * | Value     | Meaning |
 * |-----------|---------|
 * | `ok`      | Last invocation succeeded |
 * | `error`   | Last invocation failed |
 * | `unknown` | Feed has not been invoked yet |
 */
export interface FeedStatus {
  /** Current feed health verdict */
  status: 'ok' | 'error' | 'unknown';
  /** ISO-8601 timestamp of the last successful invocation */
  lastSuccess?: string;
  /** Error message from the last failed invocation */
  lastError?: string;
  /** ISO-8601 timestamp of the last invocation attempt */
  lastAttempt?: string;
}

/**
 * Overall feed availability level.
 *
 * | Level        | Condition   | Description |
 * |--------------|-------------|-------------|
 * | Full         | ≥10/13 ok   | Normal operation |
 * | Degraded     | 5–9/13 ok   | Reduced data quality expected |
 * | Sparse       | 1–4/13 ok   | Minimal data, analysis-only mode likely |
 * | Unavailable  | 0/13 ok     | No EP feed data available |
 */
export type AvailabilityLevel = 'Full' | 'Degraded' | 'Sparse' | 'Unavailable';

/** Summary of feed availability. */
export interface FeedAvailability {
  operationalFeeds: number;
  totalFeeds: number;
  level: AvailabilityLevel;
}

// ── Constants ─────────────────────────────────────────────────────

/** All tracked feed tool names. */
export const FEED_TOOL_NAMES = [
  'get_meps_feed',
  'get_events_feed',
  'get_procedures_feed',
  'get_adopted_texts_feed',
  'get_mep_declarations_feed',
  'get_documents_feed',
  'get_plenary_documents_feed',
  'get_committee_documents_feed',
  'get_plenary_session_documents_feed',
  'get_external_documents_feed',
  'get_parliamentary_questions_feed',
  'get_corporate_bodies_feed',
  'get_controlled_vocabularies_feed',
] as const;

/** Threshold boundaries for availability levels. */
const FULL_THRESHOLD = 10;
const DEGRADED_THRESHOLD = 5;

// ── FeedHealthTracker implementation ──────────────────────────────

/**
 * Singleton service that records feed tool invocation outcomes
 * and derives per-feed and overall availability health.
 *
 * Does not make network calls — all data comes from tool dispatch hooks.
 */
export class FeedHealthTracker {
  private readonly statuses = new Map<string, FeedStatus>();
  private readonly startTime: number;
  private readonly feedToolSet: ReadonlySet<string>;

  constructor() {
    this.startTime = Date.now();
    this.feedToolSet = new Set<string>(FEED_TOOL_NAMES);
  }

  /** Returns `true` when the tool name identifies a tracked feed tool. */
  isFeedTool(name: string): boolean {
    return this.feedToolSet.has(name);
  }

  /** Record a successful feed invocation. */
  recordSuccess(feedName: string): void {
    const now = new Date().toISOString();
    this.statuses.set(feedName, {
      status: 'ok',
      lastSuccess: now,
      lastAttempt: now,
    });
  }

  /** Record a failed feed invocation, preserving the last success timestamp. */
  recordError(feedName: string, errorMessage: string): void {
    const now = new Date().toISOString();
    const existing = this.statuses.get(feedName);
    const entry: FeedStatus = {
      status: 'error',
      lastError: errorMessage,
      lastAttempt: now,
    };
    if (existing?.lastSuccess !== undefined) {
      entry.lastSuccess = existing.lastSuccess;
    }
    this.statuses.set(feedName, entry);
  }

  /** Get the current status of a single feed (defaults to `unknown`). */
  getStatus(feedName: string): FeedStatus {
    return this.statuses.get(feedName) ?? { status: 'unknown' };
  }

  /** Get the statuses of all tracked feeds keyed by tool name. */
  getAllStatuses(): Record<string, FeedStatus> {
    const result: Record<string, FeedStatus> = {};
    for (const name of FEED_TOOL_NAMES) {
      result[name] = this.getStatus(name);
    }
    return result;
  }

  /** Server uptime in whole seconds since tracker creation. */
  getUptimeSeconds(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /** Derive the overall availability level from current feed statuses. */
  getAvailability(): FeedAvailability {
    let operational = 0;
    for (const name of FEED_TOOL_NAMES) {
      if (this.getStatus(name).status === 'ok') {
        operational++;
      }
    }

    const total = FEED_TOOL_NAMES.length;
    return { operationalFeeds: operational, totalFeeds: total, level: deriveLevel(operational) };
  }

  /**
   * Reset all tracked statuses.
   * Intended for testing only.
   * @internal
   */
  reset(): void {
    this.statuses.clear();
  }
}

// ── Helpers ───────────────────────────────────────────────────────

/** Map operational feed count to an availability level. */
function deriveLevel(operational: number): AvailabilityLevel {
  if (operational >= FULL_THRESHOLD) return 'Full';
  if (operational >= DEGRADED_THRESHOLD) return 'Degraded';
  if (operational >= 1) return 'Sparse';
  return 'Unavailable';
}

// ── Module-level singleton ────────────────────────────────────────

/** Global feed health tracker instance used by tool dispatch and the health tool. */
export const feedHealthTracker = new FeedHealthTracker();
