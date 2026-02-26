[**European Parliament MCP Server API v0.8.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getMEPs](../README.md) / handleGetMEPs

# Function: handleGetMEPs()

> **handleGetMEPs**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getMEPs.ts:48](https://github.com/Hack23/European-Parliament-MCP-Server/blob/67dbd67a8f5629591a17b9785bfa0977f7023afb/src/tools/getMEPs.ts#L48)

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

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result with MEP data

## Example

```json
{
  "country": "SE",
  "limit": 10
}
```
