## Contributing

[fork]: /fork
[pr]: /compare
[code-of-conduct]: CODE_OF_CONDUCT.md

Hi there! We're thrilled that you'd like to contribute to this project. Your help is essential for keeping it great.

Please note that this project is released with a [Contributor Code of Conduct][code-of-conduct]. By participating in this project you agree to abide by its terms.

## Issues and PRs

If you have suggestions for how this project could be improved, or want to report a bug, open an issue! We'd love all and any contributions. If you have questions, too, we'd love to hear them.

We'd also love PRs. If you're thinking of a large PR, we advise opening up an issue first to talk about it, though! Look at the links below if you're not sure how to open a PR.

## Development Environment Setup

### Prerequisites

| Requirement | Minimum Version | Check |
|-------------|-----------------|-------|
| Node.js | 24.0.0 | `node --version` |
| npm | 10.0.0 | `npm --version` |
| Git | 2.x | `git --version` |

### Initial Setup

```bash
# 1. Fork the repository, then clone your fork
git clone https://github.com/<your-username>/European-Parliament-MCP-Server.git
cd European-Parliament-MCP-Server

# 2. Install dependencies (uses package-lock.json for reproducibility)
npm install

# 3. Verify build works
npm run build

# 4. Run all unit tests to confirm your environment is healthy
npm test

# 5. Optional: run type-checking separately
npm run type-check
```

### Development Commands

```bash
# Start the server in watch mode (auto-recompile on change)
npm run dev

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with coverage report
npm run test:coverage

# Lint source files
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Check code formatting
npm run format

# Check for dead code / unused exports
npm run knip

# Security audit
npm audit

# License compliance check
npm run test:licenses
```

### Environment Variables

Create a `.env.test` file for integration testing:

```env
# Set to 'true' to run tests against the real EP API (rate-limited)
EP_INTEGRATION_TESTS=false

# Optional: override API base URL for testing against a mirror
EP_API_URL=https://data.europarl.europa.eu/api/v2
```

> ⚠️ **Never commit `.env` files** — they are listed in `.gitignore`.

---

## Branch Naming Conventions

All branches must follow the pattern: `<type>/<short-description>`

| Type | Purpose | Example |
|------|---------|---------|
| `feature/` | New functionality | `feature/add-budget-tool` |
| `fix/` | Bug fix | `fix/rate-limiter-race-condition` |
| `docs/` | Documentation only | `docs/improve-jsdoc-getMEPs` |
| `chore/` | Maintenance, deps, CI | `chore/upgrade-vitest-4` |
| `test/` | Test improvements | `test/add-e2e-coalition-tool` |
| `perf/` | Performance improvements | `perf/cache-key-normalization` |
| `security/` | Security fixes | `security/upgrade-undici` |

---

## Submitting a Pull Request

1. [Fork][fork] and clone the repository.
2. Configure and install the dependencies: `npm install`
3. Make sure the tests pass on your machine: `npm test`
4. Create a new branch: `git checkout -b feature/my-branch-name`
5. Make your change, add tests, and make sure the tests still pass.
6. Push to your fork and [submit a pull request][pr].
7. Pat yourself on the back and wait for your pull request to be reviewed and merged.

### Pull Request Guidelines

Here are a few things you can do that will increase the likelihood of your pull request being accepted:

