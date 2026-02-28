[**European Parliament MCP Server API v0.9.2**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/correlateIntelligence](../README.md) / handleCorrelateIntelligence

# Function: handleCorrelateIntelligence()

> **handleCorrelateIntelligence**(`args`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

Defined in: [tools/correlateIntelligence.ts:581](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/correlateIntelligence.ts#L581)

Handles the `correlate_intelligence` MCP tool request.

Orchestrates six OSINT tools — `assess_mep_influence`,
`detect_voting_anomalies`, `early_warning_system`,
`analyze_coalition_dynamics`, `network_analysis`, and
`comparative_intelligence` — and cross-correlates their outputs to produce
consolidated intelligence alerts.

Three correlation scenarios are evaluated:
1. **Influence × Anomaly** — When an MEP's influence score exceeds the
   sensitivity threshold and voting anomalies are detected simultaneously,
   an `ELEVATED_ATTENTION` alert is raised.
2. **Coalition Fracture** — When the early warning system flags coalition
   instability and coalition dynamics shows declining cohesion for the same
   groups, a `COALITION_FRACTURE` alert is generated.
3. **Comprehensive Profile** — When network analysis reveals high centrality
   and comparative intelligence confirms cross-committee activity for the
   same MEP, a `COMPREHENSIVE_PROFILE` alert is issued.

## Parameters

### args

`unknown`

Raw tool arguments, validated against
  [CorrelateIntelligenceSchema](../../../schemas/ep/analysis/variables/CorrelateIntelligenceSchema.md)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ToolResult`](../../shared/types/interfaces/ToolResult.md)\>

MCP tool result containing a [CorrelatedIntelligenceReport](../interfaces/CorrelatedIntelligenceReport.md)
  with alerts, correlations, and standard OSINT output fields

## Throws

If `args` fails schema validation

## Throws

If all underlying EP API calls fail simultaneously

## Examples

```typescript
// Correlate two MEPs with default MEDIUM sensitivity
const result = await handleCorrelateIntelligence({
  mepIds: ['197558', '124810'],
});
const report = JSON.parse(result.content[0].text);
console.log(`Alerts: ${report.summary.totalAlerts}`);
```

```typescript
// High-sensitivity scan with network analysis and explicit group scope
const result = await handleCorrelateIntelligence({
  mepIds: ['197558', '124810', '23456'],
  groups: ['EPP', 'S&D', 'Renew'],
  sensitivityLevel: 'HIGH',
  includeNetworkAnalysis: true,
});
```

## Security

Input validated by Zod. Cross-tool access to MEP personal data
  is minimised per GDPR Article 5(1)(c). EP data-access operations are
  logged through the underlying EP API client per ISMS Policy AU-002.

## Since

1.0.0

## See

 - [correlateIntelligenceToolMetadata](../variables/correlateIntelligenceToolMetadata.md) for MCP schema registration
 - [handleAssessMepInfluence](../../assessMepInfluence/functions/handleAssessMepInfluence.md) for the influence dimension
 - [handleDetectVotingAnomalies](../../detectVotingAnomalies/functions/handleDetectVotingAnomalies.md) for the anomaly dimension
 - [handleEarlyWarningSystem](../../earlyWarningSystem/functions/handleEarlyWarningSystem.md) for coalition risk signals
