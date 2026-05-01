[**European Parliament MCP Server API v1.2.19**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [services/FeedHealthTracker](../README.md) / AvailabilityLevel

# Type Alias: AvailabilityLevel

> **AvailabilityLevel** = `"Full"` \| `"Degraded"` \| `"Sparse"` \| `"Unavailable"` \| `"Unknown"`

Defined in: [services/FeedHealthTracker.ts:52](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/services/FeedHealthTracker.ts#L52)

Overall feed availability level.

| Level        | Condition                                | Description |
|--------------|------------------------------------------|-------------|
| Full         | ≥10/13 ok                                | Normal operation |
| Degraded     | 5–9/13 ok                                | Reduced data quality expected |
| Sparse       | 1–4/13 ok                                | Minimal data, analysis-only mode likely |
| Unavailable  | 0/13 ok AND ≥1 probed feed errored       | All probed feeds failing |
| Unknown      | 0/13 ok AND 0 errors (no probes yet)     | Cache is empty — status cannot be determined without a live probe |

`Unknown` is distinct from `Unavailable` to prevent consumers from
interpreting "no cached data" as "feeds are down". See issue #1.
