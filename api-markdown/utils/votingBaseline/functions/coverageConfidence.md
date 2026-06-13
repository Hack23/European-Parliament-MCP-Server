[**European Parliament MCP Server API v1.3.20**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/votingBaseline](../README.md) / coverageConfidence

# Function: coverageConfidence()

> **coverageConfidence**(`rcvVotesInspected`): `"HIGH"` \| `"MEDIUM"` \| `"LOW"`

Defined in: [utils/votingBaseline.ts:521](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L521)

Resolve confidence based on the number of RCV votes inspected for the MEP.

- `HIGH` when `≥50` votes,
- `MEDIUM` when `10–49` votes,
- `LOW` when `<10` votes.

## Parameters

### rcvVotesInspected

`number`

## Returns

`"HIGH"` \| `"MEDIUM"` \| `"LOW"`
