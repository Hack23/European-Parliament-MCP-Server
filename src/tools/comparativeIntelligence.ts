/**
 * MCP Tool: comparative_intelligence
 *
 * Cross-reference MEP activities across committees, delegations, and
 * legislative procedures for comprehensive multi-dimensional profiling.
 * Enables side-by-side comparison and cluster analysis of 2-10 MEPs.
 *
 * **Intelligence Perspective:** Comparative intelligence enables ranking,
 * outlier detection, and natural clustering of MEPs—essential for
 * identifying coalition partners, influence leaders, and behavioral outliers.
 *
 * **Business Perspective:** Valuable for B2G/B2B/B2C clients—including
 * government affairs teams, lobbying firms, and strategic consultancies—
 * who need objective, data-driven MEP benchmarking for stakeholder
 * prioritisation, engagement planning, and political risk scoring.
 *
 * **Marketing Perspective:** Compelling showcase for journalists, academic
 * researchers, and civic-tech developers who want side-by-side MEP
 * comparisons and cluster analysis without building custom analytics pipelines.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { z } from 'zod';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse, buildErrorResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';
import { auditLogger, toErrorMessage } from '../utils/auditLogger.js';

export const ComparativeIntelligenceSchema = z.object({
  mepIds: z.array(z.number().positive())
    .min(2)
    .max(10)
    .describe('List of MEP IDs to compare (2-10 MEPs)'),
  dimensions: z.array(
    z.enum(['voting', 'committee', 'legislative', 'attendance'])
  )
    .optional()
    .default(['voting', 'committee', 'legislative', 'attendance'])
    .describe('Dimensions to include in the comparison')
});

export type ComparativeIntelligenceParams = z.infer<typeof ComparativeIntelligenceSchema>;

type Dimension = 'voting' | 'committee' | 'legislative' | 'attendance';

interface MepProfile {
  mepId: string;
  name: string;
  politicalGroup: string;
  country: string;
  scores: Partial<Record<Dimension, number>>;
  overallScore: number;
  clusterLabel: string;
}

interface DimensionRanking {
  dimension: Dimension;
  ranking: { rank: number; mepId: string; name: string; score: number }[];
}

interface MepCluster {
  clusterId: string;
  members: string[];
  characteristicDimension: Dimension;
  avgScore: number;
}

interface PairScore {
  mepA: string;
  mepB: string;
  similarityScore: number;
}

interface ComparativeIntelligenceResult {
  mepCount: number;
  dimensions: Dimension[];
  profiles: MepProfile[];
  rankingByDimension: DimensionRanking[];
  correlationMatrix: PairScore[];
  outlierMEPs: { mepId: string; name: string; outlierDimension: Dimension; outlierScore: number; zScore: number }[];
  clusterAnalysis: MepCluster[];
  computedAttributes: {
    mostSimilarPair: { mepA: string; mepB: string; similarity: number | null };
    mostDifferentPair: { mepA: string; mepB: string; similarity: number | null };
    topOverallPerformer: string;
    lowestOverallPerformer: string;
    dimensionWithHighestVariance: Dimension;
  };
  dataAvailable: boolean;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  dataFreshness: string;
  sourceAttribution: string;
  methodology: string;
}

interface MEPApiData {
  id: string;
  name: string;
  country: string;
  politicalGroup: string;
  committees: string[];
  roles?: string[];
  votingStatistics?: {
    totalVotes: number;
    votesFor: number;
    abstentions: number;
    attendanceRate: number;
  };
};

/**
 * Computes a normalized voting score (0–100) for an MEP based on
 * participation volume and for-vote ratio.
 *
 * Scoring formula (equal weights):
 * - **Participation** (50%) — capped linear scale: `min(100, totalVotes / 1500 × 100)`.
 *   Threshold 1500 is the approximate maximum votes cast in a full EP term, so an
 *   MEP attending every vote scores 100.
 * - **For-vote ratio** (50%) — proportion of recorded votes cast *for* (`votesFor / totalVotes`).
 *   This is a simple yes-vote share and does **not** compare against party, group, or
 *   plenary majorities; it should not be interpreted as a formal party-line cohesion index.
 *
 * Current data limitation:
 * - `epClient.getMEPDetails()` populates `votingStatistics` with placeholder values
 *   (all zeros) because the `/meps/{id}` endpoint does not expose real voting statistics.
 * - Consequently, `stats.totalVotes` will typically be `0`, and this function will
 *   return `0` for most MEPs. Consumers MUST NOT treat this score as a meaningful
 *   voting metric until real EP voting data is integrated into the client/tooling.
 *
 * Returns `0` when no voting statistics are available, or when placeholder statistics
 * with `totalVotes === 0` are supplied, to avoid misleading scores.
 *
 * @param mep - MEP API data record containing optional `votingStatistics`
 * @returns Normalized score in the range `[0, 100]`, rounded to 2 decimal places;
 *   typically `0` due to EP API data limitations
 *
 * @security Handles missing or zeroed `votingStatistics` gracefully; never divides by zero
 */
