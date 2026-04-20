[**European Parliament MCP Server API v1.2.10**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/feedUtils](../README.md) / buildFeedSuccessResponse

# Function: buildFeedSuccessResponse()

> **buildFeedSuccessResponse**(`result`, `warnings?`): [`ToolResult`](../../types/interfaces/ToolResult.md)

Defined in: [tools/shared/feedUtils.ts:180](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/feedUtils.ts#L180)

Wrap a successful upstream feed result in the uniform envelope.

The original payload (typically `{ data, '@context' }`) is preserved
verbatim and augmented with the uniform contract fields:

- `status` is **derived** from `items.length` and warnings:
  - `"unavailable"` when `items.length === 0` (covers the
    "HTTP 200 + empty array" upstream case);
  - `"degraded"` when items are present **and** any
    `dataQualityWarnings` are present (either supplied via `result`
    or passed explicitly);
  - `"operational"` when items are present and no warnings.
- `data` is normalized so that, after JSON serialization, consumers
  reading the legacy `data` field always see an array with the same
  contents as `items` (structural equality across the wire, not
  referential identity).
- Existing `dataQualityWarnings` from `result` are preserved and
  merged with any explicitly-supplied warnings (rather than
  clobbered). When `status` is `"unavailable"`, the empty-feed
  reason is appended for backwards compatibility with consumers
  reading the legacy field.
- `reason` is set whenever `status !== "operational"`.

## Parameters

### result

`unknown`

Raw upstream response payload (may contain `data`,
                `@context`, and optionally `dataQualityWarnings`)

### warnings?

readonly `string`[] = `[]`

Optional extra data-quality warnings to merge into
                  the response.

## Returns

[`ToolResult`](../../types/interfaces/ToolResult.md)

MCP-compliant ToolResult containing the uniform envelope
