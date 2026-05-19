/**
 * MCP Tool: network_analysis
 *
 * MEP relationship network mapping combining committee co-membership and
 * DOCEO roll-call vote similarity. Supports depth-bounded BFS traversal
 * around a focus MEP, weighted-degree + Brandes betweenness centrality,
 * and deterministic label-propagation community detection (with Newman
 * modularity Q).
 *
 * **Intelligence Perspective:** Reveals informal power structures,
 * coalition-building pathways, and cross-party brokers that are invisible
 * from individual MEP profiles alone.
 *
 * **Business Perspective:** Enables B2G/B2B clients (lobbying firms,
 * think-tanks, government-affairs teams) to map key influencers and
 * prioritise outreach by network centrality.
 *
 * **Marketing Perspective:** Demonstrates EP data depth to journalists,
 * researchers, and civic-tech developers.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege).
 */

import { z } from 'zod';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse, buildErrorResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';
import {
  buildAdjacency,
  bfsLimited,
  betweennessCentrality,
  labelPropagation,
  modularity,
  weightedDegree,
  type WeightedEdge,
} from '../utils/graphAlgorithms.js';
import {
  computeNetworkVotingSimilarityFromDoceo,
  type VotingSimilarityEdge,
} from '../utils/networkVotingSimilarity.js';
import { auditLogger } from '../utils/auditLogger.js';

/**
 * Schema for network_analysis tool input.
 *
 * The `analysisType` and `depth` parameters are fully implemented:
 * - `analysisType: 'committee'` builds weighted shared-committee edges.
 * - `analysisType: 'voting'` builds DOCEO RCV similarity edges (Jaccard-like).
 * - `analysisType: 'combined'` merges both with the mean of normalised weights.
 * - `depth` bounds the BFS ego-network when `mepId` is provided.
 */
export const NetworkAnalysisSchema = z.object({
  mepId: z.number()
    .positive()
    .optional()
    .describe('Optional MEP ID to focus the network analysis on (ego network rooted at this MEP).'),
  analysisType: z.enum(['committee', 'voting', 'combined'])
    .optional()
    .default('combined')
    .describe('Edge construction mode: "committee" (shared-committee membership), "voting" (DOCEO RCV co-vote agreement), or "combined" (mean of the two normalised weights).'),
  depth: z.number()
    .int()
    .min(1)
    .max(3)
    .optional()
    .default(2)
    .describe('BFS traversal depth (1-3, default 2). Applied to the ego network when "mepId" is provided.'),
  minSimilarity: z.number()
    .min(0)
    .max(1)
    .optional()
    .default(0.7)
    .describe('Minimum DOCEO co-vote agreement (0-1, default 0.7) for a voting-similarity edge to be retained.'),
});

/**
 * Inferred parameter type for the {@link NetworkAnalysisSchema}.
 */
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
  weightedDegree: number;
  betweennessCentrality: number;
  degree: number;
  clusterLabel: string;
}

interface NetworkEdge {
  sourceId: string;
  targetId: string;
  relationshipStrength: number;
  relationshipType: 'committee_co_membership' | 'voting_similarity' | 'combined';
  sharedCommittees: number;
  votingSimilarity?: number;
  sharedDecisiveVotes?: number;
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
  minSimilarity: number;
  networkNodes: NetworkNode[];
  networkEdges: NetworkEdge[];
  centralMEPs: { mepId: string; mepName: string; centralityScore: number }[];
  clusterCount: number;
  modularityScore: number;
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
  dataQualityWarnings: string[];
}

/** Relationship strength multiplier per shared committee. */
const SHARED_COMMITTEE_STRENGTH_FACTOR = 0.3;

/** Hard cap on inspected MEP roster (issue: |V| ≤ 900 current roster). */
const MAX_NETWORK_NODES = 900;

/** Maximum edges returned in the response payload (existing behaviour). */
const MAX_RESPONSE_EDGES = 200;

/**
 * Extract the numeric portion of an EP MEP id (e.g. `person/124810` → `124810`).
 *
 * `transformMEP()` normalises EP MEP ids to the `person/{numericId}` form,
 * but DOCEO `mepVotes` is keyed by the bare numeric id. This helper produces
 * the lookup key shared by both sources; ids without a `/` are returned
 * unchanged so unit-test fixtures using bare ids (e.g. `MEP-1`) still match.
 */
