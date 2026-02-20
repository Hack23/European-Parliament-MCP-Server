/**
 * Type definitions for report generation
 *
 * ISMS Policy: SC-002 (Input Validation)
 */
/**
 * Report structure
 */
export interface Report {
    reportType: string;
    subject: string;
    period: {
        from: string;
        to: string;
    };
    generatedAt: string;
    summary: string;
    sections: ReportSection[];
    statistics: Record<string, number | string>;
    recommendations?: string[];
}
/**
 * Report section structure
 */
export interface ReportSection {
    title: string;
    content: string;
    data?: Record<string, unknown>;
}
/**
 * Report type enumeration
 */
export type ReportType = 'MEP_ACTIVITY' | 'COMMITTEE_PERFORMANCE' | 'VOTING_STATISTICS' | 'LEGISLATION_PROGRESS';
//# sourceMappingURL=types.d.ts.map