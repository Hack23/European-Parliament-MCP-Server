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

/**
 * Transforms EP API MEP data to internal {@link MEP} format.
 */
export function transformMEP(apiData: Record<string, unknown>): MEP {
  const identifier = apiData['identifier'] ?? apiData['@id'] ?? apiData['id'];
  const idField = apiData['id'];
  const labelField = apiData['label'];
  const familyNameField = apiData['familyName'] ?? apiData['family_name'];
  const givenNameField = apiData['givenName'] ?? apiData['given_name'];

  const id = toSafeString(identifier) || toSafeString(idField) || '';
  const name = toSafeString(labelField) || '';
  const familyName = toSafeString(familyNameField) || '';
  const givenName = toSafeString(givenNameField) || '';

  const fullName = name || `${givenName} ${familyName}`.trim();

  const fallbackId = toSafeString(identifier) || 'unknown';
  const mepId = id.includes('/') ? id : `person/${fallbackId}`;

  // Note: /meps endpoint doesn't return country/politicalGroup — defaults to 'Unknown'
  const country = toSafeString(apiData['country'] ?? apiData['citizenship'] ?? apiData['nationality']) || 'Unknown';
  const politicalGroup = toSafeString(apiData['politicalGroup'] ?? apiData['political_group']) || 'Unknown';

  const committees: string[] = [];
  const rawCommittees = apiData['committees'] ?? apiData['committeeRoles'];
  if (Array.isArray(rawCommittees)) {
    for (const c of rawCommittees) {
      committees.push(toSafeString(c));
    }
  }

  const emailValue = toSafeString(apiData['email']);
  const termEndValue = toSafeString(apiData['termEnd'] ?? apiData['term_end']);

  const mep: MEP = {
    id: mepId,
    name: fullName || 'Unknown MEP',
    country,
    politicalGroup,
    committees,
    active: apiData['active'] === true || apiData['active'] === 'true',
    termStart: toSafeString(apiData['termStart'] ?? apiData['term_start']) || '',
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
  const dateValue = extractActivityDate(apiData['eli-dl:activity_date']);
  const localityUrl = toSafeString(apiData['hasLocality']);
  const location = extractLocation(localityUrl);

  return {
    id,
    date: dateValue,
    location,
    agendaItems: [],
    attendanceCount: 0,
    documents: [],
  };
}

/**
 * Transforms EP API vote result data to internal {@link VotingRecord} format.
 */
export function transformVoteResult(apiData: Record<string, unknown>, sessionId: string): VotingRecord {
  const id = toSafeString(apiData['activity_id']) || toSafeString(apiData['id']) || '';
  const date = extractActivityDate(apiData['eli-dl:activity_date']);
  const topic = toSafeString(apiData['label']) || toSafeString(apiData['notation']) || 'Unknown';

  const votesFor = extractVoteCount(apiData['had_voter_favor'] ?? apiData['number_of_votes_favor']);
  const votesAgainst = extractVoteCount(apiData['had_voter_against'] ?? apiData['number_of_votes_against']);
  const abstentions = extractVoteCount(apiData['had_voter_abstention'] ?? apiData['number_of_votes_abstention']);

  const decisionStr = toSafeString(apiData['decision_method'] ?? apiData['had_decision_outcome']);
  const result = determineVoteOutcome(decisionStr, votesFor, votesAgainst);

  return { id, sessionId, topic, date, votesFor, votesAgainst, abstentions, result };
}

// ─── Committee transformers ─────────────────────────────────────

/**
 * Transforms EP API corporate-body data to internal {@link Committee} format.
 */
export function transformCorporateBody(apiData: Record<string, unknown>): Committee {
  const id = extractField(apiData, ['body_id', 'id', 'identifier']);
  const name = extractMultilingualText(apiData['label'] ?? apiData['prefLabel'] ?? apiData['skos:prefLabel']);
  const abbreviation = extractField(apiData, ['notation', 'skos:notation']) || id;
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
  const date = extractDateValue(apiData['work_date_document'] ?? apiData['date_document'] ?? apiData['date']);
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
  const author = extractAuthorId(apiData['was_created_by'] ?? apiData['created_by'] ?? apiData['author']);
  const date = extractDateValue(apiData['work_date_document'] ?? apiData['date_document'] ?? apiData['date']);
  const topic = extractMultilingualText(apiData['title_dcterms'] ?? apiData['label'] ?? apiData['title']);
  const hasAnswer = apiData['was_realized_by'] !== undefined && apiData['was_realized_by'] !== null;
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
 * Transforms EP API speech data to internal {@link Speech} format.
 */
export function transformSpeech(apiData: Record<string, unknown>): Speech {
  return {
    id: extractField(apiData, ['identifier', 'id']),
    title: extractMultilingualText(apiData['had_activity_type'] ?? apiData['label'] ?? apiData['title']),
    speakerId: extractAuthorId(apiData['had_participant_person'] ?? apiData['was_attributed_to']),
    speakerName: extractMultilingualText(apiData['participant_label'] ?? apiData['label']),
    date: extractDateValue(apiData['activity_date'] ?? apiData['date']),
    type: extractField(apiData, ['had_activity_type', 'type']),
    language: extractField(apiData, ['language', 'was_created_in_language']),
    text: extractMultilingualText(apiData['text'] ?? apiData['content'] ?? ''),
    sessionReference: extractField(apiData, ['was_part_of', 'is_part_of', 'event']),
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
    dateAdopted: extractDateValue(apiData['work_date_document'] ?? apiData['date_document'] ?? apiData['date']),
    procedureReference: extractField(apiData, ['based_on_a_concept_procedure', 'procedure']),
    subjectMatter: extractMultilingualText(apiData['subject_matter'] ?? apiData['subject'] ?? ''),
  };
}

/**
 * Transforms EP API event data to internal {@link EPEvent} format.
 */
export function transformEvent(apiData: Record<string, unknown>): EPEvent {
  return {
    id: extractField(apiData, ['identifier', 'id']),
    title: extractMultilingualText(apiData['label'] ?? apiData['title'] ?? ''),
    date: extractDateValue(apiData['activity_start_date'] ?? apiData['date'] ?? apiData['activity_date']),
    endDate: extractDateValue(apiData['activity_end_date'] ?? ''),
    type: extractField(apiData, ['had_activity_type', 'type']),
    location: extractField(apiData, ['had_locality', 'location']),
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
  return {
    id: extractField(apiData, ['work_id', 'identifier', 'id']),
    title: extractMultilingualText(apiData['title_dcterms'] ?? apiData['label'] ?? apiData['title']),
    mepId: extractAuthorId(apiData['was_attributed_to'] ?? apiData['author']),
    mepName: extractMultilingualText(apiData['author_label'] ?? ''),
    type: extractField(apiData, ['work_type', 'type']),
    dateFiled: extractDateValue(apiData['work_date_document'] ?? apiData['date_document'] ?? apiData['date']),
    status: extractField(apiData, ['resource_legal_in-force', 'status']),
  };
}
