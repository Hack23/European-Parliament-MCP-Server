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
 * Classify cohesion trend
 */
function classifyCohesionTrend(score: number): string {
  if (score > 0.6) return 'STRENGTHENING';
  if (score > 0.4) return 'STABLE';
  return 'WEAKENING';
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
 * Build group metrics from fetched MEP data.
 * Note: The EP API /meps/{id} endpoint does not provide per-MEP voting
 * statistics, so cohesion metrics are derived from group composition only.
 * Voting-related fields report zero with LOW confidence.
 */
async function buildGroupMetrics(targetGroups: string[]): Promise<GroupCohesionMetrics[]> {
  const metrics: GroupCohesionMetrics[] = [];
  for (const groupId of targetGroups) {
    const mepsResult = await epClient.getMEPs({ group: groupId, limit: 50 });

    // Per-MEP voting statistics are not available from the EP API,
    // so cohesion/defection/attendance are reported as zero.
    const memberCount = mepsResult.data.length;

    metrics.push({
      groupId,
      memberCount,
      internalCohesion: 0,
      defectionRate: 0,
      avgAttendance: 0,
      stressIndicator: 0,
      computedAttributes: {
        disciplineScore: 0,
        fragmentationRisk: 0,
        unityTrend: 'UNKNOWN',
        activeParticipationRate: 0
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
      confidenceLevel: 'LOW',
      methodology: 'CIA Coalition Analysis — group composition from real EP Open Data MEP records. '
        + 'Per-MEP voting statistics are not available from the EP API /meps/{id} endpoint; '
        + 'cohesion and stress metrics report zero and should be supplemented with vote-result data. '
        + 'Coalition pair cohesion derived from group size ratios. '
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
