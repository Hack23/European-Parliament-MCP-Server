[**European Parliament MCP Server API v0.7.3**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/transformers](../README.md) / transformEvent

# Function: transformEvent()

> **transformEvent**(`apiData`): [`EPEvent`](../../../../types/ep/activities/interfaces/EPEvent.md)

Defined in: [clients/ep/transformers.ts:317](https://github.com/Hack23/European-Parliament-MCP-Server/blob/c844f163befb571516b5718c5d197eff1e589dea/src/clients/ep/transformers.ts#L317)

Transforms EP API event data to internal [EPEvent](../../../../types/ep/activities/interfaces/EPEvent.md) format.

## Parameters

### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

## Returns

[`EPEvent`](../../../../types/ep/activities/interfaces/EPEvent.md)
