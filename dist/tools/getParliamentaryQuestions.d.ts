/**
 * MCP Tool: get_parliamentary_questions
 *
 * Retrieve European Parliament questions and answers
 *
 * **Intelligence Perspective:** Reveals MEP policy priorities, Commission/Council scrutiny
 * patterns, and emerging political concerns through question topic analysis and frequency.
 *
 * **Business Perspective:** Enables regulatory early-warning products—questions often signal
 * upcoming policy initiatives, making this valuable for compliance and government affairs.
 *
 * **Marketing Perspective:** Unique dataset showcasing democratic accountability—ideal
 * for transparency advocates, investigative journalists, and academic researchers.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */
/**
 * Get parliamentary questions tool handler
 *
 * @param args - Tool arguments
 * @returns MCP tool result with parliamentary question data
 *
 * @example
 * ```json
 * {
 *   "type": "WRITTEN",
 *   "status": "ANSWERED",
 *   "topic": "climate policy",
 *   "limit": 20
 * }
 * ```
 */
export declare function handleGetParliamentaryQuestions(args: unknown): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
/**
 * Tool metadata for MCP registration
 */
export declare const getParliamentaryQuestionsToolMetadata: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            type: {
                type: string;
                description: string;
                enum: string[];
            };
            author: {
                type: string;
                description: string;
                minLength: number;
                maxLength: number;
            };
            topic: {
                type: string;
                description: string;
                minLength: number;
                maxLength: number;
            };
            status: {
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
//# sourceMappingURL=getParliamentaryQuestions.d.ts.map