[**European Parliament MCP Server API v0.8.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [types/ep/branded](../README.md) / isSpeechID

# Function: isSpeechID()

> **isSpeechID**(`value`): `value is SpeechID`

Defined in: [types/ep/branded.ts:109](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/types/ep/branded.ts#L109)

Type guard: checks that a string looks like an EP speech ID.

Expected format: `"SPEECH-{term}-YYYY-MM-DD-NNN"` (e.g. `"SPEECH-9-2024-01-15-001"`).

## Parameters

### value

`string`

String to validate

## Returns

`value is SpeechID`
