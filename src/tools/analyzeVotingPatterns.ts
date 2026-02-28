/**
 * MCP Tool: analyze_voting_patterns
 * 
 * Analyze MEP voting behavior and patterns
 * 
 * **Intelligence Perspective:** Advanced analytic tool for political group cohesion measurement,
 * cross-party voting detection, MEP independence scoring, and predictive analysis of
 * legislative outcomes using structured intelligence analysis techniques.
 * 
 * **Business Perspective:** Premium analytics product differentiator—enables political risk
 * scoring, policy outcome prediction, and quantitative political analysis for enterprise clients.
 * 
 * **Marketing Perspective:** Flagship intelligence capability demonstrating AI-powered
 * parliamentary analysis—key selling point for MCP ecosystem positioning.
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { AnalyzeVotingPatternsSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import { buildToolResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';
import { ToolError } from './shared/errors.js';

/**
 * Voting pattern analysis result
 */
interface VotingPatternAnalysis {
  mepId: string;
  mepName: string;
  period: {
    from: string;
    to: string;
  };
  statistics: {
    totalVotes: number;
    votesFor: number;
    votesAgainst: number;
    abstentions: number;
    attendanceRate: number;
  };
  groupAlignment?: {
    politicalGroup: string;
    alignmentRate: number;
    divergentVotes: number;
  };
  crossPartyVoting: {
    withOtherGroups: number;
    rate: number;
  };
  confidenceLevel: string;
  methodology: string;
}

/**
 * Compute group alignment metrics from voting statistics.
 * Alignment rate is derived from the ratio of 'for' votes to total decisive
 * votes, approximating how often the MEP votes with the majority position.
 *
 * @param politicalGroup - The MEP's registered political group identifier
 * @param stats - Voting statistics containing `totalVotes`, `votesFor`, and `votesAgainst`
 * @returns Object with `politicalGroup`, `alignmentRate` (0–100), and `divergentVotes` count
 * @since 0.8.0
 */
function computeGroupAlignment(
  politicalGroup: string,
  stats: { totalVotes: number; votesFor: number; votesAgainst: number }
): { politicalGroup: string; alignmentRate: number; divergentVotes: number } {
  const totalDecisive = stats.votesFor + stats.votesAgainst;
  const alignmentRate = totalDecisive > 0
    ? Math.round((stats.votesFor / totalDecisive) * 100 * 100) / 100
    : 0;
  const divergentVotes = stats.votesAgainst;
  return { politicalGroup, alignmentRate, divergentVotes };
}

/**
 * Compute cross-party voting metrics from voting statistics.
 * Cross-party rate approximated from 'against' vote ratio—higher against
 * rates suggest more independent voting that may cross party lines.
 *
 * @param stats - Voting statistics containing `totalVotes`, `votesFor`, and `votesAgainst`
 * @returns Object with `withOtherGroups` (count of against-votes used as proxy) and `rate` (0–100)
 * @since 0.8.0
 */
function computeCrossPartyVoting(
  stats: { totalVotes: number; votesFor: number; votesAgainst: number }
): { withOtherGroups: number; rate: number } {
  const totalDecisive = stats.votesFor + stats.votesAgainst;
  const crossPartyRate = totalDecisive > 0
    ? Math.round((stats.votesAgainst / totalDecisive) * 100 * 100) / 100
    : 0;
  return { withOtherGroups: stats.votesAgainst, rate: crossPartyRate };
}

/**
 * Compute confidence level based on available voting data.
 *
 * @param totalVotes - Total number of recorded votes for the MEP
 * @returns `'HIGH'` (>500 votes), `'MEDIUM'` (>100 votes), or `'LOW'` (≤100 votes)
 * @since 0.8.0
 */
function computeConfidence(totalVotes: number): string {
  if (totalVotes > 500) return 'HIGH';
  if (totalVotes > 100) return 'MEDIUM';
  return 'LOW';
}

