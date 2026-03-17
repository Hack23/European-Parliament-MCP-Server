/**
 * EP API data transformers.
 *
 * Pure functions that transform raw EP API JSON-LD responses into
 * typed domain objects. Each transformer handles a specific entity type
 * and delegates field extraction to {@link module:clients/ep/jsonLdHelpers}.
 *
 * @module clients/ep/transformers
 */

import type {
  MEP,
  MEPDetails,
  PlenarySession,
  VotingRecord,
  Committee,
  LegislativeDocument,
  ParliamentaryQuestion,
  Speech,
  Procedure,
  AdoptedText,
  EPEvent,
  MeetingActivity,
  MEPDeclaration,
} from '../../types/europeanParliament.js';

import {
  toSafeString,
  firstDefined,
  extractField,
  extractDateValue,
  extractActivityDate,
  extractMultilingualText,
  extractMemberIds,
  extractAuthorId,
  extractDocumentRefs,
  extractLocation,
  extractVoteCount,
  determineVoteOutcome,
  mapDocumentType,
  mapDocumentStatus,
  mapQuestionType,
} from './jsonLdHelpers.js';

// ─── MEP transformers ───────────────────────────────────────────

/** Extract the resolved MEP identifier string. */
function resolveMEPId(apiData: Record<string, unknown>): string {
  const identifier = firstDefined(apiData, 'identifier', '@id', 'id');
  const idStr = toSafeString(identifier) || toSafeString(apiData['id']) || '';
  const fallbackId = idStr || 'unknown';
  return idStr.includes('/') ? idStr : `person/${fallbackId}`;
}

/** Build the MEP display name from available label / name fields. */
function resolveMEPName(apiData: Record<string, unknown>): string {
  const label = toSafeString(apiData['label']) || '';
  const familyName = toSafeString(firstDefined(apiData, 'familyName', 'family_name')) || '';
  const givenName = toSafeString(firstDefined(apiData, 'givenName', 'given_name')) || '';
  return label || `${givenName} ${familyName}`.trim() || 'Unknown MEP';
}

/** Extract committee list from raw API data. */
function extractMEPCommittees(apiData: Record<string, unknown>): string[] {
  const raw = firstDefined(apiData, 'committees', 'committeeRoles');
  if (!Array.isArray(raw)) return [];
  return raw.map((item: unknown) => toSafeString(item));
}

/**
 * Extracts readable codes from an array of EP authority URIs.
 * E.g. `["http://publications.europa.eu/resource/authority/subject-matter/DDLH"]` → `"DDLH"`.
 */
function extractCodesFromUriArray(field: unknown): string {
  if (typeof field === 'string') {
    const s = toSafeString(field);
    if (s === '') return '';
    const lastSlash = s.lastIndexOf('/');
    return lastSlash >= 0 ? s.substring(lastSlash + 1) : s;
  }
  if (!Array.isArray(field)) return '';
  return field
    .map(item => {
      const s = toSafeString(item);
      if (s === '') return '';
      const lastSlash = s.lastIndexOf('/');
      return lastSlash >= 0 ? s.substring(lastSlash + 1) : s;
    })
    .filter(s => s !== '')
    .join(', ');
}

/**
 * Transforms EP API MEP data to internal {@link MEP} format.
 */
export function transformMEP(apiData: Record<string, unknown>): MEP {
  const mepId = resolveMEPId(apiData);
  const name = resolveMEPName(apiData);

  // EP API returns `api:country-of-representation` and `api:political-group`
  // in JSON-LD responses; also check legacy/alternative field names.
  const country = toSafeString(firstDefined(apiData, 'api:country-of-representation', 'country', 'citizenship', 'nationality')) || 'Unknown';
  const politicalGroup = toSafeString(firstDefined(apiData, 'api:political-group', 'politicalGroup', 'political_group')) || 'Unknown';

  const emailValue = toSafeString(apiData['email']);
  const termEndValue = toSafeString(firstDefined(apiData, 'termEnd', 'term_end'));

  const mep: MEP = {
    id: mepId,
    name,
    country,
    politicalGroup,
    committees: extractMEPCommittees(apiData),
    active: apiData['active'] === true || apiData['active'] === 'true',
    termStart: toSafeString(firstDefined(apiData, 'termStart', 'term_start')) || '',
  };
  if (emailValue !== '') mep.email = emailValue;
  if (termEndValue !== '') mep.termEnd = termEndValue;
  return mep;
}

