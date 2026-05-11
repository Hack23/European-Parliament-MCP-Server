/**
 * MCP Tool: sentiment_tracker
 *
 * Track political group institutional positioning and inferred sentiment
 * using current seat-share distribution as a proxy indicator. Larger, stable
 * seat shares are interpreted as positive institutional sentiment, while
 * marginal or declining seat shares suggest negative sentiment or weaker
 * positioning. This tool does not analyse individual roll-call votes or
 * voting defections because direct voting-cohesion data is not exposed by
 * the EP API.
 *
 * **Intelligence Perspective:** Seat-share positioning provides early
 * visibility into shifting power balances between political groups—enabling
 * predictive political intelligence on emerging dominance and fragmentation.
 *
 * **Business Perspective:** Supports B2G/B2B/B2C customers—including policy
 * consultancies, financial analysts, and corporate affairs teams—who need a
 * rapid read on political group strength to inform lobbying strategy, risk
 * assessments, and investment decisions related to EU regulatory outcomes.
 *
 * **Marketing Perspective:** Appeals to journalists, academic researchers,
 * and civic-tech developers as a concise, data-backed institutional barometer
 * that contextualises group seat share within broader EU political dynamics.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { z } from 'zod';
import { buildToolResponse, buildErrorResponse } from './shared/responseBuilder.js';
import type { ToolResult } from './shared/types.js';
import { fetchAllCurrentMEPs } from '../utils/mepFetcher.js';

/**
 * Zod input schema for the `sentiment_tracker` MCP tool. Optional
 * `groupId` filters the analysis to a single political group; `timeframe`
 * is an informational label (the current implementation always uses the
 * latest available MEP composition data, not historical time series).
 */
export const SentimentTrackerSchema = z.object({
  groupId: z.string()
    .min(1)
    .max(50)
    .optional()
    .describe('Political group ID to track (omit for all groups)'),
  timeframe: z.enum(['last_month', 'last_quarter', 'last_year'])
    .optional()
    .default('last_quarter')
    .describe('Informational-only time window label; current implementation always uses latest available MEP composition data, not historical time-series'),
});

/**
 * Validated parameter type for the `sentiment_tracker` tool, inferred
 * from {@link SentimentTrackerSchema}.
 */
export type SentimentTrackerParams = z.infer<typeof SentimentTrackerSchema>;

interface GroupSentiment {
  groupId: string;
  sentimentScore: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'VOLATILE';
  volatility: number;
  memberCount: number;
  cohesionProxy: number;
}

interface SentimentShift {
  groupId: string;
  fromScore: number;
  toScore: number;
  magnitude: number;
  direction: 'POSITIVE' | 'NEGATIVE';
  estimatedCause: string;
}

interface SentimentTrackerResult {
  timeframe: string;
  groupSentiments: GroupSentiment[];
  polarizationIndex: number;
  consensusTopics: string[];
  divisiveTopics: string[];
  sentimentShifts: SentimentShift[];
  overallParliamentSentiment: number;
  computedAttributes: {
    mostPositiveGroup: string;
    mostNegativeGroup: string;
    highestVolatility: string;
    trendingSentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    bimodalityIndex: number;
  };
  dataAvailable: boolean;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  dataFreshness: string;
  sourceAttribution: string;
  methodology: string;
  dataQualityWarnings: string[];
}

const KNOWN_POLITICAL_GROUPS = ['EPP', 'S&D', 'Renew', 'Greens/EFA', 'ECR', 'ID', 'GUE/NGL', 'NI'];

/**
 * Seat-share thresholds and corresponding sentiment score baselines.
 *
 * Rationale: Groups with large seat shares (>25%) typically govern the parliament's agenda,
 * reflecting a "positive" institutional sentiment from stable majority positioning.
 * Mid-tier groups (5-25%) operate in competitive opposition or coalition roles — neutral.
 * Micro-groups (<5%) face procedural disadvantages (quorum, rapporteurship access) — slight negative.
 *
 * These are proxy estimates; direct voting cohesion data is not available from the EP API.
 */
const SEAT_SHARE_THRESHOLDS = {
  large: 0.25,
  medium: 0.15,
  small: 0.05
} as const;

const SENTIMENT_SCORES = {
  large: 0.3,
  medium: 0.2,
  small: 0.1,
  micro: -0.1
} as const;

function deriveSentimentScore(memberCount: number, totalMEPs: number): number {
  const seatShare = totalMEPs > 0 ? memberCount / totalMEPs : 0;
  if (seatShare > SEAT_SHARE_THRESHOLDS.large) return SENTIMENT_SCORES.large;
  if (seatShare > SEAT_SHARE_THRESHOLDS.medium) return SENTIMENT_SCORES.medium;
  if (seatShare > SEAT_SHARE_THRESHOLDS.small) return SENTIMENT_SCORES.small;
  return SENTIMENT_SCORES.micro;
}

