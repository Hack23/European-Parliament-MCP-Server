[**European Parliament MCP Server API v0.8.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / GroupID

# Type Alias: GroupID

> **GroupID** = [`Brand`](Brand.md)\<`string`, `"GroupID"`\>

Defined in: [types/branded.ts:101](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/types/branded.ts#L101)

Political Group ID

Format: Group abbreviation (e.g., "EPP", "S&D", "Renew")
Source: European Parliament Open Data Portal

## Example

```typescript
const groupId: GroupID = createGroupID("EPP");
const members = await getGroupMembers(groupId);
```
