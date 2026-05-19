/**
 * @fileoverview Per-MEP voting baseline computation for anomaly detection.
 *
 * Provides primitives for the `detect_voting_anomalies` MCP tool:
 *
 * - {@link resolveGroupMajority} — DOCEO group-breakdown → plurality position
 *   (FOR/AGAINST/ABSTAIN) with deterministic alphabetical tie-breaking.
 * - {@link classifyMepVote} — for a given MEP and a single
 *   {@link LatestVoteRecord}, returns whether the MEP was `aligned` with their
 *   home group's majority, `defected`, `abstained`, or was `absent`, plus the
 *   list of *other* groups whose majority matched the MEP's position (used to
 *   detect cross-party alignment shifts).
 * - {@link bucketByWeek} — groups classified votes into ISO-week buckets and
 *   computes per-week defection / abstention rates.
 * - {@link computeBaseline} / {@link zScore} — running mean & standard
 *   deviation of weekly rates and per-week z-score.
 * - {@link findOutlierWeeks} — collects weeks whose rate has a z-score
 *   ≥ a configurable threshold (default 1.5 per issue spec).
 * - {@link findWoWShifts} — collects consecutive-week pairs whose defection
 *   rate jumped by ≥ a configurable threshold (default 20 percentage points).
 * - {@link findCrossPartyAlignmentWindows} — sub-windows where the MEP voted
 *   with *non-home* group majorities on ≥ a configurable share (default 60%)
 *   of decisive RCVs.
 *
 * All helpers are pure and deterministic so they can be exercised with
 * synthetic fixtures and the golden-snapshot suite referenced in the
 * `detect_voting_anomalies` issue.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege),
 *   AU-002 (Audit Logging). GDPR Article 5(1)(d) — accuracy.
 *
 * @module utils/votingBaseline
 * @since 1.4.0
 */

import type { LatestVoteRecord } from '../clients/ep/doceoXmlParser.js';
import { normalizePoliticalGroup } from './politicalGroupNormalization.js';

/** Per-vote MEP alignment classification relative to their home political group. */
export type Alignment = 'aligned' | 'defected' | 'abstained' | 'absent';

/** Per-vote position recorded for an MEP or as a group majority. */
export type VotePosition = 'FOR' | 'AGAINST' | 'ABSTAIN';

/** Default z-score cutoff for outlier-week detection. */
export const DEFAULT_Z_SCORE_THRESHOLD = 1.5;

/** Default week-over-week change (percentage points) flagging a shift. */
export const DEFAULT_WOW_THRESHOLD_PP = 20;

/** Default share of decisive votes with non-home-group majorities flagging a cross-party shift. */
export const DEFAULT_CROSS_PARTY_SHARE = 0.6;

/** Minimum sub-window decisive-vote count before evaluating cross-party share. */
export const MIN_SUBWINDOW_DECISIVE_VOTES = 3;

/**
 * Single MEP/RCV-vote classification.
 */
export interface ClassifiedVote {
  /**
   * DOCEO unique vote identifier (`LatestVoteRecord.id` —
   * e.g. `"RCV-10-2026-01-15-001"`). Used to populate
   * {@link VotingAnomaly.evidenceVoteIds}.
   */
  voteId: string;
  /** Sitting date in YYYY-MM-DD (falls back to `vote.date` when sittingDate is absent). */
  sittingDate: string;
  /** Alignment of the MEP's position with their home-group majority. */
  alignment: Alignment;
  /** Plurality position of the MEP's home group on this RCV. `null` when undeterminable. */
  groupMajority: VotePosition | null;
  /** Position cast by the MEP (`null` when absent). */
  mepPosition: VotePosition | null;
  /**
   * Canonical short codes of *other* groups whose majority matched the MEP's
   * position on this RCV (excludes the MEP's home group). Empty when the MEP
   * was absent or abstained, or when no other group had a determinable
   * majority matching their position.
   */
  matchingOtherGroups: string[];
}

/**
 * Per-week aggregate built by {@link bucketByWeek}.
 */
