[**European Parliament MCP Server API v1.4.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/weeklyCacheState](../README.md) / compactDetailMap

# Function: compactDetailMap()

> **compactDetailMap**\<`Item`\>(`options`): `Record`\<`string`, `unknown`\>

Defined in: [utils/weeklyCacheState.ts:109](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/weeklyCacheState.ts#L109)

Re-keys existing detail records by each current item's canonical identifier.
This removes stale entities and duplicate alias keys while retaining data
fetched by an earlier incremental run.

## Type Parameters

### Item

`Item`

## Parameters

### options

#### details

`Readonly`\<`Record`\<`string`, `unknown`\>\>

#### idFor

(`item`) => `string`

#### items

readonly `Item`[]

#### keysFor

(`item`) => readonly `string`[]

## Returns

`Record`\<`string`, `unknown`\>
