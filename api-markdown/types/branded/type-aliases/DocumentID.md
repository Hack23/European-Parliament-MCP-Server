[**European Parliament MCP Server API v0.9.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [types/branded](../README.md) / DocumentID

# Type Alias: DocumentID

> **DocumentID** = [`Brand`](Brand.md)\<`string`, `"DocumentID"`\>

Defined in: [types/branded.ts:87](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/branded.ts#L87)

Document ID

Format: Document reference (e.g., "A9-2024/0123")
Source: European Parliament Open Data Portal

## Example

```typescript
const docId: DocumentID = createDocumentID("A9-2024/0123");
const document = await getDocument(docId);
```
