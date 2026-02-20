/**
 * Zod validation schemas for European Parliament data
 *
 * These schemas validate the simplified/transformed data from our client,
 * not the raw JSON-LD API responses. The client (europeanParliamentClient.ts)
 * transforms complex EP API structures to these simplified schemas.
 *
 * ISMS Policy: SC-002 (Input Validation), SI-10 (Information Input Validation)
 * EP API Documentation: https://data.europarl.europa.eu/en/developer-corner
 *
 * @see docs/EP_API_SCHEMA_GAP_ANALYSIS.md - Real API structure analysis
 * @see src/clients/europeanParliamentClient.ts - Data transformation logic
 */
import { z } from 'zod';
// ============================================================================
// Branded Types for Type Safety
// ============================================================================
/**
 * Branded type for MEP identifiers
 *
 * Prevents mixing different ID types at compile time.
 * Example: Can't accidentally use DocumentId as MEPId
 *
 * ISMS Policy: SC-002 (Type Safety)
 *
 * @example
 * ```typescript
 * const mepId: MEPId = MEPIdSchema.parse(12345);
 * const mep = await getMEP(mepId); // Type safe!
 * ```
 */
export const MEPIdSchema = z.union([
    z.number().int().positive(),
    z.string().min(1).max(100)
]).brand();
/**
 * Branded type for session identifiers
 *
 * ISMS Policy: SC-002 (Type Safety)
 */
export const SessionIdSchema = z.string()
    .min(1, "Session ID cannot be empty")
    .max(100, "Session ID too long (max 100 characters)")
    .brand();
/**
 * Branded type for document identifiers
 *
 * Supports both simple IDs and ELI (European Legislation Identifier) format
 *
 * ISMS Policy: SC-002 (Type Safety)
 *
 * @example
 * ```typescript
 * // Simple ID
 * const docId = DocumentIdSchema.parse("12345");
 *
 * // ELI format
 * const eliId = DocumentIdSchema.parse("eli/dl/doc/A-10-0034-0034");
 * ```
 */
export const DocumentIdSchema = z.string()
    .min(1, "Document ID cannot be empty")
    .max(200, "Document ID too long (max 200 characters)")
    .brand();
/**
 * Branded type for committee identifiers
 *
 * ISMS Policy: SC-002 (Type Safety)
 */
export const CommitteeIdSchema = z.string()
    .min(1, "Committee ID cannot be empty")
    .max(100, "Committee ID too long (max 100 characters)")
    .brand();
/**
 * Branded type for voting record identifiers
 *
 * ISMS Policy: SC-002 (Type Safety)
 */
export const VotingRecordIdSchema = z.string()
    .min(1, "Voting record ID cannot be empty")
    .max(200, "Voting record ID too long (max 200 characters)")
    .brand();
/**
 * Branded type for question identifiers
 *
 * ISMS Policy: SC-002 (Type Safety)
 */
export const QuestionIdSchema = z.string()
    .min(1, "Question ID cannot be empty")
    .max(200, "Question ID too long (max 200 characters)")
    .brand();
// ============================================================================
// Common Validation Schemas
// ============================================================================
/**
 * ISO 3166-1 alpha-2 country code validation
 *
 * Validates EU member state codes.
 *
 * @example "SE", "DE", "FR"
 */
const CountryCodeSchema = z.string()
    .length(2, "Country code must be exactly 2 characters")
    .regex(/^[A-Z]{2}$/, 'Country code must be 2 uppercase letters')
    .describe('ISO 3166-1 alpha-2 country code (e.g., "SE")');
/**
 * Date validation (YYYY-MM-DD format)
 *
 * ISO 8601 date format without time component.
 *
 * @example "2024-01-15"
 */
const DateStringSchema = z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .describe('Date in YYYY-MM-DD format');
// ============================================================================
// MEP (Member of European Parliament) Schemas
// ============================================================================
/**
 * Political group schema (structured format)
 *
 * Represents a European Parliament political group with code and full name.
 *
 * @example
 * ```typescript
 * {
 *   code: "S&D",
 *   name: "Progressive Alliance of Socialists and Democrats"
 * }
 * ```
 */
export const PoliticalGroupSchema = z.object({
    code: z.string()
        .min(1, "Political group code cannot be empty")
        .max(20, "Political group code too long (max 20 characters)")
        .describe('Political group abbreviation (e.g., "S&D", "PPE")'),
    name: z.string()
        .min(1, "Political group name cannot be empty")
        .max(200, "Political group name too long (max 200 characters)")
        .describe('Full political group name')
});
/**
 * Committee membership schema (structured format)
 *
 * Represents MEP membership in a committee with role and dates.
 *
 * @example
 * ```typescript
 * {
 *   committeeId: "ECON",
 *   committeeName: "Economic and Monetary Affairs",
 *   role: "Member",
 *   startDate: "2019-07-02",
 *   endDate: "2024-07-16"
 * }
 * ```
 */
export const CommitteeMembershipSchema = z.object({
    committeeId: CommitteeIdSchema,
    committeeName: z.string()
        .min(1)
        .max(200)
        .optional()
        .describe('Committee full name'),
    role: z.string()
        .min(1)
        .max(100)
        .optional()
        .describe('Role in committee (e.g., "Member", "Chair", "Vice-Chair")'),
    startDate: DateStringSchema.optional()
        .describe('Membership start date'),
    endDate: DateStringSchema.optional()
        .describe('Membership end date')
});
/**
 * Get MEPs input schema
 *
 * Query parameters for fetching MEP list.
 *
 * ISMS Policy: SC-002 (Input Validation)
 */
export const GetMEPsSchema = z.object({
    country: CountryCodeSchema.optional()
        .describe('Filter by country (ISO 3166-1 alpha-2)'),
    group: z.string()
        .min(1, "Political group identifier cannot be empty")
        .max(50, "Political group identifier too long (max 50 characters)")
        .optional()
        .describe('Political group identifier'),
    committee: z.string()
        .min(1, "Committee identifier cannot be empty")
        .max(100, "Committee identifier too long (max 100 characters)")
        .optional()
        .describe('Committee identifier'),
    active: z.boolean()
        .default(true)
        .describe('Filter by active status'),
    limit: z.number()
        .int("Limit must be an integer")
        .min(1, "Limit must be at least 1")
        .max(100, "Limit cannot exceed 100")
        .default(50)
        .describe('Maximum results to return'),
    offset: z.number()
        .int("Offset must be an integer")
        .min(0, "Offset cannot be negative")
        .default(0)
        .describe('Pagination offset')
});
/**
 * Get MEP details input schema
 *
 * ISMS Policy: SC-002 (Input Validation)
 */
