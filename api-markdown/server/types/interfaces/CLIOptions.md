[**European Parliament MCP Server API v1.3.31**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [server/types](../README.md) / CLIOptions

# Interface: CLIOptions

Defined in: [server/types.ts:63](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/types.ts#L63)

Parsed command-line options for the MCP server binary.

All fields are optional: absent fields indicate the flag was not
provided on the command line.

## Properties

### health?

> `optional` **health?**: `boolean`

Defined in: [server/types.ts:69](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/types.ts#L69)

Show health-check / diagnostics JSON and exit

***

### help?

> `optional` **help?**: `boolean`

Defined in: [server/types.ts:65](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/types.ts#L65)

Show usage / help text and exit

***

### timeout?

> `optional` **timeout?**: `number`

Defined in: [server/types.ts:71](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/types.ts#L71)

Override request timeout in milliseconds (takes precedence over EP_REQUEST_TIMEOUT_MS env var)

***

### version?

> `optional` **version?**: `boolean`

Defined in: [server/types.ts:67](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/types.ts#L67)

Show version string and exit
