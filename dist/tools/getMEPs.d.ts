/**
 * MCP Tool: get_meps
 *
 * Retrieve Members of European Parliament with filtering options
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */
/**
 * Get MEPs tool handler
 *
 * @param args - Tool arguments
 * @returns MCP tool result with MEP data
 *
 * @example
 * ```json
 * {
 *   "country": "SE",
 *   "limit": 10
 * }
 * ```
 */
export declare function handleGetMEPs(args: unknown): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
/**
 * Tool metadata for MCP registration
 */
export declare const getMEPsToolMetadata: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            country: {
                type: string;
                description: string;
                pattern: string;
                minLength: number;
                maxLength: number;
            };
            group: {
                type: string;
                description: string;
                minLength: number;
                maxLength: number;
            };
            committee: {
                type: string;
                description: string;
                minLength: number;
                maxLength: number;
            };
            active: {
                type: string;
                description: string;
                default: boolean;
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
//# sourceMappingURL=getMEPs.d.ts.map