function computeVotingScore(mep: MEPApiData): number {
  const stats = mep.votingStatistics;
  if (stats === undefined || stats.totalVotes === 0) return 0;
  const participationScore = Math.min(100, (stats.totalVotes / 1500) * 100);
  const forVoteRatioScore = (stats.votesFor / stats.totalVotes) * 100;
  return Math.round((participationScore * 0.5 + forVoteRatioScore * 0.5) * 100) / 100;
}

/**
 * Computes a normalized committee engagement score (0–100) for an MEP.
 *
 * Scoring formula:
 * - **Membership breadth** (60%) — `min(100, committeeCount × 20)`. Five committees → 100.
 * - **Leadership roles** (40%) — `min(100, leadershipRoles × 25)`. Four chair/vice-chair
 *   roles → 100. Roles are detected by the keywords `'chair'` or `'vice'`.
 *
 * @param mep - MEP API data record containing `committees` and optional `roles`
 * @returns Normalized score in the range `[0, 100]`, rounded to 2 decimal places
 */
function computeCommitteeScore(mep: MEPApiData): number {
  const membershipScore = Math.min(100, mep.committees.length * 20);
  const roles = mep.roles ?? [];
  const leadershipCount = roles.filter(r => r.toLowerCase().includes('chair') || r.toLowerCase().includes('vice')).length;
  const leadershipScore = Math.min(100, leadershipCount * 25);
  return Math.round((membershipScore * 0.6 + leadershipScore * 0.4) * 100) / 100;
}

/**
 * Computes a normalized legislative output score (0–100) for an MEP.
 *
 * Combines two equally-weighted signals, capped at 100:
 * - **Rapporteurships** — 15 points each (6+ → 90 pts from this factor alone).
 * - **Committee memberships** — 10 points each (broader presence amplifies legislative reach).
 *
 * Rapporteurships are detected by the `'rapporteur'` keyword in the MEP's roles list.
 *
 * @param mep - MEP API data record containing `committees` and optional `roles`
 * @returns Normalized score in the range `[0, 100]`, rounded to 2 decimal places
 */
function computeLegislativeScore(mep: MEPApiData): number {
  const roles = mep.roles ?? [];
  const rapporteurships = roles.filter(r => r.toLowerCase().includes('rapporteur')).length;
  return Math.round(Math.min(100, rapporteurships * 15 + mep.committees.length * 10) * 100) / 100;
}

/**
 * Computes the attendance score for an MEP using `votingStatistics.attendanceRate` when available.
 *
 * The `attendanceRate` field is expected on a 0–100 scale, so this function applies
 * rounding only—no additional scaling is performed.
 *
 * When `votingStatistics` or `attendanceRate` is absent, this function returns `0`.
 * Because the current `/meps/{id}` EP endpoint does not expose attendance or voting
 * statistics, callers should interpret a value of `0` as "attendance data currently
 * unavailable" rather than a measured attendance rate.
 *
 * @param mep - MEP API data record containing optional `votingStatistics`
 * @returns Numeric attendance score in the range `[0, 100]`; `0` typically indicates
 *   that attendance data is not available from the underlying EP API
 */
function computeAttendanceScore(mep: MEPApiData): number {
  // attendanceRate is already in the 0-100 range; use it directly without scaling
  return Math.round((mep.votingStatistics?.attendanceRate ?? 0) * 100) / 100;
}

