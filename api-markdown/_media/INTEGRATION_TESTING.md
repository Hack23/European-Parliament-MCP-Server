# Integration Testing Guide

## 📋 Overview

This guide explains how to run integration tests for the European Parliament MCP Server. Integration tests validate that all 39 MCP tools work correctly against the real European Parliament Open Data API. **All tools return real data — no mock or placeholder data is used.**

**ISMS Policy**: [Hack23 Secure Development Policy - Testing](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md#testing)

**Compliance**: ISO 27001 (AU-2), NIST CSF 2.0 (DE.CM-6), CIS Controls v8.1 (8.11)

---

## 🎯 Integration Test Coverage

### All 39 MCP Tools Tested

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

**EP Data Access Tools — Phase 4** (8 — real EP API v2):
21. **get_current_meps** - Currently serving MEPs
22. **get_speeches** - Plenary speeches
23. **get_procedures** - Legislative procedures
24. **get_adopted_texts** - Adopted legislative texts
25. **get_events** - Parliamentary events
26. **get_meeting_activities** - Meeting activity records
27. **get_meeting_decisions** - Meeting decision outcomes
28. **get_mep_declarations** - MEP financial declarations

**EP Complete Coverage Tools — Phase 5** (11 — real EP API v2):
29. **get_incoming_meps** - Incoming MEPs (new members)
30. **get_outgoing_meps** - Outgoing MEPs (departing members)
31. **get_homonym_meps** - MEPs with duplicate names
32. **get_plenary_documents** - Plenary-specific documents
33. **get_committee_documents** - Committee-specific documents
34. **get_plenary_session_documents** - Session-specific documents
35. **get_plenary_session_document_items** - Document items within sessions
36. **get_controlled_vocabularies** - EP controlled vocabulary terms
37. **get_external_documents** - External reference documents
38. **get_meeting_foreseen_activities** - Planned meeting activities
39. **get_procedure_events** - Events linked to a procedure

> **No Mock Data**: All 39 tools are validated to return real data from the EP API. The integration test suite (`allTools.integration.test.ts`) explicitly checks that no tool returns `confidenceLevel: 'NONE'` or `PLACEHOLDER DATA` markers.

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

## 🚀 Quick Start

### Prerequisites

- Node.js 24.x or higher
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
│       ├── allTools.integration.test.ts         # All 39 tools coverage
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
          node-version: '24'
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
