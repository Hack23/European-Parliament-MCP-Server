/**
 * @fileoverview XML parser for European Parliament DOCEO vote documents
 *
 * Parses two types of EP plenary vote XML documents:
 * - **RCV** (Roll-Call Votes): Individual MEP voting positions by political group
 * - **VOT** (Vote Results): Aggregate vote results with subject descriptions
 *
 * XML source: `https://www.europarl.europa.eu/doceo/document/PV-{term}-{date}-{type}_EN.xml`
 *
 * @module clients/ep/doceoXmlParser
 * @security Input sanitization applied to all parsed XML text content
 */

/**
 * Represents an individual MEP's vote from the RCV XML.
 */
export interface RcvMepVote {
  /** MEP identifier from the XML (MepId attribute) */
  mepId: string;
  /** MEP full name */
  name: string;
  /** Political group abbreviation */
  politicalGroup: string;
  /** ISO 3166-1 alpha-2 country code from the Country attribute (optional) */
  country?: string;
}

/**
 * Parsed roll-call vote result from RCV XML.
 */
export interface RcvVoteResult {
  /** Vote number/identifier within the session */
  voteId: string;
  /** Description/subject of the vote */
  description: string;
  /** Reference (e.g., procedure reference like "A10-0123/2026") */
  reference: string;
  /** MEPs who voted FOR */
  votesFor: RcvMepVote[];
  /** MEPs who voted AGAINST */
  votesAgainst: RcvMepVote[];
  /** MEPs who ABSTAINED */
  abstentions: RcvMepVote[];
  /** Intended result interpretation */
  result: 'ADOPTED' | 'REJECTED';
  /** Sitting date from Date attribute on RollCallVote.Result (YYYY-MM-DD; empty string if absent) */
  sittingDate: string;
  /** Sitting number from Number.Sitting attribute (empty string if absent) */
  sittingNumber: string;
  /** Vote type from Type attribute on RollCallVote.Result (empty string if absent) */
  voteType: string;
  /** Official FOR count from Number attribute on Result.For; falls back to MEP count */
  officialForCount: number;
  /** Official AGAINST count from Number attribute on Result.Against; falls back to MEP count */
  officialAgainstCount: number;
  /** Official ABSTENTION count from Number attribute on Result.Abstention; falls back to MEP count */
  officialAbstentionCount: number;
  /** MEPs listed in the Correction element (empty array if absent) */
  corrections: RcvMepVote[];
}

/**
 * Parsed vote result from VOT XML (aggregate format).
 */
export interface VotVoteResult {
  /** Vote item number */
  itemNumber: string;
  /** Subject/title of the vote */
  subject: string;
  /** Document reference */
  reference: string;
  /** Number of votes in favor */
  votesFor: number;
  /** Number of votes against */
  votesAgainst: number;
  /** Number of abstentions */
  abstentions: number;
  /** Vote outcome */
  result: 'ADOPTED' | 'REJECTED';
  /** Vote type (e.g., "single", "split", "separate", "amendment") */
  voteType: string;
  /** Title of the parent Table element (empty string if absent) */
  tableTitle: string;
  /** Row/Vote.Result Type attribute value (empty string if absent) */
  rowType: string;
  /** Official FOR count from For attribute on Result.Group (0 if absent) */
  officialForCount: number;
  /** Official AGAINST count from Against attribute on Result.Group (0 if absent) */
  officialAgainstCount: number;
  /** Official ABSTENTION count from Abst attribute on Result.Group (0 if absent) */
  officialAbstentionCount: number;
}

/**
 * Combined latest votes result merging RCV and VOT data.
 */
