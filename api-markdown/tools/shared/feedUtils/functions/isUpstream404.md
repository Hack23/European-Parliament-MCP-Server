[**European Parliament MCP Server API v1.2.9**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/feedUtils](../README.md) / isUpstream404

# Function: isUpstream404()

> **isUpstream404**(`error`): `boolean`

Defined in: [tools/shared/feedUtils.ts:80](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/feedUtils.ts#L80)

Check whether an error is an upstream EP API 404.

The EP Open Data Portal returns 404 for feed endpoints that have no
recent updates within the requested timeframe (e.g. during recess).

## Parameters

### error

`unknown`

## Returns

`boolean`
