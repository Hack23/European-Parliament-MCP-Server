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
export declare const MEPIdSchema: z.core.$ZodBranded<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>, "MEPId", "out">;
export type MEPId = z.infer<typeof MEPIdSchema>;
/**
 * Branded type for session identifiers
 *
 * ISMS Policy: SC-002 (Type Safety)
 */
export declare const SessionIdSchema: z.core.$ZodBranded<z.ZodString, "SessionId", "out">;
export type SessionId = z.infer<typeof SessionIdSchema>;
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
export declare const DocumentIdSchema: z.core.$ZodBranded<z.ZodString, "DocumentId", "out">;
export type DocumentId = z.infer<typeof DocumentIdSchema>;
/**
 * Branded type for committee identifiers
 *
 * ISMS Policy: SC-002 (Type Safety)
 */
export declare const CommitteeIdSchema: z.core.$ZodBranded<z.ZodString, "CommitteeId", "out">;
export type CommitteeId = z.infer<typeof CommitteeIdSchema>;
/**
 * Branded type for voting record identifiers
 *
 * ISMS Policy: SC-002 (Type Safety)
 */
export declare const VotingRecordIdSchema: z.core.$ZodBranded<z.ZodString, "VotingRecordId", "out">;
export type VotingRecordId = z.infer<typeof VotingRecordIdSchema>;
/**
 * Branded type for question identifiers
 *
 * ISMS Policy: SC-002 (Type Safety)
 */
