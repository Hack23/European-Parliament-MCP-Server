/**
 * Tests for network_analysis MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleNetworkAnalysis } from './networkAnalysis.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';
import * as doceoClientModule from '../clients/ep/doceoClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getCurrentMEPs: vi.fn(),
    getMEPDetails: vi.fn()
  }
}));

// Mock DOCEO client — default to empty so committee tests don't make network calls.
vi.mock('../clients/ep/doceoClient.js', () => ({
  doceoClient: {
    getLatestVotes: vi.fn(),
  },
}));

const mockMEPs = [
  { id: 'MEP-1', name: 'Alice Smith', country: 'DE', politicalGroup: 'EPP', committees: ['AGRI', 'ENVI'], active: true, termStart: '2019-07-02' },
  { id: 'MEP-2', name: 'Bob Jones', country: 'FR', politicalGroup: 'S&D', committees: ['ENVI', 'ITRE'], active: true, termStart: '2019-07-02' },
  { id: 'MEP-3', name: 'Clara Mueller', country: 'DE', politicalGroup: 'EPP', committees: ['AGRI', 'BUDG'], active: true, termStart: '2019-07-02' },
  { id: 'MEP-4', name: 'Diego Garcia', country: 'ES', politicalGroup: 'Renew', committees: ['ITRE'], active: true, termStart: '2019-07-02' },
  { id: 'MEP-5', name: 'Eva Nielsen', country: 'DK', politicalGroup: 'ECR', committees: ['LIBE'], active: true, termStart: '2019-07-02' }
];

describe('network_analysis Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(epClientModule.epClient.getCurrentMEPs).mockResolvedValue({
      data: mockMEPs,
      total: mockMEPs.length,
      limit: 50,
      offset: 0,
      hasMore: false
    });

    vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
      data: [],
      total: 0,
      datesAvailable: [],
      datesUnavailable: [],
      source: { type: 'DOCEO_XML', term: 10, urls: [] },
      limit: 100,
      offset: 0,
      hasMore: false,
    });
  });

  describe('Input Validation', () => {
    it('should accept empty params', async () => {
      const result = await handleNetworkAnalysis({});
      expect(result).toHaveProperty('content');
    });

    it('should accept mepId param', async () => {
      const result = await handleNetworkAnalysis({ mepId: 1 });
      expect(result).toHaveProperty('content');
    });

    it('should accept analysisType param', async () => {
      const result = await handleNetworkAnalysis({ analysisType: 'committee' });
      expect(result).toHaveProperty('content');
    });

    it('should accept depth param', async () => {
      const result = await handleNetworkAnalysis({ depth: 3 });
      expect(result).toHaveProperty('content');
    });

    it('should reject invalid depth', async () => {
      await expect(handleNetworkAnalysis({ depth: 5 })).rejects.toThrow();
    });

    it('should reject invalid analysisType', async () => {
      await expect(handleNetworkAnalysis({ analysisType: 'invalid' })).rejects.toThrow();
    });

    it('should reject negative mepId', async () => {
      await expect(handleNetworkAnalysis({ mepId: -1 })).rejects.toThrow();
    });
  });

  describe('Response Structure', () => {

    it('should include dataQualityWarnings array in response', async () => {
      const result = await handleNetworkAnalysis({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { dataQualityWarnings: string[] };
      expect(Array.isArray(data.dataQualityWarnings)).toBe(true);
    });
    it('should return MCP-compliant response', async () => {
      const result = await handleNetworkAnalysis({});
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
    });

    it('should return valid JSON', async () => {
      const result = await handleNetworkAnalysis({});
      expect(() => JSON.parse(result.content[0]?.text ?? '{}') as unknown).not.toThrow();
    });

    it('should include required top-level fields', async () => {
      const result = await handleNetworkAnalysis({});
      const data: unknown = JSON.parse(result.content[0]?.text ?? '{}');

      expect(data).toHaveProperty('networkNodes');
      expect(data).toHaveProperty('networkEdges');
      expect(data).toHaveProperty('centralMEPs');
      expect(data).toHaveProperty('clusterCount');
      expect(data).toHaveProperty('networkDensity');
      expect(data).toHaveProperty('isolatedMEPs');
      expect(data).toHaveProperty('bridgingMEPs');
      expect(data).toHaveProperty('computedAttributes');
      expect(data).toHaveProperty('dataAvailable');
      expect(data).toHaveProperty('confidenceLevel');
      expect(data).toHaveProperty('dataFreshness');
      expect(data).toHaveProperty('sourceAttribution');
      expect(data).toHaveProperty('methodology');
    });

    it('should include computedAttributes fields', async () => {
      const result = await handleNetworkAnalysis({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        computedAttributes: Record<string, unknown>;
      };

      expect(data.computedAttributes).toHaveProperty('totalNodes');
      expect(data.computedAttributes).toHaveProperty('totalEdges');
      expect(data.computedAttributes).toHaveProperty('avgDegree');
      expect(data.computedAttributes).toHaveProperty('clusteringCoefficient');
      expect(data.computedAttributes).toHaveProperty('networkType');
    });

    it('should populate nodes from MEP data', async () => {
      const result = await handleNetworkAnalysis({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        networkNodes: unknown[];
        computedAttributes: { totalNodes: number };
      };

      expect(data.networkNodes.length).toBeGreaterThan(0);
      expect(data.computedAttributes.totalNodes).toBe(data.networkNodes.length);
    });

    it('should build edges for MEPs with shared committees', async () => {
      const result = await handleNetworkAnalysis({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        networkEdges: unknown[];
        computedAttributes: { totalEdges: number };
      };

      // MEP-1 and MEP-2 share ENVI; MEP-1 and MEP-3 share AGRI; MEP-2 and MEP-4 share ITRE
      expect(data.networkEdges.length).toBeGreaterThan(0);
    });

    it('should have correct sourceAttribution', async () => {
      const result = await handleNetworkAnalysis({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { sourceAttribution: string };
      expect(data.sourceAttribution).toBe('European Parliament Open Data Portal - data.europarl.europa.eu');
    });
  });

  describe('dataAvailable: false scenario', () => {
    it('should return dataAvailable false when no MEPs returned', async () => {
      vi.mocked(epClientModule.epClient.getCurrentMEPs).mockResolvedValue({
        data: [],
        total: 0,
        limit: 50,
        offset: 0,
        hasMore: false
      });

      const result = await handleNetworkAnalysis({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        dataAvailable: boolean;
        confidenceLevel: string;
        networkNodes: unknown[];
      };

      expect(data.dataAvailable).toBe(false);
      expect(data.confidenceLevel).toBe('LOW');
      expect(data.networkNodes).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should return error response on API failure', async () => {
      vi.mocked(epClientModule.epClient.getCurrentMEPs).mockRejectedValue(new Error('API Error'));

      const result = await handleNetworkAnalysis({});
      expect(result.isError).toBe(true);
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { error: string };
      expect(data.error).toContain('API Error');
    });

    it('should handle non-Error exceptions', async () => {
      vi.mocked(epClientModule.epClient.getCurrentMEPs).mockRejectedValue('string error');

      const result = await handleNetworkAnalysis({});
      expect(result.isError).toBe(true);
    });
  });

  describe('Schema additions', () => {
    it('should accept minSimilarity param', async () => {
      const result = await handleNetworkAnalysis({ minSimilarity: 0.5 });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { minSimilarity: number };
      expect(data.minSimilarity).toBe(0.5);
    });

    it('should reject minSimilarity > 1', async () => {
      await expect(handleNetworkAnalysis({ minSimilarity: 1.5 })).rejects.toThrow();
    });

    it('should reject negative minSimilarity', async () => {
      await expect(handleNetworkAnalysis({ minSimilarity: -0.1 })).rejects.toThrow();
    });

    it('should default minSimilarity to 0.7', async () => {
      const result = await handleNetworkAnalysis({});
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { minSimilarity: number };
      expect(data.minSimilarity).toBe(0.7);
    });
  });

  describe('analysisType modes', () => {
    it('committee mode produces only committee edges and skips DOCEO call', async () => {
      const result = await handleNetworkAnalysis({ analysisType: 'committee' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        networkEdges: { relationshipType: string }[];
        analysisType: string;
      };
      expect(data.analysisType).toBe('committee');
      expect(data.networkEdges.length).toBeGreaterThan(0);
      for (const e of data.networkEdges) {
        expect(e.relationshipType).toBe('committee_co_membership');
      }
      expect(doceoClientModule.doceoClient.getLatestVotes).not.toHaveBeenCalled();
    });

    it('voting mode produces voting edges from DOCEO RCV data', async () => {
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
        data: [
          {
            id: 'v1', date: '2026-01-15', term: 10, subject: 's', reference: 'r',
            votesFor: 3, votesAgainst: 1, abstentions: 0, result: 'ADOPTED',
            mepVotes: { 'MEP-1': 'FOR', 'MEP-2': 'FOR', 'MEP-3': 'FOR', 'MEP-4': 'AGAINST' },
            sourceUrl: 'https://example/test', dataSource: 'RCV',
          },
          {
            id: 'v2', date: '2026-01-16', term: 10, subject: 's', reference: 'r',
            votesFor: 2, votesAgainst: 2, abstentions: 0, result: 'REJECTED',
            mepVotes: { 'MEP-1': 'FOR', 'MEP-2': 'FOR', 'MEP-3': 'FOR', 'MEP-4': 'AGAINST' },
            sourceUrl: 'https://example/test', dataSource: 'RCV',
          },
          {
            id: 'v3', date: '2026-01-17', term: 10, subject: 's', reference: 'r',
            votesFor: 3, votesAgainst: 1, abstentions: 0, result: 'ADOPTED',
            mepVotes: { 'MEP-1': 'FOR', 'MEP-2': 'FOR', 'MEP-3': 'FOR', 'MEP-4': 'AGAINST' },
            sourceUrl: 'https://example/test', dataSource: 'RCV',
          },
        ],
        total: 3, datesAvailable: [], datesUnavailable: [],
        source: { type: 'DOCEO_XML', term: 10, urls: [] },
        limit: 100, offset: 0, hasMore: false,
      });

      const result = await handleNetworkAnalysis({ analysisType: 'voting' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        networkEdges: { relationshipType: string; sourceId: string; targetId: string }[];
      };
      expect(data.networkEdges.length).toBeGreaterThan(0);
      for (const e of data.networkEdges) {
        expect(e.relationshipType).toBe('voting_similarity');
      }
      // MEP-1 / MEP-2 / MEP-3 fully agree → pairs should be present.
      const ids = data.networkEdges.flatMap(e => [e.sourceId, e.targetId]);
      expect(ids).toContain('MEP-1');
      expect(ids).toContain('MEP-2');
    });

    it('combined mode produces at least as many edges as committee mode', async () => {
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
        data: Array.from({ length: 5 }, (_, i) => ({
          id: `v${String(i)}`, date: '2026-01-15', term: 10, subject: 's', reference: 'r',
          votesFor: 4, votesAgainst: 1, abstentions: 0, result: 'ADOPTED' as const,
          mepVotes: { 'MEP-1': 'FOR' as const, 'MEP-5': 'FOR' as const, 'MEP-2': 'FOR' as const, 'MEP-3': 'AGAINST' as const },
          sourceUrl: 'https://example/test', dataSource: 'RCV' as const,
        })),
        total: 5, datesAvailable: [], datesUnavailable: [],
        source: { type: 'DOCEO_XML', term: 10, urls: [] },
        limit: 100, offset: 0, hasMore: false,
      });

      const committeeResult = await handleNetworkAnalysis({ analysisType: 'committee' });
      const committeeData = JSON.parse(committeeResult.content[0]?.text ?? '{}') as {
        networkEdges: unknown[]; computedAttributes: { totalEdges: number };
      };

      const combinedResult = await handleNetworkAnalysis({ analysisType: 'combined' });
      const combinedData = JSON.parse(combinedResult.content[0]?.text ?? '{}') as {
        networkEdges: { relationshipType: string }[];
        computedAttributes: { totalEdges: number };
      };

      // Combined must include at least all committee-pair signals (committee_co_membership
      // edges are preserved when DOCEO does not add a voting edge for the same pair).
      expect(combinedData.computedAttributes.totalEdges)
        .toBeGreaterThanOrEqual(committeeData.computedAttributes.totalEdges);
      const types = new Set(combinedData.networkEdges.map(e => e.relationshipType));
      // Contains at least one voting-derived edge (MEP-1↔MEP-5 are not committee peers).
      expect(types.has('voting_similarity') || types.has('combined')).toBe(true);
    });

    it('combined mode falls back to committee edges when DOCEO unavailable', async () => {
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockRejectedValue(new Error('DOCEO down'));
      const result = await handleNetworkAnalysis({ analysisType: 'combined' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        networkEdges: { relationshipType: string }[];
        dataQualityWarnings: string[];
      };
      expect(data.networkEdges.length).toBeGreaterThan(0);
      expect(data.dataQualityWarnings.some(w => w.includes('DOCEO'))).toBe(true);
    });
  });

  describe('Depth-bounded BFS ego network', () => {
    const linearMEPs = [
      { id: '101', name: 'A', country: 'DE', politicalGroup: 'EPP', committees: ['C1'], active: true, termStart: '2019-07-02' },
      { id: '102', name: 'B', country: 'FR', politicalGroup: 'S&D', committees: ['C1', 'C2'], active: true, termStart: '2019-07-02' },
      { id: '103', name: 'C', country: 'IT', politicalGroup: 'Renew', committees: ['C2', 'C3'], active: true, termStart: '2019-07-02' },
      { id: '104', name: 'D', country: 'ES', politicalGroup: 'Greens/EFA', committees: ['C3'], active: true, termStart: '2019-07-02' },
    ];

    beforeEach(() => {
      vi.mocked(epClientModule.epClient.getCurrentMEPs).mockResolvedValue({
        data: linearMEPs, total: linearMEPs.length, limit: 50, offset: 0, hasMore: false,
      });
    });

    it('depth=1 returns only the direct neighbours of the focus MEP', async () => {
      const result = await handleNetworkAnalysis({ analysisType: 'committee', mepId: 101, depth: 1 });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        networkNodes: { mepId: string }[];
      };
      const ids = new Set(data.networkNodes.map(n => n.mepId));
      // 101 is connected via C1 to 102 only.
      expect(ids.has('101')).toBe(true);
      expect(ids.has('102')).toBe(true);
      expect(ids.has('103')).toBe(false);
      expect(ids.has('104')).toBe(false);
    });

    it('depth=2 adds friends-of-friends, depth=3 covers the chain', async () => {
      const d1 = await handleNetworkAnalysis({ analysisType: 'committee', mepId: 101, depth: 1 });
      const d2 = await handleNetworkAnalysis({ analysisType: 'committee', mepId: 101, depth: 2 });
      const d3 = await handleNetworkAnalysis({ analysisType: 'committee', mepId: 101, depth: 3 });
      const count = (r: typeof d1): number =>
        (JSON.parse(r.content[0]?.text ?? '{}') as { networkNodes: unknown[] }).networkNodes.length;
      expect(count(d2)).toBeGreaterThanOrEqual(count(d1));
      expect(count(d3)).toBeGreaterThanOrEqual(count(d2));
      // depth=3 reaches all 4 nodes along the chain.
      expect(count(d3)).toBe(4);
    });

    it('matches the focus MEP when EP returns ids in the production `person/{id}` form', async () => {
      // transformMEP() normalises EP MEP ids to `person/{numericId}`. The
      // BFS focus must still apply when the user passes a bare numeric id.
      const productionMEPs = linearMEPs.map(m => ({ ...m, id: `person/${m.id}` }));
      vi.mocked(epClientModule.epClient.getCurrentMEPs).mockResolvedValue({
        data: productionMEPs, total: productionMEPs.length, limit: 50, offset: 0, hasMore: false,
      });
      const result = await handleNetworkAnalysis({ analysisType: 'committee', mepId: 101, depth: 1 });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        networkNodes: { mepId: string }[];
      };
      const ids = new Set(data.networkNodes.map(n => n.mepId));
      // Depth=1 from person/101 along chain C1 reaches only person/102.
      expect(ids.has('person/101')).toBe(true);
      expect(ids.has('person/102')).toBe(true);
      expect(ids.has('person/103')).toBe(false);
      expect(ids.has('person/104')).toBe(false);
    });
  });

  describe('DOCEO id normalisation', () => {
    it('voting edges are emitted when EP returns `person/{id}` ids and DOCEO uses numeric ids', async () => {
      // Simulate the production wire format: EP MEPs use `person/{id}`,
      // DOCEO mepVotes uses bare numeric ids. The voting-similarity edges
      // must be translated back to EP `person/{id}` ids so node universes
      // remain consistent across committee / voting / combined modes.
      const productionMEPs = [
        { id: 'person/501', name: 'P', country: 'DE', politicalGroup: 'EPP', committees: ['ENVI'], active: true, termStart: '2019-07-02' },
        { id: 'person/502', name: 'Q', country: 'FR', politicalGroup: 'EPP', committees: ['ENVI'], active: true, termStart: '2019-07-02' },
        { id: 'person/503', name: 'R', country: 'IT', politicalGroup: 'S&D', committees: ['LIBE'], active: true, termStart: '2019-07-02' },
      ];
      vi.mocked(epClientModule.epClient.getCurrentMEPs).mockResolvedValue({
        data: productionMEPs, total: productionMEPs.length, limit: 50, offset: 0, hasMore: false,
      });
      vi.mocked(doceoClientModule.doceoClient.getLatestVotes).mockResolvedValue({
        data: Array.from({ length: 4 }, (_, i) => ({
          id: `v${String(i)}`, date: '2026-01-15', term: 10, subject: 's', reference: 'r',
          votesFor: 2, votesAgainst: 1, abstentions: 0, result: 'ADOPTED' as const,
          // Bare numeric ids — exactly what DOCEO returns in production.
          mepVotes: { '501': 'FOR' as const, '502': 'FOR' as const, '503': 'AGAINST' as const },
          sourceUrl: 'https://example/test', dataSource: 'RCV' as const,
        })),
        total: 4, datesAvailable: [], datesUnavailable: [],
        source: { type: 'DOCEO_XML', term: 10, urls: [] },
        limit: 100, offset: 0, hasMore: false,
      });

      const result = await handleNetworkAnalysis({ analysisType: 'voting', minSimilarity: 0.5 });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        networkEdges: { sourceId: string; targetId: string }[];
        networkNodes: { mepId: string }[];
      };
      // At least one voting edge must be emitted, and its endpoints must
      // match the EP `person/{id}` ids used everywhere else in the graph.
      expect(data.networkEdges.length).toBeGreaterThan(0);
      const epIds = new Set(data.networkNodes.map(n => n.mepId));
      for (const e of data.networkEdges) {
        expect(epIds.has(e.sourceId)).toBe(true);
        expect(epIds.has(e.targetId)).toBe(true);
        // Specifically, MEP-501 and MEP-502 fully agree across all votes.
      }
      const involvedIds = data.networkEdges.flatMap(e => [e.sourceId, e.targetId]);
      expect(involvedIds).toContain('person/501');
      expect(involvedIds).toContain('person/502');
    });
  });

  describe('Weighted centrality & deterministic clustering', () => {
    it('exposes weightedDegree, betweennessCentrality, and modularityScore', async () => {
      const result = await handleNetworkAnalysis({ analysisType: 'committee' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        networkNodes: { weightedDegree: number; betweennessCentrality: number }[];
        modularityScore: number;
      };
      for (const n of data.networkNodes) {
        expect(typeof n.weightedDegree).toBe('number');
        expect(typeof n.betweennessCentrality).toBe('number');
      }
      expect(typeof data.modularityScore).toBe('number');
    });

    it('clusters and centralities are deterministic across runs', async () => {
      const a = await handleNetworkAnalysis({ analysisType: 'committee' });
      const b = await handleNetworkAnalysis({ analysisType: 'committee' });
      type Run = {
        modularityScore: number;
        networkNodes: { mepId: string; clusterLabel: string; centralityScore: number }[];
      };
      const aData = JSON.parse(a.content[0]?.text ?? '{}') as Run;
      const bData = JSON.parse(b.content[0]?.text ?? '{}') as Run;
      expect(bData.modularityScore).toBe(aData.modularityScore);
      const aMap = new Map(aData.networkNodes.map(n => [n.mepId, n] as const));
      for (const n of bData.networkNodes) {
        const peer = aMap.get(n.mepId);
        expect(peer?.clusterLabel).toBe(n.clusterLabel);
        expect(peer?.centralityScore).toBe(n.centralityScore);
      }
    });

    it('identifies bridging MEPs across clusters when present', async () => {
      // Construct a topology where two real communities exist:
      //   Left cluster:  MEP-A1, MEP-A2, MEP-A3 share two committees pairwise
      //     (strong weights → 0.6) and form a triangle.
      //   Right cluster: MEP-B1, MEP-B2, MEP-B3 share two committees pairwise
      //     (strong weights → 0.6) and form a triangle.
      //   MEP-Broker is connected to each cluster via a single committee
      //     (weak weights → 0.3) and bridges them.
      // With deterministic asynchronous label propagation this yields two
      // distinct communities with MEP-Broker as the cross-cluster broker.
      const brokerMEPs = [
        { id: 'MEP-A1', name: 'A1', country: 'DE', politicalGroup: 'EPP', committees: ['AGRI', 'ENVI'], active: true, termStart: '2019-07-02' },
        { id: 'MEP-A2', name: 'A2', country: 'FR', politicalGroup: 'EPP', committees: ['AGRI', 'ENVI'], active: true, termStart: '2019-07-02' },
        { id: 'MEP-A3', name: 'A3', country: 'IT', politicalGroup: 'EPP', committees: ['AGRI', 'ENVI'], active: true, termStart: '2019-07-02' },
        { id: 'MEP-Broker', name: 'Broker', country: 'ES', politicalGroup: 'Renew', committees: ['ENVI', 'LIBE'], active: true, termStart: '2019-07-02' },
        { id: 'MEP-B1', name: 'B1', country: 'NL', politicalGroup: 'S&D', committees: ['LIBE', 'ITRE'], active: true, termStart: '2019-07-02' },
        { id: 'MEP-B2', name: 'B2', country: 'BE', politicalGroup: 'S&D', committees: ['LIBE', 'ITRE'], active: true, termStart: '2019-07-02' },
        { id: 'MEP-B3', name: 'B3', country: 'SE', politicalGroup: 'S&D', committees: ['LIBE', 'ITRE'], active: true, termStart: '2019-07-02' },
      ];
      vi.mocked(epClientModule.epClient.getCurrentMEPs).mockResolvedValue({
        data: brokerMEPs, total: brokerMEPs.length, limit: 50, offset: 0, hasMore: false,
      });

      const result = await handleNetworkAnalysis({ analysisType: 'committee' });
      const data = JSON.parse(result.content[0]?.text ?? '{}') as {
        bridgingMEPs: { mepId: string; connectsClusters: string[] }[];
        clusterCount: number;
      };
      expect(Array.isArray(data.bridgingMEPs)).toBe(true);
      // The asymmetric topology must produce at least two communities.
      expect(data.clusterCount).toBeGreaterThanOrEqual(2);
      const bridge = data.bridgingMEPs.find(b => b.mepId === 'MEP-Broker');
      expect(bridge).toBeDefined();
    });
  });
});
