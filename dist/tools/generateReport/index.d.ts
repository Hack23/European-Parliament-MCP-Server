/**
 * MCP Tool: generate_report
 *
 * Generate analytical reports on European Parliament data
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */
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
export declare function handleGenerateReport(args: unknown): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
/**
 * Tool metadata for MCP registration
 */
export declare const generateReportToolMetadata: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            reportType: {
                type: string;
                description: string;
                enum: string[];
            };
            subjectId: {
                type: string;
                description: string;
                minLength: number;
                maxLength: number;
            };
            dateFrom: {
                type: string;
                description: string;
                pattern: string;
            };
            dateTo: {
                type: string;
                description: string;
                pattern: string;
            };
        };
        required: string[];
    };
};
//# sourceMappingURL=index.d.ts.map