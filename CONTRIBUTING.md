## Contributing

[fork]: /fork
[pr]: /compare
[code-of-conduct]: CODE_OF_CONDUCT.md

Hi there! We're thrilled that you'd like to contribute to this project. Your help is essential for keeping it great.

Please note that this project is released with a [Contributor Code of Conduct][code-of-conduct]. By participating in this project you agree to abide by its terms.

## Issues and PRs

If you have suggestions for how this project could be improved, or want to report a bug, open an issue! We'd love all and any contributions. If you have questions, too, we'd love to hear them.

We'd also love PRs. If you're thinking of a large PR, we advise opening up an issue first to talk about it, though! Look at the links below if you're not sure how to open a PR.

## Submitting a pull request

1. [Fork][fork] and clone the repository.
2. Configure and install the dependencies: `npm install`
3. Make sure the tests pass on your machine: `npm test`
4. Create a new branch: `git checkout -b my-branch-name`
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
