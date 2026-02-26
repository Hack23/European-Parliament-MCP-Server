/**
 * Unit tests for EP API data transformer functions.
 *
 * Covers all exported transformer functions in transformers.ts with
 * edge cases including null/undefined fields, empty arrays, and malformed data.
 */

import { describe, it, expect } from 'vitest';
import {
  transformMEP,
  transformMEPDetails,
  transformPlenarySession,
  transformVoteResult,
  transformCorporateBody,
  transformDocument,
  transformParliamentaryQuestion,
  transformSpeech,
  transformProcedure,
  transformAdoptedText,
  transformEvent,
  transformMeetingActivity,
  transformMEPDeclaration,
} from './transformers.js';

// ─── transformMEP ───────────────────────────────────────────────

describe('transformMEP', () => {
  it('transforms a complete MEP record', () => {
    const apiData = {
      identifier: '124810',
      label: 'Jane Doe',
      country: 'Germany',
      politicalGroup: 'EPP',
      committees: ['ENVI', 'ITRE'],
      active: true,
      termStart: '2019-07-02',
      termEnd: '2024-07-01',
      email: 'jane.doe@europarl.europa.eu',
    };
    const mep = transformMEP(apiData);
    expect(mep.id).toContain('124810');
    expect(mep.name).toBe('Jane Doe');
    expect(mep.country).toBe('Germany');
    expect(mep.politicalGroup).toBe('EPP');
    expect(mep.committees).toEqual(['ENVI', 'ITRE']);
    expect(mep.active).toBe(true);
    expect(mep.termStart).toBe('2019-07-02');
    expect(mep.termEnd).toBe('2024-07-01');
    expect(mep.email).toBe('jane.doe@europarl.europa.eu');
  });

  it('defaults to Unknown for missing country', () => {
    const mep = transformMEP({ identifier: '1', label: 'Test' });
    expect(mep.country).toBe('Unknown');
  });

  it('defaults to Unknown for missing political group', () => {
    const mep = transformMEP({ identifier: '1', label: 'Test' });
    expect(mep.politicalGroup).toBe('Unknown');
  });

  it('builds name from givenName and familyName when label is absent', () => {
    const apiData = { identifier: '2', givenName: 'John', familyName: 'Smith' };
    const mep = transformMEP(apiData);
    expect(mep.name).toBe('John Smith');
  });

  it('falls back to Unknown MEP when name fields are missing', () => {
    const mep = transformMEP({ identifier: '3' });
    expect(mep.name).toBe('Unknown MEP');
  });

  it('uses @id when identifier is missing', () => {
    const mep = transformMEP({ '@id': 'person/999', label: 'ID MEP' });
    expect(mep.id).toContain('999');
  });

  it('omits email when not provided', () => {
    const mep = transformMEP({ identifier: '4', label: 'No Email' });
    expect(mep.email).toBeUndefined();
  });

  it('omits termEnd when not provided', () => {
    const mep = transformMEP({ identifier: '5', label: 'No Term End' });
    expect(mep.termEnd).toBeUndefined();
  });

  it('sets active to false when active field is absent', () => {
    const mep = transformMEP({ identifier: '6', label: 'Inactive' });
    expect(mep.active).toBe(false);
  });

  it('sets active to true for string "true"', () => {
    const mep = transformMEP({ identifier: '7', label: 'Active String', active: 'true' });
    expect(mep.active).toBe(true);
  });

  it('returns empty committees array when committees field is absent', () => {
    const mep = transformMEP({ identifier: '8', label: 'No Committees' });
    expect(mep.committees).toEqual([]);
  });

  it('adds person/ prefix when id does not contain /', () => {
    const mep = transformMEP({ identifier: '123' });
    expect(mep.id).toBe('person/123');
  });

  it('preserves id when it already contains /', () => {
    const mep = transformMEP({ identifier: 'person/456' });
    expect(mep.id).toBe('person/456');
  });
});

// ─── transformMEPDetails ────────────────────────────────────────

