/**
 * Report generators for different report types
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */
import type { z } from 'zod';
import type { GenerateReportSchema } from '../../schemas/europeanParliament.js';
import type { Report } from './types.js';
/**
 * Generate MEP activity report
 * Cyclomatic complexity: 2
 */
export declare function generateMEPActivityReport(params: z.infer<typeof GenerateReportSchema>): Promise<Report>;
/**
 * Generate committee performance report
 * Cyclomatic complexity: 2
 */
export declare function generateCommitteePerformanceReport(params: z.infer<typeof GenerateReportSchema>): Promise<Report>;
/**
 * Generate voting statistics report
 * Cyclomatic complexity: 1
 */
export declare function generateVotingStatisticsReport(params: z.infer<typeof GenerateReportSchema>): Promise<Report>;
/**
 * Generate legislation progress report
 * Cyclomatic complexity: 1
 */
export declare function generateLegislationProgressReport(params: z.infer<typeof GenerateReportSchema>): Promise<Report>;
//# sourceMappingURL=reportGenerators.d.ts.map