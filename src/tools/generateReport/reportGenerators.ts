/**
 * Report generators for different report types
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import type { z } from 'zod';
import type { GenerateReportSchema } from '../../schemas/europeanParliament.js';
import { epClient } from '../../clients/europeanParliamentClient.js';
import { auditLogger, toErrorMessage } from '../../utils/auditLogger.js';
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

/** Fetch question count for an MEP (null if unavailable) */
async function fetchQuestionCount(subjectId: string | undefined): Promise<number | null> {
  if (subjectId === undefined) return null;
  try {
    const questions = await epClient.getParliamentaryQuestions({ author: subjectId, limit: 100 });
    return questions.data.length;
  } catch (error: unknown) {
    auditLogger.logError('generate_report.fetch_question_count', { subjectId }, toErrorMessage(error));
    return null;
  }
}

/** Fetch committee document count for a year (null if unavailable) */
async function fetchDocumentCount(year: number): Promise<number | null> {
  try {
    const docs = await epClient.getCommitteeDocuments({ year, limit: 100 });
    return docs.data.length;
  } catch (error: unknown) {
    auditLogger.logError('generate_report.fetch_document_count', { year }, toErrorMessage(error));
    return null;
  }
}

/** Fetch adopted text count for a year (null if unavailable) */
async function fetchAdoptedTextCount(year: number): Promise<number | null> {
  try {
    const adopted = await epClient.getAdoptedTexts({ year, limit: 100 });
    return adopted.data.length;
  } catch (error: unknown) {
    auditLogger.logError('generate_report.fetch_adopted_text_count', { year }, toErrorMessage(error));
    return null;
  }
}

/** Fetch plenary session count for a date range (null if unavailable) */
async function fetchSessionCount(dateFrom: string, dateTo: string): Promise<number | null> {
  try {
    const year = parseInt(dateFrom.substring(0, 4), 10);
    const sessions = await epClient.getPlenarySessions({ year, limit: 100 });
    return sessions.data.length;
  } catch (error: unknown) {
    auditLogger.logError('generate_report.fetch_session_count', { dateFrom, dateTo }, toErrorMessage(error));
    return null;
  }
}

/** Fetch procedure count for a year (null if unavailable) */
async function fetchProcedureCount(year: number): Promise<number | null> {
  try {
    const procedures = await epClient.getProcedures({ year, limit: 100 });
    return procedures.data.length;
  } catch (error: unknown) {
    auditLogger.logError('generate_report.fetch_procedure_count', { year }, toErrorMessage(error));
    return null;
  }
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
  const questionsSubmitted = await fetchQuestionCount(params.subjectId);
  
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
      questionsSubmitted: questionsSubmitted ?? 0,
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
  const year = parseInt(dateFrom.substring(0, 4), 10);

  // Parliament-wide counts (not filtered by committee)
  const documentsProduced = await fetchDocumentCount(year);
  const reportsProduced = await fetchAdoptedTextCount(year);
  
  return {
    reportType: 'COMMITTEE_PERFORMANCE',
    subject: committeeName,
    period: {
      from: dateFrom,
      to: dateTo
    },
    generatedAt: new Date().toISOString(),
    summary: `Performance report for ${committeeName} committee. Note: document and adopted text counts are parliament-wide lower bounds (first page, not filtered by committee).`,
    sections: [
      createMeetingActivitySection(0),
      createLegislativeOutputSection(reportsProduced, documentsProduced),
      createMemberParticipationSection(membersLength)
    ],
    statistics: {
      meetingsHeld: 0, // EP API does not provide committee-specific meeting counts
      reportsProduced: reportsProduced ?? 0,
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
  const year = parseInt(dateFrom.substring(0, 4), 10);

  const sessionCount = await fetchSessionCount(dateFrom, dateTo);
  const adoptedCount = await fetchAdoptedTextCount(year);
  
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
      totalSessions: sessionCount ?? 0,
      adopted: adoptedCount ?? 0,
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

  const procedureCount = await fetchProcedureCount(year);
  const completedCount = await fetchAdoptedTextCount(year);
  const ongoingCount = (procedureCount !== null && completedCount !== null)
    ? Math.max(0, procedureCount - completedCount)
    : null;
  
  return {
    reportType: 'LEGISLATION_PROGRESS',
    subject: 'Legislative Activity Overview',
    period: {
      from: dateFrom,
      to: dateTo
    },
    generatedAt: new Date().toISOString(),
    summary: 'Progress report on legislative procedures based on EP Open Data (lower bounds, first page).',
    sections: [
      createNewProposalsSection(procedureCount),
      createCompletedProceduresSection(completedCount),
      createOngoingProceduresSection(ongoingCount)
    ],
    statistics: {
      totalProcedures: procedureCount ?? 0,
      completed: completedCount ?? 0,
      ongoing: ongoingCount ?? 0
    }
  };
}
