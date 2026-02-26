[**European Parliament MCP Server API v0.8.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [types/ep/branded](../README.md) / SpeechID

# Type Alias: SpeechID

> **SpeechID** = [`Brand`](../../../branded/type-aliases/Brand.md)\<`string`, `"SpeechID"`\>

Defined in: [types/ep/branded.ts:65](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/types/ep/branded.ts#L65)

Speech ID – identifies a plenary speech record.

Format: alphanumeric string issued by the EP API.

## Example

```typescript
const speechId: SpeechID = 'SPEECH-9-2024-01-15-001' as SpeechID;
```
