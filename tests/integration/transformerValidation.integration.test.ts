/**
 * Transformer Validation Integration Tests
 *
 * Downloads real data from the EU Parliament v2 API and validates that
 * every transformer correctly maps all fields and attributes.
 *
 * These tests are resilient to the slow EP API by using generous timeouts,
 * retry logic, and graceful skip-on-network-error behavior.
 *
 * ISMS Policy: SC-002 (Secure Testing), DV-001 (Data Validation)
 *
 * @see https://data.europarl.europa.eu/api/v2/
 */

import { describe, it, expect } from 'vitest';
import { retryOrSkip } from '../helpers/testUtils.js';
import { shouldRunIntegrationTests } from './setup.js';

import {
  transformMEP,
  transformMEPDetails,
  transformPlenarySession,
  transformCorporateBody,
  transformDocument,
  transformParliamentaryQuestion,
  transformSpeech,
  transformProcedure,
  transformAdoptedText,
  transformEvent,
  transformMEPDeclaration,
} from '../../src/clients/ep/transformers.js';

// ─── Helpers ────────────────────────────────────────────────────

const EP_BASE = process.env.EP_API_URL?.replace(/\/$/, '') || 'https://data.europarl.europa.eu/api/v2';

/** Timeout for individual EP API requests (ms). */
const REQUEST_TIMEOUT_MS = 30_000;

/** Maximum time for a single test (ms). Generous to tolerate slow EP API. */
const TEST_TIMEOUT_MS = 60_000;

interface JSONLDResponse {
  readonly data: ReadonlyArray<Record<string, unknown>>;
  readonly '@context': unknown;
}

/**
 * Fetch a JSON-LD resource from the EP API with timeout.
 * Returns `undefined` on network/timeout errors so the test can skip gracefully.
 */