export const GetMEPDetailsSchema = z.object({
    id: z.string()
        .min(1, "MEP ID cannot be empty")
        .max(100, "MEP ID too long (max 100 characters)")
        .describe('MEP identifier')
});
/**
 * MEP (Member of European Parliament) output schema
 *
 * Represents a Member of the European Parliament with basic information.
 *
 * **Backward Compatibility:**
 * - `politicalGroup` accepts both string (legacy) and structured object
 * - `committees` accepts both string array (legacy) and CommitteeMembership array
 *
 * **GDPR Compliance:**
 * - Personal data fields (email, phone, birthDate) are optional
 * - Source: European Parliament public open data
 * - Legal basis: Legitimate interest (public representatives)
 *
 * ISMS Policy: SC-002 (Data Validation), PR-001 (Privacy by Design)
 *
 * @example
 * ```typescript
 * // Legacy format (backward compatible)
 * {
 *   id: "person/12345",
 *   name: "Jane Doe",
 *   country: "SE",
 *   politicalGroup: "S&D",
 *   committees: ["ECON", "BUDG"],
 *   active: true,
 *   termStart: "2019-07-02"
 * }
 *
 * // New structured format
 * {
 *   id: "person/12345",
 *   firstName: "Jane",
 *   lastName: "Doe",
 *   name: "Jane Doe",
 *   birthDate: "1975-03-15",
 *   nationality: "SE",
 *   country: "SE",
 *   politicalGroup: {
 *     code: "S&D",
 *     name: "Progressive Alliance of Socialists and Democrats"
 *   },
 *   committees: [
 *     {
 *       committeeId: "ECON",
 *       committeeName: "Economic and Monetary Affairs",
 *       role: "Member"
 *     }
 *   ],
 *   photoUrl: "https://example.com/photo.jpg",
 *   email: "jane.doe@europarl.europa.eu",
 *   phone: "+32 2 28 xxxxx",
 *   active: true,
 *   termStart: "2019-07-02",
 *   termEnd: "2024-07-16"
 * }
 * ```
 */
export const MEPSchema = z.object({
    id: z.string()
        .min(1, "MEP ID cannot be empty")
        .describe('MEP identifier (e.g., "person/12345")'),
    // Name fields
    name: z.string()
        .min(1, "Name cannot be empty")
        .describe('Full name (formatted)'),
    firstName: z.string()
        .min(1)
        .max(100)
        .optional()
        .describe('First/given name'),
    lastName: z.string()
        .min(1)
        .max(100)
        .optional()
        .describe('Last/family name'),
    // Personal information (GDPR: public representatives data)
    birthDate: DateStringSchema.optional()
        .describe('Date of birth (GDPR: public data for elected officials)'),
    nationality: CountryCodeSchema.optional()
        .describe('Nationality/citizenship'),
    photoUrl: z.url({ message: "Photo URL must be valid" })
        .optional()
        .describe('Profile photo URL'),
    // Country and political affiliation
    country: z.string()
        .min(1, "Country cannot be empty")
        .describe('Country of representation'),
    // Support both string (legacy) and structured format
    politicalGroup: z.union([
        z.string().min(1),
        PoliticalGroupSchema
    ]).describe('Political group (string for backward compatibility, object for structured data)'),
    // Support both string array (legacy) and structured format
    committees: z.union([
        z.array(z.string()),
        z.array(CommitteeMembershipSchema)
    ]).default([])
        .describe('Committee memberships (string array for backward compatibility, object array for structured data)'),
    // Contact information (GDPR: public contact for elected officials)
    email: z.email({ message: 'Invalid email format' })
        .optional()
        .describe('Official email address (GDPR: public contact)'),
    phone: z.string()
        .min(1)
        .max(50)
        .optional()
        .describe('Official phone number (GDPR: public contact)'),
    // Status and term
    active: z.boolean()
        .describe('Whether MEP is currently active'),
    termStart: z.string()
        .min(1, "Term start cannot be empty")
        .describe('Term start date or description'),
    termEnd: z.string()
        .optional()
        .describe('Term end date (if applicable)')
});
/**
 * Voting statistics schema
 *
 * Aggregated voting behavior statistics for an MEP.
 *
 * @example
 * ```typescript
 * {
 *   totalVotes: 1250,
 *   votesFor: 820,
 *   votesAgainst: 300,
 *   abstentions: 130,
 *   attendanceRate: 92.5
 * }
 * ```
 */
const VotingStatisticsSchema = z.object({
    totalVotes: z.number()
        .int("Total votes must be an integer")
        .min(0, "Total votes cannot be negative")
        .describe('Total number of votes cast'),
    votesFor: z.number()
        .int("Votes for must be an integer")
        .min(0, "Votes for cannot be negative")
        .describe('Number of FOR votes'),
    votesAgainst: z.number()
        .int("Votes against must be an integer")
        .min(0, "Votes against cannot be negative")
        .describe('Number of AGAINST votes'),
    abstentions: z.number()
        .int("Abstentions must be an integer")
        .min(0, "Abstentions cannot be negative")
        .describe('Number of abstentions'),
    attendanceRate: z.number()
        .min(0, "Attendance rate cannot be negative")
        .max(100, "Attendance rate cannot exceed 100%")
        .describe('Attendance rate as percentage (0-100)')
});
/**
 * MEP details output schema
 *
 * Extended MEP information including biography, social media, and voting statistics.
 *
 * **GDPR Compliance:**
 * - All personal data fields are from public EP sources
 * - Legal basis: Legitimate interest (public representatives)
 * - Social media: Publicly shared by MEPs
 *
 * ISMS Policy: SC-002 (Data Validation), PR-001 (Privacy by Design)
 *
 * @example
 * ```typescript
 * {
 *   ...basicMEPInfo,
 *   biography: "Born in Stockholm, Sweden...",
 *   phone: "+32 2 28 xxxxx",
 *   address: "European Parliament, Brussels",
 *   website: "https://example.com",
 *   twitter: "@janedoe_ep",
 *   facebook: "janedoe.ep",
 *   votingStatistics: {
 *     totalVotes: 1250,
 *     votesFor: 820,
 *     votesAgainst: 300,
 *     abstentions: 130,
 *     attendanceRate: 92.5
 *   },
 *   roles: ["Member of ECON", "Substitute member of BUDG"]
 * }
 * ```
 */
