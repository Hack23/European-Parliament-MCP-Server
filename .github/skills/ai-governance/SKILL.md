---
name: ai-governance
description: EU AI Act compliance, OWASP LLM security, responsible AI practices for parliamentary data and MCP server applications
license: MIT
---

# AI Governance Skill

## Context

This skill applies when:
- Ensuring EU AI Act compliance for MCP tools that serve LLM applications
- Implementing OWASP Top 10 for LLM mitigations in MCP server responses
- Designing responsible AI guardrails for parliamentary data consumption
- Evaluating AI risk classifications for tools that process political data
- Preventing misuse of parliamentary data in AI-generated disinformation
- Implementing transparency and explainability for AI-assisted legislative analysis
- Auditing AI system interactions with European Parliament datasets

This skill focuses on **governance of AI systems consuming EP data**, distinct from the `ai-development-governance` skill which covers AI-assisted code development practices. Parliamentary data used by LLMs carries unique risks around political bias, misinformation, and democratic integrity.

## Rules

1. **Classify AI Risk Level**: EP MCP tools providing political data to LLMs are at minimum "limited risk" under EU AI Act; document risk assessments for each tool
2. **Mitigate LLM Prompt Injection**: Sanitize all MCP tool outputs to prevent prompt injection attacks when data flows into LLM contexts
3. **Prevent Data Poisoning**: Validate data integrity from EP API sources; never serve cached data beyond its TTL without freshness verification
4. **Implement Output Guardrails**: MCP tool responses must include attribution metadata so LLMs can cite sources accurately
5. **Address OWASP LLM01 (Prompt Injection)**: Strip control characters and instruction-like patterns from EP data before returning to MCP clients
6. **Address OWASP LLM06 (Sensitive Data)**: Apply GDPR data minimization to MEP personal data returned through MCP tools; never expose private contact details
7. **Log AI Interactions**: Record all MCP tool invocations with request metadata for AI audit trails, without logging personal query content
8. **Provide Transparency Notices**: Include data provenance and recency timestamps in all MCP tool responses
9. **Prevent Political Bias Amplification**: Tool responses must present factual parliamentary records without editorial framing or sentiment indicators
10. **Support Human Oversight**: Design MCP tools as information retrieval aids, not autonomous decision-making systems; always enable human-in-the-loop review

## Examples

### ✅ Good Pattern: Output Sanitization for LLM Safety

```typescript
/**
 * Sanitize EP data before returning through MCP tools.
 * Prevents prompt injection when data flows into LLM contexts.
 */
function sanitizeForLLMContext(text: string): string {
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Control characters
    .replace(/\bSYSTEM\s*:/gi, '[FILTERED]')         // Instruction patterns
    .replace(/\bASSISTANT\s*:/gi, '[FILTERED]')
    .replace(/\bIGNORE\s+PREVIOUS/gi, '[FILTERED]')
    .trim();
}
```

### ✅ Good Pattern: Data Provenance in MCP Responses

```typescript
function createMCPResponse(data: unknown, toolName: string) {
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        data,
        _metadata: {
          source: "European Parliament Open Data Portal",
          sourceUrl: "https://data.europarl.europa.eu/",
          retrievedAt: new Date().toISOString(),
          tool: toolName,
          disclaimer: "Official EU parliamentary records. Verify critical information at europarl.europa.eu.",
        },
      }, null, 2),
    }],
  };
}
```

### ✅ Good Pattern: AI Risk Classification

```markdown
| MCP Tool              | EU AI Act Risk | Justification                                   |
|------------------------|----------------|--------------------------------------------------|
| search_meps            | Limited        | Returns public official records                  |
| get_voting_records     | Limited        | Factual voting data, public record               |
| analyze_voting_patterns| High           | Generates political analysis, bias risk          |
| get_mep_contacts       | Limited        | Contains personal data, GDPR applies             |
```

### ✅ Good Pattern: OWASP LLM Top 10 Checklist

```typescript
// Audit checklist for MCP tool security
const owaspLLMChecklist = {
  'LLM01_PromptInjection': 'Output sanitization applied to all EP data',
  'LLM02_InsecureOutput': 'JSON schema validation on all responses',
  'LLM03_TrainingDataPoisoning': 'N/A — server does not train models',
  'LLM04_ModelDoS': 'Rate limiting enforced per MCP client',
  'LLM05_SupplyChain': 'Dependency scanning via OSSF Scorecard',
  'LLM06_SensitiveData': 'GDPR minimization for MEP personal data',
  'LLM07_InsecurePlugin': 'Input validation on all tool parameters',
  'LLM08_ExcessiveAgency': 'Read-only tools, no write operations',
  'LLM09_Overreliance': 'Disclaimer and source attribution included',
  'LLM10_ModelTheft': 'N/A — server does not host models',
};
```

## Anti-Patterns

### ❌ Bad: Returning Raw Unsanitized Data to LLM Contexts
```typescript
// NEVER pass raw EP data directly without sanitization
return { content: [{ type: "text", text: rawApiResponse }] };
```

### ❌ Bad: Missing Data Provenance
```typescript
// NEVER return data without source attribution
return { content: [{ type: "text", text: JSON.stringify(votes) }] };
// LLM cannot cite or verify the source
```

### ❌ Bad: Adding Editorial Framing
```typescript
// NEVER add sentiment or editorial language to factual data
return {
  text: `MEP ${name} controversially voted against the popular climate bill...`
  // "controversially" and "popular" are editorial, not factual
};
```

## ISMS Compliance

- **AI-001**: AI risk assessment and EU AI Act classification for all MCP tools
- **SC-002**: Output sanitization to prevent prompt injection in LLM contexts
- **AU-002**: Audit logging for AI system interactions with parliamentary data
- **DP-001**: GDPR data minimization in AI-consumed MEP personal data

Reference: [Hack23 ISMS Policies](https://github.com/Hack23/ISMS-PUBLIC)
