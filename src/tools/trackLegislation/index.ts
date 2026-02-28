/**
 * MCP Tool: track_legislation
 * 
 * Track legislative procedure progress through European Parliament
 * 
 * **Intelligence Perspective:** Enables real-time legislative pipeline monitoring,
 * procedure stage analysis, and trilogue outcome tracking for strategic intelligence
 * on EU regulatory developments and policy trajectory forecasting.
 * 
 * **Business Perspective:** Core compliance monitoring product—essential for enterprises
 * tracking regulatory changes, industry associations monitoring sector-specific legislation.
 * 
 * **Marketing Perspective:** Demonstrates end-to-end legislative tracking capability—
 * differentiator for RegTech market and EU affairs consultancy customer acquisition.
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { TrackLegislationSchema } from '../../schemas/europeanParliament.js';
import { epClient } from '../../clients/europeanParliamentClient.js';
import { buildLegislativeTracking } from './procedureTracker.js';
import type { ToolResult } from '../shared/types.js';
import { ToolError } from '../shared/errors.js';

/**
 * Convert a user-supplied procedure reference to the EP API process-id format.
 *
 * The EP API uses process IDs like `2024-0006` (dashes, no type suffix),
 * while users typically supply references like `2024/0006(COD)`.
 *
 * Supported input formats:
 * - Process-id: `"2024-0006"` (returned as-is)
 * - Reference: `"2024/0006(COD)"` → `"2024-0006"`
 * - Bare reference: `"2024/0006"` → `"2024-0006"` (fallback)
 *
 * @param ref - Procedure reference (e.g. `"2024/0006(COD)"` or `"2024-0006"`)
 * @returns Process ID suitable for the EP API (e.g. `"2024-0006"`)
 */
export function toProcessId(ref: string): string {
  // Already in process-id format (e.g. "2024-0006")
  if (/^\d{4}-\d{4}$/.test(ref)) {
    return ref;
  }
  // Reference format: "2024/0006(COD)" → "2024-0006"
  const match = /^(\d{4})\/(\d{4})\(.*\)$/.exec(ref);
  if (match?.[1] !== undefined && match[2] !== undefined) {
    return `${match[1]}-${match[2]}`;
  }
  // Fallback: replace slashes with dashes and strip parenthetical suffix
  return ref.replace(/\(.*\)$/, '').replace(/\//g, '-');
}

/**
 * Handles the track_legislation MCP tool request.
 *
 * Tracks a specific European Parliament legislative procedure through its full
 * lifecycle — from initial proposal through committee review, plenary vote,
 * trilogue, and final adoption. Accepts both EP API process-id format
 * (`2024-0006`) and human-readable reference format (`2024/0006(COD)`).
 *
 * @param args - Raw tool arguments, validated against {@link TrackLegislationSchema}
 * @returns MCP tool result containing the procedure's current stage, timeline,
 *   committee assignments, voting records, and next-step projections
 * @throws {ZodError} If `args` fails schema validation (e.g., missing required fields or invalid format)
 * @throws {Error} If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * const result = await handleTrackLegislation({
 *   procedureId: '2024/0006(COD)'
 * });
 * // Returns legislative tracking with current stage, timeline milestones,
 * // committee assignments, and estimated adoption timeline
 * ```
 *
 * @security Input is validated with Zod before any API call.
 *   Personal data in responses is minimised per GDPR Article 5(1)(c).
 *   All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 * @since 0.8.0
 * @see {@link trackLegislationToolMetadata} for MCP schema registration
 * @see {@link handleMonitorLegislativePipeline} for pipeline-wide health and bottleneck analysis
 */
export async function handleTrackLegislation(
  args: unknown
): Promise<ToolResult> {
  const params = TrackLegislationSchema.parse(args);
  const processId = toProcessId(params.procedureId);
  
  try {
    const procedure = await epClient.getProcedureById(processId);
    const tracking = buildLegislativeTracking(procedure);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(tracking, null, 2)
      }]
    };
  } catch (error) {
    throw new ToolError({
      toolName: 'track_legislation',
      operation: 'fetchProcedure',
      message: 'Failed to retrieve legislative procedure data',
      isRetryable: true,
      cause: error,
    });
  }
}

/**
 * Tool metadata for MCP registration
 */
export const trackLegislationToolMetadata = {
  name: 'track_legislation',
  description: 'Track European Parliament legislative procedure progress including current status, timeline of stages, committee assignments, amendments, voting records, and next steps. Provides comprehensive overview of legislation journey from proposal to adoption.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      procedureId: {
        type: 'string',
        description: 'Legislative procedure identifier (e.g., "2024/0001(COD)")',
        minLength: 1,
        maxLength: 100
      }
    },
    required: ['procedureId']
  }
};
