/**
 * Zod validation schemas for European Parliament data
 *
 * **Intelligence Perspective:** Schema definitions enforce data quality standards
 * critical for reliable intelligence analysis—invalid data produces flawed assessments.
 *
 * **Business Perspective:** Runtime validation ensures API reliability and data contract
 * compliance for enterprise customers with strict data quality requirements.
 *
 * **Marketing Perspective:** Comprehensive validation demonstrates enterprise-grade
 * data quality—key differentiator for developer trust and API adoption.
 *
 * ISMS Policy: SC-002 (Input Validation), SI-10 (Information Input Validation)
 */
import { z } from 'zod';
/**
 * Get MEPs input schema
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
 */
export declare const GetMEPDetailsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
/**
 * MEP output schema
 */
export declare const MEPSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    country: z.ZodString;
    politicalGroup: z.ZodString;
    committees: z.ZodArray<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    active: z.ZodBoolean;
    termStart: z.ZodString;
    termEnd: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * MEP details output schema
 */
export declare const MEPDetailsSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    country: z.ZodString;
    politicalGroup: z.ZodString;
    committees: z.ZodArray<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    active: z.ZodBoolean;
    termStart: z.ZodString;
    termEnd: z.ZodOptional<z.ZodString>;
    biography: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
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
 * Get plenary sessions input schema
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
 */
export declare const PlenarySessionSchema: z.ZodObject<{
    id: z.ZodString;
    date: z.ZodString;
    location: z.ZodString;
    agendaItems: z.ZodArray<z.ZodString>;
    votingRecords: z.ZodOptional<z.ZodArray<z.ZodString>>;
    attendanceCount: z.ZodOptional<z.ZodNumber>;
    documents: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
/**
 * Get voting records input schema
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
 * Voting record output schema
 */
export declare const VotingRecordSchema: z.ZodObject<{
    id: z.ZodString;
    sessionId: z.ZodString;
    topic: z.ZodString;
    date: z.ZodString;
    votesFor: z.ZodNumber;
    votesAgainst: z.ZodNumber;
    abstentions: z.ZodNumber;
    result: z.ZodEnum<{
        ADOPTED: "ADOPTED";
        REJECTED: "REJECTED";
    }>;
    mepVotes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEnum<{
        FOR: "FOR";
        AGAINST: "AGAINST";
        ABSTAIN: "ABSTAIN";
    }>>>;
}, z.core.$strip>;
/**
 * Search documents input schema
 */
export declare const SearchDocumentsSchema: z.ZodObject<{
    keyword: z.ZodString;
    documentType: z.ZodOptional<z.ZodEnum<{
        REPORT: "REPORT";
        RESOLUTION: "RESOLUTION";
        DECISION: "DECISION";
        DIRECTIVE: "DIRECTIVE";
        REGULATION: "REGULATION";
        OPINION: "OPINION";
        AMENDMENT: "AMENDMENT";
    }>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    committee: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
/**
 * Legislative document output schema
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
    }>;
    title: z.ZodString;
    date: z.ZodString;
    authors: z.ZodArray<z.ZodString>;
    committee: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<{
        ADOPTED: "ADOPTED";
        REJECTED: "REJECTED";
        DRAFT: "DRAFT";
        SUBMITTED: "SUBMITTED";
        IN_COMMITTEE: "IN_COMMITTEE";
        PLENARY: "PLENARY";
    }>;
    pdfUrl: z.ZodOptional<z.ZodString>;
    xmlUrl: z.ZodOptional<z.ZodString>;
    summary: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Get committee info input schema
 */
export declare const GetCommitteeInfoSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    abbreviation: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Committee output schema
 */
export declare const CommitteeSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    abbreviation: z.ZodString;
    members: z.ZodArray<z.ZodString>;
    chair: z.ZodOptional<z.ZodString>;
    viceChairs: z.ZodOptional<z.ZodArray<z.ZodString>>;
    meetingSchedule: z.ZodOptional<z.ZodArray<z.ZodString>>;
    responsibilities: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
/**
 * Get parliamentary questions input schema
 */
export declare const GetParliamentaryQuestionsSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<{
        WRITTEN: "WRITTEN";
        ORAL: "ORAL";
    }>>;
    author: z.ZodOptional<z.ZodString>;
    topic: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        PENDING: "PENDING";
        ANSWERED: "ANSWERED";
    }>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
/**
 * Parliamentary question output schema
 */
export declare const ParliamentaryQuestionSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<{
        WRITTEN: "WRITTEN";
        ORAL: "ORAL";
    }>;
    author: z.ZodString;
    date: z.ZodString;
    topic: z.ZodString;
    questionText: z.ZodString;
    answerText: z.ZodOptional<z.ZodString>;
    answerDate: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<{
        PENDING: "PENDING";
        ANSWERED: "ANSWERED";
    }>;
}, z.core.$strip>;
/**
 * Analyze voting patterns input schema
 */
export declare const AnalyzeVotingPatternsSchema: z.ZodObject<{
    mepId: z.ZodString;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    compareWithGroup: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
/**
 * Track legislation input schema
 */
export declare const TrackLegislationSchema: z.ZodObject<{
    procedureId: z.ZodString;
}, z.core.$strip>;
/**
 * Generate report input schema
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
 * Paginated response schema
 */
export declare const PaginatedResponseSchema: <T extends z.ZodType>(dataSchema: T) => z.ZodObject<{
    data: z.ZodArray<T>;
    total: z.ZodNumber;
    limit: z.ZodNumber;
    offset: z.ZodNumber;
    hasMore: z.ZodBoolean;
}>;
//# sourceMappingURL=europeanParliament.d.ts.map