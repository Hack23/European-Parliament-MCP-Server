[**European Parliament MCP Server API v0.9.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getProcedureEvents](../README.md) / handleGetProcedureEvents

# Function: handleGetProcedureEvents()

> **handleGetProcedureEvents**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getProcedureEvents.ts:52](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getProcedureEvents.ts#L52)

Handles the get_procedure_events MCP tool request.

Retrieves the chronological timeline of events (committee hearings, plenary debates,
votes, and other milestones) linked to a specific EP legislative procedure, supporting
precise legislative tracking and compliance monitoring.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetProcedureEventsSchema](../../../schemas/ep/activities/variables/GetProcedureEventsSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing the ordered list of events for the specified procedure

## Throws

- If `args` fails schema validation (e.g., missing required `processId`)
- If the European Parliament API is unreachable or returns an error response

## Example

```typescript
const result = await handleGetProcedureEvents({
  processId: '2023/0132(COD)',
  limit: 50,
  offset: 0
});
// Returns committee hearings, plenary debates, and votes for procedure 2023/0132(COD)
```

## Security

- Input is validated with Zod before any API call.
- Personal data in responses is minimised per GDPR Article 5(1)(c).
- All requests are rate-limited and audit-logged per ISMS Policy AU-002.

## Since

0.8.0

## See

 - [getProcedureEventsToolMetadata](../variables/getProcedureEventsToolMetadata.md) for MCP schema registration
 - handleGetProcedures for retrieving the parent procedure record
