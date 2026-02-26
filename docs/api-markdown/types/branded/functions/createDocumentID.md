[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / createDocumentID

# Function: createDocumentID()

> **createDocumentID**(`value`): [`DocumentID`](../type-aliases/DocumentID.md)

Defined in: [types/branded.ts:279](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/types/branded.ts#L279)

Factory function to create a validated Document ID

## Parameters

### value

`string`

String to convert to Document ID

## Returns

[`DocumentID`](../type-aliases/DocumentID.md)

Branded Document ID

## Throws

If value is not a valid Document ID format

## Example

```typescript
const docId = createDocumentID("A9-2024/0123");
const doc = await getDocument(docId);
```

## Security

Input validation prevents injection attacks
