[**European Parliament MCP Server API v1.1.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/trackLegislation/types](../README.md) / LegislativeProcedure

# Interface: LegislativeProcedure

Defined in: [tools/trackLegislation/types.ts:10](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/trackLegislation/types.ts#L10)

Legislative procedure tracking result

## Properties

### amendments

> **amendments**: [`AmendmentStats`](AmendmentStats.md)

Defined in: [tools/trackLegislation/types.ts:26](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/trackLegislation/types.ts#L26)

Amendment statistics

***

### committees

> **committees**: [`CommitteeAssignment`](CommitteeAssignment.md)[]

Defined in: [tools/trackLegislation/types.ts:24](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/trackLegislation/types.ts#L24)

Committee assignments

***

### confidenceLevel

> **confidenceLevel**: `string`

Defined in: [tools/trackLegislation/types.ts:34](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/trackLegislation/types.ts#L34)

Data quality indicator

***

### currentStage

> **currentStage**: `string`

Defined in: [tools/trackLegislation/types.ts:20](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/trackLegislation/types.ts#L20)

Current stage description

***

### documents

> **documents**: [`DocumentReference`](DocumentReference.md)[]

Defined in: [tools/trackLegislation/types.ts:30](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/trackLegislation/types.ts#L30)

Associated documents

***

### methodology

> **methodology**: `string`

Defined in: [tools/trackLegislation/types.ts:36](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/trackLegislation/types.ts#L36)

Methodology and data source description

***

### procedureId

> **procedureId**: `string`

Defined in: [tools/trackLegislation/types.ts:12](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/trackLegislation/types.ts#L12)

Procedure identifier from EP API

***

### status

> **status**: `string`

Defined in: [tools/trackLegislation/types.ts:18](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/trackLegislation/types.ts#L18)

Current status

***

### timeline

> **timeline**: [`TimelineEvent`](TimelineEvent.md)[]

Defined in: [tools/trackLegislation/types.ts:22](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/trackLegislation/types.ts#L22)

Timeline of key events

***

### title

> **title**: `string`

Defined in: [tools/trackLegislation/types.ts:14](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/trackLegislation/types.ts#L14)

Procedure title from EP API

***

### type

> **type**: `string`

Defined in: [tools/trackLegislation/types.ts:16](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/trackLegislation/types.ts#L16)

Procedure type (e.g., COD, NLE)

***

### voting

> **voting**: [`VotingRecord`](VotingRecord.md)[]

Defined in: [tools/trackLegislation/types.ts:28](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/trackLegislation/types.ts#L28)

Voting records

***

### nextSteps?

> `optional` **nextSteps**: `string`[]

Defined in: [tools/trackLegislation/types.ts:32](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/trackLegislation/types.ts#L32)

Predicted next steps
