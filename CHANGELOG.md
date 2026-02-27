# Changelog

All notable changes to the **European Parliament MCP Server** are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Comprehensive JSDoc documentation improvements for all public APIs
- `docs/TOOL_DEVELOPMENT.md` — step-by-step guide for adding new MCP tools
- Inline troubleshooting section in `README.md`
- Architecture Mermaid overview diagram in `README.md`
- Cursor IDE MCP configuration example

### Changed
- Updated `docs/TESTING_GUIDE.md` to reflect 45 tools and Vitest 4 patterns
- Expanded `CONTRIBUTING.md` with DI container guidance and security checklists

### Fixed
- Corrected tool count references throughout documentation (45 tools)

---

## [1.0.0] — (Planned)

### Added
- **45 MCP Tools** — complete European Parliament API v2 coverage:
  - 7 Core tools (`get_meps`, `get_mep_details`, `get_plenary_sessions`,
    `get_voting_records`, `search_documents`, `get_committee_info`,
    `get_parliamentary_questions`)
  - 3 Advanced Analysis tools (`analyze_voting_patterns`, `track_legislation`,
    `generate_report`)
  - 14 OSINT Intelligence tools:
    - Phase 1 (6): `assess_mep_influence`, `analyze_coalition_dynamics`,
      `detect_voting_anomalies`, `compare_political_groups`,
      `analyze_legislative_effectiveness`, `monitor_legislative_pipeline`
    - Phase 2 (2): `analyze_committee_activity`, `track_mep_attendance`
    - Phase 3 (2): `analyze_country_delegation`, `generate_political_landscape`
    - Phase 6 (4): `network_analysis`, `sentiment_tracker`,
      `early_warning_system`, `comparative_intelligence`
  - 8 Phase 4 EP API v2 tools (`get_current_meps`, `get_speeches`,
    `get_procedures`, `get_adopted_texts`, `get_events`,
    `get_meeting_activities`, `get_meeting_decisions`, `get_mep_declarations`)
  - 13 Phase 5 EP API v2 tools (`get_incoming_meps`, `get_outgoing_meps`,
    `get_homonym_meps`, `get_plenary_documents`, `get_committee_documents`,
    `get_plenary_session_documents`, `get_plenary_session_document_items`,
    `get_controlled_vocabularies`, `get_external_documents`,
    `get_meeting_foreseen_activities`, `get_procedure_events`,
    `get_meeting_plenary_session_documents`,
    `get_meeting_plenary_session_document_items`)
- **9 MCP Resources** with `ep://` URI scheme:
  `ep://meps`, `ep://meps/{mepId}`, `ep://committees/{committeeId}`,
  `ep://plenary-sessions`, `ep://votes/{sessionId}`, `ep://political-groups`,
  `ep://procedures/{procedureId}`, `ep://plenary/{plenaryId}`,
  `ep://documents/{documentId}`
- **7 MCP Prompts**: `mep_briefing`, `coalition_analysis`, `legislative_tracking`,
  `political_group_comparison`, `committee_activity_report`,
  `voting_pattern_analysis`, `country_delegation_analysis`
- **5-dimension MEP influence scoring model** (CIA Political Scorecards methodology):
  Voting Activity 25%, Legislative Output 25%, Committee Engagement 20%,
  Parliamentary Oversight 15%, Coalition Building 15%
- **Dependency Injection (DI) container** with `TOKENS` symbol registry and
  `createDefaultContainer()` factory wiring `RateLimiter`, `MetricsService`,
  `AuditLogger`, and `HealthService` as singletons
- **Facade architecture** — `EuropeanParliamentClient` delegates to 8 bounded-context
  sub-clients sharing one LRU cache and rate-limiter budget
- Full TypeDoc HTML + Markdown API documentation via GitHub Pages
- SLSA Level 3 build provenance with npm package attestations
- SBOM in SPDX 2.3 and CycloneDX formats, quality score 8.5/10
- OSSF Scorecard integration targeting 8.0+/10
- GDPR Article 30 compliant audit logging for all personal data access
- Zod runtime validation for every tool input and output
- LRU cache with 15-minute TTL and 500-entry cap
- Token-bucket rate limiter — 100 requests per 15 minutes

