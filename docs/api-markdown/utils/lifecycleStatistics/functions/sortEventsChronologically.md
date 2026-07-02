[**European Parliament MCP Server API v1.3.33**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/lifecycleStatistics](../README.md) / sortEventsChronologically

# Function: sortEventsChronologically()

> **sortEventsChronologically**(`events`): [`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)[]

Defined in: [utils/lifecycleStatistics.ts:196](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/lifecycleStatistics.ts#L196)

Sort events chronologically by date, with stable tie-break on event id.

## Parameters

### events

readonly [`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)[]

Raw events from `/procedures/{id}/events`

## Returns

[`EPEvent`](../../../types/ep/activities/interfaces/EPEvent.md)[]

A new array sorted in ascending date order
