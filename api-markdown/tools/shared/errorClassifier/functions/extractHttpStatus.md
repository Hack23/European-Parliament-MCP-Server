[**European Parliament MCP Server API v1.2.5**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/errorClassifier](../README.md) / extractHttpStatus

# Function: extractHttpStatus()

> **extractHttpStatus**(`error`): `number` \| `undefined`

Defined in: [tools/shared/errorClassifier.ts:30](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errorClassifier.ts#L30)

Extract an HTTP status code from an error via duck typing.
Works with both `APIError` (from `clients/ep/baseClient`) and any error
carrying a numeric `statusCode` property (avoids circular imports).

## Parameters

### error

`unknown`

## Returns

`number` \| `undefined`
