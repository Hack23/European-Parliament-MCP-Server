/**
 * MCP Tool: compare_political_groups
 * 
 * Cross-group comparison of voting discipline, activity levels, policy focus
 * areas, internal cohesion, and legislative effectiveness.
 * 
 * **Intelligence Perspective:** Comparative analysis tool enabling side-by-side
 * assessment of political groups across multiple dimensions—supports SWOT/PESTLE
 * analysis frameworks for EU parliamentary dynamics.
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { ComparePoliticalGroupsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';

interface GroupComparisonMetrics {
  groupId: string;
  memberCount: number;
  dimensions: {
    votingDiscipline: number;
    activityLevel: number;
    legislativeOutput: number;
    attendance: number;
    cohesion: number;
  };
  computedAttributes: {
    overallPerformanceScore: number;
    relativeStrength: number;
    seatShare: number;
    effectivenessPerMember: number;
    engagementIntensity: number;
  };
}

interface PoliticalGroupComparison {
  period: { from: string; to: string };
  groupCount: number;
  groups: GroupComparisonMetrics[];
  rankings: { dimension: string; ranking: { groupId: string; score: number }[] }[];
  computedAttributes: {
    mostDisciplined: string;
    mostActive: string;
    highestAttendance: string;
    mostCohesive: string;
    strongestOverall: string;
    parliamentaryBalance: number;
    competitiveIndex: number;
  };
  confidenceLevel: string;
  methodology: string;
}

const ALL_DIMENSIONS = ['votingDiscipline', 'activityLevel', 'legislativeOutput', 'attendance', 'cohesion'] as const;
type DimensionName = typeof ALL_DIMENSIONS[number];

const DIMENSION_NAME_MAP: Record<string, DimensionName> = {
  'voting_discipline': 'votingDiscipline',
  'activity_level': 'activityLevel',
  'legislative_output': 'legislativeOutput',
  'attendance': 'attendance',
  'cohesion': 'cohesion'
};

/**
 * Compute aggregate group metrics from real MEP data
 */
function computeGroupDimensions(
  mepData: { votingStatistics?: { totalVotes: number; votesFor: number; votesAgainst: number; attendanceRate: number } | undefined }[],
  memberCount: number
): { dimensions: GroupComparisonMetrics['dimensions']; totalVotesPerMember: number } {
  let totalVotesSum = 0;
  let forSum = 0;
  let againstSum = 0;
  let attendanceSum = 0;
  let mepsWithData = 0;

  for (const mep of mepData) {
    const stats = mep.votingStatistics;
    if (stats !== undefined && stats.totalVotes > 0) {
      totalVotesSum += stats.totalVotes;
      forSum += stats.votesFor;
      againstSum += stats.votesAgainst;
      attendanceSum += stats.attendanceRate;
      mepsWithData++;
    }
  }

  const count = mepsWithData || 1;
  const avgAttendance = attendanceSum / count;
  const decisive = forSum + againstSum;
  const discipline = decisive > 0 ? (forSum / decisive) * 100 : 0;
  const activityLevel = mepsWithData > 0 ? Math.min(100, (totalVotesSum / count / 1500) * 100) : 0;
  const legislativeOutput = mepsWithData > 0 ? Math.min(100, memberCount * 2) : 0;

  return {
    dimensions: {
      votingDiscipline: Math.round(discipline * 100) / 100,
      activityLevel: Math.round(activityLevel * 100) / 100,
      legislativeOutput: Math.round(legislativeOutput * 100) / 100,
      attendance: Math.round(avgAttendance * 100) / 100,
      cohesion: Math.round(discipline * 100) / 100
    },
    totalVotesPerMember: Math.round(totalVotesSum / count)
  };
}

/**
 * Calculate overall performance score from dimensions
 */
function calculateOverallScore(dims: GroupComparisonMetrics['dimensions']): number {
  return Math.round((
    dims.votingDiscipline * 0.25 +
    dims.activityLevel * 0.20 +
    dims.legislativeOutput * 0.20 +
    dims.attendance * 0.20 +
    dims.cohesion * 0.15
  ) * 100) / 100;
}

/**
 * Fetch and build group metrics using real EP API data
 */
async function buildGroupMetrics(groupIds: string[]): Promise<GroupComparisonMetrics[]> {
  const groups = await Promise.all(
    groupIds.map(async (groupId): Promise<GroupComparisonMetrics> => {
      const mepsResult = await epClient.getMEPs({ group: groupId, limit: 100 });

      // Fetch real voting stats for each MEP
      const mepStatsPromises = mepsResult.data.map(async (m) => {
        try {
          const details = await epClient.getMEPDetails(m.id);
          return { votingStatistics: details.votingStatistics };
        } catch {
          return { votingStatistics: undefined };
        }
      });
      const mepStats = await Promise.all(mepStatsPromises);

      const { dimensions, totalVotesPerMember } = computeGroupDimensions(mepStats, mepsResult.total);
      const overallScore = calculateOverallScore(dimensions);

      return {
        groupId,
        memberCount: mepsResult.total,
        dimensions,
        computedAttributes: {
          overallPerformanceScore: overallScore,
          relativeStrength: 0,
          seatShare: 0,
          effectivenessPerMember: Math.round((totalVotesPerMember / 10) * 100) / 100,
          engagementIntensity: Math.round((dimensions.attendance * dimensions.activityLevel / 100) * 100) / 100
        }
      };
    })
  );
  return groups;
}

