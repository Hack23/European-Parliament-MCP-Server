[**European Parliament MCP Server API v0.8.1**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / [prompts](../README.md) / handleGetPrompt

# Function: handleGetPrompt()

> **handleGetPrompt**(`name`, `args?`): [`PromptResult`](../interfaces/PromptResult.md)

Defined in: [prompts/index.ts:504](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/prompts/index.ts#L504)

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
