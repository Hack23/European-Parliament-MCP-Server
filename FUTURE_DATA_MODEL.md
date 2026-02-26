<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">📊 European Parliament MCP Server — Future Data Model</h1>

<p align="center">
  <strong>Enhanced Entity Relationships, Graph Support, Temporal Models, and Real-Time Streaming</strong><br>
  <em>Data architecture evolution roadmap for the EP MCP Server</em>
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
2. [Data Model Evolution Overview](#data-model-evolution-overview)
3. [Enhanced Entity Relationships v1.1](#enhanced-entity-relationships-v11)
4. [Graph Database Support Plan](#graph-database-support-plan)
5. [Temporal Data Models](#temporal-data-models)
6. [Real-Time Event Streaming Schema](#real-time-event-streaming-schema)
7. [EU Data Federation Schema](#eu-data-federation-schema)
8. [Enhanced Branded Types](#enhanced-branded-types)

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

## 🗓️ Data Model Evolution Overview

| Version | Key Data Model Changes | Target |
|---------|----------------------|--------|
| v1.0 | Current: 9 entities, LRU cache, JSON-LD normalization | Live |
| v1.1 | +5 entities, Redis persistence, enhanced relationships | Q2 2026 |
| v1.2 | Cross-source data federation, EUR-Lex entities | Q3 2026 |
| v2.0 | Graph model, temporal versioning, event streaming | Q4 2026 |

---

## 🔗 Enhanced Entity Relationships v1.1

The v1.1 data model adds cross-entity relationships for OSINT intelligence analysis:

```mermaid
erDiagram
    MEP {
        MEP_ID id PK
        string label
        CountryCode country
        string politicalGroup
        float influenceScore
        int speechCount
        int voteParticipation
    }

    POLITICAL_GROUP {
        string id PK
        string label
        string abbreviation
        int memberCount
        float cohesionScore
        string ideologicalFamily
    }

    COALITION {
        string id PK
        string name
        string[] groupIds
        float alignmentScore
        DateString observedFrom
        DateString observedTo
    }

    PROCEDURE {
        ProcedureID id PK
        string title
        string type
        string stage
        float completionProbability
        DateString predictedAdoption
    }

    INFLUENCE_NETWORK {
        string id PK
        MEP_ID sourceMep FK
        MEP_ID targetMep FK
        string relationshipType
        float strength
        string evidenceSource
    }

    VOTING_BLOC {
        string id PK
        MEP_ID[] members
        string issueArea
        float cohesionScore
        DateString firstObserved
    }

    MEP }|--|| POLITICAL_GROUP : "belongs to"
    MEP }|--|{ COALITION : "participates in via group"
    MEP ||--|{ INFLUENCE_NETWORK : "source of influence"
    MEP ||--|{ INFLUENCE_NETWORK : "target of influence"
    MEP }|--|{ VOTING_BLOC : "member of"
    POLITICAL_GROUP }|--|{ COALITION : "forms"
```

---

## 🕸️ Graph Database Support Plan

### Target Version: v2.0

Parliamentary data is inherently graph-structured — MEPs form coalitions, procedures flow through institutions, documents reference other documents. A graph model captures these relationships natively.

### Graph Schema Design

```mermaid
flowchart TD
    subgraph Nodes["Graph Nodes"]
        MEP_N["MEP node\n(id, name, country, group)"]
        PROC_N["Procedure node\n(id, title, type, stage)"]
        DOC_N["Document node\n(id, title, type, date)"]
        COMM_N["Committee node\n(id, name, type)"]
        SESSION_N["Session node\n(id, date, location)"]
    end

    subgraph Edges["Graph Edges (Relationships)"]
        E1["VOTED_FOR / VOTED_AGAINST / ABSTAINED\n(MEP -> Procedure)"]
        E2["AUTHORED\n(MEP -> Document)"]
        E3["MEMBER_OF\n(MEP -> Committee)"]
        E4["RAPPORTEUR_FOR\n(MEP -> Procedure)"]
        E5["ATTENDED\n(MEP -> Session)"]
        E6["PRODUCES\n(Procedure -> Document)"]
        E7["RESPONSIBLE_FOR\n(Committee -> Procedure)"]
        E8["CITED\n(Document -> Document)"]
        E9["ALLIED_WITH\n(MEP -> MEP, derived)"]
    end

    MEP_N -->|"VOTED_FOR"| PROC_N
    MEP_N -->|"AUTHORED"| DOC_N
    MEP_N -->|"MEMBER_OF"| COMM_N
    PROC_N -->|"PRODUCES"| DOC_N
    COMM_N -->|"RESPONSIBLE_FOR"| PROC_N
    DOC_N -->|"CITED"| DOC_N
```

### Graph Query Examples (Planned Cypher/GQL)

```cypher
-- Find MEPs who consistently vote with MEP X (coalition detection)
MATCH (mep1:MEP {id: $mepId})-[:VOTED_FOR]->(proc:Procedure)
      <-[:VOTED_FOR]-(mep2:MEP)
WHERE mep1 <> mep2
WITH mep2, count(proc) AS sharedVotes
ORDER BY sharedVotes DESC
LIMIT 20
RETURN mep2.label, sharedVotes

-- Find shortest path between two political groups through procedures
MATCH path = shortestPath(
  (g1:Group {abbr: 'EPP'})-[*]-(g2:Group {abbr: 'SD'})
)
RETURN path
```

---

## ⏱️ Temporal Data Models

### Bi-Temporal Entity Design (v2.0)

Parliamentary data changes over time — MEPs change parties, procedures change stages, votes are recorded at specific moments. Bi-temporal modeling captures both when data was valid and when it was recorded.

```mermaid
erDiagram
    MEP_TEMPORAL {
        MEP_ID id PK
        string label
        string politicalGroup
        DateString validFrom "When this state became true in reality"
        DateString validTo "When this state ceased to be true"
        DateString recordedAt "When this was captured in our system"
        string version "Incrementing version number"
        boolean isLatest "True for current record"
    }

    PROCEDURE_STAGE_HISTORY {
        string id PK
        ProcedureID procedureId FK
        string stage
        DateString enteredStage "When procedure entered this stage"
        DateString exitedStage "When procedure left this stage (null if current)"
        string outcomeAtStage "vote result, referral, etc."
    }

    VOTE_POSITION_HISTORY {
        string id PK
        MEP_ID mepId FK
        string procedureRef
        string position "for, against, abstention"
        DateString voteDate
        string sessionRef
        string amendments "Amendment numbers if applicable"
    }

    MEP_TEMPORAL ||--|{ PROCEDURE_STAGE_HISTORY : "voted on at stage"
    MEP_TEMPORAL ||--|{ VOTE_POSITION_HISTORY : "has vote record"
```

### Temporal Query Patterns

```typescript
// Query MEP's party at a specific historical date
interface TemporalQuery<T> {
  entityId: string;
  asOf: DateString;       // Retrieve state valid on this date
  recordedBefore?: DateString;  // Filter to records captured before this time
}

// Get MEP's political group as of 2022-01-01
const query: TemporalQuery<MEP> = {
  entityId: 'mep:12345',
  asOf: '2022-01-01' as DateString
};
```

---

## 📡 Real-Time Event Streaming Schema

### Target Version: v1.2 / v2.0

When the EP publishes new data (new votes, new procedures, new documents), the server should be able to notify subscribed clients in real-time.

### Event Schema

```typescript
interface EPDataEvent {
  eventId: string;
  eventType: EPEventType;
  timestamp: string;         // ISO 8601
  source: 'ep-api-v2';
  entityType: 'mep' | 'procedure' | 'vote' | 'document' | 'session';
  entityId: string;
  changeType: 'created' | 'updated' | 'deleted';
  payload: unknown;          // Entity snapshot
  metadata: {
    apiVersion: string;
    dataVersion: string;
    checksum: string;
  };
}

type EPEventType =
  | 'vote.published'
  | 'procedure.stage_changed'
  | 'procedure.adopted'
  | 'document.published'
  | 'session.scheduled'
  | 'session.completed'
  | 'mep.group_changed'
  | 'mep.term_started'
  | 'mep.term_ended';
```

### Event Stream Architecture

```mermaid
flowchart TD
    EPA["EP Open Data API\n(polling or webhook)"] -->|"New data detected"| POLLER["Change Detector\n(periodic diff comparison)"]
    POLLER -->|"Change detected"| EVENT["Create EPDataEvent\n(typed, versioned)"]
    EVENT --> VALIDATE["Zod event validation\n(strict schema check)"]
    VALIDATE --> STORE["Event store\n(Redis Streams or in-memory)"]
    STORE --> FANOUT["Event fanout"]
    FANOUT -->|"SSE"| SSE_CLIENTS["HTTP/SSE clients\n(v1.2)"]
    FANOUT -->|"WebSocket"| WS_CLIENTS["WebSocket clients\n(v1.2)"]
    FANOUT -->|"GraphQL"| GQL_SUBS["GraphQL subscriptions\n(v2.0)"]
    FANOUT -->|"webhook"| WEBHOOKS["Registered webhooks\n(v2.0)"]
```

---

## 🌐 EU Data Federation Schema (v2.0)

When the server integrates with additional EU institution data sources, a unified cross-source entity model is needed:

```mermaid
erDiagram
    EU_LEGISLATIVE_ACT {
        string id PK
        string source "EP, Council, Commission"
        string eurlexRef "EUR-Lex document number"
        string epProcedureRef "EP procedure if applicable"
        string title
        string type "Regulation, Directive, Decision"
        DateString adoptedDate
        string ojReference "OJ C/L reference"
    }

    EP_PROCEDURE {
        ProcedureID id PK
        string eurlexRef FK
        string title
        string stage
    }

    COMMISSION_PROPOSAL {
        string id PK
        string eurlexRef FK
        string title
        DateString proposedDate
        string commissionDg "Lead DG"
    }

    COUNCIL_POSITION {
        string id PK
        string procedureRef FK
        string position "first reading, second reading"
        DateString adoptedDate
    }

    EU_LEGISLATIVE_ACT ||--|| EP_PROCEDURE : "implemented via"
    EU_LEGISLATIVE_ACT ||--|| COMMISSION_PROPOSAL : "originated from"
    EU_LEGISLATIVE_ACT ||--|{ COUNCIL_POSITION : "passed through"
```

---

## 🏷️ Enhanced Branded Types (v1.1+)

Additional branded types planned for v1.1 to cover emerging EP API entities:

```typescript
// EUR-Lex document identifier
const EURLexRefSchema = z
  .string()
  .regex(/^(COM|SEC|SWD|JOIN|C|L)\(\d{4}\)\d+$/)
  .brand<'EURLexRef'>();

// EP Term number (1979 = Term 1, 2024 = Term 10)
const TermNumberSchema = z
  .number()
  .int()
  .min(1)
  .max(20)
  .brand<'TermNumber'>();

// Session identifier (YYYYMMDD format)
const SessionIDSchema = z
  .string()
  .regex(/^\d{8}$/)
  .brand<'SessionID'>();

// Amendment number
const AmendmentNumberSchema = z
  .number()
  .int()
  .positive()
  .brand<'AmendmentNumber'>();

// Vote result
const VoteResultSchema = z
  .enum(['adopted', 'rejected', 'lapsed', 'withdrawn'])
  .brand<'VoteResult'>();
```

---

*See [DATA_MODEL.md](./DATA_MODEL.md) for the current implemented data model.*