- **Write and update tests** - Maintain 80%+ code coverage (95% for security code)
- **Keep your changes focused** - If there are multiple changes you would like to make that are not dependent upon each other, consider submitting them as separate pull requests.
- **Write a [good commit message](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)** - Follow [Conventional Commits](https://www.conventionalcommits.org/)
- **Follow code style** - Run `npm run lint` and `npm run format` before committing
- **Update documentation** - Keep README.md and other docs up to date with your changes

### Automatic PR Labeling

When you submit a pull request, our automated labeler will automatically apply labels based on the files you've changed:

#### 🔌 MCP Development Labels
- `mcp-tools` - Changes to MCP tool implementations (src/tools/)
- `mcp-resources` - Changes to MCP resources (src/resources/)
- `mcp-prompts` - Changes to MCP prompts (src/prompts/)
- `mcp-protocol` - MCP protocol changes

#### 🏛️ European Parliament Labels
- `ep-api` - European Parliament API integration
- `ep-data` - European Parliament data handling
- `meps` - MEP-related changes
- `plenary` - Plenary session features
- `committees` - Committee features
- `documents` - Document handling

#### 🚀 General Labels
- `feature` - New features or functionality
- `enhancement` - Improvements to existing features
- `bug` - Bug fixes
- `documentation` - Documentation updates
- `dependencies` - Dependency updates
- `security` - Security improvements
- `performance` - Performance optimizations
- `testing` - Test improvements

#### 🔒 Compliance Labels
- `gdpr` - GDPR compliance changes
- `isms-compliance` - ISMS policy compliance
- `security` - Security enhancements

You can also manually add labels by including them in your PR description using checkboxes:
```markdown
- [x] 🚀 New Feature/Enhancement
- [x] 🔌 MCP Tools
- [x] 🏛️ European Parliament API
```

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Changes to build system or dependencies
- `ci`: CI/CD changes
- `chore`: Other changes that don't modify src or test files

**Examples:**
```bash
feat(mcp-tools): add getMEPs tool for fetching MEP information

fix(ep-api): handle rate limiting in European Parliament API calls

docs: update README with new MCP tools documentation

test: add unit tests for plenary session tools

build(deps): update @modelcontextprotocol/sdk to v1.0.5
```

Work in Progress pull requests are also welcome to get feedback early on, or if there is something blocked you.

---

## How to Add a New MCP Tool

See [**docs/TOOL_DEVELOPMENT.md**](./docs/TOOL_DEVELOPMENT.md) for the full step-by-step guide. Here is the quick summary:

### Step 1 — Create the tool file

```bash
# Create src/tools/myNewTool.ts
# Use an existing tool (e.g., getMEPs.ts) as a template
```

### Step 2 — Add a Zod schema

Add the input schema to `src/schemas/europeanParliament.ts`:

```typescript
export const MyNewToolSchema = z.object({
  subjectId: z.string().min(1).max(200).describe('Subject identifier'),
  limit: z.number().int().min(1).max(100).default(50),
});
```

### Step 3 — Implement the handler

Follow the **two-layer error pattern**:

```typescript
export async function handleMyNewTool(args: unknown): Promise<ToolResult> {
  const params = MyNewToolSchema.parse(args);  // Layer 1: Zod validation
  try {
    const result = await epClient.someMethod(params);
    return buildToolResponse(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to fetch data: ${msg}`);
  }
}
```

### Step 4 — Export metadata and register

```typescript
export const myNewToolMetadata = {
  name: 'my_new_tool',
  description: 'One paragraph explaining what this tool does and its parameters.',
  inputSchema: { type: 'object' as const, properties: { ... } },
};
```

Then add the import and routing case to the server's tool registry.

### Step 5 — Write tests

Create `src/tools/myNewTool.test.ts` covering:
- ✅ Valid input → correct `ToolResult`
- ✅ API failure → descriptive error thrown
- ✅ Invalid/empty input → `ZodError` thrown
- ✅ Default parameter values applied

---

## DI Container Pattern

The server uses a lightweight Dependency Injection (DI) container defined in `src/di/`.

### Tokens (`src/di/tokens.ts`)

```typescript
import { TOKENS } from './di/tokens.js';

// Available tokens:
TOKENS.EPClient        // EuropeanParliamentClient singleton
TOKENS.RateLimiter     // Token-bucket rate limiter
TOKENS.MetricsService  // Performance metrics collector
TOKENS.AuditLogger     // GDPR-compliant audit logger
TOKENS.HealthService   // Server health-check service
```

### Using the Container

```typescript
import { createDefaultContainer } from './di/container.js';
import { TOKENS } from './di/tokens.js';
import type { MetricsService } from './services/MetricsService.js';

// In server startup:
const container = createDefaultContainer();

// Resolve a singleton:
const metrics = container.resolve<MetricsService>(TOKENS.MetricsService);
metrics.recordRequest('get_meps', 42);
```

### When to Use the DI Container

- **New services** (e.g., a caching service, an alerting service) should be registered
  as singletons via `createDefaultContainer()` in `src/di/container.ts`
- **Tools** use the shared `epClient` singleton imported directly from
  `src/clients/europeanParliamentClient.ts` (it is wired into the container internally)
- **Unit tests** can create isolated containers or mock individual tokens

---

## Testing Requirements

All PRs must maintain these coverage thresholds:

| Metric | Minimum |
|--------|---------|
| Lines | 80% |
| Statements | 80% |
| Functions | 80% |
| Branches | 70% |
| Security-critical code | 95% |

### Running Test Suites

```bash
# Unit tests (fast, no external dependencies)
npm run test:unit

