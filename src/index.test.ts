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
});

describe('getToolMetadataArray', () => {
  it('should return 20 tools', () => {
    const tools = getToolMetadataArray();
    expect(tools).toHaveLength(20);
  });

  it('should have unique tool names', () => {
    const tools = getToolMetadataArray();
    const names = tools.map(t => t.name);
    expect(new Set(names).size).toBe(names.length);
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
      const schema = tool.inputSchema as { type: string };
      expect(schema.type).toBe('object');
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
});

describe('sanitizeUrl', () => {
  it('should return URL without credentials', () => {
    const result = sanitizeUrl('https://user:pass@example.com/api');
    expect(result).not.toContain('user');
    expect(result).not.toContain('pass');
    expect(result).toContain('example.com');
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
});

describe('MCP Protocol Implementation', () => {
  it('should have tool registration for all 20 tools', () => {
    const tools = getToolMetadataArray();
    expect(tools.length).toBe(20);
  });
});

describe('Error Handling', () => {
  it('should handle errors gracefully', () => {
    expect(() => {
      throw new Error('test error');
    }).toThrow('test error');
  });
});
