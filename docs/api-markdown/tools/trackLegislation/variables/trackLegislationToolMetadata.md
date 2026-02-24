[**European Parliament MCP Server API v0.7.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/trackLegislation](../README.md) / trackLegislationToolMetadata

# Variable: trackLegislationToolMetadata

> `const` **trackLegislationToolMetadata**: `object`

Defined in: [tools/trackLegislation/index.ts:69](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/trackLegislation/index.ts#L69)

Tool metadata for MCP registration

## Type Declaration

### description

> **description**: `string` = `'Track European Parliament legislative procedure progress including current status, timeline of stages, committee assignments, amendments, voting records, and next steps. Provides comprehensive overview of legislation journey from proposal to adoption.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.procedureId

> **procedureId**: `object`

#### inputSchema.properties.procedureId.description

> **description**: `string` = `'Legislative procedure identifier (e.g., "2024/0001(COD)")'`

#### inputSchema.properties.procedureId.maxLength

> **maxLength**: `number` = `100`

#### inputSchema.properties.procedureId.minLength

> **minLength**: `number` = `1`

#### inputSchema.properties.procedureId.type

> **type**: `string` = `'string'`

#### inputSchema.required

> **required**: `string`[]

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'track_legislation'`