export interface LatestVoteRecord {
  /** Unique vote identifier */
  id: string;
  /** Session date (YYYY-MM-DD) */
  date: string;
  /** Parliamentary term number */
  term: number;
  /** Subject/description of the vote */
  subject: string;
  /** Document/procedure reference */
  reference: string;
  /** Total votes in favor */
  votesFor: number;
  /** Total votes against */
  votesAgainst: number;
  /** Total abstentions */
  abstentions: number;
  /** Vote outcome */
  result: 'ADOPTED' | 'REJECTED';
  /** Individual MEP votes (from RCV data, keyed by mepId) */
  mepVotes?: Record<string, 'FOR' | 'AGAINST' | 'ABSTAIN'>;
  /** Political group breakdown of votes */
  groupBreakdown?: Record<string, { for: number; against: number; abstain: number }>;
  /** Source URL of the XML document */
  sourceUrl: string;
  /** Which XML document type provided the data */
  dataSource: 'RCV' | 'VOT';
  /** Vote type from the XML Type attribute (optional) */
  voteType?: string;
  /** Sitting date from RCV data (YYYY-MM-DD; optional) */
  sittingDate?: string;
  /** Sitting number from RCV data (optional) */
  sittingNumber?: string;
  /** Official counts from XML Number/For/Against/Abst attributes (optional) */
  officialCounts?: { for: number; against: number; abstentions: number };
  /** Vote corrections from RCV Correction element (optional) */
  corrections?: RcvMepVote[];
}

// ─── XML Text Extraction Helpers ──────────────────────────────────────────────

/**
 * Sanitize XML text content to prevent injection issues.
 * Strips control characters and trims whitespace.
 */
function sanitizeText(text: string): string {
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').trim();
}

/**
 * Extract text content between XML tags using regex.
 * This is a lightweight parser that avoids adding heavy XML parsing dependencies.
 */
function extractTagContent(xml: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, 'gi');
  return [...xml.matchAll(regex)].map(m => sanitizeText(m[1] ?? ''));
}

/**
 * Decode common XML character entities in an attribute value using a single-pass
 * replacement map. Decodes &amp; &lt; &gt; &quot; &apos; to their literal characters.
 */
function decodeXmlEntities(value: string): string {
  const XML_ENTITIES: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
  };
  return value.replace(/&(amp|lt|gt|quot|apos);/g, (_, entity: string) => XML_ENTITIES[entity] ?? `&${entity};`);
}

/**
 * Extract a single attribute value from an XML element string.
 */
function extractAttribute(element: string, attrName: string): string {
  const regex = new RegExp(`${attrName}="([^"]*)"`, 'i');
  const match = regex.exec(element);
  return decodeXmlEntities(match?.[1] ?? '');
}

/**
 * Extract full element strings matching a tag name.
 */