function toNumericMepId(id: string): string {
  const idx = id.lastIndexOf('/');
  return idx >= 0 ? id.substring(idx + 1) : id;
}

/**
 * Compute network density of an undirected graph.
 */
function computeNetworkDensity(edgeCount: number, nodeCount: number): number {
  if (nodeCount < 2) return 0;
  const maxEdges = (nodeCount * (nodeCount - 1)) / 2;
  return maxEdges > 0 ? Math.round((edgeCount / maxEdges) * 10000) / 10000 : 0;
}

/**
 * Classify a network by structural density and size.
 */
function classifyNetworkType(density: number, nodeCount: number): string {
  if (nodeCount < 5) return 'SPARSE';
  if (density > 0.3) return 'DENSE';
  if (density > 0.1) return 'MODERATE';
  return 'SPARSE';
}

/**
 * Build weighted shared-committee edges (`committee` mode).
 *
 * Edge weight is `min(1, sharedCommittees × {@link SHARED_COMMITTEE_STRENGTH_FACTOR})`.
 */
function buildCommitteeEdges(meps: MEPRecord[]): NetworkEdge[] {
  const edges: NetworkEdge[] = [];
  for (let i = 0; i < meps.length; i++) {
    const a = meps[i];
    if (a === undefined) continue;
    const aCommittees = new Set(a.committees);
    for (let j = i + 1; j < meps.length; j++) {
      const b = meps[j];
      if (b === undefined) continue;
      let shared = 0;
      for (const c of b.committees) if (aCommittees.has(c)) shared += 1;
      if (shared > 0) {
        edges.push({
          sourceId: a.id,
          targetId: b.id,
          relationshipStrength: Math.min(1, shared * SHARED_COMMITTEE_STRENGTH_FACTOR),
          relationshipType: 'committee_co_membership',
          sharedCommittees: shared,
        });
      }
    }
  }
  return edges;
}

/**
 * Build voting-similarity edges from DOCEO results.
 */
function buildVotingEdges(votingEdges: readonly VotingSimilarityEdge[]): NetworkEdge[] {
  return votingEdges.map(e => ({
    sourceId: e.sourceId,
    targetId: e.targetId,
    relationshipStrength: e.similarity,
    relationshipType: 'voting_similarity' as const,
    sharedCommittees: 0,
    votingSimilarity: e.similarity,
    sharedDecisiveVotes: e.sharedDecisiveVotes,
  }));
}

/**
 * Merge committee and voting edges into a combined edge list. Where the same
 * pair appears in both inputs, the combined weight is the mean of the two
 * normalised weights; otherwise the single-source weight is preserved.
 */
function mergeCombinedEdges(
  committeeEdges: readonly NetworkEdge[],
  votingEdges: readonly NetworkEdge[]
): NetworkEdge[] {
  const byKey = new Map<string, NetworkEdge>();
  const keyOf = (s: string, t: string): string => (s < t ? `${s}|${t}` : `${t}|${s}`);
  for (const e of committeeEdges) {
    byKey.set(keyOf(e.sourceId, e.targetId), { ...e });
  }
  for (const v of votingEdges) {
    const key = keyOf(v.sourceId, v.targetId);
    const existing = byKey.get(key);
    if (existing === undefined) {
      byKey.set(key, { ...v });
    } else {
      const combinedWeight = Math.round(((existing.relationshipStrength + v.relationshipStrength) / 2) * 10000) / 10000;
      const merged: NetworkEdge = {
        sourceId: existing.sourceId,
        targetId: existing.targetId,
        relationshipStrength: combinedWeight,
        relationshipType: 'combined',
        sharedCommittees: existing.sharedCommittees,
      };
      if (v.votingSimilarity !== undefined) merged.votingSimilarity = v.votingSimilarity;
      if (v.sharedDecisiveVotes !== undefined) merged.sharedDecisiveVotes = v.sharedDecisiveVotes;
      byKey.set(key, merged);
    }
  }
  return [...byKey.values()];
}

/**
 * Assign a political-bloc cluster fallback label (used when the graph
 * algorithm cannot label isolated nodes).
 */
function assignBlocLabel(politicalGroup: string): string {
  const proEU = ['EPP', 'S&D', 'Renew', 'Greens/EFA'];
  const eurosceptic = ['ECR', 'ID', 'ESN'];
  if (proEU.includes(politicalGroup)) return 'pro_eu_bloc';
  if (eurosceptic.includes(politicalGroup)) return 'eurosceptic_bloc';
  return 'independent_bloc';
}

