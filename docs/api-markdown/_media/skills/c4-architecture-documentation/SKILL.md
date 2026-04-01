---
name: c4-architecture-documentation
description: Document system architecture using C4 model with context, container, component views and Mermaid diagrams
license: Apache-2.0
---

# C4 Architecture Documentation Skill

## Purpose

Document MCP server architecture using C4 model for different abstraction levels with Mermaid diagrams.

## When to Use

- ✅ Documenting system architecture (ARCHITECTURE.md)
- ✅ Security architecture documentation (SECURITY_ARCHITECTURE.md)
- ✅ Future architecture planning (FUTURE_ARCHITECTURE.md)
- ✅ Architecture decision records
- ✅ Onboarding new developers

## Required Documentation Portfolio

### Current State

| Document | Purpose |
|----------|---------|
| ARCHITECTURE.md | Complete C4 models (Context, Container, Component) |
| DATA_MODEL.md | Data structures, entities, relationships |
| FLOWCHART.md | Business process and data flows |
| STATEDIAGRAM.md | System state transitions and lifecycles |
| MINDMAP.md | System conceptual relationships |
| SWOT.md | Strategic analysis and positioning |
| SECURITY_ARCHITECTURE.md | Current security design and controls |

### Future State

| Document | Purpose |
|----------|---------|
| FUTURE_ARCHITECTURE.md | Architectural evolution roadmap |
| FUTURE_DATA_MODEL.md | Enhanced data architecture plans |
| FUTURE_FLOWCHART.md | Improved process workflows |
| FUTURE_STATEDIAGRAM.md | Advanced state management |
| FUTURE_MINDMAP.md | Capability expansion plans |
| FUTURE_SWOT.md | Future strategic opportunities |
| FUTURE_SECURITY_ARCHITECTURE.md | Planned security improvements |

## C4 Model Levels

### Level 1: System Context

```mermaid
graph TB
    User[AI Assistant/Developer] -->|MCP Protocol| Server[European Parliament MCP Server]
    Server -->|REST API| EPAPI[European Parliament Open Data API]
    Server -->|JSON-LD| EPData[EP Data Portal]
```

### Level 2: Container Diagram

```mermaid
graph TB
    Client[MCP Client] -->|stdio/SSE| MCPServer[MCP Server - Node.js/TypeScript]
    MCPServer -->|HTTP/JSON| EPClient[EP API Client]
    EPClient -->|REST| EPAPI[data.europarl.europa.eu]
    MCPServer -->|Zod| Schemas[Validation Schemas]
```

### Level 3: Component Diagram

```mermaid
graph TB
    Tools[MCP Tools] --> Client[EP API Client]
    Resources[MCP Resources] --> Client
    Prompts[MCP Prompts] --> Client
    Client --> Cache[LRU Cache]
    Client --> RateLimiter[Rate Limiter]
    Client --> Validator[Zod Schemas]
```

## Mermaid Diagram Standards

- Use `graph TB` for top-bottom flow diagrams
- Use `sequenceDiagram` for interaction flows
- Use `stateDiagram-v2` for state machines
- Use `mindmap` for conceptual relationships
- Include legends and descriptions

## ISMS Policy References

- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) - Architecture documentation requirements
- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md) - Security architecture governance