export const MEPDetailsSchema = MEPSchema.extend({
    biography: z.string()
        .optional()
        .describe('Biography and background information'),
    phone: z.string()
        .optional()
        .describe('Official phone number'),
    address: z.string()
        .optional()
        .describe('Official address'),
    website: z.url({ message: 'Invalid URL format' })
        .optional()
        .describe('Personal or official website URL'),
    twitter: z.string()
        .optional()
        .describe('Twitter/X handle'),
    facebook: z.string()
        .optional()
        .describe('Facebook profile'),
    votingStatistics: VotingStatisticsSchema.optional()
        .describe('Aggregated voting behavior statistics'),
    roles: z.array(z.string())
        .optional()
        .describe('Additional roles and responsibilities')
});
// ============================================================================
// Plenary Session Schemas
// ============================================================================
/**
 * Session type enum
 *
 * Different types of European Parliament sessions.
 */
export const SessionTypeSchema = z.enum([
    'PLENARY',
    'COMMITTEE',
    'EXTRAORDINARY',
    'SPECIAL'
]);
/**
 * Session status enum
 *
 * Current status of a parliamentary session.
 */
export const SessionStatusSchema = z.enum([
    'SCHEDULED',
    'ONGOING',
    'COMPLETED',
    'CANCELLED',
    'POSTPONED'
]);
/**
 * Get plenary sessions input schema
 *
 * Query parameters for fetching plenary session list.
 *
 * ISMS Policy: SC-002 (Input Validation)
 */
export const GetPlenarySessionsSchema = z.object({
    dateFrom: DateStringSchema.optional()
        .describe('Filter sessions from this date (inclusive)'),
    dateTo: DateStringSchema.optional()
        .describe('Filter sessions to this date (inclusive)'),
    location: z.string()
        .min(1, "Location cannot be empty")
        .max(100, "Location too long (max 100 characters)")
        .optional()
        .describe('Session location (e.g., "Strasbourg", "Brussels")'),
    limit: z.number()
        .int("Limit must be an integer")
        .min(1, "Limit must be at least 1")
        .max(100, "Limit cannot exceed 100")
        .default(50)
        .describe('Maximum results to return'),
    offset: z.number()
        .int("Offset must be an integer")
        .min(0, "Offset cannot be negative")
        .default(0)
        .describe('Pagination offset')
}).refine((data) => {
    if (data.dateFrom != null && data.dateTo != null && data.dateFrom !== '' && data.dateTo !== '') {
        return new Date(data.dateFrom) <= new Date(data.dateTo);
    }
    return true;
}, {
    message: "dateFrom must be before or equal to dateTo",
    path: ['dateFrom']
});
/**
 * Plenary session output schema
 *
 * Represents a plenary session of the European Parliament.
 *
 * **Enhanced Fields:**
 * - `endDate`: Session end date (multi-day sessions)
 * - `sessionType`: Type of session (PLENARY, COMMITTEE, etc.)
 * - `term`: Parliamentary term number
 * - `streamingUrl`: Live stream URL
 * - `status`: Current session status
 *
 * ISMS Policy: SC-002 (Data Validation)
 *
 * @example
 * ```typescript
 * {
 *   id: "MTG-PL-2024-01-15",
 *   date: "2024-01-15",
 *   endDate: "2024-01-18",
 *   location: "Strasbourg",
 *   sessionType: "PLENARY",
 *   term: 10,
 *   streamingUrl: "https://multimedia.europarl.europa.eu/en/webstreaming",
 *   status: "COMPLETED",
 *   agendaItems: ["Debate on climate policy", "Vote on budget"],
 *   votingRecords: ["VOT-001", "VOT-002"],
 *   attendanceCount: 678,
 *   documents: ["DOC-001", "DOC-002"]
 * }
 * ```
 */
export const PlenarySessionSchema = z.object({
    id: z.string()
        .min(1, "Session ID cannot be empty")
        .describe('Session identifier'),
    date: z.string()
        .min(1, "Date cannot be empty")
        .describe('Session start date'),
    endDate: z.string()
        .optional()
        .describe('Session end date (for multi-day sessions)'),
    location: z.string()
        .min(1, "Location cannot be empty")
        .describe('Session location (e.g., "Strasbourg", "Brussels")'),
    sessionType: SessionTypeSchema
        .optional()
        .describe('Type of session'),
    term: z.number()
        .int("Term must be an integer")
        .positive("Term must be positive")
        .optional()
        .describe('Parliamentary term number (e.g., 9, 10)'),
    streamingUrl: z.url({ message: "Streaming URL must be valid" })
        .optional()
        .describe('Live stream URL'),
    status: SessionStatusSchema
        .optional()
        .describe('Current session status'),
    agendaItems: z.array(z.string())
        .default([])
        .describe('List of agenda items'),
    votingRecords: z.array(z.string())
        .optional()
        .describe('List of voting record IDs'),
    attendanceCount: z.number()
        .int("Attendance count must be an integer")
        .min(0, "Attendance count cannot be negative")
        .optional()
        .describe('Number of MEPs in attendance'),
    documents: z.array(z.string())
        .optional()
        .describe('List of related document IDs')
});
// ============================================================================
// Voting Record Schemas
// ============================================================================
/**
 * Vote result enum (extended)
 *
 * Possible outcomes of a parliamentary vote.
 * Extended beyond simple ADOPTED/REJECTED to include procedural outcomes.
 */
export const VoteResultSchema = z.enum([
    'ADOPTED',
    'REJECTED',
    'WITHDRAWN',
    'REFERRED_BACK',
    'POSTPONED',
    'SPLIT_VOTE',
    'LAPSED'
]);
/**
 * Individual MEP vote enum (extended)
 *
 * How an individual MEP voted.
 */
export const IndividualVoteSchema = z.enum([
    'FOR',
    'AGAINST',
    'ABSTAIN',
    'ABSENT',
    'DID_NOT_VOTE'
]);
/**
 * Vote type enum
 *
 * Method used for voting.
 */
export const VoteTypeSchema = z.enum([
    'ROLL_CALL',
    'SHOW_OF_HANDS',
    'ELECTRONIC',
    'SECRET_BALLOT'
]);
/**
 * Get voting records input schema
 *
 * Query parameters for fetching voting records.
 *
 * ISMS Policy: SC-002 (Input Validation)
 */
