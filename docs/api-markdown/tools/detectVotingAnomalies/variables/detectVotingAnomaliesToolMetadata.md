[**European Parliament MCP Server API v1.4.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/detectVotingAnomalies](../README.md) / detectVotingAnomaliesToolMetadata

# Variable: detectVotingAnomaliesToolMetadata

> `const` **detectVotingAnomaliesToolMetadata**: `object`

Defined in: [tools/detectVotingAnomalies.ts:1075](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/detectVotingAnomalies.ts#L1075)

Tool metadata for MCP registration

## Type Declaration

### description

> **description**: `string` = `'Detect unusual voting patterns including party defections, abstention spikes, week-over-week alignment shifts, and cross-party movement signals. Uses DOCEO RCV roll-call records and per-MEP rolling baselines (defection z ≥1.5, abstention z ≥1.5, WoW Δ ≥20pp, cross-party share ≥60%). Returns anomalies with evidenceVoteIds, severity classification (HIGH/MEDIUM/LOW), group stability score, defection trend, and risk level.'`

### inputSchema

> **inputSchema**: `object`

#### inputSchema.properties

> **properties**: `object`

#### inputSchema.properties.dateFrom

> **dateFrom**: `object`

#### inputSchema.properties.dateFrom.description

> **description**: `string` = `'Analysis start date (YYYY-MM-DD format)'`

#### inputSchema.properties.dateFrom.pattern

> **pattern**: `string` = '^\\d\{4\}-\\d\{2\}-\\d\{2\}$'

#### inputSchema.properties.dateFrom.type

> **type**: `string` = `'string'`

#### inputSchema.properties.dateTo

> **dateTo**: `object`

#### inputSchema.properties.dateTo.description

> **description**: `string` = `'Analysis end date (YYYY-MM-DD format)'`

#### inputSchema.properties.dateTo.pattern

> **pattern**: `string` = '^\\d\{4\}-\\d\{2\}-\\d\{2\}$'

#### inputSchema.properties.dateTo.type

> **type**: `string` = `'string'`

#### inputSchema.properties.groupId

> **groupId**: `object`

#### inputSchema.properties.groupId.description

> **description**: `string` = `'Political group to analyze'`

#### inputSchema.properties.groupId.maxLength

> **maxLength**: `number` = `50`

#### inputSchema.properties.groupId.minLength

> **minLength**: `number` = `1`

#### inputSchema.properties.groupId.type

> **type**: `string` = `'string'`

#### inputSchema.properties.mepId

> **mepId**: `object`

#### inputSchema.properties.mepId.description

> **description**: `string` = `'MEP identifier (omit for broad analysis)'`

#### inputSchema.properties.mepId.maxLength

> **maxLength**: `number` = `100`

#### inputSchema.properties.mepId.minLength

> **minLength**: `number` = `1`

#### inputSchema.properties.mepId.type

> **type**: `string` = `'string'`

#### inputSchema.properties.sensitivityThreshold

> **sensitivityThreshold**: `object`

#### inputSchema.properties.sensitivityThreshold.default

> **default**: `number` = `0.3`

#### inputSchema.properties.sensitivityThreshold.description

> **description**: `string` = `'Anomaly sensitivity (0-1, lower = more anomalies detected). Default 0.3 matches the spec thresholds (z≥1.5, WoW≥20pp, cross-party≥60%).'`

#### inputSchema.properties.sensitivityThreshold.maximum

> **maximum**: `number` = `1`

#### inputSchema.properties.sensitivityThreshold.minimum

> **minimum**: `number` = `0`

#### inputSchema.properties.sensitivityThreshold.type

> **type**: `string` = `'number'`

#### inputSchema.type

> **type**: `"object"`

### name

> **name**: `string` = `'detect_voting_anomalies'`