/**
 * Computes per-dimension scores for an MEP and returns them as a partial record.
 *
 * Delegates each dimension to the corresponding scoring function:
 * - `'voting'` → {@link computeVotingScore}
 * - `'committee'` → {@link computeCommitteeScore}
 * - `'legislative'` → {@link computeLegislativeScore}
 * - `'attendance'` → {@link computeAttendanceScore}
 *
 * @param mep - MEP API data record to score
 * @param dimensions - Ordered list of dimensions to evaluate
 * @returns Partial record mapping each requested dimension to its score (0–100)
 */
function computeDimensionScores(mep: MEPApiData, dimensions: Dimension[]): Partial<Record<Dimension, number>> {
  const scores: Partial<Record<Dimension, number>> = {};
  for (const dim of dimensions) {
    if (dim === 'voting') scores.voting = computeVotingScore(mep);
    else if (dim === 'committee') scores.committee = computeCommitteeScore(mep);
    else if (dim === 'legislative') scores.legislative = computeLegislativeScore(mep);
    else scores.attendance = computeAttendanceScore(mep);
  }
  return scores;
}

/**
 * Computes the unweighted mean of all defined dimension scores.
 *
 * Undefined scores (e.g., a dimension that was not requested) are filtered out
 * before averaging to avoid artificially penalising MEPs for missing dimensions.
 *
 * @param scores - Partial dimension score record from {@link computeDimensionScores}
 * @returns Mean score in `[0, 100]` rounded to 2 decimal places, or `0` if empty
 */
function computeOverallScore(scores: Partial<Record<Dimension, number>>): number {
  const values = (Object.values(scores) as (number | undefined)[]).filter((v): v is number => v !== undefined);
  if (values.length === 0) return 0;
  return Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 100) / 100;
}

/**
 * Assigns a human-readable performance-tier cluster label to an MEP.
 *
 * Labels follow the pattern `<tier>_<sanitised_group>` so downstream consumers
 * can group MEPs by both performance and political affiliation:
 * - **`high_performer_*`** — overall score ≥ 60
 * - **`moderate_performer_*`** — overall score in [30, 60)
 * - **`low_data_profile`** — score < 30 or insufficient data
 *
 * The political group name is lower-cased and non-letter characters are replaced
 * with underscores before embedding in the label.
 *
 * @param overallScore - MEP's computed overall score (0–100)
 * @param politicalGroup - Raw political group string (e.g., `'EPP'`, `'S&D'`)
 * @returns Cluster label string suitable for display and grouping
 */
function assignClusterLabel(overallScore: number, politicalGroup: string): string {
  const safeGroup = politicalGroup.toLowerCase().replace(/[^a-z]/g, '_');
  if (overallScore >= 60) return `high_performer_${safeGroup}`;
  if (overallScore >= 30) return `moderate_performer_${safeGroup}`;
  return 'low_data_profile';
}

/**
 * Computes cosine similarity between two MEP dimension-score vectors.
 *
 * Cosine similarity measures the angle between two vectors independent of
 * magnitude — two MEPs with proportionally identical scores across all
 * dimensions produce a similarity of 1.0 regardless of absolute score levels.
 *
 * Dimensions present in `scoresA` but absent from `scoresB` are treated as 0
 * for `scoresB`. Dimensions absent from `scoresA` are ignored entirely.
 *
 * @param scoresA - Dimension scores for MEP A
 * @param scoresB - Dimension scores for MEP B
 * @returns Cosine similarity in `[0, 1]` rounded to 2 decimal places,
 *   or `0` if either vector is all-zero or empty
 */
