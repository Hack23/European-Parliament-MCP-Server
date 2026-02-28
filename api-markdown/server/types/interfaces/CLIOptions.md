[**European Parliament MCP Server API v0.9.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [server/types](../README.md) / CLIOptions

# Interface: CLIOptions

Defined in: [server/types.ts:70](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/types.ts#L70)

Parsed command-line options for the MCP server binary.

All fields are optional: absent fields indicate the flag was not
provided on the command line.

## Properties

### health?

> `optional` **health**: `boolean`

Defined in: [server/types.ts:76](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/types.ts#L76)

Show health-check / diagnostics JSON and exit

***

### help?

> `optional` **help**: `boolean`

Defined in: [server/types.ts:72](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/types.ts#L72)

Show usage / help text and exit

***

### version?

> `optional` **version**: `boolean`

Defined in: [server/types.ts:74](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/types.ts#L74)

Show version string and exit
