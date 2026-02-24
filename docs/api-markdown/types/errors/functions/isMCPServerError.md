[**European Parliament MCP Server API v0.7.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/errors](../README.md) / isMCPServerError

# Function: isMCPServerError()

> **isMCPServerError**(`error`): `error is MCPServerError`

Defined in: [types/errors.ts:202](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/errors.ts#L202)

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
