[**European Parliament MCP Server API v1.2.9**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [server/types](../README.md) / CLIOptions

# Interface: CLIOptions

Defined in: [server/types.ts:71](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/types.ts#L71)

Parsed command-line options for the MCP server binary.

All fields are optional: absent fields indicate the flag was not
provided on the command line.

## Properties

### health?

> `optional` **health?**: `boolean`

Defined in: [server/types.ts:77](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/types.ts#L77)

Show health-check / diagnostics JSON and exit

***

### help?

> `optional` **help?**: `boolean`

Defined in: [server/types.ts:73](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/types.ts#L73)

Show usage / help text and exit

***

### timeout?

> `optional` **timeout?**: `number`

Defined in: [server/types.ts:79](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/types.ts#L79)

Override request timeout in milliseconds (takes precedence over EP_REQUEST_TIMEOUT_MS env var)

***

### version?

> `optional` **version?**: `boolean`

Defined in: [server/types.ts:75](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/types.ts#L75)

Show version string and exit
