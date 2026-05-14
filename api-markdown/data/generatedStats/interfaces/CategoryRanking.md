[**European Parliament MCP Server API v1.3.4**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [data/generatedStats](../README.md) / CategoryRanking

# Interface: CategoryRanking

Defined in: [data/generatedStats.ts:327](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L327)

Statistical ranking of years for a single activity category.

## Properties

### bottomYear

> **bottomYear**: `number`

Defined in: [data/generatedStats.ts:341](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L341)

Year with the lowest activity score

***

### category

> **category**: `string`

Defined in: [data/generatedStats.ts:329](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L329)

Human-readable category label (e.g. 'Plenary Sessions')

***

### mean

> **mean**: `number`

Defined in: [data/generatedStats.ts:333](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L333)

Mean value across all years

***

### median

> **median**: `number`

Defined in: [data/generatedStats.ts:337](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L337)

Median value

***

### rankings

> **rankings**: [`RankedYear`](RankedYear.md)[]

Defined in: [data/generatedStats.ts:331](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L331)

Per-year ranking entries, sorted by descending activity score

***

### stdDev

> **stdDev**: `number`

Defined in: [data/generatedStats.ts:335](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L335)

Standard deviation

***

### topYear

> **topYear**: `number`

Defined in: [data/generatedStats.ts:339](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L339)

Year with the highest activity score