describe('transformMEPDetails', () => {
  it('transforms complete MEP details with membership', () => {
    const apiData = {
      identifier: '100',
      label: 'MEP Name',
      bday: '1970-05-15',
      hasMembership: [
        { organization: 'ENVI' },
        { organization: 'ITRE' },
      ],
    };
    const details = transformMEPDetails(apiData);
    expect(details.id).toContain('100');
    expect(details.biography).toContain('1970-05-15');
    expect(details.committees).toContain('ENVI');
    expect(details.committees).toContain('ITRE');
  });

  it('includes voting statistics with zeros', () => {
    const details = transformMEPDetails({ identifier: '101', label: 'MEP' });
    expect(details.votingStatistics).toEqual({
      totalVotes: 0,
      votesFor: 0,
      votesAgainst: 0,
      abstentions: 0,
      attendanceRate: 0,
    });
  });

  it('shows Unknown birthday when bday is absent', () => {
    const details = transformMEPDetails({ identifier: '102', label: 'MEP' });
    expect(details.biography).toContain('Unknown');
  });

  it('uses base committees when hasMembership is empty', () => {
    const apiData = {
      identifier: '103',
      label: 'MEP',
      committees: ['AFET'],
      hasMembership: [],
    };
    const details = transformMEPDetails(apiData);
    expect(details.committees).toEqual(['AFET']);
  });

  it('prefers hasMembership committees over base committees', () => {
    const apiData = {
      identifier: '104',
      label: 'MEP',
      committees: ['OLD_COMMITTEE'],
      hasMembership: [{ organization: 'NEW_COMMITTEE' }],
    };
    const details = transformMEPDetails(apiData);
    expect(details.committees).toContain('NEW_COMMITTEE');
    expect(details.committees).not.toContain('OLD_COMMITTEE');
  });

  it('skips membership entries without organization', () => {
    const apiData = {
      identifier: '105',
      label: 'MEP',
      hasMembership: [{ other: 'field' }, { organization: 'VALID' }],
    };
    const details = transformMEPDetails(apiData);
    expect(details.committees).toEqual(['VALID']);
  });
});

// ─── transformPlenarySession ────────────────────────────────────

describe('transformPlenarySession', () => {
  it('transforms a complete plenary session', () => {
    const apiData = {
      activity_id: 'MTG-PL-2024-01-15',
      'eli-dl:activity_date': { '@value': '2024-01-15T09:00:00+01:00' },
      hasLocality: 'http://publications.europa.eu/resource/authority/place/FRA_SXB',
    };
    const session = transformPlenarySession(apiData);
    expect(session.id).toBe('MTG-PL-2024-01-15');
    expect(session.date).toBe('2024-01-15');
    expect(session.location).toBe('Strasbourg');
    expect(session.agendaItems).toEqual([]);
    expect(session.attendanceCount).toBe(0);
    expect(session.documents).toEqual([]);
  });

  it('returns Brussels for BEL_BRU locality', () => {
    const apiData = {
      activity_id: 'MTG-PL-2024-02-01',
      'eli-dl:activity_date': { '@value': '2024-02-01T09:00:00+01:00' },
      hasLocality: 'http://publications.europa.eu/resource/authority/place/BEL_BRU',
    };
    const session = transformPlenarySession(apiData);
    expect(session.location).toBe('Brussels');
  });

  it('returns Unknown for unrecognized locality', () => {
    const apiData = {
      activity_id: 'MTG-PL-2024-03-01',
      'eli-dl:activity_date': { '@value': '2024-03-01T00:00:00Z' },
      hasLocality: 'http://example.com/other',
    };
    const session = transformPlenarySession(apiData);
    expect(session.location).toBe('Unknown');
  });

  it('falls back to id field when activity_id is absent', () => {
    const session = transformPlenarySession({ id: 'session-fallback' });
    expect(session.id).toBe('session-fallback');
  });

  it('returns empty date when activity_date is absent', () => {
    const session = transformPlenarySession({ activity_id: 'MTG-001' });
    expect(session.date).toBe('');
  });

  it('handles completely empty input', () => {
    const session = transformPlenarySession({});
    expect(session.id).toBe('');
    expect(session.date).toBe('');
    expect(session.location).toBe('Unknown');
    expect(session.agendaItems).toEqual([]);
    expect(session.documents).toEqual([]);
  });
});

// ─── transformVoteResult ────────────────────────────────────────