function extractElements(xml: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}[^>]*(?:/>|>[\\s\\S]*?</${tagName}>)`, 'gi');
  return [...xml.matchAll(regex)].map(m => m[0]);
}

// ─── RCV XML Parser ───────────────────────────────────────────────────────────

/**
 * Extract MEP vote entries from an RCV result section (For/Against/Abstention).
 */
function parseRcvMepVotes(sectionXml: string): RcvMepVote[] {
  const votes: RcvMepVote[] = [];
  // Political groups
  const groupElements = extractElements(sectionXml, 'PoliticalGroup\\.List');
  if (groupElements.length === 0) {
    // Try alternate format with Result.PoliticalGroup.List
    const altGroups = extractElements(sectionXml, 'Result\\.PoliticalGroup\\.List');
    for (const groupSection of altGroups) {
      parseGroupSection(groupSection, votes);
    }
    // Also try direct PoliticalGroup elements
    const directGroups = extractElements(sectionXml, 'PoliticalGroup');
    for (const groupEl of directGroups) {
      parseGroupSection(groupEl, votes);
    }
  } else {
    for (const groupSection of groupElements) {
      parseGroupSection(groupSection, votes);
    }
  }
  return votes;
}

/**
 * Parse a political group section and extract member votes.
 */
function parseGroupSection(groupXml: string, votes: RcvMepVote[]): void {
  const groupName = extractAttribute(groupXml, 'Identifier') ||
    extractAttribute(groupXml, 'Name') || 'Unknown';

  // Match member element opening tags to capture all attributes then text
  const memberTagRegex = /<(?:PoliticalGroup\.Member\.Name|Member\.Name|Name)([^>]*)>([^<]*)</gi;
  for (const memberMatch of groupXml.matchAll(memberTagRegex)) {
    const attrs = memberMatch[1] ?? '';
    const name = sanitizeText(memberMatch[2] ?? '');
    const mepId = extractAttribute(attrs, 'MepId');
    const country = extractAttribute(attrs, 'Country');
    if (mepId !== '' && name !== '') {
      const vote: RcvMepVote = { mepId, name, politicalGroup: groupName };
      if (country !== '') vote.country = country;
      votes.push(vote);
    }
  }
}

/**
 * Extract the official count from a Result.For/Against/Abstention element.
 * Falls back to the parsed MEP array length when the Number attribute is absent.
 */
function extractOfficialCount(section: string | undefined, fallback: number): number {
  if (section === undefined) return fallback;
  const raw = extractAttribute(section, 'Number');
  const parsed = parseInt(raw, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

/**
 * Parse a FOR/AGAINST/ABSTENTION/CORRECTION section element into votes + official count.
 * Extracts all votes in a section element using the appropriate tag name.
 */
function parseRcvMepSection(voteXml: string, tagName: string): { votes: RcvMepVote[]; count: number } {
  const section = extractElements(voteXml, tagName)[0];
  const votes = section !== undefined ? parseRcvMepVotes(section) : [];
  return { votes, count: extractOfficialCount(section, votes.length) };
}

/**
 * Resolve VOT vote counts, preferring official Result.Group attributes over tag content.
 */
function resolveVotCounts(row: string): { for: number; against: number; abst: number } {
  const rg = extractResultGroupCounts(row);
  return {
    for: rg.for > 0 ? rg.for : parseVoteCount(extractTagContent(row, 'For')[0]),
    against: rg.against > 0 ? rg.against : parseVoteCount(extractTagContent(row, 'Against')[0]),
    abst: rg.abst > 0 ? rg.abst : parseVoteCount(extractTagContent(row, 'Abstention')[0]),
  };
}

/**
 * Select effective vote type, preferring rowType (Table/Row format) over voteType.
 * Returns undefined when both are empty strings.
 */
function pickVoteType(rowType: string, voteType: string): string | undefined {
  if (rowType !== '') return rowType;
  if (voteType !== '') return voteType;
  return undefined;
}

/**
 * Parse a single RCV vote element into a structured result.
 */
function parseSingleRcvVote(voteXml: string, fallbackId: string): RcvVoteResult {
  const voteId = extractAttribute(voteXml, 'Identifier') ||
    extractAttribute(voteXml, 'Number') ||
    fallbackId;

  // Sitting metadata
  const sittingDate = extractAttribute(voteXml, 'Date');
  const sittingNumber = extractAttribute(voteXml, 'Number\\.Sitting');
  const voteType = extractAttribute(voteXml, 'Type');

  // Description/subject
  const descTexts = extractTagContent(voteXml, 'RollCallVote\\.Description\\.Text');
  const fallbackDesc = extractTagContent(voteXml, 'Description\\.Text');
  const description = descTexts[0] ?? fallbackDesc[0] ?? '';

  // Reference
  const refTexts = extractTagContent(voteXml, 'RollCallVote\\.Reference');
  const reference = refTexts[0] ?? extractAttribute(voteXml, 'Reference');

  // FOR / AGAINST / ABSTENTION / CORRECTION sections via shared helper
  const forData = parseRcvMepSection(voteXml, 'Result\\.For');
  const againstData = parseRcvMepSection(voteXml, 'Result\\.Against');
  const abstData = parseRcvMepSection(voteXml, 'Result\\.Abstention');
  const corrData = parseRcvMepSection(voteXml, 'Correction');

  // Determine result using official counts (prefer over MEP array length)
  const result: 'ADOPTED' | 'REJECTED' = forData.count > againstData.count ? 'ADOPTED' : 'REJECTED';

  return {
    voteId,
    description: sanitizeText(description),
    reference: sanitizeText(reference),
    votesFor: forData.votes,
    votesAgainst: againstData.votes,
    abstentions: abstData.votes,
    result,
    sittingDate,
    sittingNumber,
    voteType,
    officialForCount: forData.count,
    officialAgainstCount: againstData.count,
    officialAbstentionCount: abstData.count,
    corrections: corrData.votes,
  };
}

/**
 * Parse a complete RCV XML document into structured vote results.
 *
 * @param xml - Raw XML string from RCV document
 * @returns Array of parsed roll-call vote results
 */
export function parseRcvXml(xml: string): RcvVoteResult[] {
  // Each RollCallVote.Result is a separate vote
  const voteElements = extractElements(xml, 'RollCallVote\\.Result');
  // Fallback: try RollCallVote element name
  const voteElems = voteElements.length > 0 ? voteElements : extractElements(xml, 'RollCallVote');

  return voteElems.map((voteXml, idx) =>
    parseSingleRcvVote(voteXml, String(idx + 1))
  );
}

// ─── VOT XML Parser ───────────────────────────────────────────────────────────

/**
 * Parse a single VOT row into a structured result.
 */
/**
 * Determine vote outcome from result text.
 */
function determineVotOutcome(resultStr: string): 'ADOPTED' | 'REJECTED' {
  const upper = resultStr.toUpperCase();
  return upper.includes('ADOPT') || upper.includes('+') ? 'ADOPTED' : 'REJECTED';
}

/**
 * Extract official counts from a Result.Group element.
 */
function extractResultGroupCounts(row: string): { for: number; against: number; abst: number } {
  const rgSections = extractElements(row, 'Result\\.Group');
  const rg = rgSections[0];
  if (rg === undefined) return { for: 0, against: 0, abst: 0 };
  return {
    for: parseInt(extractAttribute(rg, 'For'), 10) || 0,
    against: parseInt(extractAttribute(rg, 'Against'), 10) || 0,
    abst: parseInt(extractAttribute(rg, 'Abst'), 10) || 0,
  };
}

/**
 * Extract the best available result string from a VOT row.
 */
function extractVotResultString(row: string): string {
  return extractTagContent(row, 'Result')[0] ??
    extractTagContent(row, 'Row\\.Result')[0] ??
    '';
}

/**
 * Parse a single VOT row into a structured result.
 */
function parseSingleVotResult(row: string, fallbackNumber: string, tableTitle = ''): VotVoteResult {
  const itemNumber = extractAttribute(row, 'Number') ||
    extractAttribute(row, 'Item') ||
    fallbackNumber;

  const rowType = extractAttribute(row, 'Type');
  const subject = extractTagContent(row, 'Subject')[0] ??
    extractTagContent(row, 'Title')[0] ?? '';
  const reference = extractTagContent(row, 'Reference')[0] ?? '';

  const counts = resolveVotCounts(row);
  const resultStr = extractVotResultString(row);
  const voteType = extractAttribute(row, 'Type') ||
    (extractTagContent(row, 'VoteType')[0] ?? 'single');

  return {
    itemNumber,
    subject: sanitizeText(subject),
    reference: sanitizeText(reference),
    votesFor: counts.for,
    votesAgainst: counts.against,
    abstentions: counts.abst,
    result: determineVotOutcome(resultStr),
    voteType: sanitizeText(voteType),
    tableTitle: sanitizeText(tableTitle),
    rowType: sanitizeText(rowType),
    officialForCount: counts.for,
    officialAgainstCount: counts.against,
    officialAbstentionCount: counts.abst,
  };
}

/**
 * Parse VOT XML in Table/Row format, extracting table title from each Table element.
 *
 * @param xml - Raw XML string
 * @returns Parsed results or empty array if no Table elements found
 */
function parseVotTableFormat(xml: string): VotVoteResult[] {
  const tableElements = extractElements(xml, 'Table');
  if (tableElements.length === 0) return [];

  const results: VotVoteResult[] = [];
  for (const table of tableElements) {
    const tableTitle = extractAttribute(table, 'Title');
    const rows = extractElements(table, 'Row');
    for (const row of rows) {
      results.push(parseSingleVotResult(row, String(results.length + 1), tableTitle));
    }
  }
  return results;
}

/**
 * Parse a VOT (Vote Results) XML document into structured results.
 *
 * Tries Table/Row format first (newer EP DOCEO format), then falls back
 * to Vote.Result / Result element format.
 *
 * @param xml - Raw XML string from VOT document
 * @returns Array of parsed aggregate vote results
 */
export function parseVotXml(xml: string): VotVoteResult[] {
  // Try Table/Row format first (newer format with Title attribute)
  const tableResults = parseVotTableFormat(xml);
  if (tableResults.length > 0) return tableResults;

  // Fallback: Vote.Result / Result element format
  const rows = extractElements(xml, 'Vote\\.Result');
  const voteItems = rows.length > 0 ? rows : extractElements(xml, 'Result');

  return voteItems.map((row, idx) =>
    parseSingleVotResult(row, String(idx + 1), '')
  );
}

/**
 * Parse a vote count from text, handling both numeric and empty values.
 */
function parseVoteCount(text: string | undefined): number {
  if (text === undefined || text === '') return 0;
  const num = parseInt(text.replace(/\D/g, ''), 10);
  return Number.isNaN(num) ? 0 : num;
}

// ─── URL Construction ─────────────────────────────────────────────────────────

/** Base URL for EP DOCEO document system */
export const DOCEO_BASE_URL = 'https://www.europarl.europa.eu/doceo/document/';

/**
 * Current parliamentary term number (10th Parliament: 2024-2029).
 */
export const CURRENT_PARLIAMENTARY_TERM = 10;

/**
 * Build the DOCEO XML URL for a given date and document type.
 *
 * @param date - Date string in YYYY-MM-DD format
 * @param type - Document type: 'RCV' for roll-call votes, 'VOT' for vote results
 * @param term - Parliamentary term number (defaults to current term 10)
 * @param language - Language code (defaults to 'EN')
 * @returns Full URL to the XML document
 *
 * @example
 * ```typescript
 * buildDoceoUrl('2026-04-27', 'RCV')
 * // => 'https://www.europarl.europa.eu/doceo/document/PV-10-2026-04-27-RCV_EN.xml'
 * ```
 */
export function buildDoceoUrl(
  date: string,
  type: 'RCV' | 'VOT',
  term = CURRENT_PARLIAMENTARY_TERM,
  language = 'EN'
): string {
  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Invalid date format: ${date}. Expected YYYY-MM-DD.`);
  }
  return `${DOCEO_BASE_URL}PV-${String(term)}-${date}-${type}_${language}.xml`;
}

