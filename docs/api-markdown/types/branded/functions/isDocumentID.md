[**European Parliament MCP Server API v0.7.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / isDocumentID

# Function: isDocumentID()

> **isDocumentID**(`value`): `value is DocumentID`

Defined in: [types/branded.ts:172](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/types/branded.ts#L172)

Type guard to check if a string is a valid Document ID

## Parameters

### value

`string`

String to validate

## Returns

`value is DocumentID`

true if the value matches Document ID format

## Example

```typescript
if (isDocumentID("A9-2024/0123")) {
  const id = "A9-2024/0123" as DocumentID;
}
```
