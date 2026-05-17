[**European Parliament MCP Server API v1.3.7**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / createCommitteeID

# Function: createCommitteeID()

> **createCommitteeID**(`value`): [`CommitteeID`](../type-aliases/CommitteeID.md)

Defined in: [types/branded.ts:248](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/branded.ts#L248)

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