/**
 * Build scored {@link NetworkNode} objects from MEP records and the computed
 * edge list. Centrality is a weighted combination of weighted-degree (0.6)
 * and Brandes betweenness (0.4) on a 0-100 scale, rounded to 2dp.
 */
function buildNodes(
  meps: MEPRecord[],
  edges: NetworkEdge[],
  clusterLabels: Map<string, string>
): NetworkNode[] {
  const weighted: WeightedEdge[] = edges.map(e => ({
    sourceId: e.sourceId,
    targetId: e.targetId,
    weight: e.relationshipStrength,
  }));
  const ids = meps.map(m => m.id);
  const wDeg = weightedDegree(ids, weighted);
  const between = betweennessCentrality(ids, weighted);
  const degCount = new Map<string, number>();
  for (const id of ids) degCount.set(id, 0);
  for (const e of edges) {
    degCount.set(e.sourceId, (degCount.get(e.sourceId) ?? 0) + 1);
    degCount.set(e.targetId, (degCount.get(e.targetId) ?? 0) + 1);
  }
  return meps.map(mep => {
    const wd = wDeg.get(mep.id) ?? 0;
    const bc = between.get(mep.id) ?? 0;
    const degree = degCount.get(mep.id) ?? 0;
    const centralityScore = Math.round((wd * 0.6 + bc * 100 * 0.4) * 100) / 100;
    const clusterFromAlgo = clusterLabels.get(mep.id);
    // Post-process: isolated nodes (degree-0) get a stable bloc fallback
    // instead of a singleton self-label from label propagation.
    const effectiveLabel = degree === 0
      ? assignBlocLabel(mep.politicalGroup)
      : (clusterFromAlgo ?? assignBlocLabel(mep.politicalGroup));
    return {
      mepId: mep.id,
      mepName: mep.name,
      politicalGroup: mep.politicalGroup,
      country: mep.country,
      centralityScore,
      weightedDegree: Math.round(wd * 10000) / 10000,
      betweennessCentrality: Math.round(bc * 10000) / 10000,
      degree,
      clusterLabel: effectiveLabel,
    };
  });
}

/**
 * Identify MEPs bridging different communities using cross-cluster connectivity.
 */
/** Get the opposite endpoint of an edge for the supplied node, or `undefined`. */
function otherEndpoint(edge: NetworkEdge, nodeId: string): string | undefined {
  if (edge.sourceId === nodeId) return edge.targetId;
  if (edge.targetId === nodeId) return edge.sourceId;
  return undefined;
}

function findBridgingMEPs(nodes: NetworkNode[], edges: NetworkEdge[]): BridgingMep[] {
  const labelById = new Map(nodes.map(n => [n.mepId, n.clusterLabel] as const));
  const bridges: BridgingMep[] = [];
  for (const node of nodes) {
    const connected = new Set<string>();
    for (const e of edges) {
      const otherId = otherEndpoint(e, node.mepId);
      if (otherId === undefined) continue;
      const otherLabel = labelById.get(otherId);
      if (otherLabel !== undefined && otherLabel !== node.clusterLabel) {
        connected.add(otherLabel);
      }
    }
    if (connected.size >= 1) {
      bridges.push({
        mepId: node.mepId,
        mepName: node.mepName,
        bridgingScore: Math.round(connected.size * node.centralityScore * 100) / 100,
        connectsClusters: [...connected].sort(),
      });
    }
  }
  return bridges.sort((a, b) => b.bridgingScore - a.bridgingScore).slice(0, 10);
}

/**
 * Construct a zeroed result for the empty-data path.
 */
function buildEmptyResult(params: NetworkAnalysisParams): NetworkAnalysisResult {
  return {
    analysisType: params.analysisType,
    depth: params.depth,
    minSimilarity: params.minSimilarity,
    networkNodes: [],
    networkEdges: [],
    centralMEPs: [],
    clusterCount: 0,
    modularityScore: 0,
    networkDensity: 0,
    isolatedMEPs: 0,
    bridgingMEPs: [],
    computedAttributes: {
      totalNodes: 0,
      totalEdges: 0,
      avgDegree: 0,
      clusteringCoefficient: 0,
      networkType: 'EMPTY',
    },
    dataAvailable: false,
    confidenceLevel: 'LOW',
    dataFreshness: 'No data available',
    sourceAttribution: 'European Parliament Open Data Portal - data.europarl.europa.eu',
    methodology: 'Network analysis — no MEP data returned from EP API.',
    dataQualityWarnings: ['No MEP data returned from EP API — network analysis could not be performed'],
  };
}

