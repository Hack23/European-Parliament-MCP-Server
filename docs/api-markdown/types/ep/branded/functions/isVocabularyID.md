[**European Parliament MCP Server API v0.8.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [types/ep/branded](../README.md) / isVocabularyID

# Function: isVocabularyID()

> **isVocabularyID**(`value`): `value is VocabularyID`

Defined in: [types/ep/branded.ts:123](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/types/ep/branded.ts#L123)

Type guard: checks that a string looks like an EP vocabulary ID.

Must be at least 3 characters, contain at least one alphanumeric character,
and consist only of letters, digits, hyphens, and underscores.

Example: `"eurovoc"`.

## Parameters

### value

`string`

String to validate

## Returns

`value is VocabularyID`
