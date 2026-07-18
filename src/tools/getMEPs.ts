/**
 * MCP Tool: get_meps
 *
 * Retrieve Members of European Parliament with filtering options
 *
 * **Intelligence Perspective:** Foundation for MEP profiling, political group cohesion analysis,
 * national delegation mapping, and cross-party alliance detection via OSINT methodologies.
 *
 * **Business Perspective:** Core data product for B2G/B2B customers requiring MEP contact
 * databases, political risk assessments, and stakeholder mapping services.
 *
 * **Marketing Perspective:** Primary showcase tool demonstrating API value proposition
 * to journalists, researchers, and civic tech developers seeking structured MEP data.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetMEPsSchema, MEPSchema, PaginatedResponseSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import { buildApiParams } from './shared/paramBuilder.js';
import { ToolError } from './shared/errors.js';
import { z } from 'zod';
import type { ToolResult } from './shared/types.js';
import {
  loadWeeklyCorporateBodiesCache,
  loadWeeklyMEPCache,
  type WeeklyMEPCache,
} from '../utils/weeklyDataCache.js';
import { findCachedCommittee } from '../utils/committeeCache.js';
import { auditLogger } from '../utils/auditLogger.js';

type GetMEPsParams = ReturnType<typeof GetMEPsSchema.parse>;

function cachedMEPDetails(cache: WeeklyMEPCache, id: string): WeeklyMEPCache['mepDetails'][string] | undefined {
  const normalizedId = id.replace(/^MEP-/, '').replace(/^person\//, '');
  return cache.mepDetails[id]
    ?? cache.mepDetails[normalizedId]
    ?? cache.mepDetails[`MEP-${normalizedId}`]
    ?? cache.mepDetails[`person/${normalizedId}`];
}

function matchesCommittee(committees: readonly string[], requested: string): boolean {
  const normalized = requested.toUpperCase();
  return committees.some((committee) =>
    committee.toUpperCase() === normalized
      || committee.split('/').pop()?.toUpperCase() === normalized,
  );
}

async function getCachedMEPResponse(params: GetMEPsParams): Promise<ToolResult | null> {
  if (params.live) return null;
  const [cached, cachedBodies] = await Promise.all([
    loadWeeklyMEPCache(),
    loadWeeklyCorporateBodiesCache(),
  ]);
  if (cached === null) return null;
  if (params.active && cached.meps.length > 0 && !cached.meps.some((mep) => mep.active)) {
    return null;
  }

  const resolvedCommittee = params.committee === undefined || cachedBodies === null
    ? params.committee
    : findCachedCommittee(params.committee, cachedBodies, cached)?.id ?? params.committee;
  const enrichedMEPs = cached.meps.map((mep) => ({
    ...mep,
    committees: cachedMEPDetails(cached, mep.id)?.committees ?? mep.committees,
  }));
  const filtered = enrichedMEPs.filter((mep) => {
    if (params.country !== undefined && mep.country.toUpperCase() !== params.country.toUpperCase()) return false;
    if (params.group !== undefined && mep.politicalGroup !== params.group) return false;
    if (resolvedCommittee !== undefined && !matchesCommittee(mep.committees, resolvedCommittee)) return false;
    if (mep.active !== params.active) return false;
    return true;
  });
  const paged = filtered.slice(params.offset, params.offset + params.limit);
  const validated = PaginatedResponseSchema(MEPSchema).parse({
    data: paged,
    total: filtered.length,
    limit: params.limit,
    offset: params.offset,
    hasMore: params.offset + paged.length < filtered.length,
  });
  auditLogger.logDataAccess('get_meps', {
    country: params.country,
    group: params.group,
    committee: params.committee,
    active: params.active,
    limit: params.limit,
    offset: params.offset,
  }, validated.data.length);
  return buildToolResponse(validated);
}

/**
 * Handles the get_meps MCP tool request.
 *
 * Retrieves Members of European Parliament with optional filtering by country, political
 * group, committee, and active status. Results are paginated and GDPR-compliant.
 *
 * **Intelligence Use Cases:** Filter by country for national delegation analysis, by group for
 * cohesion studies, by committee for policy domain expertise mapping.
 *
 * **Business Use Cases:** Power stakeholder mapping products, political risk dashboards,
 * and MEP engagement tracking for corporate affairs teams.
 *
 * **Marketing Use Cases:** Demo-ready endpoint for showcasing EP data access to potential
 * API consumers, journalists, and civic tech developers.
 *
 * @param args - Raw tool arguments, validated against {@link GetMEPsSchema}
 * @returns MCP tool result containing a paginated list of MEP records with name, country,
 *   political group, committee memberships, and contact information
 * @throws {ToolError} With `operation: 'validateInput'` if `args` fails Zod schema validation
 *   (e.g., country code not 2 uppercase letters, limit out of range 1–100)
 * @throws {ToolError} With `operation: 'validateOutput'` if the EP API response does not match
 *   the expected schema shape
 * @throws {ToolError} With `operation: 'fetchData'` if the European Parliament API is
 *   unreachable or returns an error response
 *
 * @example
 * ```typescript
 * const result = await handleGetMEPs({ country: 'SE', limit: 10 });
 * // Returns up to 10 Swedish MEPs with group and committee details
 * ```
 *
 * @example
 * ```typescript
 * // Get active EPP group members
 * const result = await handleGetMEPs({ group: "EPP", active: true, limit: 50 });
 * ```
 *
 * @security - Input is validated with Zod before any API call.
 * - Errors are sanitized to avoid exposing internal implementation details.
 * - Personal data in responses is minimised per GDPR Article 5(1)(c).
 * - Personal data access is audit-logged per GDPR Article 30.
 * - All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * - ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 * @since 0.8.0
 * @see {@link getMEPsToolMetadata} for MCP schema registration
 * @see {@link handleGetMEPDetails} for retrieving full details of a single MEP
 */