/**
 * Build the ordered seed list for the BFS depth filter.
 *
 * When `mepId` is supplied the network is restricted to its ego subnetwork
 * within `depth` hops. Otherwise the seeds are all nodes (depth filtering is
 * effectively a no-op), preserving the full-network behaviour expected by
 * downstream OSINT consumers.
 */
function deriveSeeds(meps: MEPRecord[], mepId: number | undefined): string[] {
  if (mepId === undefined) return meps.map(m => m.id);
  const target = String(mepId);
  // EP records use `person/{numericId}` (see transformMEP), but historically /
  // in tests the bare numeric id is also valid. Match both forms via the
  // numeric-id projection so the BFS focus actually applies in production.
  const focus = meps.find(m => m.id === target || toNumericMepId(m.id) === target);
  if (focus !== undefined) return [focus.id];
  // Unknown focus → degrade gracefully to full network.
  return meps.map(m => m.id);
}

/**
 * Compute aggregate network metrics from the final nodes / edges set.
 */
function computeNetworkMetrics(nodes: NetworkNode[], edges: NetworkEdge[]): {
  clusterCount: number;
  isolatedMEPs: number;
  networkDensity: number;
  avgDegree: number;
} {
  const clusterLabels = new Set(nodes.map(n => n.clusterLabel));
  const isolated = nodes.filter(n => n.degree === 0).length;
  const density = computeNetworkDensity(edges.length, nodes.length);
  const avgDegree = nodes.length > 0
    ? Math.round((nodes.reduce((s, n) => s + n.degree, 0) / nodes.length) * 100) / 100
    : 0;
  return { clusterCount: clusterLabels.size, isolatedMEPs: isolated, networkDensity: density, avgDegree };
}

/**
 * Decide which methodology string and dataQualityWarnings to emit.
 */
function describeMethodology(
  analysisType: string,
  votingResultAvailable: boolean,
  rcvInspected: number
): { methodology: string; warnings: string[] } {
  const warnings: string[] = [];
  const lines: string[] = [];
  lines.push(`Analysis type: ${analysisType}.`);
  if (analysisType === 'committee') {
    lines.push('Edges: weighted shared-committee membership (weight = min(1, sharedCommittees × 0.3), ≥1 shared committee).');
  } else if (analysisType === 'voting') {
    lines.push('Edges: DOCEO RCV co-vote agreement (Jaccard-like, decisive votes only, ≥3 shared decisive votes).');
    if (!votingResultAvailable) warnings.push('DOCEO RCV data unavailable — voting-similarity edges could not be computed; edge set is empty but EP-sourced nodes are still returned for analysisType=voting');
  } else {
    lines.push('Edges: union of committee + DOCEO voting similarity. Shared pairs use the mean of the two normalised weights.');
    if (!votingResultAvailable) warnings.push('DOCEO RCV data unavailable — falling back to committee-only edges for analysisType=combined');
  }
  lines.push('Centrality = 0.6 × weighted-degree + 0.4 × 100 × betweenness (Brandes, weighted shortest paths via 1/weight).');
  lines.push('Communities detected via deterministic asynchronous label propagation; modularityScore is Newman Q.');
  lines.push('BFS depth-bounded ego network when mepId is supplied.');
  if (analysisType !== 'committee' && votingResultAvailable) {
    lines.push(`DOCEO RCV records inspected: ${String(rcvInspected)}.`);
    lines.push('Data source: https://data.europarl.europa.eu/api/v2/meps + DOCEO XML.');
  } else {
    lines.push('Data source: https://data.europarl.europa.eu/api/v2/meps.');
  }
  return { methodology: lines.join(' '), warnings };
}

interface VotingResultInfo {
  edges: NetworkEdge[];
  rcvInspected: number;
  available: boolean;
}

