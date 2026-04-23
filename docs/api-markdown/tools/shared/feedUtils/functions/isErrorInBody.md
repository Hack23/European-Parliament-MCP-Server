[**European Parliament MCP Server API v1.2.12**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/feedUtils](../README.md) / isErrorInBody

# Function: isErrorInBody()

> **isErrorInBody**(`result`): `boolean`

Defined in: [tools/shared/feedUtils.ts:142](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/feedUtils.ts#L142)

Detect an EP API "error-in-body" response.

Some feed endpoints return HTTP 200 but with a JSON body that contains
an `error` field and no `data` array.  Example:
```json
{
  "@id": "https://data.europarl.europa.eu/eli/dl/…",
  "error": "404 Not Found from POST …",
  "@context": { "error": { … } }
}
```

This function returns `true` when the parsed response has this shape,
allowing callers to convert it to an empty feed response.

## Parameters

### result

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

## Returns

`boolean`
