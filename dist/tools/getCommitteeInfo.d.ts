/**
 * MCP Tool: get_committee_info
 *
 * Retrieve European Parliament committee information
 *
 * **Intelligence Perspective:** Maps committee power structures, membership networks,
 * and policy domain specialization for institutional analysis and influence mapping.
 *
 * **Business Perspective:** Powers committee monitoring products for industry associations,
 * trade groups, and corporate government affairs tracking specific policy areas.
 *
 * **Marketing Perspective:** Highlights structured access to EP's 20+ standing committees—
 * compelling for policy monitoring platforms and civic tech integrations.
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