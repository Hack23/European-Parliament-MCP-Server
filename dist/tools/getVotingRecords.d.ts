/**
 * MCP Tool: get_voting_records
 *
 * Retrieve voting records from European Parliament plenary sessions
 *
 * **Intelligence Perspective:** Core intelligence product for voting pattern analysis,
 * political group cohesion measurement, cross-party alliance detection, and MEP
 * loyalty/independence scoring through structured analytic techniques.
 *
 * **Business Perspective:** High-value data product for political risk assessment firms,
 * policy analysis consultancies, and corporate government affairs departments.
 *
 * **Marketing Perspective:** Most compelling data for data journalism partnerships,
 * academic research collaborations, and transparency advocacy organizations.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */
/**
 * Get voting records tool handler
 *
 * @param args - Tool arguments
 * @returns MCP tool result with voting record data
 *
 * @example
 * ```json
 * {
 *   "sessionId": "PLENARY-2024-01",
 *   "topic": "Climate Change",
 *   "limit": 20
 * }
 * ```
 */
export declare function handleGetVotingRecords(args: unknown): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
/**
 * Tool metadata for MCP registration
 */
export declare const getVotingRecordsToolMetadata: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            sessionId: {
                type: string;
                description: string;
                minLength: number;
                maxLength: number;
            };
            mepId: {
                type: string;
                description: string;
                minLength: number;
                maxLength: number;
            };
            topic: {
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
            limit: {
                type: string;
                description: string;
                minimum: number;
                maximum: number;
                default: number;
            };
            offset: {
                type: string;
                description: string;
                minimum: number;
                default: number;
            };
        };
    };
};
//# sourceMappingURL=getVotingRecords.d.ts.map