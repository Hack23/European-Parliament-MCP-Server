/**
 * MCP Tool: get_plenary_sessions
 *
 * Retrieve European Parliament plenary session information
 *
 * **Intelligence Perspective:** Critical for legislative monitoring, session activity tracking,
 * debate analysis, and identifying legislative priorities across parliamentary terms.
 *
 * **Business Perspective:** Enables real-time legislative tracking products for compliance
 * teams, regulatory affairs departments, and policy monitoring services.
 *
 * **Marketing Perspective:** Showcases live parliamentary data access—compelling for
 * journalists, media organizations, and civic tech platforms.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */
/**
 * Get plenary sessions tool handler
 *
 * @param args - Tool arguments
 * @returns MCP tool result with plenary session data
 *
 * @example
 * ```json
 * {
 *   "dateFrom": "2024-01-01",
 *   "dateTo": "2024-12-31",
 *   "limit": 20
 * }
 * ```
 */
export declare function handleGetPlenarySessions(args: unknown): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
/**
 * Tool metadata for MCP registration
 */
export declare const getPlenarySessionsToolMetadata: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
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
            location: {
                type: string;
                description: string;
                minLength: number;
                maxLength: number;
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
//# sourceMappingURL=getPlenarySessions.d.ts.map