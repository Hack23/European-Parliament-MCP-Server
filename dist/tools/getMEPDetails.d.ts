/**
 * MCP Tool: get_mep_details
 *
 * Retrieve detailed information about a specific MEP
 *
 * ISMS Policy: SC-002 (Input Validation), AU-002 (Audit Logging), GDPR Compliance
 */
/**
 * Get MEP details tool handler
 *
 * @param args - Tool arguments
 * @returns MCP tool result with detailed MEP data
 *
 * @example
 * ```json
 * {
 *   "id": "MEP-124810"
 * }
 * ```
 */
export declare function handleGetMEPDetails(args: unknown): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
/**
 * Tool metadata for MCP registration
 */
export declare const getMEPDetailsToolMetadata: {
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
        };
        required: string[];
    };
};
//# sourceMappingURL=getMEPDetails.d.ts.map