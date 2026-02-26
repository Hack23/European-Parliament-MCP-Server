[**European Parliament MCP Server API v0.8.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/transformers](../README.md) / transformMeetingActivity

# Function: transformMeetingActivity()

> **transformMeetingActivity**(`apiData`): [`MeetingActivity`](../../../../types/ep/activities/interfaces/MeetingActivity.md)

Defined in: [clients/ep/transformers.ts:333](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/clients/ep/transformers.ts#L333)

Transforms EP API meeting activity data to internal [MeetingActivity](../../../../types/ep/activities/interfaces/MeetingActivity.md) format.

## Parameters

### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

## Returns

[`MeetingActivity`](../../../../types/ep/activities/interfaces/MeetingActivity.md)
