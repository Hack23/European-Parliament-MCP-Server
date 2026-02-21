/**
 * MCP Tool: get_mep_details
 *
 * Retrieve detailed information about a specific MEP
 *
 * **Intelligence Perspective:** Enables deep-dive MEP profiling including voting statistics,
 * committee memberships, political group alignment, and behavioral pattern analysis for
 * individual actor intelligence assessments.
 *
 * **Business Perspective:** Powers premium MEP profile products for corporate affairs teams,
 * lobbyists, and political consultancies requiring comprehensive stakeholder intelligence.
 *
 * **Marketing Perspective:** Demonstrates depth of EP data access—key differentiator
 * for attracting enterprise customers and academic researchers.
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