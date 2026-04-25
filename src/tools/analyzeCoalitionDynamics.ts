/**
 * MCP Tool: analyze_coalition_dynamics
 * 
 * Detect voting coalitions, cross-party alliances, group cohesion rates,
 * and coalition stress indicators.
 * 
 * **Intelligence Perspective:** Coalition analysis tool detecting voting blocs,
 * measuring political group cohesion, and identifying emerging cross-party alliances
 * using CIA Coalition Analysis methodology.
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { AnalyzeCoalitionDynamicsSchema } from '../schemas/europeanParliament.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';
import type { DataAvailability, MetricResult } from '../types/index.js';
import type { MEP } from '../types/europeanParliament.js';
import { auditLogger, toErrorMessage } from '../utils/auditLogger.js';
import { fetchAllCurrentMEPs } from '../utils/mepFetcher.js';

interface CoalitionPairAnalysis {
  groupA: string;
  groupB: string;
  /**
   * Group-size balance ratio in `[0, 1]` computed as
   * `min(sizeA, sizeB) / max(sizeA, sizeB)`. This is **NOT** vote-level
   * cohesion (Hix/Noury/Roland sense) — it is a structural proxy reflecting
   * how similarly sized the two groups are. Two groups with almost identical
   * seat counts can score `1.0` here while voting on opposite sides of every
   * roll-call.
   */
  sizeSimilarityScore: number;
  /**
   * Vote-level alignment score in `[0, 1]` (Hix/Noury/Roland-style cohesion).
   * Currently always `null` because the EP Open Data Portal does not expose
   * individual MEP roll-call positions. Will be populated once vote-level
   * data becomes available.
   */
  cohesion: number | null;
  /** null — vote-level data not available from EP API; not a real vote count */
  sharedVotes: number | null;
  /** null — vote-level data not available from EP API; not a real vote count */
  totalVotes: number | null;
  /**
   * `true` when the size-similarity score exceeds `minimumCohesion`. This is a
   * structural signal (groups are similarly sized and *could* form a balanced
   * alliance), not evidence of actual voting alignment.
   */
  allianceSignal: boolean;
  /**
   * Cohesion trend classification. Set to `null` whenever `sharedVotes` is
   * `null` (i.e. always, until vote-level data is available) because a trend
   * derived from a static size ratio carries no temporal/political meaning.
   */
  trend: string | null;
}

interface GroupCohesionMetrics {
  groupId: string;
  memberCount: number;
  /** null when EP API does not provide per-MEP voting statistics */
  internalCohesion: number | null;
  /** null when EP API does not provide per-MEP voting statistics */
  defectionRate: number | null;
  /** null when EP API does not provide per-MEP voting statistics */
  avgAttendance: number | null;
  /** Voting-derived stress indicator; null when EP API does not provide voting statistics */
  stressIndicator: MetricResult;
  /** Explicit marker indicating whether voting-derived metrics are available */
  dataAvailability: DataAvailability;
  computedAttributes: {
    disciplineScore: number | null;
    fragmentationRisk: number | null;
    unityTrend: string;
    activeParticipationRate: number | null;
  };
}

interface CoalitionDynamicsAnalysis {
  period: { from: string; to: string };
  groupMetrics: GroupCohesionMetrics[];
  coalitionPairs: CoalitionPairAnalysis[];
  dominantCoalition: {
    groups: string[];
    combinedStrength: number | null;
    /** Vote-level cohesion of the dominant pair; `null` until vote-level data is available. */
    cohesion: number | null;
    /** Group-size balance ratio of the dominant pair (structural proxy, not vote alignment). */
    sizeSimilarityScore: number;
  };
  stressIndicators: { indicator: string; severity: string; affectedGroups: string[] }[];
  computedAttributes: {
    /** null when group coverage is incomplete (at least one target group has memberCount 0) */
    parliamentaryFragmentation: number | null;
    /** null when group coverage is incomplete (at least one target group has memberCount 0) */
    effectiveNumberOfParties: number | null;
    /** null when cohesion data is UNAVAILABLE */
    grandCoalitionViability: number | null;
    oppositionStrength: number;
  };
  /**
   * Data coverage counters — allow consumers to detect partial data before
   * acting on derived analytics. `groupsTotal` is the size of the **analyzed
   * target set after normalization and deduplication** (callers passing
   * aliases/duplicates collapse to canonical codes); `groupsKnown` is the
   * number of those groups that matched at least one MEP from the EP API
   * after label normalization.
   */
  coverage: {
    groupsKnown: number;
    groupsTotal: number;
    /** Raw EP API political-group labels observed whose canonical group was not in the analyzed target set (after normalization). Labels are sanitized — control characters stripped, whitespace collapsed, and length capped. */
    unrecognizedGroups: string[];
  };
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  dataFreshness: string;
  sourceAttribution: string;
  methodology: string;
  dataQualityWarnings: string[];
  /**
   * Machine-readable disclosure of the limitations baked into this response.
   * Always populated so downstream consumers cannot accidentally treat
   * `coalitionPairs[].sizeSimilarityScore` as vote-level cohesion.
   */
  methodologyNote: string;
}

/**
 * Canonical EP10 (post-July-2024 constitutive session) political groups.
 *
 * Order reflects seat-share descending as of the EP10 constitutive composition
 * (EPP largest → NI smallest). `ID` is intentionally excluded: it was dissolved
 * in July 2024 and succeeded by `PfE` (Patriots for Europe). `ESN` (Europe of
 * Sovereign Nations) is a new group formed in July 2024.
 *
 * @see {@link normalizePoliticalGroup} for mapping raw EP API labels to these codes.
 */
