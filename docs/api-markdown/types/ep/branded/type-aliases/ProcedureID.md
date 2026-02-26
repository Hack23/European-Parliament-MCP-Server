[**European Parliament MCP Server API v0.8.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [types/ep/branded](../README.md) / ProcedureID

# Type Alias: ProcedureID

> **ProcedureID** = [`Brand`](../../../branded/type-aliases/Brand.md)\<`string`, `"ProcedureID"`\>

Defined in: [types/ep/branded.ts:53](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/ep/branded.ts#L53)

Procedure ID – identifies a legislative procedure by its EP API **process-id**.

This is the URL path segment used by `/procedures/{process-id}` endpoints.
Format: `"YYYY-NNNN"` (e.g. `"2024-0006"`)

**Note:** This is distinct from the human-readable procedure reference used in
`Procedure.id` (`"COD/2023/0123"`) and `Procedure.reference` (`"2023/0123(COD)"`).
Use the process-id format when calling `getProcedureById` / `getProcedureEvents`.

## Example

```typescript
const procId: ProcedureID = '2024-0006' as ProcedureID;
```
