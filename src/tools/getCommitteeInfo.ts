/**
 * MCP Tool: get_committee_info
 * 
 * Retrieve European Parliament committee information
 * 
 * **Intelligence Perspective:** Maps committee power structures, membership networks,
 * and policy domain specialization for institutional analysis and influence mapping.
 * 
 * **Business Perspective:** Powers committee monitoring products for industry associations,
 * trade groups, and corporate government affairs tracking specific policy areas.
 * 
 * **Marketing Perspective:** Highlights structured access to EP's 20+ standing committees—
 * compelling for policy monitoring platforms and civic tech integrations.
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetCommitteeInfoSchema, CommitteeSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';

/**
 * Get committee info tool handler
 * 
 * @param args - Tool arguments
 * @returns MCP tool result with committee data
 * 
 * @example
 * ```json
 * {
 *   "abbreviation": "ENVI"
 * }
 * ```
 */
export async function handleGetCommitteeInfo(
  args: unknown
): Promise<{ content: { type: string; text: string }[] }> {
  // Validate input
  const params = GetCommitteeInfoSchema.parse(args);
  
  try {
    // Return current active bodies if showCurrent is true
    if (params.showCurrent === true) {
      const result = await epClient.getCurrentCorporateBodies();
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      };
    }

    // Fetch committee info from EP API (only pass defined properties)
    const apiParams: Record<string, string> = {};
    if (params['id'] !== undefined) apiParams['id'] = params['id'];
    if (params['abbreviation'] !== undefined) apiParams['abbreviation'] = params['abbreviation'];
    
    const result = await epClient.getCommitteeInfo(apiParams as Parameters<typeof epClient.getCommitteeInfo>[0]);
    
    // Validate output
    const validated = CommitteeSchema.parse(result);
    
    // Return MCP-compliant response
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(validated, null, 2)
      }]
    };
  } catch (error) {
    // Handle errors without exposing internal details
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to retrieve committee information: ${errorMessage}`);
  }
}

/**
 * Tool metadata for MCP registration
 */
export const getCommitteeInfoToolMetadata = {
  name: 'get_committee_info',
  description: 'Retrieve detailed information about EP corporate bodies/committees. Query by ID, abbreviation, or set showCurrent=true for all current active bodies. Returns composition, chair, vice-chairs, members, meeting schedules, and areas of responsibility.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: {
        type: 'string',
        description: 'Committee identifier',
        minLength: 1,
        maxLength: 100
      },
      abbreviation: {
        type: 'string',
        description: 'Committee abbreviation (e.g., "ENVI", "AGRI", "ECON")',
        minLength: 1,
        maxLength: 20
      },
      showCurrent: {
        type: 'boolean',
        description: 'If true, returns all current active corporate bodies',
        default: false
      }
    }
  }
};
