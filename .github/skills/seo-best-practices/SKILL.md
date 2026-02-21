---
name: seo-best-practices
description: On-page SEO, technical SEO, keyword research, and content optimization for EU parliamentary data developer platforms
license: MIT
---

# SEO Best Practices Skill

## Context

This skill applies when:
- Optimizing the EP MCP Server README and documentation for search engine discoverability
- Improving npm package metadata for registry search ranking
- Enhancing GitHub repository SEO (topics, description, social preview)
- Structuring documentation sites for organic search traffic
- Developing keyword strategies targeting civic tech and parliamentary data audiences
- Creating content that ranks for developer-focused queries about EU data APIs
- Optimizing TypeDoc-generated API documentation for crawlability

Developer platforms compete for visibility among AI tooling, open data, and civic technology search queries. SEO ensures the EP MCP Server reaches its target audiences organically.

## Rules

1. **Optimize npm Package Metadata**: Use descriptive `name`, `description`, and `keywords` in `package.json`; these directly influence npm search ranking
2. **Use Semantic GitHub Topics**: Apply relevant topics (`mcp`, `european-parliament`, `open-data`, `civic-tech`, `ai-tools`, `typescript`) to the repository
3. **Write Keyword-Rich README Headers**: Structure the README with H2/H3 headers containing primary search terms (e.g., "European Parliament API", "MCP Server Tools")
4. **Implement Structured Data**: Add JSON-LD or OpenGraph metadata to documentation sites for rich search result snippets
5. **Optimize for Long-Tail Keywords**: Target specific queries like "European Parliament voting data API" rather than generic terms like "parliament API"
6. **Create Internal Link Architecture**: Cross-link between documentation pages (API guide, architecture, security) to distribute page authority
7. **Write Descriptive Alt Text**: Add meaningful alt text to all architecture diagrams and Mermaid-rendered images
8. **Maintain Fresh Content**: Regular documentation updates signal active maintenance; update changelogs, blog posts, and release notes consistently
9. **Optimize Page Load Performance**: Documentation sites must load under 3 seconds; use static site generation and CDN hosting
10. **Monitor Search Console Metrics**: Track impressions, clicks, and position for target keywords; iterate on underperforming pages

## Examples

### ✅ Good Pattern: Optimized package.json for npm SEO

```json
{
  "name": "european-parliament-mcp-server",
  "description": "MCP server providing AI-ready access to European Parliament data — MEPs, votes, legislation, and committees",
  "keywords": [
    "mcp", "model-context-protocol", "european-parliament",
    "eu-parliament", "open-data", "civic-tech", "ai-tools",
    "typescript", "legislative-data", "mep", "plenary-votes",
    "parliamentary-questions", "gdpr-compliant"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/Hack23/European-Parliament-MCP-Server"
  },
  "homepage": "https://hack23.github.io/European-Parliament-MCP-Server/"
}
```

### ✅ Good Pattern: GitHub Repository SEO

```yaml
# Repository settings
description: "MCP server for European Parliament open data — MEPs, votes, legislation, committees. TypeScript, GDPR-compliant, AI-ready."
topics:
  - mcp-server
  - european-parliament
  - open-data
  - civic-tech
  - typescript
  - ai-tools
  - model-context-protocol
  - legislative-data
  - gdpr
  - parliamentary-data
```

### ✅ Good Pattern: Documentation Page Structure

```markdown
<!-- SEO-optimized documentation page -->
# European Parliament MCP Server API Guide

## Getting Started with EP Data Tools
Quick setup for accessing European Parliament datasets via MCP protocol.

## Available MCP Tools
### Search MEPs — Find Members of European Parliament
### Get Plenary Votes — Access voting records
### Track Legislation — Monitor legislative procedures
```

## Anti-Patterns

### ❌ Bad: Keyword Stuffing
```markdown
# NEVER cram keywords unnaturally
"European Parliament European Parliament API European Parliament data
European Parliament MCP European Parliament server European Parliament tools"
```

### ❌ Bad: Missing npm Keywords
```json
{
  "name": "ep-mcp",
  "description": "An MCP server",
  "keywords": []
}
```

## ISMS Compliance

- **OS-001**: Public documentation must follow open source transparency guidelines
- **DP-001**: SEO metadata must not include personal MEP data in structured snippets

Reference: [Hack23 ISMS Policies](https://github.com/Hack23/ISMS-PUBLIC)
