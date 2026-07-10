[**European Parliament MCP Server API v1.3.43**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getMEPDetails](../README.md) / getMEPDetailsToolMetadata

# Variable: getMEPDetailsToolMetadata

> `const` **getMEPDetailsToolMetadata**: `object`

Defined in: [tools/getMEPDetails.ts:101](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getMEPDetails.ts#L101)

Tool metadata for MCP registration

## Type Declaration

### description

> **description**: `string` = `'Retrieve the complete EP API v2 profile for a Member of European Parliament, including biographical data, mandates, organizations, committee classifications, and leadership roles. Personal data access is logged for GDPR compliance.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.id

> **id**: `object`

#### inputSchema.properties.id.description

> **description**: `string` = `'MEP identifier (e.g., "MEP-124810")'`

#### inputSchema.properties.id.maxLength

> **maxLength**: `number` = `100`

#### inputSchema.properties.id.minLength

> **minLength**: `number` = `1`

#### inputSchema.properties.id.type

> **type**: `string` = `'string'`

#### inputSchema.required

> **required**: `string`[]

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'get_mep_details'`
