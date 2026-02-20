/**
 * MCP Tool: track_legislation
 *
 * Track legislative procedure progress through European Parliament
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */
/**
 * Track legislation tool handler
 * Cyclomatic complexity: 2
 *
 * @param args - Tool arguments
 * @returns MCP tool result with legislative procedure tracking data
 *
 * @example
 * ```json
 * {
 *   "procedureId": "2024/0001(COD)"
 * }
 * ```
 */
export declare function handleTrackLegislation(args: unknown): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
/**
 * Tool metadata for MCP registration
 */
export declare const trackLegislationToolMetadata: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            procedureId: {
                type: string;
                description: string;
                minLength: number;
                maxLength: number;
            };
        };
        required: string[];
    };
};
//# sourceMappingURL=index.d.ts.map