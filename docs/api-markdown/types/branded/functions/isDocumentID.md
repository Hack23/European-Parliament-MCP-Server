[**European Parliament MCP Server API v0.7.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / isDocumentID

# Function: isDocumentID()

> **isDocumentID**(`value`): `value is DocumentID`

Defined in: [types/branded.ts:172](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/types/branded.ts#L172)

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
