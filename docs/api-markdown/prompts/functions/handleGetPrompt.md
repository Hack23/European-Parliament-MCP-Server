[**European Parliament MCP Server API v0.6.2**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / [prompts](../README.md) / handleGetPrompt

# Function: handleGetPrompt()

> **handleGetPrompt**(`name`, `args?`): `PromptResult`

Defined in: [prompts/index.ts:393](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/prompts/index.ts#L393)

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
