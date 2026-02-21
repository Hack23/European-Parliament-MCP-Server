/**
 * MCP Tool: track_legislation
 *
 * Track legislative procedure progress through European Parliament
 *
 * **Intelligence Perspective:** Enables real-time legislative pipeline monitoring,
 * procedure stage analysis, and trilogue outcome tracking for strategic intelligence
 * on EU regulatory developments and policy trajectory forecasting.
 *
 * **Business Perspective:** Core compliance monitoring product—essential for enterprises
 * tracking regulatory changes, industry associations monitoring sector-specific legislation.
 *
 * **Marketing Perspective:** Demonstrates end-to-end legislative tracking capability—
 * differentiator for RegTech market and EU affairs consultancy customer acquisition.
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