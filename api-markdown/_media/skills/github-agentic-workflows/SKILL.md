---
name: github-agentic-workflows
description: GitHub Agentic Workflows (gh-aw) — markdown-defined AI automation with Copilot/Claude/Codex, safe outputs, 5-layer security, and Continuous AI patterns
license: Apache-2.0
---

# GitHub Agentic Workflows Skill

## Purpose

Comprehensive guidance for GitHub Agentic Workflows (`gh-aw`) — a Go-based GitHub CLI extension that enables writing agentic workflows in natural language using markdown files, compiled into GitHub Actions workflows with defense-in-depth security. Also covers Copilot coding agent orchestration, MCP server configuration, stacked PRs, and OWASP Agentic security.

## When to Use

- ✅ Writing markdown-defined AI workflows (`gh-aw`) for automated repository tasks
- ✅ Orchestrating Copilot coding agent assignments with `base_ref` and `custom_instructions`
- ✅ Building multi-step agentic workflows with stacked PRs
- ✅ Configuring safe outputs, permissions, and AI engine selection
- ✅ Securing agentic pipelines against prompt injection and data exfiltration
- ✅ Implementing Continuous AI patterns (scheduled + event-triggered AI automation)

## GitHub Agentic Workflows (`gh-aw`)

### Overview

GitHub Agentic Workflows (gh-aw) augments deterministic CI/CD with **Continuous AI** — systematic, automated application of AI to software collaboration. Workflows are defined in markdown with YAML frontmatter and compiled to GitHub Actions via `gh aw compile`.

**Key capabilities:** Issue triage, CI failure diagnosis, documentation maintenance, code quality improvement, metrics/analytics, security scanning, multi-repo coordination, project planning.

### Workflow Definition Format

```markdown
---
timeout-minutes: 5
on:
  schedule: daily           # or cron: "0 9 * * 1-5", or event triggers
  issue:
    types: [opened, reopened]
permissions:
  contents: read
  issues: read
  pull-requests: read
tools:
  github:
    toolsets: [issues, labels, pull_requests, repos]
safe-outputs:
  create-issue:
    title-prefix: "[report] "
    labels: [automated, report]
    close-older-issues: true
  add-labels:
    allowed: [bug, feature, enhancement, documentation]
  add-comment: {}
  create-pull-request:
    title-prefix: "[auto] "
    max-changed-files: 5
---

# Workflow Title

Natural language instructions for the AI agent describing what to do.

## Context
- Repository-specific guidance
- What to analyze or act on

## Rules
- Constraints and boundaries
- Output format requirements
```

### CLI Commands

```bash
# Install the extension
gh extension install github/gh-aw

# Add a workflow from the gallery
gh aw add-wizard https://github.com/github/gh-aw/blob/v0.45.5/.github/workflows/issue-triage-agent.md

# Compile markdown to GitHub Actions lock file
gh aw compile

# Run a workflow manually
gh aw run <workflow-name>
```

### AI Engines

| Engine | Use Cases |
|--------|-----------|
| `copilot` | General automation, code analysis, issue management |
| `claude` | Deep analysis, NLP, complex reasoning, documentation |
| `codex` | Code generation, refactoring, test writing |

### 5-Layer Security Architecture

```
GitHub Event → [Isolated Container] → Proposed Output → Threat Detection → Write Job → GitHub API
                 ↑                        ↑                  ↑               ↑
            Read-only token         Structured artifact   AI-powered scan  Scoped write token
            Zero secrets            (not direct writes)   Prompt injection  Hard limits per op
            Network firewall                              Credential leak   Label constraints
            (AWF allowlist)                               Malicious code    Title prefixes
```

1. **Read-only tokens** — Agent receives read-only GitHub token; cannot push, create PRs, or delete
2. **Zero secrets in agent** — Write tokens/API keys exist only in isolated post-agent jobs
3. **Containerized + network firewall** — Agent Workflow Firewall (AWF) routes traffic through Squid proxy with domain allowlist; all other traffic dropped at kernel level
4. **Safe outputs with guardrails** — Agent produces structured artifact; separate gated job applies permitted actions with hard limits (max issues, required prefixes, label constraints)
5. **Agentic threat detection** — AI-powered scan checks for prompt injection, leaked credentials, malicious code before any output is applied

### Safe Outputs Reference

```yaml
safe-outputs:
  create-issue:
    title-prefix: "[auto] "          # Required prefix
    labels: [automated]               # Auto-applied labels
    close-older-issues: true           # Clean up previous runs
    max-issues: 1                      # Hard limit per run
  add-comment:
    max-comments: 3
  add-labels:
    allowed: [bug, feature, docs]      # Allowlist only
  create-pull-request:
    title-prefix: "[auto] "
    max-changed-files: 10
    labels: [automated]
  create-discussion:
    category: "Reports"
```

### Integrity Filtering

