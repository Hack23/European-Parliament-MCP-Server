[**European Parliament MCP Server API v0.7.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / GroupID

# Type Alias: GroupID

> **GroupID** = [`Brand`](Brand.md)\<`string`, `"GroupID"`\>

Defined in: [types/branded.ts:101](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/types/branded.ts#L101)

Political Group ID

Format: Group abbreviation (e.g., "EPP", "S&D", "Renew")
Source: European Parliament Open Data Portal

## Example

```typescript
const groupId: GroupID = createGroupID("EPP");
const members = await getGroupMembers(groupId);
```
