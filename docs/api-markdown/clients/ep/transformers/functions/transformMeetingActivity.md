[**European Parliament MCP Server API v0.8.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/transformers](../README.md) / transformMeetingActivity

# Function: transformMeetingActivity()

> **transformMeetingActivity**(`apiData`): [`MeetingActivity`](../../../../types/ep/activities/interfaces/MeetingActivity.md)

Defined in: [clients/ep/transformers.ts:333](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/clients/ep/transformers.ts#L333)

Transforms EP API meeting activity data to internal [MeetingActivity](../../../../types/ep/activities/interfaces/MeetingActivity.md) format.

## Parameters

### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

## Returns

[`MeetingActivity`](../../../../types/ep/activities/interfaces/MeetingActivity.md)
