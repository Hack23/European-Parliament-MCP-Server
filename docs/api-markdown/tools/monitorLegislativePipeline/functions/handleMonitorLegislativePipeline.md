[**European Parliament MCP Server API v0.8.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/monitorLegislativePipeline](../README.md) / handleMonitorLegislativePipeline

# Function: handleMonitorLegislativePipeline()

> **handleMonitorLegislativePipeline**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `content`: `object`[]; \}\>

Defined in: [tools/monitorLegislativePipeline.ts:244](https://github.com/Hack23/European-Parliament-MCP-Server/blob/2c9fab6611e5f06de66689cdad4e4fea6098930d/src/tools/monitorLegislativePipeline.ts#L244)

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
