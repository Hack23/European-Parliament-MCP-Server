[**European Parliament MCP Server API v0.8.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [types/ep/branded](../README.md) / SittingID

# Type Alias: SittingID

> **SittingID** = [`Brand`](../../../branded/type-aliases/Brand.md)\<`string`, `"SittingID"`\>

Defined in: [types/ep/branded.ts:87](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/types/ep/branded.ts#L87)

Meeting/Sitting ID – identifies a plenary sitting.

Format: `"MTG-PL-YYYY-MM-DD"` (e.g. `"MTG-PL-2024-01-15"`)

## Example

```typescript
const sittingId: SittingID = 'MTG-PL-2024-01-15' as SittingID;
```
