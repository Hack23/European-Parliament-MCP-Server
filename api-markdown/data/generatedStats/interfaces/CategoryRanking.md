[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [data/generatedStats](../README.md) / CategoryRanking

# Interface: CategoryRanking

Defined in: [data/generatedStats.ts:352](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L352)

Statistical ranking of years for a single activity category.

## Properties

### bottomYear

> **bottomYear**: `number`

Defined in: [data/generatedStats.ts:366](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L366)

Year with the lowest activity score

***

### category

> **category**: `string`

Defined in: [data/generatedStats.ts:354](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L354)

Human-readable category label (e.g. 'Plenary Sessions')

***

### mean

> **mean**: `number`

Defined in: [data/generatedStats.ts:358](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L358)

Mean value across all years

***

### median

> **median**: `number`

Defined in: [data/generatedStats.ts:362](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L362)

Median value

***

### rankings

> **rankings**: [`RankedYear`](RankedYear.md)[]

Defined in: [data/generatedStats.ts:356](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L356)

Per-year ranking entries, sorted by descending activity score

***

### stdDev

> **stdDev**: `number`

Defined in: [data/generatedStats.ts:360](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L360)

Standard deviation

***

### topYear

> **topYear**: `number`

Defined in: [data/generatedStats.ts:364](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L364)

Year with the highest activity score