# Unit tests with coverage report
npm run test:coverage

# Integration tests against real EP API (opt-in)
EP_INTEGRATION_TESTS=true npm run test:integration

# Integration tests with fixture capture
EP_INTEGRATION_TESTS=true EP_SAVE_FIXTURES=true npm run test:integration

# End-to-end tests via MCP stdio client
npm run test:e2e

# Performance benchmarks
npm run test:performance

# All test suites
npm run test:all

# Watch mode for TDD
npm run test:watch
```

### Test File Locations

```
src/tools/myTool.test.ts       # Unit tests co-located with tool
tests/integration/             # Integration tests (EP API)
tests/e2e/                     # End-to-end MCP client tests
tests/performance/             # Performance benchmarks
tests/fixtures/                # Shared mock data
tests/helpers/                 # Test utilities (retry, measureTime, etc.)
```

---

## Code Review Standards

Reviewers will check:

1. **Correctness** — Does the code do what it claims?
2. **Test coverage** — Are all happy paths and error paths covered?
3. **Type safety** — No `any`, no unvalidated `unknown` beyond the handler entry point
4. **Error handling** — Errors sanitized, no internal details leaked
5. **Documentation** — JSDoc complete with `@param`, `@returns`, `@throws`, `@example`
6. **Security** — Input validated with Zod, ISMS policy tags present
7. **Performance** — No unnecessary API calls; cache hits for repeated queries
8. **Consistency** — Follows existing patterns (`buildToolResponse`, schema naming, etc.)

---

## Security Review Checklist for PRs

Before requesting a review on any PR touching `src/`:

- [ ] No hardcoded credentials, tokens, or API keys
- [ ] All user inputs validated with Zod (`.parse(args)` as first handler line)
- [ ] String inputs have explicit `min()` and `max()` length constraints
- [ ] Error messages don't expose stack traces, internal URLs, or secrets
- [ ] No `console.log` of sensitive data (MEP personal data, error internals)
- [ ] New dependencies checked with `npm audit` — zero high/critical findings
- [ ] New dependencies are from approved license list (MIT, Apache-2.0, BSD, ISC)
- [ ] ISMS policy tags added to JSDoc: `SC-002 (Input Validation), AC-003 (Least Privilege)`
- [ ] If touching auth/rate-limiting: 95%+ security code coverage maintained

---

## Supply Chain Security

This project generates a Software Bill of Materials (SBOM) for every release and implements SLSA Level 3 build provenance to ensure supply chain transparency and security.

**Build Attestations (SLSA Level 3):**
- Cryptographic proof of build integrity for all release artifacts
- Non-falsifiable provenance using GitHub Sigstore
- Verify with: `gh attestation verify <artifact> --owner Hack23 --repo European-Parliament-MCP-Server`
- npm packages published with provenance: `npm view european-parliament-mcp-server dist.attestations`

**SBOM Generation:**
- All direct and transitive dependencies
- Package versions, licenses, and checksums
- Vulnerability scanning results
- Generated in SPDX 2.3+ and CycloneDX formats
- Quality validated with SBOMQS (minimum score 7.0/10)
- Vulnerability scanned with Grype

**Accessing Security Artifacts:**
- Download from [latest release](https://github.com/Hack23/European-Parliament-MCP-Server/releases/latest)
- SBOM: `sbom.spdx.json` and `sbom.cyclonedx.json`
- Provenance: `provenance.intoto.jsonl`
- Checksums: `checksums.txt`

For more details, see:
- [SBOM Documentation](./docs/SBOM.md)
- [Attestations Documentation](./docs/ATTESTATIONS.md)

## Resources

- [How to Contribute to Open Source](https://opensource.guide/how-to-contribute/)
- [Using Pull Requests](https://help.github.com/articles/about-pull-requests/)
- [GitHub Help](https://help.github.com)
