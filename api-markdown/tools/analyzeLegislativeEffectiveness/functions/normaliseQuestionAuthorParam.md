[**European Parliament MCP Server API v1.3.16**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/analyzeLegislativeEffectiveness](../README.md) / normaliseQuestionAuthorParam

# Function: normaliseQuestionAuthorParam()

> **normaliseQuestionAuthorParam**(`subjectId`): `string`

Defined in: [tools/analyzeLegislativeEffectiveness.ts:550](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/analyzeLegislativeEffectiveness.ts#L550)

**`Internal`**

Normalise an MEP identifier into the bare token that matches the EP API's
`q.author` field for `/parliamentary-questions` (typically `person/{id}`).

The question client applies the `author` filter client-side via
case-insensitive substring match against `q.author`, so the safest
portable token is the trailing non-empty segment after the last `/` or
`-` delimiter:

 - `person/124810` → `124810`
 - `MEP-124810`    → `124810`
 - `124810`        → `124810`

Returning the bare id makes the filter robust to whichever upstream
formatting the EP API uses (`person/{id}` is the documented shape).
Trailing delimiters are tolerated — the function returns the original
trimmed input rather than an empty string.

## Parameters

### subjectId

`string`

## Returns

`string`
