[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [server/cli](../README.md) / parseCLIArgs

# Function: parseCLIArgs()

> **parseCLIArgs**(`argv`): [`CLIOptions`](../../types/interfaces/CLIOptions.md)

Defined in: [server/cli.ts:161](https://github.com/Hack23/European-Parliament-MCP-Server/blob/006b62840b740489118388cc87b431ee92a42c24/src/server/cli.ts#L161)

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
