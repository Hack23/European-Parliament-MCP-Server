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
export function createVotingSection(
  totalVotes: number, 
  mep: MEPDetails | null
): ReportSection {
  const section: ReportSection = {
    title: 'Voting Activity',
    content: `The MEP participated in ${String(totalVotes)} votes during this period.`
  };
  
  if (mep?.votingStatistics !== undefined) {
    section.data = { votingStatistics: mep.votingStatistics };
  }
  
  return section;
}

/**
 * Create committee involvement section
 * Cyclomatic complexity: 1
 */
export function createCommitteeSection(
  committeesLength: number, 
  mep: MEPDetails | null
): ReportSection {
  return {
    title: 'Committee Involvement',
    content: `Active member of ${String(committeesLength)} committees.`,
    data: { committees: mep?.committees }
  };
}

/**
 * Create parliamentary questions section with real data
 * Cyclomatic complexity: 1
 */
export function createParliamentaryQuestionsSection(questionsCount: number | null): ReportSection {
  return {
    title: 'Parliamentary Questions',
    content: questionsCount !== null
      ? `${String(questionsCount)} parliamentary questions found in EP Open Data (lower bound, first page).`
      : 'Parliamentary questions data not available from EP API.'
  };
}

/**
 * Create meeting activity section with real data
 * Cyclomatic complexity: 1
 */
export function createMeetingActivitySection(meetingsCount: number): ReportSection {
  return {
    title: 'Meeting Activity',
    content: meetingsCount > 0
      ? `${String(meetingsCount)} meetings recorded in EP Open Data during this period.`
      : 'Meeting count data not available from EP API for this filter.'
  };
}

/**
 * Create legislative output section with real data
 * Cyclomatic complexity: 1
 */
export function createLegislativeOutputSection(reportsCount: number | null, documentsCount: number | null): ReportSection {
  if (reportsCount === null && documentsCount === null) {
    return {
      title: 'Legislative Output',
      content: 'Legislative output data not available from EP API.'
    };
  }
  const parts: string[] = [];
  if (reportsCount !== null) parts.push(`${String(reportsCount)} adopted texts`);
  if (documentsCount !== null) parts.push(`${String(documentsCount)} committee documents`);
  return {
    title: 'Legislative Output',
    content: `${parts.join(' and ')} found in EP Open Data (parliament-wide lower bound, first page).`
  };
}

/**
 * Create member participation section
 * Cyclomatic complexity: 1
 */
export function createMemberParticipationSection(memberCount: number): ReportSection {
  return {
    title: 'Member Participation',
    content: `${String(memberCount)} members listed in EP Open Data. Attendance rate data not available from EP API.`
  };
}

/**
 * Create overall voting activity section with real data
 * Cyclomatic complexity: 1
 */
export function createOverallVotingSection(sessionCount: number | null): ReportSection {
  return {
    title: 'Overall Voting Activity',
    content: sessionCount !== null
      ? `${String(sessionCount)} plenary sessions found in EP Open Data for this period (lower bound, first page).`
      : 'Plenary session data not available from EP API.'
  };
}

/**
 * Create adoption rates section with real data
 * Cyclomatic complexity: 1
 */
export function createAdoptionRatesSection(adoptedCount: number | null): ReportSection {
  return {
    title: 'Adoption Rates',
    content: adoptedCount !== null
      ? `${String(adoptedCount)} adopted texts found in EP Open Data for this period (lower bound, first page).`
      : 'Adopted texts data not available from EP API.'
  };
}

/**
 * Create political group alignment section
 * Cyclomatic complexity: 1
 */
export function createPoliticalGroupSection(): ReportSection {
  return {
    title: 'Political Group Alignment',
    content: 'Political group voting alignment data can be analyzed via the compare_political_groups tool.'
  };
}

/**
 * Create new proposals section with real data
 * Cyclomatic complexity: 1
 */
export function createNewProposalsSection(procedureCount: number | null): ReportSection {
  return {
    title: 'New Proposals',
    content: procedureCount !== null
      ? `${String(procedureCount)} legislative procedures found in EP Open Data for this period (lower bound, first page).`
      : 'Legislative procedures data not available from EP API.'
  };
}

/**
 * Create completed procedures section with real data
 * Cyclomatic complexity: 1
 */
export function createCompletedProceduresSection(completedCount: number | null): ReportSection {
  return {
    title: 'Completed Procedures',
    content: completedCount !== null
      ? `${String(completedCount)} adopted texts recorded as completed in EP Open Data (lower bound, first page).`
      : 'Completed procedures data not available from EP API.'
  };
}

/**
 * Create ongoing procedures section with real data
 * Cyclomatic complexity: 1
 */
export function createOngoingProceduresSection(ongoingCount: number | null): ReportSection {
  return {
    title: 'Ongoing Procedures',
    content: ongoingCount !== null
      ? `${String(ongoingCount)} procedures estimated as ongoing (total procedures minus adopted texts, lower bound).`
      : 'Ongoing procedures data not available from EP API.'
  };
}
