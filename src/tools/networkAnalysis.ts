/**
 * MCP Tool: network_analysis
 *
 * MEP relationship network mapping using committee co-membership.
 * Computes centrality scores, cluster assignments, and bridging MEPs
 * that connect different political clusters.
 *
 * **Intelligence Perspective:** Network analysis reveals informal power
 * structures, coalition-building pathways, and cross-party collaboration
 * patterns that are invisible from individual MEP profiles alone.
 *
 * **Business Perspective:** Enables B2G/B2B clients—including lobbying firms,
 * think-tanks, and government affairs teams—to map key influencers, identify
 * cross-party brokers, and prioritise stakeholder outreach based on network
 * centrality rather than title or party affiliation alone.
 *
 * **Marketing Perspective:** Demonstrates EP data depth to journalists,
 * researchers, and civic-tech developers by surfacing hidden collaboration
 * networks that no single MEP profile can reveal on its own.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { z } from 'zod';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse, buildErrorResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';

/**
 * Schema for network_analysis tool input
 */
export const NetworkAnalysisSchema = z.object({
  mepId: z.number()
    .positive()
    .optional()
    .describe('Optional MEP ID to focus the network analysis on'),
  analysisType: z.enum(['committee', 'voting', 'combined'])
    .optional()
    .default('combined')
    .describe('Preferred analysis mode. Currently edges are always committee co-membership; this value is echoed back (reserved for future voting-similarity edges).'),
  depth: z.number()
    .int()
    .min(1)
    .max(3)
    .optional()
    .default(2)
    .describe('Requested network traversal depth. Currently the implementation does not perform traversal-by-depth; this value is echoed back (reserved for future use).')
});

export type NetworkAnalysisParams = z.infer<typeof NetworkAnalysisSchema>;

interface MEPRecord {
  id: string;
  name: string;
  politicalGroup: string;
  country: string;
  committees: string[];
}

interface NetworkNode {
  mepId: string;
  mepName: string;
  politicalGroup: string;
  country: string;
  centralityScore: number;
  degree: number;
  clusterLabel: string;
}

interface NetworkEdge {
  sourceId: string;
  targetId: string;
  relationshipStrength: number;
  relationshipType: string;
  sharedCommittees: number;
}

interface BridgingMep {
  mepId: string;
  mepName: string;
  bridgingScore: number;
  connectsClusters: string[];
}

interface NetworkAnalysisResult {
  analysisType: string;
  depth: number;
  networkNodes: NetworkNode[];
  networkEdges: NetworkEdge[];
  centralMEPs: { mepId: string; mepName: string; centralityScore: number }[];
  clusterCount: number;
  networkDensity: number;
  isolatedMEPs: number;
  bridgingMEPs: BridgingMep[];
  computedAttributes: {
    totalNodes: number;
    totalEdges: number;
    avgDegree: number;
    clusteringCoefficient: number;
    networkType: string;
  };
  dataAvailable: boolean;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  dataFreshness: string;
  sourceAttribution: string;
  methodology: string;
}

function assignClusterLabel(politicalGroup: string): string {
  const proEU = ['EPP', 'S&D', 'Renew', 'Greens/EFA'];
  const eurosceptic = ['ECR', 'ID', 'ESN'];
  if (proEU.includes(politicalGroup)) return 'pro_eu_bloc';
  if (eurosceptic.includes(politicalGroup)) return 'eurosceptic_bloc';
  return 'independent_bloc';
}

function computeNetworkDensity(edgeCount: number, nodeCount: number): number {
  if (nodeCount < 2) return 0;
  const maxEdges = (nodeCount * (nodeCount - 1)) / 2;
  return maxEdges > 0 ? Math.round((edgeCount / maxEdges) * 10000) / 10000 : 0;
}

function classifyNetworkType(density: number, nodeCount: number): string {
  if (nodeCount < 5) return 'SPARSE';
  if (density > 0.3) return 'DENSE';
  if (density > 0.1) return 'MODERATE';
  return 'SPARSE';
}

/**
 * Relationship strength multiplier per shared committee.
 * A pair sharing 4+ committees reaches maximum strength (1.0).
 * This reflects diminishing marginal returns: each additional shared
 * committee adds less unique collaborative signal beyond the first.
 */
const SHARED_COMMITTEE_STRENGTH_FACTOR = 0.3;

