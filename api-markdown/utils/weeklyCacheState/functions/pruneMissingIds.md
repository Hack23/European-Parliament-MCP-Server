[**European Parliament MCP Server API v1.4.5**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/weeklyCacheState](../README.md) / pruneMissingIds

# Function: pruneMissingIds()

> **pruneMissingIds**(`missingIds`, `activeIds`): `void`

Defined in: [utils/weeklyCacheState.ts:78](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/weeklyCacheState.ts#L78)

Drops missing identifiers that are no longer part of the active roster so a
departed entity does not permanently suppress a re-added one.

## Parameters

### missingIds

[`Set`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set)\<`string`\>

Missing-id set (mutated in place).

### activeIds

`ReadonlySet`\<`string`\>

Identifiers present in the current listing.

## Returns

`void`
