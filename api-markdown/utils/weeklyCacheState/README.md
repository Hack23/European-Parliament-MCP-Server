[**European Parliament MCP Server API v1.4.5**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / utils/weeklyCacheState

# utils/weeklyCacheState

Adaptive (incremental) weekly-cache loading primitives.

These helpers let the weekly cache generators resume from whatever detail
records were already fetched in a prior run instead of starting over every
time. They keep side effects explicit (state mutation is limited to the
caller-provided `details` map and `missingIds` set, and I/O is limited to
the injected `fetchDetail` callback), which keeps fetch orchestration
unit-testable without hitting the European Parliament Open Data API.

## Interfaces

- [DetailBatchOptions](interfaces/DetailBatchOptions.md)
- [DetailBatchResult](interfaces/DetailBatchResult.md)
- [IncrementalDetailState](interfaces/IncrementalDetailState.md)

## Functions

- [cacheDetail](functions/cacheDetail.md)
- [compactDetailMap](functions/compactDetailMap.md)
- [hasCachedDetail](functions/hasCachedDetail.md)
- [pruneMissingIds](functions/pruneMissingIds.md)
- [readIncrementalDetailState](functions/readIncrementalDetailState.md)
- [refreshDetailBatch](functions/refreshDetailBatch.md)