/**
 * Update relative metrics after all groups computed
 */
function updateRelativeMetrics(groups: GroupComparisonMetrics[]): void {
  const totalMembers = groups.reduce((sum, g) => sum + g.memberCount, 0);
  const maxScore = Math.max(...groups.map(g => g.computedAttributes.overallPerformanceScore));

  for (const group of groups) {
    group.computedAttributes.seatShare = totalMembers > 0
      ? Math.round((group.memberCount / totalMembers) * 100 * 100) / 100
      : 0;
    group.computedAttributes.relativeStrength = maxScore > 0
      ? Math.round((group.computedAttributes.overallPerformanceScore / maxScore) * 100 * 100) / 100
      : 0;
  }
}

/**
 * Build rankings from group data
 */
function buildRankings(
  groups: GroupComparisonMetrics[],
  requestedDimensions: readonly DimensionName[]
): PoliticalGroupComparison['rankings'] {
  return requestedDimensions.map(dim => ({
    dimension: dim,
    ranking: [...groups]
      .sort((a, b) => b.dimensions[dim] - a.dimensions[dim])
      .map(g => ({ groupId: g.groupId, score: g.dimensions[dim] }))
  }));
}

/**
 * Find top group for a dimension
 */
function topByDimension(groups: GroupComparisonMetrics[], dim: DimensionName): string {
  return [...groups].sort((a, b) => b.dimensions[dim] - a.dimensions[dim])[0]?.groupId ?? 'N/A';
}

/**
 * Compare political groups tool handler
 */
export async function handleComparePoliticalGroups(
  args: unknown
): Promise<{ content: { type: string; text: string }[] }> {
  const params = ComparePoliticalGroupsSchema.parse(args);

  try {
    const groups = await buildGroupMetrics(params.groupIds);
    updateRelativeMetrics(groups);

    const requestedDimensions: readonly DimensionName[] = params.dimensions
      ? params.dimensions.map(d => DIMENSION_NAME_MAP[d]).filter((d): d is DimensionName => d !== undefined)
      : ALL_DIMENSIONS;

    const rankings = buildRankings(groups, requestedDimensions);
    const topOverall = [...groups]
      .sort((a, b) => b.computedAttributes.overallPerformanceScore - a.computedAttributes.overallPerformanceScore)[0]?.groupId ?? 'N/A';

    const seatShares = groups.map(g => g.computedAttributes.seatShare / 100);
    const herfindahl = seatShares.reduce((sum, s) => sum + s * s, 0);
    const balance = 1 - herfindahl;

    const scores = groups.map(g => g.computedAttributes.overallPerformanceScore);
    const avgScore = scores.reduce((s, v) => s + v, 0) / scores.length;
    const variance = scores.reduce((s, v) => s + (v - avgScore) ** 2, 0) / scores.length;
    const competitiveIndex = Math.round((1 - Math.min(1, variance / 1000)) * 100) / 100;

    const comparison: PoliticalGroupComparison = {
      period: { from: params.dateFrom ?? '2024-01-01', to: params.dateTo ?? '2024-12-31' },
      groupCount: groups.length,
      groups,
      rankings,
      computedAttributes: {
        mostDisciplined: topByDimension(groups, 'votingDiscipline'),
        mostActive: topByDimension(groups, 'activityLevel'),
        highestAttendance: topByDimension(groups, 'attendance'),
        mostCohesive: topByDimension(groups, 'cohesion'),
        strongestOverall: topOverall,
        parliamentaryBalance: Math.round(balance * 100) / 100,
        competitiveIndex
      },
      confidenceLevel: groups.length >= 3 ? 'MEDIUM' : 'LOW',
      methodology: 'Multi-dimensional comparative analysis using real EP Open Data MEP records. '
        + 'Data source: European Parliament Open Data Portal.'
    };

    return { content: [{ type: 'text', text: JSON.stringify(comparison, null, 2) }] };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to compare political groups: ${errorMessage}`);
  }
}

/**
 * Tool metadata for MCP registration
 */
export const comparePoliticalGroupsToolMetadata = {
  name: 'compare_political_groups',
  description: 'Compare political groups across multiple dimensions: voting discipline, activity level, legislative output, attendance, and cohesion. Returns rankings, computed performance scores, seat share, effectiveness per member, parliamentary balance index, and competitive index.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      groupIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Political group identifiers to compare (minimum 2)',
        minItems: 2,
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
      dimensions: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['voting_discipline', 'activity_level', 'legislative_output', 'attendance', 'cohesion']
        },
        description: 'Comparison dimensions (omit for all)'
      }
    },
    required: ['groupIds']
  }
};
