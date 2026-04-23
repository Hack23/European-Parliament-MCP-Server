[**European Parliament MCP Server API v1.2.12**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [server/cli](../README.md) / showHealth

# Function: showHealth()

> **showHealth**(`container?`): `void`

Defined in: [server/cli.ts:106](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/server/cli.ts#L106)

Display health check / diagnostics.

Combines a static capability report with a dynamic health snapshot
produced by [HealthService](../../../services/HealthService/classes/HealthService.md).

When called without a `container`, a fresh [DIContainer](../../../di/container/classes/DIContainer.md) is created
via [createDefaultContainer](../../../di/container/functions/createDefaultContainer.md). Metrics and rate-limiter state will
reflect a new process baseline (useful for CLI `--health` diagnostics).
Pass a live container to report actual runtime state from an active server.

## Parameters

### container?

[`DIContainer`](../../../di/container/classes/DIContainer.md)

Optional DI container to resolve services from.
  Defaults to a new container created by [createDefaultContainer](../../../di/container/functions/createDefaultContainer.md).

## Returns

`void`