describe('transformVoteResult', () => {
  it('transforms a complete vote result', () => {
    const apiData = {
      activity_id: 'VOTE-2024-001',
      'eli-dl:activity_date': { '@value': '2024-01-15T14:00:00Z' },
      label: 'Resolution on climate change',
      number_of_votes_favor: 450,
      number_of_votes_against: 150,
      number_of_votes_abstention: 50,
      decision_method: 'ADOPTED_BY_SIMPLE_MAJORITY',
    };
    const vote = transformVoteResult(apiData, 'SESSION-001');
    expect(vote.id).toBe('VOTE-2024-001');
    expect(vote.sessionId).toBe('SESSION-001');
    expect(vote.topic).toBe('Resolution on climate change');
    expect(vote.date).toBe('2024-01-15');
    expect(vote.votesFor).toBe(450);
    expect(vote.votesAgainst).toBe(150);
    expect(vote.abstentions).toBe(50);
    expect(vote.result).toBe('ADOPTED');
  });

  it('uses notation when label is absent', () => {
    const apiData = {
      activity_id: 'VOTE-2024-002',
      notation: 'B9-2024-001',
    };
    const vote = transformVoteResult(apiData, 'SESSION-002');
    expect(vote.topic).toBe('B9-2024-001');
  });

  it('falls back to Unknown topic when both label and notation are absent', () => {
    const vote = transformVoteResult({ activity_id: 'V001' }, 'S001');
    expect(vote.topic).toBe('Unknown');
  });

  it('determines REJECTED result from decision_method', () => {
    const apiData = {
      activity_id: 'VOTE-003',
      label: 'Rejected motion',
      number_of_votes_favor: 100,
      number_of_votes_against: 350,
      decision_method: 'MOTION_REJECTED',
    };
    const vote = transformVoteResult(apiData, 'S001');
    expect(vote.result).toBe('REJECTED');
  });

  it('determines result from vote counts when decision_method is empty', () => {
    const apiData = {
      activity_id: 'VOTE-004',
      label: 'Majority vote',
      number_of_votes_favor: 300,
      number_of_votes_against: 200,
    };
    const vote = transformVoteResult(apiData, 'S001');
    expect(vote.result).toBe('ADOPTED');
  });

  it('handles alternative field names (had_voter_favor etc.)', () => {
    const apiData = {
      activity_id: 'VOTE-005',
      label: 'Alt fields',
      had_voter_favor: 400,
      had_voter_against: 50,
      had_voter_abstention: 20,
    };
    const vote = transformVoteResult(apiData, 'S001');
    expect(vote.votesFor).toBe(400);
    expect(vote.votesAgainst).toBe(50);
    expect(vote.abstentions).toBe(20);
  });

  it('handles completely empty input', () => {
    const vote = transformVoteResult({}, 'SESSION-EMPTY');
    expect(vote.sessionId).toBe('SESSION-EMPTY');
    expect(vote.votesFor).toBe(0);
    expect(vote.votesAgainst).toBe(0);
    expect(vote.abstentions).toBe(0);
  });
});

// ─── transformCorporateBody ─────────────────────────────────────

describe('transformCorporateBody', () => {
  it('transforms a complete corporate body', () => {
    const apiData = {
      body_id: 'ENVI',
      label: [{ '@language': 'en', '@value': 'Committee on the Environment' }],
      notation: 'ENVI',
      hasMembership: ['person/1', 'person/2', 'person/3'],
      classification: 'https://example.com/PARLIAMENTARY_COMMITTEE',
    };
    const committee = transformCorporateBody(apiData);
    expect(committee.id).toBe('ENVI');
    expect(committee.name).toBe('Committee on the Environment');
    expect(committee.abbreviation).toBe('ENVI');
    expect(committee.members).toEqual(['person/1', 'person/2', 'person/3']);
    expect(committee.chair).toBe('person/1');
    expect(committee.viceChairs).toEqual(['person/2', 'person/3']);
    expect(committee.responsibilities).toContain('PARLIAMENTARY_COMMITTEE');
  });

  it('falls back to abbreviation for id when body_id is absent', () => {
    const apiData = { notation: 'LIBE' };
    const committee = transformCorporateBody(apiData);
    expect(committee.id).toBe('LIBE');
  });

  it('generates default name when label is absent', () => {
    const apiData = { body_id: 'AFET', notation: 'AFET' };
    const committee = transformCorporateBody(apiData);
    expect(committee.name).toBe('Committee AFET');
  });

  it('returns empty chair when members are absent', () => {
    const committee = transformCorporateBody({ body_id: 'TEST', notation: 'TEST' });
    expect(committee.chair).toBe('');
    expect(committee.viceChairs).toEqual([]);
  });

  it('returns empty responsibilities when classification is absent', () => {
    const committee = transformCorporateBody({ body_id: 'TEST' });
    expect(committee.responsibilities).toEqual([]);
  });
});

