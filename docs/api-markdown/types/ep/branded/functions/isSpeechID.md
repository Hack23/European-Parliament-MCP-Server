[**European Parliament MCP Server API v0.9.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [types/ep/branded](../README.md) / isSpeechID

# Function: isSpeechID()

> **isSpeechID**(`value`): `value is SpeechID`

Defined in: [types/ep/branded.ts:109](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/types/ep/branded.ts#L109)

Type guard: checks that a string looks like an EP speech ID.

Expected format: `"SPEECH-{term}-YYYY-MM-DD-NNN"` (e.g. `"SPEECH-9-2024-01-15-001"`).

## Parameters

### value

`string`

String to validate

## Returns

`value is SpeechID`
