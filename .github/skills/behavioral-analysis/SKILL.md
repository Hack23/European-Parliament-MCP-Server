---
name: behavioral-analysis
description: Political psychology, cognitive biases, MEP leadership analysis, group dynamics in European Parliament decision-making
license: MIT
---

# Behavioral Analysis Skill

## Context

This skill applies when:
- Analyzing MEP voting psychology and decision-making patterns under uncertainty
- Studying political group dynamics including conformity, groupthink, and dissent within EP political groups
- Identifying cognitive biases in legislative decision-making (anchoring on Commission proposals, status quo bias)
- Evaluating MEP leadership styles and their influence on committee and political group effectiveness
- Assessing rapporteur and shadow rapporteur negotiation behavior in trilogue contexts
- Understanding MEP career incentives: re-election motivation, national party loyalty vs. EP group cohesion
- Detecting strategic behavior: log-rolling, vote-trading, and strategic abstention in plenary
- Profiling MEP activity patterns using participation data (votes, questions, speeches, reports)

This skill integrates behavioral science with EP MCP Server data, aligned with [Hack23 ISMS](https://github.com/Hack23/ISMS-PUBLIC) data quality and privacy requirements.

## Rules

1. **Behavioral Evidence Base**: Ground psychological analysis in observable MEP behavior from MCP Server data — voting records, question frequency, report authorship, speech participation — not speculation about internal states
2. **Cognitive Bias Framework**: Apply established cognitive bias taxonomy (Kahneman & Tversky) to EP decision-making — anchoring (Commission proposal as reference point), availability heuristic (salient recent events), and framing effects (how policy options are presented)
3. **Group Dynamics Theory**: Use social psychology frameworks — Janis groupthink model, Tajfel social identity theory — to analyze political group cohesion and intergroup conflict in EP
4. **Principal-Agent Distinction**: Recognize MEPs as agents with multiple principals — EP political group, national party, constituency, and personal conviction — analyze which principal dominates under different conditions
5. **Leadership Typology**: Classify MEP leadership patterns using observable metrics — legislative output (reports), coalition-building (multi-group amendments), agenda-setting (questions, motions), and committee influence (chair/coordinator roles)
6. **Longitudinal Analysis**: Track behavioral changes over an MEP's career and across legislative terms — first-term vs. experienced MEP behavior differs systematically
7. **Cultural Context**: Account for national political culture effects on MEP behavior — consensual vs. adversarial traditions, attitudes toward EU integration, and negotiation styles
8. **Ethical Boundaries**: Analyze public behavioral patterns only — do not construct psychological profiles of individual MEPs beyond what is observable in public parliamentary data per [Hack23 Privacy Policy](https://github.com/Hack23/ISMS-PUBLIC)
9. **Statistical Validation**: Use appropriate statistical tests when claiming behavioral patterns — report significance levels and control for confounders
10. **Falsifiability**: Formulate behavioral hypotheses that can be tested against MCP Server data — avoid unfalsifiable claims about MEP motivations

## Examples

### MEP Activity Profile Analysis
```
Construct behavioral profiles from MCP Server data:

Dimensions (all from public EP data):
1. Legislative productivity: get-meps → count reports authored per term
2. Plenary engagement: voting participation rate from roll-call data
3. Scrutiny activity: get-documents → parliamentary questions filed
4. Coalition-building: cross-group amendment co-signatures
5. Specialization: committee assignment stability across terms

Cluster MEPs into behavioral types:
- "Legislators": High report output, committee-focused
- "Scrutinizers": High question volume, oversight-oriented
- "Networkers": High cross-group collaboration, bridge-builders
- "Loyalists": High group voting cohesion, low independent activity
```

### Groupthink Detection in Committee Voting
```
Indicators of groupthink in EP committee decisions:

1. Unanimity rate: percentage of committee votes with zero dissent
2. Amendment diversity: number of distinct positions in committee amendments
3. Expert consultation: frequency of external hearings before committee vote
4. Dissent tolerance: how dissenters are treated in subsequent rapporteur assignments

Using MCP Server tools:
- get-plenary-documents (committee reports with vote tallies)
- get-meps (committee membership and role assignments)
- Track committees with consistently high unanimity for groupthink risk
```

### Strategic Abstention Pattern Detection
```
Identify strategic abstention using EP MCP Server voting data:

Hypothesis: MEPs abstain strategically when caught between group and national party positions

Test methodology:
1. Calculate baseline abstention rate per MEP from all roll-call votes
2. Identify votes where national party and EP group positions diverge
3. Compare abstention rate on divergent votes vs. aligned votes
4. Control for vote salience and policy domain
5. Elevated abstention on divergent votes = evidence of strategic behavior

Data sources: roll-call vote results, political group voting recommendations
```

## Anti-Patterns

- **Armchair Psychology**: Do NOT assign psychological diagnoses or personality traits to MEPs — analyze observable behavioral patterns only, not internal mental states
- **Cultural Stereotyping**: Do NOT attribute MEP behavior to national stereotypes — "Italian MEPs are more expressive" is bias, not analysis; instead measure specific behavioral metrics
- **Ignoring Institutional Constraints**: Do NOT explain all behavior through psychology alone — EP rules of procedure, committee assignment mechanisms, and legislative procedures heavily constrain MEP behavior
- **Individual Anecdotes as Patterns**: Do NOT generalize from a single MEP's behavior to broader claims — ensure statistical samples are large enough to support behavioral conclusions
- **Correlation as Causation**: Do NOT assume that co-occurring behaviors are causally linked — an MEP who asks many questions and votes against their group may have different reasons for each behavior
- **Ignoring Selection Effects**: Do NOT ignore that MEPs are a self-selected population — they chose political careers and were nominated by parties, which creates baseline behavioral characteristics
- **Privacy Violations**: Do NOT extend behavioral analysis to MEPs' private lives, health status, or non-parliamentary activities — analysis must be strictly limited to public parliamentary records
