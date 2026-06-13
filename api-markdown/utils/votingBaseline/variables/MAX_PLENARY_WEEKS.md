[**European Parliament MCP Server API v1.3.21**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/votingBaseline](../README.md) / MAX\_PLENARY\_WEEKS

# Variable: MAX\_PLENARY\_WEEKS

> `const` **MAX\_PLENARY\_WEEKS**: `26` = `26`

Defined in: [utils/votingBaseline.ts:535](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/votingBaseline.ts#L535)

Hard cap on the number of plenary weeks enumerated by [iteratePlenaryWeeks](../functions/iteratePlenaryWeeks.md)
— ~6 months of weekly fan-out per request. The MAX\_PLENARY\_WEEKSth
week is the last one returned. Truncation is not implied by length alone:
callers should combine `length === MAX_PLENARY_WEEKS` with an input-window
overflow check (for example, detectWindowTruncation in
`detectVotingAnomalies`).
