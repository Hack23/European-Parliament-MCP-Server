---
name: strategic-communication-analysis
description: Narrative analysis, media monitoring, discourse analysis, and influence assessment for EU parliamentary communications
license: MIT
---

# Strategic Communication Analysis Skill

## Context

This skill applies when:
- Analyzing narratives and framing in European Parliament plenary debates and committee hearings
- Monitoring media coverage of EU legislative processes and EP political dynamics
- Assessing communication strategies of EP political groups on key policy dossiers
- Evaluating influence networks through parliamentary question patterns and debate contributions
- Studying discourse framing in EP resolutions, reports, and adopted texts
- Tracking public communication by MEPs through official EP channels (speeches, written declarations)
- Analyzing how EP positions are communicated to national publics across 24 official EU languages
- Assessing the effectiveness of EP institutional communication (press releases, social media)

This skill supports transparent analysis of public parliamentary communications, aligned with [Hack23 ISMS](https://github.com/Hack23/ISMS-PUBLIC) documentation and attribution standards.

## Rules

1. **Public Sources Only**: Analyze only publicly available EP communications — plenary speeches, committee hearing transcripts, official documents, press releases, and public statements accessible through MCP Server data
2. **Discourse Analysis Rigor**: Apply established discourse analysis frameworks (Fairclough CDA, Hajer argumentative discourse analysis) to EP texts — avoid impressionistic interpretation
3. **Multilingual Awareness**: Recognize that EP operates in 24 official languages — framing effects may differ across language versions of the same document; identify translation-induced meaning shifts
4. **Frame Identification**: Systematically identify policy frames (diagnostic, prognostic, motivational) in EP debates — track which frames dominate across political groups and policy areas
5. **Attribution Precision**: Distinguish between individual MEP positions, political group positions, committee positions, and EP institutional positions — these are different levels of communication authority
6. **Temporal Tracking**: Monitor narrative evolution through legislative stages — framing at Commission proposal stage may differ significantly from adopted text, revealing EP's communication influence
7. **Influence Metrics**: Measure communication influence through observable indicators — amendment adoption rates, media pickup of EP positions, citation in subsequent Commission proposals
8. **Audience Differentiation**: Recognize that EP communications target multiple audiences simultaneously — EU institutions, national governments, media, civil society, and citizens across 27 states
9. **Bias Transparency**: Explicitly acknowledge analytical perspective and potential biases when interpreting EP communications — no analysis is value-free
10. **GDPR and Data Ethics**: Handle MEP communication data in compliance with GDPR — public speeches are public data, but systematic profiling of individual MEP communication patterns requires proportionality assessment per [Hack23 Privacy Policy](https://github.com/Hack23/ISMS-PUBLIC)

## Examples

### Policy Frame Analysis in EP Debates
```
Analyze framing of EU Green Deal debates using MCP Server data:

1. Retrieve debate documents: search_documents (Green Deal dossiers)
2. Identify competing frames across political groups:
   - EPP: "Competitiveness + environment" (economic opportunity frame)
   - S&D: "Just transition" (social justice frame)
   - Greens/EFA: "Climate emergency" (urgency/crisis frame)
   - ECR: "Regulatory burden" (sovereignty/cost frame)
   - ID: "EU overreach" (anti-federalist frame)
3. Track frame prevalence across legislative stages
4. Measure frame adoption: which frames appear in final adopted texts
5. Assess frame bridging: identify MEPs who combine frames across groups
```

### Parliamentary Question Pattern Analysis
```
Map communication priorities through written questions:

Using get_parliamentary_questions (parliamentary questions filter):
1. Categorize questions by policy domain and political group
2. Identify emerging issues: topics with rapidly increasing question frequency
3. Detect scrutiny campaigns: coordinated questions on same topic from one group
4. Track Commission responsiveness: response time and substantive engagement
5. Compare question strategies: oral vs. written, priority vs. non-priority

Influence indicators:
- Questions that trigger Commission studies or legislative proposals
- Questions cited in subsequent EP reports or resolutions
- Questions generating media coverage in national press
```

### Narrative Evolution Through Legislative Process
```
Track how EP communication shapes legislative outcomes:

Dossier tracking (using track_legislation):
1. Commission proposal: identify initial policy narrative and framing
2. Committee report: analyze how rapporteur reframes the issue
3. Plenary amendments: map competing narratives from political groups
4. Trilogue: assess which EP narrative frames survive Council negotiation
5. Adopted text: compare final framing with original proposal

Metrics:
- Frame persistence: % of EP frames retained in final text
- Narrative dominance: which political group's framing prevails
- Institutional influence: EP vs. Council framing in trilogue outcomes
```

## Anti-Patterns

- **Propaganda Analysis Framing**: Do NOT treat all EP communication as propaganda or strategic manipulation — much parliamentary communication serves legitimate democratic functions of deliberation and representation
- **Cherry-Picking Quotes**: Do NOT select individual quotes out of context to support a pre-determined narrative — analyze full debate transcripts and document systematic patterns
- **Ignoring Multilingual Context**: Do NOT analyze only English-language EP documents and generalize — EP debates occur across languages, and national-language media coverage shapes public perception differently
- **Conflating Communication and Influence**: Do NOT assume that frequent communication equals influence — measure actual impact through amendment adoption, legislative outcomes, and policy change
- **Media Bias Amplification**: Do NOT reproduce media framing uncritically when analyzing EP communications — distinguish EP's actual positions from how media represents them
- **Attributing Group Position to Individuals**: Do NOT attribute an EP political group's communication strategy to individual MEPs — MEPs may communicate differently from their group's official line
- **Surveillance Framing**: Do NOT use communication analysis to create surveillance-style monitoring of individual MEPs — analysis should focus on institutional communication patterns and public democratic discourse
