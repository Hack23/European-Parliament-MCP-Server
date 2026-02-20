/**
 * Report section builders
 *
 * ISMS Policy: SC-002 (Input Validation)
 */
import type { MEPDetails } from '../../types/europeanParliament.js';
import type { ReportSection } from './types.js';
/**
 * Create voting activity section
 * Cyclomatic complexity: 2
 */
export declare function createVotingSection(totalVotes: number, mep: MEPDetails | null): ReportSection;
/**
 * Create committee involvement section
 * Cyclomatic complexity: 1
 */
export declare function createCommitteeSection(committeesLength: number, mep: MEPDetails | null): ReportSection;
/**
 * Create parliamentary questions section
 * Cyclomatic complexity: 1
 */
export declare function createParliamentaryQuestionsSection(): ReportSection;
/**
 * Create meeting activity section
 * Cyclomatic complexity: 1
 */
export declare function createMeetingActivitySection(): ReportSection;
/**
 * Create legislative output section
 * Cyclomatic complexity: 1
 */
export declare function createLegislativeOutputSection(): ReportSection;
/**
 * Create member participation section
 * Cyclomatic complexity: 1
 */
export declare function createMemberParticipationSection(memberCount: number): ReportSection;
/**
 * Create overall voting activity section
 * Cyclomatic complexity: 1
 */
export declare function createOverallVotingSection(): ReportSection;
/**
 * Create adoption rates section
 * Cyclomatic complexity: 1
 */
export declare function createAdoptionRatesSection(): ReportSection;
/**
 * Create political group alignment section
 * Cyclomatic complexity: 1
 */
export declare function createPoliticalGroupSection(): ReportSection;
/**
 * Create new proposals section
 * Cyclomatic complexity: 1
 */
export declare function createNewProposalsSection(): ReportSection;
/**
 * Create completed procedures section
 * Cyclomatic complexity: 1
 */
export declare function createCompletedProceduresSection(): ReportSection;
/**
 * Create ongoing procedures section
 * Cyclomatic complexity: 1
 */
export declare function createOngoingProceduresSection(): ReportSection;
//# sourceMappingURL=reportBuilders.d.ts.map