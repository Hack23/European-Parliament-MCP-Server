<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">📊 European Parliament MCP Server - State Diagrams</h1>

<p align="center">
  <strong>System State Transitions and Lifecycles</strong><br>
  <em>State Machine Documentation for Operations and Compliance</em>
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
**✅ ISMS Compliance:** ISO 27001 (A.12.1), NIST CSF 2.0 (PR.IP), CIS Controls v8.1 (4.1)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Server Lifecycle States](#server-lifecycle-states)
3. [Tool Execution States](#tool-execution-states)
4. [Cache Entry Lifecycle](#cache-entry-lifecycle)
5. [Rate Limiter Token States](#rate-limiter-token-states)
6. [Request Processing States](#request-processing-states)
7. [Circuit Breaker States (Planned)](#circuit-breaker-states-planned)
8. [Health Check States](#health-check-states)

---

## 🎯 Overview

This document defines all state machines and state transitions in the European Parliament MCP Server. State diagrams ensure predictable behavior, aid debugging, and support audit compliance.

---

## 🚀 Server Lifecycle States

```mermaid
stateDiagram-v2
    [*] --> Initializing: npm start
    Initializing --> Loading: Load Configuration
    Loading --> Validating: Validate Settings
    Validating --> Starting: Start MCP Server
    Starting --> Running: Server Ready
    
    Running --> Degraded: Partial Failure
    Running --> Stopping: Shutdown Signal
    Degraded --> Running: Recovery
    Degraded --> Failed: Critical Error
    
    Stopping --> Cleanup: Close Connections
    Cleanup --> Stopped: Cleanup Complete
    Failed --> Stopped: Force Stop
    Stopped --> [*]
    
    note right of Running
        Accepting MCP requests
        Health checks: OK
        All services operational
    end note
    
    note right of Degraded
        Accepting requests
        Some services impaired
        Automatic recovery attempted
    end note
```

**State Descriptions:**
- **Initializing** - Loading modules, establishing connections
- **Loading** - Reading configuration from environment
- **Validating** - Checking configuration validity
- **Starting** - Initializing MCP server components
- **Running** - Fully operational, accepting requests
- **Degraded** - Partial functionality (e.g., cache unavailable)
- **Stopping** - Graceful shutdown in progress
- **Cleanup** - Closing connections, flushing logs
- **Failed** - Critical error, forced shutdown
- **Stopped** - Server terminated

---

## 🔧 Tool Execution States

```mermaid
stateDiagram-v2
    [*] --> Received: Client Request
    Received --> Validating: Parse Parameters
    Validating --> Queued: Schema Valid
    Validating --> ValidationFailed: Schema Invalid
    
    Queued --> CheckingAuth: Rate Limit OK
    Queued --> RateLimited: Rate Limit Exceeded
    
    CheckingAuth --> Authorized: Auth OK
    CheckingAuth --> Unauthorized: Auth Failed
    
    Authorized --> CheckingCache: Check Cache
    CheckingCache --> CacheHit: Data Found
    CheckingCache --> CacheMiss: Data Not Found
    
    CacheHit --> Formatting: Use Cached Data
    CacheMiss --> Fetching: Call EP API
    
    Fetching --> Transforming: API Success
    Fetching --> APIFailed: API Error
    
    Transforming --> Caching: Transform OK
    Transforming --> TransformFailed: Transform Error
    
    Caching --> Formatting: Cache Updated
    Formatting --> Completed: MCP Response Ready
    
    ValidationFailed --> Failed
    RateLimited --> Failed
    Unauthorized --> Failed
    APIFailed --> Failed
    TransformFailed --> Failed
    
    Completed --> [*]: Return Success
    Failed --> [*]: Return Error
```

**State Transitions:**
1. `Received` → `Validating` - Begin request processing
2. `Validating` → `Queued` - Input validation successful
3. `Queued` → `CheckingAuth` - Rate limit check passed
4. `CheckingAuth` → `Authorized` - Authentication successful
5. `Authorized` → `CheckingCache` - Check for cached response
6. `CheckingCache` → `CacheHit` - Found in cache
7. `CheckingCache` → `CacheMiss` - Not in cache
8. `CacheMiss` → `Fetching` - Fetch from EP API
9. `Fetching` → `Transforming` - API call successful
10. `Transforming` → `Caching` - Data transformation successful
11. `Caching` → `Formatting` - Cache updated
12. `Formatting` → `Completed` - MCP response formatted

---

## 💾 Cache Entry Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Creating: Store Data
    Creating --> Active: Entry Created
    Active --> Active: Access (TTL Reset)
    Active --> Expiring: TTL Countdown
    Expiring --> Expired: TTL Reached
    Expired --> Evicted: Remove Entry
    Active --> Evicted: LRU Eviction
    Evicted --> [*]
    
    note right of Active
        TTL: 15 minutes
        Accessible for reads
        LRU position updated
    end note
    
    note right of Expired
        No longer accessible
        Awaiting eviction
        Memory still allocated
    end note
```

**Cache States:**
- **Creating** - Entry being added to cache
- **Active** - Valid, accessible, TTL active
- **Expiring** - TTL countdown in progress
- **Expired** - TTL reached, no longer valid
- **Evicted** - Removed from cache (LRU or expired)

**TTL Management:**
- Initial TTL: 900 seconds (15 minutes)
- TTL reset on access: No (fixed TTL)
- Max cache size: 500 entries
- Eviction policy: LRU when size exceeded

---

## 🚦 Rate Limiter Token States

```mermaid
stateDiagram-v2
    [*] --> Full: Initialize
    Full --> Consuming: Request Received
    Consuming --> Partial: Token Consumed
    Consuming --> Empty: Last Token Consumed
    
    Partial --> Consuming: Request Received
    Partial --> Refilling: Time Elapsed
    Empty --> Blocked: Request Received
    Empty --> Refilling: Time Elapsed
    
    Refilling --> Partial: Tokens Added
    Refilling --> Full: Full Capacity
    
    Blocked --> Rejected: Return 429
    Rejected --> Empty: Wait for Refill
    
    note right of Full
        Tokens: 100/100
        All requests allowed
    end note
    
    note right of Empty
        Tokens: 0/100
        All requests blocked
    end note
    
    note right of Refilling
        Rate: 100 tokens/15min
        = 0.111 tokens/second
    end note
```

**Token Bucket States:**
- **Full** - All 100 tokens available
- **Consuming** - Token being removed for request
- **Partial** - Some tokens available (1-99)
- **Empty** - No tokens available, requests blocked
- **Refilling** - Tokens being added based on elapsed time
- **Blocked** - Request rejected due to no tokens
- **Rejected** - HTTP 429 response sent

**Refill Algorithm:**
```typescript
const elapsed = now - lastRefillTime;
const tokensToAdd = Math.floor(elapsed * refillRate);
const newTokens = Math.min(capacity, currentTokens + tokensToAdd);
```

---

## 🔄 Request Processing States

```mermaid
stateDiagram-v2
    [*] --> Pending: Request Arrival
    Pending --> Processing: Start Handler
    Processing --> WaitingAPI: Call EP API
    WaitingAPI --> WaitingAPI: Retry with Backoff
    WaitingAPI --> ProcessingResponse: API Response
    WaitingAPI --> TimedOut: Timeout Exceeded
    
    ProcessingResponse --> Success: Valid Response
    ProcessingResponse --> DataError: Invalid Data
    
    Success --> LoggingMetrics: Record Metrics
    DataError --> LoggingError: Record Error
    TimedOut --> LoggingError
    
    LoggingMetrics --> Completed
    LoggingError --> Completed
    Completed --> [*]: Return to Client
```

**Processing States:**
- **Pending** - Request queued, awaiting processing
- **Processing** - Handler executing business logic
- **WaitingAPI** - Awaiting external API response
- **ProcessingResponse** - Transforming API data
- **Success** - Request completed successfully
- **DataError** - Invalid response data received
- **TimedOut** - API call exceeded timeout
- **LoggingMetrics** - Recording success metrics
- **LoggingError** - Recording error metrics
- **Completed** - Final state, response sent

**Timeouts:**
- API call timeout: 30 seconds
- Total request timeout: 60 seconds
- Retry attempts: 3 with exponential backoff

---

## 🔄 Circuit Breaker States (Planned)

```mermaid
stateDiagram-v2
    [*] --> Closed: Initialize
    Closed --> Closed: Success (Counter Reset)
    Closed --> Open: Failure Threshold Exceeded
    
    Open --> HalfOpen: Timeout Elapsed
    Open --> Open: Requests Rejected
    
    HalfOpen --> Closed: Success
    HalfOpen --> Open: Failure
    
    note right of Closed
        Normal operation
        Requests passed through
        Failure counter active
    end note
    
    note right of Open
        Circuit tripped
        All requests fail fast
        Timeout: 60 seconds
    end note
    
    note right of HalfOpen
        Testing recovery
        Limited requests allowed
        Quick failure/recovery
    end note
```

**Circuit Breaker Configuration (Planned Q3 2026):**
- **Failure Threshold**: 5 failures in 10 seconds
- **Open Duration**: 60 seconds
- **Half-Open Test Requests**: 3 requests
- **Success Threshold**: 2 consecutive successes
- **Scope**: Per EP API endpoint

**Benefits:**
- Prevent cascading failures
- Faster failure detection
- Automatic recovery testing
- Reduced load on failing services

---

## ✅ Health Check States

```mermaid
stateDiagram-v2
    [*] --> Checking: Health Check Request
    Checking --> TestingServer: Test MCP Server
    TestingServer --> TestingCache: Server OK
    TestingServer --> Unhealthy: Server Down
    
    TestingCache --> TestingAPI: Cache OK
    TestingCache --> Degraded: Cache Unavailable
    
    TestingAPI --> Healthy: API OK
    TestingAPI --> Degraded: API Unavailable
    
    Degraded --> CheckingSeverity: Assess Impact
    CheckingSeverity --> DegradedOK: Non-Critical
    CheckingSeverity --> Unhealthy: Critical
    
    Healthy --> [*]: Return 200 OK
    DegradedOK --> [*]: Return 200 OK (Warning)
    Unhealthy --> [*]: Return 503 Service Unavailable
    
    note right of Healthy
        All systems operational
        Status: "ok"
        HTTP 200
    end note
    
    note right of Degraded
        Partial functionality
        Status: "degraded"
        HTTP 200 with warnings
    end note
    
    note right of Unhealthy
        Critical failure
        Status: "unhealthy"
        HTTP 503
    end note
```

**Health Check Endpoints:**

**`GET /health`** - Basic liveness check
```json
{
  "status": "ok",
  "timestamp": "2026-02-17T22:40:00Z",
  "uptime": 86400
}
```

**`GET /health/ready`** - Readiness check
```json
{
  "status": "ok",
  "checks": {
    "server": "ok",
    "cache": "ok",
    "api": "ok"
  },
  "timestamp": "2026-02-17T22:40:00Z"
}
```

**`GET /health/detailed`** - Detailed diagnostics
```json
{
  "status": "degraded",
  "checks": {
    "server": {
      "status": "ok",
      "responseTime": "2ms"
    },
    "cache": {
      "status": "degraded",
      "message": "High eviction rate",
      "metrics": {
        "size": 495,
        "hitRate": 0.55
      }
    },
    "api": {
      "status": "ok",
      "responseTime": "234ms"
    }
  },
  "timestamp": "2026-02-17T22:40:00Z"
}
```

---

## 📋 ISMS Compliance

### ISO 27001 Controls
- **A.12.1.2** - Change Management: State transitions documented for audit
- **A.12.1.3** - Capacity Management: State-based resource allocation
- **A.12.4.1** - Event Logging: State transitions logged for audit trail

### NIST CSF 2.0 Functions
- **PR.IP-3** - Configuration Change Control: State machine definitions
- **DE.AE-3** - Event Data Collection: State transition logging
- **DE.CM-3** - Continuous Monitoring: Health check state monitoring

### CIS Controls v8.1
- **4.1** - Configuration Management: State definitions documented
- **8.2** - Audit Log Management: State transitions logged
- **12.3** - Secure Configuration: State machine enforcement

---

## 🔗 Related Documentation

- [FLOWCHART.md](./FLOWCHART.md) - Business process flows
- [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md) - Security implementation
- [ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md) - C4 model diagrams
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - State-based debugging

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://hack23.com">Hack23 AB</a></strong><br>
  <em>State diagram documentation following ISMS standards</em>
</p>
