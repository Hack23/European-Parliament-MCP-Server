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
/**
 * Branded type for compile-time type safety.
 * Prevents mixing of different ID types at compile time.
 *
 * @template K - The base type (e.g., string, number)
 * @template T - The brand identifier (e.g., 'MEPID', 'SessionID')
 *
 * @example
 * ```typescript
 * type UserID = Brand<number, 'UserID'>;
 * type ProductID = Brand<number, 'ProductID'>;
 *
 * const userId: UserID = 123 as UserID;
 * const productId: ProductID = 456 as ProductID;
 *
 * // This will cause a compile-time error:
 * // userId = productId; // Error: Type 'ProductID' is not assignable to type 'UserID'
 * ```
 */
export type Brand<K, T> = K & {
    __brand: T;
};
/**
 * MEP ID - unique identifier for Members of European Parliament
 *
 * Format: Numeric string (e.g., "124936")
 * Source: European Parliament Open Data Portal
 *
 * @example
 * ```typescript
 * const mepId: MEPID = createMEPID("124936");
 * const mepDetails = await getMEPDetails(mepId);
 * ```
 */
export type MEPID = Brand<string, 'MEPID'>;
/**
 * Plenary Session ID
 *
 * Format: Alphanumeric with hyphens (e.g., "P9-2024-11-20")
 * Source: European Parliament Open Data Portal
 *
 * @example
 * ```typescript
 * const sessionId: SessionID = createSessionID("P9-2024-11-20");
 * const sessionData = await getPlenarySession(sessionId);
 * ```
 */
export type SessionID = Brand<string, 'SessionID'>;
/**
 * Committee ID
 *
 * Format: Alphanumeric abbreviation (e.g., "DEVE", "ENVI")
 * Source: European Parliament Open Data Portal
 *
 * @example
 * ```typescript
 * const committeeId: CommitteeID = createCommitteeID("DEVE");
 * const committeeInfo = await getCommitteeInfo(committeeId);
 * ```
 */
export type CommitteeID = Brand<string, 'CommitteeID'>;
/**
 * Document ID
 *
 * Format: Document reference (e.g., "A9-2024/0123")
 * Source: European Parliament Open Data Portal
 *
 * @example
 * ```typescript
 * const docId: DocumentID = createDocumentID("A9-2024/0123");
 * const document = await getDocument(docId);
 * ```
 */
export type DocumentID = Brand<string, 'DocumentID'>;
/**
 * Political Group ID
 *
 * Format: Group abbreviation (e.g., "EPP", "S&D", "Renew")
 * Source: European Parliament Open Data Portal
 *
 * @example
 * ```typescript
 * const groupId: GroupID = createGroupID("EPP");
 * const members = await getGroupMembers(groupId);
 * ```
 */
export type GroupID = Brand<string, 'GroupID'>;
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
export declare function isMEPID(value: string): value is MEPID;
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
export declare function isSessionID(value: string): value is SessionID;
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
export declare function isCommitteeID(value: string): value is CommitteeID;
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
export declare function isDocumentID(value: string): value is DocumentID;
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
export declare function isGroupID(value: string): value is GroupID;
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
export declare function createMEPID(value: string): MEPID;
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
export declare function createSessionID(value: string): SessionID;
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
export declare function createCommitteeID(value: string): CommitteeID;
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
export declare function createDocumentID(value: string): DocumentID;
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
export declare function createGroupID(value: string): GroupID;
//# sourceMappingURL=branded.d.ts.map