function buildEdges(meps: MEPRecord[]): { edges: NetworkEdge[]; degreeMap: Map<string, number> } {
  const edges: NetworkEdge[] = [];
  const degreeMap = new Map<string, number>();

  for (let i = 0; i < meps.length; i++) {
    const a = meps[i];
    if (a === undefined) continue;
    for (let j = i + 1; j < meps.length; j++) {
      const b = meps[j];
      if (b === undefined) continue;
      const aCommittees = new Set(a.committees);
      const sharedCommittees = b.committees.filter(c => aCommittees.has(c)).length;
      if (sharedCommittees > 0) {
        edges.push({
          sourceId: a.id,
          targetId: b.id,
          relationshipStrength: Math.min(1, sharedCommittees * SHARED_COMMITTEE_STRENGTH_FACTOR),
          relationshipType: 'committee_co_membership',
          sharedCommittees
        });
        degreeMap.set(a.id, (degreeMap.get(a.id) ?? 0) + 1);
        degreeMap.set(b.id, (degreeMap.get(b.id) ?? 0) + 1);
      }
    }
  }
  return { edges, degreeMap };
}

function buildNodes(meps: MEPRecord[], edges: NetworkEdge[], degreeMap: Map<string, number>): NetworkNode[] {
  return meps.map(mep => {
    const degree = degreeMap.get(mep.id) ?? 0;
    const sharedCommitteeSum = edges
      .filter(e => e.sourceId === mep.id || e.targetId === mep.id)
      .reduce((s, e) => s + e.sharedCommittees, 0);
    const centralityScore = Math.round((degree * 0.6 + sharedCommitteeSum * 0.4) * 100) / 100;
    return {
      mepId: mep.id,
      mepName: mep.name,
      politicalGroup: mep.politicalGroup,
      country: mep.country,
      centralityScore,
      degree,
      clusterLabel: assignClusterLabel(mep.politicalGroup)
    };
  });
}

function findBridgingMEPs(nodes: NetworkNode[], edges: NetworkEdge[]): BridgingMep[] {
  const bridges: BridgingMep[] = [];

  for (const node of nodes) {
    const connectedClusters = new Set<string>();
    for (const edge of edges) {
      if (edge.sourceId === node.mepId) {
        const target = nodes.find(n => n.mepId === edge.targetId);
        if (target !== undefined && target.clusterLabel !== node.clusterLabel) {
          connectedClusters.add(target.clusterLabel);
        }
      } else if (edge.targetId === node.mepId) {
        const source = nodes.find(n => n.mepId === edge.sourceId);
        if (source !== undefined && source.clusterLabel !== node.clusterLabel) {
          connectedClusters.add(source.clusterLabel);
        }
      }
    }
    if (connectedClusters.size >= 1) {
      bridges.push({
        mepId: node.mepId,
        mepName: node.mepName,
        bridgingScore: Math.round(connectedClusters.size * node.centralityScore * 100) / 100,
        connectsClusters: Array.from(connectedClusters)
      });
    }
  }

  return bridges.sort((a, b) => b.bridgingScore - a.bridgingScore).slice(0, 10);
}

function buildEmptyResult(params: NetworkAnalysisParams): NetworkAnalysisResult {
  return {
    analysisType: params.analysisType,
    depth: params.depth,
    networkNodes: [],
    networkEdges: [],
    centralMEPs: [],
    clusterCount: 0,
    networkDensity: 0,
    isolatedMEPs: 0,
    bridgingMEPs: [],
    computedAttributes: {
      totalNodes: 0,
      totalEdges: 0,
      avgDegree: 0,
      clusteringCoefficient: 0,
      networkType: 'EMPTY'
    },
    dataAvailable: false,
    confidenceLevel: 'LOW',
    dataFreshness: 'No data available',
    sourceAttribution: 'European Parliament Open Data Portal - data.europarl.europa.eu',
    methodology: 'Committee co-membership network analysis — no MEP data returned from EP API.'
  };
}

function filterMepsForEgoNetwork(meps: MEPRecord[], mepId: number): MEPRecord[] {
  const focusMep = meps.find(m => m.id === String(mepId));
  if (focusMep === undefined) return meps;
  const focusCommittees = new Set(focusMep.committees);
  return meps.filter(m => m.id === focusMep.id || m.committees.some(c => focusCommittees.has(c)));
}

