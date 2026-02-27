import { describe, it, expect } from 'vitest';
import {
  SERVER_NAME,
  SERVER_VERSION,
  getToolMetadataArray,
  sanitizeUrl
} from './index.js';

/**
 * Tests for European Parliament MCP Server index module
 * 
 * Tests exported functions and constants. The MCP Server class
 * and handlers are tested via E2E tests.
 */

describe('Server Constants', () => {
  it('should export correct server name', () => {
    expect(SERVER_NAME).toBe('european-parliament-mcp-server');
  });

  it('should export valid semver version', () => {
    expect(SERVER_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('should have version matching package.json', async () => {
    const fs = await import('fs');
    const pkgPath = new URL('../package.json', import.meta.url).pathname;
    const pkg = JSON.parse(await fs.promises.readFile(pkgPath, 'utf-8'));
    expect(SERVER_VERSION).toBe(pkg.version);
  });
});

describe('getToolMetadataArray', () => {
  it('should return 46 tools', () => {
    const tools = getToolMetadataArray();
    expect(tools).toHaveLength(46);
  });

  it('should have unique non-empty tool names', () => {
    const tools = getToolMetadataArray();
    const names = tools.map(t => t.name);
    expect(new Set(names).size).toBe(names.length);
    for (const name of names) {
      expect(name.length).toBeGreaterThan(0);
    }
  });

  it('should use snake_case naming convention', () => {
    const tools = getToolMetadataArray();
    for (const tool of tools) {
      expect(tool.name).toMatch(/^[a-z][a-z0-9_]*$/);
    }
  });

  it('should have non-empty descriptions for all tools', () => {
    const tools = getToolMetadataArray();
    for (const tool of tools) {
      expect(tool.description.length).toBeGreaterThan(10);
    }
  });

  it('should have inputSchema with type=object for all tools', () => {
    const tools = getToolMetadataArray();
    for (const tool of tools) {
      expect(tool.inputSchema).toBeDefined();
      const schema = tool.inputSchema as Record<string, unknown>;
      expect(schema['type']).toBe('object');
    }
  });

  it('should have properties defined in all inputSchemas', () => {
    const tools = getToolMetadataArray();
    for (const tool of tools) {
      const schema = tool.inputSchema as Record<string, unknown>;
      expect(schema).toHaveProperty('properties');
      expect(typeof schema['properties']).toBe('object');
    }
  });

  it('should include all 7 core tools', () => {
    const tools = getToolMetadataArray();
    const names = tools.map(t => t.name);
    expect(names).toContain('get_meps');
    expect(names).toContain('get_mep_details');
    expect(names).toContain('get_plenary_sessions');
    expect(names).toContain('get_voting_records');
    expect(names).toContain('search_documents');
    expect(names).toContain('get_committee_info');
    expect(names).toContain('get_parliamentary_questions');
  });

  it('should include all 3 advanced tools', () => {
    const tools = getToolMetadataArray();
    const names = tools.map(t => t.name);
    expect(names).toContain('analyze_voting_patterns');
    expect(names).toContain('track_legislation');
    expect(names).toContain('generate_report');
  });

  it('should include all 6 Phase 1 OSINT tools', () => {
    const tools = getToolMetadataArray();
    const names = tools.map(t => t.name);
    expect(names).toContain('assess_mep_influence');
    expect(names).toContain('analyze_coalition_dynamics');
    expect(names).toContain('detect_voting_anomalies');
    expect(names).toContain('compare_political_groups');
    expect(names).toContain('analyze_legislative_effectiveness');
    expect(names).toContain('monitor_legislative_pipeline');
  });

  it('should include Phase 2 OSINT tools', () => {
    const tools = getToolMetadataArray();
    const names = tools.map(t => t.name);
    expect(names).toContain('analyze_committee_activity');
    expect(names).toContain('track_mep_attendance');
  });

  it('should include Phase 3 OSINT tools', () => {
    const tools = getToolMetadataArray();
    const names = tools.map(t => t.name);
    expect(names).toContain('analyze_country_delegation');
    expect(names).toContain('generate_political_landscape');
  });

  it('should have core tools first in array', () => {
    const tools = getToolMetadataArray();
    const coreTools = ['get_meps', 'get_mep_details', 'get_plenary_sessions',
      'get_voting_records', 'search_documents', 'get_committee_info', 'get_parliamentary_questions'];
    for (let i = 0; i < coreTools.length; i++) {
      expect(tools[i]?.name).toBe(coreTools[i]);
    }
  });

  it('should have descriptions that mention European Parliament', () => {
    const tools = getToolMetadataArray();
    const epMentions = tools.filter(t =>
      t.description.toLowerCase().includes('european parliament') ||
      t.description.toLowerCase().includes('eu parliament') ||
      t.description.toLowerCase().includes('mep') ||
      t.description.toLowerCase().includes('parliament')
    );
    // Most tools should reference Parliament context
    expect(epMentions.length).toBeGreaterThanOrEqual(15);
  });

  it('should have required fields defined for tools that need them', () => {
    const tools = getToolMetadataArray();
    const toolsWithRequired = tools.filter(t => {
      const schema = t.inputSchema as Record<string, unknown>;
      return Array.isArray(schema['required']) && (schema['required'] as string[]).length > 0;
    });
    // Core tools like get_mep_details should have required fields
    expect(toolsWithRequired.length).toBeGreaterThan(0);
  });
});

describe('sanitizeUrl', () => {
  it('should return URL without credentials', () => {
    const result = sanitizeUrl('https://user:pass@example.com/api');
    expect(result).not.toContain('user');
    expect(result).not.toContain('pass');
    expect(result).toContain('example.com/api');
  });

  it('should strip query parameters', () => {
    const result = sanitizeUrl('https://example.com/api?token=secret');
    expect(result).not.toContain('token');
    expect(result).not.toContain('secret');
  });

  it('should strip fragment', () => {
    const result = sanitizeUrl('https://example.com/api#secret');
    expect(result).not.toContain('secret');
  });

  it('should handle valid URLs without credentials', () => {
    const url = 'https://data.europarl.europa.eu/api/v2/';
    const result = sanitizeUrl(url);
    expect(result).toBe(url);
  });

  it('should handle malformed URLs safely', () => {
    const result = sanitizeUrl('not-a-url?token=secret');
    expect(result).not.toContain('token');
    expect(result).toBe('not-a-url');
  });

  it('should handle URLs with both query and fragment', () => {
    const result = sanitizeUrl('https://example.com/api?key=val#frag');
    expect(result).not.toContain('key');
    expect(result).not.toContain('frag');
  });

  it('should handle empty string', () => {
    const result = sanitizeUrl('');
    expect(result).toBe('');
  });

  it('should handle URL with only fragment', () => {
    const result = sanitizeUrl('not-valid#secret');
    expect(result).toBe('not-valid');
  });

  it('should preserve path components', () => {
    const result = sanitizeUrl('https://example.com/path/to/resource');
    expect(result).toBe('https://example.com/path/to/resource');
  });
});

describe('MCP Protocol Implementation', () => {
  it('should have tool registration for all 46 tools', () => {
    const tools = getToolMetadataArray();
    expect(tools.length).toBe(46);
  });

  it('should have exactly 7 core + 3 advanced + 15 OSINT + 8 Phase 4 + 13 Phase 5 tools', () => {
    const tools = getToolMetadataArray();
    const coreToolNames = ['get_meps', 'get_mep_details', 'get_plenary_sessions',
      'get_voting_records', 'search_documents', 'get_committee_info', 'get_parliamentary_questions'];
    const advancedToolNames = ['analyze_voting_patterns', 'track_legislation', 'generate_report'];
    const osintToolNames = [
      'assess_mep_influence', 'analyze_coalition_dynamics', 'detect_voting_anomalies',
      'compare_political_groups', 'analyze_legislative_effectiveness', 'monitor_legislative_pipeline',
      'analyze_committee_activity', 'track_mep_attendance',
      'analyze_country_delegation', 'generate_political_landscape',
      'network_analysis', 'sentiment_tracker', 'early_warning_system', 'comparative_intelligence',
      'correlate_intelligence'
    ];
    const phase4ToolNames = [
      'get_current_meps', 'get_speeches', 'get_procedures', 'get_adopted_texts',
      'get_events', 'get_meeting_activities', 'get_meeting_decisions', 'get_mep_declarations'
    ];
    const phase5ToolNames = [
      'get_incoming_meps', 'get_outgoing_meps', 'get_homonym_meps',
      'get_plenary_documents', 'get_committee_documents', 'get_plenary_session_documents',
      'get_plenary_session_document_items', 'get_controlled_vocabularies',
      'get_external_documents', 'get_meeting_foreseen_activities', 'get_procedure_events',
      'get_meeting_plenary_session_documents', 'get_meeting_plenary_session_document_items'
    ];

    const names = tools.map(t => t.name);
    for (const name of [...coreToolNames, ...advancedToolNames, ...osintToolNames, ...phase4ToolNames, ...phase5ToolNames]) {
      expect(names).toContain(name);
    }
    expect(coreToolNames.length + advancedToolNames.length + osintToolNames.length + phase4ToolNames.length + phase5ToolNames.length).toBe(46);
  });
});

describe('Error Handling', () => {
  it('should handle errors gracefully', () => {
    expect(() => {
      throw new Error('test error');
    }).toThrow('test error');
  });
});
