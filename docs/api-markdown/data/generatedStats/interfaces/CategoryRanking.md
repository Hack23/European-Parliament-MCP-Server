[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [data/generatedStats](../README.md) / CategoryRanking

# Interface: CategoryRanking

Defined in: [data/generatedStats.ts:143](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L143)

Statistical ranking of years for a single activity category.

## Properties

### bottomYear

> **bottomYear**: `number`

Defined in: [data/generatedStats.ts:157](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L157)

Year with the lowest activity score

***

### category

> **category**: `string`

Defined in: [data/generatedStats.ts:145](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L145)

Human-readable category label (e.g. 'Plenary Sessions')

***

### mean

> **mean**: `number`

Defined in: [data/generatedStats.ts:149](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L149)

Mean value across all years

***

### median

> **median**: `number`

Defined in: [data/generatedStats.ts:153](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L153)

Median value

***

### rankings

> **rankings**: [`RankedYear`](RankedYear.md)[]

Defined in: [data/generatedStats.ts:147](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L147)

Per-year ranking entries, sorted by descending activity score

***

### stdDev

> **stdDev**: `number`

Defined in: [data/generatedStats.ts:151](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L151)

Standard deviation

***

### topYear

> **topYear**: `number`

Defined in: [data/generatedStats.ts:155](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L155)

Year with the highest activity score
