---
name: data-science-for-intelligence
description: Statistical analysis, ML, NLP, time series, and network analysis for European Parliament political data
license: MIT
---

# Data Science for Parliamentary Intelligence

## Context

This skill applies when:
- Performing statistical analysis of MEP voting patterns using EP MCP Server data
- Applying NLP techniques to EU legislative texts, parliamentary questions, and committee reports
- Building network models of political group alliances and MEP collaboration patterns
- Conducting time series analysis of voting cohesion, attendance, and legislative productivity
- Using dimensionality reduction to map MEP ideological positions from roll-call votes
- Clustering MEPs by policy area specialization and voting behavior
- Forecasting legislative outcomes based on committee vote patterns and amendment analysis
- Detecting anomalies in MEP activity patterns (unusual voting, attendance drops)

All data science activities must comply with [Hack23 ISMS policies](https://github.com/Hack23/ISMS-PUBLIC) for data integrity, GDPR-compliant processing, and reproducible analysis.

## Rules

1. **Data Quality First**: Validate all EP MCP Server data before analysis — check for missing values, encoding issues in multilingual text, and temporal gaps in voting records
2. **Appropriate Methods**: Match analytical technique to data type — nominal (political group), ordinal (agreement scale), interval (vote margins), network (co-sponsorship)
3. **Reproducibility**: Document all data transformations, model parameters, and analytical decisions — analysis must be reproducible from MCP Server queries
4. **Statistical Rigor**: Report effect sizes, confidence intervals, and p-values — avoid p-hacking by pre-registering hypotheses before querying EP data
5. **GDPR-Aware Processing**: When analyzing MEP personal data, apply data minimization — aggregate where possible, pseudonymize when individual tracking is not analytically necessary
6. **Bias Awareness**: Account for selection bias in roll-call votes (only ~30% of EP votes are roll-call), survivorship bias (only re-elected MEPs span terms), and measurement bias (attendance ≠ engagement)
7. **Domain Validation**: Validate statistical findings against political science domain knowledge — a statistically significant pattern must also be institutionally plausible
8. **Scalable Pipelines**: Design analysis pipelines that can process data across legislative terms (EP5–EP10) and scale to 720+ MEPs per term
9. **Visualization Standards**: Use clear, accessible visualizations — label axes, include legends, use colorblind-safe palettes, and annotate key political events on time series
10. **Ethical AI**: If applying ML models to MEP behavior prediction, disclose model limitations, avoid deterministic predictions about individual MEPs, and never use models for discriminatory profiling

## Examples

### Ideological Scaling with PCA/MDS
```python
# Map MEP positions from roll-call vote data (conceptual pipeline)
# Data source: EP MCP Server → get_voting_records (vote results)

1. Construct vote matrix: MEPs (rows) × roll-call votes (columns)
   - Values: +1 (Yes), -1 (No), 0 (Abstain), NaN (Absent)
   
2. Handle missing data: impute or filter MEPs with <50% participation

3. Apply dimensionality reduction:
   - PCA: First component ≈ left-right dimension
   - Second component ≈ pro-/anti-EU integration dimension
   
4. Validate: Check that political groups cluster as expected
   - LEFT/G-EFA on left, EPP/ECR/ID on right
   - Pro-EU (S&D, RE, EPP) vs. eurosceptic (ECR, ID) on second axis

5. Visualize: 2D scatter plot with political group coloring
   - Compare across legislative terms for ideological drift
```

### NLP Analysis of Legislative Texts
```
Pipeline for analyzing EP legislative amendments:
Data source: EP MCP Server → search_documents, track_legislation

1. Text Extraction: Parse legislative amendment texts (24 languages)
2. Language Detection: Identify primary language, align translations
3. Topic Modeling (LDA/BERTopic):
   - Discover policy themes across committee reports
   - Track topic prevalence over time
4. Sentiment/Framing Analysis:
   - Classify amendment tone (restrictive vs. permissive)
   - Detect regulatory framing (precautionary vs. innovation-friendly)
5. Similarity Analysis:
   - Identify duplicate/similar amendments across political groups
   - Detect coordinated amendment strategies
```

### Network Analysis of Political Collaboration
```
Build MEP collaboration networks from EP MCP Server data:

Nodes: MEPs (attributes: country, political group, committee)
Edges: Co-sponsorship, co-rapporteurship, shared amendments

Metrics to compute:
- Degree centrality: Most connected MEPs (cross-group bridges)
- Betweenness centrality: MEPs bridging political groups
- Community detection: Identify voting blocs beyond formal groups
- Assortativity: Do MEPs collaborate within or across national lines?

Data sources:
- get_meps: Node attributes (country, group, committee membership)
- get_voting_records: Co-sponsorship and amendment data
- track_legislation: Rapporteur and shadow rapporteur pairs
```

### Time Series Analysis of Legislative Productivity
```
Track EP legislative output over time:

Metrics:
- Dossiers completed per plenary session
- Average time from Commission proposal to EP first reading
- Amendment volume per committee per session
- Voting cohesion index per political group over time

Techniques:
- Seasonal decomposition (plenary session calendar effects)
- Change point detection (new legislative term, leadership change)
- Granger causality (do committee votes predict plenary outcomes?)

Data: EP MCP Server → track_legislation, get_voting_records
```

## Anti-Patterns

- **Black Box Models**: Do NOT apply complex ML models without interpretability — political scientists and policymakers need to understand why a model predicts a particular legislative outcome
- **Ignoring Data Provenance**: Do NOT skip data validation — EP API data may contain missing votes, encoding errors in non-Latin scripts, or temporal discontinuities between API versions
- **Overfitting to Single Term**: Do NOT train models on a single EP term and generalize — political dynamics shift significantly between terms due to elections, enlargement, and treaty changes
- **Ignoring Institutional Rules**: Do NOT apply generic clustering without accounting for EP's formal structure — political groups and committees create non-random patterns that are institutional, not behavioral
- **False Causation**: Do NOT infer causal relationships from correlational voting data — MEPs voting similarly may reflect group discipline, not genuine agreement
- **Neglecting Uncertainty**: Do NOT present point estimates without uncertainty quantification — always include confidence intervals, especially for small national delegations
- **Privacy Violations**: Do NOT build individual MEP behavioral profiles that combine parliamentary data with personal data without GDPR legal basis and data protection impact assessment
