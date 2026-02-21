/**
 * MCP Tool: get_meps
 *
 * Retrieve Members of European Parliament with filtering options
 *
 * **Intelligence Perspective:** Foundation for MEP profiling, political group cohesion analysis,
 * national delegation mapping, and cross-party alliance detection via OSINT methodologies.
 *
 * **Business Perspective:** Core data product for B2G/B2B customers requiring MEP contact
 * databases, political risk assessments, and stakeholder mapping services.
 *
 * **Marketing Perspective:** Primary showcase tool demonstrating API value proposition
 * to journalists, researchers, and civic tech developers seeking structured MEP data.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */
/**
 * Get MEPs tool handler
 *
 * Retrieves MEP data with filtering, validation, and GDPR-compliant response formatting.
 *
 * **Intelligence Use Cases:** Filter by country for national delegation analysis, by group for
 * cohesion studies, by committee for policy domain expertise mapping.
 *
 * **Business Use Cases:** Power stakeholder mapping products, political risk dashboards,
 * and MEP engagement tracking for corporate affairs teams.
 *
 * **Marketing Use Cases:** Demo-ready endpoint for showcasing EP data access to potential
 * API consumers, journalists, and civic tech developers.
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