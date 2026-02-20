<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🧪 European Parliament MCP Server — Unit Test Plan</h1>

<p align="center">
  <strong>🛡️ Comprehensive Testing Strategy and Coverage Plan</strong><br>
  <em>📊 Ensuring Quality Through Systematic Test Coverage</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.0-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--02--20-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Review-Quarterly-orange?style=for-the-badge" alt="Review Cycle"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.0 | **📅 Last Updated:** 2026-02-20 (UTC)  
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-05-20  
**🏷️ Classification:** Public (Open Source MCP Server)

---

## 📑 Table of Contents

- [Purpose](#-purpose)
- [Test Framework](#-test-framework)
- [Coverage Targets](#-coverage-targets)
- [Test Categories](#-test-categories)
- [Test Matrix](#-test-matrix)
- [Security Testing](#️-security-testing)
- [E2E Testing](#-e2e-testing)
- [CI Integration](#-ci-integration)
- [Policy Alignment](#-policy-alignment)
- [Related Documents](#-related-documents)

---

## 🎯 Purpose

This unit test plan defines the testing strategy, coverage targets, and quality gates for the European Parliament MCP Server. It ensures comprehensive validation of all MCP tools, API client functionality, input validation, and error handling.

---

## 🔧 Test Framework

| Component | Tool | Purpose |
|-----------|------|---------|
| **Test Runner** | Vitest | Unit and integration testing |
| **Assertions** | Vitest expect | Test assertions |
| **Mocking** | vi.mock / vi.fn | External dependency mocking |
| **Coverage** | v8 (via Vitest) | Code coverage reporting |
| **E2E Runner** | Vitest | End-to-end integration tests |

### **📂 Test File Convention**

```
src/
├── tools/
│   ├── getMEPs.ts
│   ├── getMEPs.test.ts          ← Colocated unit tests
│   ├── getVotingRecords.ts
│   └── getVotingRecords.test.ts
├── clients/
│   ├── europeanParliamentClient.ts
│   └── europeanParliamentClient.test.ts
tests/
├── e2e/
│   ├── fullWorkflow.e2e.test.ts  ← E2E integration tests
│   └── mepQueries.e2e.test.ts
```

---

## 📊 Coverage Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Line Coverage** | ≥ 80% | 80%+ | ✅ |
| **Branch Coverage** | ≥ 70% | 70%+ | ✅ |
| **Function Coverage** | ≥ 80% | 80%+ | ✅ |
| **Security Code Coverage** | ≥ 95% | 90%+ | ⚠️ |

### **📈 Coverage by Module**

| Module | Target | Priority |
|--------|--------|----------|
| `src/tools/` | 85% | 🔴 Critical |
| `src/clients/` | 80% | 🔴 Critical |
| `src/schemas/` | 90% | 🟠 High |
| `src/resources/` | 80% | 🟡 Medium |
| `src/prompts/` | 75% | 🟡 Medium |
| `src/index.ts` | 70% | 🟡 Medium |

---

## 🧪 Test Categories

### **1. Unit Tests**

Tests for individual functions and modules in isolation.

```typescript
describe('get_meps Tool', () => {
  it('should return MEPs filtered by country', async () => {
    // Mock EP API response
    vi.mock('../clients/europeanParliamentClient');
    const result = await getMeps({ country: 'SE' });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should handle API errors gracefully', async () => {
    // Mock API error
    vi.mocked(epClient.get).mockRejectedValue(new Error('API Error'));
    await expect(getMeps()).rejects.toThrow();
  });
});
```

### **2. Input Validation Tests**

Tests for Zod schema validation on all MCP tool inputs.

| Test Case | Input | Expected |
|-----------|-------|----------|
| Valid country code | `{ country: "SE" }` | ✅ Pass |
| Invalid country code | `{ country: "XX" }` | ❌ Validation error (invalid country code rejected) |
| Empty string | `{ country: "" }` | ❌ Validation error (empty string rejected) |
| Missing required field | `{}` | ❌ Validation error (required field missing) |
| Injection attempt | `{ country: "'; DROP TABLE--" }` | ❌ Validation error (malformed input rejected) |
| Excessive length | `{ country: "A".repeat(1000) }` | ❌ Validation error (excessive length rejected) |

### **3. Error Handling Tests**

| Scenario | Expected Behavior |
|----------|-------------------|
| API timeout | Graceful error with message |
| API 404 | Empty result set |
| API 500 | Error propagation with context |
| Network error | Retry or graceful failure |
| Invalid response format | Validation error |
| Rate limit exceeded | Rate limit error message |

### **4. Integration Tests**

Tests for component interactions (API client + tool handlers).

| Test | Components | Purpose |
|------|-----------|---------|
| Tool + API client | Tool handler, EP client | Request/response flow |
| Cache integration | Tool handler, LRU cache | Cache hit/miss behavior |
| Rate limiter | API client, rate limiter | Throttling behavior |

---

## 📋 Test Matrix

### **🔌 MCP Tool Tests**

| Tool | Unit Tests | Input Validation | Error Handling | Status |
|------|-----------|-----------------|----------------|--------|
| `get_meps` | ✅ | ✅ | ✅ | Complete |
| `get_plenary_sessions` | ✅ | ✅ | ✅ | Complete |
| `get_voting_records` | ✅ | ✅ | ✅ | Complete |
| `search_documents` | ✅ | ✅ | ✅ | Complete |
| `get_committee_info` | ✅ | ✅ | ✅ | Complete |
| `get_parliamentary_questions` | ✅ | ✅ | ✅ | Complete |
| `analyze_voting_patterns` | ✅ | ✅ | ✅ | Complete |
| `track_legislation` | ✅ | ✅ | ✅ | Complete |
| `get_mep_details` | ✅ | ✅ | ✅ | Complete |
| `generate_report` | ✅ | ✅ | ✅ | Complete |

### **🌐 API Client Tests**

| Test Area | Tests | Status |
|-----------|-------|--------|
| HTTP request construction | URL building, headers, params | ✅ |
| Response parsing | JSON parsing, type validation | ✅ |
| Error handling | Timeouts, HTTP errors, network | ✅ |
| Rate limiting | Request throttling | ✅ |
| Base URL normalization | Trailing slash handling | ✅ |
| Timeout configuration | Environment variable validation | ✅ |

---

## 🛡️ Security Testing

| Security Test | Description | Priority |
|--------------|-------------|----------|
| Input injection | SQL/NoSQL injection via tool params | 🔴 Critical |
| XSS via output | Malicious content in EP API responses | 🟠 High |
| Parameter tampering | Invalid/malicious parameter values | 🔴 Critical |
| Rate limit bypass | Circumventing rate limiting | 🟡 Medium |
| Error information leakage | Sensitive data in error messages | 🟠 High |
| Prototype pollution | Object prototype manipulation | 🟡 Medium |

---

## 🔌 E2E Testing

### **📋 E2E Test Suite**

| Test | Description | Timeout |
|------|-------------|---------|
| Full workflow | All 10 tools sequentially | 65s |
| MEP queries | Country/group filtering | 65s |
| Voting records | Vote data retrieval | 65s |
| Document search | Text search functionality | 65s |
| Committee info | Committee data access | 65s |
| Error scenarios | Invalid inputs, timeouts | 65s |

### **⚙️ E2E Configuration**

```
EP_REQUEST_TIMEOUT_MS=60000  (API timeout)
E2E_TEST_TIMEOUT_MS=65000    (test timeout = API + 5s overhead)
```

---

## 🔄 CI Integration

### **📋 Test Execution in CI**

```yaml
# Unit tests
npm test

# E2E tests (requires build first)
npm run build
npm run test:e2e

# Coverage report
npm run test:coverage
```

### **📊 Quality Gates**

| Gate | Threshold | Action on Failure |
|------|-----------|-------------------|
| Unit tests | 100% pass | ❌ Block merge |
| E2E tests | 100% pass | ❌ Block merge |
| Line coverage | ≥ 80% | ❌ Block merge |
| Branch coverage | ≥ 70% | ⚠️ Warning |
| ESLint | 0 errors | ❌ Block merge |

---

## 🔗 Policy Alignment

| ISMS Policy | Relevance | Link |
|-------------|-----------|------|
| 🔒 Secure Development | Testing requirements (80%+ coverage) | [Secure_Development_Policy.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) |
| 🔍 Vulnerability Management | Security test requirements | [Vulnerability_Management.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Vulnerability_Management.md) |
| 🏷️ Classification | Risk-based test prioritization | [CLASSIFICATION.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) |

---

## 📚 Related Documents

| Document | Description | Link |
|----------|-------------|------|
| 📊 Test Coverage Report | Historical coverage snapshot | [TEST_COVERAGE_REPORT.md](../TEST_COVERAGE_REPORT.md) |
| 📈 Current Coverage Metrics | Latest generated coverage summary (JSON) | [coverage/coverage-summary.json](coverage/coverage-summary.json) |
| 🧪 Integration Testing | Integration test guide | [../INTEGRATION_TESTING.md](../INTEGRATION_TESTING.md) |
| 🏛️ Architecture | System architecture | [../ARCHITECTURE.md](../ARCHITECTURE.md) |
| 🛡️ Security Architecture | Security controls tested | [../SECURITY_ARCHITECTURE.md](../SECURITY_ARCHITECTURE.md) |

---

<p align="center">
  <em>This unit test plan is maintained as part of the <a href="https://github.com/Hack23/ISMS-PUBLIC">Hack23 AB ISMS</a> framework.</em><br>
  <em>Licensed under <a href="../LICENSE.md">Apache-2.0</a></em>
</p>
