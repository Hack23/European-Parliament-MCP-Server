/**
 * Integration Tests: Phase 6 Advanced OSINT Tools
 *
 * Covers behaviour of the four Phase 6 tools using vi.mock to intercept the
 * EP client — no real API calls are made. Tests validate:
 *   - network_analysis
 *   - sentiment_tracker
 *   - early_warning_system
 *   - comparative_intelligence
 *
 * ISMS Policy: SC-002 (Secure Testing), PE-001 (Performance Testing)
 * Compliance: ISO 27001 (AU-2), NIST CSF 2.0 (DE.CM-6), CIS Controls v8.1 (8.11)
 *
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validateMCPStructure } from '../helpers/responseValidator.js';
import { handleNetworkAnalysis } from '../../../src/tools/networkAnalysis.js';
import { handleSentimentTracker } from '../../../src/tools/sentimentTracker.js';
import { handleEarlyWarningSystem } from '../../../src/tools/earlyWarningSystem.js';
import { handleComparativeIntelligence } from '../../../src/tools/comparativeIntelligence.js';
import {
  osintPhase6MEPs,
  osintPhase6MEPDetails,
  osintPhase6PaginatedMEPs,
  osintPhase6VotingRecords
} from '../../fixtures/osintPhase6Fixtures.js';

// ── Mock the EP client ───────────────────────────────────────────────────────
// Keep the real EuropeanParliamentClient class so setup.ts can call `new EuropeanParliamentClient()`.
// Only replace the `epClient` singleton with per-test vi.fn() stubs.

vi.mock('../../../src/clients/europeanParliamentClient.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../src/clients/europeanParliamentClient.js')>();
  return {
    ...actual,
    epClient: {
      getMEPs: vi.fn(),
      getMEPDetails: vi.fn(),
      getVotingRecords: vi.fn()
    }
  };
});

// Import the mocked module so we can set return values
import * as epClientModule from '../../../src/clients/europeanParliamentClient.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Parse the JSON payload from an MCP tool result */
function parseToolResult(result: { content: { type: string; text: string }[] }): unknown {
  validateMCPStructure(result);
  return JSON.parse(result.content[0]?.text ?? '{}');
}

// ── Tests ────────────────────────────────────────────────────────────────────

