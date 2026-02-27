/**
 * Tests for network_analysis MCP tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleNetworkAnalysis } from './networkAnalysis.js';
import * as epClientModule from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getMEPs: vi.fn(),
    getMEPDetails: vi.fn()
  }
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

    vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue({
      data: mockMEPs,
      total: mockMEPs.length,
      limit: 50,
      offset: 0,
      hasMore: false
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
    it('should return MCP-compliant response', async () => {
      const result = await handleNetworkAnalysis({});
      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
    });

    it('should return valid JSON', async () => {
      const result = await handleNetworkAnalysis({});
      expect(() => JSON.parse(result.content[0]?.text ?? '{}')).not.toThrow();
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
      vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue({
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
      vi.mocked(epClientModule.epClient.getMEPs).mockRejectedValue(new Error('API Error'));

      const result = await handleNetworkAnalysis({});
      expect(result.isError).toBe(true);
      const data = JSON.parse(result.content[0]?.text ?? '{}') as { error: string };
      expect(data.error).toContain('API Error');
    });

    it('should handle non-Error exceptions', async () => {
      vi.mocked(epClientModule.epClient.getMEPs).mockRejectedValue('string error');

      const result = await handleNetworkAnalysis({});
      expect(result.isError).toBe(true);
    });
  });
});
