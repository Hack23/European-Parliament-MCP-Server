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
  MEPContactPoint,
  MEPMembership,
  MEPMembershipPeriod,
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

/** Extract the resolved MEP identifier string. */
function resolveMEPId(apiData: Record<string, unknown>): string {
  const identifier = firstDefined(apiData, 'identifier', '@id', 'id');
  const idStr = toSafeString(identifier) || toSafeString(apiData['id']) || '';
  const fallbackId = idStr || 'unknown';
  const normalizedIdentifier = idStr.split('/').filter((segment) => segment !== '').pop() ?? fallbackId;
  return `person/${normalizedIdentifier}`;
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

function optionalString(value: unknown): string | undefined {
  const stringValue = toSafeString(value);
  return stringValue === '' ? undefined : stringValue;
}

function pickOptionalStringFields(
  source: Record<string, unknown>,
  fields: readonly string[],
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const field of fields) {
    const value = optionalString(source[field]);
    if (value !== undefined) result[field] = value;
  }
  return result;
}

function transformMembershipPeriod(value: unknown): MEPMembershipPeriod | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  const period = value as Record<string, unknown>;
  const id = optionalString(period['id'] ?? period['@id']);
  const type = optionalString(period['type'] ?? period['@type']);
  if (id === undefined || type === undefined) return undefined;

  return {
    id,
    type,
    ...pickOptionalStringFields(period, ['startDate', 'endDate']),
  };
}

function extractStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.map(toSafeString).filter((item) => item !== '');
}

function transformTelephone(value: unknown): MEPContactPoint['hasTelephone'] {
  if (typeof value !== 'object' || value === null) return undefined;
  const telephone = value as Record<string, unknown>;
  const result = pickOptionalStringFields(
    { ...telephone, id: telephone['id'] ?? telephone['@id'], type: telephone['type'] ?? telephone['@type'] },
    ['id', 'type', 'hasValue'],
  );
  return Object.keys(result).length > 0 ? result : undefined;
}

function transformContactPoint(value: unknown): MEPContactPoint | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  const contactPoint = value as Record<string, unknown>;
  const result: MEPContactPoint = pickOptionalStringFields(
    {
      ...contactPoint,
      id: contactPoint['id'] ?? contactPoint['@id'],
      type: contactPoint['type'] ?? contactPoint['@type'],
    },
    ['id', 'type', 'email', 'officeAddress', 'hasSite'],
  );
  const hasTelephone = transformTelephone(contactPoint['hasTelephone']);
  if (hasTelephone !== undefined) result.hasTelephone = hasTelephone;
  return Object.keys(result).length > 0 ? result : undefined;
}

function transformContactPoints(value: unknown): MEPContactPoint[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(transformContactPoint)
    .filter((contactPoint): contactPoint is MEPContactPoint => contactPoint !== undefined);
}

function buildMEPMembership(
  membership: Record<string, unknown>,
): MEPMembership {
  const normalizedMembership = {
    ...membership,
    id: membership['id'] ?? membership['@id'],
    type: membership['type'] ?? membership['@type'],
  };
  const result: MEPMembership = {
    ...pickOptionalStringFields(normalizedMembership, [
      'id',
      'type',
      'identifier',
      'notation_codictFunctionId',
      'notation_codictMandateId',
      'organization',
      'role',
      'membershipClassification',
    ]),
    contactPoint: transformContactPoints(membership['contactPoint']),
  };
  const represents = extractStringArray(membership['represents']);
  const memberDuring = transformMembershipPeriod(membership['memberDuring']);
  if (represents !== undefined) result.represents = represents;
  if (memberDuring !== undefined) result.memberDuring = memberDuring;
  return result;
}

export function transformMEPMembership(value: unknown): MEPMembership | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  return buildMEPMembership(value as Record<string, unknown>);
}

function membershipClassificationCode(membership: MEPMembership): string {
  return membership.membershipClassification?.split('/').pop()?.toUpperCase() ?? '';
}

function latestMembership(
  memberships: MEPMembership[],
  predicate: (membership: MEPMembership) => boolean,
): MEPMembership | undefined {
  return memberships
    .filter(predicate)
    .sort((left, right) =>
      (right.memberDuring?.startDate ?? '').localeCompare(left.memberDuring?.startDate ?? '')
    )[0];
}

function isCurrentMembership(membership: MEPMembership): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const startDate = membership.memberDuring?.startDate;
  const endDate = membership.memberDuring?.endDate;
  return (startDate === undefined || startDate <= today)
    && (endDate === undefined || endDate >= today);
}