By default, `min-integrity: approved` restricts visibility to owners/members/collaborators. For public repo triage that processes external contributor issues, set `min-integrity: none` in tools config. See [Integrity Filtering](https://github.github.com/gh-aw/reference/integrity/).

### Workflow Categories (Agent Factory Patterns)

| Category | Examples | Trigger |
|----------|----------|---------|
| **Issue triage** | Auto-label, auto-assign, auto-comment | `on: issue` |
| **Continuous documentation** | Doc healer, doc updater, glossary | `schedule: daily` |
| **Code quality** | Code simplifier, refiner, dead code removal | `schedule: daily` |
| **CI/CD management** | CI failure doctor, CI coach, CI cleaner | `on: workflow_run` |
| **Security** | Red team, secrets scan, code scanning fixer | `schedule: daily` |
| **Metrics & analytics** | Code metrics, session insights, NLP analysis | `schedule: daily` |
| **Multi-repo** | Feature sync, cross-repo tracking | `schedule` / `workflow_dispatch` |
| **Project coordination** | `/plan` command, discussion task miner | `on: issue_comment` |

### Plan Command Pattern

The `/plan` command decomposes issues into actionable sub-tasks that Copilot coding agent can work on:

```markdown
---
on:
  issue_comment:
    types: [created]
permissions:
  contents: read
  issues: read
tools:
  github:
    toolsets: [issues, repos]
safe-outputs:
  create-issue:
    title-prefix: "[plan] "
    labels: [planned]
---

# Plan Command

When a user comments `/plan` on an issue, analyze the issue and break it down
into 3-5 actionable sub-issues that can be independently implemented.
```

## Copilot Coding Agent Orchestration

### Assignment Methods

```javascript
// Basic assignment via MCP tool
assign_copilot_to_issue({
  owner: "Hack23", repo: "European-Parliament-MCP-Server", issue_number: 100
})

// Feature branch assignment
assign_copilot_to_issue({
  owner: "Hack23", repo: "European-Parliament-MCP-Server",
  issue_number: 100,
  base_ref: "feature/new-tools",
  custom_instructions: "Use TypeScript strict mode. Follow MCP protocol. Add Vitest tests."
})

// Direct PR creation with custom agent
create_pull_request_with_copilot({
  owner: "Hack23", repo: "European-Parliament-MCP-Server",
  title: "Add new MCP tool", body: "Implementation details",
  base_ref: "main", custom_agent: "mcp-developer"
})

// Track progress
get_copilot_job_status({ owner: "Hack23", repo: "European-Parliament-MCP-Server", job_id: "abc123" })
```

### Stacked PR Workflow

```
main ← PR 1: Data models
         ← PR 2: API client (base_ref: PR 1 branch)
              ← PR 3: MCP tools (base_ref: PR 2 branch)
```

### Sequential Task Chaining

```javascript
const step1 = await create_pull_request_with_copilot({
  owner: "Hack23", repo: "European-Parliament-MCP-Server",
  title: "Step 1: Data models", body: "Create TypeScript interfaces", base_ref: "main"
});

const step2 = await assign_copilot_to_issue({
  owner: "Hack23", repo: "European-Parliament-MCP-Server",
  issue_number: 200, base_ref: step1.branch,
  custom_instructions: "Build on models from PR #" + step1.pull_request_url.split('/').pop()
});
```

## MCP Server Configuration

MCP server configuration is defined in `.github/copilot-mcp.json`. Secret references (`${{ secrets.* }}`) are resolved by the Copilot runtime. See `.github/copilot-mcp.json` for the canonical configuration.

**Supply chain note:** This repo uses the GitHub MCP Insiders HTTP endpoint (`https://api.githubcopilot.com/mcp/insiders`) as configured in `.github/copilot-mcp.json`. For projects that invoke `@modelcontextprotocol/server-github` via `npx`, pin it to a specific version in production to reduce supply chain risk when injecting privileged tokens.

## OWASP Agentic Security

| Threat | Mitigation |
|--------|-----------|
| Prompt injection | Input validation, safe outputs, threat detection job, integrity filtering |
| Excessive agency | Read-only tokens, minimal permissions, safe output hard limits |
| Data exfiltration | AWF network firewall, domain allowlist, containerized sandbox |
| Supply chain | Pinned action SHAs, dependency scanning, zero secrets in agent |
| Credential theft | Zero secrets architecture, isolated write jobs |

## Resources

- [GitHub Agentic Workflows Docs](https://github.github.com/gh-aw/) — Official documentation
- [Quick Start](https://github.github.com/gh-aw/setup/quick-start/) — Installation and setup
- [Agent Factory Gallery](https://github.com/github/gh-aw/tree/main/.github/workflows) — 100+ example workflows
- [Security Architecture](https://github.github.com/gh-aw/introduction/architecture/) — Defense-in-depth model
- [Safe Outputs Reference](https://github.github.com/gh-aw/reference/safe-outputs/) — Output guardrails
- [GitHub Blog: Agentic Workflows](https://github.blog/ai-and-ml/automate-repository-tasks-with-github-agentic-workflows/)

## ISMS Policy References

**Core policies:**

- [AI Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/AI_Policy.md) — **Primary**: Responsible AI automation, human oversight, provenance
- [OWASP LLM Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/OWASP_LLM_Security_Policy.md) — Prompt-injection resistance, tool-abuse controls, safe outputs
- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) — Agentic PRs run the full secure-SDLC pipeline
- [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md) — Governance and transparency
- [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md) — Public audit trail of AI-assisted contributions

**Supporting policies:**

- [Access Control Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Access_Control_Policy.md) — Agent scopes, least-privilege tokens
- [Change Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Change_Management.md) — Human PR review remains mandatory
- [Privacy Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Privacy_Policy.md) — Prevent leakage of personal / confidential data in agent prompts and outputs
