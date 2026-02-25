[**European Parliament MCP Server API v0.8.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [types/ep/branded](../README.md) / SpeechID

# Type Alias: SpeechID

> **SpeechID** = [`Brand`](../../../branded/type-aliases/Brand.md)\<`string`, `"SpeechID"`\>

Defined in: [types/ep/branded.ts:65](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/types/ep/branded.ts#L65)

Speech ID – identifies a plenary speech record.

Format: alphanumeric string issued by the EP API.

## Example

```typescript
const speechId: SpeechID = 'SPEECH-9-2024-01-15-001' as SpeechID;
```
