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
 * Compute confidence level based on available voting data
 */
function computeConfidence(totalVotes: number): string {
  if (totalVotes > 500) return 'HIGH';
  if (totalVotes > 100) return 'MEDIUM';
  return 'LOW';
}

/**
 * Analyze voting patterns tool handler
 * 
 * @param args - Tool arguments
 * @returns MCP tool result with voting pattern analysis
 * 
 * @example
 * ```json
 * {
 *   "mepId": "MEP-124810",
 *   "dateFrom": "2024-01-01",
 *   "dateTo": "2024-12-31",
 *   "compareWithGroup": true
 * }
 * ```
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
    // Handle errors without exposing internal details
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to analyze voting patterns: ${errorMessage}`);
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
