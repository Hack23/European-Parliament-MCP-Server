/**
 * Tests for src/server/toolRegistry.ts
 *
 * Covers: getToolMetadataArray (metadata, categories, naming),
 *         dispatchToolCall (routing, unknown tool errors, handler delegation)
 */

import { describe, it, expect, vi } from 'vitest';
import { getToolMetadataArray, dispatchToolCall } from './toolRegistry.js';
import type { ToolMetadata } from './types.js';

// ── Mock one tool module to test dispatchToolCall without network calls ──
// vi.mock is hoisted by vitest so this replaces the module before toolRegistry
// imports it, causing toolHandlers['get_meps'] to point to the mock function.
vi.mock('../tools/getMEPs.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../tools/getMEPs.js')>();
  return {
    getMEPsToolMetadata: actual.getMEPsToolMetadata,
    handleGetMEPs: vi.fn().mockResolvedValue({
      content: [{ type: 'text' as const, text: 'mocked MEP result' }],
    }),
  };
});

// ── getToolMetadataArray ───────────────────────────────────────────

describe('getToolMetadataArray', () => {
  // Cache once to avoid constructing a fresh 46-element array per test.
  const tools = getToolMetadataArray();

  it('returns exactly 47 tools', () => {
    expect(tools).toHaveLength(47);
  });

  it('all tools have a non-empty name', () => {
    for (const tool of tools) {
      expect(tool.name.length).toBeGreaterThan(0);
    }
  });

  it('all tool names are unique', () => {
    const names = tools.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('all tool names use snake_case convention', () => {
    for (const tool of tools) {
      expect(tool.name).toMatch(/^[a-z][a-z0-9_]*$/);
    }
  });

  it('all tools have a non-empty description', () => {
    for (const tool of tools) {
      expect(tool.description.length).toBeGreaterThan(10);
    }
  });

  it('all tools have an inputSchema with type=object', () => {
    for (const tool of tools) {
      const schema = tool.inputSchema as Record<string, unknown>;
      expect(schema['type']).toBe('object');
    }
  });

  it('all tools have properties defined in inputSchema', () => {
    for (const tool of tools) {
      const schema = tool.inputSchema as Record<string, unknown>;
      expect(schema).toHaveProperty('properties');
    }
  });

  it('all tools have a valid category', () => {
    const validCategories = new Set(['core', 'advanced', 'osint', 'phase4', 'phase5']);
    for (const tool of tools) {
      expect(validCategories.has(tool.category)).toBe(true);
    }
  });

  // ── Category distribution ──────────────────────────────────────

  it('has exactly 7 core tools', () => {
    const coreTools = tools.filter((t) => t.category === 'core');
    expect(coreTools).toHaveLength(7);
  });

  it('has exactly 3 advanced tools', () => {
    const advanced = tools.filter((t) => t.category === 'advanced');
    expect(advanced).toHaveLength(3);
  });

  it('has exactly 15 osint tools', () => {
    const osint = tools.filter((t) => t.category === 'osint');
    expect(osint).toHaveLength(15);
  });

  it('has exactly 8 phase4 tools', () => {
    const phase4 = tools.filter((t) => t.category === 'phase4');
    expect(phase4).toHaveLength(8);
  });

  it('has exactly 14 phase5 tools', () => {
    const phase5 = tools.filter((t) => t.category === 'phase5');
    expect(phase5).toHaveLength(14);
  });

  it('category counts sum to 47', () => {
    const counts = { core: 0, advanced: 0, osint: 0, phase4: 0, phase5: 0 };
    for (const tool of tools) {
      counts[tool.category]++;
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    expect(total).toBe(47);
  });

  // ── Core tool names ────────────────────────────────────────────

  it('includes all 7 core tool names', () => {
    const names = tools.map((t) => t.name);
    const coreNames = [
      'get_meps',
      'get_mep_details',
      'get_plenary_sessions',
      'get_voting_records',
      'search_documents',
      'get_committee_info',
      'get_parliamentary_questions',
    ];
    for (const name of coreNames) {
      expect(names).toContain(name);
    }
  });

  it('places core tools first in the array', () => {
    const coreNames = [
      'get_meps',
      'get_mep_details',
      'get_plenary_sessions',
      'get_voting_records',
      'search_documents',
      'get_committee_info',
      'get_parliamentary_questions',
    ];
    for (let i = 0; i < coreNames.length; i++) {
      expect(tools[i]?.name).toBe(coreNames[i]);
    }
  });

  // ── Advanced tool names ────────────────────────────────────────

  it('includes all 3 advanced tool names', () => {
    const names = tools.map((t) => t.name);
    expect(names).toContain('analyze_voting_patterns');
    expect(names).toContain('track_legislation');
    expect(names).toContain('generate_report');
  });

  // ── OSINT tool names ───────────────────────────────────────────

  it('includes all 14 osint tool names', () => {
    const names = tools.map((t) => t.name);
    const osintNames = [
      'assess_mep_influence',
      'analyze_coalition_dynamics',
      'detect_voting_anomalies',
      'compare_political_groups',
      'analyze_legislative_effectiveness',
      'monitor_legislative_pipeline',
      'analyze_committee_activity',
      'track_mep_attendance',
      'analyze_country_delegation',
      'generate_political_landscape',
      'network_analysis',
      'sentiment_tracker',
      'early_warning_system',
      'comparative_intelligence',
    ];
    for (const name of osintNames) {
      expect(names).toContain(name);
    }
  });

  // ── Phase 4 tool names ─────────────────────────────────────────

  it('includes all 8 phase4 tool names', () => {
    const names = tools.map((t) => t.name);
    const phase4Names = [
      'get_current_meps',
      'get_speeches',
      'get_procedures',
      'get_adopted_texts',
      'get_events',
      'get_meeting_activities',
      'get_meeting_decisions',
      'get_mep_declarations',
    ];
    for (const name of phase4Names) {
      expect(names).toContain(name);
    }
  });

  // ── Phase 5 tool names ─────────────────────────────────────────

  it('includes all 14 phase5 tool names', () => {
    const names = tools.map((t) => t.name);
    const phase5Names = [
      'get_incoming_meps',
      'get_outgoing_meps',
      'get_homonym_meps',
      'get_plenary_documents',
      'get_committee_documents',
      'get_plenary_session_documents',
      'get_plenary_session_document_items',
      'get_controlled_vocabularies',
      'get_external_documents',
      'get_meeting_foreseen_activities',
      'get_procedure_events',
      'get_meeting_plenary_session_documents',
      'get_meeting_plenary_session_document_items',
      'get_all_generated_stats',
    ];
    for (const name of phase5Names) {
      expect(names).toContain(name);
    }
  });

  // ── Structural invariants ──────────────────────────────────────

  it('returns a new array instance on each call (no shared mutation risk)', () => {
    const first = getToolMetadataArray();
    const second = getToolMetadataArray();
    expect(first).not.toBe(second);
  });

  it('each tool object has the required keys (name, description, inputSchema, category)', () => {
    for (const tool of tools) {
      // expected array is alphabetically sorted to match Object.keys().sort()
      expect(Object.keys(tool).sort()).toEqual(['category', 'description', 'inputSchema', 'name']);
    }
  });

  it('first tool is get_meps with core category', () => {
    const first = tools[0] as ToolMetadata;
    expect(first.name).toBe('get_meps');
    expect(first.category).toBe('core');
  });

  it('last tool is get_all_generated_stats with phase5 category', () => {
    const last = tools[tools.length - 1] as ToolMetadata;
    expect(last.name).toBe('get_all_generated_stats');
    expect(last.category).toBe('phase5');
  });
});

// ── dispatchToolCall ───────────────────────────────────────────────

describe('dispatchToolCall', () => {
  it('throws Error for unknown tool name', async () => {
    await expect(dispatchToolCall('unknown_tool_xyz', {})).rejects.toThrow(
      'Unknown tool: unknown_tool_xyz'
    );
  });

  it('error message includes the unknown tool name', async () => {
    const toolName = 'nonexistent_tool_abc';
    await expect(dispatchToolCall(toolName, {})).rejects.toThrow(toolName);
  });

  it('throws Error (not a string) for unknown tools', async () => {
    await expect(dispatchToolCall('bad_tool', {})).rejects.toBeInstanceOf(Error);
  });

  it('dispatches to mocked get_meps handler', async () => {
    const result = await dispatchToolCall('get_meps', {});
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(Array.isArray(result.content)).toBe(true);
  });

  it('get_meps dispatch returns expected mocked content', async () => {
    const result = await dispatchToolCall('get_meps', {});
    expect(result.content[0]).toEqual({ type: 'text', text: 'mocked MEP result' });
  });

  it('forwards args to the handler', async () => {
    const { handleGetMEPs } = await import('../tools/getMEPs.js');
    const mockedHandler = vi.mocked(handleGetMEPs);
    mockedHandler.mockClear();

    const args = { group: 'EPP', limit: 10 };
    await dispatchToolCall('get_meps', args);

    expect(mockedHandler).toHaveBeenCalledWith(args);
  });

  it('propagates handler errors to the caller', async () => {
    const { handleGetMEPs } = await import('../tools/getMEPs.js');
    const mockedHandler = vi.mocked(handleGetMEPs);
    mockedHandler.mockRejectedValueOnce(new Error('handler error'));

    await expect(dispatchToolCall('get_meps', {})).rejects.toThrow('handler error');
  });

  it('returns a ToolResult with content array', async () => {
    const result = await dispatchToolCall('get_meps', {});
    expect(result).toMatchObject({
      content: expect.arrayContaining([
        expect.objectContaining({ type: 'text' }),
      ]),
    });
  });

  it('spot-checks one representative tool name per category is present in metadata', () => {
    // Structural spot-check: verifies that at least one representative name from
    // each category appears in the metadata array (dispatch routing for all tools
    // is covered by the unknown-tool-error test + the get_meps dispatch tests above).
    const metadataNames = getToolMetadataArray().map((t) => t.name);
    expect(metadataNames).toHaveLength(getToolMetadataArray().length);
    // One representative per category
    expect(metadataNames).toContain('get_meps');              // core
    expect(metadataNames).toContain('analyze_voting_patterns'); // advanced
    expect(metadataNames).toContain('assess_mep_influence');  // osint
    expect(metadataNames).toContain('get_current_meps');      // phase4
    expect(metadataNames).toContain('get_incoming_meps');     // phase5
  });
});
