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
 * Fetch and build group metrics using real EP API data.
 * Note: The EP API /meps/{id} endpoint does not provide per-MEP voting
 * statistics, so voting-related dimensions report zero. Member counts
 * and group composition are real.
 */
async function buildGroupMetrics(groupIds: string[]): Promise<GroupComparisonMetrics[]> {
  const groups = await Promise.all(
    groupIds.map(async (groupId): Promise<GroupComparisonMetrics> => {
      const mepsResult = await epClient.getMEPs({ group: groupId, limit: 100 });

      // Per-MEP voting statistics are not available from the EP API,
      // so voting-related dimensions report zero.
      const memberCount = mepsResult.data.length;

      return {
        groupId,
        memberCount,
        dimensions: {
          votingDiscipline: 0,
          activityLevel: 0,
          legislativeOutput: 0,
          attendance: 0,
          cohesion: 0
        },
        computedAttributes: {
          overallPerformanceScore: 0,
          relativeStrength: 0,
          seatShare: 0,
          effectivenessPerMember: 0,
          engagementIntensity: 0
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
      confidenceLevel: 'LOW',
      methodology: 'Multi-dimensional comparative analysis using real EP Open Data MEP records. '
        + 'Per-MEP voting statistics are not available from the EP API /meps/{id} endpoint; '
        + 'voting discipline, activity level, attendance, and cohesion dimensions report zero. '
        + 'Member counts and group composition are real. '
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
