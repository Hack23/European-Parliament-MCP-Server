# Agent Customization Notes

This document describes how the GitHub Copilot custom agents were adapted from the Hack23/game repository for the European Parliament MCP Server project.

## Source

All agents were originally downloaded from: `Hack23/game` repository at `.github/agents/`

## Customizations Applied

### 1. README.md
- Updated project context from "game development" to "European Parliament MCP Server development"
- Removed React, Three.js, and game-specific agent references
- Updated workflow diagram to reflect MCP server development agents
- Kept ISMS compliance and security references
- Updated tool descriptions for TypeScript/API development

### 2. documentation-writer.md
- **Minimal customization** - mostly unchanged
- Updated examples to focus on MCP server documentation
- Added European Parliament API documentation patterns
- Removed game-specific documentation examples
- Kept all ISMS policy documentation standards

### 3. frontend-specialist.md
- **Major customization** - completely refocused
- Changed from "React 19 development" to "TypeScript development with strict typing"
- Removed all React, hooks, and component-specific content
- Added API client development patterns
- Added MCP server implementation patterns
- Added Zod schema validation examples
- Focused on type-safe HTTP clients and error handling
- Kept strict TypeScript enforcement rules

### 4. security-specialist.md
- **Moderate customization** - updated examples
- Removed React/Three.js specific security examples
- Updated to TypeScript/API security patterns
- Added API endpoint security examples
- Added rate limiting and query parameter validation
- Kept all ISMS compliance, OSSF Scorecard, SLSA requirements
- Kept all supply chain security standards
- Updated tool references (grep, glob instead of search_code)

### 5. test-engineer.md
- **Major customization** - completely refocused
- Removed React Testing Library, Cypress, and E2E testing
- Removed Three.js and game-specific testing patterns
- Added Vitest-focused unit testing for TypeScript/Node.js
- Added API client testing patterns
- Added MCP tool/resource testing patterns
- Added schema validation testing (Zod)
- Added data transformation testing
- Kept 80%+ coverage requirements
- Kept deterministic testing principles
- Kept ISMS compliance references

### 6. product-task-agent.md
- **MAJOR customization** - complete recontextualization
- Changed domain from "game development" to "European Parliament MCP Server development"
- Removed ALL game-specific content (Three.js, React, game mechanics, UI/UX)
- Added European Parliament dataset integration focus
- Added MCP protocol expertise (tools, resources, prompts)
- Added API design and data schema quality analysis
- Added TypeScript type safety analysis
- Updated all examples to MCP server context
- Updated issue categories for MCP server development
- Removed/minimized Playwright references (backend focus)
- Kept AWS tools for data analysis
- Kept all ISMS compliance and security standards
- Updated agent coordination to match available agents

## Key Themes Across All Agents

### Kept Unchanged:
- ✅ ISMS compliance requirements and policy references
- ✅ Security standards (OSSF Scorecard, SLSA, SBOM)
- ✅ Testing coverage requirements (80%+)
- ✅ Documentation standards
- ✅ TypeScript strict mode requirements
- ✅ GitHub MCP integration patterns

### Customized:
- 🔄 Domain expertise (game → European Parliament data)
- 🔄 Technology stack (React/Three.js → TypeScript/Node.js/MCP)
- 🔄 Examples (game mechanics → API endpoints, data schemas)
- 🔄 Analysis focus (UI/UX → API design, data quality)
- 🔄 Tool references (based on available tools in project)

### Removed:
- ❌ React and React hooks content
- ❌ Three.js and 3D rendering content
- ❌ Game mechanics and game flow content
- ❌ React Testing Library and Cypress
- ❌ UI/UX and component-specific patterns
- ❌ Game-specific skills references

## Agent Capabilities Summary

| Agent | Domain | Primary Focus |
|-------|--------|---------------|
| **product-task-agent** | Product Analysis | MCP server quality, API design, data integration, issue creation |
| **documentation-writer** | Documentation | Technical docs, API docs, MCP server documentation |
| **frontend-specialist** | TypeScript Development | Strict typing, API clients, MCP tool implementation |
| **security-specialist** | Security & Compliance | OSSF, SLSA, ISMS, supply chain security |
| **test-engineer** | Testing & QA | Vitest, API testing, MCP testing, 80%+ coverage |

## Usage

All agents are now configured for European Parliament MCP Server development:

```
@workspace Use the product-task-agent to analyze MCP tool coverage and create enhancement issues

@workspace Ask the frontend-specialist to implement type-safe API client for EP members endpoint

@workspace Have the test-engineer write comprehensive tests for the new MCP tool

@workspace Request the security-specialist to review dependency vulnerabilities

@workspace Use the documentation-writer to create API documentation for MCP resources
```

## Compliance

All agents maintain alignment with:
- [Hack23 ISMS Policies](https://github.com/Hack23/ISMS-PUBLIC)
- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
- OSSF Scorecard requirements (≥8.0/10)
- SLSA Level 3 provenance
- SBOM quality standards (≥7.0/10)

---

**Last Updated:** 2025-02-16  
**Source Repository:** Hack23/game  
**Target Repository:** European-Parliament-MCP-Server
