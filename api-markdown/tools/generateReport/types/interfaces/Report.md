[**European Parliament MCP Server API v0.7.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/generateReport/types](../README.md) / Report

# Interface: Report

Defined in: [tools/generateReport/types.ts:10](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/generateReport/types.ts#L10)

Report structure

## Properties

### generatedAt

> **generatedAt**: `string`

Defined in: [tools/generateReport/types.ts:17](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/generateReport/types.ts#L17)

***

### period

> **period**: `object`

Defined in: [tools/generateReport/types.ts:13](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/generateReport/types.ts#L13)

#### from

> **from**: `string`

#### to

> **to**: `string`

***

### reportType

> **reportType**: `string`

Defined in: [tools/generateReport/types.ts:11](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/generateReport/types.ts#L11)

***

### sections

> **sections**: [`ReportSection`](ReportSection.md)[]

Defined in: [tools/generateReport/types.ts:19](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/generateReport/types.ts#L19)

***

### statistics

> **statistics**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `number` \| `string`\>

Defined in: [tools/generateReport/types.ts:20](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/generateReport/types.ts#L20)

***

### subject

> **subject**: `string`

Defined in: [tools/generateReport/types.ts:12](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/generateReport/types.ts#L12)

***

### summary

> **summary**: `string`

Defined in: [tools/generateReport/types.ts:18](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/generateReport/types.ts#L18)

***

### recommendations?

> `optional` **recommendations**: `string`[]

Defined in: [tools/generateReport/types.ts:21](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/generateReport/types.ts#L21)