const POLITICAL_GROUPS = ['EPP', 'S&D', 'Renew', 'Greens/EFA', 'ECR', 'PfE', 'The Left', 'ESN', 'NI'];

/**
 * Upper bound on the length of a sanitized raw EP API political-group label
 * when echoed back in `coverage.unrecognizedGroups` or warning messages.
 * Guards against unbounded response sizes from pathological upstream payloads.
 */
const MAX_UNRECOGNIZED_LABEL_LENGTH = 120;

/**
 * Alias table mapping normalized lowercase EP API political-group labels to
 * canonical short codes. Covers common variants observed on the EP Open Data
 * Portal: URI suffixes, full group names, historical names (pre-EP10), and
 * succession relationships (e.g. `ID → PfE` post-July-2024).
 *
 * Keys are lowercased with whitespace trimmed; `normalizePoliticalGroup`
 * additionally strips the URI path prefix before lookup.
 */
const POLITICAL_GROUP_ALIASES: ReadonlyMap<string, string> = new Map([
  // EPP variants
  ['epp', 'EPP'],
  ['epp-ed', 'EPP'],
  // EP Open Data Portal also returns the French acronym `PPE` (Parti Populaire
  // Européen) for the EPP group, e.g. as the URI suffix
  // `…/corporate-body/PPE`. See `analyze_coalition_dynamics` reliability audit
  // (Hack23/euparliamentmonitor 2026-04-24 propositions, Defect #4).
  ['ppe', 'EPP'],
  ['ppe-de', 'EPP'],
  ['groupe du parti populaire européen (démocrates-chrétiens)', 'EPP'],
  ['groupe du parti populaire européen', 'EPP'],
  ['parti populaire européen', 'EPP'],
  ["group of the european people's party (christian democrats)", 'EPP'],
  ["group of the european people's party", 'EPP'],
  ["european people's party", 'EPP'],
  ['european people’s party', 'EPP'],
  // S&D variants — EP API also returns French acronym `SOC` (Socialistes)
  ['s&d', 'S&D'],
  ['sd', 'S&D'],
  ['s-d', 'S&D'],
  ['soc', 'S&D'],
  ['pse', 'S&D'],
  ['group of the progressive alliance of socialists and democrats in the european parliament', 'S&D'],
  ['progressive alliance of socialists and democrats', 'S&D'],
  ['groupe de l\'alliance progressiste des socialistes et démocrates au parlement européen', 'S&D'],
  // Renew Europe variants
  ['renew', 'Renew'],
  ['re', 'Renew'],
  ['renew europe', 'Renew'],
  ['renew europe group', 'Renew'],
  ['alde', 'Renew'],
  // Greens/EFA variants — EP URI suffix is `Verts-ALE`
  ['greens/efa', 'Greens/EFA'],
  ['greens-efa', 'Greens/EFA'],
  ['verts/ale', 'Greens/EFA'],
  ['verts-ale', 'Greens/EFA'],
  ['group of the greens/european free alliance', 'Greens/EFA'],
  ['the greens/european free alliance', 'Greens/EFA'],
  ['greens/european free alliance', 'Greens/EFA'],
  ['groupe des verts/alliance libre européenne', 'Greens/EFA'],
  // ECR variants
  ['ecr', 'ECR'],
  ['european conservatives and reformists group', 'ECR'],
  ['european conservatives and reformists', 'ECR'],
  // PfE variants (successor to ID from July 2024)
  ['pfe', 'PfE'],
  ['patriots for europe', 'PfE'],
  ['id', 'PfE'],
  ['identity and democracy', 'PfE'],
  ['identity and democracy group', 'PfE'],
  // The Left (GUE/NGL) variants
  ['the left', 'The Left'],
  ['gue/ngl', 'The Left'],
  ['gue-ngl', 'The Left'],
  ['the left in the european parliament - gue/ngl', 'The Left'],
  ['the left group in the european parliament - gue/ngl', 'The Left'],
  ['confederal group of the european united left - nordic green left', 'The Left'],
  // ESN (new EP10 group)
  ['esn', 'ESN'],
  ['europe of sovereign nations', 'ESN'],
  ['europe of sovereign nations group', 'ESN'],
  // Non-Inscrits variants
  ['ni', 'NI'],
  ['non-attached', 'NI'],
  ['non-inscrits', 'NI'],
  ['non-attached members', 'NI'],
]);

/**
 * Normalizes a raw political-group label returned by the EP Open Data Portal
 * API to a canonical short code (e.g. `EPP`, `S&D`, `PfE`).
 *
 * Handles three common EP API formats:
 * 1. **Short codes** — already canonical (`EPP`, `S&D`, ...) are returned as-is
 *    after lookup (case-insensitive).
 * 2. **URI identifiers** — e.g. `http://publications.europa.eu/.../corporate-body/EPP`.
 *    The URI suffix is extracted and then looked up.
 * 3. **Full group names** — e.g. `"Group of the European People's Party (Christian Democrats)"`.
 *    Matched case-insensitively against {@link POLITICAL_GROUP_ALIASES}.
 *
 * Also handles succession relationships so historical pre-EP10 labels (e.g.
 * `ID` from EP9) are counted against their EP10 successor (`PfE`).
 *
 * @param raw - Raw political-group label from the EP API (may be empty/unknown)
 * @returns Canonical short code when recognized, otherwise the original `raw`
 *   string trimmed (so callers can surface unrecognized labels as a data-quality
 *   warning).
 */
