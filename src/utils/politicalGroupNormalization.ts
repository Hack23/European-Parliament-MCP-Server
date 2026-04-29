/**
 * Shared political-group label normalization for European Parliament tools.
 *
 * Maps raw political-group labels returned by the EP Open Data Portal API
 * (short codes, URI suffixes, full group names, native-language acronyms,
 * and historical EP9→EP10 successor labels) onto a single set of canonical
 * EP10 short codes (`EPP`, `S&D`, `Renew`, `Greens/EFA`, `ECR`, `PfE`,
 * `The Left`, `ESN`, `NI`).
 *
 * Originally lived inside `src/tools/analyzeCoalitionDynamics.ts`; extracted
 * to a shared module so `generate_political_landscape` and any future
 * group-aware tool can reuse the same alias table without depending on the
 * coalition-dynamics module. `analyzeCoalitionDynamics.ts` re-exports
 * `normalizePoliticalGroup` for backward compatibility.
 *
 * @module utils/politicalGroupNormalization
 */

/**
 * Alias table mapping normalized lowercase EP API political-group labels to
 * canonical short codes. Covers common variants observed on the EP Open Data
 * Portal: URI suffixes, full group names, historical names (pre-EP10), and
 * succession relationships (e.g. `ID → PfE` post-July-2024).
 *
 * Keys are lowercased with whitespace trimmed; {@link normalizePoliticalGroup}
 * additionally strips the URI path prefix before lookup.
 */
const POLITICAL_GROUP_ALIASES: ReadonlyMap<string, string> = new Map([
  // EPP variants — including French/Italian native names observed in the
  // EP Open Data Portal (e.g. URI suffix `…/corporate-body/PPE`, full
  // French group name `Groupe du Parti populaire européen…`). Added in
  // response to Hack23/euparliamentmonitor 2026-04-24 propositions Defect
  // #4 where `memberCount: 0` was reported for EPP because the upstream
  // returned the French acronym `PPE`.
  ['epp', 'EPP'],
  ['epp-ed', 'EPP'],
  // EP Open Data Portal also returns the French acronym `PPE` (Parti Populaire
  // Européen) for the EPP group, e.g. as the URI suffix
  // `…/corporate-body/PPE`. See `analyze_coalition_dynamics` reliability audit
  // (Hack23/euparliamentmonitor 2026-04-24 propositions, Defect #4).
  ['ppe', 'EPP'],
  ['ppe-de', 'EPP'],
  ['groupe du parti populaire européen (démocrates-chrétiens)', 'EPP'],
  ['groupe du parti populaire européen', 'EPP'],
  ['parti populaire européen', 'EPP'],
  ["group of the european people's party (christian democrats)", 'EPP'],
  ["group of the european people's party", 'EPP'],
  ["european people's party", 'EPP'],
  ['european people’s party', 'EPP'],
  // S&D variants — `SOC` and `PSE` are older / native acronyms returned
  // by the EP API in some responses; the French group name is included for
  // the same reason as the EPP variants above.
  ['s&d', 'S&D'],
  ['sd', 'S&D'],
  ['s-d', 'S&D'],
  ['soc', 'S&D'],
  ['pse', 'S&D'],
  ['group of the progressive alliance of socialists and democrats in the european parliament', 'S&D'],
  ['progressive alliance of socialists and democrats', 'S&D'],
  ['groupe de l\'alliance progressiste des socialistes et démocrates au parlement européen', 'S&D'],
  // Renew Europe variants
  ['renew', 'Renew'],
  ['re', 'Renew'],
  ['renew europe', 'Renew'],
  ['renew europe group', 'Renew'],
  ['alde', 'Renew'],
  // Greens/EFA variants — EP URI suffix is `Verts-ALE`
  ['greens/efa', 'Greens/EFA'],
  ['greens-efa', 'Greens/EFA'],
  ['verts/ale', 'Greens/EFA'],
  ['verts-ale', 'Greens/EFA'],
  ['group of the greens/european free alliance', 'Greens/EFA'],
  ['the greens/european free alliance', 'Greens/EFA'],
  ['greens/european free alliance', 'Greens/EFA'],
  ['groupe des verts/alliance libre européenne', 'Greens/EFA'],
  // ECR variants
  ['ecr', 'ECR'],
  ['european conservatives and reformists group', 'ECR'],
  ['european conservatives and reformists', 'ECR'],
  // PfE variants (successor to ID from July 2024)
  ['pfe', 'PfE'],
  ['patriots for europe', 'PfE'],
  ['id', 'PfE'],
  ['identity and democracy', 'PfE'],
  ['identity and democracy group', 'PfE'],
  // The Left (GUE/NGL) variants
  ['the left', 'The Left'],
  ['gue/ngl', 'The Left'],
  ['gue-ngl', 'The Left'],
  ['the left in the european parliament - gue/ngl', 'The Left'],
  ['the left group in the european parliament - gue/ngl', 'The Left'],
  ['confederal group of the european united left - nordic green left', 'The Left'],
  // ESN (new EP10 group)
  ['esn', 'ESN'],
  ['europe of sovereign nations', 'ESN'],
  ['europe of sovereign nations group', 'ESN'],
  // Non-Inscrits variants
  ['ni', 'NI'],
  ['non-attached', 'NI'],
  ['non-inscrits', 'NI'],
  ['non-attached members', 'NI'],
]);

/**
 * Normalizes a raw political-group label returned by the EP Open Data Portal
 * API to a canonical short code (e.g. `EPP`, `S&D`, `PfE`).
 *
 * Handles three common EP API formats:
 * 1. **Short codes** — already canonical (`EPP`, `S&D`, ...) are returned as-is
 *    after lookup (case-insensitive).
 * 2. **URI identifiers** — e.g. `http://publications.europa.eu/.../corporate-body/EPP`.
 *    The URI suffix is extracted and then looked up.
 * 3. **Full group names** — e.g. `"Group of the European People's Party (Christian Democrats)"`.
 *    Matched case-insensitively against the internal alias table.
 *
 * Also handles succession relationships so historical pre-EP10 labels (e.g.
 * `ID` from EP9) are counted against their EP10 successor (`PfE`).
 *
 * @param raw - Raw political-group label from the EP API (may be empty/unknown)
 * @returns Canonical short code when recognized, otherwise the original `raw`
 *   string trimmed (so callers can surface unrecognized labels as a data-quality
 *   warning).
 */
export function normalizePoliticalGroup(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed === '' || trimmed.toLowerCase() === 'unknown') return trimmed;
  // Strip URI path prefix if present — preserves the last segment for lookup.
  const lastSlash = trimmed.lastIndexOf('/');
  const suffix = lastSlash >= 0 ? trimmed.substring(lastSlash + 1) : trimmed;
  const key = suffix.toLowerCase().trim();
  const canonical = POLITICAL_GROUP_ALIASES.get(key);
  if (canonical !== undefined) return canonical;
  // Also try the full original string (handles full group names that include
  // slashes like "Greens/EFA" where stripping the URI prefix would be wrong).
  const fullKey = trimmed.toLowerCase();
  const canonicalFull = POLITICAL_GROUP_ALIASES.get(fullKey);
  if (canonicalFull !== undefined) return canonicalFull;
  return trimmed;
}
