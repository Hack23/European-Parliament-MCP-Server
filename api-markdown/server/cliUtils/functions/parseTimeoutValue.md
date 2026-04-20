[**European Parliament MCP Server API v1.2.10**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [server/cliUtils](../README.md) / parseTimeoutValue

# Function: parseTimeoutValue()

> **parseTimeoutValue**(`value`): `number` \| `undefined`

Defined in: [server/cliUtils.ts:40](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/cliUtils.ts#L40)

Parse and validate a timeout string value.

Accepts only strings consisting entirely of digits (`/^\d+$/`), then
verifies the resulting integer is positive and finite.

## Parameters

### value

`string` \| `undefined`

Raw string value (e.g. from `--timeout` argument or env var)

## Returns

`number` \| `undefined`

Parsed positive integer, or `undefined` if invalid

## Example

```typescript
parseTimeoutValue('90000'); // 90000
parseTimeoutValue('10s');   // undefined (non-digit characters)
parseTimeoutValue('0');     // undefined (not positive)
parseTimeoutValue('');      // undefined
```
