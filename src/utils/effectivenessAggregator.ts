/**
 * Legislative-effectiveness aggregator.
 *
 * Pure helpers that turn the per-source EP API payloads consumed by
 * `analyze_legislative_effectiveness` into deterministic effectiveness metrics
 * keyed by a subject MEP. Kept side-effect-free so the tool handler can fan
 * out network calls under `Promise.allSettled`, then defer aggregation to a
 * single synchronous step that is easy to unit-test.
 *
 * **Inputs:** raw `Procedure`, `AdoptedText`, `LegislativeDocument`, and
 * `ParliamentaryQuestion` arrays (already filtered to a date window upstream).
 *
 * **Outputs:** {@link LegislativeMetrics} — counts of reports authored,
 * opinions delivered, amendments tabled/adopted, questions asked, and the
 * derived legislative success rate.
 *
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege).
 *
 * @module utils/effectivenessAggregator
 */

import type { Procedure, AdoptedText } from '../types/ep/activities.js';
import type { LegislativeDocument } from '../types/ep/document.js';
import type { ParliamentaryQuestion } from '../types/ep/question.js';

/**
 * Effectiveness metrics computed from real EP data.
 *
 * Each field is a count derived from a single EP API source; the
 * `legislativeSuccessRate` is the only derived ratio.
 */
export interface LegislativeMetrics {
  /** Procedures where the subject appears as rapporteur. */
  reportsAuthored: number;
  /** Procedures where the subject acts as shadow- or opinion-rapporteur. */
  opinionsDelivered: number;
  /** Plenary-session document items authored by the subject. */
  amendmentsTabled: number;
  /** Amendment-typed document items authored by the subject that reached an ADOPTED status. */
  amendmentsAdopted: number;
  /** Parliamentary questions filed by the subject. */
  questionsAsked: number;
  /**
   * Percentage of subject-attributed procedures that resulted in an
   * adopted text (0-100, two-decimal precision).
   */
  legislativeSuccessRate: number;
}

/**
 * Deterministic ordering payload returned alongside the counts so callers
 * (tests, downstream tools) can audit which records contributed.
 *
 * Lists are sorted by stable identifier ascending so two runs over the same
 * input produce identical output regardless of fetch order.
 */
export interface AggregatedAttributions {
  /** Procedure IDs counted as reports authored, ascending. */
  reportProcedureIds: string[];
  /** Procedure IDs counted as opinions delivered, ascending. */
  opinionProcedureIds: string[];
  /** Document IDs counted as amendments tabled, ascending. */
  amendmentDocumentIds: string[];
  /** Document IDs counted as adopted amendments, ascending. */
  amendmentAdoptedDocumentIds: string[];
  /** Parliamentary question IDs counted, ascending. */
  questionIds: string[];
}

/**
 * Combined aggregator result.
 */
export interface AggregationResult {
  metrics: LegislativeMetrics;
  attributions: AggregatedAttributions;
  /** Number of distinct procedures attributed to the subject. */
  attributedProcedureCount: number;
  /** Number of attributed procedures with a matching adopted text. */
  proceduresWithAdoptedText: number;
}

// ---------------------------------------------------------------------------
// Identifier normalisation
// ---------------------------------------------------------------------------

/**
 * Strip the `person/` prefix and surrounding whitespace from a MEP identifier.
 *
 * The EP API returns MEP ids in several forms (`person/124936`, `124936`,
 * `MEP-124936`). We normalise to the bare numeric token plus the original
 * string so substring matches against author fields succeed regardless of the
 * representation chosen by a given endpoint.
 *
 * @internal
 */
export function normaliseMepIdTokens(id: string): string[] {
  const raw = id.trim();
  if (raw === '') return [];
  const tokens = new Set<string>([raw.toLowerCase()]);
  const slashIdx = raw.lastIndexOf('/');
  if (slashIdx >= 0 && slashIdx < raw.length - 1) {
    tokens.add(raw.slice(slashIdx + 1).toLowerCase());
  }
  const dashIdx = raw.lastIndexOf('-');
  if (dashIdx >= 0 && dashIdx < raw.length - 1) {
    tokens.add(raw.slice(dashIdx + 1).toLowerCase());
  }
  return [...tokens].filter((t) => t.length > 0);
}

