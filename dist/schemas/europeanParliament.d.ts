/**
 * Zod validation schemas for European Parliament data
 *
 * ISMS Policy: SC-002 (Input Validation), SI-10 (Information Input Validation)
 */
import { z } from 'zod';
/**
 * Get MEPs input schema
 */
export declare const GetMEPsSchema: any;
/**
 * Get MEP details input schema
 */
export declare const GetMEPDetailsSchema: any;
/**
 * MEP output schema
 */
export declare const MEPSchema: any;
/**
 * MEP details output schema
 */
export declare const MEPDetailsSchema: any;
/**
 * Get plenary sessions input schema
 */
export declare const GetPlenarySessionsSchema: any;
/**
 * Plenary session output schema
 */
export declare const PlenarySessionSchema: any;
/**
 * Get voting records input schema
 */
export declare const GetVotingRecordsSchema: any;
/**
 * Voting record output schema
 */
export declare const VotingRecordSchema: any;
/**
 * Search documents input schema
 */
export declare const SearchDocumentsSchema: any;
/**
 * Legislative document output schema
 */
export declare const LegislativeDocumentSchema: any;
/**
 * Get committee info input schema
 */
export declare const GetCommitteeInfoSchema: any;
/**
 * Committee output schema
 */
export declare const CommitteeSchema: any;
/**
 * Get parliamentary questions input schema
 */
export declare const GetParliamentaryQuestionsSchema: any;
/**
 * Parliamentary question output schema
 */
export declare const ParliamentaryQuestionSchema: any;
/**
 * Analyze voting patterns input schema
 */
export declare const AnalyzeVotingPatternsSchema: any;
/**
 * Track legislation input schema
 */
export declare const TrackLegislationSchema: any;
/**
 * Generate report input schema
 */
export declare const GenerateReportSchema: any;
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