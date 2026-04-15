[**European Parliament MCP Server API v1.2.7**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [services/FeedHealthTracker](../README.md) / AvailabilityLevel

# Type Alias: AvailabilityLevel

> **AvailabilityLevel** = `"Full"` \| `"Degraded"` \| `"Sparse"` \| `"Unavailable"`

Defined in: [services/FeedHealthTracker.ts:48](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L48)

Overall feed availability level.

| Level        | Condition   | Description |
|--------------|-------------|-------------|
| Full         | ≥10/13 ok   | Normal operation |
| Degraded     | 5–9/13 ok   | Reduced data quality expected |
| Sparse       | 1–4/13 ok   | Minimal data, analysis-only mode likely |
| Unavailable  | 0/13 ok     | No EP feed data available |