// ─── transformDocument ──────────────────────────────────────────

describe('transformDocument', () => {
  it('transforms a complete document', () => {
    const apiData = {
      work_id: 'A-9-2024-0001',
      work_type: 'REPORT_PLENARY',
      title_dcterms: [{ '@language': 'en', '@value': 'Climate Report' }],
      work_date_document: '2024-01-10',
      was_attributed_to: 'ENVI',
      status: 'ADOPTED',
    };
    const doc = transformDocument(apiData);
    expect(doc.id).toBe('A-9-2024-0001');
    expect(doc.type).toBe('REPORT');
    expect(doc.title).toBe('Climate Report');
    expect(doc.date).toBe('2024-01-10');
    expect(doc.committee).toBe('ENVI');
    expect(doc.status).toBe('ADOPTED');
  });

  it('falls back to Document {id} for title when title fields are absent', () => {
    const doc = transformDocument({ work_id: 'DOC-001' });
    expect(doc.title).toBe('Document DOC-001');
  });

  it('omits committee when was_attributed_to is absent', () => {
    const doc = transformDocument({ work_id: 'DOC-002' });
    expect(doc.committee).toBeUndefined();
  });

  it('defaults type to REPORT for unknown work_type', () => {
    const doc = transformDocument({ work_id: 'DOC-003', work_type: 'UNKNOWN' });
    expect(doc.type).toBe('REPORT');
  });

  it('defaults status to SUBMITTED for unknown status', () => {
    const doc = transformDocument({ work_id: 'DOC-004', status: 'PENDING_REVIEW' });
    expect(doc.status).toBe('SUBMITTED');
  });

  it('handles empty input', () => {
    const doc = transformDocument({});
    expect(doc.id).toBe('');
    expect(doc.type).toBe('REPORT');
    expect(doc.authors).toEqual([]);
    expect(doc.status).toBe('SUBMITTED');
  });
});

// ─── transformParliamentaryQuestion ────────────────────────────

describe('transformParliamentaryQuestion', () => {
  it('transforms a complete parliamentary question', () => {
    const apiData = {
      work_id: 'E-2024-000001',
      work_type: 'ORAL_QUESTION',
      was_created_by: 'person/123',
      work_date_document: '2024-02-01',
      title_dcterms: [{ '@language': 'en', '@value': 'Question on climate' }],
      was_realized_by: 'some_answer',
    };
    const q = transformParliamentaryQuestion(apiData);
    expect(q.id).toBe('E-2024-000001');
    expect(q.type).toBe('ORAL');
    expect(q.author).toBe('person/123');
    expect(q.date).toBe('2024-02-01');
    expect(q.topic).toBe('Question on climate');
    expect(q.status).toBe('ANSWERED');
    expect(q.answerText).toBeDefined();
    expect(q.answerDate).toBe('2024-02-01');
  });

  it('sets status to PENDING when was_realized_by is absent', () => {
    const q = transformParliamentaryQuestion({ work_id: 'E-001', work_type: 'WRITTEN_QUESTION' });
    expect(q.status).toBe('PENDING');
    expect(q.answerText).toBeUndefined();
    expect(q.answerDate).toBeUndefined();
  });

  it('maps WRITTEN question type', () => {
    const q = transformParliamentaryQuestion({ work_id: 'E-002', work_type: 'WRITTEN_QUESTION' });
    expect(q.type).toBe('WRITTEN');
  });

  it('defaults author to Unknown when was_created_by is absent', () => {
    const q = transformParliamentaryQuestion({ work_id: 'E-003' });
    expect(q.author).toBe('Unknown');
  });

  it('generates topic from id when title fields are absent', () => {
    const q = transformParliamentaryQuestion({ work_id: 'E-004' });
    expect(q.topic).toBe('Question E-004');
  });

  it('handles completely empty input', () => {
    const q = transformParliamentaryQuestion({});
    expect(q.id).toBe('');
    expect(q.type).toBe('WRITTEN');
    expect(q.author).toBe('Unknown');
    expect(q.status).toBe('PENDING');
  });
});

// ─── transformSpeech ────────────────────────────────────────────

