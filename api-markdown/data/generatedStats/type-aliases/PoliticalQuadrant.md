[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [data/generatedStats](../README.md) / PoliticalQuadrant

# Type Alias: PoliticalQuadrant

> **PoliticalQuadrant** = `"libertarianLeft"` \| `"libertarianRight"` \| `"authoritarianLeft"` \| `"authoritarianRight"`

Defined in: [data/generatedStats.ts:161](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L161)

Political compass quadrant (2D: economic × social axes).

```
             LIBERTARIAN
         ┌───────┬───────┐
         │ Lib-  │ Lib-  │
  LEFT   │ Left  │ Right │  RIGHT
economic │       │       │ economic
         ├───────┼───────┤
         │ Auth- │ Auth- │
         │ Left  │ Right │
         └───────┴───────┘
            AUTHORITARIAN
```
