[**European Parliament MCP Server API v1.2.5**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/errorClassifier](../README.md) / classifyError

# Function: classifyError()

> **classifyError**(`error`): [`ErrorClassification`](../interfaces/ErrorClassification.md)

Defined in: [tools/shared/errorClassifier.ts:67](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/errorClassifier.ts#L67)

Classify an error into a structured error code, category, and retryability.

Priority:
1. If the error is a `ToolError` with explicit `errorCode` already set, use it.
   Retryability is derived from the error code's standard meaning (via
   retryableForCode) rather than `ToolError.isRetryable`, ensuring
   consistency even when callers set `errorCode` without a matching
   `isRetryable`. **Note:** `ToolError.isRetryable` is ignored when
   `errorCode` is present.
2. Inspect the error and its cause chain for HTTP status codes (for example
   from `APIError`) and classify from the resolved status.
3. If the error is a `ToolError` without an explicit `errorCode`, apply
   heuristic classification, including operation-based mappings
   (`validateInput` → `INVALID_PARAMS`) and message-based timeout detection.
4. If the error is a `ZodError` (validation failure), classify as
   `INVALID_PARAMS` / `CLIENT_ERROR`.
5. If the error is a plain `Error`, apply message-based timeout detection
   (`timed out` → `UPSTREAM_TIMEOUT`).
6. Default to `INTERNAL_ERROR`.

## Parameters

### error

`unknown`

The caught error value

## Returns

[`ErrorClassification`](../interfaces/ErrorClassification.md)

Structured classification with code, category, httpStatus, and retryable flag
