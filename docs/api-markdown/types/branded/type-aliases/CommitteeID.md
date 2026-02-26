[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / CommitteeID

# Type Alias: CommitteeID

> **CommitteeID** = [`Brand`](Brand.md)\<`string`, `"CommitteeID"`\>

Defined in: [types/branded.ts:73](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/types/branded.ts#L73)

Committee ID

Format: Alphanumeric abbreviation (e.g., "DEVE", "ENVI")
Source: European Parliament Open Data Portal

## Example

```typescript
const committeeId: CommitteeID = createCommitteeID("DEVE");
const committeeInfo = await getCommitteeInfo(committeeId);
```
