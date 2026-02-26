[**European Parliament MCP Server API v0.8.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/transformers](../README.md) / transformMeetingActivity

# Function: transformMeetingActivity()

> **transformMeetingActivity**(`apiData`): [`MeetingActivity`](../../../../types/ep/activities/interfaces/MeetingActivity.md)

Defined in: [clients/ep/transformers.ts:333](https://github.com/Hack23/European-Parliament-MCP-Server/blob/67dbd67a8f5629591a17b9785bfa0977f7023afb/src/clients/ep/transformers.ts#L333)

Transforms EP API meeting activity data to internal [MeetingActivity](../../../../types/ep/activities/interfaces/MeetingActivity.md) format.

## Parameters

### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

## Returns

[`MeetingActivity`](../../../../types/ep/activities/interfaces/MeetingActivity.md)
