/**
 * Report generators for different report types
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import type { z } from 'zod';
import type { GenerateReportSchema } from '../../schemas/europeanParliament.js';
import { epClient } from '../../clients/europeanParliamentClient.js';
import type { MEPDetails } from '../../types/europeanParliament.js';
import type { Report } from './types.js';
import {
  createVotingSection,
  createCommitteeSection,
  createParliamentaryQuestionsSection,
  createMeetingActivitySection,
  createLegislativeOutputSection,
  createMemberParticipationSection,
  createOverallVotingSection,
  createAdoptionRatesSection,
  createPoliticalGroupSection,
  createNewProposalsSection,
  createCompletedProceduresSection,
  createOngoingProceduresSection
} from './reportBuilders.js';

/**
 * Extract MEP data for report generation
 * Cyclomatic complexity: 1
 */
function extractMEPData(
  params: z.infer<typeof GenerateReportSchema>, 
  mep: MEPDetails | null
): {
  mepName: string;
  dateFrom: string;
  dateTo: string;
  totalVotes: number;
  committeesLength: number;
} {
  return {
    mepName: mep?.name ?? 'Unknown MEP',
    dateFrom: params.dateFrom ?? '2024-01-01',
    dateTo: params.dateTo ?? '2024-12-31',
    totalVotes: mep?.votingStatistics?.totalVotes ?? 0,
    committeesLength: mep?.committees.length ?? 0
  };
}

/**
 * Generate MEP activity report using real EP API data
 * Cyclomatic complexity: 2
 */
export async function generateMEPActivityReport(
  params: z.infer<typeof GenerateReportSchema>
): Promise<Report> {
  const mep = params.subjectId !== undefined 
    ? await epClient.getMEPDetails(params.subjectId) 
    : null;
  const data = extractMEPData(params, mep);

  // Fetch real parliamentary questions for this MEP
  // Use data.length instead of total because total is a lower-bound estimate
  let questionsSubmitted = 0;
  try {
    if (params.subjectId !== undefined) {
      const questions = await epClient.getParliamentaryQuestions({
        author: params.subjectId,
        limit: 100
      });
      questionsSubmitted = questions.data.length;
    }
  } catch {
    // Questions may not be available — report zero
  }
  
  return {
    reportType: 'MEP_ACTIVITY',
    subject: data.mepName,
    period: {
      from: data.dateFrom,
      to: data.dateTo
    },
    generatedAt: new Date().toISOString(),
    summary: `Activity report for ${data.mepName} covering the period from ${data.dateFrom} to ${data.dateTo}.`,
    sections: [
      createVotingSection(data.totalVotes, mep),
      createCommitteeSection(data.committeesLength, mep),
      createParliamentaryQuestionsSection(questionsSubmitted)
    ],
    statistics: {
      totalVotes: mep?.votingStatistics?.totalVotes ?? 0,
      attendanceRate: mep?.votingStatistics?.attendanceRate ?? 0,
      questionsSubmitted,
      reportsAuthored: 0 // EP API does not provide per-MEP report authorship counts
    },
    recommendations: [
      'Continue active participation in committee work',
      'Increase engagement with constituents',
      'Consider authoring legislation on key policy areas'
    ]
  };
}

/**
 * Generate committee performance report using real EP API data
 * Cyclomatic complexity: 2
 */
