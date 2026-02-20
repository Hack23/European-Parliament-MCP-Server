/**
 * Branded Types for European Parliament MCP Server
 *
 * Branded types provide compile-time type safety by preventing mixing of different ID types.
 * These types ensure that MEP IDs, Session IDs, and other identifiers cannot be accidentally
 * confused or used interchangeably at compile time.
 *
 * @see https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md
 * @see https://github.com/Hack23/European-Parliament-MCP-Server
 */
// Type Guards
/**
 * Type guard to check if a string is a valid MEP ID
 *
 * @param value - String to validate
 * @returns true if the value matches MEP ID format (numeric string)
 *
 * @example
 * ```typescript
 * if (isMEPID("124936")) {
 *   const id = "124936" as MEPID;
 * }
 * ```
 */
export function isMEPID(value) {
    // MEP IDs are numeric strings
    return /^[0-9]+$/.test(value);
}
/**
 * Type guard to check if a string is a valid Session ID
 *
 * @param value - String to validate
 * @returns true if the value matches Session ID format
 *
 * @example
 * ```typescript
 * if (isSessionID("P9-2024-11-20")) {
 *   const id = "P9-2024-11-20" as SessionID;
 * }
 * ```
 */
export function isSessionID(value) {
    // Session IDs follow pattern: P{parliament}-YYYY-MM-DD
    return /^P\d+-\d{4}-\d{2}-\d{2}$/.test(value);
}
/**
 * Type guard to check if a string is a valid Committee ID
 *
 * @param value - String to validate
 * @returns true if the value matches Committee ID format
 *
 * @example
 * ```typescript
 * if (isCommitteeID("DEVE")) {
 *   const id = "DEVE" as CommitteeID;
 * }
 * ```
 */
export function isCommitteeID(value) {
    // Committee IDs are uppercase alphanumeric abbreviations (2-6 chars)
    return /^[A-Z]{2,6}$/.test(value);
}
/**
 * Type guard to check if a string is a valid Document ID
 *
 * @param value - String to validate
 * @returns true if the value matches Document ID format
 *
 * @example
 * ```typescript
 * if (isDocumentID("A9-2024/0123")) {
 *   const id = "A9-2024/0123" as DocumentID;
 * }
 * ```
 */
export function isDocumentID(value) {
    // Document IDs follow pattern: A{parliament}-YYYY/NNNN
    return /^[A-Z]\d+-\d{4}\/\d{4}$/.test(value);
}
/**
 * Type guard to check if a string is a valid Political Group ID
 *
 * @param value - String to validate
 * @returns true if the value matches Group ID format
 *
 * @example
 * ```typescript
 * if (isGroupID("EPP")) {
 *   const id = "EPP" as GroupID;
 * }
 * ```
 */
export function isGroupID(value) {
    // Group IDs are known abbreviations
    const validGroups = ['EPP', 'S&D', 'Renew', 'Greens/EFA', 'ECR', 'ID', 'The Left', 'NI'];
    return validGroups.includes(value);
}
// Factory Functions
/**
 * Factory function to create a validated MEP ID
 *
 * @param value - String to convert to MEP ID
 * @returns Branded MEP ID
 * @throws {Error} If value is not a valid MEP ID format
 *
 * @example
 * ```typescript
 * const mepId = createMEPID("124936");
 * const details = await getMEPDetails(mepId);
 * ```
 *
 * @security Input validation prevents injection attacks
 */
export function createMEPID(value) {
    if (!isMEPID(value)) {
        throw new Error(`Invalid MEP ID format: ${value}. Must be numeric string.`);
    }
    return value;
}
/**
 * Factory function to create a validated Session ID
 *
 * @param value - String to convert to Session ID
 * @returns Branded Session ID
 * @throws {Error} If value is not a valid Session ID format
 *
 * @example
 * ```typescript
 * const sessionId = createSessionID("P9-2024-11-20");
 * const session = await getPlenarySession(sessionId);
 * ```
 *
 * @security Input validation prevents injection attacks
 */
export function createSessionID(value) {
    if (!isSessionID(value)) {
        throw new Error(`Invalid Session ID format: ${value}. Expected format: P{parliament}-YYYY-MM-DD`);
    }
    return value;
}
/**
 * Factory function to create a validated Committee ID
 *
 * @param value - String to convert to Committee ID
 * @returns Branded Committee ID
 * @throws {Error} If value is not a valid Committee ID format
 *
 * @example
 * ```typescript
 * const committeeId = createCommitteeID("DEVE");
 * const info = await getCommitteeInfo(committeeId);
 * ```
 *
 * @security Input validation prevents injection attacks
 */
export function createCommitteeID(value) {
    if (!isCommitteeID(value)) {
        throw new Error(`Invalid Committee ID format: ${value}. Must be 2-6 uppercase letters.`);
    }
    return value;
}
/**
 * Factory function to create a validated Document ID
 *
 * @param value - String to convert to Document ID
 * @returns Branded Document ID
 * @throws {Error} If value is not a valid Document ID format
 *
 * @example
 * ```typescript
 * const docId = createDocumentID("A9-2024/0123");
 * const doc = await getDocument(docId);
 * ```
 *
 * @security Input validation prevents injection attacks
 */
export function createDocumentID(value) {
    if (!isDocumentID(value)) {
        throw new Error(`Invalid Document ID format: ${value}. Expected format: A{parliament}-YYYY/NNNN`);
    }
    return value;
}
/**
 * Factory function to create a validated Political Group ID
 *
 * @param value - String to convert to Group ID
 * @returns Branded Group ID
 * @throws {Error} If value is not a valid Group ID
 *
 * @example
 * ```typescript
 * const groupId = createGroupID("EPP");
 * const members = await getGroupMembers(groupId);
 * ```
 *
 * @security Input validation prevents injection attacks
 */
export function createGroupID(value) {
    if (!isGroupID(value)) {
        throw new Error(`Invalid Political Group ID: ${value}. Must be a known group abbreviation.`);
    }
    return value;
}
//# sourceMappingURL=branded.js.map