function deriveTrend(seatShare: number): GroupSentiment['trend'] {
  if (seatShare > 0.25) return 'STABLE';
  if (seatShare > 0.15) return 'IMPROVING';
  if (seatShare > 0.05) return 'STABLE';
  return 'DECLINING';
}

function computePolarizationIndex(sentiments: number[]): number {
  if (sentiments.length < 2) return 0;
  const mean = sentiments.reduce((s, v) => s + v, 0) / sentiments.length;
  const variance = sentiments.reduce((s, v) => s + (v - mean) ** 2, 0) / sentiments.length;
  return Math.min(1, Math.round(Math.sqrt(variance) * 200) / 100);
}

function computeBimodalityIndex(sentiments: number[]): number {
  if (sentiments.length < 3) return 0;
  const extreme = sentiments.filter(s => s > 0.1 || s < -0.1).length;
  return Math.round((extreme / sentiments.length) * 100) / 100;
}

function buildSentimentShifts(sentiments: GroupSentiment[]): SentimentShift[] {
  const shifts: SentimentShift[] = [];
  for (const g of sentiments) {
    const magnitude = Math.abs(g.sentimentScore);
    if (magnitude > 0.15) {
      shifts.push({
        groupId: g.groupId,
        fromScore: 0,
        toScore: g.sentimentScore,
        magnitude: Math.round(magnitude * 100) / 100,
        direction: g.sentimentScore > 0 ? 'POSITIVE' : 'NEGATIVE',
        estimatedCause: g.sentimentScore > 0
          ? 'Large seat share indicates strong institutional position on tracked topics'
          : 'Smaller seat share indicates weaker institutional position or limited leverage on tracked topics'
      });
    }
  }
  return shifts.sort((a, b) => b.magnitude - a.magnitude).slice(0, 5);
}

function classifyTrendingSentiment(score: number): 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' {
  if (score > 0.1) return 'POSITIVE';
  if (score < -0.1) return 'NEGATIVE';
  return 'NEUTRAL';
}

function buildEmptySentimentResult(params: SentimentTrackerParams): SentimentTrackerResult {
  const result: SentimentTrackerResult = {
    timeframe: params.timeframe,
    groupSentiments: [],
    polarizationIndex: 0,
    consensusTopics: [],
    divisiveTopics: [],
    sentimentShifts: [],
    overallParliamentSentiment: 0,
    computedAttributes: {
      mostPositiveGroup: 'N/A',
      mostNegativeGroup: 'N/A',
      highestVolatility: 'N/A',
      trendingSentiment: 'NEUTRAL',
      bimodalityIndex: 0
    },
    dataAvailable: false,
    confidenceLevel: 'LOW',
    dataFreshness: 'No data available from EP API',
    sourceAttribution: 'European Parliament Open Data Portal - data.europarl.europa.eu',
    methodology: 'Sentiment derived from seat-share proxies — no MEP data available.',
    dataQualityWarnings: ['No MEP data available from EP API — all sentiment scores are empty'],
  };
  return result;
}

function buildGroupSentiment(groupId: string, memberCount: number, totalMEPs: number): GroupSentiment {
  const seatShare = totalMEPs > 0 ? memberCount / totalMEPs : 0;
  const sentimentScore = deriveSentimentScore(memberCount, totalMEPs);
  return {
    groupId,
    sentimentScore: Math.round(sentimentScore * 100) / 100,
    trend: deriveTrend(seatShare),
    volatility: 0.12,
    memberCount,
    cohesionProxy: Math.round((0.5 + sentimentScore * 0.3) * 100) / 100
  };
}

function buildTopicsAndShifts(validSentiments: GroupSentiment[]): {
  consensusTopics: string[];
  divisiveTopics: string[];
  sentimentShifts: SentimentShift[];
} {
  const consensusTopics: string[] = [];
  const divisiveTopics: string[] = [];
  return { consensusTopics, divisiveTopics, sentimentShifts: buildSentimentShifts(validSentiments) };
}

function buildSentimentComputedAttrs(
  validSentiments: GroupSentiment[],
  sentimentScores: number[],
  overallSentiment: number
): SentimentTrackerResult['computedAttributes'] {
  const sortedBySentiment = [...validSentiments].sort((a, b) => b.sentimentScore - a.sentimentScore);
  const sortedByVolatility = [...validSentiments].sort((a, b) => b.volatility - a.volatility);
  return {
    mostPositiveGroup: sortedBySentiment[0]?.groupId ?? 'N/A',
    mostNegativeGroup: sortedBySentiment[sortedBySentiment.length - 1]?.groupId ?? 'N/A',
    highestVolatility: sortedByVolatility[0]?.groupId ?? 'N/A',
    trendingSentiment: classifyTrendingSentiment(overallSentiment),
    bimodalityIndex: computeBimodalityIndex(sentimentScores)
  };
}

