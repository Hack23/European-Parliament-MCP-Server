/**
 * MCP Tool: get_external_documents_feed
 *
 * Get recently updated external documents (non-EP documents) from the feed.
 *
 * **EP API Endpoint:**
 * - `GET /external-documents/feed`
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { GetExternalDocumentsFeedSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { ToolError } from './shared/errors.js';
import { isUpstream404, isErrorInBody, buildFeedSuccessResponse, buildEmptyFeedResponse } from './shared/feedUtils.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import { z } from 'zod';
import type { ToolResult } from './shared/types.js';

const EXTERNAL_DOCUMENTS_EMPTY_REASON =
  'EP external-documents feed returned zero items for the requested window; this is ambiguous between a true empty window and feed freshness/ordering lag.';

interface ExternalDocumentsFeedDiagnostics {
  endpoint: 'external-documents/feed';
  requestedWindow: {
    timeframe: string;
    startDate?: string;
    workType?: string;
  };
  emptyResultAmbiguity: 'true-empty-or-feed-freshness-lag';
  freshnessStatus: 'unknown';
  fallbackTool: 'get_external_documents';
  fallbackArguments: {
    limit: 20;
  };
}

type ExternalDocumentsFeedParams = ReturnType<typeof GetExternalDocumentsFeedSchema.parse>;

function buildExternalDocumentsFeedDiagnostics(
  params: ExternalDocumentsFeedParams
): ExternalDocumentsFeedDiagnostics {
  const requestedWindow: ExternalDocumentsFeedDiagnostics['requestedWindow'] = {
    timeframe: params.timeframe,
  };
  if (params.startDate !== undefined) requestedWindow.startDate = params.startDate;
  if (params.workType !== undefined) requestedWindow.workType = params.workType;

  return {
    endpoint: 'external-documents/feed',
    requestedWindow,
    emptyResultAmbiguity: 'true-empty-or-feed-freshness-lag',
    freshnessStatus: 'unknown',
    fallbackTool: 'get_external_documents',
    fallbackArguments: { limit: 20 },
  };
}

function hasFeedItems(result: unknown): boolean {
  const source = (result ?? {}) as Record<string, unknown>;
  return Array.isArray(source['data']) && source['data'].length > 0;
}

function withEmptyFeedDiagnostics(result: unknown, params: ExternalDocumentsFeedParams): unknown {
  if (hasFeedItems(result)) return result;
  const source = (result ?? {}) as Record<string, unknown>;
  // Error-in-body responses are upstream enrichment failures, not ambiguous
  // true-empty/freshness-lag windows — do not attach diagnostics.
  if (isErrorInBody(source)) return result;
  return {
    ...source,
    dataQualityDiagnostics: buildExternalDocumentsFeedDiagnostics(params),
  };
}

function buildExternalDocumentsUnavailableResponse(params: ExternalDocumentsFeedParams): ToolResult {
  const items: unknown[] = [];
  return buildToolResponse({
    status: 'unavailable',
    generatedAt: new Date().toISOString(),
    items,
    itemCount: 0,
    reason: EXTERNAL_DOCUMENTS_EMPTY_REASON,
    data: items,
    '@context': [],
    dataQualityWarnings: [EXTERNAL_DOCUMENTS_EMPTY_REASON],
    dataQualityDiagnostics: buildExternalDocumentsFeedDiagnostics(params),
  });
}

/**
 * Handles the get_external_documents_feed MCP tool request.
 *
 * @param args - Raw tool arguments, validated against {@link GetExternalDocumentsFeedSchema}
 * @returns MCP tool result containing recently updated external document data
 * @security Input is validated with Zod before any API call.
 */
export async function handleGetExternalDocumentsFeed(args: unknown): Promise<ToolResult> {
  let params: ReturnType<typeof GetExternalDocumentsFeedSchema.parse>;
  try {
    params = GetExternalDocumentsFeedSchema.parse(args);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ToolError({
        toolName: 'get_external_documents_feed',
        operation: 'validateInput',
        message: `Invalid parameters: ${fieldErrors}`,
        isRetryable: false,
        cause: error,
      });
    }
    throw error;
  }

  try {
    const apiParams: Record<string, unknown> = {};
    apiParams['timeframe'] = params.timeframe;
    if (params.startDate !== undefined) apiParams['startDate'] = params.startDate;
    if (params.workType !== undefined) apiParams['workType'] = params.workType;
    const result = await epClient.getExternalDocumentsFeed(
      apiParams
    );
    const source = (result ?? {}) as Record<string, unknown>;
    if (isErrorInBody(source)) {
      return buildEmptyFeedResponse(
        'EP API returned an error-in-body response for get_external_documents_feed — the upstream enrichment step may have failed.',
      );
    }
    return buildFeedSuccessResponse(
      withEmptyFeedDiagnostics(result, params),
      [],
      EXTERNAL_DOCUMENTS_EMPTY_REASON,
    );
  } catch (error: unknown) {
    if (isUpstream404(error)) return buildExternalDocumentsUnavailableResponse(params);
    throw new ToolError({
      toolName: 'get_external_documents_feed',
      operation: 'fetchData',
      message: 'Failed to retrieve external documents feed',
      isRetryable: true,
      cause: error,
    });
  }
}
/** Tool metadata for get_external_documents_feed */
export const getExternalDocumentsFeedToolMetadata = {
  name: 'get_external_documents_feed',
  description:
    'Get recently updated external documents (non-EP documents) from the feed. Returns external documents published or updated during the specified timeframe. Data source: European Parliament Open Data Portal.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      timeframe: {
        type: 'string',
        description: 'Timeframe for the feed (today, one-day, one-week, one-month, custom)',
        enum: ['today', 'one-day', 'one-week', 'one-month', 'custom'],
        default: 'one-week',
      },
      startDate: {
        type: 'string',
        description: 'Start date (YYYY-MM-DD) — required when timeframe is "custom"',
      },
      workType: { type: 'string', description: 'Work type filter' },
    },
  },
};
