[**European Parliament MCP Server API v1.2.6**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/trackLegislation/procedureTracker](../README.md) / buildLegislativeTracking

# Function: buildLegislativeTracking()

> **buildLegislativeTracking**(`procedure`): [`LegislativeProcedure`](../../types/interfaces/LegislativeProcedure.md)

Defined in: [tools/trackLegislation/procedureTracker.ts:84](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/trackLegislation/procedureTracker.ts#L84)

Build a legislative tracking result from a real EP API Procedure.

Most fields are derived directly from the API response. Amendment counts
and voting records are placeholders (zeros / empty array) because the
single-procedure endpoint does not supply them; these are surfaced in
[LegislativeProcedure.dataQualityWarnings](../../types/interfaces/LegislativeProcedure.md#dataqualitywarnings).

## Parameters

### procedure

[`Procedure`](../../../../types/ep/activities/interfaces/Procedure.md)

Real procedure data from EP API

## Returns

[`LegislativeProcedure`](../../types/interfaces/LegislativeProcedure.md)

Structured legislative tracking data
