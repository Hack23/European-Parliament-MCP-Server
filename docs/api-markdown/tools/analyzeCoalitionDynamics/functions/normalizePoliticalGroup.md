[**European Parliament MCP Server API v1.2.11**](../../../README.md)

***

[European Parliament MCP Server API](../../../modules.md) / [tools/analyzeCoalitionDynamics](../README.md) / normalizePoliticalGroup

# Function: normalizePoliticalGroup()

> **normalizePoliticalGroup**(`raw`): `string`

Defined in: [tools/analyzeCoalitionDynamics.ts:231](https://github.com/Hack23/European-Parliament-MCP-Server/blob/main/src/tools/analyzeCoalitionDynamics.ts#L231)

Normalizes a raw political-group label returned by the EP Open Data Portal
API to a canonical short code (e.g. `EPP`, `S&D`, `PfE`).

Handles three common EP API formats:
1. **Short codes** — already canonical (`EPP`, `S&D`, ...) are returned as-is
   after lookup (case-insensitive).
2. **URI identifiers** — e.g. `http://publications.europa.eu/.../corporate-body/EPP`.
   The URI suffix is extracted and then looked up.
3. **Full group names** — e.g. `"Group of the European People's Party (Christian Democrats)"`.
   Matched case-insensitively against POLITICAL\_GROUP\_ALIASES.

Also handles succession relationships so historical pre-EP10 labels (e.g.
`ID` from EP9) are counted against their EP10 successor (`PfE`).

## Parameters

### raw

`string`

Raw political-group label from the EP API (may be empty/unknown)

## Returns

`string`

Canonical short code when recognized, otherwise the original `raw`
  string trimmed (so callers can surface unrecognized labels as a data-quality
  warning).
