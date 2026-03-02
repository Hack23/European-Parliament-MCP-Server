[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/auditSink](../README.md) / AuthToken

# Type Alias: AuthToken

> **AuthToken** = `string`

Defined in: [utils/auditSink.ts:78](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/auditSink.ts#L78)

Authorization token for privileged audit operations such as
`getLogs()` and `eraseByUser()`.

## Security

Must be kept secret; treat as a capability key.
