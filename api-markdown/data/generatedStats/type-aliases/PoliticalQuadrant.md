[**European Parliament MCP Server API v1.3.27**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [data/generatedStats](../README.md) / PoliticalQuadrant

# Type Alias: PoliticalQuadrant

> **PoliticalQuadrant** = `"libertarianLeft"` \| `"libertarianRight"` \| `"authoritarianLeft"` \| `"authoritarianRight"`

Defined in: [data/generatedStats.ts:145](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L145)

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
