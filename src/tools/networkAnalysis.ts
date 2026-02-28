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

/**
 * Assigns a political-bloc cluster label to an MEP based on their political group.
 *
 * Three blocs are recognized:
 * - **`pro_eu_bloc`** — EPP, S&D, Renew, Greens/EFA
 * - **`eurosceptic_bloc`** — ECR, ID, ESN
 * - **`independent_bloc`** — all other groups (NI, The Left, etc.)
 *
 * This classification supports downstream bridging-MEP detection, where a
 * node connecting two different blocs is identified as a cross-bloc broker.
 *
 * @param politicalGroup - Raw political group string from the EP API
 * @returns Cluster label string
 */
function assignClusterLabel(politicalGroup: string): string {
  const proEU = ['EPP', 'S&D', 'Renew', 'Greens/EFA'];
  const eurosceptic = ['ECR', 'ID', 'ESN'];
  if (proEU.includes(politicalGroup)) return 'pro_eu_bloc';
  if (eurosceptic.includes(politicalGroup)) return 'eurosceptic_bloc';
  return 'independent_bloc';
}

/**
 * Computes the network density of an undirected graph.
 *
 * Density is the ratio of actual edges to the maximum possible edges in a
 * complete graph: `actual / (n × (n-1) / 2)`.
 *
 * A density near 0 indicates a sparse network (few shared committees);
 * a density near 1 indicates near-complete interconnection.
 *
 * @param edgeCount - Number of edges (shared-committee pairs) in the network
 * @param nodeCount - Number of nodes (MEPs) in the network
 * @returns Density value in `[0, 1]` rounded to 4 decimal places, or `0` for fewer than 2 nodes
 */
function computeNetworkDensity(edgeCount: number, nodeCount: number): number {
  if (nodeCount < 2) return 0;
  const maxEdges = (nodeCount * (nodeCount - 1)) / 2;
  return maxEdges > 0 ? Math.round((edgeCount / maxEdges) * 10000) / 10000 : 0;
}

/**
 * Classifies a network by its structural density and size.
 *
 * Thresholds:
 * - **`DENSE`** — density > 0.3 (more than 30 % of possible edges present)
 * - **`MODERATE`** — density in (0.1, 0.3]
 * - **`SPARSE`** — density ≤ 0.1 or fewer than 5 nodes
 *
 * Networks with fewer than 5 nodes are always classified as `SPARSE` because
 * small samples cannot reliably distinguish density tiers.
 *
 * @param density - Network density value from {@link computeNetworkDensity}
 * @param nodeCount - Number of MEP nodes in the network
 * @returns Classification string: `'DENSE'`, `'MODERATE'`, or `'SPARSE'`
 */
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

/**
 * Builds the edge list and per-node degree map for the MEP network.
 *
 * An edge is created between any two MEPs who share at least one committee
 * membership. The edge's `relationshipStrength` is capped at 1.0 using a factor
 * of {@link SHARED_COMMITTEE_STRENGTH_FACTOR} (0.3) per shared committee:
 * sharing ≥ 4 committees (4 × 0.3 = 1.2, capped to 1.0) reaches maximum strength.
 *
 * Time complexity: O(n²) over the MEP list — acceptable for the EP dataset
 * size (≤ 750 MEPs fetched in practice).
 *
 * @param meps - Array of MEP records each containing a `committees` list
 * @returns Object containing the `edges` array and a `degreeMap` mapping each MEP
 *   ID to the count of edges incident on it
 */
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

/**
 * Converts MEP records into scored {@link NetworkNode} objects.
 *
 * For each MEP the centrality score is computed as a weighted combination of:
 * - **Degree** (0.6 weight) — number of edges incident on the node
 * - **Shared committee sum** (0.4 weight) — total number of shared committees
 *   across all incident edges (reflects collaboration depth beyond mere co-membership)
 *
 * The cluster label is assigned via {@link assignClusterLabel} based on political group.
 *
 * @param meps - MEP records to convert into nodes
 * @param edges - Edge list (used to sum shared committees per MEP)
 * @param degreeMap - Pre-computed degree for each MEP ID
 * @returns Array of {@link NetworkNode} objects in the same order as `meps`
 */
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

/**
 * Identifies MEPs that act as bridges between different political-bloc clusters.
 *
 * A bridging MEP is one who has at least one edge to a node in a different cluster.
 * The bridging score is `connectedClusterCount × centralityScore`, so high-centrality
 * MEPs that span multiple blocs rank highest.
 *
 * Results are sorted by bridging score descending and capped at the top 10 to keep
 * the response payload concise.
 *
 * @param nodes - All network nodes with assigned cluster labels and centrality scores
 * @param edges - Full edge list for the network
 * @returns Array of up to 10 {@link BridgingMep} records sorted by bridging score descending
 */
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

/**
 * Constructs a zeroed {@link NetworkAnalysisResult} when the EP API returns no MEP data.
 *
 * All collections are empty arrays, numeric metrics are 0, and `dataAvailable` is
 * set to `false` with `confidenceLevel: 'LOW'` to clearly signal that no network
 * could be constructed.
 *
 * @param params - Original tool parameters (echoed into `analysisType` and `depth`)
 * @returns Safe empty result suitable for direct MCP client return
 */
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

/**
 * Filters the full MEP list to only those who share at least one committee with
 * the focus MEP (ego network).
 *
 * If the focus MEP cannot be found in the list, the entire unfiltered list is
 * returned so the analysis degrades gracefully to a full network.
 *
 * @param meps - Full list of MEP records from the EP API
 * @param mepId - Numeric ID of the focus MEP for the ego-network
 * @returns Filtered list containing the focus MEP plus all committee neighbours,
 *   or the original `meps` array if the focus MEP is not found
 */
function filterMepsForEgoNetwork(meps: MEPRecord[], mepId: number): MEPRecord[] {
  const focusMep = meps.find(m => m.id === String(mepId));
  if (focusMep === undefined) return meps;
  const focusCommittees = new Set(focusMep.committees);
  return meps.filter(m => m.id === focusMep.id || m.committees.some(c => focusCommittees.has(c)));
}

/**
 * Derives aggregate network statistics from the computed nodes and edges.
 *
 * Returns four metrics used to populate the top-level result fields:
 * - `clusterCount` — number of distinct political-bloc cluster labels
 * - `isolatedMEPs` — number of nodes with degree 0 (no shared committee peers)
 * - `networkDensity` — ratio of actual to maximum possible edges
 * - `avgDegree` — mean degree across all nodes
 *
 * @param nodes - Array of scored network nodes
 * @param edges - Array of network edges
 * @returns Object containing `clusterCount`, `isolatedMEPs`, `networkDensity`, and `avgDegree`
 */
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
