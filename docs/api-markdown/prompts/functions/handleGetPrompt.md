[**European Parliament MCP Server API v0.8.0**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / [prompts](../README.md) / handleGetPrompt

# Function: handleGetPrompt()

> **handleGetPrompt**(`name`, `args?`): [`PromptResult`](../interfaces/PromptResult.md)

Defined in: [prompts/index.ts:504](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/prompts/index.ts#L504)

Handle GetPrompt request

## Parameters

### name

`string`

Prompt name

### args?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

Prompt arguments

## Returns

[`PromptResult`](../interfaces/PromptResult.md)

Prompt result with messages

## Throws

Error if prompt name is unknown
