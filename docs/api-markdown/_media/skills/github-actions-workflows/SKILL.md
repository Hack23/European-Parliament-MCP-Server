---
name: github-actions-workflows
description: Create secure CI/CD workflows with GitHub Actions for TypeScript/Node.js build, test, security scans, and deployment
license: Apache-2.0
---

# GitHub Actions Workflows Skill

## Purpose

Create secure, efficient CI/CD pipelines using GitHub Actions for TypeScript/Node.js MCP server projects.

## When to Use

- ✅ Setting up continuous integration for TypeScript projects
- ✅ Automating security scans (CodeQL, dependency checks)
- ✅ Implementing npm package publishing pipelines
- ✅ Configuring test and coverage reporting

## CI/CD Pipeline Pattern

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test -- --coverage

  security:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript
      - uses: github/codeql-action/analyze@v3
      - run: npm audit --audit-level=high

  publish:
    runs-on: ubuntu-latest
    needs: [build, security]
    if: startsWith(github.ref, 'refs/tags/')
    steps:
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Security Best Practices

- ✅ Pin action versions with SHA hashes
- ✅ Use `npm ci` instead of `npm install`
- ✅ Minimize GITHUB_TOKEN permissions
- ✅ Scan for vulnerabilities before deploy
- ✅ Use `secrets` for sensitive data
- ✅ Enable Dependabot for dependency updates

## Test Reporting

```yaml
- name: Run tests with coverage
  run: npm run test:coverage
- name: Upload coverage
  uses: codecov/codecov-action@e28ff129e5465c2c0dcc6f003fc735cb6ae0c673 # v4.5.0
  with:
    files: ./coverage/lcov.info
```

## ISMS Policy References

- [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) - CI/CD security requirements
- [Open Source Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Open_Source_Policy.md) - Supply chain security
