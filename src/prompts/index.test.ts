/**
 * Tests for MCP Prompts
 */
import { describe, it, expect } from 'vitest';
import { getPromptMetadataArray, handleGetPrompt } from './index.js';

describe('MCP Prompts', () => {
  describe('getPromptMetadataArray', () => {
    it('should return all prompt definitions', () => {
      const prompts = getPromptMetadataArray();

      expect(prompts).toBeDefined();
      expect(Array.isArray(prompts)).toBe(true);
      expect(prompts.length).toBe(7);
    });

    it('should have required metadata fields', () => {
      const prompts = getPromptMetadataArray();

      for (const prompt of prompts) {
        expect(prompt).toHaveProperty('name');
        expect(prompt).toHaveProperty('description');
        expect(typeof prompt.name).toBe('string');
        expect(typeof prompt.description).toBe('string');
        expect(prompt.name.length).toBeGreaterThan(0);
        expect(prompt.description.length).toBeGreaterThan(0);
      }
    });

    it('should include expected prompt names', () => {
      const prompts = getPromptMetadataArray();
      const names = prompts.map(p => p.name);

      expect(names).toContain('mep_briefing');
      expect(names).toContain('coalition_analysis');
      expect(names).toContain('legislative_tracking');
      expect(names).toContain('political_group_comparison');
      expect(names).toContain('committee_activity_report');
      expect(names).toContain('voting_pattern_analysis');
      expect(names).toContain('country_delegation_analysis');
    });

    it('should have arguments array where defined', () => {
      const prompts = getPromptMetadataArray();

      for (const prompt of prompts) {
        if (prompt.arguments !== undefined) {
          expect(Array.isArray(prompt.arguments)).toBe(true);
          for (const arg of prompt.arguments) {
            expect(arg).toHaveProperty('name');
            expect(arg).toHaveProperty('description');
            expect(arg).toHaveProperty('required');
          }
        }
      }
    });
  });

  describe('handleGetPrompt', () => {
    describe('mep_briefing', () => {
      it('should generate MEP briefing prompt with mepId', () => {
        const result = handleGetPrompt('mep_briefing', { mepId: '124936' });

        expect(result).toHaveProperty('description');
        expect(result).toHaveProperty('messages');
        expect(result.description).toContain('124936');
        expect(result.messages.length).toBeGreaterThan(0);
        expect(result.messages[0]?.role).toBe('user');
        expect(result.messages[0]?.content.type).toBe('text');
        expect(result.messages[0]?.content.text).toContain('get_mep_details');
      });

      it('should include period when provided', () => {
        const result = handleGetPrompt('mep_briefing', {
          mepId: '124936',
          period: '2024'
        });

        expect(result.messages[0]?.content.text).toContain('2024');
      });

      it('should use default period when not provided', () => {
        const result = handleGetPrompt('mep_briefing', { mepId: '124936' });

        expect(result.messages[0]?.content.text).toContain('current term');
      });
    });

    describe('coalition_analysis', () => {
      it('should generate coalition analysis prompt', () => {
        const result = handleGetPrompt('coalition_analysis', {
          policyArea: 'environment'
        });

        expect(result.description).toContain('environment');
        expect(result.messages[0]?.content.text).toContain('analyze_coalition_dynamics');
      });

      it('should use defaults for missing args', () => {
        const result = handleGetPrompt('coalition_analysis');

        expect(result.description).toContain('all policy areas');
      });
    });

    describe('legislative_tracking', () => {
      it('should generate tracking prompt with procedureId', () => {
        const result = handleGetPrompt('legislative_tracking', {
          procedureId: 'COD-2024-0001'
        });

        expect(result.description).toContain('COD-2024-0001');
        expect(result.messages[0]?.content.text).toContain('track_legislation');
      });

      it('should generate tracking prompt with committee', () => {
        const result = handleGetPrompt('legislative_tracking', {
          committee: 'ENVI'
        });

        expect(result.description).toContain('ENVI');
      });

      it('should use default focus when no args', () => {
        const result = handleGetPrompt('legislative_tracking');

        expect(result.description).toContain('active legislative pipeline');
      });
    });

    describe('political_group_comparison', () => {
      it('should generate group comparison prompt', () => {
        const result = handleGetPrompt('political_group_comparison', {
          groups: 'EPP,S&D'
        });

        expect(result.description).toContain('EPP,S&D');
        expect(result.messages[0]?.content.text).toContain('compare_political_groups');
      });
    });

    describe('committee_activity_report', () => {
      it('should generate committee activity prompt', () => {
        const result = handleGetPrompt('committee_activity_report', {
          committeeId: 'ITRE'
        });

        expect(result.description).toContain('ITRE');
        expect(result.messages[0]?.content.text).toContain('get_committee_info');
      });
    });

    describe('voting_pattern_analysis', () => {
      it('should generate voting analysis prompt with topic', () => {
        const result = handleGetPrompt('voting_pattern_analysis', {
          topic: 'climate'
        });

        expect(result.description).toContain('climate');
        expect(result.messages[0]?.content.text).toContain('get_voting_records');
      });

      it('should include MEP influence tool when mepId provided', () => {
        const result = handleGetPrompt('voting_pattern_analysis', {
          mepId: '124936'
        });

        expect(result.messages[0]?.content.text).toContain('assess_mep_influence');
      });
    });

    describe('error handling', () => {
      it('should throw for unknown prompt', () => {
        expect(() => handleGetPrompt('unknown_prompt')).toThrow('Unknown prompt');
      });

      it('should validate argument values', () => {
        expect(() => handleGetPrompt('mep_briefing', {
          mepId: '' // Too short
        })).toThrow();
      });

      it('should throw when required mepId is missing for mep_briefing', () => {
        expect(() => handleGetPrompt('mep_briefing', {})).toThrow('Missing required argument');
      });

      it('should throw when required committeeId is missing for committee_activity_report', () => {
        expect(() => handleGetPrompt('committee_activity_report', {})).toThrow('Missing required argument');
      });

      it('should throw when required country is missing for country_delegation_analysis', () => {
        expect(() => handleGetPrompt('country_delegation_analysis', {})).toThrow('Missing required argument');
      });
    });

    describe('country_delegation_analysis', () => {
      it('should generate country delegation prompt with country arg', () => {
        const result = handleGetPrompt('country_delegation_analysis', { country: 'Sweden' });

        expect(result.description).toContain('Sweden');
        expect(result.messages[0]?.content.type).toBe('text');
        expect(result.messages[0]?.content.text).toContain('get_meps');
        expect(result.messages[0]?.content.text).toContain('analyze_country_delegation');
      });

      it('should include period when provided', () => {
        const result = handleGetPrompt('country_delegation_analysis', { country: 'SE', period: '2024' });

        expect(result.description).toContain('2024');
        expect(result.messages[0]?.content.text).toContain('2024');
      });

      it('should use default period when not provided', () => {
        const result = handleGetPrompt('country_delegation_analysis', { country: 'DE' });

        expect(result.messages[0]?.content.text).toContain('current term');
      });
    });
  });
});