function computeSimilarity(scoresA: Partial<Record<Dimension, number>>, scoresB: Partial<Record<Dimension, number>>): number {
  const dims = Object.keys(scoresA) as Dimension[];
  if (dims.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (const dim of dims) {
    const a = scoresA[dim] ?? 0;
    const b = scoresB[dim] ?? 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return Math.round((dotProduct / denominator) * 100) / 100;
}

/**
 * Identifies statistical outliers across all MEP profiles and dimensions.
 *
 * Uses **z-score outlier detection**: for each dimension, computes the population
 * mean and standard deviation across all profiles, then flags any MEP whose score
 * deviates by |z| ≥ 1.5 from the mean.
 *
 * **Threshold rationale:** A z-score threshold of 1.5 captures approximately 6.7%
 * of a normal distribution in each tail (~13.4% two-sided) — a balanced sensitivity
 * that surfaces meaningful outliers without flagging too many borderline cases.
 * Stricter thresholds (2.0+) would miss genuine policy outliers in small groups.
 *
 * Results are sorted by |z-score| descending and capped at the top 5 outlier entries
 * to keep the response concise.
 *
 * @param profiles - Array of computed MEP profiles (must contain at least 2 entries
 *   for meaningful statistics)
 * @param dimensions - Dimensions to evaluate for outliers
 * @returns Array of up to 5 outlier records, each containing the MEP identity,
 *   outlier dimension, raw score, and rounded z-score
 */
function detectOutliers(profiles: MepProfile[], dimensions: Dimension[]): ComparativeIntelligenceResult['outlierMEPs'] {
  const outliers: ComparativeIntelligenceResult['outlierMEPs'] = [];
  for (const dim of dimensions) {
    const scores = profiles.map(p => p.scores[dim] ?? 0);
    const mean = scores.reduce((s, v) => s + v, 0) / scores.length;
    const variance = scores.reduce((s, v) => s + (v - mean) ** 2, 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    for (const profile of profiles) {
      const score = profile.scores[dim] ?? 0;
      const zScore = stdDev > 0 ? (score - mean) / stdDev : 0;
      if (Math.abs(zScore) >= 1.5) { // z ≥ 1.5σ: captures ~6.7% in each tail (~13.4% combined); balanced outlier sensitivity
        outliers.push({ mepId: profile.mepId, name: profile.name, outlierDimension: dim, outlierScore: score, zScore: Math.round(zScore * 100) / 100 });
      }
    }
  }
  return outliers.sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore)).slice(0, 5);
}

/**
 * Returns the dimension with the highest average score across all cluster members.
 *
 * Used to characterise a cluster by its strongest dimension — e.g., a cluster
 * dominated by committee chairs would surface `'committee'` as its characteristic.
 *
 * @param dimAvgs - Map of dimension → average score for the cluster
 * @param dimensions - Full ordered list of dimensions (provides a safe fallback)
 * @returns Dimension key with the highest average score, or the first dimension
 *   if all averages are ≤ 0
 */
function findBestDimension(dimAvgs: Partial<Record<Dimension, number>>, dimensions: Dimension[]): Dimension {
  let best: Dimension = dimensions[0] ?? 'voting';
  let bestAvg = -1;
  for (const dim of dimensions) {
    const avg = dimAvgs[dim] ?? 0;
    if (avg > bestAvg) { bestAvg = avg; best = dim; }
  }
  return best;
}

/**
 * Groups MEP profiles into clusters based on their pre-assigned `clusterLabel` and
 * computes per-cluster statistics.
 *
 * Cluster assignment uses a two-factor scheme: performance tier (`high/moderate/low`)
 * combined with political group affiliation (from {@link assignClusterLabel}). For each
 * cluster the function calculates:
 * - Per-dimension average scores
 * - Overall average score across all dimensions
 * - The characteristic dimension (highest average, via {@link findBestDimension})
 *
 * This approach is deterministic and requires no random seed, making it reproducible
 * across runs with the same input.
 *
 * @param profiles - Array of scored MEP profiles (each must have a `clusterLabel`)
 * @param dimensions - Dimensions to aggregate within each cluster
 * @returns Array of {@link MepCluster} objects, one per distinct cluster label
 */
function buildClusterAnalysis(profiles: MepProfile[], dimensions: Dimension[]): MepCluster[] {
  const clusterMap = new Map<string, { members: string[]; dimScores: Partial<Record<Dimension, number[]>> }>();

  for (const profile of profiles) {
    const label = profile.clusterLabel;
    if (!clusterMap.has(label)) {
      clusterMap.set(label, { members: [], dimScores: {} });
    }
    const entry = clusterMap.get(label);
    if (entry === undefined) continue;
    entry.members.push(profile.mepId);
    for (const dim of dimensions) {
      const score = profile.scores[dim] ?? 0;
      const existing = entry.dimScores[dim];
      if (existing === undefined) {
        entry.dimScores[dim] = [score];
      } else {
        existing.push(score);
      }
    }
  }

  return Array.from(clusterMap.entries()).map(([clusterId, data]) => {
    const dimAvgs: Partial<Record<Dimension, number>> = {};
    for (const dim of dimensions) {
      const vals = data.dimScores[dim] ?? [];
      dimAvgs[dim] = vals.length > 0
        ? Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 100) / 100
        : 0;
    }
    const allDimAvg = (Object.values(dimAvgs) as (number | undefined)[]).filter((v): v is number => v !== undefined);
    const overallAvg = allDimAvg.length > 0
      ? Math.round((allDimAvg.reduce((s, v) => s + v, 0) / allDimAvg.length) * 100) / 100
      : 0;
    return { clusterId, members: data.members, characteristicDimension: findBestDimension(dimAvgs, dimensions), avgScore: overallAvg };
  });
}