/**
 * Tolerant author/MEP match.
 *
 * Returns `true` when any normalised token from `mepId` matches the candidate
 * exactly, or when the candidate contains a normalised token as a substring
 * (case-insensitive). Empty / undefined candidates never match.
 *
 * @internal
 */
export function matchesMep(candidate: string | undefined | null, mepTokens: string[]): boolean {
  if (candidate === undefined || candidate === null || candidate === '') return false;
  if (mepTokens.length === 0) return false;
  const c = candidate.toLowerCase();
  for (const token of mepTokens) {
    if (token === '') continue;
    if (c === token) return true;
    // Require the token to be at least 2 chars to avoid spurious substring
    // matches against very short identifiers like "1".
    if (token.length >= 2 && c.includes(token)) return true;
  }
  return false;
}

/**
 * Build the set of identifier tokens that we treat as "authored by" the
 * subject. For an MEP this is just the MEP id; for a committee it is the
 * union of the committee's member IDs.
 */
export function buildSubjectTokens(subjectId: string, committeeMemberIds?: readonly string[]): string[] {
  const result = new Set<string>();
  for (const token of normaliseMepIdTokens(subjectId)) result.add(token);
  if (committeeMemberIds !== undefined) {
    for (const memberId of committeeMemberIds) {
      for (const token of normaliseMepIdTokens(memberId)) result.add(token);
    }
  }
  return [...result];
}

// ---------------------------------------------------------------------------
// Source filters
// ---------------------------------------------------------------------------

/** Inclusive ISO-date window check; missing/invalid dates are treated as in-window. */
function inWindow(date: string | undefined | null, dateFrom: string, dateTo: string): boolean {
  if (date === undefined || date === null || date === '') return true;
  const d = date.length >= 10 ? date.slice(0, 10) : date;
  return d >= dateFrom && d <= dateTo;
}

/** Shadow / opinion rapporteur fingerprints. */
const SHADOW_OR_OPINION_KEYWORDS = ['shadow', 'opinion'];

/**
 * Decide whether a procedure attributes the subject as the primary rapporteur
 * vs. a shadow- or opinion-rapporteur, vs. neither. Returns `null` when the
 * procedure carries no recognisable subject attribution.
 *
 * Heuristics:
 *  - `rapporteur` substring match (case-insensitive) against the subject's
 *    normalised tokens promotes the procedure to "report authored".
 *  - Combined with a `shadow` / `opinion` token in the same field, the
 *    procedure is reclassified as "opinion delivered".
 *  - `responsibleCommittee` is **not** sufficient on its own — it only enters
 *    the committee aggregation path via member-MEP attribution.
 */
function classifyProcedureRole(
  procedure: Procedure,
  mepTokens: string[],
): 'report' | 'opinion' | null {
  const rapporteur = procedure.rapporteur;
  if (rapporteur === '') return null;
  const matched = matchesMep(rapporteur, mepTokens);
  if (!matched) return null;
  const lower = rapporteur.toLowerCase();
  const hasOpinion = SHADOW_OR_OPINION_KEYWORDS.some((k) => lower.includes(k));
  if (hasOpinion) return 'opinion';
  // Default to "report" when the rapporteur field plainly names the MEP
  // (with or without a `rapporteur` qualifier). The opinion/shadow check
  // above already separated minority roles.
  return 'report';
}

/**
 * Decide whether a plenary-session document item should be counted as an
 * amendment authored by the subject. We look at:
 *  - `authors` array (preferred MEP attribution)
 *  - document `type` (e.g., `AMENDMENT`, `REPORT_AMENDMENTS`)
 *  - document `status` for the adoption flag (`ADOPTED` substring)
 */
