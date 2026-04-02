# Copilot Instructions

## 📋 Required Context Files

**ALWAYS read these files at the start of your session:**
- `.github/workflows/copilot-setup-steps.yml` — Environment setup and permissions
- `.github/copilot-mcp.json` — MCP server configuration and available tools
- `README.md` — Repository overview and project context
- `SECURITY.md` — Security policy and vulnerability disclosure

## Project Overview

**European Parliament MCP Server** — Model Context Protocol server for European Parliament Open Data. TypeScript 6.0.2, Node.js 25, strict mode, Zod validation. ISMS-compliant (ISO 27001, NIST CSF 2.0, CIS Controls v8.1), GDPR-ready, SLSA Level 3.

**Scale:** 61 MCP tools (7 core + 3 advanced + 15 OSINT + 8 phase 4 + 15 phase 5 + 13 feed) · 9 resources · 7 prompts · 1130+ unit tests · 23 E2E tests · 80%+ coverage · <200ms API responses.

**Data source:** European Parliament Open Data Portal API v2 (`https://data.europarl.europa.eu/api/v2/`).

## Development Commands

```bash
npm ci                    # Install (lockfile)
npm run build             # Compile TypeScript
npm run lint              # ESLint
npm run type-check        # tsc --noEmit
npm test -- --run         # Unit tests (Vitest)
npm run test:coverage     # Coverage report
npm run test:licenses     # License compliance
npx knip                  # Unused code/dependencies check
```

## 🎯 Skills Catalog (41 skills in `.github/skills/`)

| Category | Skills |
|----------|--------|
| **Core Dev (10)** | mcp-server-development, european-parliament-api, gdpr-compliance, typescript-strict-patterns, testing-mcp-tools, security-by-design, isms-compliance, testing-strategy, documentation-standards, performance-optimization |
| **Security (6)** | secure-code-review, secrets-management, vulnerability-management, secure-development-lifecycle, incident-response, contribution-guidelines |
| **DevOps (4)** | github-agentic-workflows, c4-architecture-documentation, github-actions-workflows, code-quality-excellence |
| **Intelligence (10)** | political-science-analysis, osint-methodologies, intelligence-analysis-techniques, european-political-system, data-science-for-intelligence, electoral-analysis, behavioral-analysis, strategic-communication-analysis, legislative-monitoring, risk-assessment-frameworks |
| **Business (2)** | business-model-canvas, seo-best-practices |
| **AI & Gateway (3)** | ai-governance, mcp-gateway-configuration, mcp-gateway-security |
| **ISMS (6)** | open-source-governance, threat-modeling-framework, architecture-documentation, aws-security-architecture, compliance-frameworks, ai-development-governance |

## Coding Guidelines

### TypeScript Strict Mode (ES2025 target)

- **No `any`** — use `unknown` if needed
- **Explicit return types** on all functions
- **Zod schemas** for all external data validation
- **`noUncheckedIndexedAccess`** enabled — handle potential `undefined` from array/object access
- **Exhaustive switch cases** — handle all union discriminants
- **Use `satisfies`** for type-safe object literals

### Code Organization

```
src/
├── tools/          # MCP tool implementations (61 tools)
├── resources/      # MCP resource handlers (9 resources)
├── prompts/        # MCP prompt templates (7 prompts)
├── clients/ep/     # European Parliament API client
├── schemas/        # Zod validation schemas
├── server/         # MCP server setup, tool registry
├── types/          # TypeScript type definitions
├── config.ts       # Configuration (env vars: EP_API_URL, EP_REQUEST_TIMEOUT_MS, EP_CACHE_TTL, EP_RATE_LIMIT)
└── generated/      # Auto-generated EP API types
```

### Testing (Vitest)

- Colocate tests as `.test.ts` next to source files
- 80%+ line coverage required (95% for security code)
- Mock EP API calls with `vi.mock()`
- Integration tests in `tests/integration/`, E2E in `tests/e2e/`

## MCP Tool Development Pattern

```typescript
import { z } from 'zod';

const Schema = z.object({
  country: z.string().length(2).optional(),
  limit: z.number().min(1).max(100).default(50)
});

export async function handleTool(args: z.infer<typeof Schema>) {
  const validated = Schema.parse(args);
  const data = await fetchFromEPAPI(validated);
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
```

## Security Requirements

- **Input validation:** Zod schemas on all tool inputs
- **Rate limiting:** 100 req/min default (configurable via `EP_RATE_LIMIT`)
- **GDPR:** Data minimization, 15min cache TTL for personal data, audit logging
- **Supply chain:** Pinned action SHAs, SLSA Level 3, CycloneDX/SPDX SBOM
- **Error handling:** Never expose internal errors — return generic messages to clients

## Custom Agents (14 in `.github/agents/`)

api-integration-engineer, business-development-specialist, documentation-writer, european-parliament-specialist, frontend-specialist, intelligence-operative, isms-compliance-auditor, marketing-specialist, mcp-developer, performance-optimizer, product-task-agent, security-specialist, test-engineer, zod-schema-architect

## CI/CD Pipeline (11 workflows)

8-stage pipeline: Code Validation → Build & Test → Security Analysis → Integration Testing → Release & Publish → Supply Chain (SBOM/SLSA) → Continuous Monitoring (Scorecard) → Repository Management. See `WORKFLOWS.md` for details.

## Architecture Documentation (14 documents)

**Current (7):** ARCHITECTURE.md, SECURITY_ARCHITECTURE.md, DATA_MODEL.md, FLOWCHART.md, STATEDIAGRAM.md, MINDMAP.md, SWOT.md
**Future (7):** FUTURE_ARCHITECTURE.md, FUTURE_SECURITY_ARCHITECTURE.md, FUTURE_DATA_MODEL.md, FUTURE_FLOWCHART.md, FUTURE_STATEDIAGRAM.md, FUTURE_MINDMAP.md, FUTURE_SWOT.md

## Resources

- [EP Open Data Portal](https://data.europarl.europa.eu/en/home) · [MCP Spec](https://spec.modelcontextprotocol.io/) · [Hack23 ISMS](https://github.com/Hack23/ISMS-PUBLIC) · [GDPR Guide](https://gdpr.eu/) · [OpenSSF Best Practices](https://bestpractices.coreinfrastructure.org/)
