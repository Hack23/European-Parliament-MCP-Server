[**European Parliament MCP Server API v0.7.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [clients/ep/jsonLdHelpers](../README.md) / extractActivityDate

# Function: extractActivityDate()

> **extractActivityDate**(`activityDate`): `string`

Defined in: [clients/ep/jsonLdHelpers.ts:91](https://github.com/Hack23/European-Parliament-MCP-Server/blob/105c91e5b7fa3b947ea8c0ec39c75a48519382f4/src/clients/ep/jsonLdHelpers.ts#L91)

Extracts a date from activity-specific EP API date formats.

## Parameters

### activityDate

`unknown`

Raw activity_date field from EP API

## Returns

`string`

`YYYY-MM-DD` string, or empty string
