---
name: business-model-canvas
description: Value proposition, customer segments, revenue streams, and business model design for EU parliamentary data platforms
license: MIT
---

# Business Model Canvas Skill

## Context

This skill applies when:
- Designing the value proposition for the European Parliament MCP Server
- Identifying and prioritizing customer segments (AI developers, journalists, researchers, NGOs)
- Evaluating revenue streams such as open core, API tiers, consulting, or EU grants
- Planning partnerships with civic tech organizations and EU institutions
- Assessing cost structures for API hosting, data processing, and compliance
- Creating go-to-market strategies for parliamentary data products
- Aligning business model decisions with open source governance and ISMS policies

The EP MCP Server operates at the intersection of open data, civic technology, and AI tooling. Business model decisions must balance public interest transparency with sustainable development funding.

## Rules

1. **Lead with Open Core**: Keep the core MCP Server open source (MIT); offer premium tools, SLAs, or managed hosting as paid tiers
2. **Define Customer Segments Clearly**: Primary segments are AI/LLM developers, investigative journalists, academic researchers, transparency NGOs, and EU affairs consultancies
3. **Validate Value Propositions per Segment**: AI developers need structured MCP tools; journalists need real-time alerts; researchers need historical datasets; NGOs need bulk access
4. **Design Sustainable Revenue Streams**: Combine API usage tiers, consulting engagements, EU Horizon/CEF grants, and sponsorships from civic tech foundations
5. **Map Key Partners**: European Parliament Open Data Portal, MCP ecosystem maintainers, OpenSSF, civic tech communities, and academic institutions
6. **Minimize Cost Structure Risks**: Use serverless or edge hosting to keep infrastructure costs proportional to usage; avoid fixed high-cost infrastructure
7. **Protect Open Source Brand**: Never gate public parliamentary data behind paywalls; only charge for value-added services, SLAs, and premium tooling
8. **Leverage EU Funding Programs**: Target Digital Europe Programme, Horizon Europe, and CEF grants for civic technology and open data initiatives
9. **Measure Key Metrics**: Track npm downloads, MCP tool invocations, API response times, GitHub stars, and contributor growth as business KPIs
10. **Align with ISMS Policies**: All business model decisions must comply with Hack23 AB open source policy and data protection requirements

## Examples

### ✅ Good Pattern: Tiered API Access Model

```yaml
# Pricing tiers for EP MCP Server
tiers:
  community:
    price: free
    rate_limit: 100 requests/hour
    tools: [search_meps, get_plenary_sessions]
    support: community forum
    data: current legislative term

  professional:
    price: €49/month
    rate_limit: 5000 requests/hour
    tools: all standard tools
    support: email, 48h SLA
    data: full historical archive

  enterprise:
    price: custom
    rate_limit: unlimited
    tools: all tools + custom endpoints
    support: dedicated, 4h SLA
    data: full archive + real-time webhooks
```

### ✅ Good Pattern: Value Proposition Map

```markdown
| Segment           | Pain Point                        | Value Proposition                          |
|--------------------|-----------------------------------|--------------------------------------------|
| AI Developers      | No structured EP data for LLMs    | MCP-native tools with typed schemas        |
| Journalists        | Manual monitoring of EP activity   | Real-time alerts on votes and procedures   |
| Researchers        | Fragmented data across EP sources  | Unified API with historical coverage       |
| NGOs               | Limited technical capacity         | Simple MCP integration, no coding needed   |
| EU Consultancies   | Slow legislative tracking          | Automated monitoring with custom filters   |
```

### ✅ Good Pattern: EU Grant Alignment

```markdown
Funding source: Digital Europe Programme (DIGITAL-2024-DEPLOY-04)
Alignment: Open source tools for democratic participation
Deliverables:
  - MCP Server with 20+ parliamentary data tools
  - GDPR-compliant data access layer
  - Multi-language documentation (EN, FR, DE)
  - Community contributor onboarding program
```

## Anti-Patterns

### ❌ Bad: Gating Public Data Behind Paywalls
```yaml
# NEVER restrict access to public parliamentary records
premium_only_tools:
  - get_mep_votes        # Public record — must remain free
  - search_legislation   # Public data — must remain free
```

### ❌ Bad: No Segment Differentiation
```markdown
# NEVER use one-size-fits-all messaging
"Our API gives you European Parliament data."
# Too generic — fails to address specific segment needs
```

### ❌ Bad: Ignoring Open Source Sustainability
```markdown
# NEVER rely solely on volunteer contributions
funding_model: "Hope that contributors keep working for free"
# Unsustainable — plan revenue streams from day one
```

## ISMS Compliance

- **OS-001**: Open source governance and transparent licensing (MIT)
- **DP-001**: Business model must respect GDPR data minimization for personal MEP data
- **AC-003**: Tiered access controls aligned with customer segment authorization levels

Reference: [Hack23 ISMS Policies](https://github.com/Hack23/ISMS-PUBLIC)