describe('transformSpeech', () => {
  it('transforms a complete speech record', () => {
    const apiData = {
      identifier: 'SPEECH-2024-001',
      had_activity_type: 'SPEECH',
      had_participant_person: 'person/456',
      participant_label: [{ '@language': 'en', '@value': 'John MEP' }],
      activity_date: '2024-01-15',
      language: 'EN',
      text: [{ '@language': 'en', '@value': 'Speech content' }],
      was_part_of: 'SESSION-001',
    };
    const speech = transformSpeech(apiData);
    expect(speech.id).toBe('SPEECH-2024-001');
    expect(speech.speakerId).toBe('person/456');
    expect(speech.speakerName).toBe('John MEP');
    expect(speech.type).toBe('SPEECH');
    expect(speech.language).toBe('EN');
    expect(speech.text).toBe('Speech content');
    expect(speech.sessionReference).toBe('SESSION-001');
  });

  it('handles missing speaker information', () => {
    const speech = transformSpeech({ identifier: 'SPEECH-002' });
    expect(speech.speakerId).toBe('');
    expect(speech.speakerName).toBe('');
  });

  it('handles empty input', () => {
    const speech = transformSpeech({});
    expect(speech.id).toBe('');
    expect(speech.title).toBe('');
    expect(speech.text).toBe('');
  });
});

// ─── transformProcedure ─────────────────────────────────────────

describe('transformProcedure', () => {
  it('transforms a complete procedure', () => {
    const apiData = {
      identifier: '2024/0001(COD)',
      title_dcterms: [{ '@language': 'en', '@value': 'Regulation on AI' }],
      process_date_start: '2024-01-01',
      process_date_update: '2024-06-01',
      subject_matter: [{ '@language': 'en', '@value': 'Artificial Intelligence' }],
      process_type: 'COD',
      process_stage: 'FIRST_READING',
      process_status: 'ONGOING',
      was_attributed_to: 'IMCO',
      rapporteur: [{ '@language': 'en', '@value': 'Rapporteur Name' }],
      had_document: ['doc/1', 'doc/2'],
    };
    const proc = transformProcedure(apiData);
    expect(proc.id).toBe('2024/0001(COD)');
    expect(proc.title).toBe('Regulation on AI');
    expect(proc.reference).toBe('2024/0001(COD)');
    expect(proc.type).toBe('COD');
    expect(proc.subjectMatter).toBe('Artificial Intelligence');
    expect(proc.stage).toBe('FIRST_READING');
    expect(proc.status).toBe('ONGOING');
    expect(proc.dateInitiated).toBe('2024-01-01');
    expect(proc.dateLastActivity).toBe('2024-06-01');
    expect(proc.responsibleCommittee).toBe('IMCO');
    expect(proc.rapporteur).toBe('Rapporteur Name');
    expect(proc.documents).toEqual(['doc/1', 'doc/2']);
  });

  it('handles empty input', () => {
    const proc = transformProcedure({});
    expect(proc.id).toBe('');
    expect(proc.title).toBe('');
    expect(proc.documents).toEqual([]);
  });
});

// ─── transformAdoptedText ───────────────────────────────────────

describe('transformAdoptedText', () => {
  it('transforms a complete adopted text', () => {
    const apiData = {
      work_id: 'P9-TA-2024-0001',
      title_dcterms: [{ '@language': 'en', '@value': 'Adopted Resolution' }],
      work_type: 'TEXT_ADOPTED',
      work_date_document: '2024-03-15',
      based_on_a_concept_procedure: '2023/0123(COD)',
      subject_matter: [{ '@language': 'en', '@value': 'Digital Markets' }],
    };
    const text = transformAdoptedText(apiData);
    expect(text.id).toBe('P9-TA-2024-0001');
    expect(text.title).toBe('Adopted Resolution');
    expect(text.reference).toBe('P9-TA-2024-0001');
    expect(text.dateAdopted).toBe('2024-03-15');
    expect(text.procedureReference).toBe('2023/0123(COD)');
    expect(text.subjectMatter).toBe('Digital Markets');
  });

  it('handles empty input', () => {
    const text = transformAdoptedText({});
    expect(text.id).toBe('');
    expect(text.title).toBe('');
    expect(text.subjectMatter).toBe('');
  });
});

// ─── transformEvent ─────────────────────────────────────────────

