[**European Parliament MCP Server API v0.7.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/errors](../README.md) / formatMCPError

# Function: formatMCPError()

> **formatMCPError**(`error`): `object`

Defined in: [types/errors.ts:232](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/errors.ts#L232)

Error formatter for MCP responses

Formats errors for safe transmission to MCP clients. Internal errors
are sanitized to prevent information leakage while preserving useful
debugging information for expected error types.

## Parameters

### error

`unknown`

Error to format

## Returns

`object`

Formatted error object safe for client transmission

### code

> **code**: `string`

### message

> **message**: `string`

### details?

> `optional` **details**: `unknown`

## Example

```typescript
try {
  const result = await processMEPRequest(args);
  return { content: [{ type: 'text', text: JSON.stringify(result) }] };
} catch (error) {
  const formatted = formatMCPError(error);
  return { content: [{ type: 'text', text: JSON.stringify(formatted) }] };
}
```

## Security

- Sanitizes internal errors to prevent information leakage
- Preserves error codes and safe details for structured errors
- Logs full error details internally for debugging
