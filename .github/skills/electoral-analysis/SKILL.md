---
name: electoral-analysis
description: European election forecasting, campaign analysis, seat projection, and voter behavior analysis across EU member states
license: MIT
---

# Electoral Analysis Skill

## Context

This skill applies when:
- Forecasting European Parliament election outcomes across 27 member states
- Analyzing voter turnout patterns and demographic trends in EP elections
- Projecting seat distributions using national polling data and D'Hondt/Sainte-Laguë allocation methods
- Studying party list systems and their impact on MEP selection (open vs. closed lists)
- Comparing national party performance with transnational political group outcomes
- Evaluating the Spitzenkandidaten process and its effect on voter mobilization
- Assessing the impact of European electoral reforms (transnational lists, uniform electoral procedure proposals)
- Tracking party fragmentation and new party emergence across the EU

This skill leverages EP MCP Server data for historical election results and MEP composition, aligned with [Hack23 ISMS](https://github.com/Hack23/ISMS-PUBLIC) data integrity requirements.

## Rules

1. **Electoral System Diversity**: Recognize that 27 member states use different proportional representation variants — D'Hondt (most common), Sainte-Laguë (Scandinavian states), STV (Ireland), with varying thresholds (0%–5%) and constituency structures
2. **Seat Allocation Accuracy**: Apply the correct apportionment formula per member state when projecting seats — never assume a single method applies across the EU
3. **Turnout Contextualization**: Analyze EP election turnout (historically 42%–51%) relative to national election turnout — account for compulsory voting (Belgium, Luxembourg, Greece) and second-order election effects
4. **National vs. European Dynamics**: Distinguish between national political factors driving EP election results and genuine European-level campaign effects — most voters are influenced by domestic considerations
5. **Political Group Mapping**: Map national party results to EP political group compositions — a party winning seats nationally may join different groups across terms (e.g., Fidesz EPP→NI→Patriots)
6. **Degressive Proportionality**: Apply the EU's degressive proportionality principle (6–96 seats per state) when analyzing seat distribution fairness and representation ratios
7. **Historical Baselines**: Compare projections against historical EP election results (1979–2024) using MCP Server data — identify structural trends vs. one-off shifts
8. **Margin of Error**: Report projection uncertainty ranges — EP seat projections typically carry ±10–15 seat margins per political group due to aggregation of 27 national polls
9. **GDPR Compliance**: Handle voter demographic data and individual MEP electoral performance data in compliance with GDPR per [Hack23 Privacy Policy](https://github.com/Hack23/ISMS-PUBLIC)
10. **Attribution**: Cite European Parliament Open Data Portal, Eurostat, and national electoral commissions as authoritative data sources

## Examples

### Seat Projection Model
```
Using MCP Server historical data and current national polls:

1. Collect latest national polls for all 27 member states
2. Apply member state-specific seat allocation methods:
   - Germany (96 seats): D'Hondt, 5% threshold, closed lists
   - France (81 seats): D'Hondt, 5% threshold, closed lists
   - Ireland (14 seats): STV, multi-seat constituencies
3. Aggregate national projections into political group totals
4. Map: Use get_meps to identify current group affiliations
5. Compare: Historical composition via get_meps (term filter)
6. Report with confidence intervals per group

Expected output: EPP 175–190, S&D 135–150, Renew 75–90, etc.
```

### Turnout Pattern Analysis
```
Analyze EP election turnout trends using MCP Server data:

- Cross-reference MEP counts per state with electoral turnout data
- Identify correlation between turnout and political group representation
- Compare compulsory voting states (BE, LU, EL) vs. voluntary states
- Track youth turnout impact on Greens/EFA and new party representation
- Use get_meps with country filter for state-level composition analysis
```

### Party Fragmentation Assessment
```
Measure effective number of parties (ENP) across EP terms:

ENP = 1 / Σ(pi²)  where pi = seat share of party i

- Calculate ENP per member state delegation using get_meps data
- Track fragmentation trends: EP6 (2004) → EP10 (2024)
- Identify states with highest fragmentation driving group instability
- Correlate ENP with coalition formation difficulty in EP
```

## Anti-Patterns

- **Uniform Swing Assumption**: Do NOT apply a single polling swing uniformly across all member states — each state has unique electoral dynamics, thresholds, and list systems
- **Ignoring Electoral Thresholds**: Do NOT project seats without accounting for national thresholds — parties polling at 4% in a 5%-threshold state win zero seats despite showing national support
- **National Election Extrapolation**: Do NOT directly use national parliament election results to predict EP elections — EP elections are second-order with different turnout profiles and voter motivations
- **Static Group Affiliation**: Do NOT assume national parties will remain in the same EP political group — group switching is common after elections and can shift projected group sizes by 20+ seats
- **Ignoring Candidate Effects**: Do NOT treat EP elections as purely party-based in open-list or STV systems — individual candidate preference votes significantly affect who gets elected in Ireland, Italy, and Nordic states
- **Aggregate Without Decomposing**: Do NOT present EU-wide projections without showing the national-level building blocks — aggregation hides critical uncertainties in individual state projections
