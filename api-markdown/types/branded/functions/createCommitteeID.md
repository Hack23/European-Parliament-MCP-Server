[**European Parliament MCP Server API v0.8.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / createCommitteeID

# Function: createCommitteeID()

> **createCommitteeID**(`value`): [`CommitteeID`](../type-aliases/CommitteeID.md)

Defined in: [types/branded.ts:257](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/types/branded.ts#L257)

Factory function to create a validated Committee ID

## Parameters

### value

`string`

String to convert to Committee ID

## Returns

[`CommitteeID`](../type-aliases/CommitteeID.md)

Branded Committee ID

## Throws

If value is not a valid Committee ID format

## Example

```typescript
const committeeId = createCommitteeID("DEVE");
const info = await getCommitteeInfo(committeeId);
```

## Security

Input validation prevents injection attacks
