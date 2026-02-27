<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">📈 European Parliament MCP Server — Future State Diagrams</h1>

<p align="center">
  <strong>Planned State Management: Streaming, OAuth Sessions, Enhanced Cache, Real-Time Subscriptions</strong><br>
  <em>Future state machine documentation for EP MCP Server evolution</em>
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
2. [Streaming Response States (v1.2)](#streaming-response-states-v12)
3. [Real-Time Subscription States (v1.2)](#real-time-subscription-states-v12)
4. [Enhanced Cache State Machine (v1.1)](#enhanced-cache-state-machine-v11)
5. [OAuth Session States (v2.0)](#oauth-session-states-v20)
6. [Circuit Breaker States (v1.1)](#circuit-breaker-states-v11)
7. [Webhook Delivery States (v2.0)](#webhook-delivery-states-v20)

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

## 🌊 Streaming Response States (v1.2)

MCP streaming support for long-running tool operations:

```mermaid
stateDiagram-v2
    [*] --> StreamRequested : tool_call with streaming=true

    StreamRequested --> StreamValidating : Input validation starts
    StreamValidating --> StreamRejected : Validation fails
    StreamValidating --> StreamInitializing : Validation passes

    StreamRejected --> [*] : Error response sent

    StreamInitializing --> StreamHeaderSent : stream_start event emitted
    StreamHeaderSent --> ChunkPhase1 : Phase 1 processing starts

    ChunkPhase1 --> Chunk1Emitted : Phase 1 data ready
    Chunk1Emitted --> ChunkPhase2 : Phase 2 processing starts

    ChunkPhase2 --> Chunk2Emitted : Phase 2 data ready
    Chunk2Emitted --> ChunkPhase3 : Phase 3 processing starts

    ChunkPhase3 --> Chunk3Emitted : Phase 3 data ready
    Chunk3Emitted --> ChunkPhase4 : Phase 4 processing starts

    ChunkPhase4 --> Chunk4Emitted : Final chunk ready
    Chunk4Emitted --> StreamCompleted : stream_end event emitted

    ChunkPhase1 --> StreamError : Phase error
    ChunkPhase2 --> StreamError : Phase error
    ChunkPhase3 --> StreamError : Phase error
    ChunkPhase4 --> StreamError : Phase error

    StreamError --> StreamCompleted : stream_error + stream_end emitted
    StreamCompleted --> [*]

    note right of StreamHeaderSent
        Emits immediately to client.
        Informs client to expect
        multiple chunks.
        Contains: tool, estimated_chunks
    end note

    note right of StreamError
        Partial results may be
        delivered before error.
        Client receives what was
        computed successfully.
    end note
```

---

## 📡 Real-Time Subscription States (v1.2)

Client subscription lifecycle for EP data change notifications:

```mermaid
stateDiagram-v2
    [*] --> SubscriptionRequested : subscribe() called with event types

    SubscriptionRequested --> Authenticating : Auth check (v2.0+)
    Authenticating --> AuthFailed : Invalid credentials
    AuthFailed --> [*] : Subscription rejected

    Authenticating --> ValidatingEvents : Auth passed
    SubscriptionRequested --> ValidatingEvents : (no auth in v1.2 local mode)

    ValidatingEvents --> InvalidEvents : Unknown event types requested
    InvalidEvents --> [*] : Subscription rejected (list valid types)

    ValidatingEvents --> Active : Subscription created (ID assigned)

    Active --> Receiving : EP data change event arrives
    Receiving --> Active : Event delivered to client

    Active --> Paused : Client sends pause signal
    Paused --> Active : Client sends resume signal

    Active --> Closing : Client calls unsubscribe()
    Paused --> Closing : Client calls unsubscribe()
    Active --> Closing : Server shutdown detected
    Active --> Closing : Auth token expired (v2.0)

    Closing --> Closed : Cleanup complete (remove from registry)
    Closed --> [*]

    note right of Active
        Subscription ID returned.
        Client receives events via:
        - SSE (v1.2)
        - WebSocket (v1.2)
        - GraphQL subscription (v2.0)
    end note

    note right of Paused
        Events buffered (max 1000).
        Delivered on resume.
        Buffer overflow: oldest dropped.
    end note
```

---

## 💾 Enhanced Cache State Machine (v1.1)

Two-tier cache (LRU + Redis) state management:

```mermaid
stateDiagram-v2
    [*] --> L1Empty : Server starts (L1 empty)
    [*] --> L2Check : Redis configured

    L2Check --> L2Warmup : Redis available
    L2Check --> L1Empty : Redis unavailable (fallback to L1 only)

    L2Warmup --> L1Warmed : Frequently accessed keys pre-loaded to L1

    L1Empty --> L1Miss : Cache lookup (no entry)
    L1Warmed --> L1Hit : Cache lookup (entry found, fresh)
    L1Warmed --> L1Stale : Cache lookup (entry found, TTL expired)
    L1Warmed --> L1Miss : Cache lookup (entry not in L1)

    L1Miss --> L2Hit : L2 Redis lookup success
    L1Miss --> BothMiss : L2 Redis miss

    L2Hit --> L1Populated : Write to L1 (promote from L2)
    L1Populated --> L1Hit : Next lookup served from L1

    BothMiss --> Fetching : Fetch from EP API
    Fetching --> L1Written : Write to L1 (15-min TTL)
    L1Written --> L2Written : Write to L2 (60-min TTL)
    L2Written --> L1Hit : Data available

    L1Stale --> BackgroundRefresh : Stale-while-revalidate (v1.1)
    BackgroundRefresh --> L1Hit : Background fetch updates L1
    L1Stale --> L1Stale : Stale value returned while refreshing

    L1Hit --> [*] : Data returned (~1ms)
    L2Hit --> [*] : Data returned (~5ms)

    note right of L2Warmup
        On startup, Redis keys
        with remaining TTL are
        pre-loaded to L1 cache.
        Reduces EP API calls
        after restart.
    end note
```

---

## 🔑 OAuth Session States (v2.0)

User session lifecycle for HTTP transport with OAuth 2.0:

```mermaid
stateDiagram-v2
    [*] --> Anonymous : HTTP request without token

    Anonymous --> Authenticating : Bearer token presented
    Authenticating --> TokenInvalid : JWT signature invalid
    Authenticating --> TokenExpired : JWT expiry check fails
    Authenticating --> TokenValid : JWT valid, claims extracted

    TokenInvalid --> [*] : 401 response
    TokenExpired --> RefreshFlow : Refresh token available
    TokenExpired --> [*] : 401 response (no refresh token)

    RefreshFlow --> Refreshing : POST to token endpoint
    Refreshing --> TokenValid : New access token received
    Refreshing --> RefreshFailed : Refresh token expired/invalid
    RefreshFailed --> [*] : 401 - re-authentication required

    TokenValid --> RBACCheck : Check tool permissions
    RBACCheck --> Authorized : Role has tool permission
    RBACCheck --> Forbidden : Role lacks permission

    Forbidden --> [*] : 403 response

    Authorized --> Active : Session established
    Active --> Active : Subsequent requests (token cached 5 min)
    Active --> TokenExpired : Token TTL reached
    Active --> SessionRevoked : Admin revokes session
    Active --> SessionEnded : User logs out / timeout

    SessionRevoked --> [*] : 401 response
    SessionEnded --> [*]

    note right of Active
        Token validation results
        cached for 5 minutes.
        Avoids JWKS call on
        every request.
    end note

    note right of Anonymous
        In v2.0, anonymous access
        allowed only for localhost
        or with specific config.
        Production requires auth.
    end note
```

---

## ⚡ Circuit Breaker States (v1.1)

EP API circuit breaker state machine:

```mermaid
stateDiagram-v2
    [*] --> Closed : Initialized (normal operation)

    Closed --> Closed : Request succeeds
    Closed --> RecordingFailure : Request fails

    RecordingFailure --> Closed : Failure count below threshold (5)
    RecordingFailure --> Open : Failure threshold reached

    Open --> Open : Requests fast-fail (no API call)
    Open --> HalfOpen : Timeout elapsed (30 seconds)

    HalfOpen --> Closed : Probe request succeeds (circuit reset)
    HalfOpen --> Open : Probe request fails (extend open period)

    note right of Closed
        Normal operating state.
        All API calls pass through.
        Failure counter tracked.
        Reset on success.
    end note

    note right of Open
        EP API assumed unreachable.
        All requests fast-fail.
        Cached data returned if available.
        Otherwise: circuit open error.
    end note

    note right of HalfOpen
        Single probe allowed.
        Tests if EP API recovered.
        Success: fully close circuit.
        Failure: reopen for 30s.
    end note
```

---

## 🔔 Webhook Delivery States (v2.0)

Individual webhook delivery attempt state machine:

```mermaid
stateDiagram-v2
    [*] --> Pending : Event detected, webhook matched

    Pending --> Signing : Create HMAC signature
    Signing --> Sending : HTTP POST initiated

    Sending --> Delivered : HTTP 200 received
    Sending --> TemporaryFailure : HTTP 4xx/5xx received
    Sending --> NetworkFailure : Connection timeout/error

    Delivered --> [*] : Success logged in audit trail

    TemporaryFailure --> WaitingRetry1 : Schedule retry 1 (after 1 min)
    NetworkFailure --> WaitingRetry1 : Schedule retry 1 (after 1 min)

    WaitingRetry1 --> Retry1 : Retry 1 attempt
    Retry1 --> Delivered : HTTP 200 received
    Retry1 --> WaitingRetry2 : Still failing (after 5 min)

    WaitingRetry2 --> Retry2 : Retry 2 attempt
    Retry2 --> Delivered : HTTP 200 received
    Retry2 --> WaitingRetry3 : Still failing (after 15 min)

    WaitingRetry3 --> Retry3 : Final retry attempt
    Retry3 --> Delivered : HTTP 200 received
    Retry3 --> PermanentFailure : All retries exhausted

    PermanentFailure --> [*] : Alert webhook owner, disable webhook

    note right of PermanentFailure
        After 3 retries (total 4 attempts),
        webhook marked as failed.
        Owner notified via email/notification.
        Webhook auto-disabled after
        5 consecutive permanent failures.
    end note
```

---

*See [STATEDIAGRAM.md](./STATEDIAGRAM.md) for the current implemented state machines.*
