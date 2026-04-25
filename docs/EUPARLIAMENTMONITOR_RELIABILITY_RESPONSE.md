# Response to `Hack23/euparliamentmonitor` MCP-Reliability Audits

**Audit window analysed:** 2026-04-14 → 2026-04-24 (11 daily runs; primary
sources: `analysis/daily/2026-04-24/breaking/intelligence/mcp-reliability-audit.md`
and `analysis/daily/2026-04-24/propositions/intelligence/mcp-reliability-audit.md`).

**Source attribution:** All defects were extracted from publicly-published
reliability audits in the `Hack23/euparliamentmonitor` repository. Upstream
data source for every reproducible probe is the European Parliament
Open Data Portal (`https://data.europarl.europa.eu/api/v2/`).

**Confidence:** HIGH — every defect cross-references at least two daily
runs and matches the documented EP API behaviour in
`docs/EP_API_INTEGRATION.md`.

## 1 · Triage of the seven defects

| # | Defect | Owner | Disposition in this PR |
|---|--------|-------|------------------------|
| 1 | `get_adopted_texts` `UPSTREAM_404` for indexed-but-content-pending TA-IDs | Upstream EP | Already handled by `LegislativeClient.getAdoptedTextById` (empty-payload sentinel → 404 + cache-evict). Documented in tool description; no code change needed. |
| 2 | `get_committee_documents_feed` returns `status:"unavailable"` | Upstream EP | Already returns the uniform `status:"unavailable"` envelope through `feedUtils`. Tool description already documents the fallback to the non-feed endpoint. No code change needed. |
| 3 | `get_procedures_feed` returns legacy 1972 / 1980 IDs (timeframe ignored upstream) | Upstream EP + this repo | Existing `tryProceduresFallback` already calls `/procedures` when the feed errors. Filed upstream issue; no further client mitigation feasible because EP `/procedures` accepts no `year` / `date-from` filter. See §3.3. |
| 4 | `analyze_coalition_dynamics` reports `memberCount: 0` for EPP because the EP API uses the French acronym `PPE` | This repo | **FIXED** — added `PPE`, `PPE-DE`, `SOC`, `Verts-ALE` and other native-language aliases to `POLITICAL_GROUP_ALIASES`. Regression tests added. |
| 5 | `get_plenary_sessions` returns historical sessions despite `dateFrom: 2026-04-01` | This repo | **FIXED** — applied client-side post-filter on `dateFrom`/`dateTo`. Regression tests added. |
| 6 | `monitor_legislative_pipeline` fell back to `2024-01-01..2024-12-31` when no dates supplied | This repo | **FIXED** — default period is now last-30-days anchored on "now". Regression tests added. |
| 7 | `get_adopted_texts_feed` returns historical backfill (no current-year items) under `timeframe:"today"` for ≥ 8 consecutive days | Upstream EP + this repo | **FIXED — PRIORITY freshness fallback:** when the feed payload has no items from the current calendar year, we now augment with `/adopted-texts?year={currentYear}` and surface a `FRESHNESS_FALLBACK` warning so callers can find recent documents while the feed is degraded. Regression tests added. |

## 2 · Code changes shipped in this PR

| File | Change |
|------|--------|
| `src/tools/analyzeCoalitionDynamics.ts` | Added `PPE`, `PPE-DE`, French/Italian native variants for EPP, S&D, Renew, Greens/EFA — fixes Defect #4. |
| `src/tools/monitorLegislativePipeline.ts` | Default `period.from` / `period.to` to last-30-days anchored on "now" — fixes Defect #6. |
| `src/tools/getPlenarySessions.ts` | Client-side post-filter on `dateFrom`/`dateTo` because EP `/meetings` ignores its date filters — fixes Defect #5. |
| `src/tools/getAdoptedTextsFeed.ts` | Freshness fallback: when feed has no current-year items, augment with `/adopted-texts?year={currentYear}`. Surfaces `FRESHNESS_FALLBACK` / `FRESHNESS_FALLBACK_FAILED` warnings — addresses **PRIORITY** "must be able to find recent documents" — fixes Defect #7. |
| `src/tools/*.test.ts` (4 files) | +9 regression tests covering the fixes above. |

## 3 · Cross-repo issues filed in `Hack23/euparliamentmonitor`

The following issues have been opened to track the consumer-side
follow-ups (each one references the relevant EP API guide section and
the matching audit row):

| # | Defect addressed | Issue |
|---|------------------|-------|
| 7 | `get_adopted_texts_feed` no current-year items → consumer should honour `FRESHNESS_FALLBACK` warning | [Hack23/euparliamentmonitor#1422](https://github.com/Hack23/euparliamentmonitor/issues/1422) |
| 1 | `get_adopted_texts` `UPSTREAM_404` indexing-lag → schedule retries with exponential back-off | [Hack23/euparliamentmonitor#1423](https://github.com/Hack23/euparliamentmonitor/issues/1423) |
| 3 | `get_procedures_feed` legacy IDs → route fresh-procedure discovery through `get_procedures` + client-side `dateLastActivity` sort | [Hack23/euparliamentmonitor#1424](https://github.com/Hack23/euparliamentmonitor/issues/1424) |
| 4 | `analyze_coalition_dynamics` PPE→EPP — drop the local consumer workaround once MCP server v1.2.14+ canonicalises native-language aliases | [Hack23/euparliamentmonitor#1425](https://github.com/Hack23/euparliamentmonitor/issues/1425) |
| 5 | `get_plenary_sessions` historical sessions — drop duplicate consumer post-filter, rely on upstream client-side filter | [Hack23/euparliamentmonitor#1426](https://github.com/Hack23/euparliamentmonitor/issues/1426) |
| 6 | `monitor_legislative_pipeline` default window — adjust prompts now that the default shifted from fixed 2024 to last-30-days | [Hack23/euparliamentmonitor#1427](https://github.com/Hack23/euparliamentmonitor/issues/1427) |

## 4 · Out-of-scope (referred to the relevant repos)

| # | Defect | Repo |
|---|--------|------|
| 7 | World Bank `EUU` / `EMU` aggregate codes return *“Country not found”* | `worldbank-mcp` (third-party) |

## 5 · Forward-monitoring hooks (this repo)

The audits set explicit escalation thresholds:

- `events_feed` DEGRADED ≥ 14 consecutive days → escalate to a
  committee-reports family article.
- `adopted_texts_feed` SUSPICIOUS without `FRESHNESS_FALLBACK` warning
  for ≥ 4 consecutive days → upstream regression.
- `get_adopted_texts` `UPSTREAM_404` rate ≥ 50% for the most recent
  TA-10-2026-0001…0050 batch → upstream indexing regression.

These thresholds are now mechanically observable: every fix in this PR
emits a structured `dataQualityWarnings` entry that the
`euparliamentmonitor` agentic workflow can grep without parsing prose.

## 6 · Audit trail

- Audit access to MEP / political data is performed exclusively through
  the existing `auditLogger` (ISMS Policy AU-002, Privacy Policy
  Art. 5(1)(c)).
- No new personal data is processed; the EPP/PPE alias is a public
  political-group label, not personal data.
- All EP API calls remain rate-limited per `EP_RATE_LIMIT`.

— *Generated 2026-04-25 in response to the 2026-04-24 daily run audits.*
