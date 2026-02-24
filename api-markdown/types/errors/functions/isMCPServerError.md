[**European Parliament MCP Server API v0.7.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/errors](../README.md) / isMCPServerError

# Function: isMCPServerError()

> **isMCPServerError**(`error`): `error is MCPServerError`

Defined in: [types/errors.ts:202](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/types/errors.ts#L202)

Type guard for MCPServerError

Checks if an unknown error is an instance of MCPServerError or one of
its subclasses. Useful for error handling and formatting.

## Parameters

### error

`unknown`

Unknown error to check

## Returns

`error is MCPServerError`

true if error is an MCPServerError or subclass

## Example

```typescript
try {
  await fetchMEPs();
} catch (error) {
  if (isMCPServerError(error)) {
    console.error(`Error ${error.code}: ${error.message}`);
  }
}
```