export async function handleGetMEPs(
  args: unknown
): Promise<ToolResult> {
  let params: GetMEPsParams;
  try {
    params = GetMEPsSchema.parse(args);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_meps',
        operation: 'validateInput',
        message: `Invalid parameters: ${fieldErrors}`,
        isRetryable: false,
        cause: error,
      });
    }
    throw error;
  }

  try {
    const cachedResponse = await getCachedMEPResponse(params);
    if (cachedResponse !== null) return cachedResponse;

    const apiParams = {
      active: params.active,
      limit: params.limit,
      offset: params.offset,
      live: params.live,
      ...buildApiParams(params, [
        { from: 'country', to: 'country' },
        { from: 'group', to: 'group' },
        { from: 'committee', to: 'committee' },
      ]),
    };

    const result = await epClient.getMEPs(apiParams);

    const outputSchema = PaginatedResponseSchema(MEPSchema);
    const validated = outputSchema.parse(result);

    return buildToolResponse(validated);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_meps',
        operation: 'validateOutput',
        message: `Unexpected EP API response format: ${fieldErrors}`,
        isRetryable: false,
        cause: error,
      });
    }
    throw new ToolError({
      toolName: 'get_meps',
      operation: 'fetchData',
      message: 'Failed to retrieve MEPs',
      isRetryable: true,
      cause: error,
    });
  }
}

/**
 * Tool metadata for MCP registration
 */
export const getMEPsToolMetadata = {
  name: 'get_meps',
  description: 'Retrieve Members of European Parliament with optional filters (country, political group, committee, active status). Returns paginated results with MEP details including name, country, political group, committees, and contact information.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      country: {
        type: 'string',
        description: 'ISO 3166-1 alpha-2 country code (e.g., "SE" for Sweden)',
        pattern: '^[A-Z]{2}$',
        minLength: 2,
        maxLength: 2
      },
      group: {
        type: 'string',
        description: 'Political group identifier (e.g., "EPP", "S&D", "Greens/EFA")',
        minLength: 1,
        maxLength: 50
      },
      committee: {
        type: 'string',
        description: 'Committee identifier (e.g., "ENVI", "AGRI")',
        minLength: 1,
        maxLength: 100
      },
      active: {
        type: 'boolean',
        description: 'Filter by active status',
        default: true
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (1-100)',
        minimum: 1,
        maximum: 100,
        default: 50
      },
      offset: {
        type: 'number',
        description: 'Pagination offset',
        minimum: 0,
        default: 0
      },
      live: {
        type: 'boolean',
        description: 'When true, bypasses weekly cache and fetches directly from the live EP API.',
        default: false,
      }
    }
  }
};
