<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🔄 European Parliament MCP Server — Future Flowcharts</h1>

<p align="center">
  <strong>Planned Workflow Improvements, Real-Time Pipelines, and Streaming Execution</strong><br>
  <em>Future process flow documentation for EP MCP Server evolution</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-Hack23-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-2.0-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--02--26-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Review-Quarterly-orange?style=for-the-badge" alt="Review Cycle"/></a>
</p>

**📋 Document Owner:** Hack23 | **📄 Version:** 2.0 | **📅 Last Updated:** 2026-02-26 (UTC)
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-05-26
**🏷️ Classification:** Public (Open Source MCP Server)
**✅ ISMS Compliance:** ISO 27001 (A.5.1, A.8.1, A.14.2), NIST CSF 2.0 (ID.AM, PR.DS), CIS Controls v8.1 (2.1, 16.1)

---

## 📑 Table of Contents

1. [Security Documentation Map](#security-documentation-map)
2. [Real-Time Data Pipeline Flow (v1.2)](#real-time-data-pipeline-flow-v12)
3. [Streaming Tool Execution Flow (v1.2)](#streaming-tool-execution-flow-v12)
4. [Enhanced Caching Strategy (v1.1)](#enhanced-caching-strategy-v11)
5. [Webhook Notification Flow (v2.0)](#webhook-notification-flow-v20)
6. [Circuit Breaker Flow (v1.1)](#circuit-breaker-flow-v11)
7. [OAuth Authentication Flow (v2.0)](#oauth-authentication-flow-v20)

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

## 📡 Real-Time Data Pipeline Flow (v1.2)

Planned flow for detecting and propagating EP data changes to subscribed clients:

```mermaid
flowchart TD
    subgraph Polling["EP API Polling Layer (v1.2)"]
        SCHED["Scheduler\n(configurable interval: 5-60 min)"]
        FETCH["Fetch latest data\nfrom EP API v2"]
        DIFF["Diff engine\n(compare with cached version)"]
        DETECT{"Changes detected?"}
    end

    subgraph Events["Event Processing Layer"]
        CREATE["Create EPDataEvent\n(typed, versioned)"]
        VALIDATE["Zod event validation"]
        STORE["Event store\n(Redis Streams)"]
    end

    subgraph Distribution["Distribution Layer"]
        FANOUT["Event fanout router"]
        SSE["SSE endpoint\n/events stream"]
        WS["WebSocket\n/ws endpoint"]
        CACHE_UPDATE["Update LRU cache\n(invalidate stale entries)"]
    end

    subgraph Subscribers["Subscribers"]
        MCP_CLIENT["MCP Client\n(via SSE/WS)"]
        WEBHOOK["Registered webhook\n(HTTP POST)"]
    end

    SCHED --> FETCH
    FETCH --> DIFF
    DIFF --> DETECT
    DETECT -->|"No changes"| SCHED
    DETECT -->|"Changes found"| CREATE
    CREATE --> VALIDATE
    VALIDATE --> STORE
    STORE --> FANOUT
    FANOUT --> SSE
    FANOUT --> WS
    FANOUT --> CACHE_UPDATE
    SSE --> MCP_CLIENT
    WS --> MCP_CLIENT
    STORE --> WEBHOOK
```

---

## 🌊 Streaming Tool Execution Flow (v1.2)

MCP supports streaming responses for long-running tools. v1.2 plans streaming for report generation and multi-step OSINT analysis:

```mermaid
flowchart TD
    TOOL_CALL["MCP tool_call\n(streaming: true)"] --> VALIDATE["Zod validation\n(input schema)"]
    VALIDATE -->|"Valid"| STREAM_START["Emit: stream_start\n(metadata: tool, estimated_chunks)"]
    
    STREAM_START --> PHASE1["Phase 1: Fetch core data\nget_meps, get_procedures"]
    PHASE1 --> EMIT1["Emit chunk 1\n(core data partial result)"]
    
    EMIT1 --> PHASE2["Phase 2: Enrichment\nget_voting_records, get_speeches"]
    PHASE2 --> EMIT2["Emit chunk 2\n(enriched data)"]
    
    EMIT2 --> PHASE3["Phase 3: Analysis\napply OSINT algorithms"]
    PHASE3 --> EMIT3["Emit chunk 3\n(analysis results)"]
    
    EMIT3 --> PHASE4["Phase 4: Report generation\nformat output"]
    PHASE4 --> EMIT4["Emit chunk 4\n(formatted report)"]
    
    EMIT4 --> STREAM_END["Emit: stream_end\n(total_chunks, duration_ms)"]

    PHASE1 -->|"Error"| STREAM_ERROR["Emit: stream_error\n(error type, partial data)"]
    PHASE2 -->|"Error"| STREAM_ERROR
    STREAM_ERROR --> STREAM_END
```

### Tools That Will Support Streaming (v1.2)

| Tool | Streaming Use Case |
|------|--------------------|
| `generate_report` | Multi-section report generation |
| `analyze_voting_patterns` | Progressive pattern analysis |
| `generate_political_landscape` | Multi-dimensional landscape analysis |
| `track_legislation` | Multi-procedure timeline tracking |
| `assess_mep_influence` | Multi-metric influence calculation |

---

## 💾 Enhanced Caching Strategy (v1.1)

Two-tier caching with optional Redis persistence:

```mermaid
flowchart TD
    REQUEST["Tool request\n(cache key computed)"] --> L1{"L1: LRU Cache\n(in-memory, 500 entries)"}
    
    L1 -->|"Hit"| L1_RETURN["Return L1 data\nLatency: ~1ms"]
    L1 -->|"Miss"| L2{"L2: Redis Cache\n(optional, persistent)"}
    
    L2 -->|"Hit (fresh)"| L2_RETURN["Return L2 data\nPromote to L1\nLatency: ~5ms"]
    L2 -->|"Hit (stale)"| REVALIDATE["Background revalidation\nReturn stale while revalidating"]
    L2 -->|"Miss"| FETCH["Fetch from EP API\nLatency: ~200ms"]
    
    FETCH --> STORE_L1["Store in L1 LRU cache\n(15-min TTL)"]
    STORE_L1 --> STORE_L2["Store in Redis\n(60-min TTL, longer persistence)"]
    STORE_L2 --> RETURN["Return fresh data"]
    
    L2_RETURN --> L1_WRITE["Write to L1 cache\n(remaining TTL from Redis)"]
    L1_WRITE --> RETURN
    
    REVALIDATE -->|"Background"| FETCH
    REVALIDATE -->|"Immediate"| STALE_RETURN["Return stale data\n(stale-while-revalidate)"]
    
    L1_RETURN --> METRICS["Update cache metrics\n(hit/miss counters, tier)"]
    RETURN --> METRICS
    STALE_RETURN --> METRICS
```

### Cache TTL Strategy (v1.1)

| Data Type | L1 TTL (LRU) | L2 TTL (Redis) | Rationale |
|-----------|-------------|----------------|-----------|
| MEP details | 15 min | 60 min | Changes infrequently |
| Vote records | 30 min | 2 hours | Historical, immutable after adoption |
| Plenary sessions | 10 min | 30 min | Schedules can change |
| Procedures | 15 min | 60 min | Stage changes daily max |
| Documents | 60 min | 6 hours | Published docs don't change |
| Vocabularies | 120 min | 24 hours | Very stable taxonomy data |

---

## 🔔 Webhook Notification Flow (v2.0)

Clients can register webhooks to receive notifications when EP data changes:

```mermaid
flowchart TD
    subgraph Registration["Webhook Registration (v2.0)"]
        REG_REQ["POST /webhooks\n(url, events[], secret)"]
        REG_VAL["Validate webhook URL\n(ping test)"]
        REG_STORE["Store webhook config\n(id, url, events, secret, active)"]
        REG_RESP["Return webhook ID"]
    end

    subgraph Delivery["Webhook Delivery"]
        EVENT_TRIGGER["EP data change event\n(EPDataEvent)"]
        MATCH["Match event type\nto registered webhooks"]
        SIGN["HMAC-SHA256 signature\n(X-EP-MCP-Signature header)"]
        DELIVER["HTTP POST to webhook URL\n(payload: EPDataEvent JSON)"]
        CHECK{"HTTP 200 response?"}
        SUCCESS["Mark delivery success\nLog in audit trail"]
        RETRY_Q["Add to retry queue\n(max 3 retries)"]
        RETRY["Retry with backoff\n(1min, 5min, 15min)"]
        FAIL["Mark delivery failed\nAlert webhook owner"]
    end

    REG_REQ --> REG_VAL
    REG_VAL --> REG_STORE
    REG_STORE --> REG_RESP

    EVENT_TRIGGER --> MATCH
    MATCH --> SIGN
    SIGN --> DELIVER
    DELIVER --> CHECK
    CHECK -->|"Yes"| SUCCESS
    CHECK -->|"No"| RETRY_Q
    RETRY_Q --> RETRY
    RETRY -->|"Success"| SUCCESS
    RETRY -->|"All failed"| FAIL
```

---

## ⚡ Circuit Breaker Flow (v1.1)

Prevents cascade failures when the EP API is degraded:

```mermaid
flowchart TD
    REQUEST["API request\n(tool handler)"] --> CB_STATE{"Circuit breaker\nstate?"}
    
    CB_STATE -->|"CLOSED (normal)"| ATTEMPT["Attempt EP API call"]
    CB_STATE -->|"OPEN (tripped)"| FAST_FAIL["Fast fail response\n(no API call made)"]
    CB_STATE -->|"HALF-OPEN (testing)"| PROBE["Single probe request\n(test EP API health)"]

    ATTEMPT -->|"Success"| RESET["Reset failure counter\nRemain CLOSED"]
    ATTEMPT -->|"Failure"| INCREMENT["Increment failure counter\n(threshold: 5 failures in 60s)"]
    INCREMENT --> THRESHOLD{"Threshold\nreached?"}
    THRESHOLD -->|"No"| CONTINUE["Return error to caller"]
    THRESHOLD -->|"Yes"| TRIP["TRIP circuit\n(OPEN state)\nTimeout: 30s"]
    
    FAST_FAIL --> CACHED{"Cached data\navailable?"}
    CACHED -->|"Yes"| RETURN_CACHE["Return stale cached data\nwith staleness warning"]
    CACHED -->|"No"| RETURN_ERROR["Return circuit open error\n(with retry-after)"]

    PROBE -->|"Success"| CLOSE["Close circuit\n(CLOSED state)"]
    PROBE -->|"Failure"| REOPEN["Remain OPEN\n(reset timeout)"]

    TRIP --> WAIT["Wait 30 seconds"]
    WAIT --> HALF_OPEN["Enter HALF-OPEN state"]
    HALF_OPEN --> PROBE
```

---

## 🔑 OAuth Authentication Flow (v2.0)

For HTTP transport mode with OAuth 2.0:

```mermaid
flowchart TD
    HTTP_REQ["HTTP MCP request\n(Authorization: Bearer token)"] --> EXTRACT["Extract Bearer token"]
    EXTRACT --> TOKEN_PRESENT{"Token present?"}
    
    TOKEN_PRESENT -->|"No"| ANON_CHECK{"Anonymous\naccess allowed?"}
    ANON_CHECK -->|"Yes (local dev)"| PROCEED_ANON["Proceed as anonymous\n(reader role)"]
    ANON_CHECK -->|"No (production)"| REJECT_401["Return 401 Unauthorized\nWWW-Authenticate: Bearer"]
    
    TOKEN_PRESENT -->|"Yes"| CACHE_CHECK{"Token in\nvalidation cache?"}
    CACHE_CHECK -->|"Yes (fresh)"| CLAIMS["Use cached claims\n(avoid JWKS call)"]
    CACHE_CHECK -->|"No"| JWKS["Fetch JWKS from\nOAuth provider"]
    JWKS --> VERIFY["Verify JWT signature\nCheck expiry and audience"]
    VERIFY -->|"Invalid"| REJECT_401_SIG["Return 401\n(invalid signature)"]
    VERIFY -->|"Valid"| STORE_CACHE["Cache validated claims\n(5-min TTL)"]
    STORE_CACHE --> CLAIMS
    
    CLAIMS --> RBAC["RBAC check\n(tool permissions)"]
    RBAC -->|"Forbidden"| REJECT_403["Return 403 Forbidden"]
    RBAC -->|"Allowed"| PROCEED["Proceed with tool execution\n(user context injected)"]
    
    PROCEED_ANON --> TOOL["Execute MCP tool"]
    PROCEED --> TOOL
    TOOL --> AUDIT["Audit log with user identity"]
    AUDIT --> RESPONSE["Return MCP response"]
```

---

*See [FLOWCHART.md](./FLOWCHART.md) for the current implemented workflows.*
