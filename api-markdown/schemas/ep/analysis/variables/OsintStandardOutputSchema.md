[**European Parliament MCP Server API v0.9.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [schemas/ep/analysis](../README.md) / OsintStandardOutputSchema

# Variable: OsintStandardOutputSchema

> `const` **OsintStandardOutputSchema**: `ZodObject`\<\{ `confidenceLevel`: `ZodEnum`\<\{ `HIGH`: `"HIGH"`; `LOW`: `"LOW"`; `MEDIUM`: `"MEDIUM"`; \}\>; `dataFreshness`: `ZodString`; `methodology`: `ZodString`; `sourceAttribution`: `ZodString`; \}, `$strip`\>

Defined in: [schemas/ep/analysis.ts:176](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/schemas/ep/analysis.ts#L176)

Standard OSINT output fields Zod schema.

Validates the common output fields present on every OSINT intelligence tool
response: confidenceLevel, methodology, dataFreshness, and sourceAttribution.

**Confidence Level Criteria:**
- `HIGH`   — Full EP API data (voting statistics, complete membership)
- `MEDIUM` — Partial EP API data; results are indicative
- `LOW`    — Insufficient data; treat output with caution
