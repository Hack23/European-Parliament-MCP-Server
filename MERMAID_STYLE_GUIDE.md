# Mermaid Diagram Style Guide

Canonical conventions for **all** [Mermaid](https://mermaid.js.org/) diagrams
in this repository. The goal is a consistent visual language across the
~200 architecture, security, data-model, threat-model and workflow diagrams
so readers can recognise meaning from colour at a glance.

Diagrams are machine-validated by `npm run test:mermaid` (see
[`scripts/validate-mermaid-diagrams.ts`](./scripts/validate-mermaid-diagrams.ts)).
That script also offers `--normalize-colors`, which lowercases every hex
literal inside ` ```mermaid ` fences in-place — a purely cosmetic transform
that keeps the codebase free of `#FFA726` vs `#ffa726` noise.

---

## 1. Authoring rules

| Rule | Rationale |
| --- | --- |
| **Always wrap node labels that contain an icon (emoji), `@`, `:`, `(`, `)`, `{`, `}`, `&`, or `;` in double quotes** (e.g. `N["📡 Sources"]`, `N["foo@bar"]`, `N["resource/{id}"]`). | Mermaid 11's flowchart grammar reserves `@` for link IDs and `{ }` for shape DSL; unquoted icons/punctuation can either fail to parse or render with corrupted text. The `--quote-icons` flag auto-fixes this. |
| Use **lowercase** hex literals (`#1565c0`, not `#1565C0`). | Single canonical form; enforced by `--normalize-colors`. |
| Prefer the [canonical palette](#2-canonical-palette) below over ad-hoc colours. | Cross-document consistency, accessibility, dark-mode friendliness. |
| Use **direction tokens** (`graph TB`, `graph LR`) consistently. | Avoids confusing mixed `TD`/`TB` styles. |
| Add `%%{init: {...}}%%` directives only when the default Mermaid theme is insufficient. | Keeps diagrams portable across GitHub, TypeDoc and PDF renderers. |

## 2. Canonical palette

Material-inspired, AA-contrast on white and dark text. Each semantic role
has a **fill** (light) and **stroke** (dark) pair so diagrams render legibly
on both light and dark documentation themes.

| Role | Fill | Stroke | Use for |
| --- | --- | --- | --- |
| **Primary / Info**  | `#1565c0` (dark) `#bbdefb` (light) | `#0d47a1` | The MCP server itself, primary application surfaces |
| **Secondary**       | `#4527a0` (dark) `#d1c4e9` (light) | `#311b92` | Internal services, secondary application layers |
| **Success / Safe**  | `#2e7d32` (dark) `#c8e6c9` (light) | `#1b5e20` | Validated data flow, healthy state, allow-listed |
| **Warning**         | `#f57c00` (dark) `#ffe0b2` (light) | `#e65100` | Degraded mode, retry-able failures, throttling |
| **Danger / Threat** | `#c62828` (dark) `#ffcdd2` (light) | `#b71c1c` | Attack surface, untrusted boundary, blocked path |
| **External**        | `#fbc02d` (dark) `#fff9c4` (light) | `#f57f17` | Third-party APIs, untrusted dependencies (e.g. EP API) |
| **Neutral**         | `#37474f` (dark) `#cfd8dc` (light) | `#263238` | Storage, infrastructure, ground-truth references |
| **EU brand blue**   | `#003399` | `#ffcc00` | European Parliament / EU-specific nodes (flag colours) |

Text on dark fills should be `#ffffff`; text on light fills can stay default
(black/inherit).

### Quick reference — class definitions

When a diagram has many nodes that share a role, define classes once:

```mermaid
graph LR
    classDef primary  fill:#1565c0,stroke:#0d47a1,color:#fff
    classDef success  fill:#2e7d32,stroke:#1b5e20,color:#fff
    classDef warning  fill:#f57c00,stroke:#e65100,color:#fff
    classDef danger   fill:#c62828,stroke:#b71c1c,color:#fff
    classDef external fill:#fbc02d,stroke:#f57f17,color:#000
    classDef neutral  fill:#37474f,stroke:#263238,color:#fff

    A[Primary]:::primary --> B[Success]:::success --> C[Warning]:::warning
    C --> D[Danger]:::danger --> E[External]:::external --> F[Neutral]:::neutral
```

## 3. Validation workflow

```bash
# Parse every mermaid block under root *.md and .github/*.md
npm run test:mermaid

# Lowercase hex literals across all source mermaid blocks (idempotent)
npx tsx scripts/validate-mermaid-diagrams.ts --normalize-colors

# Wrap every unquoted node label that contains an icon (emoji) or
# Mermaid-special punctuation (`@`, `:`, `(`, `)`, `{`, `}`, `&`, `;`) in
# double quotes — fixes the most common GitHub-rendered-but-fragile diagrams.
npx tsx scripts/validate-mermaid-diagrams.ts --quote-icons

# Both transforms in one pass
npx tsx scripts/validate-mermaid-diagrams.ts --fix
```

The validator skips generated mirrors (`docs/api*`, `docs/api-markdown/_media/`)
and agent prompts (`.github/agents/`); update `SKIP_DIR_NAMES` in the script
when adding new generated trees.

## 4. Common parse failures and fixes

| Symptom (from `npm run test:mermaid`) | Cause | Fix |
| --- | --- | --- |
| `Expecting … got 'LINK_ID'` | Unquoted `@` inside a `[ ]` node label (Mermaid v11 reads it as an edge ID). | Wrap the label in double quotes: `N["foo@bar"]`. |
| `Expecting … got 'DIAMOND_START'` | Unquoted `{` / `}` inside a `[ ]` node label. | Wrap in quotes: `N["resource/{id}"]`. |
| `Lexical error … Unrecognized text` | A reserved keyword (`end`, `style`, `class`) used as a bare node ID. | Rename the node (e.g. `endNode`) or quote the label. |
| `Got 'PE'` / `'SQE'` | Unbalanced brackets in nested shapes. | Match every `[` `(` `{` with its closer; quote labels that contain literal brackets. |

## 5. References

- Mermaid syntax: <https://mermaid.js.org/intro/syntax-reference.html>
- Hack23 Secure Development Policy — Documentation Standards
- Material colour system (palette inspiration): <https://m2.material.io/design/color/the-color-system.html>
