<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">📈 European Parliament MCP Server — State Diagrams</h1>

<p align="center">
  <strong>System State Transitions and Lifecycle Management</strong><br>
  <em>Complete state machine documentation for server, tools, cache, and rate limiter</em>
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
2. [Server Lifecycle States](#server-lifecycle-states)
3. [Tool Execution States](#tool-execution-states)
4. [API Connection States](#api-connection-states)
5. [Cache Entry States](#cache-entry-states)
6. [Rate Limiter States](#rate-limiter-states)
7. [DI Container States](#di-container-states)

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

## 🖥️ Server Lifecycle States

```mermaid
stateDiagram-v2
    [*] --> Initializing : Process started

    Initializing --> DISetup : Environment loaded
    DISetup --> ClientsReady : DI container built
    ClientsReady --> ToolsRegistered : 39 tools registered
    ToolsRegistered --> ResourcesRegistered : 9 resources registered
    ResourcesRegistered --> PromptsRegistered : 7 prompts registered
    PromptsRegistered --> Running : MCP stdio listener started

    Running --> Processing : Tool call received
    Processing --> Running : Tool call completed

    Running --> Degraded : EP API unavailable
    Degraded --> Running : EP API recovered

    Running --> ShuttingDown : SIGTERM / SIGINT received
    Degraded --> ShuttingDown : SIGTERM / SIGINT received
    Processing --> ShuttingDown : Fatal error

    ShuttingDown --> Stopped : Cleanup complete
    Stopped --> [*]

    note right of Running
        Nominal operating state.
        Accepting MCP tool calls
        via stdio transport.
    end note

    note right of Degraded
        EP API unreachable.
        Cache-only mode active.
        Returning stale data
        or errors to clients.
    end note
```

---

## 🔧 Tool Execution States

```mermaid
stateDiagram-v2
    [*] --> Received : MCP tool_call arrives

    Received --> Routing : Tool name lookup
    Routing --> NotFound : Tool not registered
    Routing --> Validating : Tool found

    NotFound --> [*] : Return error to client

    Validating --> ValidationFailed : Zod parse error
    Validating --> RateLimitCheck : Input valid

    ValidationFailed --> [*] : Return validation error

    RateLimitCheck --> RateLimited : No token available
    RateLimitCheck --> AuditLogging : Token granted

    RateLimited --> [*] : Return rate limit error

    AuditLogging --> CacheCheck : Invocation logged

    CacheCheck --> CacheHit : Entry found and fresh
    CacheCheck --> FetchingAPI : Cache miss

    CacheHit --> Returning : Cache data retrieved
    FetchingAPI --> APIError : HTTP error / timeout
    FetchingAPI --> Parsing : HTTP 200 received

    APIError --> Retrying : Retry count < 3
    APIError --> ErrorReturn : Retry count >= 3
    Retrying --> FetchingAPI : After backoff

    Parsing --> ParseError : JSON-LD parse failure
    Parsing --> Validating2 : Parse success

    ParseError --> ErrorReturn : Log and return error

    Validating2 --> Caching : Response validated
    Caching --> Returning : Stored in LRU cache

    Returning --> MetricsUpdate : Result prepared
    ErrorReturn --> MetricsUpdate : Error prepared

    MetricsUpdate --> [*] : Response sent to client
```

---

## 🌐 API Connection States

```mermaid
stateDiagram-v2
    [*] --> Unknown : Client initialized

    Unknown --> Checking : Health check triggered
    Checking --> Available : Ping success (200)
    Checking --> Unavailable : Ping failed / timeout

    Available --> Requesting : API call initiated
    Requesting --> Success : HTTP 200 received
    Requesting --> RateLimited : HTTP 429 received
    Requesting --> ServerError : HTTP 500+ received
    Requesting --> Timeout : Request timed out
    Requesting --> NetworkError : DNS / connection failure

    Success --> Available : Ready for next request
    RateLimited --> BackingOff : Enter exponential backoff
    BackingOff --> Requesting : After backoff delay (2^n * 1s)

    ServerError --> Available : Error logged, next request allowed
    Timeout --> Available : Timeout logged, retry allowed
    NetworkError --> Unavailable : Connection lost

    Unavailable --> Checking : Periodic health check (30s)

    note right of Available
        Nominal state.
        Cache hit rate: ~70%
        Avg latency: ~200ms
    end note

    note right of BackingOff
        Exponential backoff:
        Attempt 1: 1s
        Attempt 2: 2s
        Attempt 3: 4s
        Then fail.
    end note
```

---

## 💾 Cache Entry States

```mermaid
stateDiagram-v2
    [*] --> Empty : Cache initialized (0 entries)

    Empty --> Fresh : First data stored

    Fresh --> Fresh : Cache hit (GET resets age if updateAgeOnGet=true)
    Fresh --> Stale : TTL expires (15 minutes)

    Stale --> Evicted : allowStale=false - entry removed on access
    Stale --> Evicted : LRU eviction (capacity=500 reached)

    Empty --> Full : 500 entries stored
    Full --> Full : LRU eviction makes space for new entry
    Full --> Fresh : New entry replaces evicted entry

    Evicted --> [*] : Entry removed from memory

    note right of Fresh
        Entry age: 0 - 14:59
        Served directly from cache
        Latency: ~1ms
    end note

    note right of Stale
        Entry age: 15:00+
        allowStale=false means
        stale entries are not
        returned to callers
    end note

    note right of Full
        500 entries = max capacity
        New writes trigger LRU eviction
        of least recently used entry
    end note
```

---

## ⏱️ Rate Limiter States

```mermaid
stateDiagram-v2
    [*] --> FullBucket : Initialized (100 tokens)

    FullBucket --> FullBucket : Request granted, token consumed, refill > consumption
    FullBucket --> PartialBucket : Request granted, token consumed

    PartialBucket --> PartialBucket : Requests granted, tokens fluctuating
    PartialBucket --> EmptyBucket : All 100 tokens consumed
    PartialBucket --> FullBucket : No requests, tokens refilled to 100

    EmptyBucket --> Throttling : New request arrives
    Throttling --> EmptyBucket : Request rejected (no token granted)
    EmptyBucket --> PartialBucket : Time passes, tokens refill

    note right of FullBucket
        tokens = 100
        Burst capacity available.
        Refill rate: ~1.67/second
        (100/minute)
    end note

    note right of EmptyBucket
        tokens = 0
        All requests rejected
        until refill occurs.
        Retry-after: varies
    end note

    note right of Throttling
        RateLimitError thrown.
        Propagated to tool handler.
        Logged in AuditLogger.
        Counted in MetricsService.
    end note
```

---

## 🏗️ DI Container States

```mermaid
stateDiagram-v2
    [*] --> Uninitialized : Container created

    Uninitialized --> Registering : register() called

    Registering --> Registering : Additional services registered
    note right of Registering
        Services registered:
        1. RateLimiter
        2. MetricsService
        3. AuditLogger
        4. HealthService
        5. LRU Cache
        6-14. EP API Clients (9)
    end note

    Registering --> Sealed : All services registered

    Sealed --> Resolving : resolve() called for service
    Resolving --> Ready : All singletons instantiated

    Ready --> Ready : Normal operation, singletons served
    Ready --> Disposing : Server shutdown initiated

    Disposing --> Disposed : All services cleaned up

    Disposed --> [*]

    note right of Ready
        Singletons active:
        - RateLimiter (1 instance)
        - MetricsService (1 instance)
        - AuditLogger (1 instance)
        - HealthService (1 instance)
        Shared across all 39 tools
    end note
```

---

*See [FUTURE_STATEDIAGRAM.md](./FUTURE_STATEDIAGRAM.md) for planned state management enhancements including streaming response states, real-time subscription states, and OAuth session states.*
