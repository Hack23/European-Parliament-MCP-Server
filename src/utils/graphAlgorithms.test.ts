/**
 * Tests for src/utils/graphAlgorithms.ts
 */

import { describe, it, expect } from 'vitest';
import {
  buildAdjacency,
  bfsLimited,
  weightedDegree,
  betweennessCentrality,
  labelPropagation,
  modularity,
  type WeightedEdge,
} from './graphAlgorithms.js';

const triangleNodes = ['A', 'B', 'C'];
const triangleEdges: WeightedEdge[] = [
  { sourceId: 'A', targetId: 'B', weight: 1 },
  { sourceId: 'B', targetId: 'C', weight: 1 },
  { sourceId: 'A', targetId: 'C', weight: 1 },
];

const chainNodes = ['1', '2', '3', '4'];
const chainEdges: WeightedEdge[] = [
  { sourceId: '1', targetId: '2', weight: 1 },
  { sourceId: '2', targetId: '3', weight: 1 },
  { sourceId: '3', targetId: '4', weight: 1 },
];

describe('graphAlgorithms', () => {
  describe('buildAdjacency', () => {
    it('builds symmetric adjacency for undirected edges', () => {
      const adj = buildAdjacency(triangleNodes, triangleEdges);
      expect(adj.get('A')?.get('B')).toBe(1);
      expect(adj.get('B')?.get('A')).toBe(1);
    });

    it('drops self-loops', () => {
      const adj = buildAdjacency(['X'], [{ sourceId: 'X', targetId: 'X', weight: 1 }]);
      expect(adj.get('X')?.size).toBe(0);
    });

    it('merges parallel edges by max weight', () => {
      const adj = buildAdjacency(['A', 'B'], [
        { sourceId: 'A', targetId: 'B', weight: 0.3 },
        { sourceId: 'A', targetId: 'B', weight: 0.8 },
      ]);
      expect(adj.get('A')?.get('B')).toBe(0.8);
    });
  });

  describe('bfsLimited', () => {
    const adj = buildAdjacency(chainNodes, chainEdges);

    it('depth=0 returns only the seed', () => {
      expect(bfsLimited(adj, ['1'], 0)).toEqual(new Set(['1']));
    });

    it('depth=1 returns seed + direct neighbours', () => {
      expect(bfsLimited(adj, ['1'], 1)).toEqual(new Set(['1', '2']));
    });

    it('depth=2 reaches friends-of-friends', () => {
      expect(bfsLimited(adj, ['1'], 2)).toEqual(new Set(['1', '2', '3']));
    });

    it('depth=3 reaches the whole connected chain', () => {
      expect(bfsLimited(adj, ['1'], 3)).toEqual(new Set(['1', '2', '3', '4']));
    });

    it('depth-monotonicity holds', () => {
      const d1 = bfsLimited(adj, ['1'], 1).size;
      const d2 = bfsLimited(adj, ['1'], 2).size;
      const d3 = bfsLimited(adj, ['1'], 3).size;
      expect(d2).toBeGreaterThanOrEqual(d1);
      expect(d3).toBeGreaterThanOrEqual(d2);
    });

    it('handles unknown seed gracefully', () => {
      expect(bfsLimited(adj, ['UNKNOWN'], 2)).toEqual(new Set());
    });

    it('is deterministic across runs', () => {
      const r1 = [...bfsLimited(adj, ['2'], 2)].sort();
      const r2 = [...bfsLimited(adj, ['2'], 2)].sort();
      expect(r1).toEqual(r2);
    });
  });

  describe('weightedDegree', () => {
    it('sums incident edge weights', () => {
      const d = weightedDegree(['A', 'B', 'C'], [
        { sourceId: 'A', targetId: 'B', weight: 0.5 },
        { sourceId: 'A', targetId: 'C', weight: 0.3 },
      ]);
      expect(d.get('A')).toBeCloseTo(0.8);
      expect(d.get('B')).toBe(0.5);
      expect(d.get('C')).toBe(0.3);
    });

    it('reports zero for isolates', () => {
      const d = weightedDegree(['X'], []);
      expect(d.get('X')).toBe(0);
    });
  });

  describe('betweennessCentrality', () => {
    it('triangle has zero betweenness for every node', () => {
      const bc = betweennessCentrality(triangleNodes, triangleEdges);
      for (const v of triangleNodes) {
        expect(bc.get(v)).toBe(0);
      }
    });

    it('chain middle nodes have non-zero betweenness, endpoints zero', () => {
      const bc = betweennessCentrality(chainNodes, chainEdges);
      expect(bc.get('1')).toBe(0);
      expect(bc.get('4')).toBe(0);
      expect(bc.get('2') ?? 0).toBeGreaterThan(0);
      expect(bc.get('3') ?? 0).toBeGreaterThan(0);
    });

    it('star-graph centre has the highest betweenness', () => {
      const star: WeightedEdge[] = [
        { sourceId: 'hub', targetId: 'a', weight: 1 },
        { sourceId: 'hub', targetId: 'b', weight: 1 },
        { sourceId: 'hub', targetId: 'c', weight: 1 },
        { sourceId: 'hub', targetId: 'd', weight: 1 },
      ];
      const bc = betweennessCentrality(['hub', 'a', 'b', 'c', 'd'], star);
      expect(bc.get('hub') ?? 0).toBeGreaterThan(bc.get('a') ?? 0);
      // Normalised to [0, 1].
      expect(bc.get('hub') ?? 0).toBeLessThanOrEqual(1);
    });
  });

  describe('labelPropagation', () => {
    it('groups a strongly-connected community together', () => {
      const edges: WeightedEdge[] = [
        // Triangle (community 1)
        { sourceId: 'A', targetId: 'B', weight: 1 },
        { sourceId: 'B', targetId: 'C', weight: 1 },
        { sourceId: 'A', targetId: 'C', weight: 1 },
        // Triangle (community 2)
        { sourceId: 'X', targetId: 'Y', weight: 1 },
        { sourceId: 'Y', targetId: 'Z', weight: 1 },
        { sourceId: 'X', targetId: 'Z', weight: 1 },
        // Weak bridge
        { sourceId: 'C', targetId: 'X', weight: 0.1 },
      ];
      const labels = labelPropagation(['A', 'B', 'C', 'X', 'Y', 'Z'], edges);
      expect(labels.get('A')).toBe(labels.get('B'));
      expect(labels.get('B')).toBe(labels.get('C'));
      expect(labels.get('X')).toBe(labels.get('Y'));
      expect(labels.get('Y')).toBe(labels.get('Z'));
      expect(labels.get('A')).not.toBe(labels.get('X'));
    });

    it('is deterministic across runs', () => {
      const edges = chainEdges;
      const r1 = labelPropagation(chainNodes, edges);
      const r2 = labelPropagation(chainNodes, edges);
      for (const id of chainNodes) {
        expect(r2.get(id)).toBe(r1.get(id));
      }
    });
  });

  describe('modularity', () => {
    it('returns 0 for a graph with no edges', () => {
      const labels = new Map<string, string>([['A', 'c1'], ['B', 'c2']]);
      expect(modularity(['A', 'B'], [], labels)).toBe(0);
    });

    it('reports positive Q for a well-clustered graph', () => {
      const edges: WeightedEdge[] = [
        { sourceId: 'A', targetId: 'B', weight: 1 },
        { sourceId: 'B', targetId: 'C', weight: 1 },
        { sourceId: 'A', targetId: 'C', weight: 1 },
        { sourceId: 'X', targetId: 'Y', weight: 1 },
        { sourceId: 'Y', targetId: 'Z', weight: 1 },
        { sourceId: 'X', targetId: 'Z', weight: 1 },
        { sourceId: 'C', targetId: 'X', weight: 0.1 },
      ];
      const labels = new Map<string, string>([
        ['A', 'cA'], ['B', 'cA'], ['C', 'cA'],
        ['X', 'cB'], ['Y', 'cB'], ['Z', 'cB'],
      ]);
      const q = modularity(['A', 'B', 'C', 'X', 'Y', 'Z'], edges, labels);
      expect(q).toBeGreaterThan(0.3);
    });
  });
});
