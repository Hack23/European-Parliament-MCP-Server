[**European Parliament MCP Server API v0.9.1**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / clients/ep

# clients/ep

European Parliament API client internal modules.

- **baseClient** – shared HTTP, caching, rate limiting, and retry infrastructure
- **mepClient** – MEP-related API calls
- **plenaryClient** – plenary sessions, meetings, and activities
- **votingClient** – voting records and speeches
- **committeeClient** – committee/corporate-body information
- **documentClient** – documents and search
- **legislativeClient** – procedures and adopted texts
- **questionClient** – parliamentary questions
- **vocabularyClient** – controlled vocabularies
- **jsonLdHelpers** – pure JSON-LD parsing and extraction functions
- **transformers** – pure data transformation functions (API → domain types)

## References

### APIError

Re-exports [APIError](baseClient/classes/APIError.md)

***

### BaseEPClient

Re-exports [BaseEPClient](baseClient/classes/BaseEPClient.md)

***

### CommitteeClient

Re-exports [CommitteeClient](committeeClient/classes/CommitteeClient.md)

***

### DEFAULT\_CACHE\_TTL\_MS

Re-exports [DEFAULT_CACHE_TTL_MS](baseClient/variables/DEFAULT_CACHE_TTL_MS.md)

***

### DEFAULT\_EP\_API\_BASE\_URL

Re-exports [DEFAULT_EP_API_BASE_URL](baseClient/variables/DEFAULT_EP_API_BASE_URL.md)

***

### DEFAULT\_MAX\_CACHE\_SIZE

Re-exports [DEFAULT_MAX_CACHE_SIZE](baseClient/variables/DEFAULT_MAX_CACHE_SIZE.md)

***

### DEFAULT\_MAX\_RESPONSE\_BYTES

Re-exports [DEFAULT_MAX_RESPONSE_BYTES](baseClient/variables/DEFAULT_MAX_RESPONSE_BYTES.md)

***

### DEFAULT\_MAX\_RETRIES

Re-exports [DEFAULT_MAX_RETRIES](baseClient/variables/DEFAULT_MAX_RETRIES.md)

***

### DEFAULT\_RATE\_LIMIT\_INTERVAL

Re-exports [DEFAULT_RATE_LIMIT_INTERVAL](baseClient/variables/DEFAULT_RATE_LIMIT_INTERVAL.md)

***

### DEFAULT\_RATE\_LIMIT\_TOKENS

Re-exports [DEFAULT_RATE_LIMIT_TOKENS](baseClient/variables/DEFAULT_RATE_LIMIT_TOKENS.md)

***

### DEFAULT\_REQUEST\_TIMEOUT\_MS

Re-exports [DEFAULT_REQUEST_TIMEOUT_MS](baseClient/variables/DEFAULT_REQUEST_TIMEOUT_MS.md)

***

### DEFAULT\_RETRY\_ENABLED

Re-exports [DEFAULT_RETRY_ENABLED](baseClient/variables/DEFAULT_RETRY_ENABLED.md)

***

### determineVoteOutcome

Re-exports [determineVoteOutcome](jsonLdHelpers/functions/determineVoteOutcome.md)

***

### DocumentClient

Re-exports [DocumentClient](documentClient/classes/DocumentClient.md)

***

### extractActivityDate

Re-exports [extractActivityDate](jsonLdHelpers/functions/extractActivityDate.md)

***

### extractAuthorId

Re-exports [extractAuthorId](jsonLdHelpers/functions/extractAuthorId.md)

***

### extractDateValue

Re-exports [extractDateValue](jsonLdHelpers/functions/extractDateValue.md)

***

### extractDocumentRefs

Re-exports [extractDocumentRefs](jsonLdHelpers/functions/extractDocumentRefs.md)

***

### extractField

Re-exports [extractField](jsonLdHelpers/functions/extractField.md)

***

### extractLocation

Re-exports [extractLocation](jsonLdHelpers/functions/extractLocation.md)

***

### extractMemberIds

Re-exports [extractMemberIds](jsonLdHelpers/functions/extractMemberIds.md)

***

### extractMultilingualText

Re-exports [extractMultilingualText](jsonLdHelpers/functions/extractMultilingualText.md)

***

### extractTextFromLangArray

Re-exports [extractTextFromLangArray](jsonLdHelpers/functions/extractTextFromLangArray.md)

***

### extractVoteCount

Re-exports [extractVoteCount](jsonLdHelpers/functions/extractVoteCount.md)

***

### firstDefined

Re-exports [firstDefined](jsonLdHelpers/functions/firstDefined.md)

***

### LegislativeClient

Re-exports [LegislativeClient](legislativeClient/classes/LegislativeClient.md)

***

### mapDocumentStatus

Re-exports [mapDocumentStatus](jsonLdHelpers/functions/mapDocumentStatus.md)

***

### mapDocumentType

Re-exports [mapDocumentType](jsonLdHelpers/functions/mapDocumentType.md)

***

### mapQuestionType

Re-exports [mapQuestionType](jsonLdHelpers/functions/mapQuestionType.md)

***

### MEPClient

Re-exports [MEPClient](mepClient/classes/MEPClient.md)

***

### PlenaryClient

Re-exports [PlenaryClient](plenaryClient/classes/PlenaryClient.md)

***

### QuestionClient

Re-exports [QuestionClient](questionClient/classes/QuestionClient.md)

***

### toSafeString

Re-exports [toSafeString](jsonLdHelpers/functions/toSafeString.md)

***

### transformAdoptedText

Re-exports [transformAdoptedText](transformers/functions/transformAdoptedText.md)

***

### transformCorporateBody

Re-exports [transformCorporateBody](transformers/functions/transformCorporateBody.md)

***

### transformDocument

Re-exports [transformDocument](transformers/functions/transformDocument.md)

***

### transformEvent

Re-exports [transformEvent](transformers/functions/transformEvent.md)

***

### transformMeetingActivity

Re-exports [transformMeetingActivity](transformers/functions/transformMeetingActivity.md)

***

### transformMEP

Re-exports [transformMEP](transformers/functions/transformMEP.md)

***

### transformMEPDeclaration

Re-exports [transformMEPDeclaration](transformers/functions/transformMEPDeclaration.md)

***

### transformMEPDetails

Re-exports [transformMEPDetails](transformers/functions/transformMEPDetails.md)

***

### transformParliamentaryQuestion

Re-exports [transformParliamentaryQuestion](transformers/functions/transformParliamentaryQuestion.md)

***

### transformPlenarySession

Re-exports [transformPlenarySession](transformers/functions/transformPlenarySession.md)

***

### transformProcedure

Re-exports [transformProcedure](transformers/functions/transformProcedure.md)

***

### transformSpeech

Re-exports [transformSpeech](transformers/functions/transformSpeech.md)

***

### transformVoteResult

Re-exports [transformVoteResult](transformers/functions/transformVoteResult.md)

***

### VocabularyClient

Re-exports [VocabularyClient](vocabularyClient/classes/VocabularyClient.md)

***

### VotingClient

Re-exports [VotingClient](votingClient/classes/VotingClient.md)
