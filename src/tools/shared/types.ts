/**
 * Shared types for MCP tool responses.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

/**
 * Standard MCP tool response type
 */
export interface ToolResult {
  content: { type: 'text'; text: string }[];
  isError?: boolean;
}

/**
 * Standard OSINT output fields required on every intelligence tool response.
 *
 * Ensures consistent methodology transparency, confidence communication, and
 * data provenance across all OSINT intelligence tools.
 *
 * **Confidence Level Criteria:**
 * - `HIGH`   — Real EP API data with full voting statistics available (totalVotes > 50 or complete membership data)
 * - `MEDIUM` — Partial EP API data (some statistics available but limited sample)
 * - `LOW`    — Insufficient EP API data; results are indicative only
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege), AU-002 (Audit Logging)
 */
export interface OsintStandardOutput {
  /**
   * Confidence level of this analysis based on data availability and quality.
   * - `HIGH`   — Full EP API data available
   * - `MEDIUM` — Partial data; indicative results
   * - `LOW`    — Insufficient data; treat with caution
   */
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';

  /**
   * Methodology description explaining how the analysis was computed,
   * including data sources, scoring models, and any limitations.
   */
  methodology: string;

  /**
   * Freshness indicator for the underlying data (e.g., real-time EP API
   * fetch timestamp or description of data currency).
   */
  dataFreshness: string;

  /**
   * Attribution to the European Parliament Open Data Portal and any other
   * data sources used in this analysis.
   */
  sourceAttribution: string;
}