export declare const QuestionIdSchema: z.core.$ZodBranded<z.ZodString, "QuestionId", "out">;
export type QuestionId = z.infer<typeof QuestionIdSchema>;
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
export declare const PoliticalGroupSchema: z.ZodObject<{
    code: z.ZodString;
    name: z.ZodString;
}, z.core.$strip>;
export type PoliticalGroup = z.infer<typeof PoliticalGroupSchema>;
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
export declare const CommitteeMembershipSchema: z.ZodObject<{
    committeeId: z.core.$ZodBranded<z.ZodString, "CommitteeId", "out">;
    committeeName: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CommitteeMembership = z.infer<typeof CommitteeMembershipSchema>;
/**
 * Get MEPs input schema
 *
 * Query parameters for fetching MEP list.
 *
 * ISMS Policy: SC-002 (Input Validation)
 */
export declare const GetMEPsSchema: z.ZodObject<{
    country: z.ZodOptional<z.ZodString>;
    group: z.ZodOptional<z.ZodString>;
    committee: z.ZodOptional<z.ZodString>;
    active: z.ZodDefault<z.ZodBoolean>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
/**
 * Get MEP details input schema
 *
 * ISMS Policy: SC-002 (Input Validation)
 */
export declare const GetMEPDetailsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
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
export declare const MEPSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    birthDate: z.ZodOptional<z.ZodString>;
    nationality: z.ZodOptional<z.ZodString>;
    photoUrl: z.ZodOptional<z.ZodURL>;
    country: z.ZodString;
    politicalGroup: z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
        code: z.ZodString;
        name: z.ZodString;
    }, z.core.$strip>]>;
    committees: z.ZodDefault<z.ZodUnion<readonly [z.ZodArray<z.ZodString>, z.ZodArray<z.ZodObject<{
        committeeId: z.core.$ZodBranded<z.ZodString, "CommitteeId", "out">;
        committeeName: z.ZodOptional<z.ZodString>;
        role: z.ZodOptional<z.ZodString>;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>]>>;
    email: z.ZodOptional<z.ZodEmail>;
    phone: z.ZodOptional<z.ZodString>;
    active: z.ZodBoolean;
    termStart: z.ZodString;
    termEnd: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
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
export declare const MEPDetailsSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    birthDate: z.ZodOptional<z.ZodString>;
    nationality: z.ZodOptional<z.ZodString>;
    photoUrl: z.ZodOptional<z.ZodURL>;
    country: z.ZodString;
    politicalGroup: z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
        code: z.ZodString;
        name: z.ZodString;
    }, z.core.$strip>]>;
    committees: z.ZodDefault<z.ZodUnion<readonly [z.ZodArray<z.ZodString>, z.ZodArray<z.ZodObject<{
        committeeId: z.core.$ZodBranded<z.ZodString, "CommitteeId", "out">;
        committeeName: z.ZodOptional<z.ZodString>;
        role: z.ZodOptional<z.ZodString>;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>]>>;
    email: z.ZodOptional<z.ZodEmail>;
    active: z.ZodBoolean;
    termStart: z.ZodString;
    termEnd: z.ZodOptional<z.ZodString>;
    biography: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodURL>;
    twitter: z.ZodOptional<z.ZodString>;
    facebook: z.ZodOptional<z.ZodString>;
    votingStatistics: z.ZodOptional<z.ZodObject<{
        totalVotes: z.ZodNumber;
        votesFor: z.ZodNumber;
        votesAgainst: z.ZodNumber;
        abstentions: z.ZodNumber;
        attendanceRate: z.ZodNumber;
    }, z.core.$strip>>;
    roles: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
/**
 * Session type enum
 *
 * Different types of European Parliament sessions.
 */
export declare const SessionTypeSchema: z.ZodEnum<{
    PLENARY: "PLENARY";
    COMMITTEE: "COMMITTEE";
    EXTRAORDINARY: "EXTRAORDINARY";
    SPECIAL: "SPECIAL";
}>;
export type SessionType = z.infer<typeof SessionTypeSchema>;
/**
 * Session status enum
 *
 * Current status of a parliamentary session.
 */
export declare const SessionStatusSchema: z.ZodEnum<{
    SCHEDULED: "SCHEDULED";
    ONGOING: "ONGOING";
    COMPLETED: "COMPLETED";
    CANCELLED: "CANCELLED";
    POSTPONED: "POSTPONED";
}>;
export type SessionStatus = z.infer<typeof SessionStatusSchema>;
/**
 * Get plenary sessions input schema
 *
 * Query parameters for fetching plenary session list.
 *
 * ISMS Policy: SC-002 (Input Validation)
 */
export declare const GetPlenarySessionsSchema: z.ZodObject<{
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
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
export declare const PlenarySessionSchema: z.ZodObject<{
    id: z.ZodString;
    date: z.ZodString;
    endDate: z.ZodOptional<z.ZodString>;
    location: z.ZodString;
    sessionType: z.ZodOptional<z.ZodEnum<{
        PLENARY: "PLENARY";
        COMMITTEE: "COMMITTEE";
        EXTRAORDINARY: "EXTRAORDINARY";
        SPECIAL: "SPECIAL";
    }>>;
    term: z.ZodOptional<z.ZodNumber>;
    streamingUrl: z.ZodOptional<z.ZodURL>;
    status: z.ZodOptional<z.ZodEnum<{
        SCHEDULED: "SCHEDULED";
        ONGOING: "ONGOING";
        COMPLETED: "COMPLETED";
        CANCELLED: "CANCELLED";
        POSTPONED: "POSTPONED";
    }>>;
    agendaItems: z.ZodDefault<z.ZodArray<z.ZodString>>;
    votingRecords: z.ZodOptional<z.ZodArray<z.ZodString>>;
    attendanceCount: z.ZodOptional<z.ZodNumber>;
    documents: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
/**
 * Vote result enum (extended)
 *
 * Possible outcomes of a parliamentary vote.
 * Extended beyond simple ADOPTED/REJECTED to include procedural outcomes.
 */
export declare const VoteResultSchema: z.ZodEnum<{
    POSTPONED: "POSTPONED";
    ADOPTED: "ADOPTED";
    REJECTED: "REJECTED";
    WITHDRAWN: "WITHDRAWN";
    REFERRED_BACK: "REFERRED_BACK";
    SPLIT_VOTE: "SPLIT_VOTE";
    LAPSED: "LAPSED";
}>;
export type VoteResult = z.infer<typeof VoteResultSchema>;
/**
 * Individual MEP vote enum (extended)
 *
 * How an individual MEP voted.
 */
export declare const IndividualVoteSchema: z.ZodEnum<{
    FOR: "FOR";
    AGAINST: "AGAINST";
    ABSTAIN: "ABSTAIN";
    ABSENT: "ABSENT";
    DID_NOT_VOTE: "DID_NOT_VOTE";
}>;
export type IndividualVote = z.infer<typeof IndividualVoteSchema>;
/**
 * Vote type enum
 *
 * Method used for voting.
 */
export declare const VoteTypeSchema: z.ZodEnum<{
    ROLL_CALL: "ROLL_CALL";
    SHOW_OF_HANDS: "SHOW_OF_HANDS";
    ELECTRONIC: "ELECTRONIC";
    SECRET_BALLOT: "SECRET_BALLOT";
}>;
export type VoteType = z.infer<typeof VoteTypeSchema>;
/**
 * Get voting records input schema
 *
 * Query parameters for fetching voting records.
 *
 * ISMS Policy: SC-002 (Input Validation)
 */
export declare const GetVotingRecordsSchema: z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodString>;
    mepId: z.ZodOptional<z.ZodString>;
    topic: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
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
export declare const VotingRecordSchema: z.ZodObject<{
    id: z.ZodString;
    sessionId: z.ZodString;
    topic: z.ZodString;
    date: z.ZodString;
    documentReference: z.ZodOptional<z.ZodString>;
    voteType: z.ZodOptional<z.ZodEnum<{
        ROLL_CALL: "ROLL_CALL";
        SHOW_OF_HANDS: "SHOW_OF_HANDS";
        ELECTRONIC: "ELECTRONIC";
        SECRET_BALLOT: "SECRET_BALLOT";
    }>>;
    votesFor: z.ZodNumber;
    votesAgainst: z.ZodNumber;
    abstentions: z.ZodNumber;
    absent: z.ZodOptional<z.ZodNumber>;
    result: z.ZodEnum<{
        POSTPONED: "POSTPONED";
        ADOPTED: "ADOPTED";
        REJECTED: "REJECTED";
        WITHDRAWN: "WITHDRAWN";
        REFERRED_BACK: "REFERRED_BACK";
        SPLIT_VOTE: "SPLIT_VOTE";
        LAPSED: "LAPSED";
    }>;
    percentageFor: z.ZodOptional<z.ZodNumber>;
    isRollCall: z.ZodOptional<z.ZodBoolean>;
    detailedResultsUrl: z.ZodOptional<z.ZodURL>;
    requiredMajority: z.ZodOptional<z.ZodString>;
    mepVotes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEnum<{
        FOR: "FOR";
        AGAINST: "AGAINST";
        ABSTAIN: "ABSTAIN";
        ABSENT: "ABSENT";
        DID_NOT_VOTE: "DID_NOT_VOTE";
    }>>>;
}, z.core.$strip>;
/**
 * Document type enum (extended)
 *
 * Types of European Parliament documents.
 * Extended to include more document categories.
 */
declare const DocumentTypeSchema: z.ZodEnum<{
    REPORT: "REPORT";
    RESOLUTION: "RESOLUTION";
    DECISION: "DECISION";
    DIRECTIVE: "DIRECTIVE";
    REGULATION: "REGULATION";
    OPINION: "OPINION";
    AMENDMENT: "AMENDMENT";
    QUESTION: "QUESTION";
    MOTION: "MOTION";
    PROPOSAL: "PROPOSAL";
    COMMUNICATION: "COMMUNICATION";
    RECOMMENDATION: "RECOMMENDATION";
    WHITE_PAPER: "WHITE_PAPER";
    GREEN_PAPER: "GREEN_PAPER";
    OTHER: "OTHER";
}>;
export type DocumentType = z.infer<typeof DocumentTypeSchema>;
/**
 * Document status enum (extended)
 *
 * Legislative stages and document statuses.
 * Extended to include more legislative stages.
 */
export declare const DocumentStatusSchema: z.ZodEnum<{
    PLENARY: "PLENARY";
    ADOPTED: "ADOPTED";
    REJECTED: "REJECTED";
    WITHDRAWN: "WITHDRAWN";
    LAPSED: "LAPSED";
    DRAFT: "DRAFT";
    SUBMITTED: "SUBMITTED";
    IN_COMMITTEE: "IN_COMMITTEE";
    COMMITTEE_VOTE: "COMMITTEE_VOTE";
    PLENARY_VOTE: "PLENARY_VOTE";
    FIRST_READING: "FIRST_READING";
    SECOND_READING: "SECOND_READING";
    THIRD_READING: "THIRD_READING";
    CONCILIATION: "CONCILIATION";
}>;
export type DocumentStatus = z.infer<typeof DocumentStatusSchema>;
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
export declare const RelatedDocumentSchema: z.ZodObject<{
    id: z.core.$ZodBranded<z.ZodString, "DocumentId", "out">;
    relationshipType: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type RelatedDocument = z.infer<typeof RelatedDocumentSchema>;
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
export declare const RapporteurSchema: z.ZodObject<{
    mepId: z.ZodString;
    mepName: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type Rapporteur = z.infer<typeof RapporteurSchema>;
/**
 * Search documents input schema
 *
 * Query parameters for document search.
 *
 * ISMS Policy: SC-002 (Input Validation)
 */
export declare const SearchDocumentsSchema: z.ZodObject<{
    keyword: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    documentType: z.ZodOptional<z.ZodEnum<{
        REPORT: "REPORT";
        RESOLUTION: "RESOLUTION";
        DECISION: "DECISION";
        DIRECTIVE: "DIRECTIVE";
        REGULATION: "REGULATION";
        OPINION: "OPINION";
        AMENDMENT: "AMENDMENT";
        QUESTION: "QUESTION";
        MOTION: "MOTION";
        PROPOSAL: "PROPOSAL";
        COMMUNICATION: "COMMUNICATION";
        RECOMMENDATION: "RECOMMENDATION";
        WHITE_PAPER: "WHITE_PAPER";
        GREEN_PAPER: "GREEN_PAPER";
        OTHER: "OTHER";
    }>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    committee: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
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
export declare const LegislativeDocumentSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<{
        REPORT: "REPORT";
        RESOLUTION: "RESOLUTION";
        DECISION: "DECISION";
        DIRECTIVE: "DIRECTIVE";
        REGULATION: "REGULATION";
        OPINION: "OPINION";
        AMENDMENT: "AMENDMENT";
        QUESTION: "QUESTION";
        MOTION: "MOTION";
        PROPOSAL: "PROPOSAL";
        COMMUNICATION: "COMMUNICATION";
        RECOMMENDATION: "RECOMMENDATION";
        WHITE_PAPER: "WHITE_PAPER";
        GREEN_PAPER: "GREEN_PAPER";
        OTHER: "OTHER";
    }>;
    title: z.ZodString;
    subtitle: z.ZodOptional<z.ZodString>;
    summary: z.ZodOptional<z.ZodString>;
    date: z.ZodString;
    status: z.ZodEnum<{
        PLENARY: "PLENARY";
        ADOPTED: "ADOPTED";
        REJECTED: "REJECTED";
        WITHDRAWN: "WITHDRAWN";
        LAPSED: "LAPSED";
        DRAFT: "DRAFT";
        SUBMITTED: "SUBMITTED";
        IN_COMMITTEE: "IN_COMMITTEE";
        COMMITTEE_VOTE: "COMMITTEE_VOTE";
        PLENARY_VOTE: "PLENARY_VOTE";
        FIRST_READING: "FIRST_READING";
        SECOND_READING: "SECOND_READING";
        THIRD_READING: "THIRD_READING";
        CONCILIATION: "CONCILIATION";
    }>;
    authors: z.ZodDefault<z.ZodArray<z.ZodString>>;
    rapporteur: z.ZodOptional<z.ZodObject<{
        mepId: z.ZodString;
        mepName: z.ZodOptional<z.ZodString>;
        role: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    shadowRapporteurs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        mepId: z.ZodString;
        mepName: z.ZodOptional<z.ZodString>;
        role: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    committee: z.ZodOptional<z.ZodString>;
    procedureReference: z.ZodOptional<z.ZodString>;
    procedureType: z.ZodOptional<z.ZodString>;
    languages: z.ZodOptional<z.ZodArray<z.ZodString>>;
    pdfUrl: z.ZodOptional<z.ZodURL>;
    xmlUrl: z.ZodOptional<z.ZodURL>;
    htmlUrl: z.ZodOptional<z.ZodURL>;
    relatedDocuments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.core.$ZodBranded<z.ZodString, "DocumentId", "out">;
        relationshipType: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    subjects: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
/**
 * Committee type enum
 *
 * Types of European Parliament bodies.
 */
export declare const CommitteeTypeSchema: z.ZodEnum<{
    SPECIAL: "SPECIAL";
    STANDING: "STANDING";
    SUBCOMMITTEE: "SUBCOMMITTEE";
    DELEGATION: "DELEGATION";
    JOINT: "JOINT";
}>;
export type CommitteeType = z.infer<typeof CommitteeTypeSchema>;
/**
 * Get committee info input schema
 *
 * Query parameters for fetching committee information.
 *
 * ISMS Policy: SC-002 (Input Validation)
 */
export declare const GetCommitteeInfoSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    abbreviation: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
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
export declare const CommitteeSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    abbreviation: z.ZodString;
    type: z.ZodOptional<z.ZodEnum<{
        SPECIAL: "SPECIAL";
        STANDING: "STANDING";
        SUBCOMMITTEE: "SUBCOMMITTEE";
        DELEGATION: "DELEGATION";
        JOINT: "JOINT";
    }>>;
    parentCommittee: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "CommitteeId", "out">>;
    subcommittees: z.ZodOptional<z.ZodArray<z.core.$ZodBranded<z.ZodString, "CommitteeId", "out">>>;
    members: z.ZodDefault<z.ZodArray<z.ZodString>>;
    memberCount: z.ZodOptional<z.ZodNumber>;
    chair: z.ZodOptional<z.ZodString>;
    viceChairs: z.ZodOptional<z.ZodArray<z.ZodString>>;
    meetingSchedule: z.ZodOptional<z.ZodArray<z.ZodString>>;
    meetingLocations: z.ZodOptional<z.ZodArray<z.ZodString>>;
    responsibilities: z.ZodOptional<z.ZodArray<z.ZodString>>;
    websiteUrl: z.ZodOptional<z.ZodURL>;
    contactEmail: z.ZodOptional<z.ZodEmail>;
}, z.core.$strip>;
/**
 * Question type enum (extended)
 *
 * Types of parliamentary questions.
 */
export declare const QuestionTypeSchema: z.ZodEnum<{
    WRITTEN: "WRITTEN";
    ORAL: "ORAL";
    PRIORITY: "PRIORITY";
    QUESTION_TIME: "QUESTION_TIME";
    MAJOR_INTERPELLATION: "MAJOR_INTERPELLATION";
    WRITTEN_WITH_ANSWER: "WRITTEN_WITH_ANSWER";
}>;
export type QuestionType = z.infer<typeof QuestionTypeSchema>;
/**
 * Question status enum (extended)
 *
 * Status of parliamentary questions.
 */
export declare const QuestionStatusSchema: z.ZodEnum<{
    WITHDRAWN: "WITHDRAWN";
    PENDING: "PENDING";
    ANSWERED: "ANSWERED";
    OVERDUE: "OVERDUE";
}>;
export type QuestionStatus = z.infer<typeof QuestionStatusSchema>;
/**
 * Question addressee enum
 *
 * EU institutions that can be addressed in questions.
 */
export declare const QuestionAddresseeSchema: z.ZodEnum<{
    COMMISSION: "COMMISSION";
    COUNCIL: "COUNCIL";
    EUROPEAN_COUNCIL: "EUROPEAN_COUNCIL";
    HIGH_REPRESENTATIVE: "HIGH_REPRESENTATIVE";
    ECB: "ECB";
}>;
export type QuestionAddressee = z.infer<typeof QuestionAddresseeSchema>;
/**
 * Get parliamentary questions input schema
 *
 * Query parameters for fetching parliamentary questions.
 *
 * ISMS Policy: SC-002 (Input Validation)
 */
export declare const GetParliamentaryQuestionsSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<{
        WRITTEN: "WRITTEN";
        ORAL: "ORAL";
        PRIORITY: "PRIORITY";
        QUESTION_TIME: "QUESTION_TIME";
        MAJOR_INTERPELLATION: "MAJOR_INTERPELLATION";
        WRITTEN_WITH_ANSWER: "WRITTEN_WITH_ANSWER";
    }>>;
    author: z.ZodOptional<z.ZodString>;
    topic: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        WITHDRAWN: "WITHDRAWN";
        PENDING: "PENDING";
        ANSWERED: "ANSWERED";
        OVERDUE: "OVERDUE";
    }>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
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
export declare const ParliamentaryQuestionSchema: z.ZodObject<{
    id: z.ZodString;
    reference: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<{
        WRITTEN: "WRITTEN";
        ORAL: "ORAL";
        PRIORITY: "PRIORITY";
        QUESTION_TIME: "QUESTION_TIME";
        MAJOR_INTERPELLATION: "MAJOR_INTERPELLATION";
        WRITTEN_WITH_ANSWER: "WRITTEN_WITH_ANSWER";
    }>;
    author: z.ZodString;
    coAuthors: z.ZodOptional<z.ZodArray<z.ZodString>>;
    date: z.ZodString;
    topic: z.ZodString;
    questionText: z.ZodString;
    addressee: z.ZodOptional<z.ZodEnum<{
        COMMISSION: "COMMISSION";
        COUNCIL: "COUNCIL";
        EUROPEAN_COUNCIL: "EUROPEAN_COUNCIL";
        HIGH_REPRESENTATIVE: "HIGH_REPRESENTATIVE";
        ECB: "ECB";
    }>>;
    isPriority: z.ZodOptional<z.ZodBoolean>;
    status: z.ZodEnum<{
        WITHDRAWN: "WITHDRAWN";
        PENDING: "PENDING";
        ANSWERED: "ANSWERED";
        OVERDUE: "OVERDUE";
    }>;
    answerText: z.ZodOptional<z.ZodString>;
    answerDate: z.ZodOptional<z.ZodString>;
    answeredBy: z.ZodOptional<z.ZodString>;
    subjects: z.ZodOptional<z.ZodArray<z.ZodString>>;
    language: z.ZodOptional<z.ZodString>;
    documentUrl: z.ZodOptional<z.ZodURL>;
}, z.core.$strip>;
/**
 * Analyze voting patterns input schema
 *
 * Query parameters for voting pattern analysis.
 *
 * ISMS Policy: SC-002 (Input Validation)
 */
export declare const AnalyzeVotingPatternsSchema: z.ZodObject<{
    mepId: z.ZodString;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    compareWithGroup: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
/**
 * Track legislation input schema
 *
 * Query parameters for tracking legislative procedures.
 *
 * ISMS Policy: SC-002 (Input Validation)
 */
export declare const TrackLegislationSchema: z.ZodObject<{
    procedureId: z.ZodString;
}, z.core.$strip>;
/**
 * Report type enum
 *
 * Types of reports that can be generated.
 */
export declare const ReportTypeSchema: z.ZodEnum<{
    MEP_ACTIVITY: "MEP_ACTIVITY";
    COMMITTEE_PERFORMANCE: "COMMITTEE_PERFORMANCE";
    VOTING_STATISTICS: "VOTING_STATISTICS";
    LEGISLATION_PROGRESS: "LEGISLATION_PROGRESS";
}>;
export type ReportType = z.infer<typeof ReportTypeSchema>;
/**
 * Generate report input schema
 *
 * Query parameters for report generation.
 *
 * ISMS Policy: SC-002 (Input Validation)
 */
export declare const GenerateReportSchema: z.ZodObject<{
    reportType: z.ZodEnum<{
        MEP_ACTIVITY: "MEP_ACTIVITY";
        COMMITTEE_PERFORMANCE: "COMMITTEE_PERFORMANCE";
        VOTING_STATISTICS: "VOTING_STATISTICS";
        LEGISLATION_PROGRESS: "LEGISLATION_PROGRESS";
    }>;
    subjectId: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
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
export declare const PaginatedResponseSchema: <T extends z.ZodType>(dataSchema: T) => z.ZodObject<{
    data: z.ZodArray<T>;
    total: z.ZodNumber;
    limit: z.ZodNumber;
    offset: z.ZodNumber;
    hasMore: z.ZodBoolean;
}>;
/**
 * Type inference exports for TypeScript
 *
 * These types are automatically inferred from the Zod schemas above.
 * Use these types throughout the application for type safety.
 *
 * @example
 * ```typescript
 * import type { MEP, VotingRecord } from './schemas/europeanParliament.js';
 *
 * function processMEP(mep: MEP): void {
 *   console.log(mep.name);
 * }
 * ```
 */
export type MEP = z.infer<typeof MEPSchema>;
export type MEPDetails = z.infer<typeof MEPDetailsSchema>;
export type PlenarySession = z.infer<typeof PlenarySessionSchema>;
export type VotingRecord = z.infer<typeof VotingRecordSchema>;
export type LegislativeDocument = z.infer<typeof LegislativeDocumentSchema>;
export type Committee = z.infer<typeof CommitteeSchema>;
export type ParliamentaryQuestion = z.infer<typeof ParliamentaryQuestionSchema>;
/**
 * Paginated response types
 */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}
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
export declare function safeValidate<T extends z.ZodType>(schema: T, data: unknown): {
    success: true;
    data: z.infer<T>;
} | {
    success: false;
    errors: z.ZodError;
};
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
export declare function formatValidationErrors(error: z.ZodError): string[];
/**
 * EU member states (ISO 3166-1 alpha-2 codes)
 *
 * All 27 EU member states as of 2024.
 */
export declare const EU_MEMBER_STATES: Set<string>;
/**
 * EU official languages (ISO 639-1 codes)
 *
 * All 24 official languages of the European Union.
 */
export declare const EU_LANGUAGES: Set<string>;
/**
 * European Parliament political groups
 *
 * Current political groups in the European Parliament (as of 2024).
 */
export declare const EP_PARTY_GROUPS: Set<string>;
export {};
//# sourceMappingURL=europeanParliament.d.ts.map