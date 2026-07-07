[**European Parliament MCP Server API v1.3.37**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/effectivenessAggregator](../README.md) / AggregatorInputs

# Interface: AggregatorInputs

Defined in: [utils/effectivenessAggregator.ts:249](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L249)

Inputs to [aggregateLegislativeEffectiveness](../functions/aggregateLegislativeEffectiveness.md).

## Properties

### adoptedTexts

> **adoptedTexts**: readonly [`AdoptedText`](../../../types/ep/activities/interfaces/AdoptedText.md)[]

Defined in: [utils/effectivenessAggregator.ts:271](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L271)

Adopted texts fetched from `/adopted-texts`.

***

### dateFrom

> **dateFrom**: `string`

Defined in: [utils/effectivenessAggregator.ts:265](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L265)

Inclusive ISO-date window for filtering procedures, documents, and questions.

***

### dateTo

> **dateTo**: `string`

Defined in: [utils/effectivenessAggregator.ts:267](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L267)

Inclusive ISO-date window upper bound.

***

### plenaryDocumentItems

> **plenaryDocumentItems**: readonly [`LegislativeDocument`](../../../types/ep/document/interfaces/LegislativeDocument.md)[]

Defined in: [utils/effectivenessAggregator.ts:273](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L273)

Plenary-session document items fetched from `/plenary-session-documents-items`.

***

### procedures

> **procedures**: readonly [`Procedure`](../../../types/ep/activities/interfaces/Procedure.md)[]

Defined in: [utils/effectivenessAggregator.ts:269](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L269)

Procedures fetched from `/procedures`.

***

### questions

> **questions**: readonly [`ParliamentaryQuestion`](../../../types/ep/question/interfaces/ParliamentaryQuestion.md)[]

Defined in: [utils/effectivenessAggregator.ts:275](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L275)

Parliamentary questions fetched from `/parliamentary-questions`.

***

### subjectId

> **subjectId**: `string`

Defined in: [utils/effectivenessAggregator.ts:251](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L251)

Subject identifier (MEP ID or committee abbreviation).

***

### committeeMemberIds?

> `optional` **committeeMemberIds?**: readonly `string`[]

Defined in: [utils/effectivenessAggregator.ts:263](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L263)

Optional list of committee member MEP IDs. When provided, the aggregator
treats any rapporteur/author hit against a member as a hit for the
committee subject.

***

### subjectName?

> `optional` **subjectName?**: `string`

Defined in: [utils/effectivenessAggregator.ts:257](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L257)

Optional human-readable subject name (e.g. MEP full name). When provided,
enables rapporteur name-based matching against the procedure's `rapporteur`
field (which carries human-readable text like "Jane Andersson").
