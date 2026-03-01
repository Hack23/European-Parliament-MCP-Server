[**European Parliament MCP Server API v1.0.1**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/shared/paramBuilder](../README.md) / buildApiParams

# Function: buildApiParams()

> **buildApiParams**\<`T`\>(`params`, `mapping`): [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string` \| `number` \| `boolean`\>

Defined in: [tools/shared/paramBuilder.ts:34](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/shared/paramBuilder.ts#L34)

Builds an API parameter object by mapping tool-parameter keys to API parameter keys,
including only entries whose source value is a primitive `string`, `number`, or `boolean`.

Falsy-but-valid primitive values (`''`, `0`, `false`) **are** preserved so that callers can
explicitly send them to the downstream API. All other value types (including `undefined`,
`null`, objects, arrays, functions, symbols, etc.) are skipped and **not** forwarded.

## Type Parameters

### T

`T` *extends* [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

## Parameters

### params

`T`

The validated tool-parameter object (e.g. the output of a Zod parse).

### mapping

readonly `object`[]

A read-only array of `{ from, to }` pairs describing how each
  tool-parameter key maps to the corresponding API query-parameter key.

## Returns

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string` \| `number` \| `boolean`\>

A new `Record<string, string | number | boolean>` containing only the
  entries that were present in `params`.

## Example

```typescript
const apiParams = buildApiParams(params, [
  { from: 'country', to: 'country-of-representation' },
  { from: 'group',   to: 'political-group' },
]);
// If params.country === 'SE' and params.group === undefined:
// => { 'country-of-representation': 'SE' }
```