export const GetVotingRecordsSchema = z.object({
    sessionId: z.string()
        .min(1, "Session ID cannot be empty")
        .max(100, "Session ID too long (max 100 characters)")
        .optional()
        .describe('Plenary session identifier'),
    mepId: z.string()
        .min(1, "MEP ID cannot be empty")
        .max(100, "MEP ID too long (max 100 characters)")
        .optional()
        .describe('MEP identifier'),
    topic: z.string()
        .min(1, "Topic cannot be empty")
        .max(200, "Topic too long (max 200 characters)")
        .optional()
        .describe('Vote topic or keyword'),
    dateFrom: DateStringSchema.optional()
        .describe('Filter votes from this date (inclusive)'),
    dateTo: DateStringSchema.optional()
        .describe('Filter votes to this date (inclusive)'),
    limit: z.number()
        .int("Limit must be an integer")
        .min(1, "Limit must be at least 1")
        .max(100, "Limit cannot exceed 100")
        .default(50)
        .describe('Maximum results to return'),
    offset: z.number()
        .int("Offset must be an integer")
        .min(0, "Offset cannot be negative")
        .default(0)
        .describe('Pagination offset')
}).refine((data) => {
    if (data.dateFrom != null && data.dateTo != null && data.dateFrom !== '' && data.dateTo !== '') {
        return new Date(data.dateFrom) <= new Date(data.dateTo);
    }
    return true;
}, {
    message: "dateFrom must be before or equal to dateTo",
    path: ['dateFrom']
});
/**
 * Voting record output schema (enhanced)
 *
 * Represents a voting record from a plenary session with comprehensive details.
 *
 * **Enhanced Fields:**
 * - `documentReference`: Reference to the document being voted on
 * - `voteType`: Method used for voting (ROLL_CALL, etc.)
 * - `absent`: Number of absent MEPs
 * - `percentageFor`: Percentage of FOR votes
 * - `isRollCall`: Whether this was a roll-call vote
 * - `detailedResultsUrl`: URL to detailed voting results
 * - `requiredMajority`: Majority required for adoption
 *
 * **Vote Tallies Validation:**
 * - All vote counts must be non-negative integers
 * - Total votes = votesFor + votesAgainst + abstentions
 *
 * ISMS Policy: SC-002 (Data Validation)
 *
 * @example
 * ```typescript
 * {
 *   id: "eli/dl/event/MTG-PL-2024-01-15-VOT-001",
 *   sessionId: "MTG-PL-2024-01-15",
 *   topic: "Budget amendment 2024",
 *   date: "2024-01-15",
 *   documentReference: "A9-0001/2024",
 *   voteType: "ROLL_CALL",
 *   votesFor: 450,
 *   votesAgainst: 180,
 *   abstentions: 48,
 *   absent: 27,
 *   percentageFor: 66.4,
 *   isRollCall: true,
 *   result: "ADOPTED",
 *   requiredMajority: "SIMPLE",
 *   detailedResultsUrl: "https://europarl.europa.eu/votes/...",
 *   mepVotes: {
 *     "person/12345": "FOR",
 *     "person/67890": "AGAINST"
 *   }
 * }
 * ```
 */
export const VotingRecordSchema = z.object({
    id: z.string()
        .min(1, "Voting record ID cannot be empty")
        .describe('Voting record identifier'),
    sessionId: z.string()
        .min(1, "Session ID cannot be empty")
        .describe('Associated plenary session ID'),
    topic: z.string()
        .min(1, "Topic cannot be empty")
        .describe('Vote topic or subject'),
    date: z.string()
        .min(1, "Date cannot be empty")
        .describe('Vote date'),
    // Document reference
    documentReference: z.string()
        .optional()
        .describe('Reference to the document being voted on (e.g., "A9-0001/2024")'),
    // Vote method
    voteType: VoteTypeSchema
        .optional()
        .describe('Method used for voting'),
    // Vote tallies
    votesFor: z.number()
        .int("Votes for must be an integer")
        .min(0, "Votes for cannot be negative")
        .describe('Number of FOR votes'),
    votesAgainst: z.number()
        .int("Votes against must be an integer")
        .min(0, "Votes against cannot be negative")
        .describe('Number of AGAINST votes'),
    abstentions: z.number()
        .int("Abstentions must be an integer")
        .min(0, "Abstentions cannot be negative")
        .describe('Number of abstentions'),
    absent: z.number()
        .int("Absent count must be an integer")
        .min(0, "Absent count cannot be negative")
        .optional()
        .describe('Number of absent MEPs'),
    // Vote outcome
    result: VoteResultSchema
        .describe('Vote outcome'),
    // Additional metadata
    percentageFor: z.number()
        .min(0, "Percentage cannot be negative")
        .max(100, "Percentage cannot exceed 100")
        .optional()
        .describe('Percentage of FOR votes (0-100)'),
    isRollCall: z.boolean()
        .optional()
        .describe('Whether this was a roll-call vote with individual MEP votes recorded'),
    detailedResultsUrl: z.url({ message: "Detailed results URL must be valid" })
        .optional()
        .describe('URL to detailed voting results'),
    requiredMajority: z.string()
        .optional()
        .describe('Majority required for adoption (e.g., "SIMPLE", "ABSOLUTE", "TWO_THIRDS")'),
    // Individual MEP votes (optional, only for roll-call votes)
    mepVotes: z.record(z.string(), IndividualVoteSchema)
        .optional()
        .describe('Map of MEP ID to individual vote (only for roll-call votes)')
});
// ============================================================================
// Legislative Document Schemas
// ============================================================================
/**
 * Document type enum (extended)
 *
 * Types of European Parliament documents.
 * Extended to include more document categories.
 */
const DocumentTypeSchema = z.enum([
    'REPORT',
    'RESOLUTION',
    'DECISION',
    'DIRECTIVE',
    'REGULATION',
    'OPINION',
    'AMENDMENT',
    'QUESTION',
    'MOTION',
    'PROPOSAL',
    'COMMUNICATION',
    'RECOMMENDATION',
    'WHITE_PAPER',
    'GREEN_PAPER',
    'OTHER'
]);
/**
 * Document status enum (extended)
 *
 * Legislative stages and document statuses.
 * Extended to include more legislative stages.
 */
export const DocumentStatusSchema = z.enum([
    'DRAFT',
    'SUBMITTED',
    'IN_COMMITTEE',
    'COMMITTEE_VOTE',
    'PLENARY',
    'PLENARY_VOTE',
    'FIRST_READING',
    'SECOND_READING',
    'THIRD_READING',
    'CONCILIATION',
    'ADOPTED',
    'REJECTED',
    'WITHDRAWN',
    'LAPSED'
]);
/**
 * Related document schema
 *
 * Represents a relationship to another document.
 *
 * @example
 * ```typescript
 * {
 *   id: "A9-0002/2024",
 *   relationshipType: "AMENDS",
 *   title: "Original proposal"
 * }
 * ```
 */
