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
export declare function handleAnalyzeVotingPatterns(args: unknown): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
/**
 * Tool metadata for MCP registration
 */
export declare const analyzeVotingPatternsToolMetadata: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            mepId: {
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
            compareWithGroup: {
                type: string;
                description: string;
                default: boolean;
            };
        };
        required: string[];
    };
};
//# sourceMappingURL=analyzeVotingPatterns.d.ts.map