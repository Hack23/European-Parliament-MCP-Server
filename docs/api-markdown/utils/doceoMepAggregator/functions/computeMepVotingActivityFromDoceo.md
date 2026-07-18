[**European Parliament MCP Server API v1.4.1**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/doceoMepAggregator](../README.md) / computeMepVotingActivityFromDoceo

# Function: computeMepVotingActivityFromDoceo()

> **computeMepVotingActivityFromDoceo**(`mepId`, `options?`): `Promise`\<[`DoceoMepAggregateResult`](../interfaces/DoceoMepAggregateResult.md) \| `null`\>

Defined in: [utils/doceoMepAggregator.ts:294](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/doceoMepAggregator.ts#L294)

Compute per-MEP voting activity stats from the EP DOCEO XML source.

Fetches the latest plenary-week RCV records via `doceoClient.getLatestVotes`
and aggregates the MEP's individual vote positions. Returns `null` when the
DOCEO call fails (timeout, network, parse error) so the caller can fall back
to placeholder data and emit a `dataQualityWarning`.

## Parameters

### mepId

`string`

EP MEP identifier (e.g. `'197558'`).

### options?

[`ComputeMepVotingActivityOptions`](../interfaces/ComputeMepVotingActivityOptions.md) = `{}`

Optional date range, political group, timeout and limit overrides.

## Returns

`Promise`\<[`DoceoMepAggregateResult`](../interfaces/DoceoMepAggregateResult.md) \| `null`\>

Aggregate result or `null` if DOCEO data is unavailable.

## Security

Errors are audit-logged via `auditLogger.logError(
  'doceo_mep_aggregator.fetch', ...)`. Only `mepId` is logged (no PII).

## Example

```typescript
const result = await computeMepVotingActivityFromDoceo('197558', {
  dateFrom: '2026-01-01',
  dateTo: '2026-12-31',
  politicalGroup: 'EPP',
});
if (result !== null) {
  console.log(result.stats.totalVotes, result.stats.loyaltyScore);
}
```
