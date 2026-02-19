/**
 * MCP Tool: get_committee_info
 *
 * Retrieve European Parliament committee information
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */
/**
 * Get committee info tool handler
 *
 * @param args - Tool arguments
 * @returns MCP tool result with committee data
 *
 * @example
 * ```json
 * {
 *   "abbreviation": "ENVI"
 * }
 * ```
 */
export declare function handleGetCommitteeInfo(args: unknown): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
/**
 * Tool metadata for MCP registration
 */
export declare const getCommitteeInfoToolMetadata: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            id: {
                type: string;
                description: string;
                minLength: number;
                maxLength: number;
            };
            abbreviation: {
                type: string;
                description: string;
                minLength: number;
                maxLength: number;
            };
        };
    };
};
//# sourceMappingURL=getCommitteeInfo.d.ts.map