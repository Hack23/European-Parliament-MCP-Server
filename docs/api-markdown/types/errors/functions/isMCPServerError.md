[**European Parliament MCP Server API v0.8.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/errors](../README.md) / isMCPServerError

# Function: isMCPServerError()

> **isMCPServerError**(`error`): `error is MCPServerError`

Defined in: [types/errors.ts:202](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/types/errors.ts#L202)

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
