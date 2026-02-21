/**
 * MCP Tool: search_documents
 *
 * Search European Parliament legislative documents
 *
 * **Intelligence Perspective:** Essential for legislative monitoring, policy tracking,
 * amendment analysis, and building intelligence products around EU regulatory developments.
 *
 * **Business Perspective:** Enables document search products for legal firms, compliance
 * teams, and regulatory intelligence services requiring legislative text access.
 *
 * **Marketing Perspective:** Demonstrates comprehensive document search capability—
 * key for attracting legal tech, RegTech, and policy research customer segments.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */
/**
 * Search documents tool handler
 *
 * @param args - Tool arguments
 * @returns MCP tool result with document data
 *
 * @example
 * ```json
 * {
 *   "keyword": "climate change",
 *   "documentType": "REPORT",
 *   "dateFrom": "2024-01-01",
 *   "limit": 20
 * }
 * ```
 */
export declare function handleSearchDocuments(args: unknown): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
/**
 * Tool metadata for MCP registration
 */
export declare const searchDocumentsToolMetadata: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            keyword: {
                type: string;
                description: string;
                minLength: number;
                maxLength: number;
                pattern: string;
            };
            documentType: {
                type: string;
                description: string;
                enum: string[];
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
            committee: {
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
        required: string[];
    };
};
//# sourceMappingURL=searchDocuments.d.ts.map