export const RelatedDocumentSchema = z.object({
    id: DocumentIdSchema
        .describe('Related document ID'),
    relationshipType: z.string()
        .optional()
        .describe('Type of relationship (e.g., "AMENDS", "REFERS_TO", "SUPERSEDES")'),
    title: z.string()
        .optional()
        .describe('Title of related document')
});
/**
 * Rapporteur schema
 *
 * Represents a rapporteur (lead MEP) for a document.
 *
 * @example
 * ```typescript
 * {
 *   mepId: "person/12345",
 *   mepName: "Jane Doe",
 *   role: "Rapporteur"
 * }
 * ```
 */
export const RapporteurSchema = z.object({
    mepId: z.string()
        .min(1)
        .describe('MEP identifier'),
    mepName: z.string()
        .optional()
        .describe('MEP name'),
    role: z.string()
        .optional()
        .describe('Role (e.g., "Rapporteur", "Co-rapporteur")')
});
/**
 * Search documents input schema
 *
 * Query parameters for document search.
 *
 * ISMS Policy: SC-002 (Input Validation)
 */
export const SearchDocumentsSchema = z.object({
    keyword: z.string()
        .min(1, "Keyword cannot be empty")
        .max(200, "Keyword too long (max 200 characters)")
        .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Keyword contains invalid characters. Only alphanumeric, spaces, hyphens, and underscores allowed.')
        .transform(s => s.trim())
        .describe('Search keyword or phrase'),
    documentType: DocumentTypeSchema
        .optional()
        .describe('Filter by document type'),
    dateFrom: DateStringSchema.optional()
        .describe('Filter documents from this date (inclusive)'),
    dateTo: DateStringSchema.optional()
        .describe('Filter documents to this date (inclusive)'),
    committee: z.string()
        .min(1, "Committee identifier cannot be empty")
        .max(100, "Committee identifier too long (max 100 characters)")
        .optional()
        .describe('Committee identifier'),
    limit: z.number()
        .int("Limit must be an integer")
        .min(1, "Limit must be at least 1")
        .max(100, "Limit cannot exceed 100")
        .default(20)
        .describe('Maximum results to return'),
    offset: z.number()
        .int("Offset must be an integer")
        .min(0, "Offset cannot be negative")
        .default(0)
        .describe('Pagination offset')
}).refine((data) => {
    if (data.dateFrom != null && data.dateTo != null && data.dateFrom !== '' && data.dateTo !== '') {
        return new Date(data.dateFrom) <= new Date(data.dateTo);
    }
    return true;
}, {
    message: "dateFrom must be before or equal to dateTo",
    path: ['dateFrom']
});
/**
 * Legislative document output schema (enhanced)
 *
 * Represents a European Parliament legislative document with comprehensive metadata.
 *
 * **Enhanced Fields:**
 * - `subtitle`: Document subtitle
 * - `procedureReference`: Legislative procedure reference number
 * - `procedureType`: Type of legislative procedure
 * - `languages`: Available language versions
 * - `htmlUrl`: HTML version URL
 * - `relatedDocuments`: Related documents with relationship types
 * - `subjects`: Subject classifications/tags
 * - `rapporteur`: Lead MEP
 * - `shadowRapporteurs`: Shadow rapporteurs from other groups
 *
 * **File Formats:**
 * - `pdfUrl`: PDF version (most common)
 * - `xmlUrl`: XML version (structured data)
 * - `htmlUrl`: HTML version (web viewing)
 *
 * ISMS Policy: SC-002 (Data Validation)
 *
 * @example
 * ```typescript
 * {
 *   id: "A9-0001/2024",
 *   type: "REPORT",
 *   title: "Climate Action and Energy Policy",
 *   subtitle: "Annual report on progress",
 *   date: "2024-01-15",
 *   authors: ["person/12345", "person/67890"],
 *   committee: "ENVI",
 *   status: "ADOPTED",
 *   procedureReference: "2024/0001(COD)",
 *   procedureType: "Ordinary legislative procedure",
 *   languages: ["en", "fr", "de", "es"],
 *   pdfUrl: "https://europarl.europa.eu/doceo/document/A-9-2024-0001_EN.pdf",
 *   xmlUrl: "https://europarl.europa.eu/doceo/document/A-9-2024-0001_EN.xml",
 *   htmlUrl: "https://europarl.europa.eu/doceo/document/A-9-2024-0001_EN.html",
 *   summary: "This report addresses...",
 *   relatedDocuments: [
 *     {
 *       id: "COM(2023)999",
 *       relationshipType: "REFERS_TO",
 *       title: "Commission proposal"
 *     }
 *   ],
 *   subjects: ["Climate change", "Energy policy"],
 *   rapporteur: {
 *     mepId: "person/12345",
 *     mepName: "Jane Doe",
 *     role: "Rapporteur"
 *   },
 *   shadowRapporteurs: [
 *     {
 *       mepId: "person/67890",
 *       mepName: "John Smith",
 *       role: "Shadow rapporteur"
 *     }
 *   ]
 * }
 * ```
 */
export const LegislativeDocumentSchema = z.object({
    id: z.string()
        .min(1, "Document ID cannot be empty")
        .describe('Document identifier (e.g., "A9-0001/2024", ELI format)'),
    type: DocumentTypeSchema
        .describe('Document type'),
    // Title and description
    title: z.string()
        .min(1, "Title cannot be empty")
        .describe('Document title'),
    subtitle: z.string()
        .optional()
        .describe('Document subtitle'),
    summary: z.string()
        .optional()
        .describe('Document summary or abstract'),
    // Dates and status
    date: z.string()
        .min(1, "Date cannot be empty")
        .describe('Document date'),
    status: DocumentStatusSchema
        .describe('Current document status in legislative process'),
    // Authorship
    authors: z.array(z.string())
        .default([])
        .describe('List of author IDs (MEP IDs or organization IDs)'),
    rapporteur: RapporteurSchema
        .optional()
        .describe('Lead MEP (rapporteur)'),
    shadowRapporteurs: z.array(RapporteurSchema)
        .optional()
        .describe('Shadow rapporteurs from other political groups'),
    // Committee
    committee: z.string()
        .optional()
        .describe('Responsible committee ID'),
    // Procedure
    procedureReference: z.string()
        .optional()
        .describe('Legislative procedure reference number (e.g., "2024/0001(COD)")'),
    procedureType: z.string()
        .optional()
        .describe('Type of legislative procedure'),
    // Languages and formats
    languages: z.array(z.string().length(2))
        .optional()
        .describe('Available language versions (ISO 639-1 codes)'),
    pdfUrl: z.url({ message: 'Invalid PDF URL format' })
        .optional()
        .describe('PDF document URL'),
    xmlUrl: z.url({ message: 'Invalid XML URL format' })
        .optional()
        .describe('XML document URL'),
    htmlUrl: z.url({ message: 'Invalid HTML URL format' })
        .optional()
        .describe('HTML document URL'),
    // Relationships and classification
    relatedDocuments: z.array(RelatedDocumentSchema)
        .optional()
        .describe('Related documents with relationship types'),
    subjects: z.array(z.string())
        .optional()
        .describe('Subject classifications and tags')
});
// ============================================================================
// Committee Schemas
// ============================================================================
/**
 * Committee type enum
 *
 * Types of European Parliament bodies.
 */
