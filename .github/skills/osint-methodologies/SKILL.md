---
name: osint-methodologies
description: OSINT collection, source evaluation, data integration, and verification techniques for EU parliamentary intelligence
license: MIT
---

# OSINT Methodologies for EU Parliamentary Intelligence

## Context

This skill applies when:
- Collecting open-source intelligence from European Parliament public datasets
- Evaluating reliability of EU parliamentary data sources and cross-referencing records
- Integrating data from EP Open Data Portal with complementary EU institutional sources
- Verifying MEP activity claims against official parliamentary records
- Tracking legislative procedures across EP committees, plenary, and Council negotiations
- Building comprehensive MEP profiles from publicly available parliamentary data
- Monitoring political group dynamics using structured open-source collection
- Supporting transparency and accountability research on EU legislative processes

All OSINT activities must comply with [Hack23 ISMS policies](https://github.com/Hack23/ISMS-PUBLIC) including data protection, access control, and ethical data handling requirements.

## Rules

1. **Authoritative Sources First**: Always prioritize EP Open Data Portal (`data.europarl.europa.eu`) via the MCP Server as the primary source — supplement with EUR-Lex, Council Register, and Commission databases
2. **Source Evaluation (CRAAP)**: Assess each source for Currency, Relevance, Authority, Accuracy, and Purpose — EP official records score highest; media reporting requires corroboration
3. **Structured Collection Plan**: Define collection requirements before querying — specify target MEPs, time periods, policy areas, and political groups to avoid data overload
4. **Multi-Source Triangulation**: Verify findings across at least two independent sources — cross-reference MCP Server data with EP official website, VoteWatch Europe, and national parliament records
5. **Data Provenance Tracking**: Record the source, retrieval date, and API endpoint for every data point — maintain audit trails per ISMS requirements
6. **GDPR-Compliant Collection**: Only collect personal data with legal basis — MEP parliamentary activity is public, but private contact details and personal life data require GDPR justification
7. **Timeliness Classification**: Tag data with temporal validity — plenary votes are permanent record, committee compositions change each term, MEP contact details change frequently
8. **Minimize Collection Footprint**: Collect only data required for the analytical objective — avoid bulk harvesting of personal data beyond parliamentary functions
9. **Attribution and Transparency**: Always attribute data to its source; never present compiled OSINT as original analysis without citing underlying records
10. **Ethical Boundaries**: OSINT supports democratic transparency — never use parliamentary data for harassment, doxxing, or unauthorized surveillance of MEPs

## Examples

### EP Data Source Hierarchy
```
Tier 1 (Primary/Authoritative):
  - EP Open Data Portal API (via MCP Server tools: get_meps, get_voting_records, search_documents)
  - EUR-Lex (EU legislation full text)
  - EP Legislative Observatory (procedure tracking)

Tier 2 (Official/Complementary):
  - Council of the EU document register
  - European Commission consultations and impact assessments
  - EP Think Tank (EPRS) publications and briefings

Tier 3 (Structured Secondary):
  - VoteWatch Europe (processed voting data)
  - MEP personal websites and social media (declared positions)
  - National parliament records (pre-EP career data)

Tier 4 (Media/Unstructured):
  - EU-focused media (Politico Europe, EUobserver, Euractiv)
  - National media in MEP's home country
  - Academic publications and research papers
```

### MEP Activity Verification
```
To verify an MEP's claimed legislative activity:
1. Query MCP Server: get_meps with MEP identifier
2. Cross-reference with get_voting_records for votes and get_plenary_sessions for speeches
3. Check committee membership and rapporteur assignments
4. Verify attendance patterns against official EP attendance records
5. Compare self-reported activity with EP roll-call vote participation rate
6. Document discrepancies with source citations and timestamps
```

### Legislative Procedure Tracking
```
Track EU legislative dossier through institutional lifecycle:
1. Use track_legislation to identify the dossier reference (e.g., 2023/0079(COD))
2. Map committee responsible and committees for opinion
3. Track amendments: committee stage → plenary stage → trilogue
4. Cross-reference Council general approach with EP position
5. Monitor conciliation committee outcomes if applicable
6. Record all data points with EP Open Data Portal provenance
```

## Anti-Patterns

- **Single Source Reliance**: Do NOT base conclusions on a single data source — even EP official data may have delays, errors, or incomplete records
- **Bulk Personal Data Collection**: Do NOT harvest MEP personal data beyond what is necessary for parliamentary accountability analysis — this violates GDPR and ISMS policies
- **Unverified Attribution**: Do NOT attribute positions to MEPs based solely on political group membership — verify individual voting records and stated positions
- **Ignoring Data Staleness**: Do NOT treat cached or historical data as current — always check retrieval timestamps and data freshness, especially for committee compositions
- **Conflating Public and Private**: Do NOT mix MEP's official parliamentary activity (public OSINT) with private life information — maintain strict boundaries
- **Over-Collection**: Do NOT collect data "just in case" — follow the collection plan and minimize data retention per GDPR data minimization principles
- **Ignoring Source Bias**: Do NOT treat all sources as equivalent — media reports have editorial bias, advocacy organizations have policy agendas, and even official records may reflect institutional framing
