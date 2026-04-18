[**European Parliament MCP Server API v1.2.9**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/transformers](../README.md) / transformCorporateBody

# Function: transformCorporateBody()

> **transformCorporateBody**(`apiData`): [`Committee`](../../../../types/ep/committee/interfaces/Committee.md)

Defined in: [clients/ep/transformers.ts:263](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/clients/ep/transformers.ts#L263)

Transforms EP API corporate-body data to internal [Committee](../../../../types/ep/committee/interfaces/Committee.md) format.

The real EP API returns `label` as a short abbreviation (e.g. "ENVI") while
`prefLabel` contains the full multilingual committee name.  We therefore
prefer `prefLabel` → `altLabel` → `label` for the display name, and derive
the abbreviation from `label` (always a short code in real responses) with
`notation` as a higher-priority override when present.

Cyclomatic complexity: 6

## Parameters

### apiData

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

## Returns

[`Committee`](../../../../types/ep/committee/interfaces/Committee.md)
