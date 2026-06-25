[**European Parliament MCP Server API v1.3.28**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/doceoXmlParser](../README.md) / getPlenaryWeekDates

# Function: getPlenaryWeekDates()

> **getPlenaryWeekDates**(`weekStart?`): `string`[]

Defined in: [clients/ep/doceoXmlParser.ts:496](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/doceoXmlParser.ts#L496)

Get dates for the most recent plenary week (Monday-Thursday).
If a specific week start date is provided, uses that week.
Otherwise calculates the most recent Monday.

## Parameters

### weekStart?

`string`

Optional Monday date (YYYY-MM-DD) to use as start of plenary week

## Returns

`string`[]

Array of date strings for the plenary week (Mon-Thu)
