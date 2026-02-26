[**European Parliament MCP Server API v0.8.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / CommitteeID

# Type Alias: CommitteeID

> **CommitteeID** = [`Brand`](Brand.md)\<`string`, `"CommitteeID"`\>

Defined in: [types/branded.ts:73](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/types/branded.ts#L73)

Committee ID

Format: Alphanumeric abbreviation (e.g., "DEVE", "ENVI")
Source: European Parliament Open Data Portal

## Example

```typescript
const committeeId: CommitteeID = createCommitteeID("DEVE");
const committeeInfo = await getCommitteeInfo(committeeId);
```