/**
 * Builds a zero-value {@link ComparativeIntelligenceResult} for cases where
 * fewer than 2 valid MEP profiles could be constructed.
 *
 * All analytical fields (rankings, correlations, outliers, clusters) are empty.
 * `dataAvailable` is set to `false` and `confidenceLevel` to `'LOW'` to signal
 * that no meaningful comparison could be performed.
 *
 * @param profiles - Partial list of profiles that were successfully built (may be empty)
 * @param dimensions - Dimensions originally requested by the caller
 * @returns A safe empty result that can be returned directly to the MCP client
 */
function buildEmptyResult(profiles: MepProfile[], dimensions: Dimension[]): ComparativeIntelligenceResult {
  return {
    mepCount: profiles.length,
    dimensions,
    profiles,
    rankingByDimension: [],
    correlationMatrix: [],
    outlierMEPs: [],
    clusterAnalysis: [],
    computedAttributes: {
      mostSimilarPair: { mepA: 'N/A', mepB: 'N/A', similarity: null },
      mostDifferentPair: { mepA: 'N/A', mepB: 'N/A', similarity: null },
      topOverallPerformer: 'N/A',
      lowestOverallPerformer: 'N/A',
      dimensionWithHighestVariance: dimensions[0] ?? 'voting'
    },
    dataAvailable: false,
    confidenceLevel: 'LOW',
    dataFreshness: 'Insufficient MEP data retrieved',
    sourceAttribution: 'European Parliament Open Data Portal - data.europarl.europa.eu',
    methodology: 'Comparative intelligence requires at least 2 valid MEP profiles.'
  };
}

/**
 * Creates a zero-score placeholder profile for an MEP whose API call failed.
 *
 * Placeholder profiles allow the comparison to continue with the MEPs that
 * were successfully retrieved, while still accounting for the requested ID in
 * the output (so consumers can see which MEPs produced no data).
 *
 * @param mepId - Numeric MEP ID that failed to resolve
 * @returns Placeholder {@link MepProfile} with zeroed scores and `'low_data_profile'` label
 */
function buildPlaceholderProfile(mepId: number): MepProfile {
  return {
    mepId: String(mepId),
    name: `MEP-${String(mepId)} (not found)`,
    politicalGroup: 'Unknown',
    country: 'Unknown',
    scores: {},
    overallScore: 0,
    clusterLabel: 'low_data_profile'
  };
}

/**
 * Produces per-dimension ranked lists of all MEPs in descending score order.
 *
 * Each {@link DimensionRanking} entry contains an ordered array where `rank: 1`
 * is the highest scorer. Ties are resolved by the underlying sort algorithm
 * (stable in V8/Node.js ≥ 11).
 *
 * @param profiles - Scored MEP profiles to rank
 * @param dimensions - Dimensions for which rankings should be produced
 * @returns Array of ranking objects, one per dimension
 */
function buildRankings(profiles: MepProfile[], dimensions: Dimension[]): DimensionRanking[] {
  return dimensions.map(dim => ({
    dimension: dim,
    ranking: [...profiles]
      .sort((a, b) => (b.scores[dim] ?? 0) - (a.scores[dim] ?? 0))
      .map((p, idx) => ({ rank: idx + 1, mepId: p.mepId, name: p.name, score: p.scores[dim] ?? 0 }))
  }));
}

/**
 * Computes pairwise cosine-similarity scores for all unique MEP pairs.
 *
 * Only the upper triangle of the similarity matrix is computed (i < j) to
 * avoid duplicating symmetric entries. The result is an unordered list of
 * {@link PairScore} objects, one per unique pair.
 *
 * @param profiles - Scored MEP profiles; order determines pair enumeration
 * @returns Array of pairwise similarity records (length = n*(n-1)/2)
 */