function isSubjectAmendment(doc: LegislativeDocument, mepTokens: string[]): boolean {
  const type = doc.type.toUpperCase();
  if (!type.includes('AMENDMENT')) return false;
  const authors = Array.isArray(doc.authors) ? doc.authors : [];
  return authors.some((author) => matchesMep(author, mepTokens));
}

function isDocumentAdopted(doc: LegislativeDocument): boolean {
  return doc.status.toUpperCase().includes('ADOPTED');
}

// ---------------------------------------------------------------------------
// Aggregator
// ---------------------------------------------------------------------------

/**
 * Inputs to {@link aggregateLegislativeEffectiveness}.
 */
export interface AggregatorInputs {
  /** Subject identifier (MEP ID or committee abbreviation). */
  subjectId: string;
  /**
   * Optional list of committee member MEP IDs. When provided, the aggregator
   * treats any rapporteur/author hit against a member as a hit for the
   * committee subject.
   */
  committeeMemberIds?: readonly string[];
  /** Inclusive ISO-date window for filtering procedures, documents, and questions. */
  dateFrom: string;
  /** Inclusive ISO-date window upper bound. */
  dateTo: string;
  /** Procedures fetched from `/procedures`. */
  procedures: readonly Procedure[];
  /** Adopted texts fetched from `/adopted-texts`. */
  adoptedTexts: readonly AdoptedText[];
  /** Plenary-session document items fetched from `/plenary-session-documents-items`. */
  plenaryDocumentItems: readonly LegislativeDocument[];
  /** Parliamentary questions fetched from `/parliamentary-questions`. */
  questions: readonly ParliamentaryQuestion[];
}

/**
 * Compute deterministic effectiveness metrics from the provided EP payloads.
 *
 * The function is pure: it never mutates its arguments, never throws, and
 * produces stable output for stable input. Empty inputs return zero metrics
 * (not `NaN`) so the surrounding tool can safely surface partial-source
 * outages.
 *
 * @param inputs - raw EP arrays plus subject metadata
 * @returns aggregated metrics + per-record attributions, sorted ascending
 *
 * @example
 * ```typescript
 * const result = aggregateLegislativeEffectiveness({
 *   subjectId: 'person/124936',
 *   dateFrom: '2024-01-01',
 *   dateTo: '2024-12-31',
 *   procedures, adoptedTexts, plenaryDocumentItems, questions,
 * });
 * // result.metrics.reportsAuthored, result.metrics.legislativeSuccessRate, ...
 * ```
 */
interface ProcedureClassification {
  reportProcedures: Set<string>;
  opinionProcedures: Set<string>;
}

function classifyProcedures(
  procedures: readonly Procedure[],
  tokens: string[],
  dateFrom: string,
  dateTo: string,
): ProcedureClassification {
  const reportProcedures = new Set<string>();
  const opinionProcedures = new Set<string>();
  for (const proc of procedures) {
    if (!inWindow(proc.dateLastActivity, dateFrom, dateTo)
      && !inWindow(proc.dateInitiated, dateFrom, dateTo)) {
      continue;
    }
    const role = classifyProcedureRole(proc, tokens);
    if (role === 'report') reportProcedures.add(proc.id);
    else if (role === 'opinion') opinionProcedures.add(proc.id);
  }
  return { reportProcedures, opinionProcedures };
}

function buildAdoptedRefSet(
  adoptedTexts: readonly AdoptedText[],
  dateFrom: string,
  dateTo: string,
): Set<string> {
  const adoptedRefs = new Set<string>();
  for (const text of adoptedTexts) {
    if (!inWindow(text.dateAdopted, dateFrom, dateTo)) continue;
    const ref = text.procedureReference.trim();
    if (ref !== '') adoptedRefs.add(ref);
  }
  return adoptedRefs;
}

