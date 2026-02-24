[**European Parliament MCP Server API v0.7.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getMEPs](../README.md) / handleGetMEPs

# Function: handleGetMEPs()

> **handleGetMEPs**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [tools/getMEPs.ts:46](https://github.com/Hack23/European-Parliament-MCP-Server/blob/b9df29e7535477dcc3eb0083d22c22c499f6176d/src/tools/getMEPs.ts#L46)

Get MEPs tool handler

Retrieves MEP data with filtering, validation, and GDPR-compliant response formatting.

**Intelligence Use Cases:** Filter by country for national delegation analysis, by group for
cohesion studies, by committee for policy domain expertise mapping.

**Business Use Cases:** Power stakeholder mapping products, political risk dashboards,
and MEP engagement tracking for corporate affairs teams.

**Marketing Use Cases:** Demo-ready endpoint for showcasing EP data access to potential
API consumers, journalists, and civic tech developers.

## Parameters

### args

`unknown`

Tool arguments

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

MCP tool result with MEP data

## Example

```json
{
  "country": "SE",
  "limit": 10
}
```
