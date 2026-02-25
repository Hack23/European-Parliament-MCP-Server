/**
 * MCP Tool: assess_mep_influence
 * 
 * Compute MEP influence score from voting activity, committee roles,
 * rapporteurships, questions filed, and coalition building metrics.
 * 
 * **Intelligence Perspective:** Core OSINT scorecard tool computing composite MEP
 * influence scores using CIA Political Scorecards methodology—enables comparative
 * ranking, trend analysis, and political weight assessment across 5 dimensions.
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { AssessMepInfluenceSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Dimension weight configuration for influence scoring
 * Based on CIA Political Scorecards methodology from FUTURE_ARCHITECTURE.md
 */
const DIMENSION_WEIGHTS = {
  votingActivity: 0.25,
  legislativeOutput: 0.25,
  committeeEngagement: 0.20,
  parliamentaryOversight: 0.15,
  coalitionBuilding: 0.15
} as const;

/**
 * Influence dimension score
 */
interface DimensionScore {
  dimension: string;
  score: number;
  weight: number;
  weightedScore: number;
  metrics: Record<string, number>;
}

/**
 * MEP influence assessment result
 */
interface MepInfluenceAssessment {
  mepId: string;
  mepName: string;
  country: string;
  politicalGroup: string;
  period: { from: string; to: string };
  overallScore: number;
  rank: string;
  dimensions: DimensionScore[];
  computedAttributes: {
    participationRate: number;
    loyaltyScore: number;
    diversityIndex: number;
    effectivenessRatio: number;
    leadershipIndicator: number;
  };
  votingDataAvailable: boolean;
  confidenceLevel: string;
  methodology: string;
}

/**
 * Compute voting activity score (0-100)
 */
function computeVotingActivityScore(stats: { totalVotes: number; attendanceRate: number }): {
  score: number;
  metrics: Record<string, number>;
} {
  const attendanceScore = stats.attendanceRate;
  const participationVolume = Math.min(100, (stats.totalVotes / 1500) * 100);
  const score = attendanceScore * 0.6 + participationVolume * 0.4;
  return {
    score: Math.round(score * 100) / 100,
    metrics: {
      attendanceRate: stats.attendanceRate,
      totalVotes: stats.totalVotes,
      participationVolume: Math.round(participationVolume * 100) / 100
    }
  };
}

/**
 * Compute legislative output score (0-100)
 */
function computeLegislativeOutputScore(roles: string[], committees: string[]): {
  score: number;
  metrics: Record<string, number>;
} {
  const rapporteurships = roles.filter(r => r.toLowerCase().includes('rapporteur')).length;
  const committeeRoles = roles.filter(r =>
    r.toLowerCase().includes('chair') || r.toLowerCase().includes('vice')
  ).length;
  const roleScore = Math.min(100, rapporteurships * 15 + committeeRoles * 20);
  const committeeDiversity = Math.min(100, committees.length * 20);
  const score = roleScore * 0.6 + committeeDiversity * 0.4;
  return {
    score: Math.round(score * 100) / 100,
    metrics: {
      rapporteurships,
      committeeRoles,
      totalCommittees: committees.length
    }
  };
}

/**
 * Compute committee engagement score (0-100)
 */
function computeCommitteeEngagementScore(committees: string[], roles: string[]): {
  score: number;
  metrics: Record<string, number>;
} {
  const leadershipRoles = roles.filter(r =>
    r.toLowerCase().includes('chair') ||
    r.toLowerCase().includes('coordinator') ||
    r.toLowerCase().includes('vice')
  ).length;
  const membershipBreadth = Math.min(100, committees.length * 25);
  const leadershipScore = Math.min(100, leadershipRoles * 30);
  const score = membershipBreadth * 0.5 + leadershipScore * 0.5;
  return {
    score: Math.round(score * 100) / 100,
    metrics: {
      committeeMemberships: committees.length,
      leadershipRoles,
      membershipBreadth: Math.round(membershipBreadth * 100) / 100
    }
  };
}

/**
 * Compute parliamentary oversight score (0-100) using real question data
 */
function computeOversightScore(questionCount: number): {
  score: number;
  metrics: Record<string, number>;
} {
  const questionVolume = Math.min(100, questionCount * 2);
  const topicDiversity = Math.min(100, questionCount * 10);
  const score = questionVolume * 0.5 + topicDiversity * 0.5;
  return {
    score: Math.round(score * 100) / 100,
    metrics: {
      questionsFound: questionCount,
      questionVolume: Math.round(questionVolume * 100) / 100,
      topicDiversity: Math.round(topicDiversity * 100) / 100
    }
  };
}

/**
 * Compute coalition building score (0-100)
 */
function computeCoalitionScore(stats: { votesFor: number; votesAgainst: number; abstentions: number; totalVotes: number }): {
  score: number;
  metrics: Record<string, number>;
} {
  const totalDecisive = stats.votesFor + stats.votesAgainst;
  const crossPartyRate = totalDecisive > 0
    ? Math.min(100, (stats.votesAgainst / totalDecisive) * 100 * 2)
    : 0;
  const engagementRate = stats.totalVotes > 0
    ? ((stats.totalVotes - stats.abstentions) / stats.totalVotes) * 100
    : 0;
  const score = crossPartyRate * 0.4 + engagementRate * 0.6;
  return {
    score: Math.round(score * 100) / 100,
    metrics: {
      crossPartyRate: Math.round(crossPartyRate * 100) / 100,
      engagementRate: Math.round(engagementRate * 100) / 100,
      decisiveVotes: totalDecisive
    }
  };
}

/**
 * Determine influence rank label
 */
