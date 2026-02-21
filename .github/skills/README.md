# GitHub Copilot Agent Skills

This directory contains **Agent Skills** for GitHub Copilot, providing structured, reusable patterns and best practices for the European Parliament MCP Server.

## 📚 What Are Agent Skills?

Agent Skills are structured folders of instructions that teach GitHub Copilot to perform specialized, repeatable tasks following your team's specific patterns, coding standards, and best practices. Skills are automatically loaded by Copilot when relevant context is detected.

**Introduced:** December 18, 2025  
**Documentation:** [GitHub Docs - About Agent Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)

## 🎯 Available Skills

**Total: 31 Skills** across Core Development, Security & Compliance, DevOps & Quality, ISMS, and Political Intelligence domains.

### Core MCP Development Skills

### 🔌 [mcp-server-development](./mcp-server-development/SKILL.md)
**MCP protocol patterns and tool implementation**

Teaches Copilot to implement Model Context Protocol (MCP) servers following specification. Covers:
- Tool implementation with Zod validation
- Resource URI patterns and handlers
- Prompt template design
- MCP-compliant error handling
- Testing MCP implementations

**When to use:** Implementing MCP tools, resources, prompts for European Parliament data

---

### 🏛️ [european-parliament-api](./european-parliament-api/SKILL.md)
**European Parliament API integration patterns**

Ensures proper integration with European Parliament Open Data Portal. Covers:
- API client configuration with rate limiting
- Response caching strategies (1h-24h TTL)
- Multilingual data handling (24 EU languages)
- Data attribution requirements
- GDPR-compliant data access

**When to use:** Integrating EP API, caching parliamentary data, ensuring attribution

---

### 🔒 [gdpr-compliance](./gdpr-compliance/SKILL.md)
**GDPR and data protection patterns**

Enforces GDPR compliance for European Parliament personal data. Covers:
- Data minimization and purpose limitation
- Audit logging for personal data access
- Right to rectification and erasure
- Storage limitation (max 24h cache)
- Privacy by design principles

**When to use:** Processing MEP data, implementing GDPR rights, audit logging

---

### 📐 [typescript-strict-patterns](./typescript-strict-patterns/SKILL.md)
**TypeScript strict mode patterns and type safety**

Enforces TypeScript strict mode compliance and advanced patterns. Covers:
- Branded types for IDs (prevent mixing)
- Discriminated unions for type-safe variants
- Zod schema to TypeScript type inference
- Null safety and type guards
- Utility types (Pick, Omit, Partial)

**When to use:** Writing TypeScript code, defining types, ensuring type safety

---

### 🧪 [testing-mcp-tools](./testing-mcp-tools/SKILL.md)
**Testing patterns for MCP implementations**

Enforces comprehensive testing with 80%+ coverage target. Covers:
- Unit tests for MCP tools and resources
- Mocking European Parliament API
- Testing Zod schema validation
- Integration tests for MCP server
- Performance testing (<200ms target)

**When to use:** Writing tests, improving coverage, testing MCP handlers

---

### 🔒 [security-by-design](./security-by-design/SKILL.md)
**High-level security principles and enforcement rules**

Ensures all code follows security-first principles aligned with Hack23 AB's ISMS policies. Teaches Copilot to:
- Apply defense-in-depth strategies
- Implement principle of least privilege
- Enforce secure coding patterns for APIs
- Validate against ISMS compliance requirements
- Never introduce vulnerabilities or commit secrets

**When to use:** Always active for security-related code changes

---

### 📋 [isms-compliance](./isms-compliance/SKILL.md)
**ISMS policy alignment and compliance verification**

