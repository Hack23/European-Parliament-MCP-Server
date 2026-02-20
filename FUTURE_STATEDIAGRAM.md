<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">📈 European Parliament MCP Server — Future State Diagram</h1>

<p align="center">
  <strong>🏗️ Advanced State Management</strong><br>
  <em>📈 System State Transitions and Lifecycle Evolution</em>
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

- [Executive Summary](#-executive-summary)
- [Current State Baseline](#-current-state-baseline)
- [Enhanced MCP Connection Lifecycle](#-enhanced-mcp-connection-lifecycle)
- [Cache State Machine](#-cache-state-machine)
- [Request Processing States](#-request-processing-states)
- [API Circuit Breaker States](#-api-circuit-breaker-states)
- [Security Session Lifecycle](#️-security-session-lifecycle)
- [Policy Alignment](#-policy-alignment)
- [Related Documents](#-related-documents)

---

## 🎯 Executive Summary

This document outlines future state management improvements for the European Parliament MCP Server, including enhanced connection lifecycle, multi-tier caching, circuit breaker patterns, and security session management. **All future infrastructure runs on serverless AWS** (Lambda, DynamoDB, API Gateway, Cognito) — see [FUTURE_ARCHITECTURE.md](FUTURE_ARCHITECTURE.md).

---

## 📊 Current State Baseline

Current state diagrams are documented in [STATEDIAGRAM.md](STATEDIAGRAM.md).

---

## 🔄 Enhanced MCP Connection Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Initializing: Server Start
    Initializing --> Ready: Configuration Loaded
    Initializing --> Failed: Config Error

    Ready --> Authenticating: Client Connects
    Authenticating --> Authenticated: Valid Credentials
    Authenticating --> Rejected: Invalid Credentials
    Rejected --> Ready: Retry Available

    Authenticated --> Active: Session Established
    Active --> Processing: Tool Request
    Processing --> Active: Response Sent
    Active --> RateLimited: Quota Exceeded
    RateLimited --> Active: Cooldown Complete
    Active --> Idle: No Activity (timeout)
    Idle --> Active: New Request
    Idle --> Disconnecting: Timeout

    Active --> Disconnecting: Client Disconnect
    Disconnecting --> Ready: Cleanup Complete
    Active --> GracefulShutdown: Server Shutdown
    GracefulShutdown --> [*]: All Requests Complete

    Failed --> [*]: Unrecoverable Error
```

---

## 📦 Cache State Machine

```mermaid
stateDiagram-v2
    [*] --> Empty: Initialize

    Empty --> Populating: Cache Miss
    Populating --> Fresh: Data Fetched
    Populating --> Error: Fetch Failed
    Error --> Empty: Reset

    Fresh --> Serving: Read Request
    Serving --> Fresh: Response Sent
    Fresh --> Stale: TTL Expired

    Stale --> Refreshing: Background Refresh
    Stale --> Serving: Serve Stale (fallback)
    Refreshing --> Fresh: Refresh Success
    Refreshing --> Stale: Refresh Failed

    Fresh --> Evicted: Memory Pressure
    Stale --> Evicted: Memory Pressure
    Evicted --> Empty: Eviction Complete

    Fresh --> Invalidated: Manual Invalidation
    Invalidated --> Empty: Clear Complete
```

---

## ⚙️ Request Processing States

```mermaid
stateDiagram-v2
    [*] --> Received: MCP Request

    Received --> Validating: Parse Input
    Validating --> Validated: Schema Valid
    Validating --> Rejected2: Schema Invalid
    Rejected2 --> [*]: Error Response

    Validated --> Authorized: Auth Check Pass
    Validated --> Forbidden: Auth Check Fail
    Forbidden --> [*]: 403 Response

    Authorized --> Queued: Rate Limit OK
    Authorized --> Throttled: Rate Limit Hit
    Throttled --> [*]: 429 Response

    Queued --> CacheCheck: Dequeued
    CacheCheck --> CacheHit: Data in Cache
    CacheHit --> Responding: Format Response
    CacheCheck --> Fetching: Cache Miss

    Fetching --> Transforming: API Response OK
    Fetching --> CircuitOpen: API Error
    CircuitOpen --> Fallback: Use Fallback
    Fallback --> Responding: Degraded Response

    Transforming --> Caching: Data Transformed
    Caching --> Responding: Cache Updated
    Responding --> Streaming: Large Response
    Responding --> Complete: Small Response
    Streaming --> Complete: Stream Finished
    Complete --> [*]: Response Sent
```

---

## 🔄 API Circuit Breaker States

```mermaid
stateDiagram-v2
    [*] --> Closed: Normal Operation

    Closed --> Closed: Success
    Closed --> Open: Failure Threshold Reached

    Open --> Open: Reject Requests (fast fail)
    Open --> HalfOpen: Timeout Elapsed

    HalfOpen --> Closed: Probe Success
    HalfOpen --> Open: Probe Failed

    note right of Closed
        All requests pass through
        Failures counted
        Threshold: 5 failures in 60s
    end note

    note right of Open
        All requests fast-fail
        Timer: 30 seconds
        Returns cached/fallback data
    end note

    note right of HalfOpen
        Single probe request allowed
        Success resets circuit
        Failure reopens circuit
    end note
```

---

## 🛡️ Security Session Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Anonymous: Connection Opened

    Anonymous --> Authenticating2: Credentials Provided
    Authenticating2 --> SessionActive: Auth Success
    Authenticating2 --> Anonymous: Auth Failed (retry)
    Authenticating2 --> Locked: Too Many Failures

    SessionActive --> SessionActive: Request Processed
    SessionActive --> TokenRefresh: Token Expiring
    TokenRefresh --> SessionActive: Refresh Success
    TokenRefresh --> Anonymous: Refresh Failed

    SessionActive --> SessionExpired: Inactivity Timeout
    SessionExpired --> Anonymous: Session Cleared
    SessionActive --> Terminated: Explicit Logout
    Terminated --> Anonymous: Cleanup Complete

    Locked --> Anonymous: Lockout Expired (15min)
    Locked --> [*]: Admin Unlock

    note right of SessionActive
        Valid token
        RBAC enforced
        Audit logging active
    end note
```

---

## ⚡ Lambda Function Execution Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Cold: First Invocation
    Cold --> Initializing: Download Code
    Initializing --> InitRuntime: Extract Package
    InitRuntime --> InitHandler: Load Dependencies
    InitHandler --> Warm: Handler Ready
    
    Warm --> Executing: Event Trigger
    Executing --> Processing: Run Handler Code
    Processing --> DynamoDBCall: Query Cache
    DynamoDBCall --> CacheHit: Data Found
    DynamoDBCall --> CacheMiss: Data Not Found
    
    CacheMiss --> APICall: Call EP API
    APICall --> APISuccess: Data Retrieved
    APICall --> APIError: Request Failed
    APIError --> Retry: Transient Error
    Retry --> APICall: Exponential Backoff
    APIError --> Fallback: Permanent Error
    Fallback --> Processing: Serve Stale Data
    
    APISuccess --> UpdateCache: Store in DynamoDB
    UpdateCache --> Processing: Continue
    CacheHit --> Processing: Continue
    Processing --> Response: Format Output
    Response --> Warm: Execution Complete
    
    Warm --> Frozen: No Activity (5 min)
    Frozen --> Warm: New Invocation
    Frozen --> Terminated: No Activity (15 min)
    Terminated --> [*]: Container Destroyed
    
    note right of Cold
        Cold Start: 100-500ms
        Rare: <1% of invocations
        Optimized: Small packages
    end note
    
    note right of Warm
        Warm Invocation: 5-50ms
        Common: >99% of invocations
        Reuses container
    end note
    
    note right of Frozen
        Container paused
        Memory snapshot preserved
        Quick resume: 10-20ms
    end note
```

### **Lambda Lifecycle Metrics**

| State | Duration | Frequency | Cost Impact |
|-------|----------|-----------|-------------|
| **Cold Start** | 100-500ms | <1% invocations | Billed for full duration |
| **Warm Invocation** | 5-50ms | >99% invocations | Billed for execution only |
| **Frozen** | N/A | After 5 min idle | No cost |
| **Terminated** | N/A | After 15 min idle | No cost |

**Optimization Strategy:**
- **Provisioned Concurrency:** 10 instances for router Lambda (eliminates cold starts)
- **Package Size:** <10 MB (faster cold starts)
- **Runtime:** Node.js 24 (faster initialization than Python)
- **Lazy Loading:** Import modules only when needed

---

## 🗄️ Distributed DynamoDB Cache State Machine

```mermaid
stateDiagram-v2
    [*] --> Empty: Table Created
    Empty --> Writing: First Write
    Writing --> Fresh: TTL Set
    
    Fresh --> Serving: Read Request
    Serving --> Fresh: Data Returned
    Fresh --> Stale: TTL Expired
    
    Stale --> BackgroundRefresh: Lambda EventBridge Trigger
    BackgroundRefresh --> Refreshing: Fetch Fresh Data
    Refreshing --> RefreshSuccess: API Call Success
    Refreshing --> RefreshFailed: API Call Failed
    
    RefreshSuccess --> Fresh: Update Item + Reset TTL
    RefreshFailed --> Stale: Keep Old Data
    RefreshFailed --> RetryRefresh: Scheduled Retry
    RetryRefresh --> Refreshing: Exponential Backoff
    
    Stale --> ServingStale: Read Request (Fallback)
    ServingStale --> Stale: Return Warning Header
    
    Fresh --> Invalidated: Manual Invalidation
    Stale --> Invalidated: Manual Invalidation
    Invalidated --> Deleting: Delete Item
    Deleting --> Empty: Item Removed
    
    Fresh --> AutoExpired: TTL Reached
    Stale --> AutoExpired: TTL Reached
    AutoExpired --> [*]: DynamoDB Auto-Delete
    
    note right of Fresh
        TTL: 1-24 hours (entity-dependent)
        MEPs: 24h
        Votes: 12h
        Sessions: 6h
    end note
    
    note right of BackgroundRefresh
        EventBridge Rule: Every 1 hour
        Lambda: Scan for expiring items
        Proactive refresh strategy
    end note
    
    note right of ServingStale
        X-Cache-Status: STALE
        Degraded mode
        Better than error
    end note
```

### **Cache TTL Strategy**

| Entity Type | TTL | Refresh Frequency | Rationale |
|------------|-----|-------------------|----------|
| **MEP Profile** | 24 hours | Daily at 2 AM UTC | MEP data changes infrequently |
| **Voting Record** | 12 hours | Twice daily | Vote outcomes finalized quickly |
| **Plenary Session** | 6 hours | Every 6 hours | Session details update during day |
| **Document** | 24 hours | Daily at 3 AM UTC | Documents rarely change after publication |
| **Committee Info** | 48 hours | Twice weekly | Committee composition stable |

---

## 🔄 Enhanced Circuit Breaker with Metrics

```mermaid
stateDiagram-v2
    [*] --> Closed: Initialize
    
    Closed --> Closed: Success (Reset Counter)
    Closed --> HalfOpen: Failure Threshold (5 in 60s)
    
    HalfOpen --> Closed: Probe Success
    HalfOpen --> Open: Probe Failed
    
    Open --> Open: Fast Fail (Return Cached)
    Open --> HalfOpen: Timeout (30s)
    
    Closed --> MetricsTracking: On Every Request
    HalfOpen --> MetricsTracking: On Probe
    Open --> MetricsTracking: On Fast Fail
    
    MetricsTracking --> CloudWatch: Publish Metrics
    CloudWatch --> Alarm: Threshold Breach
    Alarm --> SNS: Notify Ops Team
    SNS --> PagerDuty: Page On-Call
    
    note right of Closed
        Normal operation
        All requests pass through
        Success rate: Track per endpoint
    end note
    
    note right of HalfOpen
        Single probe request
        5-second window
        Auto-retry mechanism
    end note
    
    note right of Open
        All requests rejected
        Serve cached/fallback
        30-second timeout
    end note
    
    note right of MetricsTracking
        CloudWatch Metrics:
        - circuit.state (0=Closed, 1=HalfOpen, 2=Open)
        - circuit.failures (count)
        - circuit.successes (count)
        - circuit.fallbacks (count)
    end note
```

### **Circuit Breaker Configuration**

| Parameter | Value | Purpose |
|-----------|-------|----------|
| **Failure Threshold** | 5 failures in 60s | Open circuit after sustained errors |
| **Success Threshold** | 1 success | Close circuit after successful probe |
| **Timeout** | 30 seconds | Time before attempting probe |
| **Probe Interval** | 5 seconds | Frequency of probe attempts in HalfOpen |
| **Fallback Strategy** | Serve cached data + warning header | Graceful degradation |

**Per-Endpoint Circuit Breakers:**
- `/meps` endpoint: Independent circuit breaker
- `/votes` endpoint: Independent circuit breaker
- `/documents` endpoint: Independent circuit breaker

**Rationale:** Isolate failures to specific EP API endpoints, prevent cascade failures

---

## 🔄 Step Functions Workflow Execution States

```mermaid
stateDiagram-v2
    [*] --> Queued: API Gateway Trigger
    Queued --> Running: Execution Started
    
    Running --> TaskState: Invoke Lambda
    TaskState --> TaskRunning: Lambda Executing
    TaskRunning --> TaskSuccess: Lambda Success
    TaskRunning --> TaskFailed: Lambda Error
    
    TaskFailed --> RetryState: Transient Error
    RetryState --> WaitingRetry: Exponential Backoff
    WaitingRetry --> TaskState: Retry Attempt
    
    TaskFailed --> CatchState: Permanent Error
    CatchState --> ErrorHandler: Invoke Error Lambda
    ErrorHandler --> Failed: Execution Failed
    
    TaskSuccess --> ChoiceState: Evaluate Condition
    ChoiceState --> ParallelState: Multi-Branch Execution
    ChoiceState --> TaskState: Sequential Execution
    
    ParallelState --> Branch1: Fork
    ParallelState --> Branch2: Fork
    ParallelState --> Branch3: Fork
    Branch1 --> WaitParallel: Branch Complete
    Branch2 --> WaitParallel: Branch Complete
    Branch3 --> WaitParallel: Branch Complete
    WaitParallel --> TaskState: All Branches Complete
    
    TaskSuccess --> Succeeded: Final State
    Succeeded --> [*]: Execution Complete
    
    Running --> TimedOut: Execution Timeout (300s)
    TimedOut --> Failed: Max Duration Exceeded
    Failed --> [*]: Execution Aborted
    
    note right of RetryState
        Max Attempts: 3
        Backoff Rate: 2.0
        Interval: 2s, 4s, 8s
    end note
    
    note right of ParallelState
        Concurrent Lambda invocations
        Max branches: 40
        All branches must succeed
    end note
    
    note right of TimedOut
        Max execution: 300s (5 min)
        Timeout buffer for long reports
        CloudWatch alarm triggered
    end note
```

### **Step Functions Execution Metrics**

| Metric | Target | Alert Threshold |
|--------|--------|------------------|
| **Success Rate** | >99% | <95% |
| **Execution Duration** | <120s | >240s |
| **Timeout Rate** | <0.1% | >1% |
| **Retry Rate** | <5% | >15% |
| **Cost per Execution** | <$0.05 | >$0.10 |

---

## 📊 Implementation Phases

### **Phase 1: Lambda Lifecycle Optimization** (Q3 2026)

**Objectives:**
- Implement provisioned concurrency for router Lambda
- Optimize cold start times to <100ms
- Deploy SnapStart for instant warm starts

**Success Metrics:**
- ✅ Cold start p95: <100ms (down from 500ms)
- ✅ Warm invocation p95: <50ms
- ✅ Provisioned concurrency: 10 instances for router
- ✅ Cold start rate: <1% of invocations

**KPIs:**
- Cold start latency p95: <100ms
- Warm latency p95: <50ms
- Cost increase: <10% (provisioned concurrency)
- User-perceived latency: <200ms p95

---

### **Phase 2: DynamoDB Cache State Machine** (Q4 2026)

**Objectives:**
- Implement TTL-based cache expiration
- Deploy background refresh with EventBridge
- Add stale-while-revalidate pattern

**Success Metrics:**
- ✅ All entities have appropriate TTL values
- ✅ Background refresh Lambda deployed
- ✅ Stale data served with warning header
- ✅ Cache hit rate: >80%

**KPIs:**
- Cache hit rate: >80%
- Stale data served rate: <5%
- Background refresh success rate: >95%
- DynamoDB read cost reduction: 60%

---

### **Phase 3: Circuit Breaker & Step Functions** (Q1 2027)

**Objectives:**
- Deploy per-endpoint circuit breakers
- Implement Step Functions for complex workflows
- Add CloudWatch metrics and alarms
- Deploy PagerDuty integration

**Success Metrics:**
- ✅ Circuit breakers prevent cascade failures
- ✅ Step Functions execute reports in <120s
- ✅ CloudWatch alarms trigger within 1 minute
- ✅ PagerDuty incidents auto-created for P1 alerts

**KPIs:**
- Circuit breaker effectiveness: 90% failure isolation
- Step Functions success rate: >99%
- Mean time to detection (MTTD): <1 minute
- Mean time to recovery (MTTR): <5 minutes

---

## ⚠️ Risk Assessment

### **State Management Risks**

| Risk | Severity | Probability | Impact | Mitigation |
|------|----------|-------------|--------|------------|
| **DynamoDB throttling** | 🟠 High | 🟡 Low | Cache unavailable, increased EP API calls | DynamoDB on-demand mode, auto-scaling |
| **Lambda timeout** | 🟡 Medium | 🟠 Medium | Incomplete processing, poor UX | Increase timeout to 30s, optimize code |
| **Circuit breaker false positive** | 🟡 Medium | 🟡 Low | Unnecessary fast-fails, reduced availability | Tune threshold to 5 failures in 60s |
| **Step Functions cost overrun** | 🟡 Medium | 🟠 Medium | Budget exceeded | Limit to 100 executions/hour, monitor CloudWatch |
| **Stale cache served too long** | 🟢 Low | 🟠 Medium | Outdated data, user confusion | Warning header, TTL monitoring |

### **Risk Mitigation Timeline**

| Risk | Mitigation Action | Owner | Deadline |
|------|-------------------|-------|----------|
| DynamoDB throttling | Enable on-demand mode, set CloudWatch alarms | DevOps | Before Phase 2 |
| Lambda timeout | Optimize handler code, increase timeout to 30s | Engineering | Phase 1 |
| Circuit breaker tuning | Load test with realistic failure scenarios | SRE | Phase 3 |
| Cost overrun | Set Step Functions execution quota, billing alarms | FinOps | Before Phase 3 |
| Stale cache | Implement background refresh, monitor TTL expiry | Engineering | Phase 2 |

---

## 🔗 ISO 27001 Controls Mapping

| Control | Description | Implementation |
|---------|-------------|----------------|
| **A.12.4.1** | Event logging | CloudTrail logs all Lambda state changes, DynamoDB operations |
| **A.12.4.2** | Protection of log information | CloudWatch Logs encrypted with KMS, 90-day retention |
| **A.12.4.3** | Administrator and operator logs | IAM CloudTrail logs capture all administrative actions |
| **A.12.4.4** | Clock synchronization | Lambda uses NTP-synchronized AWS clocks |
| **A.17.2.1** | Availability of information processing facilities | Multi-AZ DynamoDB, Lambda auto-scaling |
| **A.14.1.2** | Securing application services on public networks | API Gateway with WAF, TLS 1.3 |
| **A.14.1.3** | Protecting application services transactions | Circuit breaker prevents cascade failures |

### **NIST CSF 2.0 Mapping**

| Function | Category | Implementation |
|----------|----------|----------------|
| **PR.PT-1** | Audit/log records determined | All state transitions logged to CloudWatch |
| **PR.PT-3** | Access to systems managed | IAM policies enforce least privilege for Lambda execution roles |
| **DE.AE-2** | Detected events analyzed | CloudWatch Insights queries analyze Lambda errors |
| **DE.AE-4** | Impact of events determined | Circuit breaker metrics track failure impact |
| **DE.CM-7** | Monitoring for unauthorized activity | GuardDuty monitors for anomalous Lambda behavior |
| **RS.AN-1** | Notifications from detection systems investigated | PagerDuty integration for P1 incidents |
| **RS.MI-2** | Incidents contained | Circuit breaker isolates failing endpoints |

### **CIS Controls v8.1 Mapping**

| Control | Safeguard | Implementation |
|---------|-----------|----------------|
| **8.2** | Collect audit logs | CloudTrail logs all API calls, 90-day retention |
| **8.3** | Ensure adequate audit log storage | CloudWatch Logs with automatic retention policies |
| **8.5** | Collect detailed audit logs | Lambda execution logs include request ID, duration, errors |
| **8.11** | Conduct audit log reviews | CloudWatch Insights scheduled queries for anomaly detection |
| **12.1** | Ensure network infrastructure is up-to-date | Lambda runtime auto-updates, managed by AWS |
| **13.6** | Collect network traffic flow logs | VPC Flow Logs for Lambda in VPC |
| **17.7** | Conduct routine incident response exercises | Quarterly failure injection testing (chaos engineering) |

---

## 🔗 Policy Alignment

| ISMS Policy | Relevance | Link |
|-------------|-----------|------|
| 🔒 Secure Development | State management security | [Secure_Development_Policy.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) |
| 🔑 Access Control | Session lifecycle patterns | [Access_Control_Policy.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Access_Control_Policy.md) |
| 🌐 Network Security | Connection state security | [Network_Security_Policy.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Network_Security_Policy.md) |
| 🚨 Incident Response | Error state handling | [Incident_Response_Plan.md](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Incident_Response_Plan.md) |

---

## 📚 Related Documents

| Document | Description | Link |
|----------|-------------|------|
| 📈 State Diagram (Current) | Current state transitions | [STATEDIAGRAM.md](STATEDIAGRAM.md) |
| 🚀 Future Architecture | Architecture roadmap | [FUTURE_ARCHITECTURE.md](FUTURE_ARCHITECTURE.md) |
| 🔄 Future Flowchart | Process workflows | [FUTURE_FLOWCHART.md](FUTURE_FLOWCHART.md) |
| 🛡️ Future Security Architecture | Security roadmap | [FUTURE_SECURITY_ARCHITECTURE.md](FUTURE_SECURITY_ARCHITECTURE.md) |

---

<p align="center">
  <em>This future state diagram is maintained as part of the <a href="https://github.com/Hack23/ISMS-PUBLIC">Hack23 AB ISMS</a> framework.</em><br>
  <em>Licensed under <a href="LICENSE.md">Apache-2.0</a></em>
</p>
