[**European Parliament MCP Server API v1.2.21**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/feedUtils](../README.md) / extractUpstreamStatusCode

# Function: extractUpstreamStatusCode()

> **extractUpstreamStatusCode**(`errorMessage`): `number` \| `undefined`

Defined in: [tools/shared/feedUtils.ts:112](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/feedUtils.ts#L112)

Parse an HTTP status code from an EP API error-in-body message.

EP API error-in-body messages often embed the HTTP status code in the error
string, e.g. `"404 Not Found from POST …"` or `"502 Bad Gateway from …"`.
This function extracts the first three-digit integer in the range 100–599.

## Parameters

### errorMessage

`string`

Raw error string from the EP API response body

## Returns

`number` \| `undefined`

The numeric HTTP status code, or `undefined` if none is found
