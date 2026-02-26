[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getControlledVocabularies](../README.md) / getControlledVocabulariesToolMetadata

# Variable: getControlledVocabulariesToolMetadata

> `const` **getControlledVocabulariesToolMetadata**: `object`

Defined in: [tools/getControlledVocabularies.ts:74](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/tools/getControlledVocabularies.ts#L74)

Tool metadata for get_controlled_vocabularies

## Type Declaration

### description

> **description**: `string` = `'Get European Parliament controlled vocabularies (standardized classification terms). Supports single vocabulary lookup by vocId. Data source: European Parliament Open Data Portal.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.limit

> **limit**: `object`

#### inputSchema.properties.limit.default

> **default**: `number` = `50`

#### inputSchema.properties.limit.description

> **description**: `string` = `'Maximum results to return (1-100)'`

#### inputSchema.properties.limit.type

> **type**: `string` = `'number'`

#### inputSchema.properties.offset

> **offset**: `object`

#### inputSchema.properties.offset.default

> **default**: `number` = `0`

#### inputSchema.properties.offset.description

> **description**: `string` = `'Pagination offset'`

#### inputSchema.properties.offset.type

> **type**: `string` = `'number'`

#### inputSchema.properties.vocId

> **vocId**: `object`

#### inputSchema.properties.vocId.description

> **description**: `string` = `'Vocabulary ID for single vocabulary lookup'`

#### inputSchema.properties.vocId.type

> **type**: `string` = `'string'`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_controlled_vocabularies'`