export const CommitteeTypeSchema = z.enum([
    'STANDING',
    'SPECIAL',
    'SUBCOMMITTEE',
    'DELEGATION',
    'JOINT'
]);
/**
 * Get committee info input schema
 *
 * Query parameters for fetching committee information.
 *
 * ISMS Policy: SC-002 (Input Validation)
 */
export const GetCommitteeInfoSchema = z.object({
    id: z.string()
        .min(1, "Committee ID cannot be empty")
        .max(100, "Committee ID too long (max 100 characters)")
        .optional()
        .describe('Committee identifier'),
    abbreviation: z.string()
        .min(1, "Abbreviation cannot be empty")
        .max(20, "Abbreviation too long (max 20 characters)")
        .optional()
        .describe('Committee abbreviation (e.g., "ECON", "ENVI")')
});
/**
 * Committee output schema (enhanced)
 *
 * Represents a European Parliament committee or parliamentary body.
 *
 * **Enhanced Fields:**
 * - `type`: Committee type (STANDING, SPECIAL, etc.)
 * - `parentCommittee`: Parent committee ID (for subcommittees)
 * - `subcommittees`: List of subcommittee IDs
 * - `meetingLocations`: Regular meeting locations
 * - `websiteUrl`: Committee website URL
 * - `contactEmail`: Committee contact email
 * - `memberCount`: Number of members
 *
 * **Note on Members:**
 * The `members` array contains MEP IDs. To get full member details,
 * query the MEPs endpoint with the committee filter.
 *
 * ISMS Policy: SC-002 (Data Validation)
 *
 * @example
 * ```typescript
 * {
 *   id: "org/ECON",
 *   name: "Committee on Economic and Monetary Affairs",
 *   abbreviation: "ECON",
 *   type: "STANDING",
 *   members: ["person/12345", "person/67890"],
 *   chair: "person/12345",
 *   viceChairs: ["person/67890", "person/11111"],
 *   memberCount: 60,
 *   parentCommittee: undefined,
 *   subcommittees: [],
 *   meetingSchedule: ["Every Monday 9:00-12:30", "Every Thursday 15:00-18:30"],
 *   meetingLocations: ["Brussels", "Strasbourg"],
 *   responsibilities: [
 *     "Economic and monetary policy",
 *     "Financial services",
 *     "Banking supervision"
 *   ],
 *   websiteUrl: "https://www.europarl.europa.eu/committees/en/econ/home.html",
 *   contactEmail: "econ-secretariat@europarl.europa.eu"
 * }
 * ```
 */
export const CommitteeSchema = z.object({
    id: z.string()
        .min(1, "Committee ID cannot be empty")
        .describe('Committee identifier'),
    name: z.string()
        .min(1, "Committee name cannot be empty")
        .describe('Full committee name'),
    abbreviation: z.string()
        .min(1, "Abbreviation cannot be empty")
        .describe('Committee abbreviation (e.g., "ECON", "ENVI")'),
    // Committee type and structure
    type: CommitteeTypeSchema
        .optional()
        .describe('Committee type'),
    parentCommittee: CommitteeIdSchema
        .optional()
        .describe('Parent committee ID (for subcommittees)'),
    subcommittees: z.array(CommitteeIdSchema)
        .optional()
        .describe('List of subcommittee IDs'),
    // Membership
    members: z.array(z.string())
        .default([])
        .describe('List of member MEP IDs'),
    memberCount: z.number()
        .int("Member count must be an integer")
        .min(0, "Member count cannot be negative")
        .optional()
        .describe('Number of committee members'),
    chair: z.string()
        .optional()
        .describe('Committee chair MEP ID'),
    viceChairs: z.array(z.string())
        .optional()
        .describe('List of vice-chair MEP IDs'),
    // Meetings
    meetingSchedule: z.array(z.string())
        .optional()
        .describe('Regular meeting schedule descriptions'),
    meetingLocations: z.array(z.string())
        .optional()
        .describe('Regular meeting locations'),
    // Responsibilities and contact
    responsibilities: z.array(z.string())
        .optional()
        .describe('Committee responsibilities and policy areas'),
    websiteUrl: z.url({ message: "Website URL must be valid" })
        .optional()
        .describe('Committee website URL'),
    contactEmail: z.email({ message: "Invalid email format" })
        .optional()
        .describe('Committee contact email')
});
// ============================================================================
// Parliamentary Question Schemas
// ============================================================================
/**
 * Question type enum (extended)
 *
 * Types of parliamentary questions.
 */
export const QuestionTypeSchema = z.enum([
    'WRITTEN',
    'ORAL',
    'PRIORITY',
    'QUESTION_TIME',
    'MAJOR_INTERPELLATION',
    'WRITTEN_WITH_ANSWER'
]);
/**
 * Question status enum (extended)
 *
 * Status of parliamentary questions.
 */
export const QuestionStatusSchema = z.enum([
    'PENDING',
    'ANSWERED',
    'OVERDUE',
    'WITHDRAWN'
]);
/**
 * Question addressee enum
 *
 * EU institutions that can be addressed in questions.
 */
export const QuestionAddresseeSchema = z.enum([
    'COMMISSION',
    'COUNCIL',
    'EUROPEAN_COUNCIL',
    'HIGH_REPRESENTATIVE',
    'ECB'
]);
/**
 * Get parliamentary questions input schema
 *
 * Query parameters for fetching parliamentary questions.
 *
 * ISMS Policy: SC-002 (Input Validation)
 */
