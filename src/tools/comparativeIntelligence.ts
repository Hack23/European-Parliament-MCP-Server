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
import { auditLogger } from '../utils/auditLogger.js';

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
    mostSimilarPair: { mepA: string; mepB: string; similarity: number };
    mostDifferentPair: { mepA: string; mepB: string; similarity: number };
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

function computeVotingScore(mep: MEPApiData): number {
  const stats = mep.votingStatistics;
  if (stats === undefined || stats.totalVotes === 0) return 0;
  const participationScore = Math.min(100, (stats.totalVotes / 1500) * 100);
  const loyaltyScore = (stats.votesFor / stats.totalVotes) * 100;
  return Math.round((participationScore * 0.5 + loyaltyScore * 0.5) * 100) / 100;
}

function computeCommitteeScore(mep: MEPApiData): number {
  const membershipScore = Math.min(100, mep.committees.length * 20);
  const roles = mep.roles ?? [];
  const leadershipCount = roles.filter(r => r.toLowerCase().includes('chair') || r.toLowerCase().includes('vice')).length;
  const leadershipScore = Math.min(100, leadershipCount * 25);
  return Math.round((membershipScore * 0.6 + leadershipScore * 0.4) * 100) / 100;
}

function computeLegislativeScore(mep: MEPApiData): number {
  const roles = mep.roles ?? [];
  const rapporteurships = roles.filter(r => r.toLowerCase().includes('rapporteur')).length;
  return Math.round(Math.min(100, rapporteurships * 15 + mep.committees.length * 10) * 100) / 100;
}

function computeAttendanceScore(mep: MEPApiData): number {
  // attendanceRate is already in the 0-100 range; use it directly without scaling
  return Math.round((mep.votingStatistics?.attendanceRate ?? 0) * 100) / 100;
}

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

function computeOverallScore(scores: Partial<Record<Dimension, number>>): number {
  const values = (Object.values(scores) as (number | undefined)[]).filter((v): v is number => v !== undefined);
  if (values.length === 0) return 0;
  return Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 100) / 100;
}

function assignClusterLabel(overallScore: number, politicalGroup: string): string {
  const safeGroup = politicalGroup.toLowerCase().replace(/[^a-z]/g, '_');
  if (overallScore >= 60) return `high_performer_${safeGroup}`;
  if (overallScore >= 30) return `moderate_performer_${safeGroup}`;
  return 'low_data_profile';
}

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
      if (Math.abs(zScore) >= 1.5) { // z ≥ 1.5σ: captures ~13% of observations in each tail; balanced outlier sensitivity
        outliers.push({ mepId: profile.mepId, name: profile.name, outlierDimension: dim, outlierScore: score, zScore: Math.round(zScore * 100) / 100 });
      }
    }
  }
  return outliers.sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore)).slice(0, 5);
}

function findBestDimension(dimAvgs: Partial<Record<Dimension, number>>, dimensions: Dimension[]): Dimension {
  let best: Dimension = dimensions[0] ?? 'voting';
  let bestAvg = -1;
  for (const dim of dimensions) {
    const avg = dimAvgs[dim] ?? 0;
    if (avg > bestAvg) { bestAvg = avg; best = dim; }
  }
  return best;
}

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
      mostSimilarPair: { mepA: 'N/A', mepB: 'N/A', similarity: 0 },
      mostDifferentPair: { mepA: 'N/A', mepB: 'N/A', similarity: 0 },
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

function buildRankings(profiles: MepProfile[], dimensions: Dimension[]): DimensionRanking[] {
  return dimensions.map(dim => ({
    dimension: dim,
    ranking: [...profiles]
      .sort((a, b) => (b.scores[dim] ?? 0) - (a.scores[dim] ?? 0))
      .map((p, idx) => ({ rank: idx + 1, mepId: p.mepId, name: p.name, score: p.scores[dim] ?? 0 }))
  }));
}

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
    : { mepA: 'N/A', mepB: 'N/A', similarity: 0 };
  const mostDifferentPair = lastPair !== undefined
    ? { mepA: lastPair.mepA, mepB: lastPair.mepB, similarity: lastPair.similarityScore }
    : { mepA: 'N/A', mepB: 'N/A', similarity: 0 };
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
        + 'Attendance score: direct from EP API attendance rate. '
        + 'Similarity: cosine similarity between score vectors. '
        + 'Outliers: z-score ≥ 1.5 standard deviations from group mean. '
        + 'Clusters: grouped by political group + performance tier. '
        + 'NOTE: Voting statistics availability varies by MEP. '
        + 'Data source: https://data.europarl.europa.eu/api/v2/meps'
    };

    return buildToolResponse(result);
  } catch (error) {
    auditLogger.logError('comparative_intelligence', {}, String(error));
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
