# Architecture Diagrams

<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="128" height="128">
</p>

<h1 align="center">European Parliament MCP Server - Architecture Diagrams</h1>

<p align="center">
  <strong>Visual architecture documentation using C4 Model and sequence diagrams</strong><br>
  <em>Context, Container, Component, and Data Flow visualizations</em>
</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [C4 Model Diagrams](#c4-model-diagrams)
  - [Level 1: System Context](#level-1-system-context)
  - [Level 2: Container Diagram](#level-2-container-diagram)
  - [Level 3: Component Diagram](#level-3-component-diagram)
- [Sequence Diagrams](#sequence-diagrams)
  - [Tool Invocation Flow](#tool-invocation-flow)
  - [Authentication Flow](#authentication-flow)
  - [Error Handling Flow](#error-handling-flow)
- [Data Flow Diagrams](#data-flow-diagrams)
  - [EP API to MCP Client](#ep-api-to-mcp-client)
  - [Caching Flow](#caching-flow)
  - [Rate Limiting Flow](#rate-limiting-flow)
- [Deployment Architectures](#deployment-architectures)
  - [Claude Desktop](#claude-desktop-deployment)
  - [VS Code Extension](#vs-code-extension-deployment)
  - [Docker Deployment](#docker-deployment)

---

## 🎯 Overview

This document provides comprehensive visual architecture documentation for the European Parliament MCP Server following the [C4 Model](https://c4model.com/) convention. The diagrams illustrate system context, containers, components, and data flows using Mermaid syntax.

### C4 Model Levels

1. **System Context**: How the MCP server fits into the overall ecosystem
2. **Container**: High-level technology choices and communication patterns
3. **Component**: Internal structure and organization
4. **Code**: Implementation details (see code documentation)

---

## 🏗️ C4 Model Diagrams

### Level 1: System Context

**Purpose**: Shows how the European Parliament MCP Server fits within the broader ecosystem of users, external systems, and data sources.

```mermaid
graph TB
    subgraph "Users"
        U1[AI Assistant User]
        U2[Developer]
        U3[Researcher]
    end
    
    subgraph "MCP Clients"
        C1[Claude Desktop]
        C2[VS Code Extension]
        C3[Custom MCP Client]
    end
    
    MCP[European Parliament<br/>MCP Server<br/><i>Node.js/TypeScript</i>]
    
    subgraph "External Systems"
        EP[European Parliament<br/>Open Data API<br/><i>JSON-LD/RDF</i>]
        GH[GitHub<br/><i>ISMS Policies</i>]
    end
    
    U1 -->|Queries parliamentary data| C1
    U2 -->|Integrates MCP tools| C2
    U3 -->|Accesses EP data| C3
    
    C1 -->|MCP Protocol<br/>stdio/WebSocket| MCP
    C2 -->|MCP Protocol<br/>stdio/WebSocket| MCP
    C3 -->|MCP Protocol<br/>stdio/WebSocket| MCP
    
    MCP -->|HTTPS GET/POST<br/>JSON-LD| EP
    MCP -->|Compliance reference| GH
    
    style MCP fill:#4A90E2,stroke:#2E5C8A,stroke-width:4px,color:#fff
    style EP fill:#E85D75,stroke:#A53F52,stroke-width:2px,color:#fff
    style GH fill:#24292E,stroke:#000,stroke-width:2px,color:#fff
    
    classDef clientBox fill:#7CB342,stroke:#558B2F,stroke-width:2px,color:#fff
    class C1,C2,C3 clientBox
    
    classDef userBox fill:#FFA726,stroke:#F57C00,stroke-width:2px,color:#fff
    class U1,U2,U3 userBox
```

**Key Relationships**:

| From | To | Protocol | Purpose |
|------|-----|----------|---------|
| MCP Clients | MCP Server | MCP over stdio/WebSocket | Tool invocation, resource access |
| MCP Server | EP API | HTTPS/JSON-LD | Parliamentary data retrieval |
| MCP Server | GitHub | Reference only | ISMS policy compliance |

---

### Level 2: Container Diagram

**Purpose**: Shows the high-level technology choices and how containers communicate with each other.

```mermaid
graph TB
    subgraph "MCP Client Layer"
        CLIENT[MCP Client<br/><i>Claude, VS Code, Custom</i>]
    end
    
    subgraph "MCP Server [Node.js 22.x]"
        SERVER[MCP Protocol Handler<br/><i>@modelcontextprotocol/sdk</i>]
        
        subgraph "Business Logic"
            TOOLS[Tool Registry<br/><i>10 MCP Tools</i>]
            RESOURCES[Resource Handlers<br/><i>MEP, Session, Committee</i>]
            PROMPTS[Prompt Templates<br/><i>Query assistance</i>]
        end
        
        subgraph "Data Access"
            API_CLIENT[EP API Client<br/><i>undici/fetch</i>]
            CACHE[Cache Layer<br/><i>LRU Cache</i>]
            RATE_LIMITER[Rate Limiter<br/><i>Token Bucket</i>]
        end
        
        subgraph "Cross-Cutting"
            VALIDATION[Input Validation<br/><i>Zod Schemas</i>]
            LOGGING[Audit Logging<br/><i>Winston</i>]
            METRICS[Metrics Service<br/><i>Prometheus-style</i>]
        end
    end
    
    subgraph "External Systems"
        EP_API[European Parliament API<br/><i>data.europarl.europa.eu</i>]
    end
    
    CLIENT <-->|MCP Protocol<br/>JSON-RPC| SERVER
    SERVER --> TOOLS
    SERVER --> RESOURCES
    SERVER --> PROMPTS
    
    TOOLS --> VALIDATION
    TOOLS --> API_CLIENT
    RESOURCES --> API_CLIENT
    
    API_CLIENT --> CACHE
    API_CLIENT --> RATE_LIMITER
    API_CLIENT --> LOGGING
    
    CACHE -.->|Cache miss| EP_API
    RATE_LIMITER --> EP_API
    
    TOOLS --> METRICS
    API_CLIENT --> METRICS
    
    style SERVER fill:#4A90E2,stroke:#2E5C8A,stroke-width:3px,color:#fff
    style EP_API fill:#E85D75,stroke:#A53F52,stroke-width:2px,color:#fff
    style CACHE fill:#66BB6A,stroke:#43A047,stroke-width:2px,color:#fff
    style VALIDATION fill:#FFA726,stroke:#F57C00,stroke-width:2px,color:#fff
```

**Container Descriptions**:

1. **MCP Protocol Handler**: Implements Model Context Protocol for client communication
2. **Tool Registry**: 10 registered MCP tools for parliamentary data access
3. **Resource Handlers**: MCP resource endpoints for structured data
4. **EP API Client**: HTTP client for European Parliament API integration
5. **Cache Layer**: LRU cache with 15-minute TTL for performance
6. **Rate Limiter**: Token bucket algorithm (100 req/15min)
7. **Input Validation**: Zod schema validation for all inputs
8. **Audit Logging**: Winston-based logging for GDPR compliance

---

### Level 3: Component Diagram

**Purpose**: Shows the internal components of the MCP Server container and their relationships.

```mermaid
graph TB
    subgraph "MCP Server Process"
        subgraph "Entry Point"
            INDEX[index.ts<br/>Server Bootstrap]
        end
        
        subgraph "MCP Protocol Layer"
            STDIO[StdioServerTransport]
            HANDLER[Request Handler]
            REGISTRY[Tool/Resource Registry]
        end
        
        subgraph "Tool Implementations [src/tools/]"
            T1[get_meps.ts]
            T2[get_mep_details.ts]
            T3[get_plenary_sessions.ts]
            T4[get_voting_records.ts]
            T5[search_documents.ts]
            T6[get_committee_info.ts]
            T7[get_parliamentary_questions.ts]
            T8[analyze_voting_patterns.ts]
            T9[track_legislation.ts]
            T10[generate_report.ts]
        end
        
        subgraph "Data Access [src/clients/]"
            EP_CLIENT[europeanParliamentClient.ts<br/>API Integration]
        end
        
        subgraph "Validation [src/schemas/]"
            SCHEMAS[europeanParliament.ts<br/>Zod Schemas]
        end
        
        subgraph "Utilities [src/utils/]"
            CACHE_UTIL[cache.ts<br/>LRU Cache]
            RATE_UTIL[rateLimiter.ts<br/>Token Bucket]
            LOGGER[logger.ts<br/>Audit Log]
        end
        
        subgraph "Services [src/services/]"
            METRICS_SVC[MetricsService.ts<br/>Performance Metrics]
        end
        
        subgraph "Type Definitions [src/types/]"
            TYPES[europeanParliament.ts<br/>TypeScript Types]
        end
    end
    
    INDEX --> STDIO
    STDIO --> HANDLER
    HANDLER --> REGISTRY
    
    REGISTRY --> T1
    REGISTRY --> T2
    REGISTRY --> T3
    REGISTRY --> T4
    REGISTRY --> T5
    REGISTRY --> T6
    REGISTRY --> T7
    REGISTRY --> T8
    REGISTRY --> T9
    REGISTRY --> T10
    
    T1 --> SCHEMAS
    T1 --> EP_CLIENT
    T1 --> METRICS_SVC
    
    T2 --> SCHEMAS
    T2 --> EP_CLIENT
    
    T3 --> SCHEMAS
    T3 --> EP_CLIENT
    
    T4 --> SCHEMAS
    T4 --> EP_CLIENT
    
    T5 --> SCHEMAS
    T5 --> EP_CLIENT
    
    T6 --> SCHEMAS
    T6 --> EP_CLIENT
    
    T7 --> SCHEMAS
    T7 --> EP_CLIENT
    
    T8 --> SCHEMAS
    T8 --> EP_CLIENT
    
    T9 --> SCHEMAS
    
    T10 --> SCHEMAS
    T10 --> EP_CLIENT
    
    EP_CLIENT --> CACHE_UTIL
    EP_CLIENT --> RATE_UTIL
    EP_CLIENT --> LOGGER
    EP_CLIENT --> TYPES
    
    SCHEMAS --> TYPES
    
    style INDEX fill:#4A90E2,stroke:#2E5C8A,stroke-width:3px,color:#fff
    style EP_CLIENT fill:#E85D75,stroke:#A53F52,stroke-width:2px,color:#fff
    style SCHEMAS fill:#FFA726,stroke:#F57C00,stroke-width:2px,color:#fff
    style CACHE_UTIL fill:#66BB6A,stroke:#43A047,stroke-width:2px,color:#fff
```

**Component Responsibilities**:

| Component | Responsibility | Key Dependencies |
|-----------|----------------|------------------|
| `index.ts` | Server bootstrap, MCP setup | `@modelcontextprotocol/sdk` |
| `get_meps.ts` | MEP listing with filters | `schemas`, `epClient` |
| `get_mep_details.ts` | Individual MEP details | `schemas`, `epClient` |
| `europeanParliamentClient.ts` | EP API integration | `undici`, `cache`, `rateLimiter` |
| `europeanParliament.ts` (schemas) | Input/output validation | `zod` |
| `cache.ts` | LRU caching mechanism | `lru-cache` |
| `rateLimiter.ts` | Token bucket rate limiting | Built-in |
| `MetricsService.ts` | Performance monitoring | Built-in |

---

## 🔄 Sequence Diagrams

### Tool Invocation Flow

**Purpose**: Shows the complete flow when an MCP client invokes a tool.

```mermaid
sequenceDiagram
    participant Client as MCP Client
    participant Server as MCP Server
    participant Registry as Tool Registry
    participant Tool as Tool Handler
    participant Validation as Input Validation
    participant EPClient as EP API Client
    participant Cache as Cache Layer
    participant RateLimit as Rate Limiter
    participant EPAPI as EP API
    participant Metrics as Metrics Service
    
    Client->>Server: callTool('get_meps', {country: 'SE'})
    activate Server
    
    Server->>Registry: lookupTool('get_meps')
    Registry-->>Server: handleGetMEPs
    
    Server->>Tool: handleGetMEPs({country: 'SE'})
    activate Tool
    
    Tool->>Validation: GetMEPsSchema.parse(args)
    activate Validation
    Validation-->>Tool: Validated params
    deactivate Validation
    
    Tool->>Metrics: incrementCounter('tool_invocations')
    
    Tool->>EPClient: getMEPs({country: 'SE'})
    activate EPClient
    
    EPClient->>Cache: get('meps:SE')
    Cache-->>EPClient: null (cache miss)
    
    EPClient->>RateLimit: tryRemoveTokens(1)
    RateLimit-->>EPClient: true (allowed)
    
    EPClient->>EPAPI: GET /api/v2/meps?country=SE
    activate EPAPI
    EPAPI-->>EPClient: 200 OK {data: [...]}
    deactivate EPAPI
    
    EPClient->>Cache: set('meps:SE', data, ttl: 900s)
    EPClient-->>Tool: {data: [...], total: 20}
    deactivate EPClient
    
    Tool->>Validation: PaginatedResponseSchema.parse(result)
    Validation-->>Tool: Validated response
    
    Tool->>Metrics: observeHistogram('tool_duration', 125ms)
    
    Tool-->>Server: {content: [{type: 'text', text: '...'}]}
    deactivate Tool
    
    Server-->>Client: MCP Response
    deactivate Server
```

**Key Steps**:

1. **Tool Lookup**: Registry maps tool name to handler function
2. **Input Validation**: Zod schema validates all parameters
3. **Cache Check**: LRU cache checked before API call
4. **Rate Limiting**: Token bucket ensures compliance with limits
5. **API Call**: HTTP request to European Parliament API
6. **Cache Update**: Successful responses cached for 15 minutes
7. **Output Validation**: Response structure validated
8. **Metrics**: Performance metrics recorded

---

### Authentication Flow

**Purpose**: Shows authentication flow (planned for future implementation).

```mermaid
sequenceDiagram
    participant Client as MCP Client
    participant Server as MCP Server
    participant Auth as Auth Middleware
    participant TokenStore as Token Store
    participant OAuth as OAuth Provider
    
    Note over Client,OAuth: Future Authentication Flow (OAuth 2.0)
    
    Client->>Server: callTool('get_meps', {country: 'SE'})
    Server->>Auth: validateToken(request.headers.authorization)
    activate Auth
    
    Auth->>TokenStore: lookupToken(token)
    
    alt Valid Token
        TokenStore-->>Auth: {valid: true, user: 'user@example.com'}
        Auth-->>Server: Authorized
        Server->>Server: Process tool request
        Server-->>Client: Tool response
    else Invalid Token
        TokenStore-->>Auth: {valid: false}
        Auth-->>Server: Unauthorized
        Server-->>Client: 401 Unauthorized
    else Expired Token
        TokenStore-->>Auth: {valid: false, expired: true}
        Auth->>OAuth: refreshToken(refreshToken)
        OAuth-->>Auth: {accessToken: '...'}
        Auth->>TokenStore: storeToken(accessToken)
        Auth-->>Server: Authorized
        Server->>Server: Process tool request
        Server-->>Client: Tool response
    end
    
    deactivate Auth
```

**Note**: Currently, the server does not implement authentication. This diagram shows the planned OAuth 2.0 flow for future versions.

---

### Error Handling Flow

**Purpose**: Shows how errors are handled and propagated through the system.

```mermaid
sequenceDiagram
    participant Client as MCP Client
    participant Server as MCP Server
    participant Tool as Tool Handler
    participant Validation as Input Validation
    participant EPClient as EP API Client
    participant EPAPI as EP API
    participant Logger as Audit Logger
    
    Client->>Server: callTool('get_meps', {country: 'INVALID'})
    activate Server
    
    Server->>Tool: handleGetMEPs({country: 'INVALID'})
    activate Tool
    
    Tool->>Validation: GetMEPsSchema.parse(args)
    activate Validation
    Validation-->>Tool: ZodError: Invalid country code
    deactivate Validation
    
    Tool->>Logger: logError('ValidationError', details)
    Logger-->>Tool: Logged
    
    Tool-->>Server: throw ValidationError('Invalid country code')
    deactivate Tool
    
    Server->>Server: Sanitize error message
    Server-->>Client: MCP Error Response
    deactivate Server
    
    Note over Client,Logger: Alternative: API Error Flow
    
    Client->>Server: callTool('get_meps', {country: 'SE'})
    activate Server
    Server->>Tool: handleGetMEPs({country: 'SE'})
    activate Tool
    Tool->>Validation: Validate input ✓
    Tool->>EPClient: getMEPs({country: 'SE'})
    activate EPClient
    
    EPClient->>EPAPI: GET /api/v2/meps?country=SE
    EPAPI-->>EPClient: 503 Service Unavailable
    
    EPClient->>Logger: logError('APIError', {status: 503})
    EPClient-->>Tool: throw APIError('EP API unavailable')
    deactivate EPClient
    
    Tool-->>Server: throw Error('Failed to retrieve MEPs')
    deactivate Tool
    
    Server-->>Client: MCP Error Response (sanitized)
    deactivate Server
```

**Error Types Handled**:

1. **ValidationError**: Invalid input parameters (Zod validation)
2. **RateLimitError**: Rate limit exceeded
3. **APIError**: European Parliament API errors
4. **NotFoundError**: Resource not found
5. **InternalError**: Unexpected server errors (sanitized)

---

## 💾 Data Flow Diagrams

### EP API to MCP Client

**Purpose**: Complete data flow from European Parliament API through the MCP server to the client.

```mermaid
graph LR
    subgraph "European Parliament"
        EP_DB[(EP Database)]
        EP_API[EP Open Data API<br/>JSON-LD]
    end
    
    subgraph "MCP Server"
        RATE[Rate Limiter<br/>100/15min]
        CACHE[Cache Layer<br/>15min TTL]
        TRANSFORM[Data Transform<br/>JSON-LD → JSON]
        VALIDATE[Output Validation<br/>Zod Schema]
        MCP_HANDLER[MCP Protocol<br/>Handler]
    end
    
    subgraph "MCP Client"
        CLIENT[AI Assistant<br/>Claude/VS Code]
        DISPLAY[User Display]
    end
    
    EP_DB --> EP_API
    EP_API -->|HTTPS GET<br/>JSON-LD| RATE
    RATE -->|Allowed| CACHE
    CACHE -->|Cache Miss| EP_API
    CACHE -->|Cached/Fresh Data| TRANSFORM
    TRANSFORM --> VALIDATE
    VALIDATE --> MCP_HANDLER
    MCP_HANDLER -->|MCP Response<br/>JSON| CLIENT
    CLIENT --> DISPLAY
    
    style EP_API fill:#E85D75,stroke:#A53F52,stroke-width:2px,color:#fff
    style CACHE fill:#66BB6A,stroke:#43A047,stroke-width:2px,color:#fff
    style TRANSFORM fill:#FFA726,stroke:#F57C00,stroke-width:2px,color:#fff
    style MCP_HANDLER fill:#4A90E2,stroke:#2E5C8A,stroke-width:2px,color:#fff
```

**Data Transformations**:

| Stage | Input Format | Output Format | Purpose |
|-------|-------------|---------------|---------|
| EP API | Database | JSON-LD | Structured linked data |
| Transform | JSON-LD | JSON | Remove @context, normalize fields |
| Validate | JSON | Typed JSON | Ensure schema compliance |
| MCP Handler | Typed JSON | MCP Response | Wrap in MCP content structure |

---

### Caching Flow

**Purpose**: Shows how caching reduces API calls and improves performance.

```mermaid
graph TB
    START[Tool Request] --> CHECK_CACHE{Cache Hit?}
    
    CHECK_CACHE -->|Yes| RETURN_CACHED[Return Cached Data<br/><1ms response]
    CHECK_CACHE -->|No| CHECK_RATE{Rate Limit OK?}
    
    CHECK_RATE -->|Yes| API_CALL[Call EP API<br/>~200ms]
    CHECK_RATE -->|No| RATE_ERROR[Return RateLimitError]
    
    API_CALL --> API_SUCCESS{Success?}
    API_SUCCESS -->|Yes| CACHE_UPDATE[Update Cache<br/>TTL: 15min]
    API_SUCCESS -->|No| API_ERROR[Return APIError]
    
    CACHE_UPDATE --> RETURN_FRESH[Return Fresh Data]
    
    RETURN_CACHED --> END[Client Response]
    RETURN_FRESH --> END
    RATE_ERROR --> END
    API_ERROR --> END
    
    style RETURN_CACHED fill:#66BB6A,stroke:#43A047,stroke-width:2px,color:#fff
    style API_CALL fill:#FFA726,stroke:#F57C00,stroke-width:2px,color:#fff
    style RATE_ERROR fill:#E85D75,stroke:#A53F52,stroke-width:2px,color:#fff
    style API_ERROR fill:#E85D75,stroke:#A53F52,stroke-width:2px,color:#fff
```

**Cache Configuration**:

```typescript
// Cache settings
const cacheConfig = {
  max: 500,              // Maximum 500 entries
  ttl: 15 * 60 * 1000,  // 15 minutes TTL
  updateAgeOnGet: false  // TTL not refreshed on read
};
```

**Cache Key Strategy**:

- `meps:{country}:{group}:{committee}` - MEP listings
- `mep:{id}` - Individual MEP details
- `plenary:{dateFrom}:{dateTo}` - Plenary sessions
- `votes:{mepId}:{sessionId}:{topic}` - Voting records

---

### Rate Limiting Flow

**Purpose**: Token bucket algorithm for rate limiting.

```mermaid
graph TB
    REQUEST[API Request] --> GET_BUCKET{Get Token Bucket<br/>for IP}
    
    GET_BUCKET --> REFILL[Refill Tokens<br/>Based on Time]
    
    REFILL --> CHECK_TOKENS{Tokens Available?}
    
    CHECK_TOKENS -->|Yes| REMOVE_TOKEN[Remove 1 Token]
    CHECK_TOKENS -->|No| RATE_LIMIT[Return 429<br/>RateLimitError]
    
    REMOVE_TOKEN --> ALLOW[Allow Request]
    
    ALLOW --> API_CALL[Process Request]
    RATE_LIMIT --> WAIT[Client Must Wait]
    
    style REMOVE_TOKEN fill:#66BB6A,stroke:#43A047,stroke-width:2px,color:#fff
    style RATE_LIMIT fill:#E85D75,stroke:#A53F52,stroke-width:2px,color:#fff
```

**Rate Limit Configuration**:

```typescript
// Rate limiter settings
const rateLimiter = new RateLimiter({
  maxTokens: 100,        // Maximum 100 tokens
  refillRate: 100,       // Refill 100 tokens per window
  windowMs: 15 * 60 * 1000  // 15 minute window
});
```

**Headers** (planned):
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1640995200
```

---

## 🚀 Deployment Architectures

### Claude Desktop Deployment

**Purpose**: MCP server as a subprocess of Claude Desktop.

```mermaid
graph TB
    subgraph "User Machine"
        subgraph "Claude Desktop Application"
            CLAUDE[Claude Desktop<br/>Electron App]
            MCP_CLIENT[MCP Client<br/>SDK]
        end
        
        subgraph "MCP Server Process"
            NODE[Node.js Runtime<br/>v22.x]
            SERVER[EP MCP Server<br/>stdio transport]
        end
        
        FS[File System<br/>claude_desktop_config.json]
    end
    
    subgraph "Internet"
        EP_API[European Parliament<br/>API]
    end
    
    FS -.->|Config| CLAUDE
    CLAUDE --> MCP_CLIENT
    MCP_CLIENT <-->|stdio<br/>JSON-RPC| NODE
    NODE --> SERVER
    SERVER -->|HTTPS| EP_API
    
    style CLAUDE fill:#4A90E2,stroke:#2E5C8A,stroke-width:2px,color:#fff
    style SERVER fill:#66BB6A,stroke:#43A047,stroke-width:2px,color:#fff
    style EP_API fill:#E85D75,stroke:#A53F52,stroke-width:2px,color:#fff
```

**Configuration** (`~/.config/claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "european-parliament": {
      "command": "node",
      "args": [
        "/path/to/European-Parliament-MCP-Server/dist/index.js"
      ],
      "env": {
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

---

### VS Code Extension Deployment

**Purpose**: MCP server integrated with VS Code extension.

```mermaid
graph TB
    subgraph "Developer Machine"
        subgraph "VS Code"
            VSCODE[VS Code Editor]
            EXTENSION[MCP Extension]
            MCP_CLIENT[MCP Client SDK]
        end
        
        subgraph "MCP Server Process"
            NODE[Node.js Runtime]
            SERVER[EP MCP Server<br/>stdio transport]
        end
        
        WORKSPACE[Workspace<br/>.vscode/mcp.json]
    end
    
    subgraph "Internet"
        EP_API[European Parliament<br/>API]
    end
    
    WORKSPACE -.->|Config| EXTENSION
    VSCODE --> EXTENSION
    EXTENSION --> MCP_CLIENT
    MCP_CLIENT <-->|stdio<br/>JSON-RPC| NODE
    NODE --> SERVER
    SERVER -->|HTTPS| EP_API
    
    style VSCODE fill:#007ACC,stroke:#005A9C,stroke-width:2px,color:#fff
    style SERVER fill:#66BB6A,stroke:#43A047,stroke-width:2px,color:#fff
    style EP_API fill:#E85D75,stroke:#A53F52,stroke-width:2px,color:#fff
```

**Configuration** (`.vscode/mcp.json`):

```json
{
  "servers": {
    "european-parliament": {
      "type": "stdio",
      "command": "node",
      "args": ["./dist/index.js"],
      "cwd": "${workspaceFolder}/European-Parliament-MCP-Server"
    }
  }
}
```

---

### Docker Deployment

**Purpose**: Containerized MCP server for production deployments.

```mermaid
graph TB
    subgraph "Docker Host"
        subgraph "Container: ep-mcp-server"
            NODEJS[Node.js 22-alpine<br/>Runtime]
            SERVER[EP MCP Server<br/>WebSocket transport]
            CACHE_LOCAL[Local Cache]
        end
        
        DOCKER[Docker Engine]
        VOLUME[Docker Volume<br/>Cache persistence]
    end
    
    subgraph "External Clients"
        CLIENT1[MCP Client 1]
        CLIENT2[MCP Client 2]
        CLIENT3[MCP Client 3]
    end
    
    subgraph "Internet"
        EP_API[European Parliament<br/>API]
    end
    
    DOCKER --> NODEJS
    NODEJS --> SERVER
    SERVER --> CACHE_LOCAL
    CACHE_LOCAL <--> VOLUME
    
    CLIENT1 -->|WebSocket<br/>wss://| SERVER
    CLIENT2 -->|WebSocket<br/>wss://| SERVER
    CLIENT3 -->|WebSocket<br/>wss://| SERVER
    
    SERVER -->|HTTPS| EP_API
    
    style SERVER fill:#66BB6A,stroke:#43A047,stroke-width:2px,color:#fff
    style DOCKER fill:#2496ED,stroke:#1D7FBD,stroke-width:2px,color:#fff
    style EP_API fill:#E85D75,stroke:#A53F52,stroke-width:2px,color:#fff
```

**Dockerfile**:

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/

EXPOSE 3000

VOLUME ["/app/cache"]

ENV NODE_ENV=production
ENV LOG_LEVEL=info

CMD ["node", "dist/index.js", "--transport", "websocket", "--port", "3000"]
```

**Docker Compose** (`docker-compose.yml`):

```yaml
version: '3.8'

services:
  ep-mcp-server:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
      - CACHE_TTL=900
      - RATE_LIMIT_REQUESTS=100
      - RATE_LIMIT_WINDOW=900000
    volumes:
      - cache-data:/app/cache
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health')"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  cache-data:
```

---

## 🔒 Security Architecture

### Security Layers

```mermaid
graph TB
    subgraph "Defense in Depth"
        L1[Input Validation<br/>Zod Schemas]
        L2[Rate Limiting<br/>Token Bucket]
        L3[Output Validation<br/>Schema Enforcement]
        L4[Audit Logging<br/>GDPR Compliance]
        L5[Error Sanitization<br/>No Info Leakage]
    end
    
    subgraph "External Threats"
        T1[Invalid Input]
        T2[DoS Attack]
        T3[Data Injection]
        T4[Privacy Breach]
        T5[Information Disclosure]
    end
    
    T1 -.->|Blocked by| L1
    T2 -.->|Blocked by| L2
    T3 -.->|Blocked by| L3
    T4 -.->|Logged by| L4
    T5 -.->|Prevented by| L5
    
    style L1 fill:#66BB6A,stroke:#43A047,stroke-width:2px,color:#fff
    style L2 fill:#66BB6A,stroke:#43A047,stroke-width:2px,color:#fff
    style L3 fill:#66BB6A,stroke:#43A047,stroke-width:2px,color:#fff
    style L4 fill:#FFA726,stroke:#F57C00,stroke-width:2px,color:#fff
    style L5 fill:#FFA726,stroke:#F57C00,stroke-width:2px,color:#fff
    style T1 fill:#E85D75,stroke:#A53F52,stroke-width:2px,color:#fff
    style T2 fill:#E85D75,stroke:#A53F52,stroke-width:2px,color:#fff
    style T3 fill:#E85D75,stroke:#A53F52,stroke-width:2px,color:#fff
    style T4 fill:#E85D75,stroke:#A53F52,stroke-width:2px,color:#fff
    style T5 fill:#E85D75,stroke:#A53F52,stroke-width:2px,color:#fff
```

**Security Controls**:

| Control | Purpose | Implementation | ISMS Reference |
|---------|---------|----------------|----------------|
| Input Validation | Prevent injection attacks | Zod schemas with regex | ISO 27001 A.14.1.2 |
| Rate Limiting | Prevent DoS attacks | Token bucket (100/15min) | ISO 27001 A.12.1.3 |
| Output Validation | Ensure data integrity | Zod schema validation | ISO 27001 A.14.1.3 |
| Audit Logging | Track data access | Winston logging | ISO 27001 A.12.4.1 |
| Error Sanitization | Prevent info disclosure | Generic error messages | ISO 27001 A.14.1.2 |

---

## 📊 Performance Architecture

### Response Time Optimization

```mermaid
graph LR
    REQUEST[Request] --> CACHE_CHECK{Cache?}
    
    CACHE_CHECK -->|Hit| CACHED[Cached Response<br/><1ms]
    CACHE_CHECK -->|Miss| API_CALL[API Call<br/>~150-200ms]
    
    API_CALL --> TRANSFORM[Transform<br/>~5ms]
    TRANSFORM --> VALIDATE[Validate<br/>~3ms]
    VALIDATE --> CACHE_STORE[Store in Cache]
    CACHE_STORE --> FRESH[Fresh Response<br/>~160-210ms]
    
    CACHED --> RESPONSE[Client Response]
    FRESH --> RESPONSE
    
    style CACHED fill:#66BB6A,stroke:#43A047,stroke-width:2px,color:#fff
    style API_CALL fill:#FFA726,stroke:#F57C00,stroke-width:2px,color:#fff
```

**Performance Metrics**:

| Scenario | Response Time | Cache Hit Rate | Throughput |
|----------|---------------|----------------|------------|
| Cached request | <1ms | 100% | >10,000 req/s |
| API call (EP responsive) | 150-200ms | 0% | ~5 req/s |
| API call (EP slow) | 500-1000ms | 0% | ~1-2 req/s |

---

## 📚 Additional Resources

### Related Documentation
- [API Usage Guide](./API_USAGE_GUIDE.md) - Detailed tool documentation
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Common issues
- [Developer Guide](./DEVELOPER_GUIDE.md) - Contributing guidelines
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Installation instructions
- [Performance Guide](./PERFORMANCE_GUIDE.md) - Optimization strategies

### External Resources
- [C4 Model](https://c4model.com/) - Architecture documentation standard
- [MCP Specification](https://spec.modelcontextprotocol.io/) - Protocol specification
- [Mermaid Documentation](https://mermaid.js.org/) - Diagram syntax

### ISMS Compliance
- [ISO 27001](https://www.iso.org/standard/27001) - Information security management
- [NIST CSF 2.0](https://www.nist.gov/cyberframework) - Cybersecurity framework
- [Hack23 ISMS](https://github.com/Hack23/ISMS-PUBLIC) - Public ISMS policies

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://hack23.com">Hack23 AB</a></strong><br>
  <em>ISMS-compliant architecture demonstrating security excellence</em>
</p>
