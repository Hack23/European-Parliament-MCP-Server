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
    expect(mep.id).toBe('person/999');
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

  it('extracts country from api:country-of-representation field', () => {
    const mep = transformMEP({ identifier: '10', label: 'Test', 'api:country-of-representation': 'DE' });
    expect(mep.country).toBe('DE');
  });

  it('extracts political group from api:political-group field', () => {
    const mep = transformMEP({ identifier: '11', label: 'Test', 'api:political-group': 'S&D' });
    expect(mep.politicalGroup).toBe('S&D');
  });

  it('transforms a real EP API JSON-LD MEP record', () => {
    const apiData = {
      id: 'person/1294',
      type: 'Person',
      identifier: '1294',
      label: 'Elio DI RUPO',
      familyName: 'Di Rupo',
      givenName: 'Elio',
      sortLabel: 'DIRUPO',
      'api:country-of-representation': 'BE',
      'api:political-group': 'S&D',
    };
    const mep = transformMEP(apiData);
    expect(mep.id).toBe('person/1294');
    expect(mep.name).toBe('Elio DI RUPO');
    expect(mep.country).toBe('BE');
    expect(mep.politicalGroup).toBe('S&D');
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

  it('extracts full name from prefLabel and abbreviation from label (real EP API /corporate-bodies/ENVI format)', () => {
    // Real EP API data shape from: GET /corporate-bodies/ENVI
    const apiData = {
      id: 'org/ENVI',
      type: 'Organization',
      identifier: 'ENVI',
      source: 'EU_PARLIAMENT',
      label: 'ENVI',
      altLabel: { en: 'Environment, Climate and Food Safety', fr: 'Environnement, climat et sécurité alimentaire' },
      prefLabel: { en: 'Committee on the Environment, Climate and Food Safety', fr: "Commission de l'environnement, du climat et de la sécurité alimentaire" },
      hasCurrentVersion: 'org/7913',
      classification: 'def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING',
      inverse_isVersionOf: ['org/102', 'org/1079', 'org/12'],
    };
    const committee = transformCorporateBody(apiData);
    // Name must come from prefLabel (full multilingual name), NOT label (abbreviation)
    expect(committee.name).toBe('Committee on the Environment, Climate and Food Safety');
    // Abbreviation must be the short code from label, not the org/ prefixed id
    expect(committee.abbreviation).toBe('ENVI');
    expect(committee.id).toBe('org/ENVI');
    expect(committee.responsibilities).toContain('COMMITTEE_PARLIAMENTARY_STANDING');
  });

  it('extracts abbreviation from label for list endpoint items (real EP API /corporate-bodies list format)', () => {
    // Real EP API data shape from: GET /corporate-bodies?body-classification=COMMITTEE_PARLIAMENTARY_STANDING
    const apiData = {
      id: 'org/102',
      type: 'Organization',
      identifier: '102',
      label: 'ENVI',
      classification: 'def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING',
    };
    const committee = transformCorporateBody(apiData);
    // Abbreviation comes from string label when notation is absent
    expect(committee.abbreviation).toBe('ENVI');
    // Name falls back to label when prefLabel/altLabel are absent
    expect(committee.name).toBe('ENVI');
    expect(committee.id).toBe('org/102');
  });

  it('prefers altLabel over label for committee name when prefLabel is absent', () => {
    const apiData = {
      id: 'org/ITRE',
      label: 'ITRE',
      altLabel: { en: 'Industry, Research and Energy' },
      classification: 'def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING',
    };
    const committee = transformCorporateBody(apiData);
    expect(committee.name).toBe('Industry, Research and Energy');
    expect(committee.abbreviation).toBe('ITRE');
  });

  it('falls through to altLabel when prefLabel exists but has no supported language keys', () => {
    const apiData = {
      id: 'org/ENVI',
      label: 'ENVI',
      // extractMultilingualText object mode supports en/@value/mul only
      prefLabel: { fr: "Commission de l'environnement" },
      altLabel: { en: 'Environment, Climate and Food Safety' },
      classification: 'def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING',
    };
    const committee = transformCorporateBody(apiData);
    expect(committee.name).toBe('Environment, Climate and Food Safety');
    expect(committee.abbreviation).toBe('ENVI');
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

  it('extracts mepId from workHadParticipation array (real EP API format)', () => {
    const apiData = {
      work_id: 'DECL-004',
      workHadParticipation: [{
        id: 'eli/dl/participation/DECL-004-AUTHOR',
        type: 'Participation',
        had_participant_person: 'person/840',
        participant_label: 'Charles GOERENS',
      }],
      document_date: '2024-12-02',
    };
    const decl = transformMEPDeclaration(apiData);
    expect(decl.mepId).toBe('person/840');
    expect(decl.dateFiled).toBe('2024-12-02');
  });
});

// ─── Real EP API format tests ──────────────────────────────────

describe('transformers with real EP API JSON-LD format', () => {
  it('transformPlenarySession: extracts date, attendance, agenda from real meeting data', () => {
    const apiData = {
      activity_id: 'MTG-PL-2024-01-15',
      activity_date: '2024-01-15',
      activity_start_date: '2024-01-15T01:00:00+01:00',
      activity_end_date: '2024-01-15T23:00:00+01:00',
      hasLocality: 'http://publications.europa.eu/resource/authority/place/FRA_SXB',
      number_of_attendees: 581,
      consists_of: ['eli/dl/event/MTG-PL-2024-01-15-PVCRE-ITM-14', 'eli/dl/event/MTG-PL-2024-01-15-PVCRE-ITM-22'],
      documented_by_a_realization_of: ['eli/dl/doc/OJQ-9-2024-01-15'],
      had_participant_person: ['person/99283', 'person/88882'],
      type: 'Activity',
    };
    const session = transformPlenarySession(apiData);
    expect(session.id).toBe('MTG-PL-2024-01-15');
    expect(session.date).toBe('2024-01-15');
    expect(session.location).toBe('Strasbourg');
    expect(session.attendanceCount).toBe(581);
    expect(session.agendaItems).toHaveLength(2);
    expect(session.documents).toHaveLength(1);
  });

  it('transformSpeech: extracts speaker from nested had_participation (real EP API format)', () => {
    const apiData = {
      activity_date: '2023-10-17',
      activity_id: 'MTG-PL-2023-10-17-OTH-20390000',
      activity_label: { en: 'Effectiveness of EU sanctions against Russia (debate)' },
      had_activity_type: 'def/ep-activities/PLENARY_DEBATE_SPEECH',
      had_participation: {
        id: 'eli/dl/participation/MTG-PL-2023-10-17-OTH-20390000_197537',
        type: 'Participation',
        had_participant_person: 'person/197537',
        participant_label: 'Test Speaker',
      },
      id: 'eli/dl/event/MTG-PL-2023-10-17-OTH-20390000',
      inverse_consists_of: ['eli/dl/event/MTG-PL-2023-10-17-PVCRE-ITM-2'],
      type: 'Activity',
    };
    const speech = transformSpeech(apiData);
    expect(speech.id).toBe('MTG-PL-2023-10-17-OTH-20390000');
    expect(speech.title).toBe('Effectiveness of EU sanctions against Russia (debate)');
    expect(speech.speakerId).toBe('person/197537');
    expect(speech.speakerName).toBe('Test Speaker');
    expect(speech.date).toBe('2023-10-17');
    expect(speech.sessionReference).toBe('eli/dl/event/MTG-PL-2023-10-17-PVCRE-ITM-2');
  });

  it('transformAdoptedText: extracts date from document_date and subject from isAboutSubjectMatter', () => {
    const apiData = {
      id: 'eli/dl/doc/TA-9-2024-04-25-ANN01',
      identifier: 'TA-9-2024-04-25-ANN01',
      title_dcterms: { en: 'EP Budget Draft 2025' },
      document_date: '2024-04-25',
      work_type: 'def/ep-document-types/BUDGET_EP_DRAFT',
      isAboutSubjectMatter: 'Budget and financial management',
      type: 'Work',
    };
    const text = transformAdoptedText(apiData);
    expect(text.dateAdopted).toBe('2024-04-25');
    expect(text.subjectMatter).toBe('Budget and financial management');
    expect(text.title).toBe('EP Budget Draft 2025');
  });

  it('transformEvent: extracts id from activity_id (real EP API format)', () => {
    const apiData = {
      activity_id: '1972-0003-ANPRO-1972-11-06',
      had_activity_type: 'def/ep-activities/REFERRAL',
      id: 'eli/dl/event/1972-0003-ANPRO-1972-11-06',
      type: 'Activity',
    };
    const event = transformEvent(apiData);
    expect(event.id).toBe('1972-0003-ANPRO-1972-11-06');
    expect(event.type).toBe('def/ep-activities/REFERRAL');
  });

  it('transformMEPDetails: extracts country code from citizenship URI', () => {
    const apiData = {
      identifier: '124810',
      label: 'Barbara SPINELLI',
      citizenship: 'http://publications.europa.eu/resource/authority/country/ITA',
      bday: '1946-05-31',
      hasMembership: [],
    };
    const details = transformMEPDetails(apiData);
    expect(details.country).toBe('ITA');
    expect(details.biography).toContain('1946-05-31');
  });

  it('transformVoteResult: extracts date from activity_date plain string', () => {
    const apiData = {
      activity_id: 'VOTE-REAL-001',
      activity_date: '2024-01-15',
      activity_label: { en: 'Resolution on climate change' },
      number_of_votes_favor: 450,
      number_of_votes_against: 150,
      number_of_votes_abstention: 50,
    };
    const vote = transformVoteResult(apiData, 'SESSION-REAL');
    expect(vote.date).toBe('2024-01-15');
    expect(vote.topic).toBe('Resolution on climate change');
  });

  it('transformDocument: extracts date from document_date field', () => {
    const apiData = {
      id: 'eli/dl/doc/A-9-2024-0001',
      identifier: 'A-9-2024-0001',
      document_date: '2024-06-15',
      title_dcterms: { en: 'Test Report' },
      work_type: 'REPORT_PLENARY',
    };
    const doc = transformDocument(apiData);
    expect(doc.date).toBe('2024-06-15');
  });

  it('transformSpeech: extracts speakerId from had_participation with array had_participant_person (real EP API)', () => {
    const apiData = {
      activity_date: '2023-10-17',
      activity_id: 'MTG-PL-2023-10-17-OTH-20390000',
      activity_label: { en: 'Effectiveness of the EU sanctions on Russia (debate)' },
      had_activity_type: 'def/ep-activities/PLENARY_DEBATE_SPEECH',
      had_participation: {
        id: 'eli/dl/participation/MTG-PL-2023-10-17-OTH-20390000_197537',
        type: 'Participation',
        had_participant_person: ['person/197537'],
        participation_role: 'def/ep-roles/SPEAKER',
      },
      inverse_consists_of: ['eli/dl/event/MTG-PL-2023-10-17-PVCRE-ITM-2'],
    };
    const speech = transformSpeech(apiData);
    expect(speech.speakerId).toBe('person/197537');
    expect(speech.date).toBe('2023-10-17');
    expect(speech.title).toBe('Effectiveness of the EU sanctions on Russia (debate)');
    expect(speech.sessionReference).toBe('eli/dl/event/MTG-PL-2023-10-17-PVCRE-ITM-2');
  });

  it('transformAdoptedText: extracts subjectMatter codes from isAboutSubjectMatter URI array (real EP API)', () => {
    const apiData = {
      identifier: 'TA-10-2025-0004',
      document_date: '2025-01-23',
      isAboutSubjectMatter: [
        'http://publications.europa.eu/resource/authority/subject-matter/DDLH',
        'http://publications.europa.eu/resource/authority/subject-matter/PESC',
      ],
      title_dcterms: { en: 'Systematic repression of human rights in Iran' },
      work_type: 'def/ep-document-types/TEXT_ADOPTED',
    };
    const text = transformAdoptedText(apiData);
    expect(text.subjectMatter).toBe('DDLH, PESC');
    expect(text.title).toBe('Systematic repression of human rights in Iran');
    expect(text.dateAdopted).toBe('2025-01-23');
  });

  it('transformAdoptedText: extracts procedureReference from inverse_decided_on_a_realization_of array (real EP API)', () => {
    const apiData = {
      identifier: 'TA-10-2025-0004',
      document_date: '2025-01-23',
      title_dcterms: { en: 'Test title' },
      work_type: 'def/ep-document-types/TEXT_ADOPTED',
      inverse_decided_on_a_realization_of: ['eli/dl/event/2025-2511-DEC-DCPL-2025-01-23'],
    };
    const text = transformAdoptedText(apiData);
    expect(text.procedureReference).toBe('eli/dl/event/2025-2511-DEC-DCPL-2025-01-23');
  });

  it('transformProcedure: handles minimal real EP API list format', () => {
    const apiData = {
      id: 'eli/dl/proc/2025-0009',
      type: 'Process',
      process_id: '2025-0009',
      process_type: 'def/ep-procedure-types/NLE',
      label: '2025/0009(NLE)',
    };
    const proc = transformProcedure(apiData);
    expect(proc.title).toBe('2025/0009(NLE)');
    expect(proc.type).toBe('def/ep-procedure-types/NLE');
    expect(proc.reference).toBe('2025-0009');
  });

  it('transformParliamentaryQuestion: handles minimal real EP API list format', () => {
    const apiData = {
      id: 'eli/dl/doc/E-10-2025-000001',
      type: 'Work',
      work_type: 'def/ep-document-types/QUESTION_WRITTEN',
      identifier: 'E-10-2025-000001',
    };
    const q = transformParliamentaryQuestion(apiData);
    // extractField(['work_id', 'id', 'identifier']) checks work_id first, then id (full URI path)
    expect(q.id).toBe('eli/dl/doc/E-10-2025-000001');
    expect(q.type).toBe('WRITTEN');
    expect(q.author).toBe('Unknown');
    expect(q.status).toBe('PENDING');
  });

  it('transformMEP: handles real EP API show-incoming format (no api: prefixed fields)', () => {
    const apiData = {
      id: 'person/40224',
      type: 'Person',
      identifier: '40224',
      label: 'Andi CRISTEA',
      familyName: 'Cristea',
      givenName: 'Andi',
      sortLabel: 'CRISTEA',
    };
    const mep = transformMEP(apiData);
    expect(mep.id).toBe('person/40224');
    expect(mep.name).toBe('Andi CRISTEA');
    expect(mep.country).toBe('Unknown');
    expect(mep.politicalGroup).toBe('Unknown');
    expect(mep.active).toBe(false);
  });

  it('transformMEPDeclaration: handles real EP API list format with document_date', () => {
    const apiData = {
      id: 'eli/dl/doc/DCI-197627-2025-09-26-495297',
      type: 'Work',
      document_date: '2025-09-26',
      work_type: 'def/ep-document-types/MEMBER_DECLARATION_INTEREST_CONFLICT',
    };
    const d = transformMEPDeclaration(apiData);
    expect(d.dateFiled).toBe('2025-09-26');
    expect(d.type).toBe('def/ep-document-types/MEMBER_DECLARATION_INTEREST_CONFLICT');
  });

  it('transformPlenarySession: counts attendance from had_participant_person array (real EP API)', () => {
    const apiData = {
      activity_id: 'MTG-PL-2025-01-20',
      activity_date: '2025-01-20',
      hasLocality: 'http://publications.europa.eu/resource/authority/place/FRA_SXB',
      consists_of: ['eli/dl/event/item-1', 'eli/dl/event/item-2'],
      documented_by_a_realization_of: ['eli/dl/doc/OJQ-10-2025-01-20'],
      had_participant_person: Array.from({ length: 604 }, (_, i) => `person/${i}`),
      number_of_attendees: 604,
    };
    const session = transformPlenarySession(apiData);
    expect(session.id).toBe('MTG-PL-2025-01-20');
    expect(session.date).toBe('2025-01-20');
    expect(session.location).toBe('Strasbourg');
    expect(session.attendanceCount).toBe(604);
    expect(session.agendaItems).toHaveLength(2);
    expect(session.documents).toHaveLength(1);
  });

  it('transformCorporateBody: extracts full name and abbreviation from real EP API /corporate-bodies/ENVI response', () => {
    // Exact data shape returned by: GET /corporate-bodies/ENVI?format=application/ld+json
    const apiData = {
      id: 'org/ENVI',
      type: 'Organization',
      identifier: 'ENVI',
      source: 'EU_PARLIAMENT',
      label: 'ENVI',
      altLabel: {
        en: 'Environment, Climate and Food Safety',
        sv: 'Miljö, klimat och livsmedelssäkerhet',
        fr: 'Environnement, climat et sécurité alimentaire',
      },
      prefLabel: {
        en: 'Committee on the Environment, Climate and Food Safety',
        sv: 'Utskottet för miljö, klimat och livsmedelssäkerhet',
        fr: "Commission de l'environnement, du climat et de la sécurité alimentaire",
      },
      hasCurrentVersion: 'org/7913',
      classification: 'def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING',
      inverse_isVersionOf: ['org/102', 'org/1079', 'org/12'],
    };
    const committee = transformCorporateBody(apiData);
    // Verifies the fix: name must NOT be the abbreviation "ENVI"
    expect(committee.name).toBe('Committee on the Environment, Climate and Food Safety');
    expect(committee.name).not.toBe('ENVI');
    expect(committee.abbreviation).toBe('ENVI');
    expect(committee.id).toBe('org/ENVI');
    expect(committee.responsibilities).toContain('COMMITTEE_PARLIAMENTARY_STANDING');
  });

  it('transformCorporateBody: handles minimal list-endpoint data without prefLabel (real EP API)', () => {
    // Exact data shape from: GET /corporate-bodies?body-classification=COMMITTEE_PARLIAMENTARY_STANDING
    const apiData = {
      id: 'org/1',
      type: 'Organization',
      identifier: '1',
      label: 'ECON',
      classification: 'def/ep-entities/COMMITTEE_PARLIAMENTARY_STANDING',
    };
    const committee = transformCorporateBody(apiData);
    expect(committee.abbreviation).toBe('ECON');
    expect(committee.id).toBe('org/1');
    // Without prefLabel, name falls back to label
    expect(committee.name).toBe('ECON');
  });
});

// ─── Real EP API v2 Response Shape Tests ────────────────────────────────
// These tests use exact response shapes from curl against the live EP API v2
// to verify transformer correctness with real production data.

describe('Real EP API v2 Response Shapes', () => {
  describe('MEP list endpoint (/meps)', () => {
    it('transforms real /meps list item (minimal shape)', () => {
      // Exact shape from: curl 'https://data.europarl.europa.eu/api/v2/meps?limit=1&format=application/ld+json'
      const apiData = {
        id: 'person/1',
        type: 'Person',
        identifier: '1',
        label: 'Georg JARZEMBOWSKI',
        familyName: 'Jarzembowski',
        givenName: 'Georg',
        sortLabel: 'JARZEMBOWSKI',
      };
      const mep = transformMEP(apiData);
      expect(mep.id).toBe('person/1');
      expect(mep.name).toBe('Georg JARZEMBOWSKI');
      expect(mep.country).toBe('Unknown');
      expect(mep.politicalGroup).toBe('Unknown');
      expect(mep.active).toBe(false);
    });

    it('transforms real /meps list item with accented name', () => {
      const apiData = {
        id: 'person/2',
        type: 'Person',
        identifier: '2',
        label: 'José María LAFUENTE LÓPEZ',
        familyName: 'Lafuente López',
        givenName: 'José María',
        sortLabel: 'LAFUENTE LOPEZ',
      };
      const mep = transformMEP(apiData);
      expect(mep.id).toBe('person/2');
      expect(mep.name).toBe('José María LAFUENTE LÓPEZ');
    });
  });

  describe('MEP show-current endpoint (/meps/show-current)', () => {
    it('transforms real /meps/show-current item with country and group', () => {
      // Exact shape from: curl 'https://data.europarl.europa.eu/api/v2/meps/show-current?limit=1&format=application/ld+json'
      const apiData = {
        id: 'person/1294',
        type: 'Person',
        identifier: '1294',
        label: 'Elio DI RUPO',
        familyName: 'Di Rupo',
        givenName: 'Elio',
        sortLabel: 'DIRUPO',
        'api:country-of-representation': 'BE',
        'api:political-group': 'S&D',
      };
      const mep = transformMEP(apiData);
      expect(mep.id).toBe('person/1294');
      expect(mep.name).toBe('Elio DI RUPO');
      expect(mep.country).toBe('BE');
      expect(mep.politicalGroup).toBe('S&D');
    });
  });

  describe('Meetings endpoint (/meetings)', () => {
    it('transforms real /meetings plenary session', () => {
      // Exact shape from: curl 'https://data.europarl.europa.eu/api/v2/meetings?limit=1&year=2024&format=application/ld+json'
      const apiData = {
        id: 'eli/dl/event/MTG-PL-2024-01-15',
        type: 'Activity',
        activity_date: '2024-01-15',
        activity_end_date: '2024-01-15T23:00:00+01:00',
        activity_id: 'MTG-PL-2024-01-15',
        activity_label: {
          en: 'Monday, 15 January 2024',
          fr: 'Lundi 15 janvier 2024',
          de: 'Montag, 15. Januar 2024',
        },
        activity_start_date: '2024-01-15T01:00:00+01:00',
        consists_of: [
          'eli/dl/event/MTG-PL-2024-01-15-PVCRE-ITM-14',
          'eli/dl/event/MTG-PL-2024-01-15-PVCRE-ITM-22',
          'eli/dl/event/MTG-PL-2024-01-15-VOT-ITM-000003',
        ],
        documented_by_a_realization_of: ['eli/dl/doc/OJQ-9-2024-01-15'],
        had_activity_type: 'def/ep-activities/PLENARY_SITTING',
        number_of_attendees: 450,
      };
      const session = transformPlenarySession(apiData);
      expect(session.id).toBe('MTG-PL-2024-01-15');
      expect(session.date).toBe('2024-01-15');
      expect(session.attendanceCount).toBe(450);
      expect(session.agendaItems).toHaveLength(3);
      expect(session.agendaItems[0]).toBe('eli/dl/event/MTG-PL-2024-01-15-PVCRE-ITM-14');
      expect(session.documents).toHaveLength(1);
      expect(session.documents?.[0]).toBe('eli/dl/doc/OJQ-9-2024-01-15');
    });
  });

  describe('Procedures endpoint (/procedures)', () => {
    it('transforms real /procedures list item', () => {
      // Exact shape from: curl 'https://data.europarl.europa.eu/api/v2/procedures?limit=1&year=2024&format=application/ld+json'
      const apiData = {
        id: 'eli/dl/proc/2024-0003',
        type: 'Process',
        process_id: '2024-0003',
        process_type: 'def/ep-procedure-types/BUD',
        label: '2024/0003(BUD)',
      };
      const procedure = transformProcedure(apiData);
      // extractField picks process_id for both id and reference since it's the first scalar match
      // from the ['identifier', 'id', 'process_id'] priority list; 'id' contains a slash URI
      expect(procedure.id).toBeTruthy();
      expect(procedure.title).toBe('2024/0003(BUD)');
      expect(procedure.type).toBe('def/ep-procedure-types/BUD');
    });

    it('transforms COD procedure type', () => {
      const apiData = {
        id: 'eli/dl/proc/2024-0006',
        type: 'Process',
        process_id: '2024-0006',
        process_type: 'def/ep-procedure-types/COD',
        label: '2024/0006(COD)',
      };
      const procedure = transformProcedure(apiData);
      expect(procedure.type).toBe('def/ep-procedure-types/COD');
      expect(procedure.title).toBe('2024/0006(COD)');
    });
  });

  describe('Speeches endpoint (/speeches)', () => {
    it('transforms real /speeches debate speech', () => {
      // Exact shape from: curl 'https://data.europarl.europa.eu/api/v2/speeches?limit=1&year=2024&format=application/ld+json'
      const apiData = {
        id: 'eli/dl/event/MTG-PL-2023-10-17-OTH-20390000',
        type: 'Activity',
        activity_date: '2023-10-17',
        activity_end_date: '2023-10-17T09:59:49+02:00',
        activity_id: 'MTG-PL-2023-10-17-OTH-20390000',
        activity_label: {
          en: 'Effectiveness of the EU sanctions on Russia (debate)',
          fr: 'Efficacité des sanctions de l\'UE à l\u2019encontre de la Russie (débat)',
          de: 'Wirksamkeit der gegen Russland verhängten EU-Sanktionen (Aussprache)',
        },
        activity_start_date: '2023-10-17T09:58:49.056+02:00',
        had_activity_type: 'def/ep-activities/PLENARY_DEBATE_SPEECH',
        had_participation: {
          id: 'eli/dl/participation/MTG-PL-2023-10-17-OTH-20390000_197537',
          type: 'Participation',
          had_participant_person: ['person/197537'],
          participation_role: 'def/ep-roles/SPEAKER',
        },
        recorded_in_a_realization_of: [{
          id: 'eli/dl/doc/CRE-9-2023-10-17-OTH-20390000',
          type: 'WorkSubdivision',
          is_part_of: 'eli/dl/doc/CRE-9-2023-10-17-ITM-002',
          number: '2-039-0000',
          type_subdivision: 'http://publications.europa.eu/resource/authority/subdivision/OTH',
          identifier: 'CRE-9-2023-10-17-OTH-20390000',
          notation_speechId: '20390000',
          numbering: 36,
          originalLanguage: ['http://publications.europa.eu/resource/authority/language/ENG'],
        }],
        inverse_consists_of: ['eli/dl/event/MTG-PL-2023-10-17-PVCRE-ITM-2'],
      };
      const speech = transformSpeech(apiData);
      expect(speech.id).toBe('MTG-PL-2023-10-17-OTH-20390000');
      expect(speech.title).toBe('Effectiveness of the EU sanctions on Russia (debate)');
      expect(speech.speakerId).toBe('person/197537');
      expect(speech.date).toBe('2023-10-17');
      expect(speech.type).toBe('def/ep-activities/PLENARY_DEBATE_SPEECH');
      expect(speech.sessionReference).toBe('eli/dl/event/MTG-PL-2023-10-17-PVCRE-ITM-2');
    });
  });

  describe('Adopted Texts endpoint (/adopted-texts)', () => {
    it('transforms real /adopted-texts item with nested expressions', () => {
      // Simplified shape from: curl 'https://data.europarl.europa.eu/api/v2/adopted-texts?limit=1&year=2024&format=application/ld+json'
      const apiData = {
        id: 'eli/dl/doc/TA-9-2024-0104',
        type: 'Work',
        adopts: ['eli/dl/doc/A-9-2023-0389'],
        parliamentary_term: 'org/ep-9',
        document_date: '2024-02-28',
        is_about: [
          'http://eurovoc.europa.eu/c_427566b7',
          'http://eurovoc.europa.eu/3450',
          'http://eurovoc.europa.eu/5873',
        ],
        is_realized_by: [{
          id: 'eli/dl/doc/TA-9-2024-0104/en',
          type: 'Expression',
          language: 'http://publications.europa.eu/resource/authority/language/ENG',
          title: {
            en: 'Implementation of the common foreign and security policy - annual report 2023',
          },
        }],
        work_type: 'def/ep-document-types/TEXT_ADOPTED',
        identifier: 'TA-9-2024-0104',
      };
      const text = transformAdoptedText(apiData);
      expect(text.id).toBe('TA-9-2024-0104');
      expect(text.reference).toBe('TA-9-2024-0104');
      expect(text.type).toBe('def/ep-document-types/TEXT_ADOPTED');
      expect(text.dateAdopted).toBe('2024-02-28');
    });
  });

  describe('Parliamentary Questions endpoint (/parliamentary-questions)', () => {
    it('transforms real /parliamentary-questions list item (minimal)', () => {
      // Exact shape from: curl 'https://data.europarl.europa.eu/api/v2/parliamentary-questions?limit=1&year=2024&format=application/ld+json'
      const apiData = {
        id: 'eli/dl/doc/E-10-2024-001357',
        type: 'Work',
        work_type: 'def/ep-document-types/QUESTION_WRITTEN',
        identifier: 'E-10-2024-001357',
      };
      const question = transformParliamentaryQuestion(apiData);
      // extractField prefers 'id' over 'identifier' in the field list
      expect(question.id).toBe('eli/dl/doc/E-10-2024-001357');
      expect(question.type).toBe('WRITTEN');
    });
  });

  describe('Events endpoint (/events)', () => {
    it('transforms real /events item', () => {
      // Exact shape from: curl 'https://data.europarl.europa.eu/api/v2/events?limit=1&year=2024&format=application/ld+json'
      const apiData = {
        id: 'eli/dl/event/1972-0003-ANPRO-1972-11-06',
        type: 'Activity',
        activity_id: '1972-0003-ANPRO-1972-11-06',
        had_activity_type: 'def/ep-activities/REFERRAL',
      };
      const event = transformEvent(apiData);
      expect(event.id).toBe('1972-0003-ANPRO-1972-11-06');
      expect(event.type).toBe('def/ep-activities/REFERRAL');
    });
  });

  describe('Corporate Bodies endpoint (/corporate-bodies/show-current)', () => {
    it('transforms real /corporate-bodies/show-current item', () => {
      // Exact shape from: curl 'https://data.europarl.europa.eu/api/v2/corporate-bodies/show-current?limit=1&format=application/ld+json'
      const apiData = {
        id: 'org/3730',
        type: 'Organization',
        identifier: '3730',
        label: 'STOA',
      };
      const committee = transformCorporateBody(apiData);
      expect(committee.id).toBe('org/3730');
      expect(committee.abbreviation).toBe('STOA');
      expect(committee.name).toBe('STOA');
    });

    it('transforms corporate body with classification', () => {
      const apiData = {
        id: 'org/3901',
        type: 'Organization',
        identifier: '3901',
        classification: 'def/ep-entities/NATIONAL_CHAMBER',
      };
      const committee = transformCorporateBody(apiData);
      expect(committee.id).toBe('org/3901');
      expect(committee.responsibilities).toContain('NATIONAL_CHAMBER');
    });
  });

  describe('MEP Declarations endpoint (/meps-declarations)', () => {
    it('transforms real /meps-declarations item with work_type', () => {
      // Exact shape from: curl 'https://data.europarl.europa.eu/api/v2/meps-declarations?limit=1&year=2024&format=application/ld+json'
      const apiData = {
        id: 'eli/dl/doc/DCI-28150-2024-12-03-420396',
        type: 'Work',
        parliamentary_term: 'org/ep-10',
        document_date: '2024-12-03',
        is_realized_by: [{
          id: 'eli/dl/doc/DCI-28150-2024-12-03-420396/en',
          type: 'Expression',
          language: 'http://publications.europa.eu/resource/authority/language/ENG',
          title: {
            en: 'Declaration on awareness of conflicts of interest - Kinga GÁL - Shadow rapporteur for report - Committee on Foreign Affairs - 03-12-2024',
          },
        }],
        work_type: 'def/ep-document-types/MEMBER_DECLARATION_INTEREST_CONFLICT',
        identifier: 'DCI-28150-2024-12-03-420396',
        publisher: 'org/EU_PARLIAMENT',
        title_dcterms: {
          en: 'Declaration on awareness of conflicts of interest - Kinga GÁL - Shadow rapporteur for report - Committee on Foreign Affairs - 03-12-2024',
          fr: 'Déclaration de connaissance de conflits d\u2019intérêts - Kinga GÁL - Rapporteur fictif pour rapport - Commission des affaires étrangères - 03-12-2024',
        },
      };
      const declaration = transformMEPDeclaration(apiData);
      expect(declaration.id).toBe('DCI-28150-2024-12-03-420396');
      expect(declaration.title).toContain('Declaration on awareness of conflicts of interest');
      expect(declaration.type).toBe('def/ep-document-types/MEMBER_DECLARATION_INTEREST_CONFLICT');
      expect(declaration.dateFiled).toBe('2024-12-03');
    });
  });

  describe('Controlled Vocabularies endpoint (/controlled-vocabularies)', () => {
    it('transforms vocabulary as document (minimal shape)', () => {
      // Exact shape from: curl 'https://data.europarl.europa.eu/api/v2/controlled-vocabularies?limit=1&format=application/ld+json'
      const apiData = {
        id: 'def/ep-document-types',
        type: 'ConceptScheme',
        versionInfo: '20260131_1',
      };
      // Controlled vocabularies go through transformDocument
      const doc = transformDocument(apiData);
      expect(doc.id).toBe('def/ep-document-types');
    });
  });

  describe('Feed endpoint response shapes', () => {
    it('transforms feed MEP item (same as /meps list item)', () => {
      // Exact shape from: curl 'https://data.europarl.europa.eu/api/v2/meps/feed?timeframe=one-week&format=application/ld+json'
      const apiData = {
        id: 'person/28150',
        type: 'Person',
        identifier: '28150',
        label: 'Kinga GÁL',
        familyName: 'Gál',
        givenName: 'Kinga',
        sortLabel: 'GAL',
      };
      const mep = transformMEP(apiData);
      expect(mep.id).toBe('person/28150');
      expect(mep.name).toBe('Kinga GÁL');
    });

    it('transforms feed adopted-text item (minimal shape)', () => {
      // Exact shape from: curl 'https://data.europarl.europa.eu/api/v2/adopted-texts/feed?timeframe=one-week&format=application/ld+json'
      const apiData = {
        id: 'eli/dl/doc/TA-10-2025-0279',
        type: 'Work',
        work_type: 'def/ep-document-types/TEXT_ADOPTED',
        identifier: 'TA-10-2025-0279',
        label: 'T10-0279/2025',
      };
      const text = transformAdoptedText(apiData);
      expect(text.id).toBe('TA-10-2025-0279');
      expect(text.title).toBe('T10-0279/2025');
      expect(text.reference).toBe('TA-10-2025-0279');
      expect(text.type).toBe('def/ep-document-types/TEXT_ADOPTED');
    });

    it('transforms feed declarations item (minimal shape)', () => {
      // Exact shape from: curl 'https://data.europarl.europa.eu/api/v2/meps-declarations/feed?timeframe=one-week&format=application/ld+json'
      const apiData = {
        id: 'eli/dl/doc/DCI-106936-2026-04-01-546295',
        type: 'Work',
        work_type: 'def/ep-document-types/MEMBER_DECLARATION_INTEREST_CONFLICT',
        identifier: 'DCI-106936-2026-04-01-546295',
        label: 'DCI-106936-2026-04-01-546295',
      };
      const declaration = transformMEPDeclaration(apiData);
      expect(declaration.id).toBe('DCI-106936-2026-04-01-546295');
      expect(declaration.type).toBe('def/ep-document-types/MEMBER_DECLARATION_INTEREST_CONFLICT');
    });

    it('transforms feed corporate-bodies item', () => {
      // Exact shape from: curl 'https://data.europarl.europa.eu/api/v2/corporate-bodies/feed?timeframe=one-week&format=application/ld+json'
      const apiData = {
        id: 'org/7875',
        type: 'Organization',
        identifier: '7875',
        label: 'CJ52',
        classification: 'def/ep-entities/COMMITTEE_PARLIAMENTARY_JOINT',
        linkedTo: ['org/6579', 'org/6572'],
      };
      const committee = transformCorporateBody(apiData);
      expect(committee.id).toBe('org/7875');
      expect(committee.abbreviation).toBe('CJ52');
      expect(committee.responsibilities).toContain('COMMITTEE_PARLIAMENTARY_JOINT');
    });
  });
});