export interface WeekBucket {
  /** ISO week start (Monday) in YYYY-MM-DD format. */
  weekStart: string;
  /** Number of votes (decisive + abstentions, excludes absences). */
  voted: number;
  /** Number of decisive votes (FOR/AGAINST, excludes abstentions). */
  decisive: number;
  /** Decisive votes where the MEP defected from the home-group majority. */
  defections: number;
  /** Votes where the MEP abstained. */
  abstentions: number;
  /**
   * Decisive defections where the MEP's position *also* matched at least one
   * non-home group's plurality majority — i.e. a true cross-party signal.
   *
   * This count is intentionally narrower than "any decisive vote matching a
   * non-home majority": when the MEP aligns with their home group, matching
   * other groups voting the same way reflects consensus, not cross-party
   * realignment. Only counted when the MEP both broke from home AND moved
   * toward another bloc.
   */
  crossPartyAlignments: number;
  /** DOCEO vote IDs in this bucket (preserving DOCEO order). */
  voteIds: string[];
  /** Defection rate as a percentage of decisive votes, 0 when `decisive === 0`. */
  defectionRate: number;
  /** Abstention rate as a percentage of voted (decisive + abstain), 0 when `voted === 0`. */
  abstentionRate: number;
}

/** Baseline summary statistics for a series of per-week rates. */
export interface BaselineSummary {
  mean: number;
  /** Sample standard deviation (`ddof=1`). 0 when fewer than two data points. */
  stdev: number;
}

/** Resolved outlier week from {@link findOutlierWeeks}. */
export interface OutlierWeek {
  weekStart: string;
  value: number;
  z: number;
  /** Baseline mean rate across all weeks (the "expected" value). */
  baselineMean: number;
  voteIds: string[];
}

/** Resolved week-over-week jump from {@link findWoWShifts}. */
export interface WoWShift {
  fromWeek: string;
  toWeek: string;
  delta: number;
  /** Previous week's defection rate (the "expected" value before the shift). */
  previousRate: number;
  voteIds: string[];
}

/** Resolved cross-party-alignment sub-window from {@link findCrossPartyAlignmentWindows}. */
export interface CrossPartyWindow {
  weekStart: string;
  /**
   * Share of decisive RCVs in this window where the MEP defected toward a
   * non-home group's majority, expressed as a **percentage** (0–100).
   * The input `share` threshold is a fraction (0–1); the returned value
   * is rounded to two decimals.
   */
  sharePercent: number;
  decisive: number;
  voteIds: string[];
}

/**
 * Resolve the plurality position of a group-breakdown row.
 *
 * Ties are broken alphabetically (ABSTAIN < AGAINST < FOR) so the result is
 * deterministic and fixture-stable.
 *
 * @param row - DOCEO group-breakdown counts. `undefined` for groups absent
 *   from the vote.
 * @returns Plurality position or `null` when the row is missing or all zero.
 */
export function resolveGroupMajority(
  row: { for: number; against: number; abstain: number } | undefined
): VotePosition | null {
  if (row === undefined) return null;
  const { for: f, against: a, abstain: ab } = row;
  if (f <= 0 && a <= 0 && ab <= 0) return null;
  const ranked: [VotePosition, number][] = [
    ['ABSTAIN', ab],
    ['AGAINST', a],
    ['FOR', f],
  ];
  ranked.sort((x, y) => {
    if (y[1] !== x[1]) return y[1] - x[1];
    return x[0].localeCompare(y[0]);
  });
  return ranked[0]?.[0] ?? null;
}

/**
 * Resolve the breakdown row for a normalized group label, handling the case
 * where DOCEO XML uses raw short labels (e.g. `RE`, `Verts/ALE`) while
 * `normalizedGroup` is the canonical EP code (`Renew`, `Greens/EFA`).
 *
 * @internal Exported for testing.
 */
