/**
 * E2E Tests for MCP Prompts and Resources
 *
 * Validates that the MCP server correctly exposes prompt templates
 * and resource templates per the MCP specification.
 *
 * ISMS Policy: SC-002 (Secure Testing)
 * Security: Tests validate MCP protocol compliance for prompts and resources
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MCPTestClient } from './mcpClient.js';

/**
 * E2E test timeout: 65 seconds
 */
const E2E_TEST_TIMEOUT_MS = 65000;

/** Expected prompt names based on src/prompts/index.ts */
const EXPECTED_PROMPTS = [
  'mep_briefing',
  'coalition_analysis',
  'legislative_tracking',
  'political_group_comparison',
  'committee_activity_report',
  'voting_pattern_analysis'
] as const;

/** Expected resource template URI patterns based on src/resources/index.ts */
const EXPECTED_RESOURCE_TEMPLATES = [
  'ep://meps/{mepId}',
  'ep://meps',
  'ep://committees/{committeeId}',
  'ep://plenary-sessions',
  'ep://votes/{sessionId}',
  'ep://political-groups'
] as const;

describe('Prompts and Resources E2E Tests', () => {
  let client: MCPTestClient;

  beforeAll(async () => {
    client = new MCPTestClient();
    await client.connect();
  }, 30000);

  afterAll(async () => {
    if (client) {
      await client.disconnect();
    }
  }, 10000);

  describe('MCP Prompt Templates', () => {
    it('should list available prompts', async () => {
      const prompts = await client.listPrompts();

      expect(Array.isArray(prompts)).toBe(true);
      expect(prompts.length).toBeGreaterThan(0);

      // Each prompt should have at least a name
      prompts.forEach(prompt => {
        expect(typeof prompt.name).toBe('string');
        expect(prompt.name.length).toBeGreaterThan(0);
      });
    }, E2E_TEST_TIMEOUT_MS);

    it('should expose all expected prompt names', async () => {
      const prompts = await client.listPrompts();
      const promptNames = prompts.map(p => p.name);

      EXPECTED_PROMPTS.forEach(expectedName => {
        expect(promptNames).toContain(expectedName);
      });
    }, E2E_TEST_TIMEOUT_MS);

    it('should have at least 6 prompt templates', async () => {
      const prompts = await client.listPrompts();
      expect(prompts.length).toBeGreaterThanOrEqual(6);
    }, E2E_TEST_TIMEOUT_MS);

    it('should include mep_briefing prompt', async () => {
      const prompts = await client.listPrompts();
      const mepBriefing = prompts.find(p => p.name === 'mep_briefing');

      expect(mepBriefing).toBeDefined();
      expect(mepBriefing?.name).toBe('mep_briefing');
    }, E2E_TEST_TIMEOUT_MS);

    it('should include coalition_analysis prompt', async () => {
      const prompts = await client.listPrompts();
      const coalitionAnalysis = prompts.find(p => p.name === 'coalition_analysis');

      expect(coalitionAnalysis).toBeDefined();
    }, E2E_TEST_TIMEOUT_MS);

    it('should include legislative_tracking prompt', async () => {
      const prompts = await client.listPrompts();
      const legislativeTracking = prompts.find(p => p.name === 'legislative_tracking');

      expect(legislativeTracking).toBeDefined();
    }, E2E_TEST_TIMEOUT_MS);

    it('should have descriptions for all prompts', async () => {
      const prompts = await client.listPrompts();

      prompts.forEach(prompt => {
        // Description should be a non-empty string if present
        if (prompt.description !== undefined) {
          expect(typeof prompt.description).toBe('string');
          expect(prompt.description.length).toBeGreaterThan(0);
        }
      });
    }, E2E_TEST_TIMEOUT_MS);
  });

  describe('MCP Resource Templates', () => {
    it('should list available resource templates', async () => {
      const templates = await client.listResourceTemplates();

      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);

      // Each template should have uriTemplate and name
      templates.forEach(template => {
        expect(typeof template.uriTemplate).toBe('string');
        expect(template.uriTemplate.length).toBeGreaterThan(0);
        expect(typeof template.name).toBe('string');
        expect(template.name.length).toBeGreaterThan(0);
      });
    }, E2E_TEST_TIMEOUT_MS);

    it('should expose all expected resource template URIs', async () => {
      const templates = await client.listResourceTemplates();
      const uriTemplates = templates.map(t => t.uriTemplate);

      EXPECTED_RESOURCE_TEMPLATES.forEach(expectedUri => {
        expect(uriTemplates).toContain(expectedUri);
      });
    }, E2E_TEST_TIMEOUT_MS);

    it('should have at least 6 resource templates', async () => {
      const templates = await client.listResourceTemplates();
      expect(templates.length).toBeGreaterThanOrEqual(6);
    }, E2E_TEST_TIMEOUT_MS);

    it('should include MEP detail resource template', async () => {
      const templates = await client.listResourceTemplates();
      const mepTemplate = templates.find(t =>
        t.uriTemplate.includes('meps') && t.uriTemplate.includes('{mepId}')
      );

      expect(mepTemplate).toBeDefined();
      expect(mepTemplate?.uriTemplate).toBe('ep://meps/{mepId}');
    }, E2E_TEST_TIMEOUT_MS);

    it('should include committee resource template', async () => {
      const templates = await client.listResourceTemplates();
      const committeeTemplate = templates.find(t =>
        t.uriTemplate.includes('committees')
      );

      expect(committeeTemplate).toBeDefined();
    }, E2E_TEST_TIMEOUT_MS);

    it('should include plenary sessions resource template', async () => {
      const templates = await client.listResourceTemplates();
      const plenaryTemplate = templates.find(t =>
        t.uriTemplate.includes('plenary-sessions')
      );

      expect(plenaryTemplate).toBeDefined();
    }, E2E_TEST_TIMEOUT_MS);

    it('should include voting records resource template', async () => {
      const templates = await client.listResourceTemplates();
      const votingTemplate = templates.find(t =>
        t.uriTemplate.includes('votes')
      );

      expect(votingTemplate).toBeDefined();
    }, E2E_TEST_TIMEOUT_MS);

    it('should have descriptions for resource templates', async () => {
      const templates = await client.listResourceTemplates();

      templates.forEach(template => {
        if (template.description !== undefined) {
          expect(typeof template.description).toBe('string');
          expect(template.description.length).toBeGreaterThan(0);
        }
      });
    }, E2E_TEST_TIMEOUT_MS);
  });

  describe('MCP Protocol Compliance', () => {
    it('should expose both tools and prompts', async () => {
      const [tools, prompts] = await Promise.all([
        client.listTools(),
        client.listPrompts()
      ]);

      expect(tools.length).toBeGreaterThanOrEqual(39);
      expect(prompts.length).toBeGreaterThanOrEqual(6);
    }, E2E_TEST_TIMEOUT_MS);

    it('should expose both tools and resource templates', async () => {
      const [tools, resourceTemplates] = await Promise.all([
        client.listTools(),
        client.listResourceTemplates()
      ]);

      expect(tools.length).toBeGreaterThanOrEqual(39);
      expect(resourceTemplates.length).toBeGreaterThanOrEqual(6);
    }, E2E_TEST_TIMEOUT_MS);

    it('should have unique prompt names', async () => {
      const prompts = await client.listPrompts();
      const names = prompts.map(p => p.name);
      const uniqueNames = new Set(names);

      expect(uniqueNames.size).toBe(names.length);
    }, E2E_TEST_TIMEOUT_MS);

    it('should have unique resource template URIs', async () => {
      const templates = await client.listResourceTemplates();
      const uris = templates.map(t => t.uriTemplate);
      const uniqueUris = new Set(uris);

      expect(uniqueUris.size).toBe(uris.length);
    }, E2E_TEST_TIMEOUT_MS);
  });
});
