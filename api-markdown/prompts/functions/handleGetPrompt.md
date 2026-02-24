[**European Parliament MCP Server API v0.7.2**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / [prompts](../README.md) / handleGetPrompt

# Function: handleGetPrompt()

> **handleGetPrompt**(`name`, `args?`): `PromptResult`

Defined in: [prompts/index.ts:393](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/prompts/index.ts#L393)

Handle GetPrompt request

## Parameters

### name

`string`

Prompt name

### args?

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

Prompt arguments

## Returns

`PromptResult`

Prompt result with messages

## Throws

Error if prompt name is unknown
