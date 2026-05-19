/**
 * @fileoverview Graph algorithms for MEP relationship-network OSINT.
 *
 * Pure, deterministic helpers consumed by `network_analysis`:
 * - {@link buildAdjacency} — adjacency map from a weighted edge list.
 * - {@link bfsLimited} — depth-bounded BFS ego-network extraction.
 * - {@link weightedDegree} — weighted-degree centrality per node.
 * - {@link betweennessCentrality} — Brandes' algorithm (weighted, O(V·E)).
 * - {@link labelPropagation} — deterministic label-propagation community detection.
 * - {@link modularity} — Newman's modularity Q for a partition.
 *
 * Algorithms are deterministic — every iteration orders nodes/edges by string
 * comparison so identical input always produces identical output, satisfying
 * the OSINT reproducibility requirement.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege).
 *
 * @module utils/graphAlgorithms
 * @since 1.4.0
 */

/** Simple weighted undirected edge representation. */
export interface WeightedEdge {
  /** Stable identifier of the first endpoint. */
  sourceId: string;
  /** Stable identifier of the second endpoint. */
  targetId: string;
  /** Edge weight in `[0, 1]`. */
  weight: number;
}

/** Adjacency representation: `adj.get(node)` → neighbour → weight. */
export type AdjacencyMap = Map<string, Map<string, number>>;

/**
 * Build an undirected adjacency map from a weighted edge list.
 *
 * Self-loops are dropped. Parallel edges between the same pair are merged
 * by taking the **maximum** weight (so combined networks remain
 * well-defined when both committee and voting edges describe the same pair).
 *
 * @param nodeIds - Full node universe; nodes without edges still appear as empty maps.
 * @param edges - Weighted edges (order-independent).
 * @returns Adjacency map keyed by node id.
 */
export function buildAdjacency(nodeIds: readonly string[], edges: readonly WeightedEdge[]): AdjacencyMap {
  const adj: AdjacencyMap = new Map();
  for (const id of nodeIds) adj.set(id, new Map());
  for (const e of edges) {
    if (e.sourceId === e.targetId) continue;
    const a = adj.get(e.sourceId);
    const b = adj.get(e.targetId);
    if (a === undefined || b === undefined) continue;
    const existing = a.get(e.targetId) ?? 0;
    if (e.weight > existing) {
      a.set(e.targetId, e.weight);
      b.set(e.sourceId, e.weight);
    }
  }
  return adj;
}

/**
 * Breadth-first traversal capped at `maxDepth` hops from one or more seeds.
 *
 * Returns the set of node ids reachable within `maxDepth` hops (inclusive).
 * `maxDepth=1` returns only the seeds plus their direct neighbours;
 * `maxDepth=0` returns only the seeds themselves.
 *
 * @param adj - Adjacency map produced by {@link buildAdjacency}.
 * @param seeds - One or more starting node ids.
 * @param maxDepth - Non-negative hop limit.
 * @returns Set of reachable node ids.
 */
