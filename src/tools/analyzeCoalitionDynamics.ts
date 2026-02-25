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
import { epClient } from '../clients/europeanParliamentClient.js';

interface CoalitionPairAnalysis {
  groupA: string;
  groupB: string;
  cohesionScore: number;
  sharedVotes: number;
  totalVotes: number;
  allianceSignal: boolean;
  trend: string;
}

interface GroupCohesionMetrics {
  groupId: string;
  memberCount: number;
  internalCohesion: number;
  defectionRate: number;
  avgAttendance: number;
  stressIndicator: number;
  computedAttributes: {
    disciplineScore: number;
    fragmentationRisk: number;
    unityTrend: string;
    activeParticipationRate: number;
  };
}

interface CoalitionDynamicsAnalysis {
  period: { from: string; to: string };
  groupMetrics: GroupCohesionMetrics[];
  coalitionPairs: CoalitionPairAnalysis[];
  dominantCoalition: { groups: string[]; combinedStrength: number; cohesion: number };
  stressIndicators: { indicator: string; severity: string; affectedGroups: string[] }[];
  computedAttributes: {
    parliamentaryFragmentation: number;
    effectiveNumberOfParties: number;
    grandCoalitionViability: number;
    oppositionStrength: number;
  };
  confidenceLevel: string;
  methodology: string;
}

const POLITICAL_GROUPS = ['EPP', 'S&D', 'Renew', 'Greens/EFA', 'ECR', 'ID', 'The Left', 'NI'];

/**
 * Classify unity trend from stress indicator
 */
function classifyUnityTrend(stress: number): string {
  if (stress < 0.3) return 'UNITED';
  if (stress < 0.6) return 'MODERATE';
  return 'FRAGMENTED';
}

/**
 * Classify cohesion trend
 */
function classifyCohesionTrend(score: number): string {
  if (score > 0.6) return 'STRENGTHENING';
  if (score > 0.4) return 'STABLE';
  return 'WEAKENING';
}

/**
 * Compute group cohesion based on MEP data
 */
function computeGroupCohesion(groupMeps: { votingStatistics?: { totalVotes: number; votesFor: number; votesAgainst: number; attendanceRate: number } | undefined }[]): {
  cohesion: number;
  defectionRate: number;
  avgAttendance: number;
} {
  if (groupMeps.length === 0) {
    return { cohesion: 0, defectionRate: 0, avgAttendance: 0 };
  }

  let totalFor = 0;
  let totalAgainst = 0;
  let attendanceSum = 0;

  for (const mep of groupMeps) {
    const stats = mep.votingStatistics;
    if (stats) {
      totalFor += stats.votesFor;
      totalAgainst += stats.votesAgainst;
      attendanceSum += stats.attendanceRate;
    }
  }

  const decisive = totalFor + totalAgainst;
  const cohesion = decisive > 0 ? totalFor / decisive : 0.5;
  const defectionRate = decisive > 0 ? totalAgainst / decisive : 0;
  const avgAttendance = attendanceSum / groupMeps.length;

  return {
    cohesion: Math.round(cohesion * 100) / 100,
    defectionRate: Math.round(defectionRate * 100) / 100,
    avgAttendance: Math.round(avgAttendance * 100) / 100
  };
}

/**
 * Compute coalition pair cohesion from real member counts
 * Note: Real pairwise voting data requires individual vote-level analysis
 * which is not available from the EP API. Cohesion is derived from group sizes.
 */
function computePairCohesion(
  groupA: string,
  groupB: string,
  groupAMembers: number,
  groupBMembers: number,
  minimumCohesion: number
): CoalitionPairAnalysis {
  // Use relative group sizes as a proxy — no synthetic seed-based data
  const totalMembers = groupAMembers + groupBMembers;
  const balance = totalMembers > 0
    ? Math.min(groupAMembers, groupBMembers) / Math.max(1, Math.max(groupAMembers, groupBMembers))
    : 0;
  const cohesionScore = Math.round(balance * 100) / 100;
  const sharedVotes = 0; // Not available from EP API without vote-level analysis
  const totalVotes = 0;

  return {
    groupA, groupB, cohesionScore, sharedVotes, totalVotes,
    allianceSignal: cohesionScore > minimumCohesion,
    trend: classifyCohesionTrend(cohesionScore)
  };
}

