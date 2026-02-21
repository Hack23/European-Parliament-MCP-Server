---
name: intelligence-analysis-techniques
description: Structured analytic techniques including ACH, SWOT, Devil's Advocacy for EU parliamentary intelligence analysis
license: MIT
---

# Intelligence Analysis Techniques for EU Parliament

## Context

This skill applies when:
- Performing structured analysis of EU legislative outcomes and political dynamics
- Evaluating competing hypotheses about MEP voting behavior or political group strategy
- Conducting SWOT analysis of political group positioning in the European Parliament
- Applying Devil's Advocacy to challenge assumptions about EU policy trajectories
- Using structured analytic techniques to reduce cognitive bias in parliamentary analysis
- Forecasting legislative procedure outcomes (first reading, conciliation, rejection)
- Assessing political coalition feasibility for specific policy dossiers
- Analyzing trilogue negotiation dynamics between EP, Council, and Commission

This skill supports evidence-based analysis aligned with [Hack23 ISMS](https://github.com/Hack23/ISMS-PUBLIC) data integrity and quality requirements.

## Rules

1. **Apply Structured Techniques**: Use established analytic frameworks (ACH, SWOT, Key Assumptions Check, Indicators & Warnings) rather than intuitive judgment alone
2. **Evidence-Based Analysis**: Ground all analytical conclusions in verifiable data from the EP MCP Server — cite specific votes, documents, and procedures
3. **Hypothesis Pluralism**: Generate at least three competing hypotheses before evaluation — avoid anchoring on the first plausible explanation
4. **Cognitive Bias Mitigation**: Actively counter confirmation bias, availability heuristic, and mirror imaging when analyzing MEP motivations and political group strategies
5. **Distinguish Fact from Inference**: Clearly separate observed data (MEP voted "Yes" on dossier X) from analytical judgments (MEP supports policy direction Y)
6. **Confidence Levels**: Assign and communicate confidence levels (low/medium/high) with supporting rationale for all analytical assessments
7. **Temporal Framing**: Specify the time horizon of analysis — short-term (current plenary), medium-term (legislative term), long-term (institutional evolution)
8. **Document Analytical Process**: Record the technique used, evidence considered, alternatives evaluated, and reasoning chain per ISMS audit requirements
9. **Update Continuously**: Treat analysis as iterative — revise conclusions when new EP data becomes available through MCP Server queries
10. **Peer Review**: Subject significant analytical products to Devil's Advocacy or Red Team challenge before final assessment

## Examples

### Analysis of Competing Hypotheses (ACH) for Legislative Outcome
```
Dossier: EU AI Act (2021/0106(COD))

Hypotheses:
H1: EP will adopt a strong regulatory framework (comprehensive rules)
H2: EP will adopt a light-touch approach (industry self-regulation)
H3: EP will fragment — no majority for any coherent position

Evidence Matrix (from MCP Server data):
+----------------------------------+----+----+----+
| Evidence                         | H1 | H2 | H3 |
+----------------------------------+----+----+----+
| IMCO/LIBE joint committee vote   | ++ | -- | -  |
| EPP rapporteur position          | +  | +  | -  |
| S&D amendment pattern            | ++ | -- | -  |
| ECR/ID opposition amendments     | -  | ++ | +  |
| Renew bridging proposals         | +  | +  | -- |
| Plenary amendment voting splits  | +  | -  | +  |
+----------------------------------+----+----+----+

Assessment: H1 most consistent with evidence (High confidence)
Key diagnostic: Joint committee vote margin and amendment patterns
```

### SWOT Analysis for Political Group Strategy
```
Subject: Renew Europe Group — EP10 Strategic Position

Strengths:
- Centrist positioning enables coalition flexibility (EPP or S&D)
- Strong presence in key committees (ECON, ITRE)
- Data source: get-meps (group filter), committee membership records

Weaknesses:
- Internal ideological diversity (liberal vs. centrist tensions)
- Smaller delegation size limits rapporteur assignments
- Data source: voting cohesion analysis from plenary roll-calls

Opportunities:
- Kingmaker role when EPP-S&D grand coalition insufficient
- Growing influence on digital/tech policy where group has expertise
- Data source: get-procedures filtered by policy area

Threats:
- National delegation losses in next EP elections
- Squeeze between consolidating EPP and growing Greens/EFA
- Data source: historical trend analysis across EP terms
```

### Key Assumptions Check
```
Assumption: "The EPP-S&D grand coalition will continue to dominate EP decision-making"

Check against EP MCP Server data:
1. Calculate grand coalition voting alignment rate per legislative term
2. Identify policy areas where grand coalition breaks down
3. Measure frequency of alternative majorities (EPP+Renew+ECR)
4. Track political group size trends across EP6–EP10
5. Assess impact of new political group formations

Diagnostic indicators that assumption may be failing:
- Grand coalition alignment drops below 60% on key votes
- Three or more alternative majority coalitions form per session
- Combined EPP+S&D seat share falls below 50%
```

## Anti-Patterns

- **Technique Without Data**: Do NOT apply structured techniques as empty frameworks — each cell in an ACH matrix must reference verifiable EP data
- **Single Technique Reliance**: Do NOT rely on only one analytic method — combine ACH with Key Assumptions Check or SWOT to capture different analytical dimensions
- **Confirmation Bias in Evidence Selection**: Do NOT selectively include evidence that supports a preferred hypothesis — systematically query MCP Server for both supporting and disconfirming data
- **False Precision**: Do NOT assign precise probabilities to inherently uncertain political outcomes — use confidence bands and scenarios instead
- **Static Analysis**: Do NOT treat a one-time analysis as permanent — EU parliamentary dynamics shift with each plenary session, committee vote, and trilogue round
- **Ignoring Context**: Do NOT analyze EP votes in isolation from broader EU institutional dynamics — Council positions, Commission proposals, and national elections all influence EP behavior
- **Overcomplicating Simple Questions**: Do NOT apply heavyweight structured techniques when a straightforward data query answers the question — use the right level of analytical effort