/** Lex-compare helper for deterministic ordering. */
function lexCompare(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/** Expand one BFS frontier into the next within an adjacency map. */
function expandFrontier(
  adj: AdjacencyMap,
  frontier: readonly string[],
  visited: Set<string>
): string[] {
  const next: string[] = [];
  for (const node of frontier) {
    const neighbours = adj.get(node);
    if (neighbours === undefined) continue;
    const sortedNeighbours = [...neighbours.keys()].sort(lexCompare);
    for (const n of sortedNeighbours) {
      if (!visited.has(n)) {
        visited.add(n);
        next.push(n);
      }
    }
  }
  return next;
}

export function bfsLimited(adj: AdjacencyMap, seeds: readonly string[], maxDepth: number): Set<string> {
  const visited = new Set<string>();
  if (maxDepth < 0) return visited;
  let frontier: string[] = [];
  for (const s of seeds) {
    if (adj.has(s) && !visited.has(s)) {
      visited.add(s);
      frontier.push(s);
    }
  }
  for (let depth = 0; depth < maxDepth && frontier.length > 0; depth++) {
    frontier.sort(lexCompare);
    frontier = expandFrontier(adj, frontier, visited);
  }
  return visited;
}

/**
 * Weighted-degree centrality: sum of incident edge weights per node.
 *
 * @param nodeIds - Node universe (so isolates return 0 rather than be omitted).
 * @param edges - Weighted edges.
 * @returns Map from node id → summed incident weight.
 */
export function weightedDegree(nodeIds: readonly string[], edges: readonly WeightedEdge[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const id of nodeIds) out.set(id, 0);
  for (const e of edges) {
    if (e.sourceId === e.targetId) continue;
    if (out.has(e.sourceId)) out.set(e.sourceId, (out.get(e.sourceId) ?? 0) + e.weight);
    if (out.has(e.targetId)) out.set(e.targetId, (out.get(e.targetId) ?? 0) + e.weight);
  }
  return out;
}

/**
 * Brandes' betweenness centrality on a weighted undirected graph.
 *
 * Implements Dijkstra-based shortest-path counting from each source as
 * described in U. Brandes, *A Faster Algorithm for Betweenness Centrality*
 * (2001). Edge weights are interpreted as **similarity** — internally
 * converted to distance `1 / weight` so high-weight edges are "shorter"
 * and therefore preferred routes for brokers.
 *
 * Complexity: `O(V · (V + E) · log V)` worst case for weighted graphs.
 *
 * The returned scores are normalised by `1 / ((V-1)(V-2))` for V≥3 (undirected
 * graph — each unordered pair is traversed twice during Brandes) so they
 * land in `[0, 1]`. For V<3, raw scores (all zero) are returned.
 *
 * @param nodeIds - Node universe (deterministic order is enforced internally).
 * @param edges - Weighted edges (similarity in `(0, 1]`).
 * @returns Map from node id → normalised betweenness in `[0, 1]`.
 */
/** Brandes per-source Dijkstra state. */
interface BrandesState {
  stack: string[];
  pred: Map<string, string[]>;
  sigma: Map<string, number>;
  dist: Map<string, number>;
}

function initBrandesState(nodes: readonly string[], source: string): BrandesState {
  const pred = new Map<string, string[]>();
  const sigma = new Map<string, number>();
  const dist = new Map<string, number>();
  for (const v of nodes) {
    pred.set(v, []);
    sigma.set(v, 0);
    dist.set(v, Number.POSITIVE_INFINITY);
  }
  sigma.set(source, 1);
  dist.set(source, 0);
  return { stack: [], pred, sigma, dist };
}

function popClosest(queue: string[], dist: Map<string, number>): string | undefined {
  queue.sort((a, b) => {
    const da = dist.get(a) ?? Number.POSITIVE_INFINITY;
    const db = dist.get(b) ?? Number.POSITIVE_INFINITY;
    if (da !== db) return da - db;
    return lexCompare(a, b);
  });
  return queue.shift();
}

function relaxShorter(state: BrandesState, queue: string[], v: string, w: string, alt: number): void {
  state.dist.set(w, alt);
  state.sigma.set(w, state.sigma.get(v) ?? 0);
  state.pred.set(w, [v]);
  if (!queue.includes(w)) queue.push(w);
}

function relaxEqual(state: BrandesState, v: string, w: string): void {
  state.sigma.set(w, (state.sigma.get(w) ?? 0) + (state.sigma.get(v) ?? 0));
  state.pred.get(w)?.push(v);
}

function relaxEdge(
  state: BrandesState,
  queue: string[],
  v: string,
  w: string,
  weight: number
): void {
  if (weight <= 0) return;
  const dv = state.dist.get(v) ?? Number.POSITIVE_INFINITY;
  const alt = dv + 1 / weight;
  const dw = state.dist.get(w) ?? Number.POSITIVE_INFINITY;
  if (alt < dw - 1e-12) relaxShorter(state, queue, v, w, alt);
  else if (Math.abs(alt - dw) < 1e-12) relaxEqual(state, v, w);
}

function runDijkstra(adj: AdjacencyMap, state: BrandesState, source: string): void {
  const queue: string[] = [source];
  while (queue.length > 0) {
    const v = popClosest(queue, state.dist);
    if (v === undefined) break;
    state.stack.push(v);
    const neighbours = adj.get(v);
    if (neighbours === undefined) continue;
    for (const [w, weight] of neighbours) {
      relaxEdge(state, queue, v, w, weight);
    }
  }
}

function propagateDelta(state: BrandesState, w: string, delta: Map<string, number>): void {
  const sw = state.sigma.get(w) ?? 0;
  const dw = delta.get(w) ?? 0;
  if (sw <= 0) return;
  for (const v of state.pred.get(w) ?? []) {
    const sv = state.sigma.get(v) ?? 0;
    delta.set(v, (delta.get(v) ?? 0) + (sv / sw) * (1 + dw));
  }
}

function accumulateBetweenness(
  state: BrandesState,
  source: string,
  nodes: readonly string[],
  cb: Map<string, number>
): void {
  const delta = new Map<string, number>();
  for (const v of nodes) delta.set(v, 0);
  while (state.stack.length > 0) {
    const w = state.stack.pop();
    if (w === undefined) break;
    propagateDelta(state, w, delta);
    if (w !== source) cb.set(w, (cb.get(w) ?? 0) + (delta.get(w) ?? 0));
  }
}

export function betweennessCentrality(
  nodeIds: readonly string[],
  edges: readonly WeightedEdge[]
): Map<string, number> {
  const sortedNodes = [...nodeIds].sort(lexCompare);
  const adj = buildAdjacency(sortedNodes, edges);
  const cb = new Map<string, number>();
  for (const v of sortedNodes) cb.set(v, 0);

  for (const s of sortedNodes) {
    const state = initBrandesState(sortedNodes, s);
    runDijkstra(adj, state, s);
    accumulateBetweenness(state, s, sortedNodes, cb);
  }

  const n = sortedNodes.length;
  if (n >= 3) {
    // Undirected graph: each unordered pair is traversed twice by Brandes
    // (once from each endpoint as source), so the normalisation factor is
    // 1 / ((n-1)(n-2)) rather than the directed 2 / ((n-1)(n-2)).
    const norm = 1 / ((n - 1) * (n - 2));
    for (const [k, v] of cb) cb.set(k, Math.round(v * norm * 10000) / 10000);
  }
  return cb;
}

/**
 * Deterministic synchronous label propagation for community detection.
 *
 * Each node is initialised with its own label (its id). On every iteration
 * each node adopts the label that maximises the **sum of edge weights** to
 * neighbours sharing that label, with ties broken by lexicographic label
 * order. Iteration terminates when no label changes or after `maxIterations`.
 *
 * Synchronous ordering of node updates (sorted by node id) plus deterministic
 * tie-breaking guarantees reproducible clusters across runs.
 *
 * @param nodeIds - Node universe.
 * @param edges - Weighted edges.
 * @param maxIterations - Safety bound (default 30, typically converges in <10).
 * @returns Map from node id → community label.
 */
function runLabelIteration(
  sorted: readonly string[],
  adj: AdjacencyMap,
  labels: Map<string, string>
): boolean {
  let changed = false;
  const nextLabels = new Map(labels);
  for (const node of sorted) {
    const neighbours = adj.get(node);
    if (neighbours === undefined || neighbours.size === 0) continue;
    const score = aggregateNeighbourLabels(neighbours, labels);
    const bestLabel = pickBestLabel(score);
    if (bestLabel !== undefined && bestLabel !== labels.get(node)) {
      nextLabels.set(node, bestLabel);
      changed = true;
    }
  }
  for (const [k, v] of nextLabels) labels.set(k, v);
  return changed;
}

export function labelPropagation(
  nodeIds: readonly string[],
  edges: readonly WeightedEdge[],
  maxIterations = 30
): Map<string, string> {
  const sorted = [...nodeIds].sort(lexCompare);
  const adj = buildAdjacency(sorted, edges);
  const labels = new Map<string, string>();
  for (const id of sorted) labels.set(id, id);
  for (let iter = 0; iter < maxIterations; iter++) {
    if (!runLabelIteration(sorted, adj, labels)) break;
  }
  return labels;
}

/** Pick the label with the highest aggregated weight; ties broken lex-smallest. */
function pickBestLabel(score: Map<string, number>): string | undefined {
  if (score.size === 0) return undefined;
  const sortedScores = [...score.entries()].sort((a, b) => lexCompare(a[0], b[0]));
  let bestLabel: string | undefined;
  let bestScore = -Infinity;
  for (const [lab, s] of sortedScores) {
    if (s > bestScore + 1e-12) {
      bestScore = s;
      bestLabel = lab;
    }
  }
  return bestLabel;
}

/** Aggregate weighted neighbour labels for a single node during label propagation. */
function aggregateNeighbourLabels(
  neighbours: Map<string, number>,
  labels: Map<string, string>
): Map<string, number> {
  const score = new Map<string, number>();
  for (const [n, w] of neighbours) {
    const lab = labels.get(n);
    if (lab === undefined) continue;
    score.set(lab, (score.get(lab) ?? 0) + w);
  }
  return score;
}

/**
 * Newman's modularity Q for a weighted partition.
 *
 * `Q = (1 / 2m) Σ_{ij} [A_ij - k_i k_j / 2m] δ(c_i, c_j)`
 *
 * where `A_ij` is edge weight, `k_i` weighted degree, and `δ` the Kronecker
 * indicator for same-community. Q ∈ `[-0.5, 1]`; values >0.3 indicate
 * meaningful community structure.
 *
 * @param nodeIds - Node universe.
 * @param edges - Weighted edges.
 * @param labels - Community label per node (from {@link labelPropagation}).
 * @returns Modularity Q rounded to 4 decimal places (`0` when the graph is empty).
 */
export function modularity(
  nodeIds: readonly string[],
  edges: readonly WeightedEdge[],
  labels: Map<string, string>
): number {
  let m2 = 0;
  for (const e of edges) m2 += 2 * e.weight;
  if (m2 === 0) return 0;
  const deg = weightedDegree(nodeIds, edges);
  let q = 0;
  // Edge contributions (A_ij).
  for (const e of edges) {
    if (labels.get(e.sourceId) === labels.get(e.targetId)) {
      q += 2 * e.weight; // undirected pair counted both directions
    }
  }
  // Expected-degree subtraction over all same-community pairs (including self).
  for (const i of nodeIds) {
    const li = labels.get(i);
    const ki = deg.get(i) ?? 0;
    for (const j of nodeIds) {
      if (labels.get(j) !== li) continue;
      const kj = deg.get(j) ?? 0;
      q -= (ki * kj) / m2;
    }
  }
  return Math.round((q / m2) * 10000) / 10000;
}
