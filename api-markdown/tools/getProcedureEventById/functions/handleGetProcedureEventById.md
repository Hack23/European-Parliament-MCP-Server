[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getProcedureEventById](../README.md) / handleGetProcedureEventById

# Function: handleGetProcedureEventById()

> **handleGetProcedureEventById**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getProcedureEventById.ts:24](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getProcedureEventById.ts#L24)

Handles the get_procedure_event_by_id MCP tool request.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [GetProcedureEventByIdSchema](../../../schemas/ep/feed/variables/GetProcedureEventByIdSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing the procedure event data

## Security

Input is validated with Zod before any API call.