/**
 * Transforms EP API MEP details data to internal {@link MEPDetails} format.
 */
export function transformMEPDetails(apiData: Record<string, unknown>): MEPDetails {
  const baseMEP = transformMEP(apiData);

  // EP API returns citizenship as URI (e.g. http://.../country/ITA)
  // Extract the country code from the URI if country is still the full URI
  let country = baseMEP.country;
  if (country.startsWith('http')) {
    const parts = country.split('/');
    country = parts[parts.length - 1] ?? country;
  }

  const bday = toSafeString(apiData['bday']);
  const memberships = apiData['hasMembership'];
  const committees: string[] = [];

  if (Array.isArray(memberships)) {
    for (const membership of memberships) {
      if (typeof membership === 'object' && membership !== null) {
        const org = toSafeString((membership as Record<string, unknown>)['organization']);
        if (org !== '') committees.push(org);
      }
    }
  }

  return {
    ...baseMEP,
    country,
    committees: committees.length > 0 ? committees : baseMEP.committees,
    biography: `Born: ${bday !== '' ? bday : 'Unknown'}`,
    // EP API /meps/{id} endpoint does not return voting statistics;
    // zeros indicate "no data available" rather than fabricated numbers
    votingStatistics: {
      totalVotes: 0,
      votesFor: 0,
      votesAgainst: 0,
      abstentions: 0,
      attendanceRate: 0,
    },
  };
}

// ─── Plenary transformers ───────────────────────────────────────

/**
 * Transforms EP API plenary session data to internal {@link PlenarySession} format.
 */
export function transformPlenarySession(apiData: Record<string, unknown>): PlenarySession {
  const id = toSafeString(apiData['activity_id']) || toSafeString(apiData['id']) || '';
  // EP API returns activity_date as plain string; fall back to eli-dl: prefixed variant
  const dateValue = resolveActivityDate(apiData);
  const localityUrl = toSafeString(apiData['hasLocality']);
  const location = extractLocation(localityUrl);

  // EP API provides number_of_attendees for plenary sessions
  const rawAttendance = apiData['number_of_attendees'];
  const attendanceCount = typeof rawAttendance === 'number' ? rawAttendance : 0;

  // EP API provides consists_of (agenda item refs) and documented_by/recorded_in (document refs)
  const agendaItems = Array.isArray(apiData['consists_of'])
    ? (apiData['consists_of'] as string[]).map(item => toSafeString(item)).filter(s => s !== '')
    : [];
  const docRefs = extractDocumentRefs(
    apiData['documented_by_a_realization_of'] ?? apiData['recorded_in_a_realization_of']
  );

  return {
    id,
    date: dateValue,
    location,
    agendaItems,
    attendanceCount,
    documents: docRefs,
  };
}

/** Extract activity date from EP API, checking plain string first, then eli-dl: prefixed format. */
function resolveActivityDate(apiData: Record<string, unknown>): string {
  return extractDateValue(apiData['activity_date']) || extractActivityDate(apiData['eli-dl:activity_date']);
}

/**
 * Transforms EP API vote result data to internal {@link VotingRecord} format.
 */
export function transformVoteResult(apiData: Record<string, unknown>, sessionId: string): VotingRecord {
  const id = toSafeString(apiData['activity_id']) || toSafeString(apiData['id']) || '';
  const date = resolveActivityDate(apiData);
  const topic = extractMultilingualText(apiData['activity_label'] ?? apiData['label'] ?? apiData['notation']) || 'Unknown';

  const votesFor = extractVoteCount(apiData['had_voter_favor'] ?? apiData['number_of_votes_favor']);
  const votesAgainst = extractVoteCount(apiData['had_voter_against'] ?? apiData['number_of_votes_against']);
  const abstentions = extractVoteCount(apiData['had_voter_abstention'] ?? apiData['number_of_votes_abstention']);

  const decisionStr = toSafeString(apiData['decision_method'] ?? apiData['had_decision_outcome']);
  const result = determineVoteOutcome(decisionStr, votesFor, votesAgainst);

  return { id, sessionId, topic, date, votesFor, votesAgainst, abstentions, result };
}

// ─── Committee transformers ─────────────────────────────────────

