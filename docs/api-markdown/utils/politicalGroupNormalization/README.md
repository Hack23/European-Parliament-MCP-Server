[**European Parliament MCP Server API v1.2.16**](../../README.md)

***

[European Parliament MCP Server API](../../modules.md) / utils/politicalGroupNormalization

# utils/politicalGroupNormalization

Shared political-group label normalization for European Parliament tools.

Maps raw political-group labels returned by the EP Open Data Portal API
(short codes, URI suffixes, full group names, native-language acronyms,
and historical EP9→EP10 successor labels) onto a single set of canonical
EP10 short codes (`EPP`, `S&D`, `Renew`, `Greens/EFA`, `ECR`, `PfE`,
`The Left`, `ESN`, `NI`).

Originally lived inside `src/tools/analyzeCoalitionDynamics.ts`; extracted
to a shared module so `generate_political_landscape` and any future
group-aware tool can reuse the same alias table without depending on the
coalition-dynamics module. `analyzeCoalitionDynamics.ts` re-exports
`normalizePoliticalGroup` for backward compatibility.

## Functions

- [normalizePoliticalGroup](functions/normalizePoliticalGroup.md)