async function fetchVotingEdges(
  rawMeps: readonly MEPRecord[],
  minSimilarity: number
): Promise<VotingResultInfo> {
  // DOCEO mepVotes uses bare numeric ids, but EP MEP ids are normalised to
  // `person/{numericId}` (see transformMEP). Build a numeric→ep lookup so
  // returned edges can be translated back to the EP id space used by every
  // other code path in this module.
  const numericToEpId = new Map<string, string>();
  for (const m of rawMeps) {
    const numeric = toNumericMepId(m.id);
    // If two EP records collide on the same numeric id (should not happen
    // for current MEPs but is defensive), prefer the lex-smallest EP id so
    // the mapping remains deterministic.
    const existing = numericToEpId.get(numeric);
    if (existing === undefined || m.id < existing) numericToEpId.set(numeric, m.id);
  }
  const numericIdSet = new Set(numericToEpId.keys());
  const votingResult = await computeNetworkVotingSimilarityFromDoceo(numericIdSet, { minSimilarity });
  if (votingResult === null) return { edges: [], rcvInspected: 0, available: false };
  // Translate DOCEO numeric ids back to EP `person/{id}` ids for downstream
  // graph algorithms. Edges whose endpoints are not in the EP node universe
  // are dropped (defensive — should not happen given the numericIdSet input).
  const translated: VotingSimilarityEdge[] = [];
  for (const e of votingResult.edges) {
    const src = numericToEpId.get(e.sourceId);
    const tgt = numericToEpId.get(e.targetId);
    if (src === undefined || tgt === undefined) continue;
    translated.push({ ...e, sourceId: src, targetId: tgt });
  }
  return {
    edges: buildVotingEdges(translated),
    rcvInspected: votingResult.rcvVotesInspected,
    available: true,
  };
}

function selectEdgesByMode(
  analysisType: NetworkAnalysisParams['analysisType'],
  committeeEdges: NetworkEdge[],
  votingEdges: NetworkEdge[]
): NetworkEdge[] {
  if (analysisType === 'committee') return committeeEdges;
  if (analysisType === 'voting') return votingEdges;
  return mergeCombinedEdges(committeeEdges, votingEdges);
}

function deriveReachable(
  rawMeps: readonly MEPRecord[],
  edges: readonly NetworkEdge[],
  mepId: number | undefined,
  depth: number
): Set<string> {
  if (mepId === undefined) return new Set(rawMeps.map(m => m.id));
  const adjAll = buildAdjacency(rawMeps.map(m => m.id), edges.map(e => ({
    sourceId: e.sourceId,
    targetId: e.targetId,
    weight: e.relationshipStrength,
  })));
  const seeds = deriveSeeds([...rawMeps], mepId);
  const reachable = bfsLimited(adjAll, seeds, depth);
  for (const s of seeds) reachable.add(s);
  return reachable;
}

function deriveConfidence(nodeCount: number, edgeCount: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (nodeCount >= 20 && edgeCount >= 10) return 'MEDIUM';
  return 'LOW';
}

/**
 * Derive the dataFreshness string from actual data sources consumed.
 */
function deriveDataFreshness(analysisType: string, doceoAvailable: boolean): string {
  if (analysisType === 'committee') return 'Real-time EP API data (committee membership)';
  if (analysisType === 'voting') {
    return doceoAvailable ? 'DOCEO RCV XML (roll-call votes)' : 'DOCEO RCV data unavailable';
  }
  // combined
  return doceoAvailable
    ? 'Real-time EP API data + DOCEO RCV XML'
    : 'Real-time EP API data (DOCEO unavailable — committee-only fallback)';
}

/**
 * Compute the MEP relationship network for the supplied parameters.
 */