/**
 * Resolve a full committee display name.
 * Fallback chain: `prefLabel` → `skos:prefLabel` → `altLabel` → `label`.
 * @returns Multilingual text string, or empty string if no field found.
 */
function resolveCommitteeName(apiData: Record<string, unknown>): string {
  const candidates: unknown[] = [
    apiData['prefLabel'],
    apiData['skos:prefLabel'],
    apiData['altLabel'],
    apiData['label'],
  ];
  for (const candidate of candidates) {
    const text = extractMultilingualText(candidate);
    if (text !== '') return text;
  }
  return '';
}

/**
 * Resolve the committee abbreviation code.
 * In the real EP API, `label` is the short code (e.g. "ENVI"); `notation`
 * may also carry it. Falls back to the already-extracted identifier value
 * resolved from `body_id`/`id`/`identifier`.
 */
function resolveCommitteeAbbreviation(apiData: Record<string, unknown>, id: string): string {
  const fromNotation = extractField(apiData, ['notation', 'skos:notation']);
  if (fromNotation !== '') return fromNotation;
  const label = apiData['label'];
  if (typeof label === 'string' && label !== '') return label;
  return id;
}

/**
 * Transforms EP API corporate-body data to internal {@link Committee} format.
 *
 * The real EP API returns `label` as a short abbreviation (e.g. "ENVI") while
 * `prefLabel` contains the full multilingual committee name.  We therefore
 * prefer `prefLabel` → `altLabel` → `label` for the display name, and derive
 * the abbreviation from `label` (always a short code in real responses) with
 * `notation` as a higher-priority override when present.
 *
 * Cyclomatic complexity: 6
 */