async function fetchEP(path: string): Promise<JSONLDResponse | undefined> {
  const url = `${EP_BASE}${path}${path.includes('?') ? '&' : '?'}format=application%2Fld%2Bjson`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/ld+json' },
      signal: controller.signal,
    });
    if (!res.ok) {
      console.warn(`[EP API] ${res.status} ${res.statusText} for ${path}`);
      return undefined;
    }
    return (await res.json()) as JSONLDResponse;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[EP API] Fetch failed for ${path}: ${msg}`);
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Helper that fetches EP data and returns the first record, or undefined
 * if the request failed or returned no data.
 */
async function fetchFirstRecord(path: string): Promise<Record<string, unknown> | undefined> {
  const response = await fetchEP(path);
  if (!response?.data || response.data.length === 0) return undefined;
  return response.data[0];
}

// ─── Conditional describe ───────────────────────────────────────

const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

// ─── Tests ──────────────────────────────────────────────────────

describeIntegration('Transformer Validation against Real EP API Data', () => {

  // ─── MEP Transformer ─────────────────────────────────────────

  describe('transformMEP with /meps endpoint', () => {
    it('should correctly map all MEP fields from real /meps data', async (ctx) => {
      const record = await retryOrSkip(
        () => fetchFirstRecord('/meps?offset=0&limit=3'),
        'transformMEP /meps'
      );
      if (!record) { ctx.skip(); return; } // skip on network error

      const mep = transformMEP(record);

      // Required fields – always present and correct type
      expect(typeof mep.id).toBe('string');
      expect(mep.id.length).toBeGreaterThan(0);
      expect(mep.id).toMatch(/^person\//); // must be prefixed

      expect(typeof mep.name).toBe('string');
      expect(mep.name.length).toBeGreaterThan(0);
      expect(mep.name).not.toBe('Unknown MEP');

      // /meps endpoint does NOT return country/politicalGroup → expect "Unknown"
      expect(typeof mep.country).toBe('string');
      expect(typeof mep.politicalGroup).toBe('string');

      expect(Array.isArray(mep.committees)).toBe(true);
      expect(typeof mep.active).toBe('boolean');
      expect(typeof mep.termStart).toBe('string');

      // Optional fields must have correct type if present
      if (mep.email !== undefined) {
        expect(typeof mep.email).toBe('string');
      }
      if (mep.termEnd !== undefined) {
        expect(typeof mep.termEnd).toBe('string');
      }
    }, TEST_TIMEOUT_MS);
  });

  describe('transformMEP with /meps/show-current endpoint', () => {
    it('should map country and politicalGroup from show-current', async (ctx) => {
      const record = await retryOrSkip(
        () => fetchFirstRecord('/meps/show-current?offset=0&limit=3'),
        'transformMEP /meps/show-current'
      );
      if (!record) { ctx.skip(); return; }

      const mep = transformMEP(record);

      expect(typeof mep.id).toBe('string');
      expect(mep.id).toMatch(/^person\//);

      expect(typeof mep.name).toBe('string');
      expect(mep.name.length).toBeGreaterThan(0);

      // show-current endpoint MUST have country and politicalGroup
      expect(typeof mep.country).toBe('string');
      expect(mep.country).not.toBe('Unknown');
      expect(mep.country).toMatch(/^[A-Z]{2}$/);

      expect(typeof mep.politicalGroup).toBe('string');
      expect(mep.politicalGroup).not.toBe('Unknown');
      expect(mep.politicalGroup.length).toBeGreaterThan(0);
    }, TEST_TIMEOUT_MS);

    it('should correctly map all current MEP records', async (ctx) => {
      const response = await retryOrSkip(
        () => fetchEP('/meps/show-current?offset=0&limit=10'),
        'transformMEP batch show-current'
      );
      if (!response?.data) { ctx.skip(); return; }

      const meps = response.data.map(d => transformMEP(d));
      expect(meps.length).toBeGreaterThan(0);

      for (const mep of meps) {
        expect(typeof mep.id).toBe('string');
        expect(typeof mep.name).toBe('string');
        expect(typeof mep.country).toBe('string');
        expect(typeof mep.politicalGroup).toBe('string');
        expect(Array.isArray(mep.committees)).toBe(true);
        expect(typeof mep.active).toBe('boolean');
        expect(typeof mep.termStart).toBe('string');
      }
    }, TEST_TIMEOUT_MS);
  });

  // ─── MEP Details Transformer ──────────────────────────────────

  describe('transformMEPDetails with /meps/{id} endpoint', () => {
    it('should correctly map MEP details from a real record', async (ctx) => {
      const record = await retryOrSkip(
        () => fetchFirstRecord('/meps/124936'),
        'transformMEPDetails'
      );
      if (!record) { ctx.skip(); return; }

      const details = transformMEPDetails(record);

      // Base MEP fields
      expect(typeof details.id).toBe('string');
      expect(details.id).toMatch(/^person\//);
      expect(typeof details.name).toBe('string');
      expect(details.name.length).toBeGreaterThan(0);
      expect(typeof details.country).toBe('string');
      expect(typeof details.politicalGroup).toBe('string');
      expect(Array.isArray(details.committees)).toBe(true);
      expect(typeof details.active).toBe('boolean');
      expect(typeof details.termStart).toBe('string');

      // Extended fields
      expect(typeof details.biography).toBe('string');
      expect(details.biography!.length).toBeGreaterThan(0);

      // Voting statistics structure
      expect(details.votingStatistics).toBeDefined();
      expect(typeof details.votingStatistics!.totalVotes).toBe('number');
      expect(typeof details.votingStatistics!.votesFor).toBe('number');
      expect(typeof details.votingStatistics!.votesAgainst).toBe('number');
      expect(typeof details.votingStatistics!.abstentions).toBe('number');
      expect(typeof details.votingStatistics!.attendanceRate).toBe('number');

      // Committees extracted from memberships
      expect(details.committees.length).toBeGreaterThan(0);
    }, TEST_TIMEOUT_MS);
  });

  // ─── Plenary Session Transformer ──────────────────────────────

  describe('transformPlenarySession with /meetings endpoint', () => {
    it('should correctly map plenary session fields', async (ctx) => {
      const record = await retryOrSkip(
        () => fetchFirstRecord('/meetings?year=2025&offset=0&limit=3'),
        'transformPlenarySession'
      );
      if (!record) { ctx.skip(); return; }

      const session = transformPlenarySession(record);

      expect(typeof session.id).toBe('string');
      expect(session.id.length).toBeGreaterThan(0);

      expect(typeof session.date).toBe('string');
      // Date should be ISO format if non-empty
      if (session.date.length > 0) {
        expect(session.date).toMatch(/^\d{4}-\d{2}-\d{2}/);
      }

      expect(typeof session.location).toBe('string');

      expect(Array.isArray(session.agendaItems)).toBe(true);
      expect(typeof session.attendanceCount).toBe('number');
      expect(session.attendanceCount).toBeGreaterThanOrEqual(0);

      expect(Array.isArray(session.documents)).toBe(true);
    }, TEST_TIMEOUT_MS);

    it('should map multiple plenary sessions consistently', async (ctx) => {
      const response = await retryOrSkip(
        () => fetchEP('/meetings?year=2025&offset=0&limit=5'),
        'transformPlenarySession batch'
      );
      if (!response?.data) { ctx.skip(); return; }

      const sessions = response.data.map(d => transformPlenarySession(d));
      expect(sessions.length).toBeGreaterThan(0);

      for (const session of sessions) {
        expect(typeof session.id).toBe('string');
        expect(typeof session.date).toBe('string');
        expect(typeof session.location).toBe('string');
        expect(Array.isArray(session.agendaItems)).toBe(true);
        expect(typeof session.attendanceCount).toBe('number');
        expect(Array.isArray(session.documents)).toBe(true);
      }
    }, TEST_TIMEOUT_MS);
  });

  // ─── Corporate Body (Committee) Transformer ───────────────────

  describe('transformCorporateBody with /corporate-bodies endpoint', () => {
    it('should correctly map committee fields', async (ctx) => {
      const record = await retryOrSkip(
        () => fetchFirstRecord('/corporate-bodies?offset=0&limit=3'),
        'transformCorporateBody list'
      );
      if (!record) { ctx.skip(); return; }

      const committee = transformCorporateBody(record);

      expect(typeof committee.id).toBe('string');
      expect(committee.id.length).toBeGreaterThan(0);

      expect(typeof committee.name).toBe('string');
      expect(committee.name.length).toBeGreaterThan(0);

      expect(typeof committee.abbreviation).toBe('string');
      expect(committee.abbreviation.length).toBeGreaterThan(0);

      expect(Array.isArray(committee.members)).toBe(true);
      expect(typeof committee.chair).toBe('string');
      expect(Array.isArray(committee.viceChairs)).toBe(true);
      expect(Array.isArray(committee.responsibilities)).toBe(true);
    }, TEST_TIMEOUT_MS);

    it('should map detailed committee with members', async (ctx) => {
      const record = await retryOrSkip(
        () => fetchFirstRecord('/corporate-bodies/1'),
        'transformCorporateBody detail'
      );
      if (!record) { ctx.skip(); return; }

      const committee = transformCorporateBody(record);

      expect(typeof committee.id).toBe('string');
      expect(typeof committee.name).toBe('string');
      expect(typeof committee.abbreviation).toBe('string');
      expect(Array.isArray(committee.members)).toBe(true);
      expect(typeof committee.chair).toBe('string');
      expect(Array.isArray(committee.viceChairs)).toBe(true);
      expect(Array.isArray(committee.responsibilities)).toBe(true);
    }, TEST_TIMEOUT_MS);
  });

  // ─── Document Transformer ─────────────────────────────────────

  describe('transformDocument with /documents endpoint', () => {
    it('should correctly map document fields', async (ctx) => {
      const record = await retryOrSkip(
        () => fetchFirstRecord('/documents?year=2025&offset=0&limit=3'),
        'transformDocument'
      );
      if (!record) { ctx.skip(); return; }

      const doc = transformDocument(record);

      expect(typeof doc.id).toBe('string');
      expect(doc.id.length).toBeGreaterThan(0);

      expect(typeof doc.title).toBe('string');
      expect(doc.title.length).toBeGreaterThan(0);

      expect(typeof doc.type).toBe('string');
      expect(['REPORT', 'RESOLUTION', 'DECISION', 'DIRECTIVE', 'REGULATION', 'OPINION', 'AMENDMENT']).toContain(doc.type);

      expect(typeof doc.date).toBe('string');

      expect(Array.isArray(doc.authors)).toBe(true);

      expect(typeof doc.status).toBe('string');
      expect(['DRAFT', 'SUBMITTED', 'IN_COMMITTEE', 'PLENARY', 'ADOPTED', 'REJECTED']).toContain(doc.status);

      expect(typeof doc.summary).toBe('string');

      if (doc.committee !== undefined) {
        expect(typeof doc.committee).toBe('string');
      }
    }, TEST_TIMEOUT_MS);
  });

  // ─── Parliamentary Question Transformer ───────────────────────

  describe('transformParliamentaryQuestion with /parliamentary-questions endpoint', () => {
    it('should correctly map question fields', async (ctx) => {
      const record = await retryOrSkip(
        () => fetchFirstRecord('/parliamentary-questions?year=2025&offset=0&limit=3'),
        'transformParliamentaryQuestion'
      );
      if (!record) { ctx.skip(); return; }

      const question = transformParliamentaryQuestion(record);

      expect(typeof question.id).toBe('string');
      expect(question.id.length).toBeGreaterThan(0);

      expect(typeof question.type).toBe('string');
      expect(['WRITTEN', 'ORAL']).toContain(question.type);

      expect(typeof question.author).toBe('string');

      expect(typeof question.date).toBe('string');

      expect(typeof question.topic).toBe('string');
      expect(question.topic.length).toBeGreaterThan(0);

      expect(typeof question.questionText).toBe('string');

      expect(typeof question.status).toBe('string');
      expect(['PENDING', 'ANSWERED']).toContain(question.status);

      if (question.answerText !== undefined) {
        expect(typeof question.answerText).toBe('string');
      }
      if (question.answerDate !== undefined) {
        expect(typeof question.answerDate).toBe('string');
      }
    }, TEST_TIMEOUT_MS);
  });

  // ─── Speech Transformer ───────────────────────────────────────

  describe('transformSpeech with /speeches endpoint', () => {
    it('should correctly map speech fields', async (ctx) => {
      const record = await retryOrSkip(
        () => fetchFirstRecord('/speeches?year=2025&offset=0&limit=3'),
        'transformSpeech'
      );
      if (!record) { ctx.skip(); return; }

      const speech = transformSpeech(record);

      expect(typeof speech.id).toBe('string');
      expect(speech.id.length).toBeGreaterThan(0);

      expect(typeof speech.title).toBe('string');

      expect(typeof speech.speakerId).toBe('string');
      expect(typeof speech.speakerName).toBe('string');

      expect(typeof speech.date).toBe('string');
      if (speech.date.length > 0) {
        expect(speech.date).toMatch(/^\d{4}-\d{2}-\d{2}/);
      }

      expect(typeof speech.type).toBe('string');

      expect(typeof speech.language).toBe('string');

      expect(typeof speech.text).toBe('string');
      expect(typeof speech.sessionReference).toBe('string');
    }, TEST_TIMEOUT_MS);

    it('should map multiple speeches consistently', async (ctx) => {
      const response = await retryOrSkip(
        () => fetchEP('/speeches?year=2025&offset=0&limit=5'),
        'transformSpeech batch'
      );
      if (!response?.data) { ctx.skip(); return; }

      const speeches = response.data.map(d => transformSpeech(d));
      expect(speeches.length).toBeGreaterThan(0);

      for (const speech of speeches) {
        expect(typeof speech.id).toBe('string');
        expect(typeof speech.title).toBe('string');
        expect(typeof speech.speakerId).toBe('string');
        expect(typeof speech.speakerName).toBe('string');
        expect(typeof speech.date).toBe('string');
        expect(typeof speech.type).toBe('string');
        expect(typeof speech.language).toBe('string');
        expect(typeof speech.text).toBe('string');
        expect(typeof speech.sessionReference).toBe('string');
      }
    }, TEST_TIMEOUT_MS);
  });

  // ─── Procedure Transformer ────────────────────────────────────

  describe('transformProcedure with /procedures endpoint', () => {
    it('should correctly map procedure fields', async (ctx) => {
      const record = await retryOrSkip(
        () => fetchFirstRecord('/procedures?year=2025&offset=0&limit=3'),
        'transformProcedure'
      );
      if (!record) { ctx.skip(); return; }

      const procedure = transformProcedure(record);

      expect(typeof procedure.id).toBe('string');
      expect(procedure.id.length).toBeGreaterThan(0);

      expect(typeof procedure.title).toBe('string');

      expect(typeof procedure.reference).toBe('string');
      expect(procedure.reference.length).toBeGreaterThan(0);

      expect(typeof procedure.type).toBe('string');

      expect(typeof procedure.subjectMatter).toBe('string');
      expect(typeof procedure.stage).toBe('string');
      expect(typeof procedure.status).toBe('string');
      expect(typeof procedure.dateInitiated).toBe('string');
      expect(typeof procedure.dateLastActivity).toBe('string');
      expect(typeof procedure.responsibleCommittee).toBe('string');
      expect(typeof procedure.rapporteur).toBe('string');
      expect(Array.isArray(procedure.documents)).toBe(true);
    }, TEST_TIMEOUT_MS);
  });

  // ─── Adopted Text Transformer ─────────────────────────────────

  describe('transformAdoptedText with /adopted-texts endpoint', () => {
    it('should correctly map adopted text fields', async (ctx) => {
      const record = await retryOrSkip(
        () => fetchFirstRecord('/adopted-texts?year=2025&offset=0&limit=3'),
        'transformAdoptedText'
      );
      if (!record) { ctx.skip(); return; }

      const adopted = transformAdoptedText(record);

      expect(typeof adopted.id).toBe('string');
      expect(adopted.id.length).toBeGreaterThan(0);

      expect(typeof adopted.title).toBe('string');

      expect(typeof adopted.reference).toBe('string');

      expect(typeof adopted.type).toBe('string');

      expect(typeof adopted.dateAdopted).toBe('string');
      if (adopted.dateAdopted.length > 0) {
        expect(adopted.dateAdopted).toMatch(/^\d{4}-\d{2}-\d{2}/);
      }

      expect(typeof adopted.procedureReference).toBe('string');
      expect(typeof adopted.subjectMatter).toBe('string');
    }, TEST_TIMEOUT_MS);

    it('should map multiple adopted texts consistently', async (ctx) => {
      const response = await retryOrSkip(
        () => fetchEP('/adopted-texts?year=2025&offset=0&limit=5'),
        'transformAdoptedText batch'
      );
      if (!response?.data) { ctx.skip(); return; }

      const texts = response.data.map(d => transformAdoptedText(d));
      expect(texts.length).toBeGreaterThan(0);

      for (const text of texts) {
        expect(typeof text.id).toBe('string');
        expect(typeof text.title).toBe('string');
        expect(typeof text.reference).toBe('string');
        expect(typeof text.type).toBe('string');
        expect(typeof text.dateAdopted).toBe('string');
        expect(typeof text.procedureReference).toBe('string');
        expect(typeof text.subjectMatter).toBe('string');
      }
    }, TEST_TIMEOUT_MS);
  });

  // ─── Event Transformer ────────────────────────────────────────

  describe('transformEvent with /events endpoint', () => {
    it('should correctly map event fields', async (ctx) => {
      const record = await retryOrSkip(
        () => fetchFirstRecord('/events?year=2025&offset=0&limit=3'),
        'transformEvent'
      );
      if (!record) { ctx.skip(); return; }

      const event = transformEvent(record);

      expect(typeof event.id).toBe('string');
      expect(event.id.length).toBeGreaterThan(0);

      expect(typeof event.title).toBe('string');

      expect(typeof event.date).toBe('string');

      expect(typeof event.endDate).toBe('string');

      expect(typeof event.type).toBe('string');

      expect(typeof event.location).toBe('string');
      expect(typeof event.organizer).toBe('string');
      expect(typeof event.status).toBe('string');
    }, TEST_TIMEOUT_MS);
  });

  // ─── MEP Declaration Transformer ──────────────────────────────

  describe('transformMEPDeclaration with /meps-declarations endpoint', () => {
    it('should correctly map declaration fields', async (ctx) => {
      const record = await retryOrSkip(
        () => fetchFirstRecord('/meps-declarations?year=2025&offset=0&limit=3'),
        'transformMEPDeclaration'
      );
      if (!record) { ctx.skip(); return; }

      const declaration = transformMEPDeclaration(record);

      expect(typeof declaration.id).toBe('string');
      expect(declaration.id.length).toBeGreaterThan(0);

      expect(typeof declaration.title).toBe('string');

      expect(typeof declaration.mepId).toBe('string');
      expect(typeof declaration.mepName).toBe('string');

      expect(typeof declaration.type).toBe('string');

      expect(typeof declaration.dateFiled).toBe('string');
      if (declaration.dateFiled.length > 0) {
        expect(declaration.dateFiled).toMatch(/^\d{4}-\d{2}-\d{2}/);
      }

      expect(typeof declaration.status).toBe('string');
    }, TEST_TIMEOUT_MS);
  });

  // ─── MEP Incoming/Outgoing/Homonyms ───────────────────────────

  describe('transformMEP with /meps/show-incoming endpoint', () => {
    it('should map incoming MEPs (basic fields only)', async (ctx) => {
      const record = await retryOrSkip(
        () => fetchFirstRecord('/meps/show-incoming?offset=0&limit=3'),
        'transformMEP /meps/show-incoming'
      );
      if (!record) { ctx.skip(); return; }

      const mep = transformMEP(record);

      expect(typeof mep.id).toBe('string');
      expect(mep.id).toMatch(/^person\//);
      expect(typeof mep.name).toBe('string');
      // incoming endpoint has basic data only
      expect(typeof mep.country).toBe('string');
      expect(typeof mep.politicalGroup).toBe('string');
      expect(typeof mep.active).toBe('boolean');
    }, TEST_TIMEOUT_MS);
  });

  describe('transformMEP with /meps/show-outgoing endpoint', () => {
    it('should map outgoing MEPs (basic fields only)', async (ctx) => {
      const record = await retryOrSkip(
        () => fetchFirstRecord('/meps/show-outgoing?offset=0&limit=3'),
        'transformMEP /meps/show-outgoing'
      );
      if (!record) { ctx.skip(); return; }

      const mep = transformMEP(record);

      expect(typeof mep.id).toBe('string');
      expect(mep.id).toMatch(/^person\//);
      expect(typeof mep.name).toBe('string');
      expect(typeof mep.country).toBe('string');
      expect(typeof mep.politicalGroup).toBe('string');
      expect(typeof mep.active).toBe('boolean');
    }, TEST_TIMEOUT_MS);
  });

  describe('transformMEP with /meps/show-homonyms endpoint', () => {
    it('should map homonym MEPs (basic fields only)', async (ctx) => {
      const record = await retryOrSkip(
        () => fetchFirstRecord('/meps/show-homonyms?offset=0&limit=3'),
        'transformMEP /meps/show-homonyms'
      );
      if (!record) { ctx.skip(); return; }

      const mep = transformMEP(record);

      expect(typeof mep.id).toBe('string');
      expect(mep.id).toMatch(/^person\//);
      expect(typeof mep.name).toBe('string');
      expect(typeof mep.country).toBe('string');
      expect(typeof mep.politicalGroup).toBe('string');
      expect(typeof mep.active).toBe('boolean');
    }, TEST_TIMEOUT_MS);
  });

  // ─── Cross-Transformer Consistency ────────────────────────────

  describe('Cross-transformer consistency', () => {
    it('transformMEP and transformMEPDetails should agree on shared fields', async (ctx) => {
      const record = await retryOrSkip(
        () => fetchFirstRecord('/meps/124936'),
        'cross-transformer MEP consistency'
      );
      if (!record) { ctx.skip(); return; }

      const mep = transformMEP(record);
      const details = transformMEPDetails(record);

      // Shared fields must be identical
      expect(details.id).toBe(mep.id);
      expect(details.name).toBe(mep.name);
      expect(details.active).toBe(mep.active);
      expect(details.termStart).toBe(mep.termStart);
    }, TEST_TIMEOUT_MS);
  });

  // ─── Type Safety Assertions ───────────────────────────────────

  describe('Type safety: no undefined required fields', () => {
    it('MEP transformer should never produce undefined required fields', async (ctx) => {
      const response = await retryOrSkip(
        () => fetchEP('/meps/show-current?offset=0&limit=20'),
        'type safety MEP'
      );
      if (!response?.data) { ctx.skip(); return; }

      for (const raw of response.data) {
        const mep = transformMEP(raw);

        // Every required field must be defined and of correct type
        expect(mep.id).toBeDefined();
        expect(mep.name).toBeDefined();
        expect(mep.country).toBeDefined();
        expect(mep.politicalGroup).toBeDefined();
        expect(mep.committees).toBeDefined();
        expect(mep.active).toBeDefined();
        expect(mep.termStart).toBeDefined();

        // None should be null
        expect(mep.id).not.toBeNull();
        expect(mep.name).not.toBeNull();
        expect(mep.country).not.toBeNull();
        expect(mep.politicalGroup).not.toBeNull();
        expect(mep.committees).not.toBeNull();
        expect(mep.active).not.toBeNull();
        expect(mep.termStart).not.toBeNull();
      }
    }, TEST_TIMEOUT_MS);

    it('Plenary session transformer should never produce undefined required fields', async (ctx) => {
      const response = await retryOrSkip(
        () => fetchEP('/meetings?year=2025&offset=0&limit=10'),
        'type safety PlenarySession'
      );
      if (!response?.data) { ctx.skip(); return; }

      for (const raw of response.data) {
        const session = transformPlenarySession(raw);

        expect(session.id).toBeDefined();
        expect(session.date).toBeDefined();
        expect(session.location).toBeDefined();
        expect(session.agendaItems).toBeDefined();
        expect(session.attendanceCount).toBeDefined();
        expect(session.documents).toBeDefined();

        expect(session.id).not.toBeNull();
        expect(session.date).not.toBeNull();
        expect(session.location).not.toBeNull();
        expect(session.agendaItems).not.toBeNull();
        expect(session.attendanceCount).not.toBeNull();
        expect(session.documents).not.toBeNull();
      }
    }, TEST_TIMEOUT_MS);

    it('Document transformer should never produce undefined required fields', async (ctx) => {
      const response = await retryOrSkip(
        () => fetchEP('/documents?year=2025&offset=0&limit=10'),
        'type safety Document'
      );
      if (!response?.data) { ctx.skip(); return; }

      for (const raw of response.data) {
        const doc = transformDocument(raw);

        expect(doc.id).toBeDefined();
        expect(doc.title).toBeDefined();
        expect(doc.type).toBeDefined();
        expect(doc.date).toBeDefined();
        expect(doc.authors).toBeDefined();
        expect(doc.status).toBeDefined();
        expect(doc.summary).toBeDefined();
      }
    }, TEST_TIMEOUT_MS);

    it('Procedure transformer should never produce undefined required fields', async (ctx) => {
      const response = await retryOrSkip(
        () => fetchEP('/procedures?year=2025&offset=0&limit=10'),
        'type safety Procedure'
      );
      if (!response?.data) { ctx.skip(); return; }

      for (const raw of response.data) {
        const proc = transformProcedure(raw);

        expect(proc.id).toBeDefined();
        expect(proc.title).toBeDefined();
        expect(proc.reference).toBeDefined();
        expect(proc.type).toBeDefined();
        expect(proc.subjectMatter).toBeDefined();
        expect(proc.stage).toBeDefined();
        expect(proc.status).toBeDefined();
        expect(proc.dateInitiated).toBeDefined();
        expect(proc.dateLastActivity).toBeDefined();
        expect(proc.responsibleCommittee).toBeDefined();
        expect(proc.rapporteur).toBeDefined();
        expect(proc.documents).toBeDefined();
      }
    }, TEST_TIMEOUT_MS);

    it('Adopted text transformer should never produce undefined required fields', async (ctx) => {
      const response = await retryOrSkip(
        () => fetchEP('/adopted-texts?year=2025&offset=0&limit=10'),
        'type safety AdoptedText'
      );
      if (!response?.data) { ctx.skip(); return; }

      for (const raw of response.data) {
        const text = transformAdoptedText(raw);

        expect(text.id).toBeDefined();
        expect(text.title).toBeDefined();
        expect(text.reference).toBeDefined();
        expect(text.type).toBeDefined();
        expect(text.dateAdopted).toBeDefined();
        expect(text.procedureReference).toBeDefined();
        expect(text.subjectMatter).toBeDefined();
      }
    }, TEST_TIMEOUT_MS);
  });
});
