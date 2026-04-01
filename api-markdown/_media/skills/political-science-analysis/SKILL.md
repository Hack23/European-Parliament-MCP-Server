---
name: political-science-analysis
description: Apply comparative politics, political behavior, and policy analysis frameworks to European Parliament data
license: MIT
---

# Political Science Analysis Skill

## Context

This skill applies when:
- Analyzing MEP voting behavior patterns across 27 EU member states
- Studying political group cohesion and fragmentation in the European Parliament
- Evaluating EU legislative process dynamics (ordinary legislative procedure, consent, consultation)
- Performing comparative analysis of national delegation voting within transnational political groups
- Assessing policy positions using roll-call vote data from EP plenary sessions
- Studying coalition-building patterns between political groups (EPP, S&D, Renew, Greens/EFA, ECR, ID, The Left, NI)
- Analyzing rapporteur assignment patterns and committee influence
- Tracking political group switching and MEP mobility

This skill is grounded in the European Parliament MCP Server's access to EP Open Data Portal datasets and aligns with [Hack23 ISMS Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) for data integrity.

## Rules

1. **Use Established Frameworks**: Apply recognized political science methodologies — Hix-Noury-Roland spatial models, NOMINATE-style scaling for EP, Cohesion Index (Agreement Index) for political groups
2. **Distinguish Data Levels**: Separate individual MEP votes, national delegation patterns, and political group aggregates — never conflate levels of analysis
3. **Account for Institutional Context**: Consider EP's unique features: multilingual deliberation, rotating presidency influence, co-decision with Council, and committee gatekeeping power
4. **Control for Confounders**: When analyzing voting behavior, control for national party discipline, political group whip strength, salience of policy area, and legislative procedure type
5. **Temporal Awareness**: Respect legislative term boundaries (EP5–EP10), mid-term political group realignments, and enlargement effects (EU-15 → EU-27)
6. **Use EP-Specific Terminology**: Reference rapporteurs (not sponsors), political groups (not parties), plenary (not floor), trilogue (not conference committee)
7. **Validate Against Multiple Sources**: Cross-reference MCP Server data with VoteWatch Europe, EP Think Tank publications, and official EP roll-call records
8. **GDPR Compliance**: MEP voting records are public data under EU transparency rules, but personal contact data requires GDPR-compliant handling per [Hack23 Privacy Policy](https://github.com/Hack23/ISMS-PUBLIC)
9. **Attribution**: Always cite European Parliament Open Data Portal as the authoritative data source
10. **Quantitative Rigor**: Report confidence intervals, effect sizes, and sample sizes when presenting statistical findings on voting patterns

## Examples

### Analyzing Political Group Cohesion
```
Use the EP MCP Server's plenary vote data to calculate the Agreement Index (AI)
for each political group on environmental legislation in EP10:
- AI = (max(Yes, No, Abstain) - 0.5 * (votes - max(Yes, No, Abstain))) / votes
- Compare cohesion across policy domains (environment vs. economic affairs)
- Identify national delegations that deviate most from group line
- Control for vote salience using roll-call request patterns
```

### Comparative National Delegation Analysis
```
Compare Swedish MEP voting patterns across political groups:
- Map Swedish national parties to EP political groups (S → S&D, M → EPP, etc.)
- Calculate loyalty scores: how often Swedish MEPs vote with their group majority
- Identify policy areas where national interest overrides group discipline
- Use MCP Server tools: get_meps (country filter), get_voting_records
```

### Legislative Procedure Analysis
```
Track legislative outcomes through the ordinary legislative procedure:
- Use track_legislation tool to identify dossiers by policy area
- Analyze first-reading agreements vs. second-reading/conciliation outcomes
- Study rapporteur influence: compare committee vote to plenary vote alignment
- Assess EP vs. Council bargaining success rates by policy domain
```

## Anti-Patterns

- **Ecological Fallacy**: Do NOT infer individual MEP positions from political group averages — always check individual roll-call votes
- **Selection Bias on Roll-Calls**: Do NOT treat roll-call votes as representative of all EP votes — they are a biased sample (requested strategically by political groups)
- **Ignoring Absences**: Do NOT exclude abstentions and absences from analysis — they carry political meaning in EP (strategic abstention is common)
- **National Party Conflation**: Do NOT assume all MEPs from a country share positions — national party affiliation within political groups is the key unit
- **Static Analysis**: Do NOT analyze EP voting without accounting for temporal dynamics — political group composition changes within and across legislative terms
- **Monocausal Explanations**: Do NOT attribute voting patterns to a single factor — EP voting is shaped by ideology, nationality, committee membership, rapporteur relationships, and trilogue outcomes simultaneously
- **Ignoring Non-Legislative Work**: Do NOT focus exclusively on plenary votes — committee work, written questions, and reports reveal different dimensions of MEP activity
