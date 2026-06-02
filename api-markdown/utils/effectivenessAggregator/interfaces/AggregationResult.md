[**European Parliament MCP Server API v1.3.14**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [utils/effectivenessAggregator](../README.md) / AggregationResult

# Interface: AggregationResult

Defined in: [utils/effectivenessAggregator.ts:73](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L73)

Combined aggregator result.

## Properties

### attributedProcedureCount

> **attributedProcedureCount**: `number`

Defined in: [utils/effectivenessAggregator.ts:77](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L77)

Number of distinct procedures attributed to the subject.

***

### attributions

> **attributions**: [`AggregatedAttributions`](AggregatedAttributions.md)

Defined in: [utils/effectivenessAggregator.ts:75](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L75)

***

### metrics

> **metrics**: [`LegislativeMetrics`](LegislativeMetrics.md)

Defined in: [utils/effectivenessAggregator.ts:74](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L74)

***

### proceduresWithAdoptedText

> **proceduresWithAdoptedText**: `number`

Defined in: [utils/effectivenessAggregator.ts:79](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/utils/effectivenessAggregator.ts#L79)

Number of attributed procedures with a matching adopted text.
