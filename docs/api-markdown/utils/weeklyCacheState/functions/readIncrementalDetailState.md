[**European Parliament MCP Server API v1.4.5**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/weeklyCacheState](../README.md) / readIncrementalDetailState

# Function: readIncrementalDetailState()

> **readIncrementalDetailState**(`parsed`, `detailsKey`, `missingKey?`): [`IncrementalDetailState`](../interfaces/IncrementalDetailState.md)

Defined in: [utils/weeklyCacheState.ts:44](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/weeklyCacheState.ts#L44)

Reconstructs incremental state from a previously written `latest.json`
payload. Unknown or malformed input yields empty state rather than throwing,
so a corrupt cache simply triggers a full rebuild.

## Parameters

### parsed

`unknown`

Parsed prior cache payload (or any value).

### detailsKey

`string`

Property holding the detail map (e.g. `"mepDetails"`).

### missingKey?

`string` = `'missingDetailIds'`

Property holding the missing-id list.

## Returns

[`IncrementalDetailState`](../interfaces/IncrementalDetailState.md)

Detail map and missing-id set restored from the payload.