export function normalizePoliticalGroup(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed === '' || trimmed.toLowerCase() === 'unknown') return trimmed;
  // Strip URI path prefix if present — preserves the last segment for lookup.
  const lastSlash = trimmed.lastIndexOf('/');
  const suffix = lastSlash >= 0 ? trimmed.substring(lastSlash + 1) : trimmed;
  const key = suffix.toLowerCase().trim();
  const canonical = POLITICAL_GROUP_ALIASES.get(key);
  if (canonical !== undefined) return canonical;
  // Also try the full original string (handles full group names that include
  // slashes like "Greens/EFA" where stripping the URI prefix would be wrong).
  const fullKey = trimmed.toLowerCase();
  const canonicalFull = POLITICAL_GROUP_ALIASES.get(fullKey);
  if (canonicalFull !== undefined) return canonicalFull;
  return trimmed;
}

/**
 * Normalizes a list of caller-supplied group identifiers into a deduplicated
 * sequence of canonical EP10 codes, preserving the first-seen order.
 *
 * Accepts any input format supported by {@link normalizePoliticalGroup}
 * (short codes, URI suffixes, full group names, historical aliases such as
 * `ID` → `PfE`). Empty / whitespace-only / `"unknown"` entries and duplicates
 * after normalization are dropped. Unrecognized labels are preserved as-is
 * (after trimming) so downstream coverage reporting can surface them.
 *
 * @param groupIds - Raw caller-provided group identifiers
 * @returns Deduplicated canonical group identifiers in first-seen order
 */
function normalizeTargetGroups(groupIds: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of groupIds) {
    const canonical = normalizePoliticalGroup(raw);
    if (canonical === '' || canonical.toLowerCase() === 'unknown') continue;
    if (seen.has(canonical)) continue;
    seen.add(canonical);
    result.push(canonical);
  }
  return result;
}

/**
 * Sanitizes a raw EP API political-group label for safe inclusion in the
 * response (`coverage.unrecognizedGroups`) and warning messages.
 *
 * Strips ASCII control characters (including CR/LF that would break
 * warning-line rendering), collapses internal runs of whitespace to a single
 * space, trims, and caps the length at `MAX_UNRECOGNIZED_LABEL_LENGTH`
 * characters (truncation suffixed with `…`) to guard against pathological or
 * injected payloads producing unbounded response sizes.
 *
 * @param raw - Raw EP API political-group label
 * @returns Sanitized label suitable for echoing back to consumers
 */
