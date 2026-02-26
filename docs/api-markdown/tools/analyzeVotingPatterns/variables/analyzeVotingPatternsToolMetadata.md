[**European Parliament MCP Server API v0.8.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/analyzeVotingPatterns](../README.md) / analyzeVotingPatternsToolMetadata

# Variable: analyzeVotingPatternsToolMetadata

> `const` **analyzeVotingPatternsToolMetadata**: `object`

Defined in: [tools/analyzeVotingPatterns.ts:171](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/tools/analyzeVotingPatterns.ts#L171)

Tool metadata for MCP registration

## Type Declaration

### description

> **description**: `string` = `'Analyze MEP voting behavior including voting alignment with political group, cross-party voting patterns, attendance rates, and topic-based voting analysis. Returns comprehensive voting statistics and patterns over a specified time period.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.compareWithGroup

> **compareWithGroup**: `object`

#### inputSchema.properties.compareWithGroup.default

> **default**: `boolean` = `true`

#### inputSchema.properties.compareWithGroup.description

> **description**: `string` = `'Compare MEP voting with political group average'`

#### inputSchema.properties.compareWithGroup.type

> **type**: `string` = `'boolean'`

#### inputSchema.properties.dateFrom

> **dateFrom**: `object`

#### inputSchema.properties.dateFrom.description

> **description**: `string` = `'Analysis start date (YYYY-MM-DD format)'`

#### inputSchema.properties.dateFrom.pattern

> **pattern**: `string` = `'^\\d{4}-\\d{2}-\\d{2}$'`

#### inputSchema.properties.dateFrom.type

> **type**: `string` = `'string'`

#### inputSchema.properties.dateTo

> **dateTo**: `object`

#### inputSchema.properties.dateTo.description

> **description**: `string` = `'Analysis end date (YYYY-MM-DD format)'`

#### inputSchema.properties.dateTo.pattern

> **pattern**: `string` = `'^\\d{4}-\\d{2}-\\d{2}$'`

#### inputSchema.properties.dateTo.type

> **type**: `string` = `'string'`

#### inputSchema.properties.mepId

> **mepId**: `object`

#### inputSchema.properties.mepId.description

> **description**: `string` = `'MEP identifier'`

#### inputSchema.properties.mepId.maxLength

> **maxLength**: `number` = `100`

#### inputSchema.properties.mepId.minLength

> **minLength**: `number` = `1`

#### inputSchema.properties.mepId.type

> **type**: `string` = `'string'`

#### inputSchema.required

> **required**: `string`[]

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'analyze_voting_patterns'`
