---
name: risk-assessment-frameworks
description: Political risk indicators, institutional risk, democratic accountability assessment, and EU policy risk analysis frameworks
license: MIT
---

# Risk Assessment Frameworks Skill

## Context

This skill applies when:
- Assessing political risk indicators for EU legislative outcomes and institutional stability
- Evaluating democratic accountability gaps in European Parliament decision-making processes
- Analyzing coalition stability and fragmentation risk within and across EP political groups
- Measuring institutional risk: EP capacity to fulfill its legislative, budgetary, and oversight functions
- Conducting policy risk assessment for specific regulatory dossiers (compliance burden, implementation risk)
- Evaluating interinstitutional balance risk: EP power relative to Council and Commission
- Monitoring rule-of-law risk indicators and their impact on EP functioning (Article 7 procedures)
- Assessing governance risk in EP internal operations (transparency, lobbying, conflicts of interest)

This skill applies structured risk frameworks to EU parliamentary analysis, aligned with [Hack23 ISMS risk management practices](https://github.com/Hack23/ISMS-PUBLIC) and ISO 27001 risk assessment methodology.

## Rules

1. **Structured Risk Framework**: Apply systematic risk assessment methodology — identify risks, assess likelihood and impact, evaluate existing controls, and determine residual risk levels using consistent scales (Low/Medium/High/Critical)
2. **Risk Taxonomy**: Categorize EU parliamentary risks across distinct domains — political risk (coalition instability), legislative risk (procedure failure), institutional risk (capacity constraints), policy risk (implementation failure), and democratic risk (accountability gaps)
3. **Indicator-Based Assessment**: Define measurable risk indicators using EP MCP Server data — voting cohesion indices, amendment rejection rates, legislative pipeline metrics, and committee activity levels as proxies for institutional health
4. **Baseline Comparisons**: Assess risk against historical baselines from previous EP terms — risk is relative, and elevated indicators must be compared to normal operational ranges
5. **Leading vs. Lagging Indicators**: Distinguish between leading indicators (early warning: political group internal disagreements, committee scheduling delays) and lagging indicators (outcomes: failed votes, withdrawn dossiers)
6. **Scenario Analysis**: Develop multiple risk scenarios (baseline, adverse, severe) for political and legislative risk assessments — avoid single-point predictions
7. **Risk Interconnection**: Map dependencies between risk categories — political fragmentation risk increases legislative risk, which increases policy implementation risk; do not assess risks in isolation
8. **Proportionality**: Scale risk assessment effort to the significance of the decision — major regulatory frameworks warrant full risk assessment; routine technical dossiers need lighter review
9. **Transparency and Documentation**: Document risk assessment methodology, data sources, assumptions, and confidence levels per ISMS audit trail requirements
10. **Regular Review**: Treat risk assessments as living documents — update with each new MCP Server data refresh, particularly after significant political events (elections, group realignments, institutional crises)

## Examples

### Coalition Stability Risk Assessment
```
Risk: EP political group fragmentation undermining legislative majority formation

Risk Indicators (from MCP Server data):
+--------------------------------------+--------+-----------+
| Indicator                            | Source | Threshold |
+--------------------------------------+--------+-----------+
| Grand coalition voting alignment     | Roll-  | <55% =    |
|                                      | calls  | High Risk |
| Political group cohesion index       | Vote   | <0.7 =    |
| (Agreement Index per group)          | data   | Elevated  |
| Cross-group amendment co-sponsorship | Amend- | Declining |
| frequency                            | ments  | trend     |
| MEP group-switching frequency        | get-   | >10/year  |
| per term                             | meps   | = Warning |
| Minority opinion frequency in        | Comm.  | Rising    |
| committee reports                    | reports| trend     |
+--------------------------------------+--------+-----------+

Scenario Analysis:
- Baseline: Grand coalition holds on 65-70% of key votes
- Adverse: Fragmentation reduces alignment to 50-55%
- Severe: No stable majority; ad-hoc coalitions per dossier

Mitigation: Monitor get_meps group affiliations and voting data weekly
```

### Legislative Pipeline Risk Dashboard
```
Risk: Legislative backlog and procedure failure in EP committees

Assessment methodology using MCP Server tools:
1. Pipeline volume: track_legislation (active dossier count per committee)
2. Throughput: dossiers completed per session vs. historical average
3. Aging analysis: time since committee referral for pending dossiers
4. Bottleneck detection: committees with highest pending-to-completed ratio
5. Failure indicators: dossiers returned to committee, split votes, withdrawals

Risk Matrix:
+-----------------+----------+----------+----------+
| Committee       | Pipeline | Backlog  | Risk     |
|                 | Volume   | Ratio    | Level    |
+-----------------+----------+----------+----------+
| ENVI            | 45       | 1.8x     | High     |
| LIBE            | 38       | 1.5x     | Medium   |
| ECON            | 32       | 1.2x     | Low      |
| ITRE            | 28       | 1.1x     | Low      |
+-----------------+----------+----------+----------+

Trigger: Backlog ratio >1.5x historical average = escalate review
```

### Democratic Accountability Risk Assessment
```
Risk: Gaps in EP democratic accountability and transparency

Indicator Framework:
1. Transparency: Trilogue document publication rate, committee vote completeness
2. Participation: Plenary voting rates (get_meps), committee attendance
3. Oversight: Questions per MEP (get_parliamentary_questions), Commission response rates

Risk Levels:
- Green: All indicators within normal ranges
- Yellow: 1-2 indicators declining
- Orange: 3+ declining or 1 below critical threshold
- Red: Systemic accountability failure across multiple dimensions
```

## Anti-Patterns

- **Risk Theater**: Do NOT produce elaborate risk frameworks without connecting them to actionable data from MCP Server — risk assessment must be evidence-based, not performative
- **False Quantification**: Do NOT assign precise numerical probabilities to inherently political and uncertain events — use ordinal scales (Low/Medium/High) with clear definitions rather than fabricating percentages
- **Single-Point Prediction**: Do NOT present a single risk outcome as certain — always provide scenarios and acknowledge uncertainty ranges in political risk assessment
- **Ignoring Mitigation**: Do NOT assess risk without evaluating existing institutional controls — EP rules of procedure, committee structures, and interinstitutional agreements already mitigate many risks
- **Western Bias**: Do NOT apply risk frameworks developed for national parliaments without adapting to EU's unique supranational context — EP risk dynamics differ fundamentally from Westminster or presidential systems
- **Catastrophizing**: Do NOT overweight low-probability, high-impact scenarios at the expense of more likely moderate risks — political risk assessment must maintain proportionality
- **Static Assessment**: Do NOT treat risk assessments as final — EU parliamentary dynamics are inherently fluid, and risk levels change with each plenary session, election, and institutional development
