[**European Parliament MCP Server API v1.3.31**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/auditLogger](../README.md) / LogLevel

# Enumeration: LogLevel

Defined in: [utils/auditLogger.ts:66](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L66)

Typed log levels for structured audit events.

| Level   | Use case |
|---------|----------|
| `DEBUG` | Verbose trace information (dev only) |
| `INFO`  | Normal data-access events |
| `WARN`  | Recoverable anomalies |
| `ERROR` | Failed operations |

## Enumeration Members

### DEBUG

> **DEBUG**: `"DEBUG"`

Defined in: [utils/auditLogger.ts:68](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L68)

Verbose trace information for development and debugging only.

***

### ERROR

> **ERROR**: `"ERROR"`

Defined in: [utils/auditLogger.ts:74](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L74)

Failed operations that prevented the requested action.

***

### INFO

> **INFO**: `"INFO"`

Defined in: [utils/auditLogger.ts:70](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L70)

Normal data-access and tool-invocation events (default sink level).

***

### WARN

> **WARN**: `"WARN"`

Defined in: [utils/auditLogger.ts:72](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditLogger.ts#L72)

Recoverable anomalies — degraded functionality but no failure.