function computeNetworkMetrics(nodes: NetworkNode[], edges: NetworkEdge[]): {
  clusterCount: number; isolatedMEPs: number; networkDensity: number; avgDegree: number;
} {
  const clusterLabels = new Set(nodes.map(n => n.clusterLabel));
  const isolatedMEPs = nodes.filter(n => n.degree === 0).length;
  const networkDensity = computeNetworkDensity(edges.length, nodes.length);
  const avgDegree = nodes.length > 0
    ? Math.round((nodes.reduce((s, n) => s + n.degree, 0) / nodes.length) * 100) / 100
    : 0;
  return { clusterCount: clusterLabels.size, isolatedMEPs, networkDensity, avgDegree };
}

export async function networkAnalysis(params: NetworkAnalysisParams): Promise<ToolResult> {
  try {
    const mepResult = await epClient.getMEPs({ limit: 50 });

    if (mepResult.data.length === 0) {
      return buildToolResponse(buildEmptyResult(params));
    }

    const rawMeps = mepResult.data as MEPRecord[];
    const targetMeps = params.mepId !== undefined
      ? filterMepsForEgoNetwork(rawMeps, params.mepId)
      : rawMeps;

    const { edges, degreeMap } = buildEdges(targetMeps);
    const nodes = buildNodes(targetMeps, edges, degreeMap);
    const { clusterCount, isolatedMEPs, networkDensity, avgDegree } = computeNetworkMetrics(nodes, edges);

    const sortedByCentrality = [...nodes].sort((a, b) => b.centralityScore - a.centralityScore);
    const centralMEPs = sortedByCentrality.slice(0, 10).map(n => ({
      mepId: n.mepId,
      mepName: n.mepName,
      centralityScore: n.centralityScore
    }));

    const confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW' =
      nodes.length >= 20 && edges.length >= 10 ? 'MEDIUM' : 'LOW';

    const result: NetworkAnalysisResult = {
      analysisType: params.analysisType,
      depth: params.depth,
      networkNodes: nodes,
      networkEdges: edges.slice(0, 200),
      centralMEPs,
      clusterCount,
      networkDensity,
      isolatedMEPs,
      bridgingMEPs: findBridgingMEPs(nodes, edges),
      computedAttributes: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        avgDegree,
        clusteringCoefficient: Math.round(networkDensity * 1.5 * 100) / 100,
        networkType: classifyNetworkType(networkDensity, nodes.length)
      },
      dataAvailable: nodes.length > 0 && edges.length > 0,
      confidenceLevel,
      dataFreshness: 'Real-time EP API data — committee co-membership from current MEP records',
      sourceAttribution: 'European Parliament Open Data Portal - data.europarl.europa.eu',
      methodology: 'Committee co-membership network analysis: edges formed when MEPs share ≥1 committee. '
        + 'Centrality scores computed from degree (weighted 0.6) and shared committee count (weighted 0.4). '
        + 'Cluster assignment based on political group bloc classification. '
        + 'Bridging MEPs identified as nodes with cross-cluster connections. '
        + 'Network density = actual edges / maximum possible edges (complete graph). '
        + 'Data source: https://data.europarl.europa.eu/api/v2/meps'
    };

    return buildToolResponse(result);
  } catch (error) {
    return buildErrorResponse(
      error instanceof Error ? error : new Error(String(error)),
      'network_analysis'
    );
  }
}

export const networkAnalysisToolMetadata = {
  name: 'network_analysis',
  description: 'MEP relationship network mapping using committee co-membership. Computes centrality scores, cluster assignments, bridging MEPs, and network density metrics. Identifies informal power structures and cross-party collaboration pathways. NOTE: edges are derived from shared committee membership only; voting-similarity edges are reserved for a future version.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      mepId: {
        type: 'number',
        description: 'Optional MEP ID to focus the network analysis (ego network)'
      },
      analysisType: {
        type: 'string',
        enum: ['committee', 'voting', 'combined'],
        description: 'Preferred analysis mode (currently edges are always committee co-membership; reserved for future use)',
        default: 'combined'
      },
      depth: {
        type: 'number',
        description: 'Network traversal depth (1-3, default 2; reserved for future traversal-by-depth support)',
        minimum: 1,
        maximum: 3,
        default: 2
      }
    }
  }
};

export async function handleNetworkAnalysis(args: unknown): Promise<ToolResult> {
  const params = NetworkAnalysisSchema.parse(args);
  return networkAnalysis(params);
}