export function transformCorporateBody(apiData: Record<string, unknown>): Committee {
  const id = extractField(apiData, ['body_id', 'id', 'identifier']);
  const name = resolveCommitteeName(apiData);
  const abbreviation = resolveCommitteeAbbreviation(apiData, id);
  const effectiveId = id !== '' ? id : abbreviation;

  const members = extractMemberIds(apiData['hasMembership'] ?? apiData['org:hasMember']);
  const classification = extractField(apiData, ['classification', 'org:classification']);
  const responsibilities = classification !== '' ? [classification.replace(/.*\//, '')] : [];

  return {
    id: effectiveId,
    name: name !== '' ? name : `Committee ${abbreviation}`,
    abbreviation,
    members,
    chair: members[0] ?? '',
    viceChairs: members.slice(1, 3),
    responsibilities,
  };
}

// ─── Document transformers ──────────────────────────────────────

/**
 * Transforms EP API document data to internal {@link LegislativeDocument} format.
 */
export function transformDocument(apiData: Record<string, unknown>): LegislativeDocument {
  const id = extractField(apiData, ['work_id', 'id', 'identifier']);
  const title = extractMultilingualText(apiData['title_dcterms'] ?? apiData['label'] ?? apiData['title']);
  const mappedType = mapDocumentType(extractField(apiData, ['work_type', 'ep-document-types', 'type']));
  const date = extractDateValue(apiData['document_date'] ?? apiData['work_date_document'] ?? apiData['date_document'] ?? apiData['date']);
  const committeeValue = extractField(apiData, ['was_attributed_to', 'committee']);
  const mappedStatus = mapDocumentStatus(extractField(apiData, ['resource_legal_in-force', 'status']));

  const doc: LegislativeDocument = {
    id,
    type: mappedType,
    title: title !== '' ? title : `Document ${id}`,
    date,
    authors: [],
    status: mappedStatus,
    summary: title,
  };
  if (committeeValue !== '') {
    doc.committee = committeeValue;
  }
  return doc;
}

// ─── Question transformers ──────────────────────────────────────

/**
 * Transforms EP API parliamentary question data to internal {@link ParliamentaryQuestion} format.
 */
export function transformParliamentaryQuestion(apiData: Record<string, unknown>): ParliamentaryQuestion {
  const id = extractField(apiData, ['work_id', 'id', 'identifier']);
  const questionType = mapQuestionType(extractField(apiData, ['work_type', 'ep-document-types']));
  const author = extractAuthorId(firstDefined(apiData, 'was_created_by', 'created_by', 'author'));
  const date = extractDateValue(firstDefined(apiData, 'document_date', 'work_date_document', 'date_document', 'date'));
  const topic = extractMultilingualText(firstDefined(apiData, 'title_dcterms', 'label', 'title'));
  const hasAnswer = apiData['was_realized_by'] != null;
  const topicText = topic !== '' ? topic : `Question ${id}`;

  const result: ParliamentaryQuestion = {
    id,
    type: questionType,
    author: author !== '' ? author : 'Unknown',
    date,
    topic: topicText,
    questionText: topicText,
    status: hasAnswer ? 'ANSWERED' : 'PENDING',
  };
  if (hasAnswer) {
    result.answerText = 'Answer available - see EP document portal for full text';
    result.answerDate = date;
  }
  return result;
}

// ─── Activity transformers ──────────────────────────────────────

/**
 * Extracts speaker ID and name from EP API participation data.
 * EP API nests speaker info inside `had_participation` object.
 */
function extractSpeakerInfo(apiData: Record<string, unknown>): { speakerId: string; speakerName: string } {
  const participation = apiData['had_participation'];
  let speakerId = '';
  let speakerName = '';
  if (typeof participation === 'object' && participation !== null && !Array.isArray(participation)) {
    const partObj = participation as Record<string, unknown>;
    speakerId = extractAuthorId(partObj['had_participant_person']);
    speakerName = extractMultilingualText(partObj['participant_label'] ?? '');
  }
  if (speakerId === '') speakerId = extractAuthorId(apiData['had_participant_person'] ?? apiData['was_attributed_to']);
  if (speakerName === '') speakerName = extractMultilingualText(apiData['participant_label'] ?? '');
  return { speakerId, speakerName };
}

/**
 * Extracts author MEP ID and name from EP API declaration data.
 * EP API uses `workHadParticipation` array for declaration authors.
 */
function extractDeclarationAuthor(apiData: Record<string, unknown>): { mepId: string; mepName: string } {
  let mepId = extractAuthorId(apiData['was_attributed_to'] ?? apiData['author']);
  let mepName = extractMultilingualText(apiData['author_label'] ?? '');
  if (mepId === '' && Array.isArray(apiData['workHadParticipation'])) {
    const parts = apiData['workHadParticipation'] as Record<string, unknown>[];
    if (parts.length > 0) {
      const first = parts[0];
      if (first !== undefined) {
        mepId = extractAuthorId(first['had_participant_person'] ?? first['id']);
        mepName = extractMultilingualText(first['participant_label'] ?? '');
      }
    }
  }
  return { mepId, mepName };
}

/**
 * Transforms EP API speech data to internal {@link Speech} format.
 */
export function transformSpeech(apiData: Record<string, unknown>): Speech {
  const { speakerId, speakerName } = extractSpeakerInfo(apiData);

  return {
    id: extractField(apiData, ['activity_id', 'identifier', 'id']),
    // EP API uses activity_label for speech title text
    title: extractMultilingualText(apiData['activity_label'] ?? apiData['had_activity_type'] ?? apiData['label'] ?? apiData['title']),
    speakerId,
    speakerName,
    date: extractDateValue(apiData['activity_date'] ?? apiData['date']),
    type: extractField(apiData, ['had_activity_type', 'type']),
    language: extractField(apiData, ['language', 'was_created_in_language']),
    text: extractMultilingualText(apiData['text'] ?? apiData['content'] ?? ''),
    // EP API uses inverse_consists_of (array) for session reference
    sessionReference: extractAuthorId(apiData['inverse_consists_of'] ?? apiData['was_part_of'] ?? apiData['is_part_of'] ?? apiData['event']),
  };
}

/**
 * Transforms EP API procedure data to internal {@link Procedure} format.
 */
export function transformProcedure(apiData: Record<string, unknown>): Procedure {
  const titleField = firstDefined(apiData, 'title_dcterms', 'label', 'title');
  const dateStartField = firstDefined(apiData, 'process_date_start', 'date_start', 'date');
  const dateUpdateField = firstDefined(apiData, 'process_date_update', 'date_update');
  const subjectField = firstDefined(apiData, 'subject_matter', 'subject');
  return {
    id: extractField(apiData, ['identifier', 'id', 'process_id']),
    title: extractMultilingualText(titleField),
    reference: extractField(apiData, ['identifier', 'process_id']),
    type: extractField(apiData, ['process_type', 'type']),
    subjectMatter: extractMultilingualText(subjectField),
    stage: extractField(apiData, ['process_stage', 'stage']),
    status: extractField(apiData, ['process_status', 'status']),
    dateInitiated: extractDateValue(dateStartField),
    dateLastActivity: extractDateValue(dateUpdateField),
    responsibleCommittee: extractField(apiData, ['was_attributed_to', 'committee']),
    rapporteur: extractMultilingualText(apiData['rapporteur']),
    documents: extractDocumentRefs(apiData['had_document'] ?? apiData['documents']),
  };
}

/**
 * Transforms EP API adopted text data to internal {@link AdoptedText} format.
 */
export function transformAdoptedText(apiData: Record<string, unknown>): AdoptedText {
  return {
    id: extractField(apiData, ['work_id', 'identifier', 'id']),
    title: extractMultilingualText(apiData['title_dcterms'] ?? apiData['label'] ?? apiData['title']),
    reference: extractField(apiData, ['work_id', 'identifier']),
    type: extractField(apiData, ['work_type', 'type']),
    // EP API returns document_date; also check legacy field names
    dateAdopted: extractDateValue(apiData['document_date'] ?? apiData['work_date_document'] ?? apiData['date_document'] ?? apiData['date']),
    procedureReference: extractField(apiData, ['based_on_a_concept_procedure', 'inverse_decided_on_a_realization_of', 'procedure']),
    // EP API uses isAboutSubjectMatter (URI array) for subject classification
    subjectMatter: extractCodesFromUriArray(apiData['isAboutSubjectMatter']) || extractMultilingualText(apiData['subject_matter'] ?? apiData['subject'] ?? ''),
  };
}

/**
 * Transforms EP API event data to internal {@link EPEvent} format.
 */
export function transformEvent(apiData: Record<string, unknown>): EPEvent {
  return {
    // EP API uses activity_id for events
    id: extractField(apiData, ['activity_id', 'identifier', 'id']),
    // EP API may use activity_label instead of label for event titles
    title: extractMultilingualText(apiData['activity_label'] ?? apiData['label'] ?? apiData['title'] ?? ''),
    date: extractDateValue(apiData['activity_start_date'] ?? apiData['activity_date'] ?? apiData['date']),
    endDate: extractDateValue(apiData['activity_end_date'] ?? ''),
    type: extractField(apiData, ['had_activity_type', 'type']),
    location: extractField(apiData, ['had_locality', 'hasLocality', 'location']),
    organizer: extractField(apiData, ['was_organized_by', 'organizer']),
    status: extractField(apiData, ['activity_status', 'status']),
  };
}

/**
 * Transforms EP API meeting activity data to internal {@link MeetingActivity} format.
 */
export function transformMeetingActivity(apiData: Record<string, unknown>): MeetingActivity {
  const orderField = apiData['activity_order'] ?? apiData['order'];
  const orderVal = typeof orderField === 'number' ? orderField : 0;

  return {
    id: extractField(apiData, ['identifier', 'id']),
    title: extractMultilingualText(apiData['label'] ?? apiData['title'] ?? ''),
    type: extractField(apiData, ['had_activity_type', 'type']),
    date: extractDateValue(apiData['activity_date'] ?? apiData['date']),
    order: orderVal,
    reference: extractField(apiData, ['had_document', 'reference']),
    responsibleBody: extractField(apiData, ['was_attributed_to', 'committee']),
  };
}

/**
 * Transforms EP API MEP declaration data to internal {@link MEPDeclaration} format.
 */
export function transformMEPDeclaration(apiData: Record<string, unknown>): MEPDeclaration {
  const { mepId, mepName } = extractDeclarationAuthor(apiData);
  return {
    id: extractField(apiData, ['work_id', 'identifier', 'id']),
    title: extractMultilingualText(apiData['title_dcterms'] ?? apiData['label'] ?? apiData['title']),
    mepId,
    mepName,
    type: extractField(apiData, ['work_type', 'type']),
    // EP API returns document_date; also check legacy field names
    dateFiled: extractDateValue(apiData['document_date'] ?? apiData['work_date_document'] ?? apiData['date_document'] ?? apiData['date']),
    status: extractField(apiData, ['resource_legal_in-force', 'status']),
  };
}
