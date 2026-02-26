<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🔄 European Parliament MCP Server — Flowcharts</h1>

<p align="center">
  <strong>Business Process Flows, Data Pipelines, and Operational Workflows</strong><br>
  <em>Detailed flow documentation for MCP tool execution and EP API integration</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-Hack23-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.0-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--02--26-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Review-Quarterly-orange?style=for-the-badge" alt="Review Cycle"/></a>
</p>

**📋 Document Owner:** Hack23 | **📄 Version:** 1.0 | **📅 Last Updated:** 2026-02-26 (UTC)
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-05-26
**🏷️ Classification:** Public (Open Source MCP Server)
**✅ ISMS Compliance:** ISO 27001 (A.5.1, A.8.1, A.14.2), NIST CSF 2.0 (ID.AM, PR.DS), CIS Controls v8.1 (2.1, 16.1)

---

## 📑 Table of Contents

1. [Security Documentation Map](#security-documentation-map)
2. [MCP Tool Execution Flow](#mcp-tool-execution-flow)
3. [EP API Client Request Lifecycle](#ep-api-client-request-lifecycle)
4. [Rate Limiter Token Bucket Flow](#rate-limiter-token-bucket-flow)
5. [DI Container Initialization Flow](#di-container-initialization-flow)
6. [Audit Logging Flow](#audit-logging-flow)
7. [Error Handling Flow](#error-handling-flow)
8. [Cache Management Flow](#cache-management-flow)

---

## 🗺️ Security Documentation Map

| Document | Current | Future | Description |
|----------|---------|--------|-------------|
| **Architecture** | [ARCHITECTURE.md](./ARCHITECTURE.md) | [FUTURE_ARCHITECTURE.md](./FUTURE_ARCHITECTURE.md) | C4 model, containers, components, ADRs |
| **Security Architecture** | [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md) | [FUTURE_SECURITY_ARCHITECTURE.md](./FUTURE_SECURITY_ARCHITECTURE.md) | Security controls, threat model |
| **Data Model** | [DATA_MODEL.md](./DATA_MODEL.md) | [FUTURE_DATA_MODEL.md](./FUTURE_DATA_MODEL.md) | Entity relationships, branded types |
| **Flowchart** | [FLOWCHART.md](./FLOWCHART.md) | [FUTURE_FLOWCHART.md](./FUTURE_FLOWCHART.md) | Business process flows |
| **State Diagram** | [STATEDIAGRAM.md](./STATEDIAGRAM.md) | [FUTURE_STATEDIAGRAM.md](./FUTURE_STATEDIAGRAM.md) | System state transitions |
| **Mind Map** | [MINDMAP.md](./MINDMAP.md) | [FUTURE_MINDMAP.md](./FUTURE_MINDMAP.md) | System concepts and relationships |
| **SWOT Analysis** | [SWOT.md](./SWOT.md) | [FUTURE_SWOT.md](./FUTURE_SWOT.md) | Strategic positioning |

---

## 🔧 MCP Tool Execution Flow

Complete flow from MCP client tool call to response:

```mermaid
flowchart TD
    A["MCP Client sends tool_call\n(name: string, args: unknown)"] --> B["MCP Handler receives request"]
    B --> C{"Tool registered?"}
    C -->|"No"| D["Return MCP error:\nTool not found"]
    C -->|"Yes"| E["Route to tool handler"]
    E --> F["Zod schema validation\n(parse args)"]
    F -->|"ZodError"| G["Return MCP error:\nInvalid parameters"]
    F -->|"Valid"| H["Check rate limiter\n(token available?)"]
    H -->|"No token"| I["Return MCP error:\nRate limit exceeded"]
    H -->|"Token available"| J["Consume token"]
    J --> K["Log invocation to AuditLogger\n(tool, params stripped, timestamp)"]
    K --> L["Check LRU cache\n(cache key lookup)"]
    L -->|"Cache hit"| M["Return cached result"]
    L -->|"Cache miss"| N["Call EP API client"]
    N --> O{"EP API response"}
    O -->|"200 OK"| P["Parse JSON-LD response"]
    O -->|"429 Rate Limited"| Q["Exponential backoff\n(retry up to 3x)"]
    O -->|"4xx/5xx Error"| R["Log error to MetricsService"]
    Q -->|"Retry success"| P
    Q -->|"Retry exhausted"| R
    R --> S["Return sanitized error\nto MCP client"]
    P --> T["Validate response\nwith Zod schema"]
    T --> U["Apply branded types"]
    U --> V["Store in LRU cache"]
    V --> W["Record metrics\n(duration, success)"]
    W --> X["Return typed result\nto MCP client"]
    M --> W
```

---

## 🌐 EP API Client Request Lifecycle

Detailed flow for EP API calls including cache and retry logic:

```mermaid
flowchart TD
    START["EP API Client method called\n(e.g., mepClient.getMEP(id))"] --> CK["Build cache key\n(client:sorted-params)"]
    CK --> CL{"Cache lookup"}
    CL -->|"Hit (fresh)"| CR["Return cached data\nLatency: ~1ms"]
    CL -->|"Miss"| RL["Request rate limiter token"]
    RL -->|"Token granted"| BH["Build HTTP request\nURL + headers + query params"]
    RL -->|"Token denied"| RLE["Throw RateLimitError\n(propagated to tool handler)"]
    BH --> FETCH["fetch() to EP API\nhttps://data.europarl.europa.eu/api/v2/"]
    FETCH --> RT{"Response status"}
    RT -->|"200 OK"| PARSE["Parse JSON-LD body\n(@graph extraction)"]
    RT -->|"304 Not Modified"| CACHE_USE["Use stale cache entry\n(if available)"]
    RT -->|"429 Too Many"| RETRY{"Retry count < 3?"}
    RT -->|"500+ Server Error"| ERR["Throw APIError\n(sanitized message)"]
    RT -->|"404 Not Found"| NF["Throw NotFoundError"]
    RETRY -->|"Yes"| WAIT["Wait: 2^n * 1000ms\n(exponential backoff)"]
    RETRY -->|"No"| ERR
    WAIT --> FETCH
    PARSE --> NORM["Normalize to TypeScript types\n(remove @context, @id prefixes)"]
    NORM --> ZV["Zod validation\n(response schema)"]
    ZV -->|"Invalid"| ZERR["Log schema mismatch\nReturn partial data"]
    ZV -->|"Valid"| CS["Store in LRU cache\n(key, data, TTL: 15min)"]
    CS --> RET["Return typed result"]
    CACHE_USE --> RET
    ZERR --> RET
```

---

## ⏱️ Rate Limiter Token Bucket Flow

Token bucket algorithm implementation:

```mermaid
flowchart TD
    INIT["Rate Limiter initialized\n(capacity: 100 tokens\nrefillRate: 100/min)"] --> STATE["State: tokens=100\nlastRefillTime=now()"]
    
    REQ["API request arrives\nrequestToken()"] --> CALC["Calculate elapsed time\ndelta = now - lastRefillTime"]
    CALC --> REFILL["Calculate new tokens\nnewTokens = delta * (100/60000)"]
    REFILL --> UPDATE["Update state\ntokens = min(100, tokens + newTokens)\nlastRefillTime = now()"]
    UPDATE --> CHECK{"tokens >= 1?"}
    CHECK -->|"Yes"| CONSUME["tokens -= 1\nReturn: granted"]
    CHECK -->|"No"| DENY["Return: denied\n(RateLimitError)"]
    CONSUME --> API["Proceed with API call"]
    DENY --> CALLER["Propagate to tool handler\n(return 429-equivalent MCP error)"]
```

---

## 🏗️ DI Container Initialization Flow

Server startup and dependency injection setup:

```mermaid
flowchart TD
    START["Server process starts\nnode dist/index.js"] --> ENV["Load environment variables\n(.env / process.env)"]
    ENV --> DI["Initialize DI Container"]
    DI --> RL_INIT["Register RateLimiter\n(100 tokens/min, token bucket)"]
    DI --> MS_INIT["Register MetricsService\n(counters, histograms, gauges)"]
    DI --> AL_INIT["Register AuditLogger\n(structured JSON logging)"]
    DI --> HS_INIT["Register HealthService\n(EP API ping, cache stats)"]
    RL_INIT --> CACHE_INIT["Initialize LRU Cache\n(max: 500, ttl: 900000ms)"]
    MS_INIT --> CLIENTS["Initialize EP API Clients\n(9 clients, shared cache + rate limiter)"]
    AL_INIT --> CLIENTS
    HS_INIT --> CLIENTS
    CACHE_INIT --> CLIENTS
    CLIENTS --> BC["baseClient\n(shared HTTP logic)"]
    BC --> MC["mepClient"]
    BC --> VC["votingClient"]
    BC --> CC["committeeClient"]
    BC --> PC["plenaryClient"]
    BC --> DC["documentClient"]
    BC --> LC["legislativeClient"]
    BC --> QC["questionClient"]
    BC --> VCC["vocabularyClient"]
    MC --> TOOLS["Register 39 MCP Tools\n(bind to DI container)"]
    VC --> TOOLS
    CC --> TOOLS
    PC --> TOOLS
    DC --> TOOLS
    LC --> TOOLS
    QC --> TOOLS
    VCC --> TOOLS
    TOOLS --> RES["Register 9 MCP Resources"]
    RES --> PROMPTS["Register 7 MCP Prompts"]
    PROMPTS --> LISTEN["Start MCP stdio listener\nReady to accept connections"]
```

---

## 📝 Audit Logging Flow

How invocations are logged for GDPR and ISMS compliance:

```mermaid
flowchart TD
    INVOKE["Tool invocation received\n(tool: string, args: unknown)"] --> PRE["Pre-execution logging\nExtract tool name, timestamp"]
    PRE --> STRIP["PII stripping pass\nRemove/hash personal identifiers\nfrom args (if applicable)"]
    STRIP --> LOG1["Write pre-execution entry\n{tool, strippedParams, startTime, status: 'started'}"]
    LOG1 --> EXEC["Execute tool\n(validation, rate limit, API call)"]
    EXEC -->|"Success"| SUCCESS["Post-execution logging\n{tool, durationMs, status: 'success'}"]
    EXEC -->|"Validation Error"| VALERR["Error logging\n{tool, errorType: 'validation', status: 'error'}"]
    EXEC -->|"Rate Limited"| RLERR["Error logging\n{tool, errorType: 'rate_limit', status: 'rate_limited'}"]
    EXEC -->|"API Error"| APIERR["Error logging\n{tool, errorType: 'api_error',\nerrorCode: status, status: 'error'}"]
    SUCCESS --> FORMAT["Format log entry\n(JSON, ISO timestamps)"]
    VALERR --> FORMAT
    RLERR --> FORMAT
    APIERR --> FORMAT
    FORMAT --> WRITE["Write to audit log stream\n(stderr / log file)"]
    WRITE --> METRICS["Update MetricsService\n(increment counters, record duration)"]
```

---

## ⚠️ Error Handling Flow

Comprehensive error propagation and sanitization:

```mermaid
flowchart TD
    ERR_SRC["Error occurs in system"] --> CLASSIFY{"Error type?"}
    
    CLASSIFY -->|"ZodError"| ZE["Validation Error Handler\nExtract field paths and messages"]
    CLASSIFY -->|"RateLimitError"| RLE["Rate Limit Handler\nReturn retry-after if available"]
    CLASSIFY -->|"NotFoundError"| NFE["Not Found Handler\nReturn 404-equivalent message"]
    CLASSIFY -->|"APIError"| AE["API Error Handler\nSanitize: remove internal details"]
    CLASSIFY -->|"NetworkError"| NE["Network Error Handler\nCheck if EP API is reachable"]
    CLASSIFY -->|"Unknown Error"| UE["Unknown Error Handler\nLog full stack trace internally"]

    ZE --> MCPE["Build MCP error response\n{isError: true, content: [{type: 'text', text: message}]}"]
    RLE --> MCPE
    NFE --> MCPE
    AE --> MCPE
    NE --> MCPE
    UE --> GENERIC["Generic error message\n'An unexpected error occurred'\n(no internal details exposed)"]
    GENERIC --> MCPE
    
    MCPE --> LOG["Log to AuditLogger\n(error type, tool, timestamp)"]
    LOG --> METRIC["Increment error counter\nin MetricsService"]
    METRIC --> RETURN["Return to MCP client"]
```

---

## 💾 Cache Management Flow

LRU cache lifecycle management:

```mermaid
flowchart TD
    REQ["Data request received\n(tool args parsed)"] --> KEY["Build cache key\n(deterministic from args)"]
    KEY --> LOOKUP{"LRU cache lookup"}
    LOOKUP -->|"Hit - fresh entry"| HIT["Return cached value\n(~1ms latency)"]
    LOOKUP -->|"Hit - stale entry\n(TTL expired)"| STALE["Check allowStale config\n(false in v1.0)"]
    LOOKUP -->|"Miss"| FETCH["Fetch from EP API"]
    
    STALE -->|"allowStale: false"| EVICT["Evict stale entry\nFetch fresh from EP API"]
    EVICT --> FETCH
    
    FETCH --> DATA["Receive EP API data\n(JSON-LD normalized)"]
    DATA --> STORE["Store in LRU cache\n(key, value, TTL: 15min)"]
    
    STORE --> CAPACITY{"Cache at capacity?\n(500 entries max)"}
    CAPACITY -->|"Yes"| LRU_EVICT["Evict least recently used entry\n(automatic LRU eviction)"]
    CAPACITY -->|"No"| RETURN["Return fresh value"]
    LRU_EVICT --> RETURN
    HIT --> METRICS["Update hit counter\nin MetricsService"]
    RETURN --> METRICS2["Update miss+fetch counter\nin MetricsService"]
```

---

*See [FUTURE_FLOWCHART.md](./FUTURE_FLOWCHART.md) for planned improvements including real-time data pipelines, streaming execution, and webhook notification flows.*