export async function generateCommitteePerformanceReport(
  params: z.infer<typeof GenerateReportSchema>
): Promise<Report> {
  const committee = params.subjectId !== undefined 
    ? await epClient.getCommitteeInfo({ id: params.subjectId }) 
    : null;
  const committeeName = committee?.name ?? 'Unknown Committee';
  const dateFrom = params.dateFrom ?? '2024-01-01';
  const dateTo = params.dateTo ?? '2024-12-31';
  const membersLength = committee?.members.length ?? 0;

  // Fetch real document data from EP API (parliament-wide, not committee-specific)
  // Use data.length instead of total because total is a lower-bound estimate
  let documentsProduced = 0;
  try {
    const year = parseInt(dateFrom.substring(0, 4), 10);
    const docs = await epClient.getCommitteeDocuments({ year, limit: 100 });
    documentsProduced = docs.data.length;
  } catch {
    // Documents may not be available — report zero
  }

  // Fetch real adopted texts (parliament-wide, not committee-specific)
  let reportsProduced = 0;
  try {
    const year = parseInt(dateFrom.substring(0, 4), 10);
    const adopted = await epClient.getAdoptedTexts({ year, limit: 100 });
    reportsProduced = adopted.data.length;
  } catch {
    // Adopted texts may not be available — report zero
  }
  
  return {
    reportType: 'COMMITTEE_PERFORMANCE',
    subject: committeeName,
    period: {
      from: dateFrom,
      to: dateTo
    },
    generatedAt: new Date().toISOString(),
    summary: `Performance report for ${committeeName} committee.`,
    sections: [
      createMeetingActivitySection(0),
      createLegislativeOutputSection(reportsProduced, documentsProduced),
      createMemberParticipationSection(membersLength)
    ],
    statistics: {
      meetingsHeld: 0, // EP API does not provide committee-specific meeting counts
      reportsProduced,
      opinionsIssued: 0, // EP API does not provide committee-specific opinion counts
      averageAttendance: 0, // EP API does not provide attendance data
      memberCount: membersLength
    }
  };
}

/**
 * Generate voting statistics report using real EP API data
 * Cyclomatic complexity: 1
 */
export async function generateVotingStatisticsReport(
  params: z.infer<typeof GenerateReportSchema>
): Promise<Report> {
  const dateFrom = params.dateFrom ?? '2024-01-01';
  const dateTo = params.dateTo ?? '2024-12-31';

  // Fetch real plenary session data (use data.length, not total)
  let sessionCount = 0;
  try {
    const sessions = await epClient.getPlenarySessions({
      dateFrom, dateTo, limit: 100
    });
    sessionCount = sessions.data.length;
  } catch {
    // Sessions may not be available — report zero
  }

  // Fetch real adopted texts (use data.length, not total)
  let adoptedCount = 0;
  try {
    const year = parseInt(dateFrom.substring(0, 4), 10);
    const adopted = await epClient.getAdoptedTexts({ year, limit: 100 });
    adoptedCount = adopted.data.length;
  } catch {
    // Adopted texts may not be available — report zero
  }
  
  return {
    reportType: 'VOTING_STATISTICS',
    subject: 'Parliament-wide Voting Analysis',
    period: {
      from: dateFrom,
      to: dateTo
    },
    generatedAt: new Date().toISOString(),
    summary: 'Comprehensive voting statistics for European Parliament based on EP Open Data.',
    sections: [
      createOverallVotingSection(sessionCount),
      createAdoptionRatesSection(adoptedCount),
      createPoliticalGroupSection()
    ],
    statistics: {
      totalSessions: sessionCount,
      adopted: adoptedCount,
      averageTurnout: 0 // EP API does not provide turnout data
    }
  };
}

/**
 * Generate legislation progress report using real EP API data
 * Cyclomatic complexity: 1
 */
export async function generateLegislationProgressReport(
  params: z.infer<typeof GenerateReportSchema>
): Promise<Report> {
  const dateFrom = params.dateFrom ?? '2024-01-01';
  const dateTo = params.dateTo ?? '2024-12-31';
  const year = parseInt(dateFrom.substring(0, 4), 10);

  // Fetch real procedure data (use data.length, not total)
  let procedureCount = 0;
  try {
    const procedures = await epClient.getProcedures({ year, limit: 100 });
    procedureCount = procedures.data.length;
  } catch {
    // Procedures may not be available — report zero
  }

  // Fetch real adopted texts (use data.length, not total)
  let completedCount = 0;
  try {
    const adopted = await epClient.getAdoptedTexts({ year, limit: 100 });
    completedCount = adopted.data.length;
  } catch {
    // Adopted texts may not be available — report zero
  }

  const ongoingCount = Math.max(0, procedureCount - completedCount);
  
  return {
    reportType: 'LEGISLATION_PROGRESS',
    subject: 'Legislative Activity Overview',
    period: {
      from: dateFrom,
      to: dateTo
    },
    generatedAt: new Date().toISOString(),
    summary: 'Progress report on legislative procedures based on EP Open Data.',
    sections: [
      createNewProposalsSection(procedureCount),
      createCompletedProceduresSection(completedCount),
      createOngoingProceduresSection(ongoingCount)
    ],
    statistics: {
      totalProcedures: procedureCount,
      completed: completedCount,
      ongoing: ongoingCount
    }
  };
}