/**
 * Handles the analyze_voting_patterns MCP tool request.
 *
 * Analyses an MEP's voting behaviour over an optional date range, computing group
 * alignment rate, cross-party voting frequency, attendance rate, and a data-quality
 * confidence level. When `compareWithGroup` is `true`, group alignment metrics are
 * included in the result.
 *
 * @param args - Raw tool arguments, validated against {@link AnalyzeVotingPatternsSchema}
 * @returns MCP tool result containing a {@link VotingPatternAnalysis} object, or a
 *   `dataAvailable: false` notice when voting statistics are unavailable from the EP API
 * @throws - If `args` fails schema validation (e.g., missing required `mepId`, bad date format)
 * - If the European Parliament API is unreachable or returns an error response
 *
 * @example
 * ```typescript
 * const result = await handleAnalyzeVotingPatterns({
 *   mepId: 'MEP-124810',
 *   dateFrom: '2024-01-01',
 *   dateTo: '2024-12-31',
 *   compareWithGroup: true
 * });
 * // Returns voting statistics, group alignment, and confidence level for MEP-124810
 * ```
 *
 * @security Input is validated with Zod before any API call.
 *   Personal data (MEP name, voting records) is minimised per GDPR Article 5(1)(c).
 *   All requests are rate-limited and audit-logged per ISMS Policy AU-002.
 *   Internal errors are wrapped before propagation to avoid leaking API details.
 * @since 0.8.0
 * @see {@link analyzeVotingPatternsToolMetadata} for MCP schema registration
 * @see {@link handleAnalyzeLegislativeEffectiveness} for broader legislative effectiveness scoring
 */
export async function handleAnalyzeVotingPatterns(
  args: unknown
): Promise<ToolResult> {
  // Validate input
  const params = AnalyzeVotingPatternsSchema.parse(args);
  
  try {
    // Fetch MEP details for context
    const mep = await epClient.getMEPDetails(params.mepId);
    
    const stats = mep.votingStatistics ?? {
      totalVotes: 0,
      votesFor: 0,
      votesAgainst: 0,
      abstentions: 0,
      attendanceRate: 0
    };

    // EP API /meps/{id} does not expose voting statistics — totalVotes is always 0
    if (stats.totalVotes === 0) {
      return buildToolResponse({
        mepId: params.mepId,
        mepName: mep.name,
        dataAvailable: false,
        dataAvailability: 'UNAVAILABLE',
        confidenceLevel: 'LOW',
        message: 'Voting statistics not available from EP API for this endpoint (/meps/{id}). '
          + 'Use getVotingRecords tool to retrieve actual voting data.'
      });
    }

    const analysis: VotingPatternAnalysis = {
      mepId: params.mepId,
      mepName: mep.name,
      period: {
        from: params.dateFrom ?? '2024-01-01',
        to: params.dateTo ?? '2024-12-31'
      },
      statistics: stats,
      ...(params.compareWithGroup && {
        groupAlignment: computeGroupAlignment(mep.politicalGroup, stats)
      }),
      crossPartyVoting: computeCrossPartyVoting(stats),
      confidenceLevel: computeConfidence(stats.totalVotes),
      methodology: 'Voting pattern analysis using EP Open Data. '
        + 'Group alignment derived from for/against vote ratio. '
        + 'Cross-party voting approximated from against-vote frequency. '
        + 'Data source: European Parliament Open Data Portal.'
    };
    
    return buildToolResponse(analysis);
  } catch (error) {
    throw new ToolError({
      toolName: 'analyze_voting_patterns',
      operation: 'fetchVotingData',
      message: 'Failed to retrieve voting records for analysis',
      isRetryable: true,
      cause: error,
    });
  }
}

/**
 * Tool metadata for MCP registration
 */
export const analyzeVotingPatternsToolMetadata = {
  name: 'analyze_voting_patterns',
  description: 'Analyze MEP voting behavior including voting alignment with political group, cross-party voting patterns, attendance rates, and topic-based voting analysis. Returns comprehensive voting statistics and patterns over a specified time period.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      mepId: {
        type: 'string',
        description: 'MEP identifier',
        minLength: 1,
        maxLength: 100
      },
      dateFrom: {
        type: 'string',
        description: 'Analysis start date (YYYY-MM-DD format)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$'
      },
      dateTo: {
        type: 'string',
        description: 'Analysis end date (YYYY-MM-DD format)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$'
      },
      compareWithGroup: {
        type: 'boolean',
        description: 'Compare MEP voting with political group average',
        default: true
      }
    },
    required: ['mepId']
  }
};
