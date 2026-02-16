# GitHub Copilot Agent Skills

This directory contains **Agent Skills** for GitHub Copilot, providing structured, reusable patterns and best practices for the European Parliament MCP Server.

## 📚 What Are Agent Skills?

Agent Skills are structured folders of instructions that teach GitHub Copilot to perform specialized, repeatable tasks following your team's specific patterns, coding standards, and best practices. Skills are automatically loaded by Copilot when relevant context is detected.

**Introduced:** December 18, 2025  
**Documentation:** [GitHub Docs - About Agent Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)

## 🎯 Available Skills

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
