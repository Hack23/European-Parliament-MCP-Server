/**
 * European Parliament API client internal modules.
 *
 * - **baseClient** – shared HTTP, caching, rate limiting, and retry infrastructure
 * - **mepClient** – MEP-related API calls
 * - **plenaryClient** – plenary sessions, meetings, and activities
 * - **votingClient** – voting records and speeches
 * - **committeeClient** – committee/corporate-body information
 * - **documentClient** – documents and search
 * - **legislativeClient** – procedures and adopted texts
 * - **questionClient** – parliamentary questions
 * - **vocabularyClient** – controlled vocabularies
 * - **jsonLdHelpers** – pure JSON-LD parsing and extraction functions
 * - **transformers** – pure data transformation functions (API → domain types)
 *
 * @module clients/ep
 */

// ─── Infrastructure ───────────────────────────────────────────────────────────

export {
  BaseEPClient,
  APIError,
  DEFAULT_EP_API_BASE_URL,
  DEFAULT_REQUEST_TIMEOUT_MS,
  DEFAULT_RETRY_ENABLED,
  DEFAULT_MAX_RETRIES,
  DEFAULT_CACHE_TTL_MS,
  DEFAULT_MAX_CACHE_SIZE,
  DEFAULT_RATE_LIMIT_TOKENS,
  DEFAULT_RATE_LIMIT_INTERVAL,
  DEFAULT_MAX_RESPONSE_BYTES,
} from './baseClient.js';
export type {
  EPClientConfig,
  EPSharedResources,
  JSONLDResponse,
} from './baseClient.js';

// ─── Sub-clients ──────────────────────────────────────────────────────────────

export { MEPClient } from './mepClient.js';
export { PlenaryClient } from './plenaryClient.js';
export { VotingClient } from './votingClient.js';
export { CommitteeClient } from './committeeClient.js';
export { DocumentClient } from './documentClient.js';
export { LegislativeClient } from './legislativeClient.js';
export { QuestionClient } from './questionClient.js';
export { VocabularyClient } from './vocabularyClient.js';

// ─── JSON-LD helpers (pure, re-exported for consumers) ───────────────────────

export {
  toSafeString,
  firstDefined,
  extractField,
  extractDateValue,
  extractActivityDate,
  extractMultilingualText,
  extractTextFromLangArray,
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

// ─── Transformers (pure, re-exported for consumers) ──────────────────────────

export {
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