function buildCorrelationMatrix(profiles: MepProfile[]): PairScore[] {
  const matrix: PairScore[] = [];
  for (let i = 0; i < profiles.length; i++) {
    for (let j = i + 1; j < profiles.length; j++) {
      const a = profiles[i];
      const b = profiles[j];
      if (a === undefined || b === undefined) continue;
      matrix.push({ mepA: a.mepId, mepB: b.mepId, similarityScore: computeSimilarity(a.scores, b.scores) });
    }
  }
  return matrix;
}

/**
 * Identifies the dimension with the highest score variance across all profiles.
 *
 * High variance in a dimension indicates strong differentiation among the MEPs
 * being compared — useful for surfacing which axis is most discriminating.
 *
 * @param profiles - Scored MEP profiles
 * @param dimensions - Dimensions to evaluate; must contain at least one entry
 * @returns Dimension key with the greatest population variance, or the first
 *   dimension if all variances are equal (or zero)
 */
function findHighestVarianceDim(profiles: MepProfile[], dimensions: Dimension[]): Dimension {
  let best: Dimension = dimensions[0] ?? 'voting';
  let bestVariance = -1;
  for (const dim of dimensions) {
    const vals = profiles.map(p => p.scores[dim] ?? 0);
    const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
    const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length;
    if (variance > bestVariance) { bestVariance = variance; best = dim; }
  }
  return best;
}

/**
 * Converts an array of settled `getMEPDetails` promises into scored MEP profiles.
 *
 * For each fulfilled result, dimension scores and an overall score are computed
 * and a cluster label is assigned. For each rejected result (API error, unknown MEP),
 * a zero-score placeholder profile is inserted to preserve the requested ID in the
 * output.
 *
 * @param detailsResults - Settled promise results from `Promise.allSettled`
 * @param mepIds - Original MEP IDs in the same order as `detailsResults`
 * @param dimensions - Dimensions to score for each successfully resolved MEP
 * @returns Array of {@link MepProfile} objects in the same order as `mepIds`
 */
function buildProfilesFromResults(
  detailsResults: PromiseSettledResult<unknown>[],
  mepIds: number[],
  dimensions: Dimension[]
): MepProfile[] {
  const profiles: MepProfile[] = [];
  for (let i = 0; i < detailsResults.length; i++) {
    const result = detailsResults[i];
    const mepId = mepIds[i];
    if (result === undefined || mepId === undefined) continue;
    if (result.status === 'fulfilled') {
      const mep = result.value as MEPApiData;
      const scores = computeDimensionScores(mep, dimensions);
      const overallScore = computeOverallScore(scores);
      profiles.push({
        mepId: mep.id,
        name: mep.name,
        politicalGroup: mep.politicalGroup,
        country: mep.country,
        scores,
        overallScore,
        clusterLabel: assignClusterLabel(overallScore, mep.politicalGroup)
      });
    } else {
      profiles.push(buildPlaceholderProfile(mepId));
    }
  }
  return profiles;
}

/**
 * Derives the `computedAttributes` block of the comparative intelligence result.
 *
 * Identifies:
 * - **Most similar pair** — highest-scoring entry in the sorted correlation matrix
 * - **Most different pair** — lowest-scoring entry in the sorted correlation matrix
 * - **Top/lowest overall performers** — sorted by `overallScore` descending
 * - **Dimension with highest variance** — via {@link findHighestVarianceDim}
 *
 * Defaults to `'N/A'` / 0 for any field that cannot be derived from an empty matrix.
 *
 * @param profiles - Scored MEP profiles
 * @param correlationMatrix - Pre-computed pairwise similarity scores
 * @param dimensions - Dimensions available for variance calculation
 * @returns Derived summary attributes for the comparison result
 */