export function resolveGroupBreakdownRow(
  breakdown: Record<string, { for: number; against: number; abstain: number }> | undefined,
  normalizedGroup: string
): { for: number; against: number; abstain: number } | undefined {
  if (breakdown === undefined) return undefined;
  if (normalizedGroup in breakdown) return breakdown[normalizedGroup];
  for (const [rawKey, row] of Object.entries(breakdown)) {
    if (normalizePoliticalGroup(rawKey) === normalizedGroup) return row;
  }
  return undefined;
}

/**
 * Resolve the MEP's home-group majority on a vote.
 *
 * @internal
 */
function resolveHomeMajority(
  vote: LatestVoteRecord,
  homeGroup: string | null
): VotePosition | null {
  if (homeGroup === null) return null;
  return resolveGroupMajority(resolveGroupBreakdownRow(vote.groupBreakdown, homeGroup));
}

/**
 * Compute the set of non-home groups whose majority matched the MEP's
 * decisive position. Returns canonical short codes, alphabetically sorted.
 *
 * @internal
 */
function collectMatchingOtherGroups(
  vote: LatestVoteRecord,
  homeGroup: string | null,
  mepPosition: VotePosition
): string[] {
  if (vote.groupBreakdown === undefined) return [];
  const matching: string[] = [];
  for (const [rawKey, row] of Object.entries(vote.groupBreakdown)) {
    const canonical = normalizePoliticalGroup(rawKey);
    if (homeGroup !== null && canonical === homeGroup) continue;
    const majority = resolveGroupMajority(row);
    if (majority !== null && majority === mepPosition) matching.push(canonical);
  }
  matching.sort((a, b) => a.localeCompare(b));
  return matching;
}

/**
 * Decide alignment between an MEP's decisive position and their home-group
 * majority. When the majority is unknown the result is `aligned` (the
 * conservative choice — we never report a defection without evidence).
 *
 * @internal
 */
function alignmentForDecisive(
  groupMajority: VotePosition | null,
  mepPosition: VotePosition
): Alignment {
  if (groupMajority === null) return 'aligned';
  return groupMajority === mepPosition ? 'aligned' : 'defected';
}

/**
 * Classify an MEP's vote against their home group's majority on a single RCV.
 *
 * @param vote - DOCEO {@link LatestVoteRecord}.
 * @param mepId - EP MEP identifier (e.g. `"197558"`).
 * @param homeGroup - The MEP's canonical home group (e.g. `"EPP"`); when
 *   `null` (group unresolved) the alignment is reported but no defection
 *   classification is attempted.
 * @returns Per-vote classification.
 */
export function classifyMepVote(
  vote: LatestVoteRecord,
  mepId: string,
  homeGroup: string | null
): ClassifiedVote {
  const sittingDate = vote.sittingDate ?? vote.date;
  const mepPosition = vote.mepVotes?.[mepId];
  if (mepPosition === undefined) {
    return {
      voteId: vote.id, sittingDate, alignment: 'absent',
      groupMajority: null, mepPosition: null, matchingOtherGroups: [],
    };
  }
  const groupMajority = resolveHomeMajority(vote, homeGroup);
  if (mepPosition === 'ABSTAIN') {
    return {
      voteId: vote.id, sittingDate, alignment: 'abstained',
      groupMajority, mepPosition, matchingOtherGroups: [],
    };
  }
  return {
    voteId: vote.id,
    sittingDate,
    alignment: alignmentForDecisive(groupMajority, mepPosition),
    groupMajority,
    mepPosition,
    matchingOtherGroups: collectMatchingOtherGroups(vote, homeGroup, mepPosition),
  };
}

/**
 * Resolve the ISO-week Monday for an arbitrary YYYY-MM-DD string.
 *
 * @internal Exported for testing.
 */