export const GetParliamentaryQuestionsSchema = z.object({
    type: QuestionTypeSchema
        .optional()
        .describe('Question type'),
    author: z.string()
        .min(1, "Author identifier cannot be empty")
        .max(100, "Author identifier too long (max 100 characters)")
        .optional()
        .describe('MEP identifier or name'),
    topic: z.string()
        .min(1, "Topic cannot be empty")
        .max(200, "Topic too long (max 200 characters)")
        .optional()
        .describe('Question topic or keyword'),
    status: QuestionStatusSchema
        .optional()
        .describe('Question status'),
    dateFrom: DateStringSchema.optional()
        .describe('Filter questions from this date (inclusive)'),
    dateTo: DateStringSchema.optional()
        .describe('Filter questions to this date (inclusive)'),
    limit: z.number()
        .int("Limit must be an integer")
        .min(1, "Limit must be at least 1")
        .max(100, "Limit cannot exceed 100")
        .default(50)
        .describe('Maximum results to return'),
    offset: z.number()
        .int("Offset must be an integer")
        .min(0, "Offset cannot be negative")
        .default(0)
        .describe('Pagination offset')
}).refine((data) => {
    if (data.dateFrom != null && data.dateTo != null && data.dateFrom !== '' && data.dateTo !== '') {
        return new Date(data.dateFrom) <= new Date(data.dateTo);
    }
    return true;
}, {
    message: "dateFrom must be before or equal to dateTo",
    path: ['dateFrom']
});
/**
 * Parliamentary question output schema (enhanced)
 *
 * Represents a parliamentary question with comprehensive metadata.
 *
 * **Enhanced Fields:**
 * - `reference`: Official question reference number
 * - `coAuthors`: Additional MEP co-authors
 * - `addressee`: Institution being questioned
 * - `answeredBy`: Who provided the answer
 * - `isPriority`: Whether this is a priority question
 * - `subjects`: Subject classifications
 * - `language`: Original language
 * - `documentUrl`: URL to official document
 *
 * **Question Types:**
 * - WRITTEN: Written question requiring written answer
 * - ORAL: Oral question for plenary debate
 * - PRIORITY: Priority question (limited per MEP)
 * - QUESTION_TIME: Question time session
 * - MAJOR_INTERPELLATION: Major policy question
 * - WRITTEN_WITH_ANSWER: Written question with published answer
 *
 * ISMS Policy: SC-002 (Data Validation)
 *
 * @example
 * ```typescript
 * {
 *   id: "E-000123/2024",
 *   reference: "E-000123/2024",
 *   type: "WRITTEN",
 *   author: "person/12345",
 *   coAuthors: ["person/67890"],
 *   date: "2024-01-15",
 *   topic: "Climate policy implementation",
 *   questionText: "What measures is the Commission taking...",
 *   addressee: "COMMISSION",
 *   isPriority: false,
 *   status: "ANSWERED",
 *   answerText: "The Commission has adopted...",
 *   answerDate: "2024-02-01",
 *   answeredBy: "Commissioner for Climate Action",
 *   subjects: ["Climate change", "Environmental policy"],
 *   language: "en",
 *   documentUrl: "https://europarl.europa.eu/doceo/document/E-9-2024-000123_EN.html"
 * }
 * ```
 */
export const ParliamentaryQuestionSchema = z.object({
    id: z.string()
        .min(1, "Question ID cannot be empty")
        .describe('Question identifier'),
    reference: z.string()
        .optional()
        .describe('Official question reference number (e.g., "E-000123/2024")'),
    type: QuestionTypeSchema
        .describe('Question type'),
    // Authors
    author: z.string()
        .min(1, "Author cannot be empty")
        .describe('Primary author MEP ID'),
    coAuthors: z.array(z.string())
        .optional()
        .describe('Co-author MEP IDs'),
    // Question content
    date: z.string()
        .min(1, "Date cannot be empty")
        .describe('Question submission date'),
    topic: z.string()
        .min(1, "Topic cannot be empty")
        .describe('Question topic or subject'),
    questionText: z.string()
        .min(1, "Question text cannot be empty")
        .describe('Full question text'),
    // Addressee and priority
    addressee: QuestionAddresseeSchema
        .optional()
        .describe('EU institution being questioned'),
    isPriority: z.boolean()
        .optional()
        .describe('Whether this is a priority question'),
    // Answer
    status: QuestionStatusSchema
        .describe('Question status'),
    answerText: z.string()
        .optional()
        .describe('Answer text (if answered)'),
    answerDate: z.string()
        .optional()
        .describe('Answer date (if answered)'),
    answeredBy: z.string()
        .optional()
        .describe('Who provided the answer (e.g., Commissioner name)'),
    // Classification and metadata
    subjects: z.array(z.string())
        .optional()
        .describe('Subject classifications and tags'),
    language: z.string()
        .length(2, "Language code must be exactly 2 characters")
        .optional()
        .describe('Original language (ISO 639-1 code)'),
    documentUrl: z.url({ message: "Document URL must be valid" })
        .optional()
        .describe('URL to official question document')
});
// ============================================================================
// Analysis and Reporting Schemas
// ============================================================================
/**
 * Analyze voting patterns input schema
 *
 * Query parameters for voting pattern analysis.
 *
 * ISMS Policy: SC-002 (Input Validation)
 */
export const AnalyzeVotingPatternsSchema = z.object({
    mepId: z.string()
        .min(1, "MEP ID cannot be empty")
        .max(100, "MEP ID too long (max 100 characters)")
        .describe('MEP identifier'),
    dateFrom: DateStringSchema.optional()
        .describe('Analysis period start date'),
    dateTo: DateStringSchema.optional()
        .describe('Analysis period end date'),
    compareWithGroup: z.boolean()
        .default(true)
        .describe('Compare with political group average')
}).refine((data) => {
    if (data.dateFrom != null && data.dateTo != null && data.dateFrom !== '' && data.dateTo !== '') {
        return new Date(data.dateFrom) <= new Date(data.dateTo);
    }
    return true;
}, {
    message: "dateFrom must be before or equal to dateTo",
    path: ['dateFrom']
});
/**
 * Track legislation input schema
 *
 * Query parameters for tracking legislative procedures.
 *
 * ISMS Policy: SC-002 (Input Validation)
 */
export const TrackLegislationSchema = z.object({
    procedureId: z.string()
        .min(1, "Procedure ID cannot be empty")
        .max(100, "Procedure ID too long (max 100 characters)")
        .describe('Legislative procedure identifier (e.g., "2024/0001(COD)")')
});
/**
 * Report type enum
 *
 * Types of reports that can be generated.
 */