function authorityCode(value: string | undefined): string | undefined {
  return value?.split('/').pop();
}

function isCommitteeMembership(membership: MEPMembership): boolean {
  const classification = membershipClassificationCode(membership);
  return (classification === '' && !isMandateMembership(membership))
    || classification.startsWith('COMMITTEE_PARLIAMENTARY');
}

function isMandateMembership(membership: MEPMembership): boolean {
  return membership.notation_codictMandateId !== undefined
    || authorityCode(membership.role) === 'MEMBER_PARLIAMENT';
}

function isPoliticalGroupMembership(membership: MEPMembership): boolean {
  return membershipClassificationCode(membership) === 'EU_POLITICAL_GROUP';
}

function resolveMandateActive(mandate: MEPMembership | undefined, fallback: boolean): boolean {
  if (mandate === undefined) return fallback;
  const endDate = mandate.memberDuring?.endDate;
  return endDate === undefined || endDate >= new Date().toISOString().slice(0, 10);
}

function resolveMandateTerm(
  mandate: MEPMembership | undefined,
  fallback: string,
): Pick<MEP, 'termStart' | 'termEnd'> {
  const termStart = mandate?.memberDuring?.startDate ?? fallback;
  const termEnd = mandate?.memberDuring?.endDate;
  return termEnd === undefined ? { termStart } : { termStart, termEnd };
}

function deriveMEPMembershipProfile(
  memberships: MEPMembership[],
  baseMEP: MEP,
): Pick<MEP, 'politicalGroup' | 'committees' | 'active' | 'termStart' | 'termEnd'> & {
  roles: string[];
} {
  const currentMemberships = memberships.filter(isCurrentMembership);
  const mandate = latestMembership(currentMemberships, isMandateMembership);
  const politicalGroupMembership = latestMembership(currentMemberships, isPoliticalGroupMembership);
  const committees = currentMemberships
    .filter(isCommitteeMembership)
    .map((membership) => membership.organization)
    .filter((organization): organization is string => organization !== undefined);
  const roles = [...new Set(
    currentMemberships
      .map((membership) => membership.role)
      .filter((role): role is string => role !== undefined)
  )];

  return {
    politicalGroup: politicalGroupMembership?.organization ?? baseMEP.politicalGroup,
    committees: committees.length > 0 ? committees : baseMEP.committees,
    active: resolveMandateActive(mandate, baseMEP.active),
    ...resolveMandateTerm(mandate, baseMEP.termStart),
    roles,
  };
}

function resolveMEPCountry(apiData: Record<string, unknown>, fallback: string): string {
  const country = optionalString(apiData['citizenship']) ?? fallback;
  return country.startsWith('http') ? authorityCode(country) ?? country : country;
}

function deriveCurrentContactProfile(
  memberships: MEPMembership[],
): Pick<MEPDetails, 'address' | 'phone'> {
  const currentMandate = latestMembership(
    memberships.filter(isCurrentMembership),
    isMandateMembership,
  );
  const contactPoint = currentMandate?.contactPoint[0];
  const result: Pick<MEPDetails, 'address' | 'phone'> = {};
  if (contactPoint?.officeAddress !== undefined) result.address = contactPoint.officeAddress;
  const phone = contactPoint?.hasTelephone?.hasValue?.replace(/^tel:/i, '');
  if (phone !== undefined) result.phone = phone;
  return result;
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

  const country = toSafeString(firstDefined(apiData, 'api:country-of-representation', 'country', 'citizenship', 'nationality')) || 'Unknown';
  const politicalGroup = toSafeString(firstDefined(apiData, 'api:political-group', 'politicalGroup', 'political_group')) || 'Unknown';

  const emailValue = toSafeString(apiData['email'] ?? apiData['hasEmail']).replace(/^mailto:/i, '');
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
  const memberships = Array.isArray(apiData['hasMembership'])
    ? apiData['hasMembership']
      .map(transformMEPMembership)
      .filter((membership): membership is MEPMembership => membership !== undefined)
    : [];
  const membershipProfile = deriveMEPMembershipProfile(memberships, baseMEP);
  const bday = toSafeString(apiData['bday']);
  const sourceFields = pickOptionalStringFields(apiData, [
    'identifier',
    'label',
    'hasEmail',
    'notation_codictPersonId',
    'hasGender',
    'hasHonorificPrefix',
    'citizenship',
    'placeOfBirth',
    'familyName',
    'givenName',
    'img',
    'sortLabel',
    'upperFamilyName',
    'upperGivenName',
  ]);
  const type = optionalString(apiData['type'] ?? apiData['@type']);

  return {
    ...baseMEP,
    ...membershipProfile,
    country: resolveMEPCountry(apiData, baseMEP.country),
    ...sourceFields,
    ...(type !== undefined ? { type } : {}),
    ...(bday !== '' ? { bday } : {}),
    hasMembership: memberships,
    biography: `Born: ${bday !== '' ? bday : 'Unknown'}`,
    ...deriveCurrentContactProfile(memberships),
    ...(membershipProfile.roles.length > 0 ? { roles: membershipProfile.roles } : {}),
  };
}

