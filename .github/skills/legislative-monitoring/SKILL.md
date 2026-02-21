---
name: legislative-monitoring
description: Voting pattern analysis, committee effectiveness, legislative procedure tracking for European Parliament oversight
license: MIT
---

# Legislative Monitoring Skill

## Context

This skill applies when:
- Tracking dossiers through the ordinary legislative procedure (Art. 294 TFEU) from Commission proposal to adoption
- Analyzing committee voting patterns and rapporteur effectiveness in shaping legislative outcomes
- Monitoring trilogue negotiations between EP, Council, and Commission on pending legislation
- Evaluating amendment success rates by political group, committee, and individual MEP
- Tracking legislative output metrics: time-to-adoption, first-reading agreement rates, conciliation frequency
- Comparing EP legislative priorities across terms by analyzing dossier volumes and policy domain distribution
- Assessing committee workload distribution and resource allocation across 20 standing committees
- Monitoring implementation follow-up: EP oversight of Commission delegated and implementing acts

This skill enables systematic legislative oversight using EP MCP Server data, aligned with [Hack23 ISMS](https://github.com/Hack23/ISMS-PUBLIC) data integrity and audit requirements.

## Rules

1. **Procedure Identification**: Always identify the applicable legislative procedure first (ordinary, consent, consultation, budget) — this determines EP's power and the relevant decision-making stages to monitor
2. **Stage-by-Stage Tracking**: Monitor each procedural stage separately — committee referral, committee vote, plenary first reading, Council position, second reading, conciliation — each stage has different dynamics
3. **Amendment Tracking**: Systematically track amendments from tabling through committee to plenary — amendment survival rates reveal where legislative power actually resides
4. **Voting Coalition Analysis**: Identify the majority coalition for each significant vote — grand coalition (EPP+S&D), centre-right (EPP+Renew+ECR), or progressive (S&D+Greens+Left) — different coalitions dominate different policy areas
5. **Committee Effectiveness Metrics**: Measure committee performance through objective indicators — percentage of committee position adopted by plenary, amendment adoption rates, dossier throughput, and inter-committee coordination (associated committees under Rule 57)
6. **Trilogue Transparency**: Monitor trilogue outcomes by comparing EP first-reading position with final adopted text — the EP Briefing database and conciliation committee reports provide key data points
7. **Rapporteur Influence Assessment**: Evaluate rapporteur effectiveness by comparing draft report provisions with final legislative text — control for political group size and committee power dynamics
8. **Temporal Benchmarking**: Compare legislative output across EP terms (EP5–EP10) — account for external factors (COVID, Ukraine war, enlargement) that affect legislative productivity
9. **Data Completeness**: Flag when MCP Server data may be incomplete for pending procedures — trilogue negotiations are partially confidential, and Council positions require cross-referencing external sources
10. **Audit Trail**: Maintain complete records of legislative monitoring queries and analytical methodology per ISMS audit requirements — document data sources, filters, and analytical assumptions

## Examples

### Dossier Lifecycle Tracking
```
Track a legislative dossier end-to-end using MCP Server tools:

1. Identify dossier: get-procedures (procedure reference, e.g., 2021/0106(COD))
2. Retrieve Commission proposal: get-documents (COM document type)
3. Monitor committee stage:
   - Identify lead committee and rapporteur: get-meps (committee filter)
   - Track committee amendments and vote: get-plenary-documents
4. Track plenary first reading:
   - Retrieve adopted amendments: get-plenary-documents (adopted texts)
   - Analyze voting results: roll-call vote data
5. Monitor Council position: (external source, cross-reference)
6. Track trilogue outcomes: get-procedures (procedure status updates)
7. Final adoption: get-plenary-documents (final adopted text)

Output: Timeline, key decision points, voting outcomes per stage
```

### Committee Voting Pattern Analysis
```
Analyze voting patterns in ENVI committee on climate legislation:

Methodology:
1. Identify ENVI climate dossiers: get-procedures (committee + policy filter)
2. Retrieve committee vote results: get-plenary-documents (committee reports)
3. Calculate per-group voting patterns on ENVI climate dossiers:
   - EPP support rate for ambitious climate targets
   - S&D-Greens alignment frequency
   - ECR/ID opposition consistency
4. Identify swing votes: which groups determine outcomes
5. Track pattern changes within EP10 term

Metrics:
- Group cohesion per committee vote (Agreement Index)
- Cross-group coalition frequency and composition
- Minority opinion frequency (Rule 55 dissent reports)
```

### Amendment Success Rate Analysis
```
Measure legislative influence through amendment tracking:

Using MCP Server data:
1. Count amendments tabled by political group per dossier
2. Track committee-stage adoption rates by group
3. Track plenary-stage adoption rates by group
4. Calculate survival rate: committee adoption → plenary adoption
5. Compare with EP-wide averages and historical baselines

Expected patterns:
- Rapporteur's group: highest adoption rate (60-80% in committee)
- Grand coalition groups: higher adoption in plenary
- Opposition groups: <20% adoption rate, mainly on technical amendments
- Committee coordinators: above-average success on compromise amendments
```

## Anti-Patterns

- **Counting Without Context**: Do NOT simply count adopted laws as a productivity metric — legislative significance varies enormously between major regulatory frameworks and minor technical amendments
- **Ignoring Trilogue Opacity**: Do NOT present trilogue outcomes as transparent EP decisions — much negotiation occurs behind closed doors, and final compromises may not reflect any single institution's original position
- **Committee Isolation**: Do NOT analyze committee votes without considering intercommittee dynamics — associated committees (Rule 57) and joint committee procedures create cross-committee dependencies
- **Rapporteur Overattribution**: Do NOT attribute legislative outcomes solely to the rapporteur — shadow rapporteurs, committee coordinators, and political group negotiators are equally important
- **First-Reading Agreement Bias**: Do NOT assume first-reading agreements represent EP strength — they may reflect EP concessions to avoid prolonged legislative processes, especially under time pressure
- **Ignoring Non-Legislative Resolutions**: Do NOT focus exclusively on legislative procedures — own-initiative reports, urgency resolutions, and consent procedures reveal additional dimensions of EP activity
- **Snapshot Analysis**: Do NOT assess legislative monitoring at a single point in time — procedures last months to years, and monitoring must track the entire lifecycle to capture meaningful dynamics