describe('transformEvent', () => {
  it('transforms a complete event', () => {
    const apiData = {
      identifier: 'EVENT-2024-001',
      label: [{ '@language': 'en', '@value': 'Plenary Event' }],
      activity_start_date: '2024-01-15',
      activity_end_date: '2024-01-18',
      had_activity_type: 'PLENARY_PART',
      had_locality: 'Strasbourg',
      was_organized_by: 'EP',
      activity_status: 'COMPLETED',
    };
    const event = transformEvent(apiData);
    expect(event.id).toBe('EVENT-2024-001');
    expect(event.title).toBe('Plenary Event');
    expect(event.date).toBe('2024-01-15');
    expect(event.endDate).toBe('2024-01-18');
    expect(event.type).toBe('PLENARY_PART');
    expect(event.location).toBe('Strasbourg');
    expect(event.organizer).toBe('EP');
    expect(event.status).toBe('COMPLETED');
  });

  it('falls back to date/activity_date for start date', () => {
    const event = transformEvent({ identifier: 'EVT-001', date: '2024-05-01' });
    expect(event.date).toBe('2024-05-01');
  });

  it('handles empty input', () => {
    const event = transformEvent({});
    expect(event.id).toBe('');
    expect(event.title).toBe('');
    expect(event.date).toBe('');
    expect(event.endDate).toBe('');
  });
});

// ─── transformMeetingActivity ───────────────────────────────────

describe('transformMeetingActivity', () => {
  it('transforms a complete meeting activity', () => {
    const apiData = {
      identifier: 'ACT-2024-001',
      label: [{ '@language': 'en', '@value': 'Agenda Item 1' }],
      had_activity_type: 'VOTE',
      activity_date: '2024-01-15',
      activity_order: 3,
      had_document: 'A-9-2024-0001',
      was_attributed_to: 'ENVI',
    };
    const activity = transformMeetingActivity(apiData);
    expect(activity.id).toBe('ACT-2024-001');
    expect(activity.title).toBe('Agenda Item 1');
    expect(activity.type).toBe('VOTE');
    expect(activity.date).toBe('2024-01-15');
    expect(activity.order).toBe(3);
    expect(activity.reference).toBe('A-9-2024-0001');
    expect(activity.responsibleBody).toBe('ENVI');
  });

  it('defaults order to 0 when activity_order is absent', () => {
    const activity = transformMeetingActivity({ identifier: 'ACT-001' });
    expect(activity.order).toBe(0);
  });

  it('defaults order to 0 for non-number activity_order', () => {
    const activity = transformMeetingActivity({ identifier: 'ACT-002', activity_order: 'first' });
    expect(activity.order).toBe(0);
  });

  it('handles empty input', () => {
    const activity = transformMeetingActivity({});
    expect(activity.id).toBe('');
    expect(activity.order).toBe(0);
  });
});

// ─── transformMEPDeclaration ────────────────────────────────────

describe('transformMEPDeclaration', () => {
  it('transforms a complete MEP declaration', () => {
    const apiData = {
      work_id: 'DECL-2024-001',
      title_dcterms: [{ '@language': 'en', '@value': 'Financial Declaration' }],
      was_attributed_to: 'person/789',
      author_label: [{ '@language': 'en', '@value': 'MEP Author' }],
      work_type: 'DECLARATION_FINANCIAL_INTERESTS',
      work_date_document: '2024-01-01',
      'resource_legal_in-force': 'ACTIVE',
    };
    const decl = transformMEPDeclaration(apiData);
    expect(decl.id).toBe('DECL-2024-001');
    expect(decl.title).toBe('Financial Declaration');
    expect(decl.mepId).toBe('person/789');
    expect(decl.mepName).toBe('MEP Author');
    expect(decl.type).toBe('DECLARATION_FINANCIAL_INTERESTS');
    expect(decl.dateFiled).toBe('2024-01-01');
    expect(decl.status).toBe('ACTIVE');
  });

  it('extracts author field when was_attributed_to is absent', () => {
    const decl = transformMEPDeclaration({ work_id: 'DECL-002', author: 'person/100' });
    expect(decl.mepId).toBe('person/100');
  });

  it('returns empty mepName when author_label is absent', () => {
    const decl = transformMEPDeclaration({ work_id: 'DECL-003' });
    expect(decl.mepName).toBe('');
  });

  it('handles empty input', () => {
    const decl = transformMEPDeclaration({});
    expect(decl.id).toBe('');
    expect(decl.title).toBe('');
    expect(decl.mepId).toBe('');
    expect(decl.mepName).toBe('');
  });
});
