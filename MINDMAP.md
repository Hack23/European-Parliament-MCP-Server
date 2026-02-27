<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🧠 European Parliament MCP Server — Mind Map</h1>

<p align="center">
  <strong>System Concepts, Relationships, and Capability Overview</strong><br>
  <em>Visual knowledge map of the EP MCP Server architecture and capabilities</em>
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
2. [Master System Mind Map](#master-system-mind-map)
3. [EP Parliamentary Data Domains](#ep-parliamentary-data-domains)
4. [Tool Categories Mind Map](#tool-categories-mind-map)
5. [Security Architecture Mind Map](#security-architecture-mind-map)
6. [Technology Stack Mind Map](#technology-stack-mind-map)

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

## 🌐 Master System Mind Map

```mermaid
mindmap
  root((EP MCP Server v1.0))
    MCP Protocol Surface
      45 Tools
        Core 7
        Advanced Analysis 3
        OSINT Phase 1 6
        OSINT Phase 2 2
        OSINT Phase 3 2
        Phase 4 EP API v2 8
        Phase 5 Coverage 11
      9 Resources
        ep://meps
        ep://meps/id
        ep://committees/id
        ep://plenary-sessions
        ep://votes/id
        ep://political-groups
        ep://procedures/id
        ep://plenary/id
        ep://documents/id
      7 Prompts
        mep_briefing
        coalition_analysis
        legislative_tracking
        political_group_comparison
        committee_activity_report
        voting_pattern_analysis
        country_delegation_analysis
    EP Parliamentary Data
      MEPs
        Current 720 members
        Incoming
        Outgoing
        Homonyms
      Procedures
        COD Codecision
        CNS Consultation
        INI Own Initiative
        BUD Budgetary
      Plenary Sessions
        Strasbourg
        Brussels
        Votes
        Speeches
      Committees
        25 committees
        Meetings
        Documents
        Decisions
      Documents
        Reports
        Amendments
        Adopted Texts
        External Docs
    Architecture
      TypeScript Node.js
      DI Container
        RateLimiter
        MetricsService
        AuditLogger
        HealthService
      LRU Cache
        500 max entries
        15 min TTL
      9 EP API Clients
        baseClient
        mepClient
        votingClient
        committeeClient
        plenaryClient
        documentClient
        legislativeClient
        questionClient
        vocabularyClient
    Security
      4-Layer Defense
        Zod Validation
        Rate Limiting
        Audit Logging
        GDPR Compliance
      ISMS Alignment
        ISO 27001
        NIST CSF 2.0
        CIS Controls v8.1
        GDPR
```

---

## 🏛️ EP Parliamentary Data Domains

```mermaid
mindmap
  root((EP Data Domains))
    Members MEPs
      Current Members
        720 elected members
        27 member states
        7 political groups
      Member Lifecycle
        Incoming new term
        Outgoing retired
        Homonym name conflicts
      Member Data
        Biographical info
        Committee roles
        Declarations
        Attendance records
        Voting history
        Speeches delivered
    Legislative Procedures
      Types
        COD Ordinary Procedure
        CNS Consultation
        INI Own Initiative
        RSP Resolution
        BUD Budgetary
        ACI Interinstitutional
      Stages
        Committee consideration
        Plenary first reading
        Council position
        Plenary second reading
        Trilogue
        Adoption
      Outcomes
        Adopted texts
        Rejected proposals
        Withdrawn procedures
    Parliamentary Sessions
      Plenary Sessions
        Strasbourg 12 per year
        Brussels mini-plenary
        Agenda items
        Attendance
      Voting Records
        Roll-call votes
        Electronic votes
        Show of hands
        MEP positions
    Committees
      Standing Committees 25
        AFET Foreign Affairs
        BUDG Budgets
        ENVI Environment
        ECON Economic
        LIBE Civil Liberties
        ITRE Industry
      Activities
        Meetings
        Rapporteur assignment
        Amendments
        Opinions
        Hearings
    Questions
      Types
        Oral questions
        Written questions
        Priority questions
        Question Time
      Status
        Submitted
        Answered
        Pending
```

---

## 🔧 Tool Categories Mind Map

```mermaid
mindmap
  root((45 MCP Tools))
    Core Tools 7
      get_meps
        Filter by country
        Filter by political group
        Pagination support
      get_mep_details
        Full MEP profile
        Declarations optional
        Attendance optional
      get_plenary_sessions
        Date range filter
        Location filter
      get_voting_records
        By procedure
        By session
        By MEP
      search_documents
        Full text search
        Type filter
        Date range
      get_committee_info
        By committee ID
        Members list
        Upcoming meetings
      get_parliamentary_questions
        By author MEP
        By type
        By status
    Advanced Analysis 3
      analyze_voting_patterns
        MEP cohesion scoring
        Group alignment
        Cross-party voting
      track_legislation
        Procedure timeline
        Stage tracking
        Deadline alerts
      generate_report
        Multi-tool synthesis
        Formatted output
        Export formats
    OSINT Intelligence
      Phase 1 6 tools
        assess_mep_influence
        analyze_coalition_dynamics
        detect_voting_anomalies
        compare_political_groups
        analyze_legislative_effectiveness
        monitor_legislative_pipeline
      Phase 2 2 tools
        analyze_committee_activity
        track_mep_attendance
      Phase 3 2 tools
        analyze_country_delegation
        generate_political_landscape
    Phase 4 EP API v2 8
      get_current_meps
      get_speeches
      get_procedures
      get_adopted_texts
      get_events
      get_meeting_activities
      get_meeting_decisions
      get_mep_declarations
    Phase 5 Coverage 11
      get_incoming_meps
      get_outgoing_meps
      get_homonym_meps
      get_plenary_documents
      get_committee_documents
      get_plenary_session_documents
      get_plenary_session_document_items
      get_controlled_vocabularies
      get_external_documents
      get_meeting_foreseen_activities
      get_procedure_events
```

---

## 🔒 Security Architecture Mind Map

```mermaid
mindmap
  root((Security Architecture))
    4-Layer Defense
      Layer 1 Zod Validation
        45 input schemas
        Branded types
        Format enforcement
        Reject before business logic
      Layer 2 Rate Limiting
        Token bucket algorithm
        100 tokens per minute
        Burst protection
        EP API protection
      Layer 3 Audit Logging
        Every invocation logged
        PII stripped from logs
        ISO timestamps
        Structured JSON format
      Layer 4 GDPR
        Data minimization
        Purpose limitation
        15-min cache TTL
        No persistent storage
    Threat Model STRIDE
      Tampering Mitigated
        Zod schema validation
        Branded types
      Repudiation Mitigated
        Immutable audit logs
      Info Disclosure Mitigated
        Data minimization
        Error sanitization
      DoS Mitigated
        Rate limiter
        LRU eviction
      Supply Chain Mitigated
        Dependabot
        npm audit
        Lockfile
    ISMS Compliance
      ISO 27001
        A.5.1 Policies
        A.8.1 Asset Mgmt
        A.9.1 Access Control
        A.12.4 Audit Logging
        A.14.2 Secure Dev
      NIST CSF 2.0
        ID.AM Asset Management
        PR.DS Data Security
        DE.AE Anomaly Detection
      CIS Controls v8.1
        2.1 Software Inventory
        4.1 Secure Config
        8.2 Audit Logs
      GDPR
        Art. 5 Principles
        Art. 25 Privacy by Design
        Art. 6 Lawful Basis
```

---

## 🛠️ Technology Stack Mind Map

```mermaid
mindmap
  root((Tech Stack))
    Runtime
      Node.js 20+ LTS
        V8 engine
        Event loop
        stdio transport
      TypeScript 5.x
        Strict mode
        Branded types
        Discriminated unions
    MCP Protocol
      MCP SDK
        Tool registration
        Resource handling
        Prompt templates
        Error responses
      Transport
        stdio primary
        JSON-RPC 2.0
    Validation
      Zod 3.x
        Runtime validation
        Branded types
        Schema inference
        Error formatting
    Caching
      lru-cache 10.x
        500 max entries
        15-min TTL
        LRU eviction
        Memory bounded
    Quality Gates
      ESLint 9.x
        TypeScript rules
        No unused vars
        Strict checks
      Knip
        Dead code detection
        Unused exports
      Vitest
        Unit testing
        80 percent coverage
        Mocking support
    EP API Client
      9 Modular Clients
        baseClient shared HTTP
        mepClient MEP data
        votingClient votes
        committeeClient
        plenaryClient
        documentClient
        legislativeClient
        questionClient
        vocabularyClient
      HTTP
        node fetch
        HTTPS TLS 1.2+
        JSON-LD parsing
```

---

*See [FUTURE_MINDMAP.md](./FUTURE_MINDMAP.md) for the planned capability expansion mindmap including AI-powered analysis and advanced OSINT features.*