Enforces alignment with [Hack23 AB's Information Security Management System](https://github.com/Hack23/ISMS-PUBLIC). Teaches Copilot to:
- Verify compliance with ISO 27001:2022, NIST CSF 2.0, CIS Controls v8.1
- Reference appropriate ISMS policies
- Maintain security documentation
- Follow secure development lifecycle requirements
- Align with Open Source Policy for dependencies

**When to use:** Security features, compliance documentation, policy updates

---

### 🧪 [testing-strategy](./testing-strategy/SKILL.md)
**Comprehensive testing patterns and quality assurance**

Enforces testing best practices for unit tests (Vitest/Jest), integration tests, and 80%+ coverage requirements. Teaches Copilot to:
- Write behavior-focused tests for TypeScript/Node.js
- Test MCP protocol handlers and European Parliament API integrations
- Mock dependencies properly
- Achieve deterministic, non-flaky tests
- Test error handling and edge cases

**When to use:** Writing tests, improving test coverage, debugging test failures

---

### 📝 [documentation-standards](./documentation-standards/SKILL.md)
**Clear, comprehensive technical documentation**

Standards for README files, API docs, JSDoc comments, and security documentation. Teaches Copilot to:
- Structure documentation consistently
- Include working code examples
- Use Mermaid diagrams effectively
- Reference ISMS policies appropriately
- Keep docs synchronized with code

**When to use:** Creating/updating docs, writing comments, generating guides

---

### ⚡ [performance-optimization](./performance-optimization/SKILL.md)
**Performance best practices and optimization patterns**

Patterns for optimizing Node.js API performance, MCP protocol efficiency, and data processing. Teaches Copilot to:
- Optimize API response times
- Minimize memory allocations
- Use proper caching strategies
- Reduce database query overhead
- Profile and measure performance

**When to use:** Performance improvements, optimization work, profiling

---

### Security, DevOps & Quality Skills

### 🔄 [github-agentic-workflows](./github-agentic-workflows/SKILL.md)
**GitHub Agentic Workflows with MCP tools and Copilot coding agent orchestration**

Comprehensive guidance for AI-powered automations using Copilot coding agent. Covers:
- Copilot coding agent assignment (basic, base_ref, custom_instructions)
- Stacked PR workflows for multi-step implementations
- MCP server configuration for agent tools
- OWASP Agentic security and safe output handling

**When to use:** Orchestrating Copilot assignments, building agentic workflows, agent security

---

### 🏛️ [c4-architecture-documentation](./c4-architecture-documentation/SKILL.md)
**C4 model architecture documentation with Mermaid diagrams**

Document system architecture using C4 model abstraction levels. Covers:
- Required documentation portfolio (12 current + future state docs)
- C4 levels: Context, Container, Component views
- Mermaid diagram standards and patterns
- Security architecture documentation

**When to use:** Documenting system architecture, creating ARCHITECTURE.md, SECURITY_ARCHITECTURE.md

---

### ⚙️ [github-actions-workflows](./github-actions-workflows/SKILL.md)
**Secure CI/CD workflows with GitHub Actions for TypeScript/Node.js**

Create efficient CI/CD pipelines for MCP server projects. Covers:
- Build, test, and security scan pipelines
- Action version pinning with SHA hashes
- npm package publishing workflows
- Test and coverage reporting

**When to use:** Setting up CI/CD, automating security scans, configuring deployments

---

### 📊 [code-quality-excellence](./code-quality-excellence/SKILL.md)
**Code quality with ESLint, TypeScript strict mode, and quality gates**

Maintain high quality through automated static analysis. Covers:
- TypeScript strict mode configuration
- ESLint strict rules compliance
- Quality gate thresholds (80%+ coverage)
- Knip unused export detection

**When to use:** Code quality reviews, configuring linters, quality audits

---

### 🔍 [secure-code-review](./secure-code-review/SKILL.md)
**Security code review using OWASP Top 10 for TypeScript/MCP servers**

Conduct thorough security reviews identifying vulnerabilities. Covers:
- OWASP Top 10 review checklist for TypeScript
- Input validation with Zod schemas
- API security and error handling review
- Dependency security scanning

**When to use:** PR security reviews, periodic audits, pre-release security checks

---

### 🔑 [secrets-management](./secrets-management/SKILL.md)
**Secure credential handling with environment variables and GitHub secrets**

Zero-tolerance policy for hardcoded secrets. Covers:
- Environment variable patterns for Node.js
- GitHub secrets for CI/CD pipelines
- MCP server token security
- Secret exposure incident response

**When to use:** Adding API integrations, configuring CI/CD, managing credentials

---

### 🛡️ [vulnerability-management](./vulnerability-management/SKILL.md)
**Systematic vulnerability lifecycle management with SLAs**

Vulnerability discovery, assessment, remediation, and tracking. Covers:
- CVSS severity classification and SLA timelines
- npm audit and Dependabot alert handling
- Remediation workflow for Node.js dependencies
- Compliance mapping (ISO 27001, NIST CSF, CIS Controls)

**When to use:** Handling Dependabot alerts, triaging security findings, SLA tracking

---

### 🔐 [secure-development-lifecycle](./secure-development-lifecycle/SKILL.md)
**Comprehensive SDLC security with DevSecOps automation**

Security practices across all development phases. Covers:
- Security requirements analysis and threat modeling
- Secure implementation patterns (input validation, error handling)
- Automated security testing in CI/CD
- Supply chain security (OSSF Scorecard, SLSA, SBOM)

**When to use:** Planning features, implementing security controls, release security reviews

---

### 🚨 [incident-response](./incident-response/SKILL.md)
**Security incident detection, containment, and recovery**

Procedures for handling security incidents per NIST SP 800-61r2. Covers:
- Incident classification and response timelines
- Containment and eradication procedures
- Recovery and lessons learned
- Communication and disclosure (SECURITY.md, GDPR notifications)

**When to use:** Responding to vulnerability reports, managing secret exposures, security incidents

---

### 🤝 [contribution-guidelines](./contribution-guidelines/SKILL.md)
**Open source contribution process with PR workflow and code review standards**

Proper contribution process for the project. Covers:
- Fork, clone, and PR workflow
- Conventional commit message format
- Code review checklists (contributor and reviewer)
- Quality gates before merge

**When to use:** Submitting PRs, conducting code reviews, contributing to the project

---

### Political Intelligence & Analysis Skills

### 🏛️ [political-science-analysis](./political-science-analysis/SKILL.md)
**Comparative politics and policy analysis for European Parliament data**

Apply political science methodologies to EP datasets. Covers:
- MEP voting behavior analysis across 27 member states
- Political group cohesion measurement (Agreement Index)
- Comparative national delegation analysis
- Legislative procedure outcome analysis
- Ideological scaling from roll-call votes

**When to use:** Analyzing MEP voting patterns, political group dynamics, legislative outcomes

---

### 🔍 [osint-methodologies](./osint-methodologies/SKILL.md)
**OSINT collection and verification for EU parliamentary intelligence**

Structured open-source intelligence techniques for EP data. Covers:
- EP data source hierarchy and evaluation (CRAAP framework)
- Multi-source triangulation and verification
- MEP activity verification against official records
- Legislative procedure tracking across institutions
- GDPR-compliant collection with audit trails

**When to use:** Collecting parliamentary intelligence, verifying MEP activity claims, cross-referencing sources

---

### 🧠 [intelligence-analysis-techniques](./intelligence-analysis-techniques/SKILL.md)
**Structured analytic techniques for EU parliamentary intelligence**

Reduce cognitive bias in parliamentary analysis with structured methods. Covers:
- Analysis of Competing Hypotheses (ACH) for legislative outcomes
- SWOT analysis for political group strategy assessment
- Key Assumptions Check for coalition predictions
- Devil's Advocacy and Red Team techniques
- Confidence level assessment and communication

**When to use:** Evaluating legislative outcomes, assessing political group strategy, reducing analytical bias

---

### 🇪🇺 [european-political-system](./european-political-system/SKILL.md)
**EU Parliament structure, political groups, and legislative procedures**

Essential institutional context for EP MCP Server usage. Covers:
- EP political group composition and ideology mapping
- Ordinary legislative procedure (Art. 294 TFEU) stages
- Committee structure and powers (20 standing committees)
- Trilogue negotiation dynamics (EP-Council-Commission)
- Electoral system variations across 27 member states

**When to use:** Interpreting EP data, understanding institutional context, explaining EU legislative process

---

### 📊 [data-science-for-intelligence](./data-science-for-intelligence/SKILL.md)
**Statistical analysis, ML, NLP, and network analysis for EP data**

Data science techniques tailored to European Parliament datasets. Covers:
- Ideological scaling with PCA/MDS from roll-call votes
- NLP analysis of legislative texts and amendments
- Network analysis of MEP collaboration and co-sponsorship
- Time series analysis of legislative productivity
- GDPR-compliant data processing pipelines

**When to use:** Statistical analysis of voting patterns, text analysis of legislation, network modeling of political alliances

---

### Comprehensive ISMS Compliance Skills

### 🎖️ [open-source-governance](./open-source-governance/SKILL.md)
**Open source governance, security badges, license compliance, SBOM**

Comprehensive coverage of [Hack23 Open Source Policy v2.3](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md). Covers:
- Security posture evidence (OpenSSF Scorecard ≥7.0, SLSA Level 3, CII Best Practices)
- License compliance framework (approved/prohibited licenses)
- SBOM generation and validation (CycloneDX)
- Supply chain security (dependency scanning, pinning)
- Vulnerability management (disclosure, remediation SLAs)
- Exception management process

**When to use:** Repository setup, badge integration, license compliance, SBOM generation, vulnerability handling

---

### 🕷️ [threat-modeling-framework](./threat-modeling-framework/SKILL.md)
**STRIDE threat modeling, security analysis, SDLC integration**

Enforces [Secure Development Policy Section 🕷️](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md#advanced-security-testing-framework) requirements. Covers:
- STRIDE methodology (Spoofing, Tampering, Repudiation, Information Disclosure, DoS, Elevation of Privilege)
- Threat model documentation (THREAT_MODEL.md)
- Trust boundary analysis with Mermaid diagrams
- Mitigation strategies and risk assessment
- SDLC integration (planning through maintenance)

**When to use:** Feature design, security architecture, threat analysis, PR reviews

---

### 🏗️ [architecture-documentation](./architecture-documentation/SKILL.md)
**C4 model, security architecture, Mermaid diagrams**

Implements [Secure Development Policy Section 🏗️](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md#architecture-documentation-matrix) standards. Covers:
- C4 architecture levels (Context, Container, Component, Code)
- SECURITY_ARCHITECTURE.md requirements
- FUTURE_SECURITY_ARCHITECTURE.md planning
- Mermaid diagram color coding (red=untrusted, green=trusted, yellow=external, blue=data)
- Compliance mapping (ISO 27001, NIST CSF, CIS Controls)

**When to use:** Architecture design, security documentation, creating diagrams, compliance mapping

---

### ☁️ [aws-security-architecture](./aws-security-architecture/SKILL.md)
**AWS Control Tower, Well-Architected Framework, VPC security**

AWS-specific security patterns per [Secure Development Policy AWS sections](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md#aws-control-tower-objective-mapping). Covers:
- AWS Control Tower objectives (CO.1-CO.15)
- AWS Well-Architected Framework (Security, Reliability, Operational Excellence, Performance, Cost, Sustainability)
- VPC endpoints and private connectivity
- GuardDuty, Security Hub, CloudTrail integration
- High availability and resilience (multi-AZ, Route 53)
- AWS Resilience Hub and Fault Injection Simulator (FIS)

**When to use:** AWS cloud architecture, VPC design, security monitoring, HA/DR planning

---

### 📜 [compliance-frameworks](./compliance-frameworks/SKILL.md)
**ISO 27001, NIST CSF 2.0, CIS Controls, EU CRA compliance**

Multi-standard compliance mapping per [Hack23 ISMS policies](https://github.com/Hack23/ISMS-PUBLIC). Covers:
- ISO 27001:2022 control implementation (A.5, A.8, A.12, A.13, A.14)
- NIST CSF 2.0 functions (GOVERN, IDENTIFY, PROTECT, DETECT, RESPOND, RECOVER)
- CIS Controls v8.1 safeguards (IG1, IG2, IG3)
- EU Cyber Resilience Act (CRA) conformity assessment
- Compliance evidence generation and tracking

**When to use:** Compliance documentation, control mapping, audit preparation, certification

---

### 🤖 [ai-development-governance](./ai-development-governance/SKILL.md)
**AI-augmented development, GitHub Copilot governance, LLM security**

Enforces [Secure Development Policy Section 🤖](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md#ai-augmented-development-controls) for responsible AI use. Covers:
- AI as proposal generator (not authority) principle
- PR review requirements for AI-generated code
- Custom Copilot agent governance
- Security requirements (no secrets in prompts, human review mandatory)
- AI code disclosure and documentation
- Test coverage requirements (80%+)

**When to use:** Using GitHub Copilot, reviewing AI code, creating custom agents, AI security

---

## 🔄 How Skills Work

### Automatic Activation
Skills are automatically loaded by GitHub Copilot when:
1. You work in this repository
2. Your prompt or context matches the skill's domain
3. Copilot detects relevant patterns or keywords

**No manual activation needed** - Copilot intelligently applies relevant skills.

### Skill Structure
Each skill follows this directory structure:
```
.github/skills/skill-name/
├── SKILL.md           # Main skill file with YAML frontmatter
├── examples/          # Code examples (optional)
│   └── example.ts
├── templates/         # Reusable templates (optional)
│   └── template.ts
└── docs/             # Additional documentation (optional)
    └── patterns.md
```

### SKILL.md Format
```markdown
---
name: skill-name
description: Brief description (max 200 chars)
license: MIT
---

# Skill Name

## Context
When this skill applies and why it's needed.

## Rules
1. Clear, actionable rule
2. Another specific rule
3. More enforcement patterns

## Examples
Concrete examples showing correct implementation.

## Anti-Patterns
What NOT to do, with explanations.
```

## 🎯 Skill vs Agent vs Custom Instructions

Understanding the hierarchy:

| Type | Scope | Purpose | Location |
|------|-------|---------|----------|
| **Skills** | Specific patterns/rules | Teach Copilot reusable patterns | `.github/skills/` |
| **Agents** | Domain expertise | Specialized roles for different tasks | `.github/agents/` |
| **Custom Instructions** | Project-wide | General repository guidelines | `.github/copilot-instructions.md` |

**Mental Model:**
- **Custom Instructions** = Project-level defaults (e.g., "Use TypeScript strict mode")
- **Agents** = Specialized experts (e.g., `mcp-specialist` for protocol implementation)
- **Skills** = Reusable patterns and rules (e.g., "How to test MCP handlers")

### Example Workflow
```
Developer: "Add a new MCP tool for searching European Parliament documents"

Copilot applies:
1. Custom Instructions → TypeScript strict mode, project structure
2. Agent → mcp-specialist (MCP protocol expertise)
3. Skills → security-by-design + testing-strategy + documentation-standards
```

## 🛠️ Creating New Skills

### When to Create a Skill
Create a skill when you have:
- ✅ Repeatable patterns that should be consistent across the codebase
- ✅ Best practices that are often forgotten or done incorrectly
- ✅ Complex workflows that require specific steps
- ✅ Domain-specific rules that apply to certain contexts

### Skill Design Principles
1. **Strategic and High-Level** - Focus on principles, not implementation details
2. **Rule-Based** - Clear, enforceable rules that Copilot can follow
3. **Security-First** - Always consider security implications
4. **ISMS-Aligned** - Reference relevant Hack23 policies
5. **Examples-Driven** - Show correct patterns with concrete examples
6. **Minimal** - Keep skills focused on one domain

### Creating a New Skill
1. Create directory: `.github/skills/skill-name/`
2. Create `SKILL.md` with proper YAML frontmatter
3. Add examples in `examples/` subdirectory
4. Test the skill by using Copilot in relevant contexts
5. Update this README with the new skill

## 📚 Resources

### Official Documentation
- [About Agent Skills - GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)

### Best Practices Collections
- [Anthropic Skills Repository](https://github.com/anthropics/skills)
- [GitHub Awesome Copilot](https://github.com/github/awesome-copilot)

### Hack23 Resources
- [Hack23 ISMS-PUBLIC Repository](https://github.com/Hack23/ISMS-PUBLIC)
- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)
- [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md)

### European Parliament Resources
- [European Parliament Open Data Portal](https://data.europarl.europa.eu/)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)

## 🔄 Maintenance

### Keeping Skills Updated
- Review skills quarterly for accuracy
- Update skills when best practices evolve
- Remove obsolete patterns
- Add new skills as patterns emerge
- Sync with ISMS policy updates

### Version Control
- All skills are version-controlled with the repository
- Changes to skills go through PR review
- Document breaking changes in skill descriptions

## 💡 Tips for Effective Skills

### ✅ Do
- Write clear, specific rules that are easy to follow
- Include concrete examples showing correct implementation
- Reference relevant documentation and policies
- Keep skills focused on one domain or pattern
- Use simple language without jargon
- Test skills by using Copilot in relevant contexts

### ❌ Don't
- Make skills too broad or generic
- Include implementation details that change frequently
- Duplicate content from custom instructions or agents
- Use overly technical language without explanation
- Create skills for one-off patterns
- Forget to include examples

## 🤝 Contributing

When improving or adding skills:
1. Follow the skill structure and format
2. Align with Hack23 ISMS policies
3. Test skills with GitHub Copilot
4. Update this README
5. Submit changes via pull request
6. Get review from relevant domain experts

---

**Remember:** Skills are strategic, high-level, and rule-based. They complement agents (specialized experts) and custom instructions (project defaults) to create a comprehensive AI-assisted development experience.
