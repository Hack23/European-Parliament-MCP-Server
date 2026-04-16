[**European Parliament MCP Server API v1.2.8**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / services/FeedHealthTracker

# services/FeedHealthTracker

Feed Health Tracker Service

Tracks the outcome of feed tool invocations to provide
cached health status without making upstream API calls.

The tracker is a module-level singleton that records success/error
outcomes for each feed tool call. The `get_server_health` tool
reads from this tracker to report feed availability.

ISMS Policy: MO-001 (Monitoring and Alerting), PE-001 (Performance Standards)

## Classes

- [FeedHealthTracker](classes/FeedHealthTracker.md)

## Interfaces

- [FeedAvailability](interfaces/FeedAvailability.md)
- [FeedStatus](interfaces/FeedStatus.md)

## Type Aliases

- [AvailabilityLevel](type-aliases/AvailabilityLevel.md)

## Variables

- [FEED\_TOOL\_NAMES](variables/FEED_TOOL_NAMES.md)
- [feedHealthTracker](variables/feedHealthTracker.md)