function getRankLabel(score: number): string {
  if (score >= 80) return 'Very High Influence';
  if (score >= 60) return 'High Influence';
  if (score >= 40) return 'Moderate Influence';
  if (score >= 20) return 'Low Influence';
  return 'Minimal Influence';
}

/**
 * Input for dimension building
 */
interface DimensionInputs {
  votingDim: { score: number; metrics: Record<string, number> };
  legislativeDim: { score: number; metrics: Record<string, number> };
  committeeDim: { score: number; metrics: Record<string, number> };
  oversightDim: { score: number; metrics: Record<string, number> };
  coalitionDim: { score: number; metrics: Record<string, number> };
}

/**
 * Build dimensions array from computed scores
 */
function buildDimensions(inputs: DimensionInputs, includeMetrics: boolean): DimensionScore[] {
  const raw: { name: string; result: { score: number; metrics: Record<string, number> }; weight: number }[] = [
    { name: 'Voting Activity', result: inputs.votingDim, weight: DIMENSION_WEIGHTS.votingActivity },
    { name: 'Legislative Output', result: inputs.legislativeDim, weight: DIMENSION_WEIGHTS.legislativeOutput },
    { name: 'Committee Engagement', result: inputs.committeeDim, weight: DIMENSION_WEIGHTS.committeeEngagement },
    { name: 'Parliamentary Oversight', result: inputs.oversightDim, weight: DIMENSION_WEIGHTS.parliamentaryOversight },
    { name: 'Coalition Building', result: inputs.coalitionDim, weight: DIMENSION_WEIGHTS.coalitionBuilding }
  ];

  return raw.map(d => ({
    dimension: d.name,
    score: d.result.score,
    weight: d.weight,
    weightedScore: Math.round(d.result.score * d.weight * 100) / 100,
    metrics: includeMetrics ? d.result.metrics : {}
  }));
}

/**
 * Determine confidence level from vote count
 */
function getConfidenceLevel(totalVotes: number): string {
  if (totalVotes > 500) return 'HIGH';
  if (totalVotes > 100) return 'MEDIUM';
  return 'LOW';
}

/**
 * Assess MEP influence tool handler
 */
export async function handleAssessMepInfluence(
  args: unknown
): Promise<ToolResult> {
  const params = AssessMepInfluenceSchema.parse(args);

  try {
    const mep = await epClient.getMEPDetails(params.mepId);
    const stats = mep.votingStatistics ?? {
      totalVotes: 0, votesFor: 0, votesAgainst: 0, abstentions: 0, attendanceRate: 0
    };

    // Fetch real parliamentary questions for this MEP
    // Use data.length instead of total because total is a lower-bound estimate
    let questionCount = 0;
    try {
      const questions = await epClient.getParliamentaryQuestions({
        author: params.mepId,
        limit: 100
      });
      questionCount = questions.data.length;
    } catch {
      // Questions may not be available — report zero
    }

    const votingDim = computeVotingActivityScore(stats);
    const legislativeDim = computeLegislativeOutputScore(mep.roles ?? [], mep.committees);
    const committeeDim = computeCommitteeEngagementScore(mep.committees, mep.roles ?? []);
    const oversightDim = computeOversightScore(questionCount);
    const coalitionDim = computeCoalitionScore(stats);

    const dimensions = buildDimensions(
      { votingDim, legislativeDim, committeeDim, oversightDim, coalitionDim },
      params.includeDetails
    );

    const overallScore = Math.round(
      dimensions.reduce((sum, d) => sum + d.weightedScore, 0) * 100
    ) / 100;

    const totalDecisive = stats.votesFor + stats.votesAgainst;
    const loyaltyScore = totalDecisive > 0
      ? Math.round((stats.votesFor / totalDecisive) * 100 * 100) / 100
      : 0;

    const assessment: MepInfluenceAssessment = {
      mepId: params.mepId,
      mepName: mep.name,
      country: mep.country,
      politicalGroup: mep.politicalGroup,
      period: {
        from: params.dateFrom ?? '2024-01-01',
        to: params.dateTo ?? '2024-12-31'
      },
      overallScore,
      rank: getRankLabel(overallScore),
      dimensions,
      computedAttributes: {
        participationRate: stats.attendanceRate,
        loyaltyScore,
        diversityIndex: Math.min(100, Math.max(0, Math.round((mep.committees.length / 5) * 100 * 100) / 100)),
        effectivenessRatio: Math.round((votingDim.score + legislativeDim.score) / 2 * 100) / 100,
        leadershipIndicator: committeeDim.score
      },
      confidenceLevel: getConfidenceLevel(stats.totalVotes),
      votingDataAvailable: stats.totalVotes > 0,
      methodology: 'CIA Political Scorecards - 5-dimension weighted scoring model using real EP Open Data. '
        + 'Parliamentary questions fetched from /parliamentary-questions endpoint. '
        + 'Data source: European Parliament Open Data Portal.'
    };

    return buildToolResponse(assessment);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to assess MEP influence: ${errorMessage}`);
  }
}

/**
 * Tool metadata for MCP registration
 */
export const assessMepInfluenceToolMetadata = {
  name: 'assess_mep_influence',
  description: 'Compute MEP influence score using a 5-dimension weighted model: Voting Activity (25%), Legislative Output (25%), Committee Engagement (20%), Parliamentary Oversight (15%), Coalition Building (15%). Returns overall score, rank, dimension breakdowns, and computed attributes including participation rate, loyalty score, diversity index, and leadership indicator.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      mepId: {
        type: 'string',
        description: 'MEP identifier',
        minLength: 1,
        maxLength: 100
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
      includeDetails: {
        type: 'boolean',
        description: 'Include detailed breakdown per dimension',
        default: false
      }
    },
    required: ['mepId']
  }
};
