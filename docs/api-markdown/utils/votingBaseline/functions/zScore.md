[**European Parliament MCP Server API v1.3.20**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/votingBaseline](../README.md) / zScore

# Function: zScore()

> **zScore**(`value`, `baseline`): `number`

Defined in: [utils/votingBaseline.ts:402](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L402)

Single-sample z-score with a guard for zero variance.

When `stdev` is zero (single data point or constant series) the z-score is
undefined; this helper returns `0` so callers can treat constant series as
"no anomaly" without special-casing.

## Parameters

### value

`number`

### baseline

[`BaselineSummary`](../interfaces/BaselineSummary.md)

## Returns

`number`