export const ReportTypeSchema = z.enum([
    'MEP_ACTIVITY',
    'COMMITTEE_PERFORMANCE',
    'VOTING_STATISTICS',
    'LEGISLATION_PROGRESS'
]);
/**
 * Generate report input schema
 *
 * Query parameters for report generation.
 *
 * ISMS Policy: SC-002 (Input Validation)
 */
export const GenerateReportSchema = z.object({
    reportType: ReportTypeSchema
        .describe('Type of report to generate'),
    subjectId: z.string()
        .min(1, "Subject ID cannot be empty")
        .max(100, "Subject ID too long (max 100 characters)")
        .optional()
        .describe('Subject identifier (MEP ID, Committee ID, etc.)'),
    dateFrom: DateStringSchema.optional()
        .describe('Report period start date'),
    dateTo: DateStringSchema.optional()
        .describe('Report period end date')
}).refine((data) => {
    if (data.dateFrom != null && data.dateTo != null && data.dateFrom !== '' && data.dateTo !== '') {
        return new Date(data.dateFrom) <= new Date(data.dateTo);
    }
    return true;
}, {
    message: "dateFrom must be before or equal to dateTo",
    path: ['dateFrom']
});
// ============================================================================
// Pagination Schema
// ============================================================================
/**
 * Paginated response schema factory
 *
 * Creates a paginated response schema for any data type.
 *
 * **Usage:**
 * ```typescript
 * const PaginatedMEPsSchema = PaginatedResponseSchema(MEPSchema);
 * type PaginatedMEPs = z.infer<typeof PaginatedMEPsSchema>;
 * ```
 *
 * **Pagination Metadata:**
 * - `total`: Total number of items available
 * - `limit`: Maximum items per page
 * - `offset`: Current page offset
 * - `hasMore`: Whether more pages are available
 *
 * ISMS Policy: SC-002 (Data Validation)
 *
 * @param dataSchema - Zod schema for the data items
 * @returns Paginated response schema
 *
 * @example
 * ```typescript
 * {
 *   data: [
 *     { id: "person/12345", name: "Jane Doe", ... },
 *     { id: "person/67890", name: "John Smith", ... }
 *   ],
 *   total: 705,
 *   limit: 50,
 *   offset: 0,
 *   hasMore: true
 * }
 * ```
 */
export const PaginatedResponseSchema = (dataSchema) => z.object({
    data: z.array(dataSchema)
        .describe('Array of data items for current page'),
    total: z.number()
        .int("Total must be an integer")
        .min(0, "Total cannot be negative")
        .describe('Total number of items available'),
    limit: z.number()
        .int("Limit must be an integer")
        .min(1, "Limit must be at least 1")
        .describe('Maximum items per page'),
    offset: z.number()
        .int("Offset must be an integer")
        .min(0, "Offset cannot be negative")
        .describe('Current page offset'),
    hasMore: z.boolean()
        .describe('Whether more pages are available')
});
// ============================================================================
// Schema Validation Helpers
// ============================================================================
/**
 * Safely parse and validate data with a schema
 *
 * Returns a result object with either success + data or failure + errors.
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Result object with success flag and data or errors
 *
 * @example
 * ```typescript
 * const result = safeValidate(MEPSchema, apiData);
 *
 * if (result.success) {
 *   console.log('Valid MEP:', result.data);
 * } else {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 */
export function safeValidate(schema, data) {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, errors: result.error };
}
/**
 * Format Zod validation errors for user-friendly display
 *
 * Converts Zod error objects to a simple array of error messages.
 *
 * @param error - Zod error object
 * @returns Array of formatted error messages
 *
 * @example
 * ```typescript
 * const result = MEPSchema.safeParse(invalidData);
 *
 * if (!result.success) {
 *   const messages = formatValidationErrors(result.error);
 *   console.error('Validation failed:', messages.join(', '));
 * }
 * ```
 */
export function formatValidationErrors(error) {
    return error.issues.map((err) => {
        const path = err.path.join('.');
        return path ? `${path}: ${err.message}` : err.message;
    });
}
// ============================================================================
// Constants and Reference Data
// ============================================================================
/**
 * EU member states (ISO 3166-1 alpha-2 codes)
 *
 * All 27 EU member states as of 2024.
 */
export const EU_MEMBER_STATES = new Set([
    'AT', // Austria
    'BE', // Belgium
    'BG', // Bulgaria
    'CY', // Cyprus
    'CZ', // Czech Republic
    'DE', // Germany
    'DK', // Denmark
    'EE', // Estonia
    'ES', // Spain
    'FI', // Finland
    'FR', // France
    'GR', // Greece
    'HR', // Croatia
    'HU', // Hungary
    'IE', // Ireland
    'IT', // Italy
    'LT', // Lithuania
    'LU', // Luxembourg
    'LV', // Latvia
    'MT', // Malta
    'NL', // Netherlands
    'PL', // Poland
    'PT', // Portugal
    'RO', // Romania
    'SE', // Sweden
    'SI', // Slovenia
    'SK' // Slovakia
]);
/**
 * EU official languages (ISO 639-1 codes)
 *
 * All 24 official languages of the European Union.
 */
export const EU_LANGUAGES = new Set([
    'bg', // Bulgarian
    'cs', // Czech
    'da', // Danish
    'de', // German
    'el', // Greek
    'en', // English
    'es', // Spanish
    'et', // Estonian
    'fi', // Finnish
    'fr', // French
    'ga', // Irish
    'hr', // Croatian
    'hu', // Hungarian
    'it', // Italian
    'lt', // Lithuanian
    'lv', // Latvian
    'mt', // Maltese
    'nl', // Dutch
    'pl', // Polish
    'pt', // Portuguese
    'ro', // Romanian
    'sk', // Slovak
    'sl', // Slovenian
    'sv' // Swedish
]);
/**
 * European Parliament political groups
 *
 * Current political groups in the European Parliament (as of 2024).
 */
export const EP_PARTY_GROUPS = new Set([
    'PPE', // European People's Party
    'S&D', // Progressive Alliance of Socialists and Democrats
    'Renew', // Renew Europe
    'Greens/EFA', // Greens/European Free Alliance
    'ECR', // European Conservatives and Reformists
    'ID', // Identity and Democracy
    'The Left', // The Left
    'NI' // Non-Inscrits (Non-attached)
]);
//# sourceMappingURL=europeanParliament.js.map