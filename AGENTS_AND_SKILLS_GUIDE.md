# Agents and Skills Usage Guide

<p align="center">
  <strong>Comprehensive guide to using GitHub Copilot custom agents and skills for European Parliament MCP Server development</strong>
</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Understanding the Hierarchy](#understanding-the-hierarchy)
- [Available Agents](#available-agents)
- [Available Skills](#available-skills)
- [Usage Examples](#usage-examples)
- [Agent Workflows](#agent-workflows)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

This repository includes **11 custom agents** and **11 comprehensive skills** specifically designed for European Parliament MCP Server development. These tools enhance GitHub Copilot's capabilities to provide expert guidance for MCP protocol implementation, European Parliament data handling, and ISMS compliance.

### What's Included

**6 New Custom Agents:**
- 🔌 **mcp-developer** - MCP protocol implementation expert
- 🏛️ **european-parliament-specialist** - EP datasets and API expert
- 🔗 **api-integration-engineer** - API client design and fault tolerance
- 📐 **zod-schema-architect** - Zod validation and type inference
- ⚡ **performance-optimizer** - Sub-200ms response time optimization
- 🔐 **isms-compliance-auditor** - ISMS policy alignment and compliance

**6 New Comprehensive Skills:**
- 🔌 **mcp-server-development** - MCP tool and resource patterns
- 🏛️ **european-parliament-api** - EP API integration patterns
- 🔒 **gdpr-compliance** - GDPR data protection patterns
- 📐 **typescript-strict-patterns** - Strict TypeScript patterns
- 🧪 **testing-mcp-tools** - MCP testing patterns

---

## Understanding the Hierarchy

```
┌─────────────────────────────────────────┐
│  Custom Instructions (.github/          │
│  copilot-instructions.md)               │
│  Project-wide guidelines and standards  │
└──────────────┬──────────────────────────┘
               │
               ├─────────────────────────┐
               │                         │
    ┌──────────▼─────────┐    ┌─────────▼─────────┐
    │  Custom Agents      │    │  Agent Skills      │
    │  (.github/agents/)  │    │  (.github/skills/) │
    │  Specialized roles  │    │  Reusable patterns │
    └─────────────────────┘    └────────────────────┘
```

### Custom Instructions
**Scope:** Project-level defaults  
**Purpose:** General repository guidelines  
**Example:** "Use TypeScript strict mode", "Target 80% test coverage"

### Custom Agents
**Scope:** Domain expertise  
**Purpose:** Specialized roles for different tasks  
**Example:** `mcp-developer` for protocol implementation, `european-parliament-specialist` for EP data

### Agent Skills
**Scope:** Specific patterns/rules  
**Purpose:** Teach Copilot reusable patterns  
**Example:** "How to validate MCP tool inputs", "How to cache EP API responses"

---

## Available Agents

### 🔌 mcp-developer
**Use when:** Implementing MCP protocol tools, resources, or prompts

**Expertise:**
- MCP specification compliance
- Tool implementation with Zod validation
- Resource URI patterns
- Prompt template design
- Error handling per MCP spec

**Example request:**
```
@workspace Use mcp-developer to create a new MCP tool for searching 
European Parliament documents with proper input validation
```

---

### 🏛️ european-parliament-specialist
**Use when:** Working with European Parliament datasets or API

**Expertise:**
- All 5 EP datasets (MEPs, Plenary, Committees, Documents, Questions)
- European Parliament API integration
- GDPR compliance for parliamentary data
- Multilingual support (24 EU languages)
- Data attribution requirements

**Example request:**
```
@workspace Ask european-parliament-specialist to implement MEP data 
fetching with proper caching and GDPR compliance
```

---

### 🔗 api-integration-engineer
**Use when:** Building API clients or optimizing API performance

**Expertise:**
- API client architecture
- Rate limiting and retry strategies
- Circuit breaker patterns
- HTTP caching with ETag
- Connection pooling

**Example request:**
```
@workspace Have api-integration-engineer implement a fault-tolerant 
API client with exponential backoff and circuit breaker
```

---

### 📐 zod-schema-architect
**Use when:** Creating validation schemas or ensuring type safety

**Expertise:**
- Zod schema design
- Branded types for IDs
- Discriminated unions
- Schema composition
- Custom validators

**Example request:**
```
@workspace Use zod-schema-architect to create comprehensive validation 
schemas for European Parliament data with branded types
```

---

### ⚡ performance-optimizer
**Use when:** Optimizing performance or troubleshooting slow operations

**Expertise:**
- Sub-200ms response time optimization
- LRU caching strategies
- Memory leak detection
- Event loop monitoring
- CPU profiling

**Example request:**
```
@workspace Ask performance-optimizer to analyze and optimize the MEP 
data fetching to achieve <200ms P95 response times
```

---

### 🔐 isms-compliance-auditor
**Use when:** Ensuring ISMS compliance or mapping security controls

**Expertise:**
- ISO 27001, NIST CSF, CIS Controls mapping
- GDPR compliance verification
- Security audit logging
- Vulnerability management
- SBOM and SLSA compliance

**Example request:**
```
@workspace Have isms-compliance-auditor verify that all MCP tools 
comply with ISMS policies and map to security controls
```

---

## Available Skills

Skills are automatically activated by GitHub Copilot when relevant context is detected. You don't need to explicitly invoke them.

### 🔌 mcp-server-development
**Auto-activates when:** Working with MCP protocol code

**Teaches:**
- MCP tool implementation patterns
- Resource URI design
- Prompt template structure
- MCP-compliant error handling

---

### 🏛️ european-parliament-api
**Auto-activates when:** Integrating European Parliament API

**Teaches:**
- API client configuration
- Response caching strategies
- Rate limiting implementation
- Data attribution requirements

---

### 🔒 gdpr-compliance
**Auto-activates when:** Processing MEP personal data

**Teaches:**
- Data minimization
- Audit logging for personal data
- Right to rectification/erasure
- Storage limitation (24h max)

---

### 📐 typescript-strict-patterns
**Auto-activates when:** Writing TypeScript code

**Teaches:**
- Branded types for IDs
- Discriminated unions
- Zod to TypeScript type inference
- Null safety patterns

---

### 🧪 testing-mcp-tools
**Auto-activates when:** Writing tests

**Teaches:**
- Unit test patterns for MCP tools
- Mocking European Parliament API
- Testing Zod validation
- Integration test structure

---

## Usage Examples

### Example 1: Creating a New MCP Tool

**Task:** Create a new MCP tool for searching parliamentary questions

**Approach:**
1. Invoke the `mcp-developer` agent
2. The `mcp-server-development` skill auto-activates
3. The `zod-schema-architect` helps with input validation
4. The `european-parliament-specialist` provides EP API knowledge

**Command:**
```
@workspace Use mcp-developer to create an MCP tool "search_questions" 
that searches parliamentary questions with filters for recipient 
(commission/council), status (answered/pending), and date range. 
Include proper Zod validation and European Parliament API integration.
```

**Result:** Complete MCP tool implementation with:
- Zod input schema validation
- MCP-compliant response structure
- European Parliament API integration
- Proper error handling
- Unit tests

---

### Example 2: Optimizing API Performance

**Task:** Improve MEP data fetching performance

**Approach:**
1. Invoke `performance-optimizer` agent
2. The `performance-optimization` skill provides caching patterns
3. The `european-parliament-api` skill provides EP-specific caching TTLs

**Command:**
```
@workspace Ask performance-optimizer to implement multi-tier caching 
for MEP data to achieve <200ms P95 response times. Use LRU cache with 
1-hour TTL and implement cache warming for active MEPs.
```

**Result:** Optimized implementation with:
- LRU cache configuration
- Cache warming strategy
- Performance metrics tracking
- Response time < 200ms P95

---

### Example 3: Ensuring ISMS Compliance

**Task:** Verify GDPR compliance for MEP data handling

**Approach:**
1. Invoke `isms-compliance-auditor` agent
2. The `gdpr-compliance` skill provides data protection patterns
3. The `european-parliament-specialist` ensures EP-specific requirements

**Command:**
```
@workspace Have isms-compliance-auditor review the MEP data handling 
code for GDPR compliance. Verify data minimization, audit logging, 
storage limitation, and right to rectification implementation.
```

**Result:** Compliance review with:
- GDPR checklist verification
- Data minimization assessment
- Audit logging implementation
- Recommendations for improvements

---

### Example 4: Creating Type-Safe Schemas

**Task:** Create validated schemas for all EP datasets

**Approach:**
1. Invoke `zod-schema-architect` agent
2. The `typescript-strict-patterns` skill provides type safety patterns
3. The `european-parliament-specialist` provides dataset structure

**Command:**
```
@workspace Use zod-schema-architect to create comprehensive Zod schemas 
for MEP, Document, Committee, and Question datasets with branded types 
for IDs and proper validation rules.
```

**Result:** Complete schema library with:
- Branded types (MEP_ID, DocumentID, etc.)
- Runtime validation
- TypeScript type inference
- Clear error messages

---

## Agent Workflows

### Workflow 1: New Feature Development

```mermaid
graph LR
    A[Requirements] --> B[mcp-developer]
    B --> C[european-parliament-specialist]
    C --> D[zod-schema-architect]
    D --> E[test-engineer]
    E --> F[isms-compliance-auditor]
    F --> G[documentation-writer]
```

1. **mcp-developer**: Implement MCP tool structure
2. **european-parliament-specialist**: Integrate EP API
3. **zod-schema-architect**: Create validation schemas
4. **test-engineer**: Write comprehensive tests
5. **isms-compliance-auditor**: Verify compliance
6. **documentation-writer**: Document the feature

---

### Workflow 2: Performance Optimization

```mermaid
graph LR
    A[Slow Operation] --> B[performance-optimizer]
    B --> C[api-integration-engineer]
    C --> D[test-engineer]
    D --> E[Complete]
```

1. **performance-optimizer**: Profile and identify bottlenecks
2. **api-integration-engineer**: Optimize API calls and caching
3. **test-engineer**: Add performance tests
4. **Complete**: Verify <200ms P95 response times

---

### Workflow 3: ISMS Compliance Review

```mermaid
graph LR
    A[Codebase] --> B[isms-compliance-auditor]
    B --> C[security-specialist]
    C --> D[european-parliament-specialist]
    D --> E[Report]
```

1. **isms-compliance-auditor**: Check policy alignment
2. **security-specialist**: Verify security controls
3. **european-parliament-specialist**: Check GDPR compliance
4. **Report**: Generate compliance report

---

## Best Practices

### ✅ Do

1. **Invoke Specific Agents**: Be specific about which agent you need
   ```
   ✅ @workspace Use mcp-developer to...
   ❌ @workspace Create a tool...
   ```

2. **Provide Context**: Give agents enough context
   ```
   ✅ Ask european-parliament-specialist to implement MEP caching with 1h TTL
   ❌ Cache MEP data
   ```

3. **Chain Agents**: Use multiple agents for complex tasks
   ```
   @workspace Use mcp-developer to create the tool, then have 
   test-engineer write comprehensive tests
   ```

4. **Trust Skills**: Let skills auto-activate for patterns
   - Skills work in the background
   - No need to explicitly invoke them

5. **Verify Results**: Review agent output for accuracy
   - Agents are powerful but not perfect
   - Always review generated code

---

### ❌ Don't

1. **Don't Skip Agents**: Use specialized agents instead of generic requests
   ```
   ❌ Write some code to fetch MEPs
   ✅ Use european-parliament-specialist to implement MEP fetching
   ```

2. **Don't Override Skills**: Let skills work automatically
   ```
   ❌ Ignore the input validation requirements
   ✅ Let zod-schema-architect guide validation
   ```

3. **Don't Mix Concerns**: Keep agent requests focused
   ```
   ❌ Create a tool and write docs and add tests
   ✅ Use mcp-developer for tool, documentation-writer for docs, test-engineer for tests
   ```

---

## Troubleshooting

### Agent Not Responding as Expected

**Symptom:** Agent doesn't follow expected patterns

**Solution:**
1. Check if you're invoking the right agent for the task
2. Provide more specific context in your request
3. Reference specific files or examples
4. Try rephrasing your request

**Example:**
```
Instead of: "Create a tool"
Try: "Use mcp-developer to create an MCP tool for searching MEPs 
following the pattern in src/tools/search-meps.ts"
```

---

### Skill Not Activating

**Symptom:** Expected patterns not applied

**Solution:**
1. Skills auto-activate based on context
2. Add relevant keywords to trigger activation
3. Reference skill documentation directly

**Example:**
```
To activate gdpr-compliance skill:
"Implement MEP data access with GDPR-compliant audit logging and 
data minimization following privacy by design principles"
```

---

### Conflicting Recommendations

**Symptom:** Different agents suggest different approaches

**Solution:**
1. Use agent specialization matrix to choose primary agent
2. Prefer domain-specific agents over generic ones
3. Ask isms-compliance-auditor to resolve conflicts

**Example:**
```
@workspace Ask isms-compliance-auditor to determine the correct 
approach for handling MEP email addresses given GDPR requirements 
and EP data attribution rules
```

---

## Additional Resources

- **Agent Documentation**: `.github/agents/README.md`
- **Skill Documentation**: `.github/skills/README.md`
- **Custom Instructions**: `.github/copilot-instructions.md`
- **ISMS Policies**: https://github.com/Hack23/ISMS-PUBLIC
- **MCP Specification**: https://spec.modelcontextprotocol.io/
- **European Parliament API**: https://data.europarl.europa.eu/

---

## Feedback and Improvements

Found an issue or have suggestions for improving agents or skills?

1. Open an issue on GitHub
2. Tag with `copilot-agents` or `copilot-skills`
3. Describe the problem or suggestion
4. Include examples if possible

---

**Last Updated:** 2026-02-16  
**Version:** 1.0.0
