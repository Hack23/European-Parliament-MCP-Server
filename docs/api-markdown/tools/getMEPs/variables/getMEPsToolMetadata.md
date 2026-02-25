[**European Parliament MCP Server API v0.8.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getMEPs](../README.md) / getMEPsToolMetadata

# Variable: getMEPsToolMetadata

> `const` **getMEPsToolMetadata**: `object`

Defined in: [tools/getMEPs.ts:82](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/tools/getMEPs.ts#L82)

Tool metadata for MCP registration

## Type Declaration

### description

> **description**: `string` = `'Retrieve Members of European Parliament with optional filters (country, political group, committee, active status). Returns paginated results with MEP details including name, country, political group, committees, and contact information.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.active

> **active**: `object`

#### inputSchema.properties.active.default

> **default**: `boolean` = `true`

#### inputSchema.properties.active.description

> **description**: `string` = `'Filter by active status'`

#### inputSchema.properties.active.type

> **type**: `string` = `'boolean'`

#### inputSchema.properties.committee

> **committee**: `object`

#### inputSchema.properties.committee.description

> **description**: `string` = `'Committee identifier (e.g., "ENVI", "AGRI")'`

#### inputSchema.properties.committee.maxLength

> **maxLength**: `number` = `100`

#### inputSchema.properties.committee.minLength

> **minLength**: `number` = `1`

#### inputSchema.properties.committee.type

> **type**: `string` = `'string'`

#### inputSchema.properties.country

> **country**: `object`

#### inputSchema.properties.country.description

> **description**: `string` = `'ISO 3166-1 alpha-2 country code (e.g., "SE" for Sweden)'`

#### inputSchema.properties.country.maxLength

> **maxLength**: `number` = `2`

#### inputSchema.properties.country.minLength

> **minLength**: `number` = `2`

#### inputSchema.properties.country.pattern

> **pattern**: `string` = `'^[A-Z]{2}$'`

#### inputSchema.properties.country.type

> **type**: `string` = `'string'`

#### inputSchema.properties.group

> **group**: `object`

#### inputSchema.properties.group.description

> **description**: `string` = `'Political group identifier (e.g., "EPP", "S&D", "Greens/EFA")'`

#### inputSchema.properties.group.maxLength

> **maxLength**: `number` = `50`

#### inputSchema.properties.group.minLength

> **minLength**: `number` = `1`

#### inputSchema.properties.group.type

> **type**: `string` = `'string'`

#### inputSchema.properties.limit

> **limit**: `object`

#### inputSchema.properties.limit.default

> **default**: `number` = `50`

#### inputSchema.properties.limit.description

> **description**: `string` = `'Maximum number of results to return (1-100)'`

#### inputSchema.properties.limit.maximum

> **maximum**: `number` = `100`

#### inputSchema.properties.limit.minimum

> **minimum**: `number` = `1`

#### inputSchema.properties.limit.type

> **type**: `string` = `'number'`

#### inputSchema.properties.offset

> **offset**: `object`

#### inputSchema.properties.offset.default

> **default**: `number` = `0`

#### inputSchema.properties.offset.description

> **description**: `string` = `'Pagination offset'`

#### inputSchema.properties.offset.minimum

> **minimum**: `number` = `0`

#### inputSchema.properties.offset.type

> **type**: `string` = `'number'`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_meps'`