### Changed
- Promoted from beta (0.x) to stable (1.0) release
- All tools return strongly-typed, validated responses
- Error messages scrubbed of internal implementation details
- Documentation portal migrated to GitHub Pages with sitemap

### Security
- CodeQL static analysis on every PR
- Dependabot automated dependency updates
- License compliance check — only MIT, Apache-2.0, BSD, ISC permitted
- Supply chain secured via GitHub Sigstore attestations

---

## [0.8.2] — 2025-06

### Fixed
- Parliamentary questions fetch in `assess_mep_influence` now uses
  `data.length` instead of `total` for accurate question counts
- Procedure ID validation now enforces `YYYY-NNNN` format in resource handler
- ES module-safe `ep://` URI scheme parsing edge cases
- Coalition pair cohesion correctly handles groups with zero members

### Changed
- `buildGroupMetrics` documents that per-MEP voting statistics are unavailable
  from the EP API `/meps/{id}` endpoint; cohesion metrics now report zero with
  `LOW` confidence rather than using synthetic estimates
- Confidence level labels updated to `HIGH`, `MEDIUM`, `LOW` (uppercase)

### Security
- Upgraded `@modelcontextprotocol/sdk` to 1.27.1
- Dependency audit: zero high/critical vulnerabilities

---

## [0.8.0] — 2025-05

### Added
- **10 OSINT Intelligence tools** (breaking out from basic analysis):
  `assess_mep_influence`, `analyze_coalition_dynamics`, `detect_voting_anomalies`,
  `compare_political_groups`, `analyze_legislative_effectiveness`,
  `monitor_legislative_pipeline`, `analyze_committee_activity`,
  `track_mep_attendance`, `analyze_country_delegation`,
  `generate_political_landscape`
- `country_delegation_analysis` MCP prompt
- Extended resource URIs: `ep://procedures/{id}`, `ep://plenary/{id}`,
  `ep://documents/{id}`
- Vitest 4 test runner with `@vitest/coverage-v8` provider
- 1 130+ unit tests across all 45 tool files
- 23 E2E tests via `MCPTestClient` stdio harness
- `knip` dead-code detection in CI
- `license-compliance` automated license gating

### Changed
- Tool handler signatures unified: `handleXxx(args: unknown): Promise<ToolResult>`
- All tools now use shared `buildToolResponse()` factory from `tools/shared/`
- `EuropeanParliamentClient` refactored into facade over 8 sub-clients

### Fixed
- Rate limiter token refill race condition under high concurrency
- Cache key collisions between similar query parameters

---

## [0.7.0] — 2025-04

### Added
- Initial public release on npm as `european-parliament-mcp-server`
- **29 MCP tools** covering MEPs, plenary, committees, documents, procedures,
  legislative procedures, parliamentary questions, and controlled vocabularies
- **7 MCP Resources** with `ep://` URI template scheme
- **6 MCP Prompts** for intelligence analysis workflows
- `EuropeanParliamentClient` with LRU caching and rate limiting
- Zod schema validation for all tool inputs
- TypeScript strict mode throughout
- Apache-2.0 open-source license
- GitHub Actions CI/CD: build, test, lint, SBOM generation
- `SECURITY.md` aligned with Hack23 ISMS vulnerability disclosure process
- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and PR template

---

[Unreleased]: https://github.com/Hack23/European-Parliament-MCP-Server/compare/v0.8.2...HEAD
[1.0.0]: https://github.com/Hack23/European-Parliament-MCP-Server/compare/v0.8.2...v1.0.0
[0.8.2]: https://github.com/Hack23/European-Parliament-MCP-Server/compare/v0.8.0...v0.8.2
[0.8.0]: https://github.com/Hack23/European-Parliament-MCP-Server/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/Hack23/European-Parliament-MCP-Server/releases/tag/v0.7.0
