[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / createGroupID

# Function: createGroupID()

> **createGroupID**(`value`): [`GroupID`](../type-aliases/GroupID.md)

Defined in: [types/branded.ts:301](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/branded.ts#L301)

Factory function to create a validated Political Group ID

## Parameters

### value

`string`

String to convert to Group ID

## Returns

[`GroupID`](../type-aliases/GroupID.md)

Branded Group ID

## Throws

If value is not a valid Group ID

## Example

```typescript
const groupId = createGroupID("EPP");
const members = await getGroupMembers(groupId);
```

## Security

Input validation prevents injection attacks