function sanitizeUnrecognizedLabel(raw: string): string {
  const stripped = raw.replace(/[\x00-\x1F\x7F]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (stripped.length <= MAX_UNRECOGNIZED_LABEL_LENGTH) return stripped;
  // Reserve one character for the ellipsis so the final string length is
  // exactly `MAX_UNRECOGNIZED_LABEL_LENGTH` and never exceeds the documented bound.
  return `${stripped.slice(0, MAX_UNRECOGNIZED_LABEL_LENGTH - 1)}…`;
}

/**
 * Computes a pairwise coalition pair record for two political groups.
 *
 * **Limitation:** The EP API `/meps/{id}` endpoint does not expose per-vote
 * statistics, so true pairwise voting cohesion (Hix/Noury/Roland sense)
 * cannot be calculated. Instead this function emits a `sizeSimilarityScore`
 * computed from group size balance — smaller groups paired with similarly
 * sized peers are *structurally* better positioned to form a balanced
 * alliance, but this score says **nothing** about how the groups vote.
 *
 * Formula: `sizeSimilarityScore = min(sizeA, sizeB) / max(sizeA, sizeB)` (range 0–1).
 * `cohesion`, `trend`, `sharedVotes`, and `totalVotes` are all set to `null`
 * to reflect that vote-alignment data is unavailable via the EP Open Data
 * Portal. This naming change (per issue #3) prevents downstream consumers
 * from misreading a size-ratio artefact as evidence of political alignment
 * (e.g. Renew + ECR scoring `0.95` purely because they hold 77 vs 81 seats).
 *
 * @param groupA - Political group identifier for the first group
 * @param groupB - Political group identifier for the second group
 * @param groupAMembers - Sample-based member count estimate (lower bound) for `groupA` derived from EP API data
 * @param groupBMembers - Sample-based member count estimate (lower bound) for `groupB` derived from EP API data
 * @param minimumSizeSimilarity - Threshold above which `allianceSignal` is set to `true`
 *   (compared against `sizeSimilarityScore` — a structural signal, not vote alignment).
 *   Sourced from the public `minimumCohesion` input, which is preserved for
 *   backward-compatibility but applied to the size-similarity proxy until
 *   vote-level cohesion is available.
 * @returns {@link CoalitionPairAnalysis} record where `sizeSimilarityScore` is
 *   the size-balance proxy and `cohesion`/`trend`/`sharedVotes`/`totalVotes`
 *   are `null` until vote-level data is available.
 */
function computePairSizeSimilarity(
  groupA: string,
  groupB: string,
  groupAMembers: number,
  groupBMembers: number,
  minimumSizeSimilarity: number
): CoalitionPairAnalysis {
  // Use relative group sizes as a proxy — no synthetic seed-based data.
  // This is **size similarity**, not vote-level cohesion (Hix/Noury/Roland).
  const totalMembers = groupAMembers + groupBMembers;
  const balance = totalMembers > 0
    ? Math.min(groupAMembers, groupBMembers) / Math.max(1, Math.max(groupAMembers, groupBMembers))
    : 0;
  const sizeSimilarityScore = Math.round(balance * 100) / 100;
  const sharedVotes = null; // Not available from EP API without vote-level analysis
  const totalVotes = null;
  const cohesion = null; // Vote-level alignment unavailable from EP Open Data Portal

  return {
    groupA,
    groupB,
    sizeSimilarityScore,
    cohesion,
    sharedVotes,
    totalVotes,
    allianceSignal: sizeSimilarityScore > minimumSizeSimilarity,
    // Suppress trend entirely while vote-level data is unavailable — a "trend"
    // derived from a static group-size ratio carries no temporal/political
    // meaning. Will be repopulated from vote-level cohesion once
    // sharedVotes/cohesion are sourced from real EP roll-call data.
    trend: null
  };
}

/**
 * Fetches all current MEPs once and computes per-group membership counts in-memory.
 *
 * **Note (data source):** Uses `getCurrentMEPs()` to paginate through `/meps/show-current`
 * in batches of 100, then counts per group locally. This avoids per-group API calls that
 * each trigger a full multi-page fetch when client-side filtering is used.
 *
 * **Note (label normalization):** Raw `politicalGroup` strings from the EP API
 * are passed through {@link normalizePoliticalGroup} before tallying, so MEPs
 * whose group is returned as a URI, full name, or historical alias (e.g. `ID`
 * → `PfE`) are counted against the correct canonical short code. Raw labels
 * whose canonical group is not in the analyzed target set (after
 * normalization) are collected — sanitized via
 * {@link sanitizeUnrecognizedLabel} — in the returned `unrecognizedGroups`
 * set so consumers can surface a data-quality warning. Note that this
 * includes recognized canonical groups that were simply outside `groupIds`.
 *
 * **Note (voting data):** The EP API does not provide per-MEP voting statistics.
 * As a result, `internalCohesion`, `defectionRate`, and `avgAttendance` are set to
 * `null`, `dataAvailability` and `stressIndicator.availability` are set to
 * `'UNAVAILABLE'`, and `unityTrend` is `'UNKNOWN'`. Callers should treat these
 * fields as "not available" and supplement with vote-result data when available.
 *
 * @param targetGroups - Political group identifiers to query (e.g., `['EPP', 'S&D']`)
 * @param allMeps - Pre-fetched array of current MEPs
 * @returns Object with per-group cohesion metrics and the set of sanitized
 *   EP API group labels whose canonical group was not in the analyzed target
 *   set after normalization (for data-quality reporting).
 */
function buildGroupMetrics(
  targetGroups: string[],
  allMeps: MEP[]
): { metrics: GroupCohesionMetrics[]; unrecognizedGroups: string[] } {
  const targetSet = new Set(targetGroups);
  const groupCounts = new Map<string, number>();
  const unrecognizedSet = new Set<string>();

  for (const mep of allMeps) {
    const raw = mep.politicalGroup.trim();
    if (raw === '') continue;
    const canonical = normalizePoliticalGroup(raw);
    if (canonical === '' || canonical.toLowerCase() === 'unknown') continue;
    if (targetSet.has(canonical)) {
      groupCounts.set(canonical, (groupCounts.get(canonical) ?? 0) + 1);
    } else {
      unrecognizedSet.add(sanitizeUnrecognizedLabel(raw));
    }
  }

  const metrics: GroupCohesionMetrics[] = [];
  for (const groupId of targetGroups) {
    const memberCount = groupCounts.get(groupId) ?? 0;

    metrics.push({
      groupId,
      memberCount,
      internalCohesion: null,
      defectionRate: null,
      avgAttendance: null,
      stressIndicator: {
        value: null,
        availability: 'UNAVAILABLE',
        confidence: 'LOW',
        reason: 'Per-MEP voting statistics not available from EP API'
      },
      dataAvailability: 'UNAVAILABLE',
      computedAttributes: {
        disciplineScore: null,
        fragmentationRisk: null,
        unityTrend: 'UNKNOWN',
        activeParticipationRate: null
      }
    });
  }
  return { metrics, unrecognizedGroups: [...unrecognizedSet].sort() };
}

/**
 * Builds all pairwise coalition pair analyses for the target groups.
 *
 * Iterates over the upper-triangle of group combinations (O(n²)) and calls
 * {@link computePairSizeSimilarity} for each pair using the sample-based `memberCount`
 * estimates from `groupMetrics` (see {@link buildGroupMetrics} for data scope limits).
 * A `groupId → memberCount` `Map` is built once up front so per-pair member-count
 * lookups are O(1), keeping the overall complexity at O(n²).
 *
 * @param targetGroups - Ordered list of political group identifiers
 * @param minimumSizeSimilarity - Threshold against which `sizeSimilarityScore`
 *   is compared to set `allianceSignal` (sourced from the public
 *   `minimumCohesion` input — see {@link computePairSizeSimilarity})
 * @param groupMetrics - Pre-fetched group metrics containing sampled `memberCount` per group
 * @returns Array of {@link CoalitionPairAnalysis} records for every group combination
 */
function buildCoalitionPairs(
  targetGroups: string[],
  minimumSizeSimilarity: number,
  groupMetrics: GroupCohesionMetrics[]
): CoalitionPairAnalysis[] {
  // Precompute a groupId → memberCount lookup once so the nested loop below
  // is truly O(n²) in the number of target groups (avoids an O(n³) blowup
  // from per-pair `Array.find` scans of `groupMetrics`).
  const memberCountByGroup = new Map<string, number>();
  for (const metric of groupMetrics) {
    memberCountByGroup.set(metric.groupId, metric.memberCount);
  }
  const pairs: CoalitionPairAnalysis[] = [];
  for (let i = 0; i < targetGroups.length; i++) {
    for (let j = i + 1; j < targetGroups.length; j++) {
      const groupA = targetGroups[i] ?? '';
      const groupB = targetGroups[j] ?? '';
      const groupAMembers = memberCountByGroup.get(groupA) ?? 0;
      const groupBMembers = memberCountByGroup.get(groupB) ?? 0;
      pairs.push(computePairSizeSimilarity(groupA, groupB, groupAMembers, groupBMembers, minimumSizeSimilarity));
    }
  }
  return pairs;
}

/**
 * Maps a numeric stress indicator to a qualitative severity string.
 *
 * Threshold: stress > 0.7 → `'HIGH'`; otherwise → `'MODERATE'`.
 * A `'LOW'` tier is not emitted here because only groups with
 * `stressIndicator > 0.5` reach this function (see {@link computeStressIndicators}).
 *
 * @param stress - Stress indicator value in `[0, 1]`
 * @returns Severity classification: `'HIGH'` or `'MODERATE'`
 */
function classifyStressSeverity(stress: number): string {
  if (stress > 0.7) return 'HIGH';
  return 'MODERATE';
}

/**
 * Derives stress indicator records from group metrics.
 *
 * Conceptually, this emits records only for groups where
 * `stressIndicator.value > 0.5` (moderate-to-high internal tension). Each
 * record contains a human-readable indicator description, a severity
 * classification from {@link classifyStressSeverity}, and the list of
 * affected groups.
 *
 * **Current data limitation:** The upstream {@link buildGroupMetrics} implementation
 * sets `stressIndicator.value` to `null` (UNAVAILABLE due to missing EP
 * vote-level statistics). As a result, the `stress !== null && stress > 0.5`
 * guard in this function is never satisfied and it will currently return an
 * empty array until real stress values are populated.
 *
 * @param groupMetrics - Array of group cohesion metric objects
 * @returns Array of stress indicator records for groups exceeding the 0.5 threshold;
 *   currently always empty due to `stressIndicator.value` being `null` (EP API limitation)
 */
function computeStressIndicators(groupMetrics: GroupCohesionMetrics[]): { indicator: string; severity: string; affectedGroups: string[] }[] {
  const results: { indicator: string; severity: string; affectedGroups: string[] }[] = [];
  for (const g of groupMetrics) {
    const stress = g.stressIndicator.value;
    if (stress !== null && stress > 0.5) {
      results.push({
        indicator: `High defection rate in ${g.groupId}`,
        severity: classifyStressSeverity(stress),
        affectedGroups: [g.groupId]
      });
    }
  }
  return results;
}

/**
 * Computes parliamentary fragmentation metrics using the Herfindahl–Hirschman Index (HHI).
 *
 * **Effective Number of Parties (ENP):** `1 / Σ(seatShare²)` — a standard political
 * science measure of party-system fragmentation. Higher values indicate a more
 * fragmented parliament.
 *
 * **Grand coalition viability:** Approximated as the mean of EPP and S&D internal
 * cohesion scores, since a grand coalition between the two largest groups is the
 * canonical EP majority formation scenario. A value of `null` reflects the current
 * data limitation (voting statistics unavailable from the EP API and thus no
 * reliable viability score can be computed).
 *
 * @param groupMetrics - Array of group metrics with `memberCount` and `internalCohesion`
 * @returns Object with `effectiveParties` (ENP) and `grandCoalitionViability` (0–1 or `null` when unavailable)
 */
function computeFragmentationMetrics(groupMetrics: GroupCohesionMetrics[]): {
  effectiveParties: number;
  grandCoalitionViability: number | null;
} {
  const totalMembers = groupMetrics.reduce((sum, g) => sum + g.memberCount, 0);
  const seatShares = groupMetrics.map(g => totalMembers > 0 ? g.memberCount / totalMembers : 0);
  const herfindahl = seatShares.reduce((sum, s) => sum + s * s, 0);
  const effectiveParties = herfindahl > 0 ? 1 / herfindahl : 1;

  const eppCohesion = groupMetrics.find(g => g.groupId === 'EPP')?.internalCohesion ?? null;
  const sdCohesion = groupMetrics.find(g => g.groupId === 'S&D')?.internalCohesion ?? null;
  // Return null when cohesion data is unavailable to avoid misleading computed score
  const grandCoalitionViability = (eppCohesion !== null && sdCohesion !== null)
    ? Math.round((eppCohesion + sdCohesion) / 2 * 100) / 100
    : null;

  return { effectiveParties, grandCoalitionViability };
}

/**
 * Identifies the dominant coalition from the sorted pair list.
 *
 * The dominant coalition is the top-ranked pair by `sizeSimilarityScore`. Its
 * `combinedStrength` is set to `sharedVotes`, which is currently `null`
 * when vote-level data is unavailable due to EP API limitations — see
 * {@link computePairSizeSimilarity}.
 *
 * @param sortedPairs - Coalition pairs sorted descending by `sizeSimilarityScore`
 * @returns Dominant coalition record, or an empty record if the list is empty
 */
function buildDominantCoalition(sortedPairs: CoalitionPairAnalysis[]): {
  groups: string[];
  combinedStrength: number | null;
  cohesion: number | null;
  sizeSimilarityScore: number;
} {
  const topPair = sortedPairs[0];
  if (topPair === undefined) {
    return { groups: [], combinedStrength: null, cohesion: null, sizeSimilarityScore: 0 };
  }
  return {
    groups: [topPair.groupA, topPair.groupB],
    combinedStrength: topPair.sharedVotes,
    cohesion: topPair.cohesion,
    sizeSimilarityScore: topPair.sizeSimilarityScore
  };
}

/**
 * Derives the `computedAttributes` block for the coalition dynamics analysis.
 *
 * - **`parliamentaryFragmentation`** and **`effectiveNumberOfParties`** both echo the
 *   ENP value (two fields for different consumer use cases). When `coverageComplete`
 *   is `false` (at least one target group has `memberCount: 0`) both are emitted
 *   as `null` to avoid a plausible-but-wrong fragmentation index — see the
 *   upstream data-quality warnings for the reason.
 * - **`grandCoalitionViability`** reflects EPP + S&D cohesion mean (see
 *   {@link computeFragmentationMetrics}).
 * - **`oppositionStrength`** is approximated as `1 − topSizeSimilarity`, where
 *   a lower top-pair size-similarity score implies a stronger opposition bloc.
 *   Note: this is a structural proxy derived from group-size ratios, not from
 *   vote-level cohesion (see {@link computePairSizeSimilarity}).
 *
 * @param fragMetrics - Fragmentation metrics from {@link computeFragmentationMetrics}
 * @param sortedPairs - Coalition pairs sorted descending by `sizeSimilarityScore`
 * @param coverageComplete - `true` when every target group matched at least one MEP;
 *   `false` triggers null fragmentation / ENP values to signal incomplete data
 * @returns Computed attributes object for the coalition dynamics result
 */
function buildCoalitionComputedAttrs(
  fragMetrics: { effectiveParties: number; grandCoalitionViability: number | null },
  sortedPairs: CoalitionPairAnalysis[],
  coverageComplete: boolean
): CoalitionDynamicsAnalysis['computedAttributes'] {
  const topSizeSimilarity = sortedPairs[0]?.sizeSimilarityScore ?? 0;
  const enp = coverageComplete
    ? Math.round(fragMetrics.effectiveParties * 100) / 100
    : null;
  return {
    parliamentaryFragmentation: enp,
    effectiveNumberOfParties: enp,
    grandCoalitionViability: fragMetrics.grandCoalitionViability,
    oppositionStrength: Math.round((1 - topSizeSimilarity) * 100) / 100
  };
}

/**
 * Renders a bounded, comma-separated preview of raw EP API group labels for
 * inclusion in data-quality warning messages. When the list exceeds `max`
 * entries the first `max` are rendered followed by a `(+N more)` suffix so
 * consumers can tell the preview was truncated.
 */
function previewUnrecognized(labels: readonly string[], max = 10): string {
  if (labels.length <= max) return labels.join(', ');
  const extra = labels.length - max;
  return `${labels.slice(0, max).join(', ')} (+${String(extra)} more)`;
}

/**
 * Builds the `dataQualityWarnings` array for a coalition dynamics response.
 *
 * Encapsulates the coverage-warning branching so the request handler stays
 * under the project's cyclomatic-complexity budget. Warnings cover three
 * orthogonal data-quality concerns:
 *
 * 1. **Vote-level data unavailable** (always emitted) — reflects the EP API
 *    `/meps/{id}` limitation that per-MEP vote statistics are not exposed.
 * 2. **Pagination failures** — emitted when the MEP fetch did not complete.
 * 3. **Group coverage** — emitted when at least one target group has
 *    `memberCount: 0`, or when EP API labels were observed whose canonical
 *    group was not in the analyzed target set after normalization.
 *
 * @param fetchResult - Result from {@link fetchAllCurrentMEPs}; inspected for
 *   `complete` and `failureOffset` to decide whether to warn about partial data
 * @param missingGroups - Target-group IDs that ended up with `memberCount: 0`
 * @param totalGroups - Total number of target groups analyzed
 * @param unrecognizedGroups - Sanitized EP API group labels whose canonical
 *   group was not in the analyzed target set after normalization
 * @returns Ordered array of human-readable warning messages for the response
 */
function buildCoverageWarnings(
  fetchResult: { complete: boolean; failureOffset?: number },
  missingGroups: string[],
  totalGroups: number,
  unrecognizedGroups: string[]
): string[] {
  const warnings: string[] = [
    'Per-MEP voting statistics unavailable from EP API — cohesion, defection, and attendance metrics are null',
    'coalitionPairs[].cohesion and coalitionPairs[].trend are null — vote-level alignment data is not available via the EP Open Data Portal; only coalitionPairs[].sizeSimilarityScore (group-size ratio proxy) is populated',
  ];
  if (!fetchResult.complete) {
    warnings.push(`MEP data is incomplete — pagination failed at offset ${String(fetchResult.failureOffset ?? 0)}; results based on partial data`);
  }
  if (missingGroups.length > 0) {
    const observed = unrecognizedGroups.length > 0
      ? `Out-of-target EP API group labels observed (recognized canonical codes or unknown labels outside the requested groupIds): ${previewUnrecognized(unrecognizedGroups)}`
      : 'No out-of-target EP API group labels observed — groups may have zero seats or the lookup table may be stale.';
    warnings.push(`Incomplete group coverage — ${String(missingGroups.length)}/${String(totalGroups)} target group(s) returned memberCount: 0 (${missingGroups.join(', ')}); derived fragmentation/ENP set to null. ${observed}`);
  } else if (unrecognizedGroups.length > 0) {
    warnings.push(`Observed ${String(unrecognizedGroups.length)} EP API group label(s) not in the analyzed target set: ${previewUnrecognized(unrecognizedGroups)}`);
  }
  return warnings;
}

/**
 * Handles the analyze_coalition_dynamics MCP tool request.
 *
 * Detects voting coalitions, cross-party alliances, group cohesion rates, and
 * coalition stress indicators across European Parliament political groups.
 * Uses CIA Coalition Analysis methodology to measure parliamentary fragmentation,
 * effective number of parties, and grand-coalition viability.
 *
 * @param args - Raw tool arguments, validated against {@link AnalyzeCoalitionDynamicsSchema}
 * @returns MCP tool result containing coalition pair cohesion scores, group cohesion
 *   metrics, dominant coalition, stress indicators, and computed fragmentation attributes
 * @throws - If `args` fails schema validation (e.g., missing required fields or invalid format)
 * - If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * const result = await handleAnalyzeCoalitionDynamics({
 *   groupIds: ['EPP', 'S&D', 'Renew'],
 *   minimumCohesion: 0.5,
 *   dateFrom: '2024-01-01',
 *   dateTo: '2024-12-31'
 * });
 * // Returns coalition pair analysis with cohesion scores, stress indicators,
 * // and parliamentary fragmentation index
 * ```
 *
 * @security - Input is validated with Zod before any API call.
 * - Personal data in responses is minimised per GDPR Article 5(1)(c).
 * - All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link analyzeCoalitionDynamicsToolMetadata} for MCP schema registration
 * @see {@link handleComparePoliticalGroups} for per-group dimension comparison
 * Analyze coalition dynamics tool handler
 *
 * Detects voting coalitions, measures political group cohesion, and identifies
 * cross-party alliances using CIA Coalition Analysis methodology. Fetches real
 * MEP membership counts from the EP Open Data API; pairwise cohesion is derived
 * from group-size ratios (per-MEP voting statistics are not available from the
 * EP API `/meps/{id}` endpoint).
 *
 * **Analysis outputs:**
 * - Group cohesion metrics (member count, stress indicator, fragmentation risk)
 * - Pairwise coalition strength for each group combination
 * - Dominant coalition identification
 * - Stress indicators for groups with high internal tension
 * - Parliament-wide fragmentation index (Herfindahl–Hirschman)
 * - Effective number of parties (ENP)
 *
 * > **Note:** Confidence level is `LOW` because per-MEP voting statistics
 * > are unavailable from the current EP API. Cohesion/defection/attendance
 * > metrics are null with `dataAvailability: 'UNAVAILABLE'` and should be
 * > supplemented with vote-result data when available.
 *
 * @param args - Tool arguments matching AnalyzeCoalitionDynamicsSchema
 * @param args.groupIds - Political group identifiers to analyze (optional; defaults to all 9 EP10 groups)
 * @param args.dateFrom - Analysis start date in YYYY-MM-DD format (optional)
 * @param args.dateTo - Analysis end date in YYYY-MM-DD format (optional)
 * @param args.minimumCohesion - Threshold used for `allianceSignal` detection in `[0, 1]`
 *   (default 0.5). Until per-MEP roll-call data is exposed by the EP Open Data Portal,
 *   this value is applied to `coalitionPairs[].sizeSimilarityScore` (a group-size
 *   ratio proxy), not to vote-level cohesion. The parameter name is preserved for
 *   backward compatibility.
 * @returns MCP ToolResult containing `CoalitionDynamicsAnalysis` object as JSON
 * @throws {Error} When the EP API request fails or group data cannot be fetched
 * @throws {ZodError} When input fails schema validation (invalid group IDs, date format)
 *
 * @example
 * ```typescript
 * // Analyze all political groups with default settings
 * const result = await handleAnalyzeCoalitionDynamics({});
 * const analysis = JSON.parse(result.content[0].text);
 * console.log(`Fragmentation index: ${analysis.computedAttributes.parliamentaryFragmentation}`);
 * ```
 *
 * @example
 * ```typescript
 * // Analyze specific groups with higher alliance threshold
 * const result = await handleAnalyzeCoalitionDynamics({
 *   groupIds: ["EPP", "S&D", "Renew"],
 *   minimumCohesion: 0.6,
 *   dateFrom: "2024-01-01",
 *   dateTo: "2024-12-31"
 * });
 * ```
 *
 * @security Input validated by Zod. Errors sanitized (no stack traces exposed).
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */
export async function handleAnalyzeCoalitionDynamics(
  args: unknown
): Promise<ToolResult> {
  const params = AnalyzeCoalitionDynamicsSchema.parse(args);

  try {
    const targetGroups = normalizeTargetGroups(params.groupIds ?? POLITICAL_GROUPS);
    if (targetGroups.length === 0) {
      throw new Error(
        'groupIds must contain at least one recognizable political-group identifier — '
        + 'all provided values were empty, whitespace-only, or normalized to "unknown"'
      );
    }
    const fetchResult = await fetchAllCurrentMEPs();
    const { metrics: groupMetrics, unrecognizedGroups } = buildGroupMetrics(targetGroups, fetchResult.meps);
    const coalitionPairs = buildCoalitionPairs(targetGroups, params.minimumCohesion, groupMetrics);
    const sortedPairs = [...coalitionPairs].sort((a, b) => b.sizeSimilarityScore - a.sizeSimilarityScore);
    const stressIndicators = computeStressIndicators(groupMetrics);
    const fragMetrics = computeFragmentationMetrics(groupMetrics);

    const missingGroups = groupMetrics.filter(g => g.memberCount === 0).map(g => g.groupId);
    const groupsKnown = groupMetrics.length - missingGroups.length;
    const coverageComplete = missingGroups.length === 0;

    const warnings = buildCoverageWarnings(fetchResult, missingGroups, groupMetrics.length, unrecognizedGroups);

    const analysis: CoalitionDynamicsAnalysis = {
      period: { from: params.dateFrom ?? '2024-01-01', to: params.dateTo ?? '2024-12-31' },
      groupMetrics,
      coalitionPairs: sortedPairs,
      dominantCoalition: buildDominantCoalition(sortedPairs),
      stressIndicators,
      computedAttributes: buildCoalitionComputedAttrs(fragMetrics, sortedPairs, coverageComplete),
      coverage: {
        groupsKnown,
        groupsTotal: groupMetrics.length,
        unrecognizedGroups,
      },
      confidenceLevel: 'LOW',
      dataFreshness: 'Real-time EP API data — political group composition from current MEP records',
      sourceAttribution: 'European Parliament Open Data Portal - data.europarl.europa.eu',
      methodology: 'CIA Coalition Analysis — group composition from real EP Open Data MEP records. '
        + 'Raw political-group labels from the EP API are normalized to canonical short codes '
        + '(e.g. full names, URI suffixes, and EP9→EP10 successions such as ID→PfE are mapped). '
        + 'Per-MEP voting statistics are not available from the EP API /meps/{id} endpoint; '
        + 'each group metric has dataAvailability: UNAVAILABLE with null cohesion/defection/attendance. '
        + 'coalitionPairs[].sizeSimilarityScore is a group-size ratio proxy (min/max member counts), NOT vote-level cohesion; '
        + 'coalitionPairs[].cohesion, coalitionPairs[].trend, coalitionPairs[].sharedVotes, and coalitionPairs[].totalVotes are null '
        + '(not computed from vote-level data — vote-alignment data is not available via the EP Open Data Portal). '
        + 'When any target group returns memberCount: 0 the parliamentaryFragmentation and '
        + 'effectiveNumberOfParties fields are emitted as null to avoid a plausible-but-wrong score. '
        + 'Data source: European Parliament Open Data Portal.',
      dataQualityWarnings: warnings,
      methodologyNote:
        'coalitionPairs[].sizeSimilarityScore is derived from group-size ratios '
        + '(min(sizeA, sizeB) / max(sizeA, sizeB)) and is NOT vote-level cohesion '
        + '(Hix/Noury/Roland sense). coalitionPairs[].cohesion and coalitionPairs[].trend '
        + 'are emitted as null because vote-alignment data is not available via the EP Open Data Portal. '
        + 'The public input parameter `minimumCohesion` is preserved for backward compatibility '
        + 'but is currently applied as a threshold on coalitionPairs[].sizeSimilarityScore until '
        + 'vote-level cohesion data becomes available.',
    };

    return buildToolResponse(analysis);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    auditLogger.logError('analyze_coalition_dynamics', params, toErrorMessage(error));
    throw new Error(`Failed to analyze coalition dynamics: ${errorMessage}`);
  }
}

/**
 * Tool metadata for MCP registration
 */
export const analyzeCoalitionDynamicsToolMetadata = {
  name: 'analyze_coalition_dynamics',
  description: 'Analyze political group coalition dynamics including cohesion rates, cross-party alliances, defection rates, and stress indicators. Computes parliamentary fragmentation index, effective number of parties, grand coalition viability, and opposition strength. Uses CIA Coalition Analysis methodology.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      groupIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Political group identifiers to analyze (omit for all groups)',
        minItems: 1,
        maxItems: 10
      },
      dateFrom: {
        type: 'string',
        description: 'Analysis start date (YYYY-MM-DD format)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$'
      },
      dateTo: {
        type: 'string',
        description: 'Analysis end date (YYYY-MM-DD format)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$'
      },
      minimumCohesion: {
        type: 'number',
        description: 'Threshold for coalition allianceSignal detection (0-1, default 0.5). NOTE: Until per-MEP roll-call data is exposed by the EP Open Data Portal, this is applied to coalitionPairs[].sizeSimilarityScore (a group-size ratio proxy) — NOT to vote-level cohesion. The parameter name is preserved for backward compatibility.',
        minimum: 0,
        maximum: 1,
        default: 0.5
      }
    }
  }
};