/**
 * Get dates for the most recent plenary week (Monday-Thursday).
 * If a specific week start date is provided, uses that week.
 * Otherwise calculates the most recent Monday.
 *
 * @param weekStart - Optional Monday date (YYYY-MM-DD) to use as start of plenary week
 * @returns Array of date strings for the plenary week (Mon-Thu)
 */
export function getPlenaryWeekDates(weekStart?: string): string[] {
  let monday: Date;

  if (weekStart !== undefined && weekStart !== '') {
    monday = new Date(`${weekStart}T00:00:00Z`);
  } else {
    // Find the most recent Monday
    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const daysBack = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    monday = new Date(now);
    monday.setUTCDate(now.getUTCDate() - daysBack);
  }

  const dates: string[] = [];
  for (let i = 0; i < 4; i++) {
    const day = new Date(monday);
    day.setUTCDate(monday.getUTCDate() + i);
    dates.push(day.toISOString().slice(0, 10));
  }
  return dates;
}

// ─── Merge RCV + VOT Data ─────────────────────────────────────────────────────

/**
 * Build group breakdown from RCV vote data.
 */
function buildGroupBreakdown(
  rcv: RcvVoteResult
): Record<string, { for: number; against: number; abstain: number }> {
  const breakdown: Record<string, { for: number; against: number; abstain: number }> = {};

  for (const vote of rcv.votesFor) {
    const group = vote.politicalGroup;
    breakdown[group] ??= { for: 0, against: 0, abstain: 0 };
    breakdown[group].for++;
  }
  for (const vote of rcv.votesAgainst) {
    const group = vote.politicalGroup;
    breakdown[group] ??= { for: 0, against: 0, abstain: 0 };
    breakdown[group].against++;
  }
  for (const vote of rcv.abstentions) {
    const group = vote.politicalGroup;
    breakdown[group] ??= { for: 0, against: 0, abstain: 0 };
    breakdown[group].abstain++;
  }

  return breakdown;
}

