[**European Parliament MCP Server API v0.7.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/trackLegislation/types](../README.md) / LegislativeProcedure

# Interface: LegislativeProcedure

Defined in: [tools/trackLegislation/types.ts:10](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/trackLegislation/types.ts#L10)

Legislative procedure status

## Properties

### amendments

> **amendments**: [`AmendmentStats`](AmendmentStats.md)

Defined in: [tools/trackLegislation/types.ts:18](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/trackLegislation/types.ts#L18)

***

### committees

> **committees**: [`CommitteeAssignment`](CommitteeAssignment.md)[]

Defined in: [tools/trackLegislation/types.ts:17](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/trackLegislation/types.ts#L17)

***

### confidenceLevel

> **confidenceLevel**: `string`

Defined in: [tools/trackLegislation/types.ts:22](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/trackLegislation/types.ts#L22)

***

### currentStage

> **currentStage**: `string`

Defined in: [tools/trackLegislation/types.ts:15](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/trackLegislation/types.ts#L15)

***

### documents

> **documents**: [`DocumentReference`](DocumentReference.md)[]

Defined in: [tools/trackLegislation/types.ts:20](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/trackLegislation/types.ts#L20)

***

### methodology

> **methodology**: `string`

Defined in: [tools/trackLegislation/types.ts:23](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/trackLegislation/types.ts#L23)

***

### procedureId

> **procedureId**: `string`

Defined in: [tools/trackLegislation/types.ts:11](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/trackLegislation/types.ts#L11)

***

### status

> **status**: `"ADOPTED"` \| `"REJECTED"` \| `"DRAFT"` \| `"PLENARY"` \| `"COMMITTEE"`

Defined in: [tools/trackLegislation/types.ts:14](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/trackLegislation/types.ts#L14)

***

### timeline

> **timeline**: [`TimelineEvent`](TimelineEvent.md)[]

Defined in: [tools/trackLegislation/types.ts:16](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/trackLegislation/types.ts#L16)

***

### title

> **title**: `string`

Defined in: [tools/trackLegislation/types.ts:12](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/trackLegislation/types.ts#L12)

***

### type

> **type**: `string`

Defined in: [tools/trackLegislation/types.ts:13](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/trackLegislation/types.ts#L13)

***

### voting

> **voting**: [`VotingRecord`](VotingRecord.md)[]

Defined in: [tools/trackLegislation/types.ts:19](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/trackLegislation/types.ts#L19)

***

### nextSteps?

> `optional` **nextSteps**: `string`[]

Defined in: [tools/trackLegislation/types.ts:21](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/trackLegislation/types.ts#L21)
