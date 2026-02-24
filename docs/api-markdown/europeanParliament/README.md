[**European Parliament MCP Server API v0.7.2**](../README.md)

***

[European Parliament MCP Server API](../modules.md) / europeanParliament

# europeanParliament

Type definitions for European Parliament data structures.

Barrel re-export from domain-specific modules organized by bounded context.
Each sub-module contains well-documented, strictly-typed interfaces for
a single EP data domain.

**Sub-modules:**
- module:types/ep/mep – MEP profiles and voting statistics
- module:types/ep/plenary – Plenary sessions and voting records
- module:types/ep/committee – Committee information
- module:types/ep/document – Legislative documents, types, and statuses
- module:types/ep/question – Parliamentary questions
- module:types/ep/common – Shared pagination types
- module:types/ep/activities – Speeches, procedures, events, declarations

## See

https://data.europarl.europa.eu/api/v2/

## References

### AdoptedText

Re-exports [AdoptedText](../types/ep/activities/interfaces/AdoptedText.md)

***

### Committee

Re-exports [Committee](../types/ep/committee/interfaces/Committee.md)

***

### DocumentStatus

Re-exports [DocumentStatus](../types/ep/document/type-aliases/DocumentStatus.md)

***

### DocumentType

Re-exports [DocumentType](../types/ep/document/type-aliases/DocumentType.md)

***

### EPEvent

Re-exports [EPEvent](../types/ep/activities/interfaces/EPEvent.md)

***

### LegislativeDocument

Re-exports [LegislativeDocument](../types/ep/document/interfaces/LegislativeDocument.md)

***

### MeetingActivity

Re-exports [MeetingActivity](../types/ep/activities/interfaces/MeetingActivity.md)

***

### MEP

Re-exports [MEP](../types/ep/mep/interfaces/MEP.md)

***

### MEPDeclaration

Re-exports [MEPDeclaration](../types/ep/activities/interfaces/MEPDeclaration.md)

***

### MEPDetails

Re-exports [MEPDetails](../types/ep/mep/interfaces/MEPDetails.md)

***

### PaginatedResponse

Re-exports [PaginatedResponse](../types/ep/common/interfaces/PaginatedResponse.md)

***

### ParliamentaryQuestion

Re-exports [ParliamentaryQuestion](../types/ep/question/interfaces/ParliamentaryQuestion.md)

***

### PlenarySession

Re-exports [PlenarySession](../types/ep/plenary/interfaces/PlenarySession.md)

***

### Procedure

Re-exports [Procedure](../types/ep/activities/interfaces/Procedure.md)

***

### Speech

Re-exports [Speech](../types/ep/activities/interfaces/Speech.md)

***

### VotingRecord

Re-exports [VotingRecord](../types/ep/plenary/interfaces/VotingRecord.md)

***

### VotingStatistics

Re-exports [VotingStatistics](../types/ep/mep/interfaces/VotingStatistics.md)
