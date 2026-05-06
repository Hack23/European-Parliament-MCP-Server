[**European Parliament MCP Server API v1.3.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/getLatestVotes](../README.md) / handleGetLatestVotes

# Function: handleGetLatestVotes()

> **handleGetLatestVotes**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/getLatestVotes.ts:109](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/getLatestVotes.ts#L109)

Handles the get_latest_votes MCP tool request.

Fetches the latest plenary vote data from the EP DOCEO XML system,
providing near-real-time access to roll-call votes and vote results.
This data source is fresher than the EP Open Data API which has a
multi-week publication delay.

## Parameters

### args

`unknown`

Raw tool arguments, validated against GetLatestVotesSchema

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result with latest vote records

## Example

```typescript
// Get votes from the most recent plenary week
const result = await handleGetLatestVotes({});

// Get votes for a specific date
const result = await handleGetLatestVotes({ date: '2026-04-27' });

// Get a specific plenary week without individual MEP positions
const result = await handleGetLatestVotes({
  weekStart: '2026-04-27',
  includeIndividualVotes: false
});
```
