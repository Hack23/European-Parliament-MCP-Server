# API Usage Guide

<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="128" height="128">
</p>

<h1 align="center">European Parliament MCP Server - API Usage Guide</h1>

<p align="center">
  <strong>Comprehensive guide to using all 16 MCP tools</strong><br>
  <em>Real-world examples, best practices, and query patterns</em>
</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Reference](#quick-reference)
- [Tool Documentation](#tool-documentation)
  - [get_meps](#tool-get_meps)
  - [get_mep_details](#tool-get_mep_details)
  - [get_plenary_sessions](#tool-get_plenary_sessions)
  - [get_voting_records](#tool-get_voting_records)
  - [search_documents](#tool-search_documents)
  - [get_committee_info](#tool-get_committee_info)
  - [get_parliamentary_questions](#tool-get_parliamentary_questions)
  - [analyze_voting_patterns](#tool-analyze_voting_patterns)
  - [track_legislation](#tool-track_legislation)
  - [generate_report](#tool-generate_report)
- [OSINT Intelligence Tools](#osint-intelligence-tools)
  - [assess_mep_influence](#tool-assess_mep_influence)
  - [analyze_coalition_dynamics](#tool-analyze_coalition_dynamics)
  - [detect_voting_anomalies](#tool-detect_voting_anomalies)
  - [compare_political_groups](#tool-compare_political_groups)
  - [analyze_legislative_effectiveness](#tool-analyze_legislative_effectiveness)
  - [monitor_legislative_pipeline](#tool-monitor_legislative_pipeline)
  - [analyze_committee_activity](#tool-analyze_committee_activity)
  - [track_mep_attendance](#tool-track_mep_attendance)
  - [analyze_country_delegation](#tool-analyze_country_delegation)
  - [generate_political_landscape](#tool-generate_political_landscape)
- [MCP Prompts](#mcp-prompts)
- [MCP Resources](#mcp-resources)
- [Common Use Cases](#common-use-cases)
- [Best Practices](#best-practices)
- [Error Handling](#error-handling)

---

## 🎯 Overview

The European Parliament MCP Server provides 16 specialized tools for accessing parliamentary data through the Model Context Protocol — including 10 core data tools and 6 OSINT intelligence tools. Each tool is designed for specific data queries with input validation, caching, and rate limiting.

### Key Features

- **Type Safety**: All inputs validated with Zod schemas
- **Performance**: <200ms cached response times
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **GDPR Compliance**: Privacy-first data handling
- **MCP Standard**: Full compliance with MCP specification

### Authentication

Currently, the server does **not require authentication** for tool access. Future versions may introduce OAuth 2.0 or API key authentication.

---

## 🔍 Quick Reference

| Tool | Purpose | Key Parameters | Response Type |
|------|---------|----------------|---------------|
| `get_meps` | List MEPs | country, group, committee | Paginated list |
| `get_mep_details` | MEP details | id | Single object |
| `get_plenary_sessions` | List sessions | dateFrom, dateTo | Paginated list |
| `get_voting_records` | Voting data | mepId, dateFrom | Paginated list |
| `search_documents` | Find documents | keywords, docType | Paginated list |
| `get_committee_info` | Committee data | id, abbreviation | Single object |
| `get_parliamentary_questions` | Q&A data | author, dateFrom | Paginated list |
| `analyze_voting_patterns` | Voting analysis | mepId, dateFrom | Analysis object |
| `track_legislation` | Track procedure | procedureId | Procedure object |
| `generate_report` | Create reports | reportType, subjectId | Report object |

### 🕵️ OSINT Intelligence Tools

| Tool | Purpose | Key Parameters | Response Type |
|------|---------|----------------|---------------|
| `assess_mep_influence` | MEP influence scoring | mepId | Influence scorecard |
| `analyze_coalition_dynamics` | Coalition cohesion analysis | politicalGroups, dateFrom | Coalition metrics |
| `detect_voting_anomalies` | Anomaly detection | mepId, politicalGroup | Anomaly report |
| `compare_political_groups` | Cross-group comparison | groups, metrics | Comparison matrix |
| `analyze_legislative_effectiveness` | Legislative scoring | subjectId, subjectType | Effectiveness score |
| `monitor_legislative_pipeline` | Pipeline monitoring | committeeId, status | Pipeline status |
| `analyze_committee_activity` | Committee workload & engagement | committeeId (required) | Activity report |
| `track_mep_attendance` | MEP attendance patterns | mepId (required) | Attendance report |
| `analyze_country_delegation` | Country delegation analysis | country (required) | Delegation analysis |
| `generate_political_landscape` | Parliament-wide landscape | dateFrom, dateTo | Landscape overview |

---

## 📚 Tool Documentation

### Tool: get_meps

**Description**: Retrieve Members of the European Parliament with optional filters for country, political group, committee membership, and active status.

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| country | string | No | - | ISO 3166-1 alpha-2 country code (e.g., "SE", "FR", "DE") |
| group | string | No | - | Political group identifier (e.g., "EPP", "S&D", "Greens/EFA") |
| committee | string | No | - | Committee identifier (e.g., "ENVI", "AGRI") |
| active | boolean | No | true | Filter by active status |
| limit | number | No | 50 | Maximum results (1-100) |
| offset | number | No | 0 | Pagination offset |

#### Response Format

```json
{
  "content": [{
    "type": "text",
    "text": "{
      \"data\": [
        {
          \"id\": \"MEP-124810\",
          \"name\": \"Anna Lindberg\",
          \"country\": \"SE\",
          \"politicalGroup\": \"S&D\",
          \"committees\": [\"ENVI\", \"AGRI\"],
          \"email\": \"anna.lindberg@europarl.europa.eu\"
        }
      ],
      \"total\": 1,
      \"limit\": 50,
      \"offset\": 0
    }"
  }]
}
```

#### Example Usage

**Claude Desktop - Natural Language:**
```
Get me a list of Swedish MEPs in the S&D political group
```

**VS Code/MCP Client - TypeScript:**
```typescript
const result = await client.callTool('get_meps', {
  country: 'SE',
  group: 'S&D',
  limit: 20
});

const response = JSON.parse(result.content[0].text);
console.log(`Found ${response.total} Swedish S&D MEPs`);
```

**Python MCP Client:**
```python
result = await client.call_tool('get_meps', {
    'country': 'SE',
    'group': 'S&D',
    'limit': 20
})

data = json.loads(result['content'][0]['text'])
print(f"Found {data['total']} Swedish S&D MEPs")
```

#### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `ValidationError: country` | Invalid country code format | Use 2-letter ISO code (e.g., "SE" not "Sweden") |
| `RateLimitError` | Too many requests | Wait 15 minutes or implement request throttling |
| `APIError: 500` | European Parliament API down | Check EP API status, implement retry logic |

#### Use Cases

1. **Find MEPs by Country**: Filter by country code to get national delegation
2. **Political Group Analysis**: List all members of a specific political group
3. **Committee Membership**: Find MEPs serving on specific committees
4. **Pagination**: Use `limit` and `offset` for large result sets

---

### Tool: get_mep_details

**Description**: Retrieve comprehensive information about a specific MEP including biography, contact details, committee memberships, and voting statistics.

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| id | string | Yes | - | MEP identifier (e.g., "MEP-124810") |

#### Response Format

```json
{
  "content": [{
    "type": "text",
    "text": "{
      \"id\": \"MEP-124810\",
      \"name\": \"Anna Lindberg\",
      \"country\": \"SE\",
      \"politicalGroup\": \"S&D\",
      \"committees\": [\"ENVI\", \"AGRI\"],
      \"email\": \"anna.lindberg@europarl.europa.eu\",
      \"biography\": \"Anna Lindberg has been an MEP since 2019...\",
      \"votingStatistics\": {
        \"totalVotes\": 1250,
        \"votesFor\": 850,
        \"votesAgainst\": 200,
        \"abstentions\": 200,
        \"attendanceRate\": 92.5
      }
    }"
  }]
}
```

#### Example Usage

**Claude Desktop:**
```
Get detailed information about MEP with ID MEP-124810
```

**TypeScript:**
```typescript
const result = await client.callTool('get_mep_details', {
  id: 'MEP-124810'
});

const mep = JSON.parse(result.content[0].text);
console.log(`${mep.name} from ${mep.country}`);
console.log(`Attendance: ${mep.votingStatistics.attendanceRate}%`);
```

#### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `ValidationError: id required` | Missing ID parameter | Provide MEP ID (get from get_meps) |
| `NotFoundError` | Invalid MEP ID | Verify ID exists in get_meps results |
| `ValidationError: id format` | Empty or invalid ID format | Use non-empty string ID |

#### Use Cases

1. **MEP Profile**: Get complete MEP information for profile pages
2. **Voting Analysis**: Access voting statistics for analysis
3. **Contact Information**: Retrieve email and office details
4. **Committee Work**: View committee assignments

---

### Tool: get_plenary_sessions

**Description**: Retrieve European Parliament plenary sessions with optional date range filtering.

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| dateFrom | string | No | - | Start date (YYYY-MM-DD format) |
| dateTo | string | No | - | End date (YYYY-MM-DD format) |
| limit | number | No | 50 | Maximum results (1-100) |
| offset | number | No | 0 | Pagination offset |

#### Response Format

```json
{
  "content": [{
    "type": "text",
    "text": "{
      \"data\": [
        {
          \"id\": \"PLENARY-2024-05\",
          \"date\": \"2024-05-15\",
          \"location\": \"Strasbourg\",
          \"agenda\": \"Climate change debate, budget vote\",
          \"documents\": [\"DOC-2024-001\", \"DOC-2024-002\"]
        }
      ],
      \"total\": 12,
      \"limit\": 50,
      \"offset\": 0
    }"
  }]
}
```

#### Example Usage

**Claude Desktop:**
```
Show me plenary sessions from January to March 2024
```

**TypeScript:**
```typescript
const result = await client.callTool('get_plenary_sessions', {
  dateFrom: '2024-01-01',
  dateTo: '2024-03-31',
  limit: 20
});

const sessions = JSON.parse(result.content[0].text);
console.log(`Found ${sessions.data.length} sessions`);
```

#### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `ValidationError: dateFrom` | Invalid date format | Use YYYY-MM-DD format |
| `ValidationError: dateTo before dateFrom` | Date range invalid | Ensure dateTo >= dateFrom |

#### Use Cases

1. **Session Calendar**: List upcoming plenary sessions
2. **Historical Analysis**: Query past sessions by date range
3. **Document Tracking**: Access session documents and agendas

---

### Tool: get_voting_records

**Description**: Retrieve voting records with filters for MEP, session, topic, and date range.

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| mepId | string | No | - | Filter by specific MEP |
| sessionId | string | No | - | Filter by plenary session |
| topic | string | No | - | Filter by topic/keyword |
| dateFrom | string | No | - | Start date (YYYY-MM-DD) |
| dateTo | string | No | - | End date (YYYY-MM-DD) |
| limit | number | No | 50 | Maximum results (1-100) |
| offset | number | No | 0 | Pagination offset |

#### Response Format

```json
{
  "content": [{
    "type": "text",
    "text": "{
      \"data\": [
        {
          \"voteId\": \"VOTE-2024-001\",
          \"sessionId\": \"PLENARY-2024-05\",
          \"date\": \"2024-05-15\",
          \"subject\": \"Climate Action Directive\",
          \"mepVote\": \"FOR\",
          \"result\": \"ADOPTED\",
          \"votesFor\": 450,
          \"votesAgainst\": 120,
          \"abstentions\": 30
        }
      ],
      \"total\": 1250,
      \"limit\": 50,
      \"offset\": 0
    }"
  }]
}
```

#### Example Usage

**Claude Desktop:**
```
Show voting records for MEP-124810 on climate topics from 2024
```

**TypeScript:**
```typescript
const result = await client.callTool('get_voting_records', {
  mepId: 'MEP-124810',
  topic: 'climate',
  dateFrom: '2024-01-01',
  limit: 100
});
```

#### Use Cases

1. **MEP Accountability**: Track how specific MEPs vote
2. **Topic Analysis**: Find all votes on specific topics
3. **Session Votes**: Get all votes from a plenary session

---

### Tool: search_documents

**Description**: Search European Parliament legislative documents with keyword and type filters.

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| keywords | string | Yes | - | Search keywords (alphanumeric, spaces, hyphens) |
| docType | string | No | - | Document type (REPORT, AMENDMENT, PROPOSAL, etc.) |
| dateFrom | string | No | - | Start date (YYYY-MM-DD) |
| dateTo | string | No | - | End date (YYYY-MM-DD) |
| author | string | No | - | Filter by author/rapporteur |
| limit | number | No | 50 | Maximum results (1-100) |
| offset | number | No | 0 | Pagination offset |

#### Response Format

```json
{
  "content": [{
    "type": "text",
    "text": "{
      \"data\": [
        {
          \"id\": \"A9-0123/2024\",
          \"title\": \"Report on Climate Action Directive\",
          \"type\": \"REPORT\",
          \"author\": \"MEP-124810\",
          \"date\": \"2024-05-10\",
          \"committee\": \"ENVI\",
          \"summary\": \"Report on proposed climate legislation...\"
        }
      ],
      \"total\": 45,
      \"limit\": 50,
      \"offset\": 0
    }"
  }]
}
```

#### Example Usage

**Claude Desktop:**
```
Search for documents about renewable energy from the ENVI committee
```

**TypeScript:**
```typescript
const result = await client.callTool('search_documents', {
  keywords: 'renewable energy',
  docType: 'REPORT',
  dateFrom: '2024-01-01',
  limit: 25
});
```

#### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `ValidationError: keywords` | Invalid characters | Use only alphanumeric, spaces, hyphens |
| `ValidationError: keywords required` | Missing keywords | Provide search terms |

#### Use Cases

1. **Legislative Research**: Find documents on specific topics
2. **Committee Work**: Search documents by committee
3. **Author Tracking**: Find documents by specific MEP

---

### Tool: get_committee_info

**Description**: Retrieve detailed information about a European Parliament committee including composition, members, chair, and areas of responsibility.

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| id | string | No* | - | Committee identifier |
| abbreviation | string | No* | - | Committee abbreviation (e.g., "ENVI", "AGRI") |

*At least one parameter required

#### Response Format

```json
{
  "content": [{
    "type": "text",
    "text": "{
      \"id\": \"COMM-ENVI\",
      \"name\": \"Committee on Environment, Public Health and Food Safety\",
      \"abbreviation\": \"ENVI\",
      \"chair\": \"MEP-124820\",
      \"viceChairs\": [\"MEP-124821\", \"MEP-124822\"],
      \"members\": [\"MEP-124810\", \"MEP-124811\"],
      \"responsibilities\": [
        \"Environmental policy\",
        \"Public health\",
        \"Food safety\"
      ]
    }"
  }]
}
```

#### Example Usage

**Claude Desktop:**
```
Get information about the ENVI committee
```

**TypeScript:**
```typescript
const result = await client.callTool('get_committee_info', {
  abbreviation: 'ENVI'
});

const committee = JSON.parse(result.content[0].text);
console.log(`${committee.name} has ${committee.members.length} members`);
```

#### Use Cases

1. **Committee Overview**: Get committee structure and leadership
2. **Member Lookup**: Find MEPs serving on specific committees
3. **Responsibility Mapping**: Understand committee jurisdictions

---

### Tool: get_parliamentary_questions

**Description**: Retrieve parliamentary questions (written and oral) with filters for author, topic, and date range.

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| author | string | No | - | Question author MEP ID |
| topic | string | No | - | Question topic/keyword |
| questionType | string | No | - | Type: WRITTEN or ORAL |
| dateFrom | string | No | - | Start date (YYYY-MM-DD) |
| dateTo | string | No | - | End date (YYYY-MM-DD) |
| answered | boolean | No | - | Filter by answered status |
| limit | number | No | 50 | Maximum results (1-100) |
| offset | number | No | 0 | Pagination offset |

#### Response Format

```json
{
  "content": [{
    "type": "text",
    "text": "{
      \"data\": [
        {
          \"questionId\": \"Q-2024-001\",
          \"author\": \"MEP-124810\",
          \"type\": \"WRITTEN\",
          \"subject\": \"Climate change adaptation funding\",
          \"question\": \"What measures is the Commission taking...\",
          \"date\": \"2024-03-15\",
          \"answered\": true,
          \"answerDate\": \"2024-04-10\",
          \"answer\": \"The Commission has allocated...\"
        }
      ],
      \"total\": 328,
      \"limit\": 50,
      \"offset\": 0
    }"
  }]
}
```

#### Example Usage

**Claude Desktop:**
```
Show me written questions about climate change from 2024
```

**TypeScript:**
```typescript
const result = await client.callTool('get_parliamentary_questions', {
  topic: 'climate change',
  questionType: 'WRITTEN',
  dateFrom: '2024-01-01',
  answered: true,
  limit: 50
});
```

#### Use Cases

1. **MEP Accountability**: Track questions from specific MEPs
2. **Topic Research**: Find questions on specific policy areas
3. **Answer Monitoring**: Check if questions have been answered

---

### Tool: analyze_voting_patterns

**Description**: Analyze MEP voting behavior including political group alignment, cross-party voting, attendance rates, and topic-based voting patterns.

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| mepId | string | Yes | - | MEP identifier to analyze |
| dateFrom | string | No | - | Analysis start date (YYYY-MM-DD) |
| dateTo | string | No | - | Analysis end date (YYYY-MM-DD) |
| compareWithGroup | boolean | No | true | Compare with political group average |

#### Response Format

```json
{
  "content": [{
    "type": "text",
    "text": "{
      \"mepId\": \"MEP-124810\",
      \"mepName\": \"Anna Lindberg\",
      \"period\": {
        \"from\": \"2024-01-01\",
        \"to\": \"2024-12-31\"
      },
      \"statistics\": {
        \"totalVotes\": 1250,
        \"votesFor\": 850,
        \"votesAgainst\": 200,
        \"abstentions\": 200,
        \"attendanceRate\": 92.5
      },
      \"groupAlignment\": {
        \"politicalGroup\": \"S&D\",
        \"alignmentRate\": 87.5,
        \"divergentVotes\": 156
      },
      \"topTopics\": [
        { \"topic\": \"Climate Change\", \"voteCount\": 45 },
        { \"topic\": \"Agriculture Policy\", \"voteCount\": 38 }
      ],
      \"crossPartyVoting\": {
        \"withOtherGroups\": 125,
        \"rate\": 10.0
      }
    }"
  }]
}
```

#### Example Usage

**Claude Desktop:**
```
Analyze voting patterns for MEP-124810 in 2024, compare with their political group
```

**TypeScript:**
```typescript
const result = await client.callTool('analyze_voting_patterns', {
  mepId: 'MEP-124810',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31',
  compareWithGroup: true
});

const analysis = JSON.parse(result.content[0].text);
console.log(`Attendance: ${analysis.statistics.attendanceRate}%`);
console.log(`Group alignment: ${analysis.groupAlignment.alignmentRate}%`);
```

#### Use Cases

1. **MEP Performance**: Analyze attendance and voting activity
2. **Political Alignment**: Compare MEP votes with party line
3. **Cross-Party Analysis**: Identify bipartisan voting patterns
4. **Topic Focus**: Discover MEP's key policy areas

---

### Tool: track_legislation

**Description**: Track European Parliament legislative procedure progress including status, timeline, committees, amendments, and voting records.

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| procedureId | string | Yes | - | Legislative procedure identifier (e.g., "2024/0001(COD)") |

#### Response Format

```json
{
  "content": [{
    "type": "text",
    "text": "{
      \"procedureId\": \"2024/0001(COD)\",
      \"title\": \"Climate Action and Renewable Energy Directive\",
      \"type\": \"Ordinary legislative procedure (COD)\",
      \"status\": \"PLENARY\",
      \"currentStage\": \"Awaiting plenary vote\",
      \"timeline\": [
        {
          \"date\": \"2024-01-15\",
          \"stage\": \"Commission Proposal\",
          \"description\": \"Legislative proposal submitted\"
        }
      ],
      \"committees\": [
        {
          \"abbreviation\": \"ENVI\",
          \"role\": \"LEAD\",
          \"rapporteur\": \"MEP-124810\"
        }
      ],
      \"amendments\": {
        \"proposed\": 156,
        \"adopted\": 89,
        \"rejected\": 67
      },
      \"voting\": [...],
      \"documents\": [...],
      \"nextSteps\": [
        \"Plenary debate scheduled for 2024-06-15\"
      ]
    }"
  }]
}
```

#### Example Usage

**Claude Desktop:**
```
Track the progress of legislative procedure 2024/0001(COD)
```

**TypeScript:**
```typescript
const result = await client.callTool('track_legislation', {
  procedureId: '2024/0001(COD)'
});

const procedure = JSON.parse(result.content[0].text);
console.log(`Status: ${procedure.status}`);
console.log(`Current stage: ${procedure.currentStage}`);
console.log(`Next: ${procedure.nextSteps[0]}`);
```

#### Use Cases

1. **Legislation Monitoring**: Track bill progress through Parliament
2. **Timeline Analysis**: View complete legislative timeline
3. **Amendment Tracking**: Monitor proposed and adopted amendments
4. **Committee Work**: See committee assignments and rapporteurs

---

### Tool: generate_report

**Description**: Generate comprehensive analytical reports on European Parliament data. Supports four report types: MEP activity, committee performance, voting statistics, and legislation progress.

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| reportType | string | Yes | - | Report type: MEP_ACTIVITY, COMMITTEE_PERFORMANCE, VOTING_STATISTICS, LEGISLATION_PROGRESS |
| subjectId | string | No | - | Subject identifier (MEP ID, Committee ID) - optional for aggregate reports |
| dateFrom | string | No | - | Report period start (YYYY-MM-DD) |
| dateTo | string | No | - | Report period end (YYYY-MM-DD) |

#### Response Format

```json
{
  "content": [{
    "type": "text",
    "text": "{
      \"reportType\": \"MEP_ACTIVITY\",
      \"subject\": \"Anna Lindberg\",
      \"period\": {
        \"from\": \"2024-01-01\",
        \"to\": \"2024-12-31\"
      },
      \"generatedAt\": \"2024-12-31T23:59:59Z\",
      \"summary\": \"Activity report for Anna Lindberg...\",
      \"sections\": [
        {
          \"title\": \"Voting Activity\",
          \"content\": \"Participated in 1250 votes...\"
        }
      ],
      \"statistics\": {
        \"totalVotes\": 1250,
        \"attendanceRate\": 92.5,
        \"questionsSubmitted\": 28
      },
      \"recommendations\": [
        \"Continue active participation...\"
      ]
    }"
  }]
}
```

#### Example Usage

**Claude Desktop:**
```
Generate an MEP activity report for MEP-124810 covering 2024
```

**TypeScript:**
```typescript
// MEP Activity Report
const result = await client.callTool('generate_report', {
  reportType: 'MEP_ACTIVITY',
  subjectId: 'MEP-124810',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});

// Committee Performance Report
const committeReport = await client.callTool('generate_report', {
  reportType: 'COMMITTEE_PERFORMANCE',
  subjectId: 'COMM-ENVI',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});

// Parliament-wide Voting Statistics (no subjectId needed)
const votingStats = await client.callTool('generate_report', {
  reportType: 'VOTING_STATISTICS',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});
```

#### Report Types

1. **MEP_ACTIVITY**: Individual MEP performance and activity
   - Voting participation and statistics
   - Committee involvement
   - Parliamentary questions submitted
   - Reports authored

2. **COMMITTEE_PERFORMANCE**: Committee productivity analysis
   - Meeting frequency
   - Legislative output
   - Member participation rates

3. **VOTING_STATISTICS**: Parliament-wide voting analysis
   - Overall voting activity
   - Adoption rates
   - Political group alignment patterns

4. **LEGISLATION_PROGRESS**: Legislative activity overview
   - New proposals submitted
   - Completed procedures
   - Ongoing procedures and timelines

#### Use Cases

1. **Performance Review**: Generate MEP activity reports
2. **Committee Analysis**: Assess committee productivity
3. **Statistical Analysis**: Parliament-wide voting trends
4. **Progress Tracking**: Monitor legislative progress

---

## 🕵️ OSINT Intelligence Tools

### Tool: assess_mep_influence

**Description**: Compute a comprehensive MEP influence score using a 5-dimension model: voting activity, legislative output, committee engagement, parliamentary oversight, and coalition building.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| mepId | string | Yes | MEP identifier |
| dateFrom | string | No | Start date (ISO 8601) |
| dateTo | string | No | End date (ISO 8601) |

#### Example Usage

```
Assess the influence of MEP with ID "124810" over the past year
```

---

### Tool: analyze_coalition_dynamics

**Description**: Analyze coalition cohesion and stress indicators across political groups, detecting voting alliances, defection rates, and fragmentation signals.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| politicalGroups | string[] | No | Political groups to analyze |
| dateFrom | string | No | Start date (ISO 8601) |
| dateTo | string | No | End date (ISO 8601) |

#### Example Usage

```
Analyze coalition dynamics between EPP and S&D over the last 6 months
```

---

### Tool: detect_voting_anomalies

**Description**: Detect unusual voting patterns including party defections, sudden alignment shifts, abstention spikes, and other anomalies.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| mepId | string | No | Specific MEP to analyze |
| politicalGroup | string | No | Political group to analyze |
| dateFrom | string | No | Start date (ISO 8601) |
| dateTo | string | No | End date (ISO 8601) |

#### Example Usage

```
Detect voting anomalies in the EPP group over the past 3 months
```

---

### Tool: compare_political_groups

**Description**: Cross-group comparative analysis of voting discipline, activity levels, policy focus areas, and internal cohesion.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| groups | string[] | Yes | Political groups to compare |
| metrics | string[] | No | Specific metrics to compare |
| dateFrom | string | No | Start date (ISO 8601) |
| dateTo | string | No | End date (ISO 8601) |

#### Example Usage

```
Compare EPP, S&D, and Renew Europe on voting cohesion and legislative output
```

---

### Tool: analyze_legislative_effectiveness

**Description**: Score MEP or committee legislative effectiveness — bills passed, amendments adopted, report quality, and overall impact.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| subjectId | string | Yes | MEP or committee identifier |
| subjectType | string | No | "mep" or "committee" |
| dateFrom | string | No | Start date (ISO 8601) |
| dateTo | string | No | End date (ISO 8601) |

#### Example Usage

```
Analyze the legislative effectiveness of the ENVI committee
```

---

### Tool: monitor_legislative_pipeline

**Description**: Monitor real-time legislative pipeline status with bottleneck detection, timeline forecasting, and procedure progress tracking.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| committeeId | string | No | Filter by committee |
| status | string | No | Filter by procedure status |
| dateFrom | string | No | Start date (ISO 8601) |
| dateTo | string | No | End date (ISO 8601) |

#### Example Usage

```
Show the current legislative pipeline status and identify bottlenecks
```

---

### Tool: analyze_committee_activity

**Description**: Analyze committee workload, document production, meeting frequency, and member engagement metrics. Provides intelligence on committee operational efficiency and policy focus areas.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| committeeId | string | Yes | Committee identifier (e.g., "ENVI", "ITRE") |
| dateFrom | string | No | Start date (ISO 8601) |
| dateTo | string | No | End date (ISO 8601) |

#### Example Usage

```
Analyze the ENVI committee's activity, document output, and member engagement over the last 6 months
```

---

### Tool: track_mep_attendance

**Description**: Track MEP attendance patterns across plenary and committee sessions with trend detection, engagement scoring, and participation rate analysis.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| mepId | string | Yes | MEP identifier |
| dateFrom | string | No | Start date (ISO 8601) |
| dateTo | string | No | End date (ISO 8601) |

#### Example Usage

```
Track attendance patterns and engagement trends for MEP-124810 over the current parliamentary term
```

---

### Tool: analyze_country_delegation

**Description**: Analyze a country's MEP delegation composition, political group distribution, voting behavior, committee representation, and national cohesion metrics.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| country | string | Yes | ISO 3166-1 alpha-2 country code (e.g., "SE", "DE", "FR") |
| dateFrom | string | No | Start date (ISO 8601) |
| dateTo | string | No | End date (ISO 8601) |

#### Example Usage

```
Analyze the Swedish delegation's composition, voting behavior, and committee representation
```

---

### Tool: generate_political_landscape

**Description**: Generate a comprehensive political landscape overview of the European Parliament, including group composition, power dynamics, coalition thresholds, bloc analysis, and fragmentation metrics.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| dateFrom | string | No | Start date (ISO 8601) |
| dateTo | string | No | End date (ISO 8601) |

#### Example Usage

```
Generate a current political landscape overview including group sizes, coalition possibilities, and bloc dynamics
```

---

## 📝 MCP Prompts

Pre-built intelligence analysis prompt templates for common parliamentary research workflows.

| Prompt | Description | Required Arguments |
|--------|-------------|--------------------|
| `mep_briefing` | Comprehensive MEP intelligence briefing with voting record, committee work, and influence assessment | mepId |
| `coalition_analysis` | Coalition dynamics and voting bloc analysis across political groups | politicalGroups |
| `legislative_tracking` | Legislative procedure tracking report with timeline and status | procedureId |
| `political_group_comparison` | Multi-dimensional comparison of political groups | groups |
| `committee_activity_report` | Committee workload, engagement, and document production report | committeeId |
| `voting_pattern_analysis` | Voting pattern trend detection and anomaly identification | mepId |

### Example: Using MCP Prompts

```typescript
// Request a pre-built prompt template
const prompt = await client.getPrompt('mep_briefing', { mepId: 'MEP-124810' });
// Returns structured messages for LLM consumption
```

---

## 📦 MCP Resources

Direct data access via European Parliament resource URIs using the `ep://` scheme.

| Resource URI | Description |
|-------------|-------------|
| `ep://meps` | List of all current MEPs |
| `ep://meps/{mepId}` | Individual MEP profile and details |
| `ep://committees/{committeeId}` | Committee information and membership |
| `ep://plenary-sessions` | Recent plenary session listing |
| `ep://votes/{sessionId}` | Voting records for a specific session |
| `ep://political-groups` | Political group listing with seat counts |

### Example: Reading MCP Resources

```typescript
// Read a resource directly
const meps = await client.readResource('ep://meps');
const mepDetails = await client.readResource('ep://meps/MEP-124810');
const committee = await client.readResource('ep://committees/ENVI');
```

---

## 🎯 Common Use Cases

### Use Case 1: Research a Specific MEP

```typescript
// Step 1: Find MEP by country
const meps = await client.callTool('get_meps', {
  country: 'SE',
  limit: 10
});

// Step 2: Get detailed information
const mepDetails = await client.callTool('get_mep_details', {
  id: 'MEP-124810'
});

// Step 3: Analyze voting patterns
const votingAnalysis = await client.callTool('analyze_voting_patterns', {
  mepId: 'MEP-124810',
  dateFrom: '2024-01-01',
  compareWithGroup: true
});

// Step 4: Generate activity report
const report = await client.callTool('generate_report', {
  reportType: 'MEP_ACTIVITY',
  subjectId: 'MEP-124810',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});
```

### Use Case 2: Track Climate Legislation

```typescript
// Step 1: Search for climate-related documents
const documents = await client.callTool('search_documents', {
  keywords: 'climate change renewable',
  docType: 'PROPOSAL',
  dateFrom: '2024-01-01',
  limit: 50
});

// Step 2: Track specific legislation
const tracking = await client.callTool('track_legislation', {
  procedureId: '2024/0001(COD)'
});

// Step 3: Get voting records on climate topics
const votes = await client.callTool('get_voting_records', {
  topic: 'climate',
  dateFrom: '2024-01-01',
  limit: 100
});
```

### Use Case 3: Committee Analysis

```typescript
// Step 1: Get committee information
const committee = await client.callTool('get_committee_info', {
  abbreviation: 'ENVI'
});

// Step 2: List committee members
const members = await client.callTool('get_meps', {
  committee: 'ENVI',
  active: true,
  limit: 100
});

// Step 3: Generate committee report
const report = await client.callTool('generate_report', {
  reportType: 'COMMITTEE_PERFORMANCE',
  subjectId: 'COMM-ENVI',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});
```

### Use Case 4: Political Group Analysis

```typescript
// Step 1: Get all MEPs from political group
const groupMEPs = await client.callTool('get_meps', {
  group: 'S&D',
  active: true,
  limit: 100
});

// Step 2: Analyze each MEP's voting patterns
for (const mep of groupMEPs.data) {
  const analysis = await client.callTool('analyze_voting_patterns', {
    mepId: mep.id,
    dateFrom: '2024-01-01',
    compareWithGroup: true
  });
  // Process analysis...
}

// Step 3: Generate voting statistics
const stats = await client.callTool('generate_report', {
  reportType: 'VOTING_STATISTICS',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});
```

---

## ✅ Best Practices

### 1. Efficient Pagination

```typescript
// Good: Reasonable page size with pagination
async function getAllMEPs() {
  const meps = [];
  let offset = 0;
  const limit = 50; // Optimal page size
  
  while (true) {
    const result = await client.callTool('get_meps', {
      limit,
      offset,
      active: true
    });
    
    const data = JSON.parse(result.content[0].text);
    meps.push(...data.data);
    
    if (data.data.length < limit) break; // No more pages
    offset += limit;
  }
  
  return meps;
}
```

### 2. Rate Limit Handling

```typescript
// Implement exponential backoff
async function callToolWithRetry(toolName, params, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await client.callTool(toolName, params);
    } catch (error) {
      if (error.message.includes('Rate limit')) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}
```

### 3. Input Validation

```typescript
// Validate inputs before calling tools
function validateCountryCode(code: string): boolean {
  return /^[A-Z]{2}$/.test(code);
}

function validateDateFormat(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

// Use validation
if (!validateCountryCode(countryInput)) {
  throw new Error('Invalid country code format. Use ISO 3166-1 alpha-2 (e.g., "SE")');
}

const meps = await client.callTool('get_meps', {
  country: countryInput,
  limit: 50
});
```

### 4. Error Handling

```typescript
// Comprehensive error handling
async function safeFetchMEP(mepId: string) {
  try {
    const result = await client.callTool('get_mep_details', { id: mepId });
    return JSON.parse(result.content[0].text);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('ValidationError')) {
        console.error('Invalid MEP ID format:', mepId);
      } else if (error.message.includes('NotFoundError')) {
        console.error('MEP not found:', mepId);
      } else if (error.message.includes('RateLimitError')) {
        console.error('Rate limit exceeded, retry later');
      } else {
        console.error('Unexpected error:', error.message);
      }
    }
    return null;
  }
}
```

### 5. Caching Strategy

```typescript
// Implement client-side caching for frequently accessed data
class MEPCache {
  private cache = new Map<string, { data: any, timestamp: number }>();
  private readonly TTL = 15 * 60 * 1000; // 15 minutes
  
  async getMEP(client: any, mepId: string) {
    const cached = this.cache.get(mepId);
    
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.data; // Return cached data
    }
    
    // Fetch fresh data
    const result = await client.callTool('get_mep_details', { id: mepId });
    const data = JSON.parse(result.content[0].text);
    
    this.cache.set(mepId, { data, timestamp: Date.now() });
    return data;
  }
}
```

### 6. Date Range Queries

```typescript
// Query data in manageable chunks
async function getVotesForYear(mepId: string, year: number) {
  const months = [];
  
  for (let month = 1; month <= 12; month++) {
    const dateFrom = `${year}-${String(month).padStart(2, '0')}-01`;
    const dateTo = `${year}-${String(month).padStart(2, '0')}-${getDaysInMonth(month, year)}`;
    
    const result = await client.callTool('get_voting_records', {
      mepId,
      dateFrom,
      dateTo,
      limit: 100
    });
    
    months.push(JSON.parse(result.content[0].text));
  }
  
  return months;
}
```

---

## ⚠️ Error Handling

### Common Error Types

#### ValidationError

**Cause**: Invalid input parameters

**Example**:
```json
{
  "error": "ValidationError: country must match pattern ^[A-Z]{2}$"
}
```

**Solution**:
- Verify parameter format against schema
- Use ISO standard codes (country, language)
- Validate dates as YYYY-MM-DD
- Check min/max constraints

#### RateLimitError

**Cause**: Exceeded 100 requests per 15 minutes

**Example**:
```json
{
  "error": "RateLimitError: Rate limit exceeded, retry in 300 seconds"
}
```

**Solution**:
- Implement request throttling
- Use exponential backoff
- Cache frequently accessed data
- Batch requests when possible

#### NotFoundError

**Cause**: Resource doesn't exist

**Example**:
```json
{
  "error": "NotFoundError: MEP with ID 'MEP-999999' not found"
}
```

**Solution**:
- Verify ID exists using list tools first
- Handle 404 gracefully in application
- Provide user-friendly error messages

#### APIError

**Cause**: European Parliament API issues

**Example**:
```json
{
  "error": "APIError: Failed to fetch data from European Parliament API"
}
```

**Solution**:
- Implement retry logic with backoff
- Check EP API status
- Provide fallback behavior
- Log errors for monitoring

### Error Handling Pattern

```typescript
async function robustToolCall(toolName: string, params: any) {
  try {
    const result = await client.callTool(toolName, params);
    return {
      success: true,
      data: JSON.parse(result.content[0].text)
    };
  } catch (error) {
    if (error instanceof Error) {
      // Log error details
      console.error(`Tool ${toolName} failed:`, error.message);
      
      // Categorize error
      let errorType = 'UNKNOWN';
      if (error.message.includes('ValidationError')) errorType = 'VALIDATION';
      else if (error.message.includes('RateLimitError')) errorType = 'RATE_LIMIT';
      else if (error.message.includes('NotFoundError')) errorType = 'NOT_FOUND';
      else if (error.message.includes('APIError')) errorType = 'API_ERROR';
      
      return {
        success: false,
        error: errorType,
        message: error.message
      };
    }
    
    return {
      success: false,
      error: 'UNKNOWN',
      message: 'An unexpected error occurred'
    };
  }
}
```

---

## 🔒 Security & Compliance

### GDPR Compliance

**Personal Data Handling**:
- MEP contact information (email, phone) is public but must be handled responsibly
- Do not cache personal data longer than necessary (max 15 minutes)
- All data access is logged for audit purposes
- Support data subject rights (access, rectification, erasure)

**Best Practices**:
```typescript
// Don't store MEP personal data long-term
const mep = await client.callTool('get_mep_details', { id: mepId });
// Use data immediately
displayMEPInfo(mep);
// Don't persist in database without explicit purpose
```

### ISMS Policy References

This MCP server complies with:

- **ISO 27001** A.12.4.1 - Event logging and monitoring
- **NIST CSF 2.0** PR.DS-2 - Data-in-transit protection
- **CIS Controls v8.1** 3.3 - Data protection in transit

For complete security documentation, see [SECURITY.md](../SECURITY.md).

### Rate Limiting

**Limits**:
- 100 requests per 15 minutes per IP address
- Applied per tool, not globally
- Shared across all MCP clients from same IP

**Headers** (when available):
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1640995200
```

---

## 📚 Additional Resources

### Documentation
- [Architecture Diagrams](./ARCHITECTURE_DIAGRAMS.md) - Visual architecture and data flow
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Common issues and solutions
- [Developer Guide](./DEVELOPER_GUIDE.md) - Contributing and development
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Installation and configuration
- [Performance Guide](./PERFORMANCE_GUIDE.md) - Optimization strategies

### External Resources
- [MCP Specification](https://spec.modelcontextprotocol.io/) - Protocol documentation
- [European Parliament Open Data](https://data.europarl.europa.eu/) - Data source
- [Hack23 ISMS Policies](https://github.com/Hack23/ISMS-PUBLIC) - Security standards

---

## 🤝 Support

**Issues & Questions**:
- [GitHub Issues](https://github.com/Hack23/European-Parliament-MCP-Server/issues)
- [GitHub Discussions](https://github.com/Hack23/European-Parliament-MCP-Server/discussions)

**Security Issues**:
- See [SECURITY.md](../SECURITY.md) for vulnerability reporting

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://hack23.com">Hack23 AB</a></strong><br>
  <em>ISMS-compliant open source demonstrating security excellence</em>
</p>