// These tests use vi.mock and make no real HTTP calls, so they run unconditionally.
describe('Phase 6 OSINT Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations for all tools
    vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue(osintPhase6PaginatedMEPs);

    vi.mocked(epClientModule.epClient.getMEPDetails).mockImplementation((id: string) => {
      const detail = osintPhase6MEPDetails.find(m => m.id === id)
        ?? { ...osintPhase6MEPs[0], ...osintPhase6MEPDetails[0], id };
      return Promise.resolve(detail);
    });

    vi.mocked(epClientModule.epClient.getVotingRecords).mockResolvedValue(
      osintPhase6VotingRecords
    );
  });

  // ══════════════════════════════════════════════════════════════════════════
  // NETWORK ANALYSIS
  // ══════════════════════════════════════════════════════════════════════════

  describe('network_analysis', () => {
    it('should return valid MCP response structure', async () => {
      const result = await handleNetworkAnalysis({});
      validateMCPStructure(result);
      expect(result.content[0]?.type).toBe('text');
    }, 30000);

    it('should return network nodes and edges', async () => {
      const result = await handleNetworkAnalysis({ analysisType: 'committee', depth: 2 });
      const data = parseToolResult(result) as Record<string, unknown>;

      expect(data).toHaveProperty('networkNodes');
      expect(data).toHaveProperty('networkEdges');
      expect(Array.isArray(data.networkNodes)).toBe(true);
      expect(Array.isArray(data.networkEdges)).toBe(true);
    }, 30000);

    it('should return centralMEPs array', async () => {
      const result = await handleNetworkAnalysis({});
      const data = parseToolResult(result) as Record<string, unknown>;

      expect(data).toHaveProperty('centralMEPs');
      expect(Array.isArray(data.centralMEPs)).toBe(true);
    }, 30000);

    it('should include clusterCount and networkDensity', async () => {
      const result = await handleNetworkAnalysis({});
      const data = parseToolResult(result) as Record<string, unknown>;

      expect(data).toHaveProperty('clusterCount');
      expect(data).toHaveProperty('networkDensity');
      expect(typeof data.clusterCount).toBe('number');
      expect(typeof data.networkDensity).toBe('number');
    }, 30000);

    it('should reflect analysisType parameter', async () => {
      const result = await handleNetworkAnalysis({ analysisType: 'voting' });
      const data = parseToolResult(result) as { analysisType: string };
      expect(data.analysisType).toBe('voting');
    }, 30000);

    it('should support ego-network for a specific MEP id', async () => {
      const result = await handleNetworkAnalysis({ mepId: 101 });
      const data = parseToolResult(result) as Record<string, unknown>;

      expect(data).toHaveProperty('networkNodes');
      expect(Array.isArray(data.networkNodes)).toBe(true);
    }, 30000);

    it('should include computedAttributes', async () => {
      const result = await handleNetworkAnalysis({ depth: 3 });
      const data = parseToolResult(result) as Record<string, unknown>;

      expect(data).toHaveProperty('computedAttributes');
      const attrs = data.computedAttributes as Record<string, unknown>;
      expect(attrs).toHaveProperty('totalNodes');
      expect(attrs).toHaveProperty('totalEdges');
      expect(attrs).toHaveProperty('avgDegree');
    }, 30000);

    it('should return empty result gracefully when EP client returns no MEPs', async () => {
      vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue({
        data: [],
        total: 0,
        limit: 50,
        offset: 0,
        hasMore: false
      });

      const result = await handleNetworkAnalysis({});
      const data = parseToolResult(result) as { dataAvailable: boolean };
      expect(data.dataAvailable).toBe(false);
    }, 30000);

    it('should handle EP client errors gracefully', async () => {
      vi.mocked(epClientModule.epClient.getMEPs).mockRejectedValue(
        new Error('Simulated EP API error')
      );

      const result = await handleNetworkAnalysis({});
      validateMCPStructure(result);
      // Should return an error response, not throw
    }, 30000);

    it('should reject invalid analysisType', async () => {
      await expect(
        handleNetworkAnalysis({ analysisType: 'INVALID' as unknown as 'committee' })
      ).rejects.toThrow();
    }, 10000);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SENTIMENT TRACKER
  // ══════════════════════════════════════════════════════════════════════════

  describe('sentiment_tracker', () => {
    it('should return valid MCP response structure', async () => {
      const result = await handleSentimentTracker({});
      validateMCPStructure(result);
      expect(result.content[0]?.type).toBe('text');
    }, 30000);

    it('should return groupSentiments array', async () => {
      const result = await handleSentimentTracker({});
      const data = parseToolResult(result) as Record<string, unknown>;

      expect(data).toHaveProperty('groupSentiments');
      expect(Array.isArray(data.groupSentiments)).toBe(true);
    }, 30000);

    it('should include polarizationIndex', async () => {
      const result = await handleSentimentTracker({});
      const data = parseToolResult(result) as Record<string, unknown>;

      expect(data).toHaveProperty('polarizationIndex');
      expect(typeof data.polarizationIndex).toBe('number');
    }, 30000);

    it('should include computedAttributes', async () => {
      const result = await handleSentimentTracker({});
      const data = parseToolResult(result) as Record<string, unknown>;

      expect(data).toHaveProperty('computedAttributes');
    }, 30000);

    it('should accept timeframe parameter', async () => {
      const result = await handleSentimentTracker({ timeframe: 'last_month' });
      const data = parseToolResult(result) as { timeframe: string };
      expect(data.timeframe).toBe('last_month');
    }, 30000);

    it('should filter by groupId when provided', async () => {
      const result = await handleSentimentTracker({ groupId: 'EPP' });
      const data = parseToolResult(result) as Record<string, unknown>;

      expect(data).toHaveProperty('groupSentiments');
    }, 30000);

    it('should return empty result gracefully when EP client returns no MEPs', async () => {
      vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue({
        data: [],
        total: 0,
        limit: 50,
        offset: 0,
        hasMore: false
      });

      const result = await handleSentimentTracker({});
      const data = parseToolResult(result) as { dataAvailable: boolean };
      expect(data.dataAvailable).toBe(false);
    }, 30000);

    it('should handle EP client errors gracefully', async () => {
      vi.mocked(epClientModule.epClient.getMEPs).mockRejectedValue(
        new Error('Simulated EP API error')
      );

      const result = await handleSentimentTracker({});
      validateMCPStructure(result);
    }, 30000);

    it('should reject invalid timeframe value', async () => {
      await expect(
        handleSentimentTracker({ timeframe: 'INVALID' as unknown as 'last_month' })
      ).rejects.toThrow();
    }, 10000);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // EARLY WARNING SYSTEM
  // ══════════════════════════════════════════════════════════════════════════

  describe('early_warning_system', () => {
    it('should return valid MCP response structure', async () => {
      const result = await handleEarlyWarningSystem({});
      validateMCPStructure(result);
      expect(result.content[0]?.type).toBe('text');
    }, 30000);

    it('should return warnings array', async () => {
      const result = await handleEarlyWarningSystem({});
      const data = parseToolResult(result) as Record<string, unknown>;

      expect(data).toHaveProperty('warnings');
      expect(Array.isArray(data.warnings)).toBe(true);
    }, 30000);

    it('should include trendIndicators', async () => {
      const result = await handleEarlyWarningSystem({});
      const data = parseToolResult(result) as Record<string, unknown>;

      expect(data).toHaveProperty('trendIndicators');
    }, 30000);

    it('should accept sensitivity parameter', async () => {
      const result = await handleEarlyWarningSystem({ sensitivity: 'high' });
      const data = parseToolResult(result) as Record<string, unknown>;

      expect(data).toHaveProperty('warnings');
    }, 30000);

    it('should accept focusArea coalitions', async () => {
      const result = await handleEarlyWarningSystem({ focusArea: 'coalitions' });
      const data = parseToolResult(result) as Record<string, unknown>;

      expect(data).toHaveProperty('warnings');
    }, 30000);

    it('should accept focusArea attendance', async () => {
      const result = await handleEarlyWarningSystem({ focusArea: 'attendance' });
      const data = parseToolResult(result) as Record<string, unknown>;

      expect(data).toHaveProperty('warnings');
    }, 30000);

    it('should include assessmentTime in response', async () => {
      const result = await handleEarlyWarningSystem({});
      const data = parseToolResult(result) as Record<string, unknown>;

      expect(data).toHaveProperty('assessmentTime');
      expect(typeof data.assessmentTime).toBe('string');
    }, 30000);

    it('should return empty result gracefully when EP client returns no MEPs', async () => {
      vi.mocked(epClientModule.epClient.getMEPs).mockResolvedValue({
        data: [],
        total: 0,
        limit: 50,
        offset: 0,
        hasMore: false
      });

      const result = await handleEarlyWarningSystem({});
      const data = parseToolResult(result) as { dataAvailable: boolean };
      expect(data.dataAvailable).toBe(false);
    }, 30000);

    it('should handle EP client errors gracefully', async () => {
      vi.mocked(epClientModule.epClient.getMEPs).mockRejectedValue(
        new Error('Simulated EP API error')
      );

      const result = await handleEarlyWarningSystem({});
      validateMCPStructure(result);
    }, 30000);

    it('should reject invalid sensitivity level', async () => {
      await expect(
        handleEarlyWarningSystem({ sensitivity: 'CRITICAL' as unknown as 'high' })
      ).rejects.toThrow();
    }, 10000);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // COMPARATIVE INTELLIGENCE
  // ══════════════════════════════════════════════════════════════════════════

  describe('comparative_intelligence', () => {
    it('should return valid MCP response structure', async () => {
      const result = await handleComparativeIntelligence({ mepIds: [101, 102] });
      validateMCPStructure(result);
      expect(result.content[0]?.type).toBe('text');
    }, 30000);

    it('should return profiles array', async () => {
      const result = await handleComparativeIntelligence({ mepIds: [101, 102] });
      const data = parseToolResult(result) as Record<string, unknown>;

      expect(data).toHaveProperty('profiles');
      expect(Array.isArray(data.profiles)).toBe(true);
    }, 30000);

    it('should return correlationMatrix', async () => {
      const result = await handleComparativeIntelligence({ mepIds: [101, 102] });
      const data = parseToolResult(result) as Record<string, unknown>;

      expect(data).toHaveProperty('correlationMatrix');
    }, 30000);

    it('should return mepCount matching input length', async () => {
      const result = await handleComparativeIntelligence({ mepIds: [101, 102, 103] });
      const data = parseToolResult(result) as { mepCount: number };

      expect(data.mepCount).toBe(3);
    }, 30000);

    it('should return rankingByDimension', async () => {
      const result = await handleComparativeIntelligence({ mepIds: [101, 102] });
      const data = parseToolResult(result) as Record<string, unknown>;

      expect(data).toHaveProperty('rankingByDimension');
      expect(Array.isArray(data.rankingByDimension)).toBe(true);
    }, 30000);

    it('should accept custom dimensions', async () => {
      const result = await handleComparativeIntelligence({
        mepIds: [101, 102],
        dimensions: ['voting', 'attendance']
      });
      const data = parseToolResult(result) as { dimensions: string[] };

      expect(data.dimensions).toContain('voting');
      expect(data.dimensions).toContain('attendance');
    }, 30000);

    it('should compare up to 7 MEPs', async () => {
      const result = await handleComparativeIntelligence({
        mepIds: [101, 102, 103, 104, 105, 106, 107]
      });
      const data = parseToolResult(result) as { mepCount: number };
      expect(data.mepCount).toBe(7);
    }, 30000);

    it('should include outlierMEPs array', async () => {
      const result = await handleComparativeIntelligence({ mepIds: [101, 102, 103] });
      const data = parseToolResult(result) as Record<string, unknown>;

      expect(data).toHaveProperty('outlierMEPs');
    }, 30000);

    it('should handle getMEPDetails returning fallback when ID not found', async () => {
      const base = osintPhase6MEPDetails[0];
      if (!base) throw new Error('Missing MEPDetails fixture at index 0');
      const fallback = { ...base, id: '999' };
      vi.mocked(epClientModule.epClient.getMEPDetails).mockResolvedValue(fallback);

      const result = await handleComparativeIntelligence({ mepIds: [999, 998] });
      validateMCPStructure(result);
    }, 30000);

    it('should reject fewer than 2 mepIds', async () => {
      await expect(
        handleComparativeIntelligence({ mepIds: [101] })
      ).rejects.toThrow();
    }, 10000);

    it('should reject more than 10 mepIds', async () => {
      const ids = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111];
      await expect(
        handleComparativeIntelligence({ mepIds: ids })
      ).rejects.toThrow();
    }, 10000);

    it('should reject missing mepIds', async () => {
      await expect(
        handleComparativeIntelligence({})
      ).rejects.toThrow();
    }, 10000);

    it('should handle EP client errors gracefully', async () => {
      vi.mocked(epClientModule.epClient.getMEPDetails).mockRejectedValue(
        new Error('Simulated EP API error for getMEPDetails')
      );

      const result = await handleComparativeIntelligence({ mepIds: [101, 102] });
      validateMCPStructure(result);
    }, 30000);
  });
});