export function isoWeekStart(date: string): string {
  if (date === '' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const [yearStr, monthStr, dayStr] = date.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const d = new Date(Date.UTC(year, month - 1, day));
  // getUTCDay: 0=Sun..6=Sat → shift so Monday=0.
  const dow = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dow);
  const yyyy = String(d.getUTCFullYear()).padStart(4, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Bucket classified votes into ISO-week buckets keyed by Monday's date.
 *
 * Buckets are returned in chronological order (oldest first). Votes without
 * a valid sittingDate are bucketed under the empty-string key and *placed at
 * the tail* (sorting empty-string ahead of real dates would otherwise
 * distort week-over-week shift detection and baseline computations).
 *
 * @param votes - Sequence of classified MEP votes.
 * @returns Per-week aggregates with computed defection / abstention rates.
 */
export function bucketByWeek(votes: ClassifiedVote[]): WeekBucket[] {
  const byWeek = new Map<string, WeekBucket>();
  for (const v of votes) {
    if (v.alignment === 'absent') continue;
    const week = isoWeekStart(v.sittingDate);
    let bucket = byWeek.get(week);
    if (bucket === undefined) {
      bucket = {
        weekStart: week,
        voted: 0,
        decisive: 0,
        defections: 0,
        abstentions: 0,
        crossPartyAlignments: 0,
        voteIds: [],
        defectionRate: 0,
        abstentionRate: 0,
      };
      byWeek.set(week, bucket);
    }
    bucket.voted += 1;
    bucket.voteIds.push(v.voteId);
    if (v.alignment === 'abstained') {
      bucket.abstentions += 1;
    } else {
      bucket.decisive += 1;
      if (v.alignment === 'defected') {
        bucket.defections += 1;
        // Only true cross-party signals: defections that also matched a
        // non-home group's majority. See `WeekBucket.crossPartyAlignments`.
        if (v.matchingOtherGroups.length > 0) bucket.crossPartyAlignments += 1;
      }
    }
  }
  const buckets = [...byWeek.values()];
  // Chronological sort that pushes the "no valid date" bucket (weekStart === '')
  // to the tail instead of letting it sort first lexicographically.
  buckets.sort((a, b) => {
    if (a.weekStart === '' && b.weekStart === '') return 0;
    if (a.weekStart === '') return 1;
    if (b.weekStart === '') return -1;
    return a.weekStart.localeCompare(b.weekStart);
  });
  for (const b of buckets) {
    b.defectionRate = b.decisive > 0
      ? Math.round((b.defections / b.decisive) * 100 * 100) / 100
      : 0;
    b.abstentionRate = b.voted > 0
      ? Math.round((b.abstentions / b.voted) * 100 * 100) / 100
      : 0;
  }
  return buckets;
}

/**
 * Compute sample mean & standard deviation (ddof = 1) for a series of
 * numbers. Returns `{mean:0, stdev:0}` for empty input.
 */
export function computeBaseline(values: number[]): BaselineSummary {
  if (values.length === 0) return { mean: 0, stdev: 0 };
  const sum = values.reduce((acc, v) => acc + v, 0);
  const mean = sum / values.length;
  if (values.length < 2) return { mean, stdev: 0 };
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (values.length - 1);
  return { mean, stdev: Math.sqrt(variance) };
}

/**
 * Single-sample z-score with a guard for zero variance.
 *
 * When `stdev` is zero (single data point or constant series) the z-score is
 * undefined; this helper returns `0` so callers can treat constant series as
 * "no anomaly" without special-casing.
 */
export function zScore(value: number, baseline: BaselineSummary): number {
  if (baseline.stdev === 0) return 0;
  return (value - baseline.mean) / baseline.stdev;
}

/**
 * Find weeks whose `rateKey` value has a z-score ≥ `threshold` against the
 * baseline computed across *all* buckets (the MEP's own rolling baseline
 * within the period).
 *
 * @param buckets - Output of {@link bucketByWeek}.
 * @param rateKey - Which rate to evaluate (`'defectionRate'` or `'abstentionRate'`).
 * @param threshold - Minimum z-score that triggers an anomaly (default {@link DEFAULT_Z_SCORE_THRESHOLD}).
 * @returns Outlier weeks (chronological order).
 */
export function findOutlierWeeks(
  buckets: WeekBucket[],
  rateKey: 'defectionRate' | 'abstentionRate',
  threshold: number = DEFAULT_Z_SCORE_THRESHOLD
): OutlierWeek[] {
  if (buckets.length < 2) return [];
  const values = buckets.map(b => b[rateKey]);
  const baseline = computeBaseline(values);
  if (baseline.stdev === 0) return [];
  const outliers: OutlierWeek[] = [];
  for (const b of buckets) {
    const z = zScore(b[rateKey], baseline);
    if (z >= threshold) {
      outliers.push({
        weekStart: b.weekStart,
        value: b[rateKey],
        z: Math.round(z * 100) / 100,
        baselineMean: Math.round(baseline.mean * 100) / 100,
        voteIds: [...b.voteIds],
      });
    }
  }
  return outliers;
}

/**
 * Find consecutive-week pairs where the defection rate jumped by `≥ threshold`
 * percentage points.
 *
 * Only positive jumps are reported (the MEP becoming *more* defection-prone).
 *
 * @param buckets - Output of {@link bucketByWeek}.
 * @param threshold - Minimum percentage-point delta (default {@link DEFAULT_WOW_THRESHOLD_PP}).
 * @returns Detected shifts in chronological order.
 */
export function findWoWShifts(
  buckets: WeekBucket[],
  threshold: number = DEFAULT_WOW_THRESHOLD_PP
): WoWShift[] {
  const shifts: WoWShift[] = [];
  for (let i = 1; i < buckets.length; i += 1) {
    const prev = buckets[i - 1];
    const curr = buckets[i];
    if (prev === undefined || curr === undefined) continue;
    const delta = curr.defectionRate - prev.defectionRate;
    if (delta >= threshold) {
      shifts.push({
        fromWeek: prev.weekStart,
        toWeek: curr.weekStart,
        delta: Math.round(delta * 100) / 100,
        previousRate: Math.round(prev.defectionRate * 100) / 100,
        voteIds: [...prev.voteIds, ...curr.voteIds],
      });
    }
  }
  return shifts;
}

/**
 * Find sub-windows (weeks) where the MEP defected toward non-home-group
 * majorities on ≥ `share` of decisive RCVs.
 *
 * Skips weeks with fewer than {@link MIN_SUBWINDOW_DECISIVE_VOTES} decisive
 * votes to avoid spurious 100% windows on tiny samples.
 *
 * Units: the `share` parameter is a **fraction** (0–1). The returned
 * {@link CrossPartyWindow.sharePercent} field is converted to a
 * **percentage** (0–100) for consumer ergonomics — keep this distinction in
 * mind when wiring severity classifiers (e.g. `severityFromShare` expects
 * percent input).
 *
 * @param buckets - Output of {@link bucketByWeek}.
 * @param share - Minimum share (0–1) of decisive RCVs where the MEP
 *   defected toward non-home group majorities (default
 *   {@link DEFAULT_CROSS_PARTY_SHARE}).
 * @returns Windows in chronological order.
 */
export function findCrossPartyAlignmentWindows(
  buckets: WeekBucket[],
  share: number = DEFAULT_CROSS_PARTY_SHARE
): CrossPartyWindow[] {
  const windows: CrossPartyWindow[] = [];
  for (const b of buckets) {
    if (b.decisive < MIN_SUBWINDOW_DECISIVE_VOTES) continue;
    const observed = b.crossPartyAlignments / b.decisive;
    if (observed >= share) {
      windows.push({
        weekStart: b.weekStart,
        sharePercent: Math.round(observed * 100 * 100) / 100,
        decisive: b.decisive,
        voteIds: [...b.voteIds],
      });
    }
  }
  return windows;
}

/**
 * Resolve confidence based on the number of RCV votes inspected for the MEP.
 *
 * - `HIGH` when `≥50` votes,
 * - `MEDIUM` when `10–49` votes,
 * - `LOW` when `<10` votes.
 */
export function coverageConfidence(rcvVotesInspected: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (rcvVotesInspected >= 50) return 'HIGH';
  if (rcvVotesInspected >= 10) return 'MEDIUM';
  return 'LOW';
}
