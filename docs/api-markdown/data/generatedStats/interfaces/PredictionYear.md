[**European Parliament MCP Server API v1.1.0**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [data/generatedStats](../README.md) / PredictionYear

# Interface: PredictionYear

Defined in: [data/generatedStats.ts:376](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L376)

Predicted activity metrics for a future year.

Values are computed using average-based extrapolation from the 2021–2025
baseline, adjusted by parliamentary term cycle factors that model the
typical ramp-up → peak → decline pattern within each five-year term.

## Properties

### confidenceInterval

> **confidenceInterval**: `string`

Defined in: [data/generatedStats.ts:406](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L406)

Confidence interval string (e.g. '±12%')

***

### methodology

> **methodology**: `string`

Defined in: [data/generatedStats.ts:408](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L408)

Description of the prediction methodology for this year

***

### predictedAdoptedTexts

> **predictedAdoptedTexts**: `number`

Defined in: [data/generatedStats.ts:394](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L394)

Predicted adopted texts

***

### predictedCommitteeMeetings

> **predictedCommitteeMeetings**: `number`

Defined in: [data/generatedStats.ts:386](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L386)

Predicted committee meetings

***

### predictedDeclarations

> **predictedDeclarations**: `number`

Defined in: [data/generatedStats.ts:404](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L404)

Predicted declarations

***

### predictedDocuments

> **predictedDocuments**: `number`

Defined in: [data/generatedStats.ts:400](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L400)

Predicted documents

***

### predictedEvents

> **predictedEvents**: `number`

Defined in: [data/generatedStats.ts:398](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L398)

Predicted events

***

### predictedLegislativeActs

> **predictedLegislativeActs**: `number`

Defined in: [data/generatedStats.ts:382](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L382)

Predicted legislative acts adopted

***

### predictedMepTurnover

> **predictedMepTurnover**: `number`

Defined in: [data/generatedStats.ts:402](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L402)

Predicted MEP turnover

***

### predictedParliamentaryQuestions

> **predictedParliamentaryQuestions**: `number`

Defined in: [data/generatedStats.ts:388](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L388)

Predicted parliamentary questions

***

### predictedPlenarySessions

> **predictedPlenarySessions**: `number`

Defined in: [data/generatedStats.ts:380](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L380)

Predicted plenary sessions

***

### predictedProcedures

> **predictedProcedures**: `number`

Defined in: [data/generatedStats.ts:396](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L396)

Predicted procedures

***

### predictedResolutions

> **predictedResolutions**: `number`

Defined in: [data/generatedStats.ts:390](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L390)

Predicted resolutions

***

### predictedRollCallVotes

> **predictedRollCallVotes**: `number`

Defined in: [data/generatedStats.ts:384](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L384)

Predicted roll-call votes

***

### predictedSpeeches

> **predictedSpeeches**: `number`

Defined in: [data/generatedStats.ts:392](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L392)

Predicted speeches

***

### year

> **year**: `number`

Defined in: [data/generatedStats.ts:378](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/data/generatedStats.ts#L378)

Predicted calendar year (2026–2030)