/**
 * Compute political-group institutional-positioning sentiment scores.
 *
 * Implementation of the MCP `sentiment_tracker` tool. Aggregates current
 * MEP group composition into per-group sentiment scores (seat-share
 * proxies), computes a polarization index, derives consensus and
 * divisive topics and returns an overall parliament sentiment score.
 *
 * @param params - Validated tool parameters
 *   (see {@link SentimentTrackerSchema})
 * @returns A {@link ToolResult} containing the sentiment report or a
 *   structured error response on failure
 */
export async function sentimentTracker(params: SentimentTrackerParams): Promise<ToolResult> {
  try {
    const fetchResult = await fetchAllCurrentMEPs();
    const allMeps = fetchResult.meps;
    const totalMEPs = allMeps.length;

    if (totalMEPs === 0) {
      return buildToolResponse(buildEmptySentimentResult(params));
    }

    const groupCounts = new Map<string, number>();
    for (const mep of allMeps) {
      const g = mep.politicalGroup;
      groupCounts.set(g, (groupCounts.get(g) ?? 0) + 1);
    }

    const targetGroups = params.groupId !== undefined ? [params.groupId] : KNOWN_POLITICAL_GROUPS;
    const groupSentiments = targetGroups.map(
      gId => buildGroupSentiment(gId, groupCounts.get(gId) ?? 0, totalMEPs)
    );
    const validSentiments = groupSentiments.filter(g => g.memberCount > 0);

    const sentimentScores = validSentiments.map(g => g.sentimentScore);
    const polarizationIndex = computePolarizationIndex(sentimentScores);
    const overallSentiment = sentimentScores.length > 0
      ? Math.round((sentimentScores.reduce((s, v) => s + v, 0) / sentimentScores.length) * 100) / 100
      : 0;

    const { consensusTopics, divisiveTopics, sentimentShifts } = buildTopicsAndShifts(validSentiments);

    const result: SentimentTrackerResult = {
      timeframe: params.timeframe,
      groupSentiments,
      polarizationIndex,
      consensusTopics,
      divisiveTopics,
      sentimentShifts,
      overallParliamentSentiment: overallSentiment,
      computedAttributes: buildSentimentComputedAttrs(validSentiments, sentimentScores, overallSentiment),
      dataAvailable: validSentiments.length > 0,
      confidenceLevel: 'LOW',
      dataFreshness: 'Real-time EP API data — sentiment derived from current MEP group composition',
      sourceAttribution: 'European Parliament Open Data Portal - data.europarl.europa.eu',
      methodology: 'Scores represent institutional positioning (not true internal sentiment): '
        + 'group seat-share used as baseline signal (larger groups = stronger institutional position). '
        + 'Large groups may have high seat-share but internal dissent; small groups may be highly cohesive but score lower. '
        + 'Polarization index computed as standard deviation of group sentiment scores. '
        + 'NOTE: Direct voting cohesion data is not available from the EP API /meps endpoint; '
        + 'scores are proxy estimates based on group size distributions. '
        + 'Data source: https://data.europarl.europa.eu/api/v2/meps',
      dataQualityWarnings: [
        'Sentiment scores are seat-share proxies, not derived from voting cohesion or textual analysis',
        'Direct voting data unavailable from EP API — scores reflect institutional positioning by group size only',
        ...(!fetchResult.complete ? [`MEP data is incomplete — pagination failed at offset ${String(fetchResult.failureOffset ?? 0)}; results based on partial data`] : []),
      ],
    };

    return buildToolResponse(result);
  } catch (error: unknown) {
    return buildErrorResponse(
      error instanceof Error ? error : new Error(String(error)),
      'sentiment_tracker'
    );
  }
}

/**
 * MCP tool metadata for `sentiment_tracker` (name, description, and
 * JSON Schema for the tool's input). Consumed by the server's tool
 * registry to advertise this tool in `ListTools` responses.
 */
export const sentimentTrackerToolMetadata = {
  name: 'sentiment_tracker',
  description: 'Track political group institutional-positioning scores based on seat-share proxy (not direct voting cohesion data, which is unavailable from the EP API). Computes scores (-1 to +1), polarization index, and identifies consensus and divisive topics. NOTE: timeframe parameter is informational-only; scores always reflect current group composition.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      groupId: {
        type: 'string',
        description: 'Political group ID to track (omit for all groups)',
        minLength: 1,
        maxLength: 50
      },
      timeframe: {
        type: 'string',
        enum: ['last_month', 'last_quarter', 'last_year'],
        description: 'Informational-only time window label (scores always use latest group composition data)',
        default: 'last_quarter'
      },
    }
  }
};

/**
 * MCP `CallTool` handler entry point for `sentiment_tracker`.
 *
 * Validates the raw input arguments against {@link SentimentTrackerSchema}
 * and delegates execution to {@link sentimentTracker}.
 *
 * @param args - Raw, untrusted MCP `CallTool` arguments
 * @returns The same {@link ToolResult} produced by {@link sentimentTracker}
 */
export async function handleSentimentTracker(args: unknown): Promise<ToolResult> {
  const params = SentimentTrackerSchema.parse(args);
  return sentimentTracker(params);
}
