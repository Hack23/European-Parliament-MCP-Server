[**European Parliament MCP Server API v0.7.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / DocumentID

# Type Alias: DocumentID

> **DocumentID** = [`Brand`](Brand.md)\<`string`, `"DocumentID"`\>

Defined in: [types/branded.ts:87](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/types/branded.ts#L87)

Document ID

Format: Document reference (e.g., "A9-2024/0123")
Source: European Parliament Open Data Portal

## Example

```typescript
const docId: DocumentID = createDocumentID("A9-2024/0123");
const document = await getDocument(docId);
```
