/**
 * European Parliament API client internal modules.
 *
 * - **jsonLdHelpers** – pure JSON-LD parsing and extraction functions
 * - **transformers** – pure data transformation functions (API → domain types)
 *
 * @module clients/ep
 */

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
