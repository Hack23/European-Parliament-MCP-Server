[**European Parliament MCP Server API v1.4.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getCommitteeInfo](../README.md) / getCommitteeInfoToolMetadata

# Variable: getCommitteeInfoToolMetadata

> `const` **getCommitteeInfoToolMetadata**: `object`

Defined in: [tools/getCommitteeInfo.ts:166](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getCommitteeInfo.ts#L166)

Tool metadata for MCP registration

## Type Declaration

### description

> **description**: `string` = `'Retrieve detailed information about EP corporate bodies/committees. Query by ID, abbreviation, or set showCurrent=true for all current active bodies. Returns committee metadata plus roster leadership and membership derived from MEP membership relations when available, along with meeting schedules and areas of responsibility.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.abbreviation

> **abbreviation**: `object`

#### inputSchema.properties.abbreviation.description

> **description**: `string` = `'Committee abbreviation (e.g., "ENVI", "AGRI", "ECON")'`

#### inputSchema.properties.abbreviation.maxLength

> **maxLength**: `number` = `20`

#### inputSchema.properties.abbreviation.minLength

> **minLength**: `number` = `1`

#### inputSchema.properties.abbreviation.type

> **type**: `string` = `'string'`

#### inputSchema.properties.id

> **id**: `object`

#### inputSchema.properties.id.description

> **description**: `string` = `'Committee identifier'`

#### inputSchema.properties.id.maxLength

> **maxLength**: `number` = `100`

#### inputSchema.properties.id.minLength

> **minLength**: `number` = `1`

#### inputSchema.properties.id.type

> **type**: `string` = `'string'`

#### inputSchema.properties.live

> **live**: `object`

#### inputSchema.properties.live.default

> **default**: `boolean` = `false`

#### inputSchema.properties.live.description

> **description**: `string` = `'When true, bypasses weekly cache and fetches directly from the live EP API.'`

#### inputSchema.properties.live.type

> **type**: `string` = `'boolean'`

#### inputSchema.properties.showCurrent

> **showCurrent**: `object`

#### inputSchema.properties.showCurrent.default

> **default**: `boolean` = `false`

#### inputSchema.properties.showCurrent.description

> **description**: `string` = `'If true, returns all current active corporate bodies'`

#### inputSchema.properties.showCurrent.type

> **type**: `string` = `'boolean'`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_committee_info'`
