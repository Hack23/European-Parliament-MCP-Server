/**
 * Shared types and interfaces for MCP tool implementations
 *
 * This module provides the common types used across all tool handlers,
 * including the standard MCP tool result format and OSINT standard output fields.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

/**
 * Standard MCP tool result format
 *
 * Every tool handler returns this structure, containing one or more content
 * blocks. Each block carries its MIME type and serialised payload.
 */
export interface ToolResult {
  content: { type: 'text'; text: string }[];
  isError?: boolean;
}

/**
 * Standard OSINT output fields that every analysis tool must include.
 *
 * These fields ensure every tool response carries metadata about its
 * reliability, methodology, data currency, and provenance — critical
 * for intelligence consumers who need to assess source quality.
 *
 * Aligns with:
 * - ISMS Policy A.8.11 (Data integrity)
 * - GDPR Article 5(1)(d) (Accuracy)
 * - FUTURE_ARCHITECTURE.md OSINT standard output specification
 */
export interface OsintStandardOutput {
  /**
   * Confidence level of the analysis: HIGH, MEDIUM, or LOW.
   * Derived from the volume and quality of underlying data.
   */
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';

  /**
   * Description of the analytical methodology used to produce this output.
   */
  methodology: string;

  /**
   * Human-readable indicator of how recent the underlying data is.
   */
  dataFreshness: string;

  /**
   * Attribution string identifying the European Parliament Open Data Portal
   * data sources used in this analysis.
   */
  sourceAttribution: string;

  /**
   * Explicit warnings about data quality issues, unavailable metrics,
   * or limitations that affect the reliability of this analysis.
   * Empty array when all data is available and reliable.
   *
   * ISMS Policy: A.8.11 (Data integrity), GDPR Article 5(1)(d) (Accuracy)
   */
  dataQualityWarnings: string[];
}