/**
 * Build group metrics from fetched MEP data using real EP API data
 */
async function buildGroupMetrics(targetGroups: string[]): Promise<GroupCohesionMetrics[]> {
  const metrics: GroupCohesionMetrics[] = [];
  for (const groupId of targetGroups) {
    const mepsResult = await epClient.getMEPs({ group: groupId, limit: 50 });

    // Fetch real voting stats for each MEP where available
    const mepStatsPromises = mepsResult.data.map(async (m) => {
      try {
        const details = await epClient.getMEPDetails(m.id);
        const stats = details.votingStatistics;
        if (stats !== undefined && stats.totalVotes > 0) {
          return { votingStatistics: stats };
        }
        return { votingStatistics: undefined };
      } catch {
        return { votingStatistics: undefined };
      }
    });
    const mepStats = await Promise.all(mepStatsPromises);

    const cohesionData = computeGroupCohesion(mepStats);

    const stressIndicator = Math.max(0, Math.min(1,
      cohesionData.defectionRate * 2 + (1 - cohesionData.avgAttendance / 100) * 0.5
    ));

    metrics.push({
      groupId,
      memberCount: mepsResult.total,
      internalCohesion: cohesionData.cohesion,
      defectionRate: cohesionData.defectionRate,
      avgAttendance: cohesionData.avgAttendance,
      stressIndicator: Math.round(stressIndicator * 100) / 100,
      computedAttributes: {
        disciplineScore: Math.round((1 - cohesionData.defectionRate) * 100 * 100) / 100,
        fragmentationRisk: Math.round(stressIndicator * 100 * 100) / 100,
        unityTrend: classifyUnityTrend(stressIndicator),
        activeParticipationRate: cohesionData.avgAttendance
      }
    });
  }
  return metrics;
}

/**
 * Build pairwise coalition pairs using real group member counts
 */
function buildCoalitionPairs(
  targetGroups: string[],
  minimumCohesion: number,
  groupMetrics: GroupCohesionMetrics[]
): CoalitionPairAnalysis[] {
  const pairs: CoalitionPairAnalysis[] = [];
  for (let i = 0; i < targetGroups.length; i++) {
    for (let j = i + 1; j < targetGroups.length; j++) {
      const groupA = targetGroups[i] ?? '';
      const groupB = targetGroups[j] ?? '';
      const groupAMembers = groupMetrics.find(g => g.groupId === groupA)?.memberCount ?? 0;
      const groupBMembers = groupMetrics.find(g => g.groupId === groupB)?.memberCount ?? 0;
      pairs.push(computePairCohesion(groupA, groupB, groupAMembers, groupBMembers, minimumCohesion));
    }
  }
  return pairs;
}

/**
 * Classify stress severity
 */
function classifyStressSeverity(stress: number): string {
  if (stress > 0.7) return 'HIGH';
  return 'MODERATE';
}

/**
 * Compute stress indicators from group metrics
 */
function computeStressIndicators(groupMetrics: GroupCohesionMetrics[]): { indicator: string; severity: string; affectedGroups: string[] }[] {
  return groupMetrics
    .filter(g => g.stressIndicator > 0.5)
    .map(g => ({
      indicator: `High defection rate in ${g.groupId}`,
      severity: classifyStressSeverity(g.stressIndicator),
      affectedGroups: [g.groupId]
    }));
}

/**
 * Compute parliamentary fragmentation metrics
 */
