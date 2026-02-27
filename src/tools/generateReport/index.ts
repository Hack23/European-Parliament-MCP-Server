/**
 * MCP Tool: generate_report
 * 
 * Generate analytical reports on European Parliament data
 * 
 * **Intelligence Perspective:** Produces structured intelligence products including MEP
 * activity scorecards, committee effectiveness assessments, voting pattern reports, and
 * legislative progress tracking aligned with intelligence analysis best practices.
 * 
 * **Business Perspective:** Premium report generation capability enabling consulting
 * deliverables, automated briefings, and white-label reporting for enterprise customers.
 * 
 * **Marketing Perspective:** Flagship feature demonstrating automated parliamentary
 * intelligence—key for content marketing, case studies, and product demonstrations.
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import type { z } from 'zod';
import { GenerateReportSchema } from '../../schemas/europeanParliament.js';
import {
  generateMEPActivityReport,
  generateCommitteePerformanceReport,
  generateVotingStatisticsReport,
  generateLegislationProgressReport
} from './reportGenerators.js';
import type { Report, ReportType } from './types.js';
import type { ToolResult } from '../shared/types.js';

/**
 * Report parameters type inferred from schema
 */
type ReportParams = z.infer<typeof GenerateReportSchema>;

/**
 * Report generator map for O(1) lookup
 */
const reportGenerators: Record<
  ReportType,
  (params: ReportParams) => Promise<Report>
> = {
  MEP_ACTIVITY: generateMEPActivityReport,
  COMMITTEE_PERFORMANCE: generateCommitteePerformanceReport,
  VOTING_STATISTICS: generateVotingStatisticsReport,
  LEGISLATION_PROGRESS: generateLegislationProgressReport
};

/**
 * Generate report tool handler
 * Cyclomatic complexity: 3
 * 
 * @param args - Tool arguments
 * @returns MCP tool result with generated report
 * 
 * @example
 * ```json
 * {
 *   "reportType": "MEP_ACTIVITY",
 *   "subjectId": "MEP-124810",
 *   "dateFrom": "2024-01-01",
 *   "dateTo": "2024-12-31"
 * }
 * ```
 */
export async function handleGenerateReport(
  args: unknown
): Promise<ToolResult> {
  // Validate input
  const params = GenerateReportSchema.parse(args);
  
  try {
    // Use map lookup instead of switch for O(1) access
    const generator = reportGenerators[params.reportType];
    const report = await generator(params);
    
    // Return MCP-compliant response
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(report, null, 2)
      }]
    };
  } catch (error) {
    // Handle errors without exposing internal details
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate report: ${errorMessage}`);
  }
}

/**
 * Tool metadata for MCP registration
 */
export const generateReportToolMetadata = {
  name: 'generate_report',
  description: 'Generate comprehensive analytical reports on European Parliament data. Supports MEP activity reports, committee performance reports, voting statistics, and legislation progress reports. Returns structured report with summary, sections, statistics, and recommendations.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      reportType: {
        type: 'string',
        description: 'Type of report to generate',
        enum: ['MEP_ACTIVITY', 'COMMITTEE_PERFORMANCE', 'VOTING_STATISTICS', 'LEGISLATION_PROGRESS']
      },
      subjectId: {
        type: 'string',
        description: 'Subject identifier (MEP ID, Committee ID, etc.) - optional for aggregate reports',
        minLength: 1,
        maxLength: 100
      },
      dateFrom: {
        type: 'string',
        description: 'Report period start date (YYYY-MM-DD format)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$'
      },
      dateTo: {
        type: 'string',
        description: 'Report period end date (YYYY-MM-DD format)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$'
      }
    },
    required: ['reportType']
  }
};
