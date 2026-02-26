[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [server/types](../README.md) / CLIOptions

# Interface: CLIOptions

Defined in: [server/types.ts:71](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/server/types.ts#L71)

Parsed command-line options for the MCP server binary.

All fields are optional: absent fields indicate the flag was not
provided on the command line.

## Properties

### health?

> `optional` **health**: `boolean`

Defined in: [server/types.ts:77](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/server/types.ts#L77)

Show health-check / diagnostics JSON and exit

***

### help?

> `optional` **help**: `boolean`

Defined in: [server/types.ts:73](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/server/types.ts#L73)

Show usage / help text and exit

***

### version?

> `optional` **version**: `boolean`

Defined in: [server/types.ts:75](https://github.com/Hack23/European-Parliament-MCP-Server/blob/ac50c2f3a6764473ca3046e882b8c154984c496f/src/server/types.ts#L75)

Show version string and exit