/**
 * Transforms EP API plenary session data to internal {@link PlenarySession} format.
 */
export function transformPlenarySession(apiData: Record<string, unknown>): PlenarySession {
  const id = toSafeString(apiData['activity_id']) || toSafeString(apiData['id']) || '';
  const dateValue = resolveActivityDate(apiData);
  const localityUrl = toSafeString(apiData['hasLocality']);
  const location = extractLocation(localityUrl);

  const rawAttendance = apiData['number_of_attendees'];
  const attendanceCount = typeof rawAttendance === 'number' ? rawAttendance : 0;

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
  const id = extractField(apiData, ['body_id', 'identifier', 'id']);
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
    responsibilities,
  };
}

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
  const authors = extractDocumentAuthors(apiData);

  const doc: LegislativeDocument = {
    id,
    type: mappedType,
    title: title !== '' ? title : `Document ${id}`,
    date,
    authors,
    status: mappedStatus,
    summary: title,
  };
  if (committeeValue !== '') {
    doc.committee = committeeValue;
  }
  return doc;
}

/**
 * Extract author IDs from EP API document fields.
 *
 * EP API documents expose authors via `was_created_by`, `created_by`, or `author`
 * fields. The value may be a single person URI string, an array of strings, or
 * an array of objects with `@id` / `id` properties. We extract all person IDs
 * and return them as a flat string array for downstream attribution matching.
 */
function extractDocumentAuthors(apiData: Record<string, unknown>): string[] {
  const raw = apiData['was_created_by'] ?? apiData['created_by'] ?? apiData['author'];
  if (raw === undefined || raw === null) return [];
  if (typeof raw === 'string') return raw !== '' ? [raw] : [];
  if (Array.isArray(raw)) return extractAuthorIdsFromArray(raw);
  if (typeof raw === 'object') {
    const id = extractAuthorId(raw);
    return id !== '' ? [id] : [];
  }
  return [];
}

/** Extract author IDs from a mixed array of strings and objects. */
function extractAuthorIdsFromArray(items: unknown[]): string[] {
  const result: string[] = [];
  for (const item of items) {
    const id = extractAuthorId(item);
    if (id !== '') result.push(id);
  }
  return result;
}

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
    title: extractMultilingualText(apiData['activity_label'] ?? apiData['had_activity_type'] ?? apiData['label'] ?? apiData['title']),
    speakerId,
    speakerName,
    date: extractDateValue(apiData['activity_date'] ?? apiData['date']),
    type: extractField(apiData, ['had_activity_type', 'type']),
    language: extractField(apiData, ['language', 'was_created_in_language']),
    text: extractMultilingualText(apiData['text'] ?? apiData['content'] ?? ''),
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
  const rawType = extractField(apiData, ['process_type', 'type']);
  const typeCode = rawType.includes('/') ? rawType.slice(rawType.lastIndexOf('/') + 1) : rawType;
  return {
    id: extractField(apiData, ['identifier', 'process_id', 'id']),
    title: extractMultilingualText(titleField),
    reference: extractField(apiData, ['identifier', 'process_id']),
    type: typeCode,
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
    dateAdopted: extractDateValue(apiData['document_date'] ?? apiData['work_date_document'] ?? apiData['date_document'] ?? apiData['date']),
    procedureReference: extractField(apiData, ['based_on_a_concept_procedure', 'inverse_decided_on_a_realization_of', 'procedure']),
    subjectMatter: extractCodesFromUriArray(apiData['isAboutSubjectMatter']) || extractMultilingualText(apiData['subject_matter'] ?? apiData['subject'] ?? ''),
  };
}

/**
 * Transforms EP API event data to internal {@link EPEvent} format.
 */
export function transformEvent(apiData: Record<string, unknown>): EPEvent {
  return {
    id: extractField(apiData, ['activity_id', 'identifier', 'id']),
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
    dateFiled: extractDateValue(apiData['document_date'] ?? apiData['work_date_document'] ?? apiData['date_document'] ?? apiData['date']),
    status: extractField(apiData, ['resource_legal_in-force', 'status']),
  };
}
