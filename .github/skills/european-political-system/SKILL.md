---
name: european-political-system
description: EU Parliament structure, political groups, electoral system, legislative procedures, and institutional relationships
license: MIT
---

# European Political System Skill

## Context

This skill applies when:
- Interpreting European Parliament institutional structure and decision-making procedures
- Understanding political group composition, ideology, and coalition dynamics
- Analyzing EU legislative procedures (ordinary, special, consent, consultation)
- Mapping the relationship between EP, Council of the EU, and European Commission
- Understanding the EP electoral system (proportional representation across 27 member states)
- Interpreting committee structures, roles, and powers within the EP
- Contextualizing MEP roles: rapporteur, shadow rapporteur, coordinator, committee chair
- Explaining EP powers: legislative co-decision, budgetary authority, executive oversight

This skill provides essential institutional context for all EP MCP Server tools and aligns with [Hack23 ISMS documentation standards](https://github.com/Hack23/ISMS-PUBLIC).

## Rules

1. **Institutional Accuracy**: Use correct EU institutional terminology — the European Parliament is not a national parliament; it has distinct powers, procedures, and constraints
2. **Treaty Basis**: Reference the Treaty on European Union (TEU) and Treaty on the Functioning of the European Union (TFEU) as the constitutional foundation for EP powers
3. **Political Group Primacy**: The political group (not national party) is the primary organizational unit in EP — groups control committee assignments, speaking time, rapporteur selection, and negotiating positions
4. **Legislative Procedure Awareness**: Identify which legislative procedure applies to each dossier — ordinary legislative procedure (Art. 294 TFEU) gives EP co-equal power; consultation and consent procedures give EP less influence
5. **Multi-Level Governance**: Recognize that EP operates within the EU's multi-level governance system — national governments (Council), supranational executive (Commission), and subnational actors all shape outcomes
6. **Electoral System Knowledge**: Understand that EP elections use proportional representation with member state-specific variations — D'Hondt, Sainte-Laguë, STV, and open/closed list systems across 27 states
7. **Current Composition**: Reference the current legislative term (EP10: 2024–2029) with 720 MEPs across political groups, while maintaining historical awareness of previous terms
8. **Committee System**: Recognize EP's 20 standing committees and subcommittees as the primary legislative workshops — most substantive legislative work occurs in committee before plenary
9. **Interinstitutional Dynamics**: Understand trilogue negotiations as the dominant method for reaching agreement between EP, Council, and Commission on legislative dossiers
10. **Spitzenkandidaten Process**: Understand the lead candidate process linking EP elections to Commission President selection, and its contested legitimacy

## Examples

### EP Political Groups (EP10, 2024–2029)
```
Group                        | Abbr  | Ideology               | Key National Parties
-----------------------------|-------|------------------------|---------------------
European People's Party      | EPP   | Centre-right, Christian| CDU/CSU (DE), LR (FR)
                             |       | democrat               | FI (IT), PP (ES)
Progressive Alliance of S&D | S&D   | Centre-left, Social    | SPD (DE), PS (FR)
                             |       | democrat               | PD (IT), PSOE (ES)
Renew Europe                 | RE    | Liberal, centrist      | Renaissance (FR)
                             |       |                        | VVD (NL), FDP (DE)
Greens/European Free Alliance| G/EFA | Green, regionalist     | Grüne (DE), EELV (FR)
European Conservatives &     | ECR   | Conservative,          | PiS (PL), FdI (IT)
Reformists                   |       | eurosceptic            | ODS (CZ)
Identity & Democracy         | ID    | Right-wing populist,   | RN (FR), Lega (IT)
                             |       | nationalist            |
The Left (GUE/NGL)           | LEFT  | Left-wing, socialist   | LFI (FR), Podemos (ES)
                             |       |                        | Syriza (EL)
Non-Inscrits                 | NI    | Unaffiliated           | Various
```

### Ordinary Legislative Procedure (Art. 294 TFEU)
```
MCP Server tools for tracking each stage:

1. Commission Proposal → search_documents (COM documents)
2. EP First Reading:
   - Committee stage → get_voting_records (committee reports)
   - Plenary vote → get_voting_records (adopted texts)
3. Council First Reading → (external: Council register)
4. EP Second Reading (if needed) → track_legislation (procedure status)
5. Conciliation Committee (if needed) → track_legislation
6. Third Reading → get_voting_records (joint text vote)

~85% of dossiers concluded at first reading via informal trilogues
```

### Committee Structure and Powers
```
Legislative committees relevant to MCP Server data:
- AFET (Foreign Affairs) — external policy, CFSP oversight
- BUDG (Budgets) — EU annual budget, MFF negotiations
- ECON (Economic & Monetary) — eurozone governance, financial regulation
- ENVI (Environment) — climate policy, public health, food safety
- ITRE (Industry & Research) — digital policy, energy, Horizon Europe
- IMCO (Internal Market) — single market, consumer protection
- LIBE (Civil Liberties) — fundamental rights, migration, data protection
- JURI (Legal Affairs) — legal basis, legislative quality

Use get_meps with committee filter to identify committee members
```

## Anti-Patterns

- **National Parliament Analogies**: Do NOT directly compare EP to national parliaments — EP lacks right of legislative initiative, has no government/opposition dynamic, and uses consensus-building rather than majoritarian logic
- **Party vs. Group Confusion**: Do NOT conflate national political parties with EP political groups — an EPP member from Sweden (Moderaterna) may vote differently from an EPP member from Hungary (Fidesz, formerly)
- **Ignoring Council**: Do NOT analyze EP legislative power without considering the Council's co-equal role in ordinary legislative procedure — EP cannot legislate alone
- **Eurosceptic Framing**: Do NOT treat eurosceptic groups as monolithic — ECR (reform-oriented) differs fundamentally from ID (nationalist) in objectives and methods
- **Static Institution**: Do NOT treat EP as unchanging — powers have expanded with each treaty (Maastricht, Amsterdam, Lisbon), political group composition shifts each term
- **Plenary-Centric View**: Do NOT focus exclusively on plenary votes — most legislative work happens in committees and trilogues, which are less visible but more consequential
- **Ignoring Non-Legislative Powers**: Do NOT overlook EP's oversight powers (Commission investiture, censure motion, discharge procedure) and budgetary authority alongside legislative role
