[**European Parliament MCP Server API v1.3.22**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / utils/effectivenessAggregator

# utils/effectivenessAggregator

Legislative-effectiveness aggregator.

Pure helpers that turn the per-source EP API payloads consumed by
`analyze_legislative_effectiveness` into deterministic effectiveness metrics
keyed by a subject MEP. Kept side-effect-free so the tool handler can fan
out network calls under `Promise.allSettled`, then defer aggregation to a
single synchronous step that is easy to unit-test.

**Inputs:** raw `Procedure`, `AdoptedText`, `LegislativeDocument`, and
`ParliamentaryQuestion` arrays (already filtered to a date window upstream).

**Outputs:** [LegislativeMetrics](interfaces/LegislativeMetrics.md) — counts of reports authored,
opinions delivered, amendments tabled/adopted, questions asked, and the
derived legislative success rate.

ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege).

## Interfaces

- [AggregatedAttributions](interfaces/AggregatedAttributions.md)
- [AggregationResult](interfaces/AggregationResult.md)
- [AggregatorInputs](interfaces/AggregatorInputs.md)
- [LegislativeMetrics](interfaces/LegislativeMetrics.md)

## Functions

- [aggregateLegislativeEffectiveness](functions/aggregateLegislativeEffectiveness.md)
- [buildSubjectTokens](functions/buildSubjectTokens.md)
- [matchesMep](functions/matchesMep.md)
- [normaliseMepIdTokens](functions/normaliseMepIdTokens.md)
- [roundToTwoDecimals](functions/roundToTwoDecimals.md)
