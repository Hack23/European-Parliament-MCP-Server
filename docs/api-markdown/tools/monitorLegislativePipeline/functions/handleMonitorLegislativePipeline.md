[**European Parliament MCP Server API v0.8.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/monitorLegislativePipeline](../README.md) / handleMonitorLegislativePipeline

# Function: handleMonitorLegislativePipeline()

> **handleMonitorLegislativePipeline**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [tools/monitorLegislativePipeline.ts:244](https://github.com/Hack23/European-Parliament-MCP-Server/blob/3003b577f21d3734cd23b5505028a9329df22ad2/src/tools/monitorLegislativePipeline.ts#L244)

Monitor legislative pipeline tool handler.

Fetches real procedures from the EP API and computes pipeline
health metrics. All procedure data comes from the API—computed
attributes (health score, velocity, bottleneck risk) are derived
from real dates and stages.

## Parameters

### args

`unknown`

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>