/**
 * Build MEP votes map from RCV data.
 */
function buildMepVotesMap(
  rcv: RcvVoteResult
): Record<string, 'FOR' | 'AGAINST' | 'ABSTAIN'> {
  const map: Record<string, 'FOR' | 'AGAINST' | 'ABSTAIN'> = {};
  for (const v of rcv.votesFor) map[v.mepId] = 'FOR';
  for (const v of rcv.votesAgainst) map[v.mepId] = 'AGAINST';
  for (const v of rcv.abstentions) map[v.mepId] = 'ABSTAIN';
  return map;
}

/**
 * Convert parsed RCV results into LatestVoteRecord format.
 *
 * @param rcvResults - Parsed RCV vote results
 * @param date - Session date
 * @param term - Parliamentary term
 * @param sourceUrl - Source XML URL
 * @returns Array of LatestVoteRecord
 */
export function rcvToLatestVotes(
  rcvResults: RcvVoteResult[],
  date: string,
  term = CURRENT_PARLIAMENTARY_TERM,
  sourceUrl = ''
): LatestVoteRecord[] {
  return rcvResults.map((rcv, index) => ({
    id: `RCV-${String(term)}-${date}-${String(index + 1).padStart(3, '0')}`,
    date,
    term,
    subject: rcv.description || rcv.reference || `Vote #${String(index + 1)}`,
    reference: rcv.reference,
    votesFor: rcv.votesFor.length,
    votesAgainst: rcv.votesAgainst.length,
    abstentions: rcv.abstentions.length,
    result: rcv.result,
    mepVotes: buildMepVotesMap(rcv),
    groupBreakdown: buildGroupBreakdown(rcv),
    sourceUrl,
    dataSource: 'RCV' as const,
    ...(rcv.voteType !== '' && { voteType: rcv.voteType }),
    ...(rcv.sittingDate !== '' && { sittingDate: rcv.sittingDate }),
    ...(rcv.sittingNumber !== '' && { sittingNumber: rcv.sittingNumber }),
    officialCounts: {
      for: rcv.officialForCount,
      against: rcv.officialAgainstCount,
      abstentions: rcv.officialAbstentionCount,
    },
    ...(rcv.corrections.length > 0 && { corrections: rcv.corrections }),
  }));
}

/**
 * Convert parsed VOT results into LatestVoteRecord format.
 *
 * @param votResults - Parsed VOT vote results
 * @param date - Session date
 * @param term - Parliamentary term
 * @param sourceUrl - Source XML URL
 * @returns Array of LatestVoteRecord
 */
export function votToLatestVotes(
  votResults: VotVoteResult[],
  date: string,
  term = CURRENT_PARLIAMENTARY_TERM,
  sourceUrl = ''
): LatestVoteRecord[] {
  return votResults.map((vot, index) => {
    const vt = pickVoteType(vot.rowType, vot.voteType);
    return {
      id: `VOT-${String(term)}-${date}-${String(index + 1).padStart(3, '0')}`,
      date,
      term,
      subject: vot.subject || vot.reference || `Vote item #${vot.itemNumber}`,
      reference: vot.reference,
      votesFor: vot.votesFor,
      votesAgainst: vot.votesAgainst,
      abstentions: vot.abstentions,
      result: vot.result,
      sourceUrl,
      dataSource: 'VOT' as const,
      ...(vt !== undefined && { voteType: vt }),
      officialCounts: {
        for: vot.officialForCount,
        against: vot.officialAgainstCount,
        abstentions: vot.officialAbstentionCount,
      },
    };
  });
}
