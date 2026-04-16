[**European Parliament MCP Server API v1.2.8**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getControlledVocabulariesFeed](../README.md) / getControlledVocabulariesFeedToolMetadata

# Variable: getControlledVocabulariesFeedToolMetadata

> `const` **getControlledVocabulariesFeedToolMetadata**: `object`

Defined in: [tools/getControlledVocabulariesFeed.ts:68](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getControlledVocabulariesFeed.ts#L68)

Tool metadata for get_controlled_vocabularies_feed

## Type Declaration

### description

> **description**: `string` = `'Get recently updated controlled vocabularies from the EP Open Data Portal feed. This is a fixed-window feed — no parameters needed. Returns items updated within the server-defined default window (typically one month). Data source: European Parliament Open Data Portal.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object` = `{}`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_controlled_vocabularies_feed'`
