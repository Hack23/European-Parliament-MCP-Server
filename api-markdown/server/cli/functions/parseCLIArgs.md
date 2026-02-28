[**European Parliament MCP Server API v1.0.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [server/cli](../README.md) / parseCLIArgs

# Function: parseCLIArgs()

> **parseCLIArgs**(`argv`): [`CLIOptions`](../../types/interfaces/CLIOptions.md)

Defined in: [server/cli.ts:161](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/cli.ts#L161)

Parse an array of CLI argument strings into a typed [CLIOptions](../../types/interfaces/CLIOptions.md) object.

Supports the canonical flags `--help` / `-h`, `--version` / `-v`,
and `--health`.

## Parameters

### argv

`string`[]

Array of raw argument strings (typically `process.argv.slice(2)`)

## Returns

[`CLIOptions`](../../types/interfaces/CLIOptions.md)

Typed CLI options with boolean flags

## Example

```typescript
const opts = parseCLIArgs(['--health']);
if (opts.health) showHealth();
```
