# Integration Testing Guide

## 📋 Overview

This guide explains how to run integration tests for the European Parliament MCP Server. The `allTools.integration.test.ts` suite validates 46 of the 62 MCP tools against the real European Parliament Open Data API. The remaining 16 tools — 13 feed endpoints, `get_all_generated_stats` (precomputed, no live API calls), `get_server_health` (local diagnostics, no API calls), and `get_procedure_event_by_id` — are validated through unit tests. **All integration-tested tools return real data — no mock or placeholder data is used.**

**ISMS Policy**: [Hack23 Secure Development Policy - Testing](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md#testing)

**Compliance**: ISO 27001 (AU-2), NIST CSF 2.0 (DE.CM-6), CIS Controls v8.1 (8.11)

---

## 🎯 Integration Test Coverage

### 62 MCP Tools — Integration & Unit Test Coverage

**Core Data Access Tools** (7 — real EP API):
1. **get_meps** - MEP retrieval with filtering
2. **get_mep_details** - Individual MEP information
3. **get_plenary_sessions** - Plenary session data
4. **get_voting_records** - Voting record access
5. **search_documents** - Document search
6. **get_committee_info** - Committee information
7. **get_parliamentary_questions** - Parliamentary questions

**Advanced Analysis Tools** (3 — real EP API data):
8. **analyze_voting_patterns** - Voting pattern analysis
9. **track_legislation** - Legislative procedure tracking (real EP API `/procedures`)
10. **generate_report** - Report generation

**OSINT Intelligence Tools — Phase 1** (6 — real EP API data):
11. **assess_mep_influence** - MEP influence scoring (5-dimension model)
12. **analyze_coalition_dynamics** - Coalition cohesion & stress analysis
13. **detect_voting_anomalies** - Party defection & anomaly detection
14. **compare_political_groups** - Cross-group comparative analysis
15. **analyze_legislative_effectiveness** - MEP/committee legislative scoring
16. **monitor_legislative_pipeline** - Pipeline status (real EP API `/procedures`)

**OSINT Intelligence Tools — Phase 2** (2 — real EP API data):
17. **analyze_committee_activity** - Committee workload & engagement analysis
18. **track_mep_attendance** - MEP attendance patterns & trends

**OSINT Intelligence Tools — Phase 3** (2 — real EP API data):
19. **analyze_country_delegation** - Country delegation voting & composition analysis
20. **generate_political_landscape** - Parliament-wide political landscape overview

**OSINT Intelligence Tools — Phase 6** (5 — real EP API data):
21. **network_analysis** - MEP network and relationship analysis
22. **sentiment_tracker** - Political group sentiment tracking
23. **early_warning_system** - Political risk early warning detection
24. **comparative_intelligence** - Multi-MEP comparative intelligence analysis
25. **correlate_intelligence** - Multi-dimensional OSINT intelligence correlation analysis

**EP Data Access Tools — Phase 4** (8 — real EP API v2):
26. **get_current_meps** - Currently serving MEPs
27. **get_speeches** - Plenary speeches
28. **get_procedures** - Legislative procedures
29. **get_adopted_texts** - Adopted legislative texts
30. **get_events** - Parliamentary events
31. **get_meeting_activities** - Meeting activity records
32. **get_meeting_decisions** - Meeting decision outcomes
33. **get_mep_declarations** - MEP financial declarations

**EP Complete Coverage Tools — Phase 5** (14 — real EP API v2):
34. **get_incoming_meps** - Incoming MEPs (new members)
35. **get_outgoing_meps** - Outgoing MEPs (departing members)
36. **get_homonym_meps** - MEPs with duplicate names
37. **get_plenary_documents** - Plenary-specific documents
38. **get_committee_documents** - Committee-specific documents
39. **get_plenary_session_documents** - Session-specific documents
40. **get_plenary_session_document_items** - Document items within sessions
41. **get_controlled_vocabularies** - EP controlled vocabulary terms
42. **get_external_documents** - External reference documents
43. **get_meeting_foreseen_activities** - Planned meeting activities
44. **get_procedure_events** - Events linked to a procedure
45. **get_meeting_plenary_session_documents** - Plenary session meeting documents
46. **get_meeting_plenary_session_document_items** - Plenary session meeting document items
47. **get_procedure_event_by_id** - Single event for a specific procedure

**Precomputed Analytics** (1 — static data, no live EP API calls):
48. **get_all_generated_stats** - Precomputed EP activity statistics (2004–2026); returns static data refreshed weekly by agentic workflow

**EP Data Feed Tools** (13 — real EP API v2 feeds):
49. **get_meps_feed** - Recently updated MEPs
50. **get_events_feed** - Recently updated events
51. **get_procedures_feed** - Recently updated procedures
52. **get_adopted_texts_feed** - Recently updated adopted texts
53. **get_mep_declarations_feed** - Recently updated MEP declarations
54. **get_documents_feed** - Recently updated documents
55. **get_plenary_documents_feed** - Recently updated plenary documents
56. **get_committee_documents_feed** - Recently updated committee documents
57. **get_plenary_session_documents_feed** - Recently updated plenary session documents
58. **get_external_documents_feed** - Recently updated external documents
59. **get_parliamentary_questions_feed** - Recently updated parliamentary questions
60. **get_corporate_bodies_feed** - Recently updated corporate bodies
61. **get_controlled_vocabularies_feed** - Recently updated controlled vocabularies

**Server Diagnostics** (1 — local only, no EP API calls):
62. **get_server_health** - Server health and feed availability status

> **No Mock Data**: All tools return real data from the EP API. The integration test suite (`allTools.integration.test.ts`) currently covers 46 of 62 tools (core, advanced, OSINT, phase 4, and phase 5 data tools). Feed tools and precomputed analytics tools are validated through unit tests. The suite explicitly checks that no tool returns `confidenceLevel: 'NONE'` or `PLACEHOLDER DATA` markers.

### Test Categories

Each tool includes comprehensive tests for:

- ✅ **Basic Retrieval** - Core functionality validation
- ✅ **Filtering** - Query parameter validation
- ✅ **Pagination** - Offset and limit handling
- ✅ **Error Handling** - Invalid input rejection
- ✅ **Response Validation** - Schema compliance
- ✅ **Performance** - Response time validation (<5s uncached, <1s cached)
- ✅ **Data Consistency** - Repeated request validation
- ✅ **GDPR Compliance** - PII handling (where applicable)

---

## 🛡️ OSINT QA Harness — Cross-Tool Contract Suite

The 15 OSINT tools share a common metadata envelope ([`OsintStandardOutput`](src/tools/shared/types.ts) — `confidenceLevel`, `methodology`, `dataFreshness`, `sourceAttribution`, `dataQualityWarnings`). A single, registry-driven contract test enforces that envelope uniformly across every OSINT tool so regressions cannot land undetected.

**Location:** [`tests/integration/osint/contract.test.ts`](tests/integration/osint/contract.test.ts)

**Driver:** Iterates `getToolMetadataArray().filter(t => t.category === 'osint')`, so **adding a new OSINT tool automatically enrols it in the contract suite** (the only change required is a minimal-input entry in the test's `TOOL_INPUTS` map).

### What the contract asserts

For every OSINT tool, with EP and DOCEO clients mocked deterministically:

1. **Envelope schema** — response payload parses against [`OsintStandardOutputSchema`](src/schemas/ep/analysis.ts).
2. **Confidence level** — `confidenceLevel ∈ {HIGH, MEDIUM, LOW}` (per the schema).
3. **Non-empty fields** — `methodology`, `dataFreshness`, `sourceAttribution` are non-empty strings; `sourceAttribution` references the EP Open Data Portal.
4. **No-silent-zero policy** — when underlying data is unavailable (mocked-empty EP API) and the tool degrades `confidenceLevel` to `LOW` or `MEDIUM`, `dataQualityWarnings` MUST be non-empty so callers can see why numeric metrics are zero. Tools that silently emit zeros without warnings violate the data-quality intent of the envelope and fail this test.
5. **Determinism** — invoking each tool twice with the same input yields byte-identical JSON payloads after stripping volatile fields (`analysisTime`, `assessmentTime`, `generatedAt`, `timestamp`, `correlationId`, `runId`, `requestId`, `computedAt`, `asOf`). Wall-clock is pinned via `vi.setSystemTime` to keep timestamp-derived envelope wording stable within a test.

### No-silent-zero policy — what it means

If any numeric field outside `dataQualityWarnings` would be **zero because a data source is unavailable** (rather than because the underlying real-world count is actually zero), the tool MUST add a `dataQualityWarnings` entry explaining the unavailability. The contract test enforces the observable side of this policy: **whenever `confidenceLevel` is `LOW` or `MEDIUM`, `dataQualityWarnings` MUST be non-empty.** A degraded confidence level with no accompanying warning is treated as a silent-zero regression and fails the test. Tools whose remaining (per-MEP) data is sufficient to legitimately keep `confidenceLevel = HIGH` are allowed to do so without a warning.

### Running just the OSINT contract suite

```bash
# All 45 contract checks (15 tools × 3 scenarios), no network calls
npx vitest run tests/integration/osint/contract.test.ts
```

The suite completes in ~1 s because it uses `vi.mock` to stub the EP and DOCEO clients with synthetic, redacted fixtures from `tests/fixtures/osintPhase6Fixtures.ts`. It runs automatically as part of `npm run test:integration` in the `Integration and E2E Tests` CI workflow.

### Refreshing fixtures / adding a new OSINT tool

1. Register the tool in [`src/server/toolRegistry.ts`](src/server/toolRegistry.ts) with `category: 'osint'`.
2. Add the minimal-valid input for the tool in the shared `OSINT_TOOL_INPUTS` map in [`tests/fixtures/osint/index.ts`](tests/fixtures/osint/index.ts) — both the contract suite and the golden-snapshot suite consume this map, so a single addition covers both.
3. Run `npx vitest run tests/integration/osint/contract.test.ts` — a failing `beforeAll` will list any registered OSINT tool that lacks an entry.
4. If the new tool calls an EP API method not yet covered by the shared mock-installer helpers (`installEmptyPathMocks`, `installHotPathMocks` in [`tests/fixtures/osint/index.ts`](tests/fixtures/osint/index.ts)), add a default response there (use `emptyPaginated()` for list endpoints).
5. Regenerate the golden snapshots once for the new tool — see the next section.

---

## 📸 OSINT QA Harness — Golden Snapshots

The cross-tool contract suite locks down the **shape** of the OSINT envelope; the per-tool golden-snapshot suite locks down the **content** — scoring weights, classification buckets, attribution lists. Together they catch the regression surface area that pure schema validation cannot.

**Location:** [`tests/integration/osint/snapshots.test.ts`](tests/integration/osint/snapshots.test.ts)
**Snapshots:** [`tests/integration/osint/__snapshots__/`](tests/integration/osint/__snapshots__) — `<tool>.<variant>.json`
**Fixtures (single source of truth):** [`tests/fixtures/osint/index.ts`](tests/fixtures/osint/index.ts) — also dumped for reviewer visibility at [`tests/fixtures/osint/canonical-ep.json`](tests/fixtures/osint/canonical-ep.json), [`canonical-doceo-rcv.xml`](tests/fixtures/osint/canonical-doceo-rcv.xml), and [`canonical-doceo-vot.xml`](tests/fixtures/osint/canonical-doceo-vot.xml).

### What the snapshots assert

For each of the 15 OSINT tools, two fixture **variants** are exercised:

| Variant | Mock installer | What it covers |
| --- | --- | --- |
| `empty-path` | `installEmptyPathMocks` | MEP roster present, every other EP/DOCEO source empty. Verifies the no-silent-zero policy (`confidenceLevel ≠ HIGH` with non-empty `dataQualityWarnings`). |
| `hot-path` | `installHotPathMocks` | Substantive synthetic EP + DOCEO data (3 plenary RCVs, 3 procedures, committee documents, questions). Drives every tool through its scoring / classification / attribution code path so a methodology regression actually moves a snapshot value. |

Each snapshot is the tool's JSON response after `stripVolatile` removes timestamp/run-identifier fields (`generatedAt`, `analysisTime`, `dataFreshness`, `cacheHit`, …) and after `stableStringify` sorts object keys ascending at every depth. Arrays preserve original order (OSINT scoring is order-sensitive).

### Snapshot conventions

- **Key sorting** — every object's keys are sorted ascending so spurious diffs from non-deterministic insertion order never appear.
- **Volatile fields** — see `VOLATILE_KEYS` in [`tests/fixtures/osint/index.ts`](tests/fixtures/osint/index.ts). Add new keys there (and only there) when a tool introduces a wall-clock-derived field.
- **Wall-clock** — pinned via `vi.useFakeTimers({ toFake: ['Date'] })` + `vi.setSystemTime('2024-06-15T12:00:00.000Z')` in `beforeEach` so freshness fields render deterministically.
- **Two variants per tool** — required so the snapshot exercises real scoring logic, not just the empty envelope (per the original issue's "hot path with substantive data" requirement).

### Running just the snapshot suite

```bash
# Diff-assert mode — fails on any divergence
npm run test:osint:snapshots

# Refresh mode — rewrites snapshots in place
npm run test:osint:snapshots -- -u

# Refresh via env var (useful in CI's optional "refresh" job)
UPDATE_OSINT_SNAPSHOTS=1 npx vitest run tests/integration/osint/snapshots.test.ts
```

The suite completes in ≈1 s (≤90 s CI budget) because it shares the registry-driven driver and `vi.mock`-based client stubs used by the contract suite. It runs automatically as part of `npm run test:integration`.

### Refreshing snapshots — reviewer sign-off required

Snapshot diffs represent a methodology change. They MUST be explicitly acknowledged:

1. Run `npm run test:osint:snapshots -- -u` locally to regenerate.
2. **Review every diff** — the JSON-text diff in your PR shows the precise field that moved.
3. Tick the **"OSINT snapshot refresh acknowledged"** box in [`PULL_REQUEST_TEMPLATE.md`](PULL_REQUEST_TEMPLATE.md). Reviewers will block merges that change snapshots without this acknowledgement.
4. Update the relevant tool's design-note section in `INTEGRATION_TESTING.md` if the change reflects a deliberate methodology shift (new scoring weight, new dimension, etc.).

### Refresh fan-out — when fixture changes are intentional

If you change the canonical fixture factory in `tests/fixtures/osint/index.ts` (e.g. add a new MEP, adjust a DOCEO record), expect **all 30 snapshots to diff** on the next run. This is by design — the snapshots ARE the regression detector. Follow the four steps above and call out the fixture change in your PR description.

---




## 🚀 Quick Start

### Prerequisites

- Node.js 25.x or higher
- npm 10.0.0 or higher
- Network access to `https://data.europarl.europa.eu`

### Running Integration Tests

Integration tests are **disabled by default** to avoid accidental real API calls and rate limit issues.

```bash
# Enable and run all integration tests
EP_INTEGRATION_TESTS=true npm run test:integration

# Run specific tool tests
EP_INTEGRATION_TESTS=true npm run test:integration -- getMEPs

# Run with fixture capture enabled
EP_INTEGRATION_TESTS=true EP_SAVE_FIXTURES=true npm run test:integration

# Run with verbose output
EP_INTEGRATION_TESTS=true npm run test:integration -- --reporter=verbose
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `EP_INTEGRATION_TESTS` | `false` | Enable integration tests (set to `true` to run) |
| `EP_SAVE_FIXTURES` | `false` | Save real API responses as test fixtures |
| `EP_API_URL` | `https://data.europarl.europa.eu/api/v2/` | European Parliament API base URL (must include trailing `/`) |

> **Important**: Always include a trailing `/` in `EP_API_URL`. The client builds URLs with `new URL(endpoint, baseURL)`, and omitting the trailing slash (for example using `/api/v2` instead of `/api/v2/`) can cause the `v2` path segment to be dropped when resolving endpoints.

---

## 📁 Test Structure

### Directory Layout

```
tests/
├── integration/
│   ├── setup.ts                        # Test environment configuration
│   ├── epApi.integration.test.ts      # API client integration tests
│   ├── helpers/
│   │   ├── responseValidator.ts        # Response validation utilities
│   │   └── fixtureManager.ts          # Fixture capture utilities
│   └── tools/
│       ├── allTools.integration.test.ts         # 46 tools integration coverage
│       ├── getMEPs.integration.test.ts
│       ├── getMEPDetails.integration.test.ts
│       ├── getPlenarySessions.integration.test.ts
│       ├── getVotingRecords.integration.test.ts
│       ├── searchDocuments.integration.test.ts
│       ├── getCommitteeInfo.integration.test.ts
│       ├── getParliamentaryQuestions.integration.test.ts
│       ├── analyzeVotingPatterns.integration.test.ts
│       ├── trackLegislation.integration.test.ts
│       └── generateReport.integration.test.ts
└── fixtures/
    └── real-api/                       # Captured real API responses
        ├── get_meps/
        ├── get_mep_details/
        ├── get_plenary_sessions/
        └── ...
```

### Test Helpers

#### Response Validator (`responseValidator.ts`)

Validates MCP tool responses against expected schemas:

```typescript
import { validatePaginatedResponse, validateMEPStructure } from '../helpers/responseValidator.js';

const response = validatePaginatedResponse(result);
response.data.forEach(mep => validateMEPStructure(mep));
```

#### Fixture Manager (`fixtureManager.ts`)

Captures real API responses for offline testing:

```typescript
import { saveMCPResponseFixture } from '../helpers/fixtureManager.js';

saveMCPResponseFixture('get_meps', 'swedish-meps', result);
```

---

## 🔒 Rate Limiting & Best Practices

### European Parliament API Limits

- **Rate Limit**: Approximately 100 requests per 15 minutes per endpoint
- **No Authentication Required**: Public data access
- **Response Format**: JSON-LD (primary), RDF/XML, Turtle

### Respecting Rate Limits

Integration tests implement several strategies to respect rate limits:

1. **Sequential Execution**: Tests run one at a time within each suite
2. **Inter-Test Delays**: 100ms wait between tests (provides breathing room, not strict rate limiting)
3. **Retry Logic**: Exponential backoff for transient failures (adds additional delays on errors)
4. **Caching**: Leverages LRU cache to minimize API calls
5. **Test Execution Strategy**: Run tests manually or on schedule (not on every commit) to avoid overwhelming the API

**Note**: The 100ms inter-test delay is a courtesy pause between tests, not a strict rate limiter. With 107 tests and retry logic, the effective request rate is much lower than the theoretical maximum. The EP API client includes its own rate limiting (100 tokens per minute) that provides the primary throttling mechanism. For production use, tests should be run individually or in small batches rather than the full suite at once.

```typescript
beforeEach(async () => {
  // Wait between tests to respect rate limits
  await new Promise(resolve => setTimeout(resolve, 100));
});
```

### Best Practices

✅ **DO**:
- Run integration tests during off-peak hours
- Use `EP_SAVE_FIXTURES=true` to capture responses for offline testing
- Test with small `limit` values (5-10) to minimize API load
- Review test output for rate limit warnings

❌ **DON'T**:
- Run integration tests in CI/CD on every commit
- Execute concurrent integration test suites
- Use large pagination limits in tests
- Ignore rate limit errors

---

## 📦 Fixture Capture

### Capturing Real API Responses

Fixtures allow offline testing without hitting the real API:

```bash
# Enable fixture capture
EP_INTEGRATION_TESTS=true EP_SAVE_FIXTURES=true npm run test:integration
```

This saves real API responses to `tests/fixtures/real-api/` for:
- Offline development
- Consistent test data
- API response documentation
- Regression testing

### Fixture Structure

```json
{
  "data": [
    {
      "id": "MEP-123",
      "name": "Example MEP",
      "country": "SE",
      "politicalGroup": "EPP",
      "active": true
    }
  ],
  "total": 100,
  "limit": 10,
  "offset": 0
}
```

---

## 🧪 Test Examples

### Basic Tool Test

```typescript
import { describe, it, expect } from 'vitest';
import { handleGetMEPs } from '../../../src/tools/getMEPs.js';
import { shouldRunIntegrationTests } from '../setup.js';
import { validatePaginatedResponse } from '../helpers/responseValidator.js';

const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('get_meps Integration Tests', () => {
  it('should fetch Swedish MEPs from real API', async () => {
    const result = await handleGetMEPs({ country: 'SE', limit: 10 });
    
    const response = validatePaginatedResponse(result);
    expect(response.data).toBeDefined();
    expect(response.total).toBeGreaterThan(0);
  }, 30000);
});
```

### Testing with Retry Logic

```typescript
import { retry } from '../../helpers/testUtils.js';

it('should handle transient failures', async () => {
  const result = await retry(async () => {
    return handleGetMEPs({ country: 'DE', limit: 5 });
  }, 3, 1000); // 3 retries, 1 second base delay
  
  expect(result).toBeDefined();
}, 30000);
```

### Performance Testing

```typescript
import { measureTime } from '../../helpers/testUtils.js';

it('should complete within acceptable time', async () => {
  const [result, duration] = await measureTime(async () => {
    return handleGetMEPs({ limit: 10 });
  });
  
  expect(duration).toBeLessThan(5000); // 5 seconds
  console.log(`Request duration: ${duration.toFixed(2)}ms`);
}, 30000);
```

---

## 🛡️ Security & Compliance

### GDPR Compliance

Integration tests handle personally identifiable information (PII) appropriately:

- ✅ **Data Minimization**: Tests use minimal `limit` values
- ✅ **Purpose Limitation**: Data used only for testing
- ✅ **Storage Limitation**: Fixtures contain no sensitive PII
- ✅ **Audit Logging**: All API access is logged per AU-2

### ISMS Requirements

Tests comply with [Hack23 Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md):

- **SC-002**: Input validation for all tool parameters
- **PE-001**: Performance benchmarks (<200ms cached, <2s uncached)
- **AU-2**: Audit logging for all data access
- **SI-10**: Schema validation for all responses

---

## 📊 Test Execution

### Local Development

```bash
# Run all integration tests
EP_INTEGRATION_TESTS=true npm run test:integration

# Run with coverage
EP_INTEGRATION_TESTS=true npm run test:integration -- --coverage

# Run specific test file
EP_INTEGRATION_TESTS=true npm run test:integration -- getMEPs.integration

# Run in watch mode (not recommended for integration tests)
EP_INTEGRATION_TESTS=true npm run test:integration -- --watch
```

### CI/CD Integration (Optional)

Integration tests can be run on a schedule to avoid overwhelming the API:

```yaml
# .github/workflows/integration-tests.yml (example)
name: Integration Tests (Scheduled)

on:
  schedule:
    - cron: '0 2 * * 1' # Weekly on Monday 2 AM UTC
  workflow_dispatch: # Manual trigger

jobs:
  integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '25'
      - run: npm install
      - run: EP_INTEGRATION_TESTS=true npm run test:integration
```

---

## 🔍 Troubleshooting

### Common Issues

#### Tests Skip Without Running

**Cause**: `EP_INTEGRATION_TESTS` not set to `true`

**Solution**:
```bash
EP_INTEGRATION_TESTS=true npm run test:integration
```

#### Rate Limit Errors

**Cause**: Too many requests to EP API

**Solution**:
- Wait 15 minutes before retrying
- Reduce concurrent test execution
- Use captured fixtures for development

#### Network Timeouts

**Cause**: Slow network or API response

**Solution**:
- Increase test timeout: `it('test name', async () => { ... }, 60000)`
- Check network connectivity
- Verify EP API status

#### Schema Validation Failures

**Cause**: API response structure changed

**Solution**:
- Review API response in test output
- Update schemas in `src/schemas/europeanParliament.ts`
- Capture new fixtures with `EP_SAVE_FIXTURES=true`

### Debug Mode

Enable verbose logging for troubleshooting:

```bash
DEBUG=* EP_INTEGRATION_TESTS=true npm run test:integration
```

---

## 📈 Performance Benchmarks

### Expected Response Times

| Tool | Uncached | Cached | Notes |
|------|----------|--------|-------|
| get_meps | <2s | <1000ms | Basic retrieval |
| get_mep_details | <2s | <1000ms | Individual MEP |
| get_plenary_sessions | <2s | <1000ms | Session data |
| get_voting_records | <3s | <1000ms | Large datasets |
| search_documents | <3s | <1000ms | Full-text search |
| get_committee_info | <2s | <1000ms | Committee data |
| get_parliamentary_questions | <2s | <1000ms | Question data |
| analyze_voting_patterns | <5s | <1000ms | Complex analysis |
| track_legislation | <2s | <1000ms | Procedure tracking |
| generate_report | <5s | <1000ms | Report generation |

### Performance Tests

Each integration test includes performance validation:

```typescript
it('should complete within acceptable time', async () => {
  const [, duration] = await measureTime(async () => {
    return handleGetMEPs({ limit: 10 });
  });
  
  expect(duration).toBeLessThan(5000);
  console.log(`Performance: ${duration.toFixed(2)}ms`);
}, 30000);
```

---

## 🤝 Contributing

When adding new integration tests:

1. ✅ Follow existing test structure and patterns
2. ✅ Include all test categories (retrieval, filtering, pagination, etc.)
3. ✅ Add fixture capture with descriptive names
4. ✅ Respect rate limits with delays and retries
5. ✅ Document any EP API quirks or limitations
6. ✅ Update this guide with new tools or patterns

### Test Template

```typescript
/**
 * Integration Tests: tool_name Tool
 * 
 * ISMS Policy: SC-002 (Secure Testing), PE-001 (Performance Testing)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { handleToolName } from '../../../src/tools/toolName.js';
import { shouldRunIntegrationTests } from '../setup.js';
import { retry, measureTime } from '../../helpers/testUtils.js';
import { validatePaginatedResponse } from '../helpers/responseValidator.js';
import { saveMCPResponseFixture } from '../helpers/fixtureManager.js';

const describeIntegration = shouldRunIntegrationTests() ? describe : describe.skip;

describeIntegration('tool_name Integration Tests', () => {
  beforeEach(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('Basic Retrieval', () => {
    it('should fetch data from real API', async () => {
      const result = await retry(async () => {
        return handleToolName({ limit: 10 });
      });

      saveMCPResponseFixture('tool_name', 'basic-retrieval', result);

      const response = validatePaginatedResponse(result);
      expect(response.data).toBeDefined();
    }, 30000);
  });

  // Add more test categories...
});
```

---

## 📚 Additional Resources

- [European Parliament Open Data Portal](https://data.europarl.europa.eu/en/home)
- [EP API Documentation](https://data.europarl.europa.eu/en/developer-corner)
- [Hack23 ISMS Policies](https://github.com/Hack23/ISMS-PUBLIC)
- [Hack23 Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
- [GDPR Compliance Guide](https://gdpr.eu/)
- [Vitest Documentation](https://vitest.dev/)

---

## 📝 Summary

Integration tests validate that the European Parliament MCP Server correctly interfaces with the real EP Open Data API. By respecting rate limits, capturing fixtures, and following ISMS guidelines, these tests ensure production readiness while maintaining compliance with security and privacy requirements.

**Remember**: Integration tests should be run thoughtfully to avoid overwhelming the EP API. Use fixtures for development and reserve live API tests for validation and scheduled runs.
