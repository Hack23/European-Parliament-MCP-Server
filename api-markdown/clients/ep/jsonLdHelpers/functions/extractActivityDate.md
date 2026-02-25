[**European Parliament MCP Server API v0.8.0**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/jsonLdHelpers](../README.md) / extractActivityDate

# Function: extractActivityDate()

> **extractActivityDate**(`activityDate`): `string`

Defined in: [clients/ep/jsonLdHelpers.ts:91](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/clients/ep/jsonLdHelpers.ts#L91)

Extracts a date from activity-specific EP API date formats.

## Parameters

### activityDate

`unknown`

Raw activity_date field from EP API

## Returns

`string`

`YYYY-MM-DD` string, or empty string
