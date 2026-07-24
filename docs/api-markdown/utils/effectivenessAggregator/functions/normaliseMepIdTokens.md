[**European Parliament MCP Server API v1.4.5**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/effectivenessAggregator](../README.md) / normaliseMepIdTokens

# Function: normaliseMepIdTokens()

> **normaliseMepIdTokens**(`id`): `string`[]

Defined in: [utils/effectivenessAggregator.ts:96](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L96)

**`Internal`**

Strip the `person/` prefix and surrounding whitespace from a MEP identifier.

The EP API returns MEP ids in several forms (`person/124936`, `124936`,
`MEP-124936`). We normalise to the bare numeric token plus the original
string so substring matches against author fields succeed regardless of the
representation chosen by a given endpoint.

## Parameters

### id

`string`

## Returns

`string`[]
