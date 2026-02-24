<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🔄 European Parliament MCP Server — Process Flowcharts</h1>

<p align="center">
  <strong>Model Context Protocol Server for European Parliament Open Data</strong><br>
  <em>Request Processing, Tool Execution, Data Integration &amp; OSINT Analysis Flows — 28 Tools, 6 Resources, 6 Prompts</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-Architect-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-0.6.2-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2025--06--20-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Review-Quarterly-orange?style=for-the-badge" alt="Review Cycle"/></a>
</p>

**📋 Document Owner:** Architecture Team | **📄 Version:** 0.6.2 | **📅 Last Updated:** 2025-06-20 (UTC)
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2025-09-20
**🏷️ Classification:** Public (Open Source MCP Server)
**✅ ISMS Compliance:** ISO 27001 (A.8.1, A.12.4, A.14.2), NIST CSF 2.0 (ID.AM, PR.DS, DE.CM), CIS Controls v8.1 (2.1, 8.2, 16.1)

---

## 📋 Table of Contents

1. [Architecture Documentation Map](#-architecture-documentation-map)
2. [Executive Summary](#-executive-summary)
3. [MCP Request Processing Flow](#-mcp-request-processing-flow)
4. [Tool Execution Pipeline](#-tool-execution-pipeline)
5. [EP Data Integration Flow](#-ep-data-integration-flow)
6. [Resource Access Flow](#-resource-access-flow)
7. [Cache Management Flow](#-cache-management-flow)
8. [OSINT Analysis Pipeline](#-osint-analysis-pipeline)
9. [Error Handling Flow](#-error-handling-flow)
10. [Color Legend](#-color-legend)
11. [ISMS Compliance Mapping](#-isms-compliance-mapping)
12. [Related Documentation](#-related-documentation)

---

## 🗺️ Architecture Documentation Map

| Document | Current | Future | Description |
|----------|---------|--------|-------------|
| **Architecture** | [ARCHITECTURE.md](./ARCHITECTURE.md) | [FUTURE_ARCHITECTURE.md](./FUTURE_ARCHITECTURE.md) | C4 model, containers, components |
| **Data Model** | [DATA_MODEL.md](./DATA_MODEL.md) | [FUTURE_DATA_MODEL.md](./FUTURE_DATA_MODEL.md) | Entity relationships and schemas |
| **Flowchart** | **FLOWCHART.md** *(this document)* | [FUTURE_FLOWCHART.md](./FUTURE_FLOWCHART.md) | Request processing and data flows |
| **Mind Map** | [MINDMAP.md](./MINDMAP.md) | [FUTURE_MINDMAP.md](./FUTURE_MINDMAP.md) | System concepts and relationships |
| **State Diagram** | [STATEDIAGRAM.md](./STATEDIAGRAM.md) | [FUTURE_STATEDIAGRAM.md](./FUTURE_STATEDIAGRAM.md) | System state transitions |
| **SWOT Analysis** | [SWOT.md](./SWOT.md) | [FUTURE_SWOT.md](./FUTURE_SWOT.md) | Strategic positioning |
| **Workflows** | [WORKFLOWS.md](./WORKFLOWS.md) | [FUTURE_WORKFLOWS.md](./FUTURE_WORKFLOWS.md) | CI/CD pipeline documentation |
| **Security Architecture** | [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md) | [FUTURE_SECURITY_ARCHITECTURE.md](./FUTURE_SECURITY_ARCHITECTURE.md) | Security controls and design |
| **Threat Model** | [THREAT_MODEL.md](./THREAT_MODEL.md) | — | STRIDE-based threat analysis |
| **CRA Assessment** | [CRA-ASSESSMENT.md](./CRA-ASSESSMENT.md) | — | EU Cyber Resilience Act review |
| **Architecture Diagrams** | [ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md) | — | Supplementary C4 diagrams |

---

## 🎯 Executive Summary

The **European Parliament MCP Server** (v0.7.1) is a stateless TypeScript/Node.js server implementing the [Model Context Protocol](https://spec.modelcontextprotocol.io/) over **stdio transport**. It proxies requests to the **EP Open Data Portal API v2** (`https://data.europarl.europa.eu/api/v2/`), transforming JSON-LD responses into structured MCP tool results. The server exposes **39 tools**, **6 resource templates**, and **6 prompt templates** — all validated with Zod schemas and backed by an LRU cache (500 entries, 15-minute TTL).

This document maps every process flow in the system: from MCP request ingestion through stdio, to tool dispatch and Zod validation, EP API integration with retry logic, LRU cache management, multi-source OSINT analysis, and comprehensive error handling with GDPR compliance.

**Key Architectural Characteristics:**

- **Stateless** — No database, no persistent storage; all data sourced live from EP API
- **Stdio Transport** — Communication via stdin/stdout (no HTTP server)
- **Type-Safe** — Zod schema validation on all tool inputs and API responses
- **Cached** — LRU cache with 500 entries and 15-minute TTL for performance
- **Rate-Limited** — Token bucket algorithm (100 requests/minute) protects EP API
- **GDPR-Compliant** — Audit logging, data minimization, no PII persistence

---

## 🔀 MCP Request Processing Flow

The complete lifecycle of an MCP request from client connection through stdio transport to response delivery.

```mermaid
flowchart TD
    Client([AI Assistant / MCP Client]) -->|stdin JSON-RPC| StdioTransport[StdioServerTransport]
    StdioTransport --> MCPServer[MCP Server Instance]

    MCPServer --> RouteRequest{Request\nType?}

    RouteRequest -->|tools/list| ListTools[Return 28 Tool Definitions\nwith Zod Schemas]
    RouteRequest -->|tools/call| DispatchTool[Dispatch to Tool Handler]
    RouteRequest -->|resources/templates/list| ListResources[Return 6 Resource Templates]
    RouteRequest -->|resources/read| ReadResource[Parse URI & Fetch Resource]
    RouteRequest -->|prompts/list| ListPrompts[Return 6 Prompt Templates]
    RouteRequest -->|prompts/get| GetPrompt[Resolve Prompt with Arguments]
    RouteRequest -->|Unknown| UnknownMethod[Return Method Not Found Error]

    DispatchTool --> ToolPipeline[[Tool Execution Pipeline]]
    ReadResource --> ResourcePipeline[[Resource Access Flow]]
    GetPrompt --> PromptResolver[Resolve Template Arguments]

    ListTools --> FormatResponse[Format MCP JSON-RPC Response]
    ToolPipeline --> FormatResponse
    ListResources --> FormatResponse
    ResourcePipeline --> FormatResponse
    ListPrompts --> FormatResponse
    PromptResolver --> FormatResponse
    UnknownMethod --> FormatResponse

    FormatResponse -->|stdout JSON-RPC| Client

    style Client fill:#E8F5E9,stroke:#2E7D32,color:#1B5E20
    style StdioTransport fill:#E3F2FD,stroke:#1565C0,color:#0D47A1
    style MCPServer fill:#E3F2FD,stroke:#1565C0,color:#0D47A1
    style RouteRequest fill:#FFF3E0,stroke:#E65100,color:#BF360C
    style ToolPipeline fill:#F3E5F5,stroke:#6A1B9A,color:#4A148C
    style ResourcePipeline fill:#F3E5F5,stroke:#6A1B9A,color:#4A148C
    style FormatResponse fill:#E8F5E9,stroke:#2E7D32,color:#1B5E20
    style UnknownMethod fill:#FFEBEE,stroke:#C62828,color:#B71C1C
    style ListTools fill:#E8F5E9,stroke:#2E7D32,color:#1B5E20
    style ListResources fill:#E8F5E9,stroke:#2E7D32,color:#1B5E20
    style ListPrompts fill:#E8F5E9,stroke:#2E7D32,color:#1B5E20
```

**Request Routing Details:**

| Method | Handler | Response |
|--------|---------|----------|
| `tools/list` | `ListToolsRequestSchema` | 39 tool definitions with JSON Schema |
| `tools/call` | `CallToolRequestSchema` → `dispatchToolCall()` | Tool execution result |
| `resources/templates/list` | `ListResourceTemplatesRequestSchema` | 6 URI templates |
| `resources/read` | `ReadResourceRequestSchema` | Resource content |
| `prompts/list` | `ListPromptsRequestSchema` | 6 prompt definitions |
| `prompts/get` | `GetPromptRequestSchema` | Resolved prompt messages |

---

## ⚙️ Tool Execution Pipeline

How a `tools/call` request is validated, dispatched to the correct handler, calls the EP API, and returns a formatted response.

```mermaid
flowchart TD
    ToolCall([tools/call Request]) --> ExtractName[Extract Tool Name\n& Arguments]
    ExtractName --> MatchTool{Match Tool\nName?}

    MatchTool -->|Not Found| ToolNotFound[Return Tool Not Found Error]
    MatchTool -->|Found| ZodValidate[Validate Arguments\nwith Zod Schema]

    ZodValidate -->|Invalid| ValidationError[Return ValidationError\nwith Field Details]
    ZodValidate -->|Valid| AuditLog[Log Request to\nAudit Logger]

    AuditLog --> CheckRateLimit{Rate Limiter:\nTokens Available?}
    CheckRateLimit -->|Exhausted| RateLimitError[Return RateLimitError\nwith retryAfter]
    CheckRateLimit -->|OK| ConsumeToken[Consume 1 Token]

    ConsumeToken --> CacheLookup{LRU Cache\nLookup}
    CacheLookup -->|Hit| CacheHit[Return Cached Result\nTTL Reset on Access]
    CacheLookup -->|Miss| CallEPAPI[[EP Data Integration Flow]]

    CallEPAPI -->|Success| TransformResult[Transform to\nMCP Content Format]
    CallEPAPI -->|Error| HandleAPIError[[Error Handling Flow]]

    TransformResult --> StoreCache[Store in LRU Cache\nKey: endpoint + params]
    StoreCache --> RecordMetrics[Record Duration\nvia Performance Monitor]

    CacheHit --> RecordMetrics
    RecordMetrics --> BuildResponse[Build MCP Response\ntype: text, text: JSON]
    HandleAPIError --> BuildResponse

    BuildResponse --> Return([Return to MCP Server])

    ToolNotFound --> Return
    ValidationError --> Return
    RateLimitError --> Return

    style ToolCall fill:#E8F5E9,stroke:#2E7D32,color:#1B5E20
    style Return fill:#E8F5E9,stroke:#2E7D32,color:#1B5E20
    style ZodValidate fill:#E3F2FD,stroke:#1565C0,color:#0D47A1
    style CacheLookup fill:#FFF3E0,stroke:#E65100,color:#BF360C
    style CacheHit fill:#E8F5E9,stroke:#2E7D32,color:#1B5E20
    style CallEPAPI fill:#F3E5F5,stroke:#6A1B9A,color:#4A148C
    style HandleAPIError fill:#FFEBEE,stroke:#C62828,color:#B71C1C
    style ToolNotFound fill:#FFEBEE,stroke:#C62828,color:#B71C1C
    style ValidationError fill:#FFEBEE,stroke:#C62828,color:#B71C1C
    style RateLimitError fill:#FFEBEE,stroke:#C62828,color:#B71C1C
    style AuditLog fill:#ECEFF1,stroke:#546E7A,color:#37474F
    style RecordMetrics fill:#ECEFF1,stroke:#546E7A,color:#37474F
```

**Tool Categories (28 Total):**

| Category | Tools | Description |
|----------|-------|-------------|
| **Core Data** (7) | `get_meps`, `get_mep_details`, `get_plenary_sessions`, `get_voting_records`, `search_documents`, `get_committee_info`, `get_parliamentary_questions` | Direct EP data access |
| **Advanced Analysis** (3) | `analyze_voting_patterns`, `track_legislation`, `generate_report` | Multi-query analytical tools |
| **OSINT Phase 1** (6) | `assess_mep_influence`, `analyze_coalition_dynamics`, `detect_voting_anomalies`, `compare_political_groups`, `analyze_legislative_effectiveness`, `monitor_legislative_pipeline` | Political intelligence |
| **OSINT Phase 2** (2) | `analyze_committee_activity`, `track_mep_attendance` | Committee & attendance analysis |
| **OSINT Phase 3** (2) | `analyze_country_delegation`, `generate_political_landscape` | National & strategic analysis |
| **EP API v2** (8) | `get_current_meps`, `get_speeches`, `get_procedures`, `get_adopted_texts`, `get_events`, `get_meeting_activities`, `get_meeting_decisions`, `get_mep_declarations` | Direct v2 endpoint access |

---

## 🌐 EP Data Integration Flow

How the `EuropeanParliamentClient` makes HTTP requests to the EP Open Data Portal API v2, parses JSON-LD responses, and transforms them into typed internal models.

```mermaid
flowchart TD
    ToolHandler([Tool Handler Invocation]) --> BuildEndpoint[Build EP API Endpoint URL\nBase: data.europarl.europa.eu/api/v2]
    BuildEndpoint --> AddParams[Add Query Parameters\nformat, offset, limit, filters]
    AddParams --> SetHeaders[Set HTTP Headers\nAccept: application/ld+json]

    SetHeaders --> TimeoutWrap[Wrap with\nwithTimeoutAndAbort]
    TimeoutWrap --> FetchRequest[fetch URL with\nAbortController]

    FetchRequest -->|Network Error| RetryDecision{Retry?\nMax 2 Retries}
    FetchRequest -->|Response| CheckHTTP{HTTP\nStatus?}

    RetryDecision -->|Yes| BackoffWait[Exponential Backoff\n1s → 2s → 4s]
    RetryDecision -->|No, Max Reached| NetworkError[Throw EPAPIError\nNetwork Failure]
    BackoffWait --> FetchRequest

    CheckHTTP -->|200 OK| ParseJSONLD[Parse JSON-LD\nResponse Body]
    CheckHTTP -->|4xx| ClientError[Throw EPAPIError\nClient Error — No Retry]
    CheckHTTP -->|5xx| ServerRetry{Retry on\n5xx?}

    ServerRetry -->|Yes| BackoffWait
    ServerRetry -->|No, Max Reached| ServerError[Throw EPAPIError\nServer Error]

    ParseJSONLD --> ExtractContext[Extract @context\nand @graph Arrays]
    ExtractContext --> MapFields[Map JSON-LD Properties\nto TypeScript Fields]
    MapFields --> NormalizeDates[Normalize ISO 8601 Dates\nand URI Identifiers]
    NormalizeDates --> CoerceTypes[Coerce Strings to\nTyped Values]
    CoerceTypes --> BuildEntities[Build Typed Entity Objects\nMEP, Vote, Procedure, etc.]

    BuildEntities --> CacheStore[Store in LRU Cache\nKey: JSON endpoint+params]
    CacheStore --> ReturnData([Return Typed Response])

    NetworkError --> ErrorReturn([Return Error])
    ClientError --> ErrorReturn
    ServerError --> ErrorReturn

    style ToolHandler fill:#E8F5E9,stroke:#2E7D32,color:#1B5E20
    style ReturnData fill:#E8F5E9,stroke:#2E7D32,color:#1B5E20
    style FetchRequest fill:#E3F2FD,stroke:#1565C0,color:#0D47A1
    style ParseJSONLD fill:#E3F2FD,stroke:#1565C0,color:#0D47A1
    style MapFields fill:#F3E5F5,stroke:#6A1B9A,color:#4A148C
    style BuildEntities fill:#F3E5F5,stroke:#6A1B9A,color:#4A148C
    style CacheStore fill:#FFF3E0,stroke:#E65100,color:#BF360C
    style RetryDecision fill:#FFF3E0,stroke:#E65100,color:#BF360C
    style NetworkError fill:#FFEBEE,stroke:#C62828,color:#B71C1C
    style ClientError fill:#FFEBEE,stroke:#C62828,color:#B71C1C
    style ServerError fill:#FFEBEE,stroke:#C62828,color:#B71C1C
    style ErrorReturn fill:#FFEBEE,stroke:#C62828,color:#B71C1C
```

**EP API v2 Integration Details:**

| Parameter | Value |
|-----------|-------|
| **Base URL** | `https://data.europarl.europa.eu/api/v2/` |
| **Response Format** | JSON-LD (`application/ld+json`) |
| **Authentication** | None (public open data API) |
| **Timeout** | Configurable via `withTimeoutAndAbort()` |
| **Max Retries** | 2 (with exponential backoff) |
| **Retry Conditions** | 5xx server errors, network failures |
| **No Retry** | 4xx client errors, timeout errors |

**JSON-LD Transformation Example:**

```typescript
// EP API JSON-LD Response
{
  "@context": "https://data.europarl.europa.eu/def/context.json",
  "@graph": [{
    "@id": "http://data.europarl.europa.eu/person/124810",
    "label": "Manfred WEBER",
    "eli-dl:nationality": "http://publications.europa.eu/resource/authority/country/DEU",
    "org:memberOf": "http://data.europarl.europa.eu/org/PPE"
  }]
}

// → Transformed Internal Model
{
  id: 124810,
  fullName: "Manfred WEBER",
  country: "DE",
  partyGroup: "PPE",
  active: true
}
```

---

## 📂 Resource Access Flow

How `resources/read` requests resolve URI templates, query the EP API, and return formatted resource content.

```mermaid
flowchart TD
    ReadRequest([resources/read Request]) --> ExtractURI[Extract Resource URI\nfrom Request]
    ExtractURI --> MatchTemplate{Match URI\nTemplate?}

    MatchTemplate -->|No Match| URIError[Return Resource\nNot Found Error]
    MatchTemplate -->|ep://meps| ListMEPs[Fetch MEP Listing\nfrom EP API]
    MatchTemplate -->|ep://meps/mepId| FetchMEP[Fetch Single MEP\nProfile by ID]
    MatchTemplate -->|ep://procedures| ListProcedures[Fetch Legislative\nProcedures]
    MatchTemplate -->|ep://votes| ListVotes[Fetch Voting\nRecords]
    MatchTemplate -->|ep://committees| ListCommittees[Fetch Committee\nInformation]
    MatchTemplate -->|ep://documents| SearchDocs[Search Parliamentary\nDocuments]

    ListMEPs --> EPClient[[EP Data Integration Flow]]
    FetchMEP --> EPClient
    ListProcedures --> EPClient
    ListVotes --> EPClient
    ListCommittees --> EPClient
    SearchDocs --> EPClient

    EPClient -->|Success| FormatContent[Format as MCP Resource\nmimeType: application/json]
    EPClient -->|Error| ResourceError[Format Error Response]

    FormatContent --> ReturnResource([Return Resource Content])
    ResourceError --> ReturnResource
    URIError --> ReturnResource

    style ReadRequest fill:#E8F5E9,stroke:#2E7D32,color:#1B5E20
    style ReturnResource fill:#E8F5E9,stroke:#2E7D32,color:#1B5E20
    style MatchTemplate fill:#FFF3E0,stroke:#E65100,color:#BF360C
    style EPClient fill:#F3E5F5,stroke:#6A1B9A,color:#4A148C
    style FormatContent fill:#E3F2FD,stroke:#1565C0,color:#0D47A1
    style URIError fill:#FFEBEE,stroke:#C62828,color:#B71C1C
    style ResourceError fill:#FFEBEE,stroke:#C62828,color:#B71C1C
```

**Resource Templates (6 Total):**

| URI Template | Description | EP API Endpoint |
|--------------|-------------|-----------------|
| `ep://meps` | List of MEPs with filters | `/meps` |
| `ep://meps/{mepId}` | Individual MEP profile | `/meps/{mepId}` |
| `ep://procedures` | Legislative procedures | `/procedures` |
| `ep://votes` | Voting records | `/votes` |
| `ep://committees` | Committee information | `/committees` |
| `ep://documents` | Document search | `/documents` |

---

## 💾 Cache Management Flow

LRU cache lookup, hit/miss paths, TTL expiry, and eviction strategy using the `lru-cache` library.

```mermaid
flowchart TD
    Request([Cache Lookup Request]) --> GenerateKey[Generate Cache Key\nJSON.stringify endpoint + params]
    GenerateKey --> LRULookup{LRU Cache\ncache.get key}

    LRULookup -->|Hit & TTL Valid| ResetAge[Reset TTL on Access\nupdateAgeOnGet: true]
    LRULookup -->|Hit & TTL Expired| Expired[Entry Expired\nallowStale: false]
    LRULookup -->|Miss| CacheMiss[Cache Miss]

    ResetAge --> RecordHit[Record Duration\nep_api_cache_hit]
    RecordHit --> ReturnCached([Return Cached Data\nLatency: < 1ms])

    Expired --> EvictExpired[Remove Expired Entry]
    EvictExpired --> CacheMiss

    CacheMiss --> FetchFresh[Fetch from EP API\nvia EuropeanParliamentClient]
    FetchFresh -->|Success| CheckCapacity{Cache Size\n< 500 Max?}
    FetchFresh -->|Error| RecordFailure[Record Duration\nep_api_request_failed]

    CheckCapacity -->|Under Limit| StoreEntry[cache.set key, data\nTTL: 15 minutes]
    CheckCapacity -->|At Limit| EvictLRU[Evict Least Recently\nUsed Entry]
    EvictLRU --> StoreEntry

    StoreEntry --> RecordDuration[Record Duration\nep_api_request]
    RecordDuration --> ReturnFresh([Return Fresh Data])

    RecordFailure --> ReturnError([Return Error])

    style Request fill:#E8F5E9,stroke:#2E7D32,color:#1B5E20
    style ReturnCached fill:#E8F5E9,stroke:#2E7D32,color:#1B5E20
    style ReturnFresh fill:#E8F5E9,stroke:#2E7D32,color:#1B5E20
    style LRULookup fill:#FFF3E0,stroke:#E65100,color:#BF360C
    style CheckCapacity fill:#FFF3E0,stroke:#E65100,color:#BF360C
    style StoreEntry fill:#E3F2FD,stroke:#1565C0,color:#0D47A1
    style EvictLRU fill:#ECEFF1,stroke:#546E7A,color:#37474F
    style EvictExpired fill:#ECEFF1,stroke:#546E7A,color:#37474F
    style ReturnError fill:#FFEBEE,stroke:#C62828,color:#B71C1C
    style RecordHit fill:#ECEFF1,stroke:#546E7A,color:#37474F
    style RecordDuration fill:#ECEFF1,stroke:#546E7A,color:#37474F
```

**LRU Cache Configuration:**

```typescript
new LRUCache<string, Record<string, unknown>>({
  max: 500,             // Maximum 500 cached entries
  ttl: 900_000,         // 15-minute TTL (milliseconds)
  allowStale: false,    // Never serve expired entries
  updateAgeOnGet: true  // Reset TTL on cache hit
});
```

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Max Entries** | 500 | Bounded memory; covers active tool calls |
| **TTL** | 15 minutes (900s) | Balance freshness vs. EP API load |
| **Stale Policy** | `allowStale: false` | GDPR: no stale PII served |
| **Age Reset** | `updateAgeOnGet: true` | Frequently-accessed data stays cached |
| **Key Strategy** | `JSON.stringify({endpoint, params})` | Deterministic, collision-free |
| **Eviction** | Least Recently Used | Optimal for temporal access patterns |

**Performance Impact:**

| Metric | Cache Hit | Cache Miss |
|--------|-----------|------------|
| **P50 Latency** | < 1ms | ~500ms |
| **P95 Latency** | < 5ms | ~1.5s |
| **P99 Latency** | < 10ms | ~2s |

---

## 🔍 OSINT Analysis Pipeline

How OSINT intelligence tools (`assess_mep_influence`, `analyze_coalition_dynamics`, `detect_voting_anomalies`, etc.) aggregate data from multiple EP API calls into composite intelligence products.

```mermaid
flowchart TD
    OSINTCall([OSINT Tool Invocation]) --> ValidateInput[Validate Arguments\nwith Zod Schema]
    ValidateInput -->|Invalid| RejectInput[Return ValidationError]
    ValidateInput -->|Valid| PlanQueries[Plan Required\nEP API Queries]

    PlanQueries --> Query1[Query 1: MEP Profile\nget /meps/mepId]
    PlanQueries --> Query2[Query 2: Voting Records\nget /votes?mepId=...]
    PlanQueries --> Query3[Query 3: Committee Roles\nget /committees?member=...]
    PlanQueries --> Query4[Query 4: Procedures\nget /procedures?rapporteur=...]

    Query1 --> EPClient1[[EP Data Integration\nwith Cache]]
    Query2 --> EPClient2[[EP Data Integration\nwith Cache]]
    Query3 --> EPClient3[[EP Data Integration\nwith Cache]]
    Query4 --> EPClient4[[EP Data Integration\nwith Cache]]

    EPClient1 --> Aggregate{Aggregate\nAll Results}
    EPClient2 --> Aggregate
    EPClient3 --> Aggregate
    EPClient4 --> Aggregate

    Aggregate -->|All Succeeded| ComputeScores[Compute Analysis Scores]
    Aggregate -->|Partial Failure| DegradedAnalysis[Degrade Gracefully\nwith Available Data]

    ComputeScores --> InfluenceScore[Calculate Influence Score\n5 Dimensions, 0-100 Scale]
    ComputeScores --> AnomalyDetect[Detect Voting Anomalies\nDeviation from Baseline]
    ComputeScores --> CoalitionMap[Map Coalition Patterns\nCross-Party Alignments]
    ComputeScores --> EffectivenessRate[Rate Legislative\nEffectiveness]

    InfluenceScore --> BuildReport[Build Intelligence Report\nStructured JSON Output]
    AnomalyDetect --> BuildReport
    CoalitionMap --> BuildReport
    EffectivenessRate --> BuildReport
    DegradedAnalysis --> BuildReport

    BuildReport --> FormatMCP[Format as MCP Response\ntype: text, text: JSON]
    FormatMCP --> ReturnResult([Return OSINT Product])

    RejectInput --> ReturnResult

    style OSINTCall fill:#E8F5E9,stroke:#2E7D32,color:#1B5E20
    style ReturnResult fill:#E8F5E9,stroke:#2E7D32,color:#1B5E20
    style PlanQueries fill:#F3E5F5,stroke:#6A1B9A,color:#4A148C
    style Aggregate fill:#FFF3E0,stroke:#E65100,color:#BF360C
    style ComputeScores fill:#F3E5F5,stroke:#6A1B9A,color:#4A148C
    style InfluenceScore fill:#E3F2FD,stroke:#1565C0,color:#0D47A1
    style AnomalyDetect fill:#E3F2FD,stroke:#1565C0,color:#0D47A1
    style CoalitionMap fill:#E3F2FD,stroke:#1565C0,color:#0D47A1
    style EffectivenessRate fill:#E3F2FD,stroke:#1565C0,color:#0D47A1
    style RejectInput fill:#FFEBEE,stroke:#C62828,color:#B71C1C
    style DegradedAnalysis fill:#ECEFF1,stroke:#546E7A,color:#37474F
```

**Influence Assessment Scoring Model (CIA Political Scorecards Methodology):**

| Dimension | Weight | Data Source | Metric |
|-----------|--------|-------------|--------|
| **Voting Activity** | 25% | Voting records | Attendance rate + participation volume |
| **Legislative Output** | 25% | Procedures | Rapporteurships + adopted texts |
| **Committee Engagement** | 20% | Committees | Committee roles + diversity |
| **Parliamentary Oversight** | 15% | Questions, declarations | Questions filed + declarations made |
| **Coalition Building** | 15% | Cross-party votes | Cross-group voting frequency |

**OSINT Tool Pipeline Summary:**

| Tool | Queries Required | Output |
|------|-----------------|--------|
| `assess_mep_influence` | 4–5 EP API calls | Composite score (0–100), rank, confidence |
| `detect_voting_anomalies` | 2–3 EP API calls | Anomalies with severity (HIGH/MED/LOW) |
| `analyze_coalition_dynamics` | 3–4 EP API calls | Voting blocs, stability index |
| `compare_political_groups` | 2–3 EP API calls | Group comparisons, cohesion scores |
| `generate_political_landscape` | 5–6 EP API calls | Full strategic overview |

---

## ⚠️ Error Handling Flow

Comprehensive error classification, handling, and response formatting across all error types defined in `src/types/errors.ts`.

```mermaid
flowchart TD
    Error([Error Thrown]) --> Classify{Error\nType?}

    Classify -->|ZodError| ZodPath[Extract Field Errors\nfrom Zod Issues Array]
    Classify -->|ValidationError| ValPath[Format Validation Details\nCode: VALIDATION_ERROR]
    Classify -->|RateLimitError| RLPath[Include retryAfter\nCode: RATE_LIMIT_EXCEEDED]
    Classify -->|EPAPIError| APIPath[Preserve HTTP Status\nCode: EP_API_ERROR]
    Classify -->|GDPRComplianceError| GDPRPath[GDPR Violation\nCode: GDPR_COMPLIANCE_ERROR]
    Classify -->|TimeoutError| TimeoutPath[Convert to EPAPIError\nStatus: 408]
    Classify -->|Unknown Error| UnknownPath[Sanitize Internal Details]

    ZodPath --> Format400[Status 400\nBad Request]
    ValPath --> Format400

    RLPath --> Format429[Status 429\nToo Many Requests]

    APIPath --> CheckRetryable{Retryable?\n5xx Only}
    CheckRetryable -->|Yes, 5xx| RetryWithBackoff[withRetry: Exponential Backoff\nMax 2 Retries]
    CheckRetryable -->|No, 4xx| Format4xx[Status 4xx\nClient Error — No Retry]

    RetryWithBackoff -->|Retry Succeeded| ReturnSuccess([Return Success])
    RetryWithBackoff -->|Max Retries Exhausted| FormatAPIError[Status 502\nBad Gateway]

    GDPRPath --> Format403[Status 403\nForbidden — GDPR]

    TimeoutPath --> Format408[Status 408\nRequest Timeout]

    UnknownPath --> SanitizeMsg[Remove Stack Traces\n& Internal Details]
    SanitizeMsg --> Format500[Status 500\nInternal Server Error]

    Format400 --> FormatMCPError[formatMCPError\nStructured Error Response]
    Format429 --> FormatMCPError
    Format4xx --> FormatMCPError
    FormatAPIError --> FormatMCPError
    Format403 --> FormatMCPError
    Format408 --> FormatMCPError
    Format500 --> FormatMCPError

    FormatMCPError --> LogError[Log to stderr\nFull Context Preserved]
    LogError --> AuditRecord[Audit Logger\nGDPR Article 30 Record]
    AuditRecord --> RecordMetric[Performance Monitor\nRecord Failed Duration]
    RecordMetric --> ReturnError([Return MCP Error Response])

    style Error fill:#FFEBEE,stroke:#C62828,color:#B71C1C
    style ReturnSuccess fill:#E8F5E9,stroke:#2E7D32,color:#1B5E20
    style ReturnError fill:#FFEBEE,stroke:#C62828,color:#B71C1C
    style Classify fill:#FFF3E0,stroke:#E65100,color:#BF360C
    style CheckRetryable fill:#FFF3E0,stroke:#E65100,color:#BF360C
    style FormatMCPError fill:#E3F2FD,stroke:#1565C0,color:#0D47A1
    style Format400 fill:#FFF3E0,stroke:#E65100,color:#BF360C
    style Format429 fill:#FFF3E0,stroke:#E65100,color:#BF360C
    style Format403 fill:#FFEBEE,stroke:#C62828,color:#B71C1C
    style Format408 fill:#FFF3E0,stroke:#E65100,color:#BF360C
    style Format500 fill:#FFEBEE,stroke:#C62828,color:#B71C1C
    style LogError fill:#ECEFF1,stroke:#546E7A,color:#37474F
    style AuditRecord fill:#ECEFF1,stroke:#546E7A,color:#37474F
```

**Error Type Reference:**

| Error Type | Status | Code | Retryable | Use Case |
|-----------|--------|------|-----------|----------|
| `ValidationError` | 400 | `VALIDATION_ERROR` | No | Invalid tool arguments (bad country code, out-of-range limit) |
| `RateLimitError` | 429 | `RATE_LIMIT_EXCEEDED` | Yes (after `retryAfter`) | Token bucket exhausted |
| `EPAPIError` | 3xx–5xx | `EP_API_ERROR` | 5xx only | Upstream EP API failure |
| `GDPRComplianceError` | 403 | `GDPR_COMPLIANCE_ERROR` | No | Data minimization or consent violation |
| `TimeoutError` | 408 | `EP_API_ERROR` | No | `withTimeoutAndAbort()` exceeded |
| Unknown | 500 | `INTERNAL_ERROR` | No | Unexpected runtime error (sanitized) |

**Security Principle:** Internal error details (stack traces, internal paths, dependency versions) are **never** exposed to clients. All errors pass through `formatMCPError()` which strips sensitive information before responding, while the full context is logged to stderr for debugging.

---

## 🎨 Color Legend

All flowcharts in this document use a consistent color scheme to indicate node purpose at a glance.

| Color | Hex | Meaning | Example Nodes |
|-------|-----|---------|---------------|
| 🟢 Green | `#E8F5E9` | Start/End, Success path | Request entry, successful return |
| 🔵 Blue | `#E3F2FD` | Processing, Data transformation | Zod validation, JSON-LD parsing, response formatting |
| 🟣 Purple | `#F3E5F5` | Sub-process, Pipeline reference | EP Data Integration, OSINT computation |
| 🟠 Orange | `#FFF3E0` | Decision point, Branching logic | Route request, cache lookup, retry decision |
| 🔴 Red | `#FFEBEE` | Error state, Failure path | Validation error, API error, GDPR violation |
| ⚪ Grey | `#ECEFF1` | Observability, Logging | Audit log, performance metrics, eviction |

---

## 📋 ISMS Compliance Mapping

### ISO 27001 Controls

| Control | Requirement | Flowchart Implementation |
|---------|-------------|--------------------------|
| **A.8.1** | Inventory of Assets | Architecture Documentation Map; all processes documented |
| **A.12.4** | Logging and Monitoring | Audit Logger in tool pipeline; Performance Monitor in all flows |
| **A.14.2** | Security in Development | Zod input validation; error sanitization; no PII in responses |
| **A.18.1** | Compliance with Legal Requirements | GDPR compliance errors; data minimization in cache |

### NIST CSF 2.0 Functions

| Function | Category | Flowchart Implementation |
|----------|----------|--------------------------|
| **ID.AM** | Asset Management | Complete process documentation with data flows |
| **PR.DS** | Data Security | LRU cache TTL expiry; no persistent PII storage |
| **PR.AC** | Access Control | Rate limiting pipeline; token bucket algorithm |
| **DE.CM** | Continuous Monitoring | Performance Monitor metrics in all execution paths |
| **RS.RP** | Response Planning | Error handling flow with retry and graceful degradation |

### CIS Controls v8.1

| Control | Description | Flowchart Implementation |
|---------|-------------|--------------------------|
| **2.1** | Maintain Asset Inventory | Architecture Documentation Map cross-referencing all docs |
| **8.2** | Audit Logging | Audit Logger integration in tool execution and error paths |
| **16.1** | Establish Incident Response | Error classification, retry logic, GDPR error handling |

---

## 🔗 Related Documentation

| Document | Relevance |
|----------|-----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | C4 architecture — containers and components referenced in these flows |
| [DATA_MODEL.md](./DATA_MODEL.md) | Entity schemas for MEP, Vote, Procedure objects in data flows |
| [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md) | Security controls implemented across all pipelines |
| [STATEDIAGRAM.md](./STATEDIAGRAM.md) | State transitions for cache entries and request lifecycle |
| [WORKFLOWS.md](./WORKFLOWS.md) | CI/CD pipeline that builds and tests these processes |
| [THREAT_MODEL.md](./THREAT_MODEL.md) | STRIDE threats mitigated by error handling and validation |
| [API_USAGE_GUIDE.md](./API_USAGE_GUIDE.md) | Tool usage examples that exercise these flows |
| [PERFORMANCE_GUIDE.md](./PERFORMANCE_GUIDE.md) | Performance targets referenced in cache management |
| [FUTURE_FLOWCHART.md](./FUTURE_FLOWCHART.md) | Planned enhancements to these process flows |

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://hack23.com">Hack23 AB</a></strong><br>
  <em>Process flowchart documentation following ISMS standards</em><br>
  <em>European Parliament MCP Server v0.6.2 — 28 Tools · 6 Resources · 6 Prompts</em>
</p>
