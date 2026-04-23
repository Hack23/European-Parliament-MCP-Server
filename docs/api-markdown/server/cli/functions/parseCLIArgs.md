[**European Parliament MCP Server API v1.2.13**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [server/cli](../README.md) / parseCLIArgs

# Function: parseCLIArgs()

> **parseCLIArgs**(`argv`): [`CLIOptions`](../../types/interfaces/CLIOptions.md)

Defined in: [server/cli.ts:175](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/cli.ts#L175)

Parse an array of CLI argument strings into a typed [CLIOptions](../../types/interfaces/CLIOptions.md) object.

Supports the canonical flags `--help` / `-h`, `--version` / `-v`,
`--health`, and the `--timeout <ms>` value flag.

## Parameters

### argv

`string`[]

Array of raw argument strings (typically `process.argv.slice(2)`)

## Returns

[`CLIOptions`](../../types/interfaces/CLIOptions.md)

Typed CLI options with boolean flags and optional timeout

## Examples

```typescript
const opts = parseCLIArgs(['--health']);
if (opts.health) showHealth();
```

```typescript
const opts = parseCLIArgs(['--timeout', '90000']);
// opts.timeout === 90000
```
