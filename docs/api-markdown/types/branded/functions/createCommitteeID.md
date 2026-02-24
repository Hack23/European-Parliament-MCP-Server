[**European Parliament MCP Server API v0.6.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / createCommitteeID

# Function: createCommitteeID()

> **createCommitteeID**(`value`): [`CommitteeID`](../type-aliases/CommitteeID.md)

Defined in: [types/branded.ts:257](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/types/branded.ts#L257)

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
