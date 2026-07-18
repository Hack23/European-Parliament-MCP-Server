/**
 * MCP Tool: get_mep_details
 *
 * Retrieve detailed information about a specific MEP
 *
 * **Intelligence Perspective:** Enables deep-dive MEP profiling including voting statistics,
 * committee memberships, political group alignment, and behavioral pattern analysis for
 * individual actor intelligence assessments.
 *
 * **Business Perspective:** Powers premium MEP profile products for corporate affairs teams,
 * lobbyists, and political consultancies requiring comprehensive stakeholder intelligence.
 *
 * **Marketing Perspective:** Demonstrates depth of EP data access—key differentiator
 * for attracting enterprise customers and academic researchers.
 *
 * ISMS Policy: SC-002 (Input Validation), AU-002 (Audit Logging), GDPR Compliance
 */

import { GetMEPDetailsSchema, MEPDetailsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import { ToolError } from './shared/errors.js';
import { z } from 'zod';
import type { ToolResult } from './shared/types.js';
import { loadWeeklyMEPCache } from '../utils/weeklyDataCache.js';
import { auditLogger } from '../utils/auditLogger.js';

type GetMEPDetailsParams = ReturnType<typeof GetMEPDetailsSchema.parse>;

function normalizeMepIdentifier(id: string): string {
  if (id.startsWith('MEP-')) return id.substring(4);
  if (id.startsWith('person/')) return id.substring(7);
  return id;
}

async function getCachedMEPDetailsResponse(params: GetMEPDetailsParams): Promise<ToolResult | null> {
  if (params.live) return null;
  const cached = await loadWeeklyMEPCache();
  if (cached === null) return null;

  const normalizedId = normalizeMepIdentifier(params.id);
  const cachedRecord = cached.mepDetails[params.id]
    ?? cached.mepDetails[normalizedId]
    ?? cached.mepDetails[`MEP-${normalizedId}`]
    ?? cached.mepDetails[`person/${normalizedId}`];
  if (cachedRecord === undefined) return null;
  auditLogger.logDataAccess('get_mep_details', { id: params.id }, 1);
  return buildToolResponse(MEPDetailsSchema.parse(cachedRecord));
}

/**
 * Handles the get_mep_details MCP tool request.
 *
 * Retrieves the complete EP API v2 profile for a single MEP, including
 * biographical fields and full membership history. Access to personal data is
 * audit-logged for GDPR compliance.
 *
 * @param args - Raw tool arguments, validated against {@link GetMEPDetailsSchema}
 * @returns MCP tool result containing the detailed MEP profile and membership records
 * @throws - If `args` fails schema validation (e.g., missing or empty `id` field)
 * - If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * const result = await handleGetMEPDetails({ id: 'MEP-124810' });
 * // Returns the EP profile for MEP 124810, including complete memberships
 * ```
 *
 * @security Input is validated with Zod before any API call.
 *   Personal data (biography, contact info) access is audit-logged per GDPR Art. 5(2)
 *   and ISMS Policy AU-002. Data minimisation applied per GDPR Article 5(1)(c).
 * @since 0.8.0
 * @see {@link getMEPDetailsToolMetadata} for MCP schema registration
 * @see {@link handleGetMEPs} for listing MEPs and obtaining valid IDs
 */
export async function handleGetMEPDetails(
  args: unknown
): Promise<ToolResult> {
  let params: GetMEPDetailsParams;
  try {
    params = GetMEPDetailsSchema.parse(args);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_mep_details',
        operation: 'validateInput',
        message: `Invalid parameters: ${fieldErrors}`,
        isRetryable: false,
        cause: error,
      });
    }
    throw error;
  }

  try {
    const cachedResponse = await getCachedMEPDetailsResponse(params);
    if (cachedResponse !== null) return cachedResponse;

    const result = await epClient.getMEPDetails(params.id, { live: params.live });

    const validated = MEPDetailsSchema.parse(result);

    return buildToolResponse(validated);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_mep_details',
        operation: 'validateOutput',
        message: `Unexpected EP API response format: ${fieldErrors}`,
        isRetryable: false,
        cause: error,
      });
    }
    throw new ToolError({
      toolName: 'get_mep_details',
      operation: 'fetchData',
      message: 'Failed to retrieve MEP details',
      isRetryable: true,
      cause: error,
    });
  }
}

/**
 * Tool metadata for MCP registration
 */
export const getMEPDetailsToolMetadata = {
  name: 'get_mep_details',
  description: 'Retrieve the complete EP API v2 profile for a Member of European Parliament, including biographical data, mandates, organizations, committee classifications, and leadership roles. Personal data access is logged for GDPR compliance.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: {
        type: 'string',
        description: 'MEP identifier (e.g., "MEP-124810")',
        minLength: 1,
        maxLength: 100
      },
      live: {
        type: 'boolean',
        description: 'When true, bypasses weekly cache and fetches directly from the live EP API.',
        default: false,
      }
    },
    required: ['id']
  }
};
