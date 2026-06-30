[**European Parliament MCP Server API v1.3.31**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/detectVotingAnomalies](../README.md) / handleDetectVotingAnomalies

# Function: handleDetectVotingAnomalies()

> **handleDetectVotingAnomalies**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/detectVotingAnomalies.ts:1039](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/detectVotingAnomalies.ts#L1039)

Handles the `detect_voting_anomalies` MCP tool request.

See file-level JSDoc for methodology details. Each anomaly carries
`evidenceVoteIds` referencing the contributing DOCEO RCV records.

## Parameters

### args

`unknown`

Raw tool arguments, validated against [DetectVotingAnomaliesSchema](../../../schemas/ep/analysis/variables/DetectVotingAnomaliesSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing detected anomalies with evidence vote IDs

## Throws

If `args` fails schema validation or the EP API is unreachable.

## Security

Input validated with Zod. Audit logs record only `mepId` and
  sanitised counts (no MEP names or vote contents).

## Since

0.8.0