function countProceduresWithAdoption(
  procedures: readonly Procedure[],
  attributedIds: ReadonlySet<string>,
  adoptedRefs: ReadonlySet<string>,
): number {
  let count = 0;
  for (const proc of procedures) {
    if (!attributedIds.has(proc.id)) continue;
    const ref = proc.reference.trim();
    if ((ref !== '' && adoptedRefs.has(ref)) || adoptedRefs.has(proc.id)) {
      count += 1;
    }
  }
  return count;
}

function classifyAmendments(
  items: readonly LegislativeDocument[],
  tokens: string[],
  dateFrom: string,
  dateTo: string,
): { amendmentIds: Set<string>; amendmentAdoptedIds: Set<string> } {
  const amendmentIds = new Set<string>();
  const amendmentAdoptedIds = new Set<string>();
  for (const doc of items) {
    if (!inWindow(doc.date, dateFrom, dateTo)) continue;
    if (!isSubjectAmendment(doc, tokens)) continue;
    amendmentIds.add(doc.id);
    if (isDocumentAdopted(doc)) amendmentAdoptedIds.add(doc.id);
  }
  return { amendmentIds, amendmentAdoptedIds };
}

function classifyQuestions(
  questions: readonly ParliamentaryQuestion[],
  tokens: string[],
  dateFrom: string,
  dateTo: string,
): Set<string> {
  const ids = new Set<string>();
  for (const q of questions) {
    if (!inWindow(q.date, dateFrom, dateTo)) continue;
    if (!matchesMep(q.author, tokens)) continue;
    ids.add(q.id);
  }
  return ids;
}

function sortedAscending(items: ReadonlySet<string>): string[] {
  return [...items].sort((a, b) => a.localeCompare(b));
}

export function aggregateLegislativeEffectiveness(inputs: AggregatorInputs): AggregationResult {
  const tokens = buildSubjectTokens(inputs.subjectId, inputs.committeeMemberIds);

  const { reportProcedures, opinionProcedures } = classifyProcedures(
    inputs.procedures, tokens, inputs.dateFrom, inputs.dateTo,
  );

  const adoptedRefs = buildAdoptedRefSet(inputs.adoptedTexts, inputs.dateFrom, inputs.dateTo);
  const attributedIds = new Set<string>([...reportProcedures, ...opinionProcedures]);
  const proceduresWithAdoptedText = countProceduresWithAdoption(
    inputs.procedures, attributedIds, adoptedRefs,
  );

  const { amendmentIds, amendmentAdoptedIds } = classifyAmendments(
    inputs.plenaryDocumentItems, tokens, inputs.dateFrom, inputs.dateTo,
  );
  const questionIds = classifyQuestions(inputs.questions, tokens, inputs.dateFrom, inputs.dateTo);

  const reportProcedureIds = sortedAscending(reportProcedures);
  const opinionProcedureIds = sortedAscending(opinionProcedures);
  const amendmentDocumentIds = sortedAscending(amendmentIds);
  const amendmentAdoptedDocumentIds = sortedAscending(amendmentAdoptedIds);
  const sortedQuestionIds = sortedAscending(questionIds);

  const attributedProcedureCount = attributedIds.size;
  const legislativeSuccessRate = attributedProcedureCount > 0
    ? Math.round((proceduresWithAdoptedText / attributedProcedureCount) * 100 * 100) / 100
    : 0;

  return {
    metrics: {
      reportsAuthored: reportProcedureIds.length,
      opinionsDelivered: opinionProcedureIds.length,
      amendmentsTabled: amendmentDocumentIds.length,
      amendmentsAdopted: amendmentAdoptedDocumentIds.length,
      questionsAsked: sortedQuestionIds.length,
      legislativeSuccessRate,
    },
    attributions: {
      reportProcedureIds,
      opinionProcedureIds,
      amendmentDocumentIds,
      amendmentAdoptedDocumentIds,
      questionIds: sortedQuestionIds,
    },
    attributedProcedureCount,
    proceduresWithAdoptedText,
  };
}
