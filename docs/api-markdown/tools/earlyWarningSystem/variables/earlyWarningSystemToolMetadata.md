[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/earlyWarningSystem](../README.md) / earlyWarningSystemToolMetadata

# Variable: earlyWarningSystemToolMetadata

> `const` **earlyWarningSystemToolMetadata**: `object`

Defined in: [tools/earlyWarningSystem.ts:374](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/earlyWarningSystem.ts#L374)

## Type Declaration

### description

> **description**: `string` = `'Detect emerging political shifts, coalition fracture signals, and unusual patterns. Generates warnings with severity levels (CRITICAL/HIGH/MEDIUM/LOW), computes stability score (0-100), trend indicators, and overall risk level. Configurable sensitivity and focus area.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.focusArea

> **focusArea**: `object`

#### inputSchema.properties.focusArea.default

> **default**: `string` = `'all'`

#### inputSchema.properties.focusArea.description

> **description**: `string` = `'Area of political activity to monitor'`

#### inputSchema.properties.focusArea.enum

> **enum**: `string`[]

#### inputSchema.properties.focusArea.type

> **type**: `string` = `'string'`

#### inputSchema.properties.sensitivity

> **sensitivity**: `object`

#### inputSchema.properties.sensitivity.default

> **default**: `string` = `'medium'`

#### inputSchema.properties.sensitivity.description

> **description**: `string` = `'Detection sensitivity — higher surfaces more warnings'`

#### inputSchema.properties.sensitivity.enum

> **enum**: `string`[]

#### inputSchema.properties.sensitivity.type

> **type**: `string` = `'string'`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'early_warning_system'`
