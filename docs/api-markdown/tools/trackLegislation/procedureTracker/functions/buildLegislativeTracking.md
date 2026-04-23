[**European Parliament MCP Server API v1.2.13**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/trackLegislation/procedureTracker](../README.md) / buildLegislativeTracking

# Function: buildLegislativeTracking()

> **buildLegislativeTracking**(`procedure`, `events?`, `externalEnrichmentFailures?`): [`LegislativeProcedure`](../../types/interfaces/LegislativeProcedure.md)

Defined in: [tools/trackLegislation/procedureTracker.ts:171](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/trackLegislation/procedureTracker.ts#L171)

Build a legislative tracking result from a real EP API Procedure.

Most fields are derived directly from the API response. Amendment counts
and voting records are placeholders (zeros / empty array) because the
single-procedure endpoint does not supply them; these are surfaced in
[LegislativeProcedure.dataQualityWarnings](../../types/interfaces/LegislativeProcedure.md#dataqualitywarnings).

Per-step enrichment failures are tracked and returned in
[LegislativeProcedure.enrichmentFailures](../../types/interfaces/LegislativeProcedure.md#enrichmentfailures) so that consumers can
identify exactly which data dimensions are incomplete and weight
per-field confidence accordingly.

## Parameters

### procedure

[`Procedure`](../../../../types/ep/activities/interfaces/Procedure.md)

Real procedure data from EP API

### events?

[`EPEvent`](../../../../types/ep/activities/interfaces/EPEvent.md)[] = `[]`

Optional events from `/procedures/{process-id}/events` endpoint for timeline enrichment

### externalEnrichmentFailures?

`string`[] = `[]`

Named sub-steps that already failed before this call
  (e.g. `["events-lookup"]` when the events API call threw an error)

## Returns

[`LegislativeProcedure`](../../types/interfaces/LegislativeProcedure.md)

Structured legislative tracking data
