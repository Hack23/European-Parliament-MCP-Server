[**European Parliament MCP Server API v0.7.3**](../../../../README.md)

***

[European Parliament MCP Server API](../../../../modules.md) / [tools/trackLegislation/procedureTracker](../README.md) / buildLegislativeTracking

# Function: buildLegislativeTracking()

> **buildLegislativeTracking**(`procedure`): [`LegislativeProcedure`](../../types/interfaces/LegislativeProcedure.md)

Defined in: [tools/trackLegislation/procedureTracker.ts:79](https://github.com/Hack23/European-Parliament-MCP-Server/blob/c844f163befb571516b5718c5d197eff1e589dea/src/tools/trackLegislation/procedureTracker.ts#L79)

Build a legislative tracking result from a real EP API Procedure.

All fields are derived from the API response. No mock or placeholder data.

## Parameters

### procedure

[`Procedure`](../../../../types/ep/activities/interfaces/Procedure.md)

Real procedure data from EP API

## Returns

[`LegislativeProcedure`](../../types/interfaces/LegislativeProcedure.md)

Structured legislative tracking data