function buildComputedAttributes(
  profiles: MepProfile[],
  correlationMatrix: PairScore[],
  dimensions: Dimension[]
): ComparativeIntelligenceResult['computedAttributes'] {
  const sortedCorr = [...correlationMatrix].sort((a, b) => b.similarityScore - a.similarityScore);
  const firstPair = sortedCorr[0];
  const lastPair = sortedCorr[sortedCorr.length - 1];
  const mostSimilarPair = firstPair !== undefined
    ? { mepA: firstPair.mepA, mepB: firstPair.mepB, similarity: firstPair.similarityScore }
    : { mepA: 'N/A', mepB: 'N/A', similarity: null };
  const mostDifferentPair = lastPair !== undefined
    ? { mepA: lastPair.mepA, mepB: lastPair.mepB, similarity: lastPair.similarityScore }
    : { mepA: 'N/A', mepB: 'N/A', similarity: null };
  const sortedByOverall = [...profiles].sort((a, b) => b.overallScore - a.overallScore);
  return {
    mostSimilarPair,
    mostDifferentPair,
    topOverallPerformer: sortedByOverall[0]?.name ?? 'N/A',
    lowestOverallPerformer: sortedByOverall[sortedByOverall.length - 1]?.name ?? 'N/A',
    dimensionWithHighestVariance: findHighestVarianceDim(profiles, dimensions)
  };
}

export async function comparativeIntelligence(params: ComparativeIntelligenceParams): Promise<ToolResult> {
  try {
    const dimensions = params.dimensions as Dimension[];

    const detailsResults = await Promise.allSettled(
      params.mepIds.map(id => epClient.getMEPDetails(String(id)))
    );

    const profiles = buildProfilesFromResults(detailsResults, params.mepIds, dimensions);

    if (profiles.length < 2) {
      return buildToolResponse(buildEmptyResult(profiles, dimensions));
    }

    const rankingByDimension = buildRankings(profiles, dimensions);
    const correlationMatrix = buildCorrelationMatrix(profiles);
    const dataWithScores = profiles.filter(p => p.overallScore > 0).length;
    const confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW' =
      dataWithScores >= params.mepIds.length * 0.8 ? 'MEDIUM' : 'LOW';

    const result: ComparativeIntelligenceResult = {
      mepCount: profiles.length,
      dimensions,
      profiles,
      rankingByDimension,
      correlationMatrix,
      outlierMEPs: detectOutliers(profiles, dimensions),
      clusterAnalysis: buildClusterAnalysis(profiles, dimensions),
      computedAttributes: buildComputedAttributes(profiles, correlationMatrix, dimensions),
      dataAvailable: profiles.some(p => p.overallScore > 0),
      confidenceLevel,
      dataFreshness: 'Real-time EP API data — MEP profiles from current EP Open Data',
      sourceAttribution: 'European Parliament Open Data Portal - data.europarl.europa.eu',
      methodology: 'Multi-dimensional MEP profiling and comparison. '
        + 'Voting score: participation volume (50%) + for-vote rate (50%). '
        + 'Committee score: membership breadth (60%) + leadership roles (40%). '
        + 'Legislative score: rapporteurships (15 pts each) + committee count (10 pts each). '
        + 'Attendance score: placeholder only — EP /meps/{id} does not expose attendance data; value is 0 until real data is available. '
        + 'Similarity: cosine similarity between score vectors. '
        + 'Outliers: z-score ≥ 1.5 standard deviations from group mean. '
        + 'Clusters: grouped by political group + performance tier. '
        + 'NOTE: Voting and attendance statistics are not available from the current EP API; all related scores are placeholder zeros. '
        + 'Data source: https://data.europarl.europa.eu/api/v2/meps'
    };

    return buildToolResponse(result);
  } catch (error) {
    auditLogger.logError('comparative_intelligence', params as Record<string, unknown>, toErrorMessage(error));
    return buildErrorResponse(
      error instanceof Error ? error : new Error(String(error)),
      'comparative_intelligence'
    );
  }
}

export const comparativeIntelligenceToolMetadata = {
  name: 'comparative_intelligence',
  description: 'Cross-reference 2-10 MEP activities across voting, committee, legislative, and attendance dimensions. Returns ranked profiles, correlation matrix, outlier detection, and cluster analysis for comprehensive comparative intelligence.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      mepIds: {
        type: 'array',
        items: { type: 'number' },
        description: 'List of MEP IDs to compare (2-10 MEPs)',
        minItems: 2,
        maxItems: 10
      },
      dimensions: {
        type: 'array',
        items: { type: 'string', enum: ['voting', 'committee', 'legislative', 'attendance'] },
        description: 'Dimensions to include in the comparison',
        default: ['voting', 'committee', 'legislative', 'attendance']
      }
    },
    required: ['mepIds']
  }
};

export async function handleComparativeIntelligence(args: unknown): Promise<ToolResult> {
  const params = ComparativeIntelligenceSchema.parse(args);
  return comparativeIntelligence(params);
}