export async function networkAnalysis(params: NetworkAnalysisParams): Promise<ToolResult> {
  const startedAt = Date.now();
  try {
    // Fetch up to 100 MEPs (single API page). Full pagination is avoided
    // to stay within rate-limit budget; MAX_NETWORK_NODES caps if needed.
    const mepResult = await epClient.getCurrentMEPs({ limit: 100 });
    if (mepResult.data.length === 0) return buildToolResponse(buildEmptyResult(params));

    let rawMeps = mepResult.data as MEPRecord[];
    if (rawMeps.length > MAX_NETWORK_NODES) rawMeps = rawMeps.slice(0, MAX_NETWORK_NODES);

    const committeeEdges = params.analysisType === 'voting' ? [] : buildCommitteeEdges(rawMeps);
    const votingInfo = params.analysisType === 'committee'
      ? { edges: [], rcvInspected: 0, available: false }
      : await fetchVotingEdges(rawMeps, params.minSimilarity);

    const edges = selectEdgesByMode(params.analysisType, committeeEdges, votingInfo.edges);
    const reachable = deriveReachable(rawMeps, edges, params.mepId, params.depth);

    const targetMeps = rawMeps.filter(m => reachable.has(m.id));
    const filteredEdges = edges.filter(e => reachable.has(e.sourceId) && reachable.has(e.targetId));

    const weightedSubgraph: WeightedEdge[] = filteredEdges.map(e => ({
      sourceId: e.sourceId,
      targetId: e.targetId,
      weight: e.relationshipStrength,
    }));
    const ids = targetMeps.map(m => m.id);
    const labels = labelPropagation(ids, weightedSubgraph);
    const q = modularity(ids, weightedSubgraph, labels);

    const nodes = buildNodes(targetMeps, filteredEdges, labels);
    const { clusterCount, isolatedMEPs, networkDensity, avgDegree } = computeNetworkMetrics(nodes, filteredEdges);

    const centralMEPs = [...nodes]
      .sort((a, b) => b.centralityScore - a.centralityScore)
      .slice(0, 10)
      .map(n => ({ mepId: n.mepId, mepName: n.mepName, centralityScore: n.centralityScore }));

    const { methodology, warnings } = describeMethodology(
      params.analysisType,
      votingInfo.available,
      votingInfo.rcvInspected
    );

    auditLogger.logDataAccess(
      'network_analysis.compute',
      {
        analysisType: params.analysisType,
        depth: params.depth,
        minSimilarity: params.minSimilarity,
        nodeCount: nodes.length,
        edgeCount: filteredEdges.length,
        rcvInspected: votingInfo.rcvInspected,
      },
      nodes.length,
      Date.now() - startedAt
    );

    const result: NetworkAnalysisResult = {
      analysisType: params.analysisType,
      depth: params.depth,
      minSimilarity: params.minSimilarity,
      networkNodes: nodes,
      networkEdges: filteredEdges.slice(0, MAX_RESPONSE_EDGES),
      centralMEPs,
      clusterCount,
      modularityScore: q,
      networkDensity,
      isolatedMEPs,
      bridgingMEPs: findBridgingMEPs(nodes, filteredEdges),
      computedAttributes: {
        totalNodes: nodes.length,
        totalEdges: filteredEdges.length,
        avgDegree,
        clusteringCoefficient: Math.round(networkDensity * 1.5 * 100) / 100,
        networkType: classifyNetworkType(networkDensity, nodes.length),
      },
      dataAvailable: nodes.length > 0 && filteredEdges.length > 0,
      confidenceLevel: deriveConfidence(nodes.length, filteredEdges.length),
      dataFreshness: deriveDataFreshness(params.analysisType, votingInfo.available),
      sourceAttribution: 'European Parliament Open Data Portal - data.europarl.europa.eu',
      methodology,
      dataQualityWarnings: warnings,
    };

    return buildToolResponse(result);
  } catch (error: unknown) {
    return buildErrorResponse(
      error instanceof Error ? error : new Error(String(error)),
      'network_analysis'
    );
  }
}

/**
 * MCP tool metadata for `network_analysis`.
 */
export const networkAnalysisToolMetadata = {
  name: 'network_analysis',
  description: 'MEP relationship network mapping using committee co-membership and DOCEO roll-call vote similarity. Computes weighted-degree + Brandes betweenness centrality, deterministic label-propagation clusters with Newman modularity Q, and identifies cross-cluster brokers. Supports depth-bounded ego networks when mepId is supplied.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      mepId: {
        type: 'number',
        description: 'Optional MEP ID to focus the network analysis (ego network)',
      },
      analysisType: {
        type: 'string',
        enum: ['committee', 'voting', 'combined'],
        description: 'Edge mode: committee, voting (DOCEO RCV), or combined (mean of both).',
        default: 'combined',
      },
      depth: {
        type: 'number',
        description: 'BFS traversal depth applied to the ego network when mepId is provided (1-3, default 2).',
        minimum: 1,
        maximum: 3,
        default: 2,
      },
      minSimilarity: {
        type: 'number',
        description: 'Minimum DOCEO co-vote agreement to retain a voting-similarity edge (0-1, default 0.7).',
        minimum: 0,
        maximum: 1,
        default: 0.7,
      },
    },
  },
};

/**
 * MCP `CallTool` handler entry point for `network_analysis`.
 */
export async function handleNetworkAnalysis(args: unknown): Promise<ToolResult> {
  const params = NetworkAnalysisSchema.parse(args);
  return networkAnalysis(params);
}
