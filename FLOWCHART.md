<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🔄 European Parliament MCP Server - Process Flowcharts</h1>

<p align="center">
  <strong>Business Process and Data Flows</strong><br>
  <em>Comprehensive Workflow Documentation for Operations and Compliance</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-Architect-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.0-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--02--17-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Review-Quarterly-orange?style=for-the-badge" alt="Review Cycle"/></a>
</p>

**📋 Document Owner:** Architecture Team | **📄 Version:** 1.0 | **📅 Last Updated:** 2026-02-17 (UTC)  
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-08-17  
**🏷️ Classification:** Public (Open Source MCP Server)  
**✅ ISMS Compliance:** ISO 27001 (A.8.1), NIST CSF 2.0 (ID.AM), CIS Controls v8.1 (2.1)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [MCP Tool Invocation Workflow](#mcp-tool-invocation-workflow)
3. [Cache Management Flow](#cache-management-flow)
4. [Rate Limiting Flow](#rate-limiting-flow)
5. [Error Handling Workflow](#error-handling-workflow)
6. [Data Retrieval and Transformation](#data-retrieval-and-transformation)
7. [Monitoring and Metrics Collection](#monitoring-and-metrics-collection)
8. [CI/CD Deployment Pipeline](#cicd-deployment-pipeline)
9. [Future Authentication Flow](#future-authentication-flow)

---

## 🎯 Overview

This document provides comprehensive flowcharts for all business processes and data flows in the European Parliament MCP Server. All diagrams use Mermaid syntax for version control and transparency.

**Purpose:**
- Document operational workflows for maintenance and troubleshooting
- Provide audit trail for security and compliance reviews
- Enable new developer onboarding with visual process maps
- Support architectural decision making and optimization

---

## 🔧 MCP Tool Invocation Workflow

### Primary Tool Execution Flow

```mermaid
flowchart TD
    Start([MCP Client Request]) --> ValidateSchema[Validate Input Schema]
    ValidateSchema -->|Invalid| ValidationError[Return ValidationError]
    ValidateSchema -->|Valid| CheckAuth{Authentication<br/>Enabled?}
    
    CheckAuth -->|Yes| VerifyToken[Verify OAuth Token]
    CheckAuth -->|No| CheckRateLimit
    VerifyToken -->|Invalid| AuthError[Return 401 Unauthorized]
    VerifyToken -->|Valid| CheckRateLimit{Check Rate Limit}
    
    CheckRateLimit -->|Exceeded| RateLimitError[Return 429 Rate Limit]
    CheckRateLimit -->|OK| LogRequest[Log Audit Event]
    
    LogRequest --> CheckCache{Check Cache}
    CheckCache -->|Hit| CacheMetrics[Update Cache Metrics]
    CheckCache -->|Miss| FetchAPI[Fetch from EP API]
    
    FetchAPI -->|Success| TransformData[Transform JSON-LD → Internal]
    FetchAPI -->|Error| APIError[Handle API Error]
    
    TransformData --> ValidateData[Validate Response Data]
    ValidateData -->|Invalid| DataError[Return Data Quality Error]
    ValidateData -->|Valid| UpdateCache[Update Cache]
    
    UpdateCache --> FormatMCP[Format MCP Response]
    CacheMetrics --> FormatMCP
    
    FormatMCP --> RecordMetrics[Record Performance Metrics]
    RecordMetrics --> LogSuccess[Log Success Event]
    LogSuccess --> End([Return MCP Response])
    
    ValidationError --> LogFailure[Log Failure Event]
    AuthError --> LogFailure
    RateLimitError --> LogFailure
    APIError --> LogFailure
    DataError --> LogFailure
    LogFailure --> End
    
    style Start fill:#e1f5e1
    style End fill:#e1f5e1
    style ValidationError fill:#ffe1e1
    style AuthError fill:#ffe1e1
    style RateLimitError fill:#ffe1e1
    style APIError fill:#ffe1e1
    style DataError fill:#ffe1e1
    style CheckCache fill:#e1e5ff
    style UpdateCache fill:#e1e5ff
```

**Key Process Steps:**
1. **Input Validation** - Zod schema validation prevents invalid requests
2. **Authentication** - Future OAuth 2.0 integration (currently no-auth)
3. **Rate Limiting** - Token bucket algorithm (100 req/15min)
4. **Audit Logging** - Winston structured logging for all requests
5. **Cache Check** - LRU cache (15-min TTL) for performance
6. **API Integration** - EP Open Data API with retry logic
7. **Data Transformation** - JSON-LD → Internal TypeScript types
8. **Response Formatting** - MCP protocol compliance
9. **Metrics Recording** - Prometheus-style metrics collection

---

## 💾 Cache Management Flow

### Cache Hit/Miss Processing

```mermaid
flowchart TD
    Request[Incoming Request] --> GenerateKey[Generate Cache Key]
    GenerateKey --> CheckCache{Cache<br/>Lookup}
    
    CheckCache -->|Hit| ValidateTTL{TTL<br/>Valid?}
    CheckCache -->|Miss| CacheMiss[Cache Miss Event]
    
    ValidateTTL -->|Expired| CacheExpired[Cache Expired Event]
    ValidateTTL -->|Valid| IncrementHit[Increment Cache Hit Counter]
    
    IncrementHit --> LogCacheHit[Log Cache Hit]
    LogCacheHit --> ReturnCached[Return Cached Data]
    ReturnCached --> UpdateMetrics[Update Cache Hit Metrics]
    
    CacheMiss --> IncrementMiss[Increment Cache Miss Counter]
    CacheExpired --> IncrementMiss
    
    IncrementMiss --> FetchExternal[Fetch from External API]
    FetchExternal -->|Success| StoreCache[Store in Cache]
    FetchExternal -->|Error| ErrorHandle[Handle Error]
    
    StoreCache --> CheckSize{Cache<br/>Size Limit?}
    CheckSize -->|Full| EvictLRU[Evict LRU Entry]
    CheckSize -->|OK| UpdateMissMetrics
    
    EvictLRU --> LogEviction[Log Cache Eviction]
    LogEviction --> UpdateMissMetrics[Update Cache Miss Metrics]
    
    UpdateMissMetrics --> ReturnData[Return Fresh Data]
    UpdateMetrics --> End([Complete])
    ReturnData --> End
    ErrorHandle --> End
    
    style Request fill:#e1f5e1
    style End fill:#e1f5e1
    style CheckCache fill:#e1e5ff
    style StoreCache fill:#e1e5ff
    style EvictLRU fill:#fff3cd
    style ErrorHandle fill:#ffe1e1
```

**Cache Configuration:**
- **Algorithm**: LRU (Least Recently Used)
- **Max Size**: 500 entries
- **TTL**: 15 minutes (900 seconds)
- **Key Strategy**: `${toolName}:${JSON.stringify(params)}`
- **GDPR Compliance**: No persistent storage, automatic expiration

**Cache Key Examples:**
```typescript
// MEP list query
"get_meps:{\"country\":\"SE\",\"limit\":50,\"offset\":0}"

// MEP details query
"get_mep_details:{\"id\":\"124810\"}"

// Plenary sessions query
"get_plenary_sessions:{\"dateFrom\":\"2024-01-01\",\"limit\":25}"
```

---

## 🚦 Rate Limiting Flow

### Token Bucket Algorithm Implementation

```mermaid
flowchart TD
    Request[Incoming Request] --> GetClientId[Extract Client Identifier]
    GetClientId --> GetBucket{Bucket<br/>Exists?}
    
    GetBucket -->|No| CreateBucket[Create New Bucket]
    GetBucket -->|Yes| RefillTokens[Refill Tokens Based on Time]
    
    CreateBucket --> InitTokens[Initialize: 100 Tokens]
    InitTokens --> RefillTokens
    
    RefillTokens --> CheckTokens{Tokens<br/>Available?}
    
    CheckTokens -->|Yes| ConsumeToken[Consume 1 Token]
    CheckTokens -->|No| RateLimitExceeded[Rate Limit Exceeded]
    
    ConsumeToken --> UpdateBucket[Update Bucket State]
    UpdateBucket --> LogSuccess[Log Successful Request]
    LogSuccess --> AllowRequest[Allow Request Processing]
    
    RateLimitExceeded --> CalcRetryAfter[Calculate Retry-After Time]
    CalcRetryAfter --> LogBlock[Log Rate Limit Block]
    LogBlock --> ReturnError[Return 429 Error]
    
    AllowRequest --> End([Continue to Tool Handler])
    ReturnError --> End([Return Error Response])
    
    style Request fill:#e1f5e1
    style AllowRequest fill:#e1f5e1
    style RateLimitExceeded fill:#ffe1e1
    style ReturnError fill:#ffe1e1
    style CheckTokens fill:#e1e5ff
    style CreateBucket fill:#fff3cd
```

**Rate Limit Configuration:**
- **Capacity**: 100 tokens per bucket
- **Refill Rate**: 100 tokens per 15 minutes (0.111 tokens/second)
- **Identifier**: Client IP address (future: OAuth client ID)
- **Response**: HTTP 429 with `Retry-After` header

**Example Rate Limit Response:**
```json
{
  "error": {
    "type": "RateLimitError",
    "message": "Rate limit exceeded. Try again in 240 seconds.",
    "retryAfter": 240,
    "limit": 100,
    "window": 900
  }
}
```

---

## ⚠️ Error Handling Workflow

### Comprehensive Error Processing

```mermaid
flowchart TD
    Error[Error Occurs] --> ClassifyError{Error<br/>Type?}
    
    ClassifyError -->|Validation| ValidationFlow[Validation Error Flow]
    ClassifyError -->|Authentication| AuthFlow[Auth Error Flow]
    ClassifyError -->|Rate Limit| RateLimitFlow[Rate Limit Flow]
    ClassifyError -->|API Error| APIFlow[API Error Flow]
    ClassifyError -->|Data Quality| DataFlow[Data Quality Flow]
    ClassifyError -->|Internal| InternalFlow[Internal Error Flow]
    
    ValidationFlow --> LogValidation[Log with Validation Details]
    LogValidation --> Return400[Return 400 Bad Request]
    
    AuthFlow --> LogAuth[Log with Auth Context]
    LogAuth --> Return401[Return 401 Unauthorized]
    
    RateLimitFlow --> LogRateLimit[Log with Rate Limit Info]
    LogRateLimit --> Return429[Return 429 Too Many Requests]
    
    APIFlow --> LogAPI[Log with API Context]
    LogAPI --> CheckRetry{Retryable?}
    CheckRetry -->|Yes| RetryRequest[Retry with Backoff]
    CheckRetry -->|No| Return502[Return 502 Bad Gateway]
    
    RetryRequest -->|Success| ReturnSuccess[Return Successful Response]
    RetryRequest -->|Max Retries| Return502
    
    DataFlow --> LogData[Log with Data Context]
    LogData --> Return422[Return 422 Unprocessable Entity]
    
    InternalFlow --> LogInternal[Log with Stack Trace]
    LogInternal --> SanitizeError[Sanitize Error Message]
    SanitizeError --> Return500[Return 500 Internal Server Error]
    
    Return400 --> IncrementMetrics[Increment Error Metrics]
    Return401 --> IncrementMetrics
    Return429 --> IncrementMetrics
    Return502 --> IncrementMetrics
    Return422 --> IncrementMetrics
    Return500 --> IncrementMetrics
    ReturnSuccess --> IncrementSuccess[Increment Success Metrics]
    
    IncrementMetrics --> CheckAlerts{Error Rate<br/>Threshold?}
    IncrementSuccess --> End([Complete])
    
    CheckAlerts -->|High| TriggerAlert[Trigger Alert]
    CheckAlerts -->|Normal| End
    TriggerAlert --> End
    
    style Error fill:#ffe1e1
    style Return400 fill:#fff3cd
    style Return401 fill:#ffe1e1
    style Return429 fill:#fff3cd
    style Return502 fill:#ffe1e1
    style Return422 fill:#fff3cd
    style Return500 fill:#ffe1e1
    style ReturnSuccess fill:#e1f5e1
    style TriggerAlert fill:#ffe1e1
```

**Error Categories:**
1. **Validation Errors (400)** - Invalid input parameters
2. **Authentication Errors (401)** - Invalid or missing credentials
3. **Rate Limit Errors (429)** - Too many requests
4. **API Errors (502)** - External API failures
5. **Data Quality Errors (422)** - Invalid response data
6. **Internal Errors (500)** - Unexpected server errors

**Error Handling Best Practices:**
- **Never expose internal details** - Sanitize error messages for clients
- **Always log full context** - Include stack traces in logs
- **Implement retry logic** - Exponential backoff for transient failures
- **Monitor error rates** - Alert on abnormal patterns
- **Maintain error budget** - Track SLI/SLO compliance

---

## 🔄 Data Retrieval and Transformation

### EP API Integration Flow

```mermaid
flowchart TD
    ToolRequest[Tool Request] --> BuildURL[Build EP API URL]
    BuildURL --> AddHeaders[Add HTTP Headers]
    AddHeaders --> SendRequest[Send HTTP Request]
    
    SendRequest -->|Success| CheckStatus{HTTP<br/>Status?}
    SendRequest -->|Network Error| RetryLogic[Retry with Backoff]
    
    CheckStatus -->|200 OK| ParseJSON[Parse JSON-LD Response]
    CheckStatus -->|4xx Client Error| ClientError[Handle Client Error]
    CheckStatus -->|5xx Server Error| ServerError[Handle Server Error]
    
    ParseJSON -->|Success| ValidateStructure{Valid<br/>Structure?}
    ParseJSON -->|Parse Error| ParseError[Handle Parse Error]
    
    ValidateStructure -->|Yes| TransformData[Transform to Internal Model]
    ValidateStructure -->|No| StructureError[Handle Structure Error]
    
    TransformData --> ExtractFields[Extract JSON-LD Fields]
    ExtractFields --> NormalizeData[Normalize Data Types]
    NormalizeData --> EnrichData[Enrich with Metadata]
    EnrichData --> ValidateOutput{Output<br/>Valid?}
    
    ValidateOutput -->|Yes| CacheResult[Cache Transformed Data]
    ValidateOutput -->|No| ValidationError[Handle Validation Error]
    
    CacheResult --> FormatResponse[Format MCP Response]
    FormatResponse --> Success[Return Success]
    
    RetryLogic -->|Retry| SendRequest
    RetryLogic -->|Max Retries| Failed[Return Error]
    
    ClientError --> Failed
    ServerError --> Failed
    ParseError --> Failed
    StructureError --> Failed
    ValidationError --> Failed
    
    Success --> End([Complete])
    Failed --> End
    
    style ToolRequest fill:#e1f5e1
    style Success fill:#e1f5e1
    style Failed fill:#ffe1e1
    style TransformData fill:#e1e5ff
    style CacheResult fill:#e1e5ff
```

**EP API Integration Details:**
- **Base URL**: `https://data.europarl.europa.eu/api/v2/`
- **Format**: JSON-LD (application/ld+json)
- **Authentication**: None (public API)
- **Rate Limit**: 500 requests per 5 minutes per endpoint
- **Retry Strategy**: 3 retries with exponential backoff (1s, 2s, 4s)

**Data Transformation Pipeline:**
1. **JSON-LD Parsing** - Parse @context and extract data arrays
2. **Field Mapping** - Map JSON-LD field names to internal types
3. **Type Coercion** - Convert strings to proper TypeScript types
4. **Normalization** - Standardize date formats, IDs, enums
5. **Enrichment** - Add derived fields (e.g., full names, formatted dates)
6. **Validation** - Zod schema validation for type safety

**Example Transformation:**
```typescript
// EP API JSON-LD Response
{
  "@context": [...],
  "data": [{
    "person/124810": {
      "label": "Petter JÄRNVALL",
      "eli-dl:activity_date": "2024-07-16T00:00:00Z",
      "hasLocality": "FRA_SXB"
    }
  }]
}

// Transformed Internal Model
{
  id: "124810",
  name: "Petter JÄRNVALL",
  activityDate: "2024-07-16",
  location: "Strasbourg",
  country: "Sweden",
  politicalGroup: "S&D"
}
```

---

## 📊 Monitoring and Metrics Collection

### Metrics Collection Flow

```mermaid
flowchart TD
    Event[System Event] --> ClassifyMetric{Metric<br/>Type?}
    
    ClassifyMetric -->|Counter| IncrementCounter[Increment Counter]
    ClassifyMetric -->|Gauge| SetGauge[Set Gauge Value]
    ClassifyMetric -->|Histogram| RecordHistogram[Record Histogram Sample]
    
    IncrementCounter --> UpdateCounter[Update Counter State]
    SetGauge --> UpdateGauge[Update Gauge State]
    RecordHistogram --> UpdateHistogram[Update Histogram State]
    
    UpdateCounter --> CheckLabels{Has<br/>Labels?}
    UpdateGauge --> CheckLabels
    UpdateHistogram --> CheckLabels
    
    CheckLabels -->|Yes| StoreWithLabels[Store with Label Dimensions]
    CheckLabels -->|No| StoreGlobal[Store Global Metric]
    
    StoreWithLabels --> CheckThreshold{Threshold<br/>Exceeded?}
    StoreGlobal --> CheckThreshold
    
    CheckThreshold -->|Yes| TriggerAlert[Trigger Alert]
    CheckThreshold -->|No| UpdateDashboard[Update Dashboard]
    
    TriggerAlert --> LogAlert[Log Alert Event]
    LogAlert --> UpdateDashboard
    
    UpdateDashboard --> ExportMetrics{Export<br/>Enabled?}
    
    ExportMetrics -->|Yes| FormatPrometheus[Format Prometheus Metrics]
    ExportMetrics -->|No| End
    
    FormatPrometheus --> ExposeEndpoint[Expose /metrics Endpoint]
    ExposeEndpoint --> End([Complete])
    
    style Event fill:#e1f5e1
    style End fill:#e1f5e1
    style TriggerAlert fill:#ffe1e1
    style CheckThreshold fill:#e1e5ff
    style ExportMetrics fill:#e1e5ff
```

**Collected Metrics:**

**Counters:**
- `mcp_requests_total{tool, status}` - Total requests per tool
- `cache_hits_total{tool}` - Cache hit count
- `cache_misses_total{tool}` - Cache miss count
- `rate_limit_exceeded_total` - Rate limit violations
- `errors_total{type, tool}` - Error count by type

**Gauges:**
- `cache_size` - Current cache entry count
- `active_connections` - Active MCP connections
- `rate_limit_tokens{client}` - Available rate limit tokens

**Histograms:**
- `request_duration_seconds{tool}` - Request latency (p50, p95, p99)
- `api_response_time_seconds{endpoint}` - EP API response time
- `cache_latency_seconds` - Cache operation latency

**Alert Thresholds:**
- Error rate > 5% over 5 minutes
- p95 latency > 2 seconds
- Cache hit rate < 60%
- Rate limit violations > 10/minute

---

## 🚀 CI/CD Deployment Pipeline

### GitHub Actions Workflow

```mermaid
flowchart TD
    Push[Git Push] --> Trigger[GitHub Actions Trigger]
    Trigger --> Checkout[Checkout Code]
    Checkout --> SetupNode[Setup Node.js 24.x]
    
    SetupNode --> InstallDeps[Install Dependencies]
    InstallDeps --> Lint[ESLint Code Quality]
    Lint -->|Pass| TypeCheck[TypeScript Type Check]
    Lint -->|Fail| FailedLint[Report Lint Errors]
    
    TypeCheck -->|Pass| UnitTests[Run Unit Tests]
    TypeCheck -->|Fail| FailedType[Report Type Errors]
    
    UnitTests -->|Pass| CoverageCheck{Coverage<br/>>= 80%?}
    UnitTests -->|Fail| FailedTests[Report Test Failures]
    
    CoverageCheck -->|Yes| Build[Build TypeScript]
    CoverageCheck -->|No| FailedCoverage[Report Coverage Failure]
    
    Build -->|Success| IntegrationTests[Run Integration Tests]
    Build -->|Fail| FailedBuild[Report Build Errors]
    
    IntegrationTests -->|Pass| E2ETests[Run E2E Tests]
    IntegrationTests -->|Fail| FailedIntegration[Report Integration Failures]
    
    E2ETests -->|Pass| SecurityScan[CodeQL Security Scan]
    E2ETests -->|Fail| FailedE2E[Report E2E Failures]
    
    SecurityScan -->|Pass| DependencyCheck[Dependency Audit]
    SecurityScan -->|Vulnerabilities| FailedSecurity[Report Security Issues]
    
    DependencyCheck -->|Pass| BuildArtifacts[Build Release Artifacts]
    DependencyCheck -->|Vulnerabilities| FailedDeps[Report Dependency Issues]
    
    BuildArtifacts --> PublishNPM[Publish to NPM]
    PublishNPM --> CreateRelease[Create GitHub Release]
    CreateRelease --> UpdateDocs[Update Documentation]
    UpdateDocs --> Success[Deployment Complete]
    
    FailedLint --> NotifyFailure[Notify Failure]
    FailedType --> NotifyFailure
    FailedTests --> NotifyFailure
    FailedCoverage --> NotifyFailure
    FailedBuild --> NotifyFailure
    FailedIntegration --> NotifyFailure
    FailedE2E --> NotifyFailure
    FailedSecurity --> NotifyFailure
    FailedDeps --> NotifyFailure
    
    Success --> End([End])
    NotifyFailure --> End
    
    style Push fill:#e1f5e1
    style Success fill:#e1f5e1
    style NotifyFailure fill:#ffe1e1
    style FailedLint fill:#ffe1e1
    style FailedType fill:#ffe1e1
    style FailedTests fill:#ffe1e1
    style FailedCoverage fill:#ffe1e1
    style FailedBuild fill:#ffe1e1
    style FailedIntegration fill:#ffe1e1
    style FailedE2E fill:#ffe1e1
    style FailedSecurity fill:#ffe1e1
    style FailedDeps fill:#ffe1e1
```

**Pipeline Stages:**
1. **Code Quality** - ESLint with complexity checks (<10)
2. **Type Safety** - TypeScript strict mode validation
3. **Unit Tests** - Vitest with 80% coverage requirement
4. **Build** - TypeScript → JavaScript compilation
5. **Integration Tests** - MCP protocol integration tests
6. **E2E Tests** - Full workflow validation
7. **Security Scan** - CodeQL analysis, dependency audit
8. **Deployment** - NPM publish, GitHub release

**Pipeline SLAs:**
- Build time: < 10 minutes (target: 5 minutes)
- Test execution: < 5 minutes (target: 2 minutes)
- Deployment time: < 2 minutes
- Total pipeline: < 15 minutes end-to-end

---

## 🔐 Future Authentication Flow

### OAuth 2.0 Integration (Planned Q2 2026)

```mermaid
flowchart TD
    ClientRequest[Client Request] --> CheckToken{OAuth Token<br/>Present?}
    
    CheckToken -->|No| RedirectAuth[Redirect to OAuth Provider]
    CheckToken -->|Yes| ValidateToken[Validate Access Token]
    
    RedirectAuth --> UserAuth[User Authentication]
    UserAuth --> GrantConsent[Grant Consent]
    GrantConsent --> IssueToken[Issue Access Token]
    IssueToken --> ReturnToken[Return Token to Client]
    ReturnToken --> ValidateToken
    
    ValidateToken --> CheckExpiry{Token<br/>Expired?}
    
    CheckExpiry -->|Yes| RefreshToken{Refresh Token<br/>Available?}
    CheckExpiry -->|No| CheckScope{Has Required<br/>Scope?}
    
    RefreshToken -->|Yes| IssueNewToken[Issue New Access Token]
    RefreshToken -->|No| RedirectAuth
    IssueNewToken --> CheckScope
    
    CheckScope -->|Yes| CheckRole{Has Required<br/>Role?}
    CheckScope -->|No| InsufficientScope[Return 403 Forbidden]
    
    CheckRole -->|Yes| AuditLog[Log Access Event]
    CheckRole -->|No| InsufficientRole[Return 403 Forbidden]
    
    AuditLog --> AllowRequest[Allow Request]
    AllowRequest --> End([Continue to Tool Handler])
    
    InsufficientScope --> End
    InsufficientRole --> End
    
    style ClientRequest fill:#e1f5e1
    style AllowRequest fill:#e1f5e1
    style InsufficientScope fill:#ffe1e1
    style InsufficientRole fill:#ffe1e1
    style CheckToken fill:#e1e5ff
    style ValidateToken fill:#e1e5ff
```

**OAuth 2.0 Configuration (Planned):**
- **Provider**: GitHub OAuth, Auth0, or Keycloak
- **Grant Type**: Authorization Code with PKCE
- **Scopes**: `read:meps`, `read:plenary`, `read:documents`, `admin`
- **Token Lifetime**: 1 hour (access), 7 days (refresh)
- **Storage**: Redis for token cache, PostgreSQL for refresh tokens

**RBAC Roles (Planned):**
- `anonymous` - Public read-only access (rate limited)
- `user` - Authenticated access (higher rate limits)
- `premium` - Premium features (advanced analytics, exports)
- `admin` - Full access including system management

---

## 📋 ISMS Compliance Mapping

### ISO 27001 Controls

| Control | Requirement | Implementation |
|---------|------------|----------------|
| A.8.1 | Inventory of Assets | Architecture documentation, dependency SBOM |
| A.8.2 | Information Classification | Data classification in DATA_MODEL.md |
| A.8.3 | Media Handling | No persistent storage, cache-only architecture |
| A.12.1 | Operational Procedures | CI/CD automation, deployment runbooks |
| A.12.4 | Logging and Monitoring | Winston audit logging, Prometheus metrics |
| A.14.2 | Security in Development | SAST/SCA/DAST in CI/CD pipeline |

### NIST CSF 2.0 Functions

| Function | Category | Implementation |
|----------|----------|----------------|
| ID.AM | Asset Management | Complete architecture documentation |
| PR.DS | Data Security | GDPR compliance, no persistent PII storage |
| PR.AC | Identity Management | OAuth 2.0 (planned), RBAC authorization |
| DE.CM | Continuous Monitoring | Metrics collection, log aggregation |
| RS.RP | Response Planning | Error handling workflows, incident runbooks |

### CIS Controls v8.1

| Control | Description | Implementation |
|---------|-------------|----------------|
| 2.1 | Maintain Asset Inventory | Architecture documentation, SBOM |
| 3.3 | Protect Data | Data classification, encryption in transit |
| 6.1 | Establish Access Control | OAuth 2.0 (planned), API authentication |
| 8.2 | Audit Logging | Winston structured logging, audit trail |
| 16.14 | Establish Incident Response | Error handling workflows, alerting |

---

## 🔗 Related Documentation

- [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md) - Security implementation details
- [DATA_MODEL.md](./DATA_MODEL.md) - Data structures and entities
- [STATEDIAGRAM.md](./STATEDIAGRAM.md) - System state transitions
- [ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md) - C4 model diagrams
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues and solutions

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://hack23.com">Hack23 AB</a></strong><br>
  <em>Flowchart documentation following ISMS standards</em>
</p>
