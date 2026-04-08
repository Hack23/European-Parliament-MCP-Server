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
import { ToolError } from '../shared/errors.js';
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

/** Build data quality warnings for MEP activity report */
function buildMEPWarnings(
  mep: MEPDetails | null,
  questionsSubmitted: number | null
): string[] {
  const warnings: string[] = [];
  if (mep === null) {
    warnings.push('MEP details not available; subject ID was not provided.');
  }
  if (questionsSubmitted === null) {
    warnings.push('Parliamentary questions count unavailable from EP API.');
  }
  if (mep !== null && mep.votingStatistics === undefined) {
    warnings.push('Voting statistics not available for this MEP.');
  }
  warnings.push('Reports authored count is always zero; EP API does not provide per-MEP report authorship data.');
  return warnings;
}

/** Build data quality warnings for committee performance report */
function buildCommitteeWarnings(
  committee: { name: string; members: unknown[] } | null,
  documentsProduced: number | null,
  reportsProduced: number | null
): string[] {
  const warnings: string[] = [];
  if (committee === null) {
    warnings.push('Committee details not available; subject ID was not provided.');
  }
  if (documentsProduced === null) {
    warnings.push('Committee documents count unavailable from EP API.');
  }
  if (reportsProduced === null) {
    warnings.push('Adopted texts count unavailable from EP API.');
  }
  warnings.push('Meeting count is always zero; EP API does not provide committee-specific meeting counts.');
  warnings.push('Document and adopted text counts are parliament-wide (first page), not filtered by committee.');
  return warnings;
}

/** Build data quality warnings for voting statistics report */
function buildVotingWarnings(
  sessionCount: number | null,
  adoptedCount: number | null,
  dateFrom: string,
  dateTo: string
): string[] {
  const warnings: string[] = [];
  if (sessionCount === null) {
    warnings.push('Plenary session count unavailable from EP API.');
  }
  if (adoptedCount === null) {
    warnings.push('Adopted texts count unavailable from EP API.');
  }
  warnings.push('Average turnout is always zero; EP API does not provide turnout data.');
  warnings.push('Political group alignment requires the compare_political_groups tool for detailed analysis.');
  if (!isFullYearRange(dateFrom, dateTo)) {
    warnings.push(
      'Plenary session count and adopted texts count are based on the full year derived from dateFrom; '
      + 'partial-year date ranges are not applied to these EP API calls.'
    );
  }
  return warnings;
}

/** Check whether a date range spans an entire calendar year (Jan 1 – Dec 31). */
function isFullYearRange(dateFrom: string, dateTo: string): boolean {
  return dateFrom.endsWith('-01-01') && dateTo.endsWith('-12-31')
    && dateFrom.substring(0, 4) === dateTo.substring(0, 4);
}

/**
 * Throw a ToolError when all EP API data fetches failed.
 * This prevents returning a successful-looking report with all-zero statistics,
 * which could mislead AI agents into treating empty data as valid.
 */
function throwIfAllDataUnavailable(
  reportType: string,
  fetchResults: unknown[]
): void {
  if (fetchResults.every((r) => r === null)) {
    throw new ToolError({
      toolName: 'generate_report',
      operation: 'generateReport',
      message: `EP API data unavailable for ${reportType} report — all upstream data sources failed`,
      isRetryable: true,
      errorCode: 'UPSTREAM_503',
      errorCategory: 'DATA_UNAVAILABLE',
    });
  }
}

/** Build data quality warnings for legislation progress report */
function buildLegislationWarnings(
  procedureCount: number | null,
  completedCount: number | null,
  ongoingCount: number | null
): string[] {
  const warnings: string[] = [];
  if (procedureCount === null) {
    warnings.push('Legislative procedures count unavailable from EP API.');
  }
  if (completedCount === null) {
    warnings.push('Completed procedures (adopted texts) count unavailable from EP API.');
  }
  if (ongoingCount === null) {
    warnings.push('Ongoing procedures count could not be calculated due to missing data.');
  }
  warnings.push('Counts are lower bounds based on first page of API results (limit 100).');
  warnings.push('Ongoing count is estimated as total procedures minus adopted texts.');
  return warnings;
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
  // When a subjectId was provided, mep fetch throws on failure (handled by caller).
  // Check the remaining EP API fetch (questions) together with mep data.
  if (params.subjectId !== undefined) {
    throwIfAllDataUnavailable('MEP_ACTIVITY', [mep, questionsSubmitted]);
  }
  const warnings = buildMEPWarnings(mep, questionsSubmitted);
  
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
    ],
    dataQualityWarnings: warnings
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
  throwIfAllDataUnavailable('COMMITTEE_PERFORMANCE', [committee, documentsProduced, reportsProduced]);
  const warnings = buildCommitteeWarnings(committee, documentsProduced, reportsProduced);
  
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
    },
    dataQualityWarnings: warnings
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
  throwIfAllDataUnavailable('VOTING_STATISTICS', [sessionCount, adoptedCount]);
  const warnings = buildVotingWarnings(sessionCount, adoptedCount, dateFrom, dateTo);
  
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
    },
    dataQualityWarnings: warnings
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
  throwIfAllDataUnavailable('LEGISLATION_PROGRESS', [procedureCount, completedCount]);
  const ongoingCount = (procedureCount !== null && completedCount !== null)
    ? Math.max(0, procedureCount - completedCount)
    : null;
  const warnings = buildLegislationWarnings(procedureCount, completedCount, ongoingCount);
  
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
    },
    dataQualityWarnings: warnings
  };
}