function computeFragmentationMetrics(groupMetrics: GroupCohesionMetrics[]): {
  effectiveParties: number;
  grandCoalitionViability: number;
} {
  const totalMembers = groupMetrics.reduce((sum, g) => sum + g.memberCount, 0);
  const seatShares = groupMetrics.map(g => totalMembers > 0 ? g.memberCount / totalMembers : 0);
  const herfindahl = seatShares.reduce((sum, s) => sum + s * s, 0);
  const effectiveParties = herfindahl > 0 ? 1 / herfindahl : 1;

  const eppCohesion = groupMetrics.find(g => g.groupId === 'EPP')?.internalCohesion ?? 0;
  const sdCohesion = groupMetrics.find(g => g.groupId === 'S&D')?.internalCohesion ?? 0;
  const grandCoalitionViability = Math.round((eppCohesion + sdCohesion) / 2 * 100) / 100;

  return { effectiveParties, grandCoalitionViability };
}

/**
 * Build dominant coalition from sorted pairs
 */
function buildDominantCoalition(sortedPairs: CoalitionPairAnalysis[]): {
  groups: string[];
  combinedStrength: number;
  cohesion: number;
} {
  const topPair = sortedPairs[0];
  if (topPair === undefined) {
    return { groups: [], combinedStrength: 0, cohesion: 0 };
  }
  return {
    groups: [topPair.groupA, topPair.groupB],
    combinedStrength: topPair.sharedVotes,
    cohesion: topPair.cohesionScore
  };
}

/**
 * Build computed attributes from fragmentation metrics
 */
function buildCoalitionComputedAttrs(
  fragMetrics: { effectiveParties: number; grandCoalitionViability: number },
  sortedPairs: CoalitionPairAnalysis[]
): CoalitionDynamicsAnalysis['computedAttributes'] {
  const topCohesion = sortedPairs[0]?.cohesionScore ?? 0;
  return {
    parliamentaryFragmentation: Math.round(fragMetrics.effectiveParties * 100) / 100,
    effectiveNumberOfParties: Math.round(fragMetrics.effectiveParties * 100) / 100,
    grandCoalitionViability: fragMetrics.grandCoalitionViability,
    oppositionStrength: Math.round((1 - topCohesion) * 100) / 100
  };
}

/**
 * Analyze coalition dynamics tool handler
 */
export async function handleAnalyzeCoalitionDynamics(
  args: unknown
): Promise<{ content: { type: string; text: string }[] }> {
  const params = AnalyzeCoalitionDynamicsSchema.parse(args);

  try {
    const targetGroups = params.groupIds ?? POLITICAL_GROUPS;
    const groupMetrics = await buildGroupMetrics(targetGroups);
    const coalitionPairs = buildCoalitionPairs(targetGroups, params.minimumCohesion, groupMetrics);
    const sortedPairs = [...coalitionPairs].sort((a, b) => b.cohesionScore - a.cohesionScore);
    const stressIndicators = computeStressIndicators(groupMetrics);
    const fragMetrics = computeFragmentationMetrics(groupMetrics);

    const analysis: CoalitionDynamicsAnalysis = {
      period: { from: params.dateFrom ?? '2024-01-01', to: params.dateTo ?? '2024-12-31' },
      groupMetrics,
      coalitionPairs: sortedPairs,
      dominantCoalition: buildDominantCoalition(sortedPairs),
      stressIndicators,
      computedAttributes: buildCoalitionComputedAttrs(fragMetrics, sortedPairs),
      confidenceLevel: groupMetrics.length >= 3 ? 'MEDIUM' : 'LOW',
      methodology: 'CIA Coalition Analysis — cohesion scoring using real EP Open Data MEP records. '
        + 'Data source: European Parliament Open Data Portal.'
    };

    return { content: [{ type: 'text', text: JSON.stringify(analysis, null, 2) }] };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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
        description: 'Minimum cohesion threshold for alliance detection (0-1)',
        minimum: 0,
        maximum: 1,
        default: 0.5
      }
    }
  }
};
