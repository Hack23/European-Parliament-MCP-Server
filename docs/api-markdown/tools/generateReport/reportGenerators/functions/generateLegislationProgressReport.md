[**European Parliament MCP Server API v0.6.2**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/generateReport/reportGenerators](../README.md) / generateLegislationProgressReport

# Function: generateLegislationProgressReport()

> **generateLegislationProgressReport**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Report`](../../types/interfaces/Report.md)\>

Defined in: [tools/generateReport/reportGenerators.ts:167](https://github.com/Hack23/European-Parliament-MCP-Server/blob/1b58bf4525fa4fe723d0cfbcb044e18579c85118/src/tools/generateReport/reportGenerators.ts#L167)

Generate legislation progress report
Cyclomatic complexity: 1

## Parameters

### params

#### reportType

`"MEP_ACTIVITY"` \| `"COMMITTEE_PERFORMANCE"` \| `"VOTING_STATISTICS"` \| `"LEGISLATION_PROGRESS"` = `...`

#### dateFrom?

`string` = `...`

#### dateTo?

`string` = `...`

#### subjectId?

`string` = `...`

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Report`](../../types/interfaces/Report.md)\>
