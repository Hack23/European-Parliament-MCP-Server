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
  const results: string[] = [];
  let match: RegExpExecArray | null = regex.exec(xml);
  while (match !== null) {
    results.push(sanitizeText(match[1] ?? ''));
    match = regex.exec(xml);
  }
  return results;
}

/**
 * Extract a single attribute value from an XML element string.
 */
function extractAttribute(element: string, attrName: string): string {
  const regex = new RegExp(`${attrName}="([^"]*)"`, 'i');
  const match = regex.exec(element);
  return match?.[1] ?? '';
}

/**
 * Extract full element strings matching a tag name.
 */
function extractElements(xml: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}[^>]*(?:/>|>[\\s\\S]*?</${tagName}>)`, 'gi');
  const results: string[] = [];
  let match: RegExpExecArray | null = regex.exec(xml);
  while (match !== null) {
    results.push(match[0]);
    match = regex.exec(xml);
  }
  return results;
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

  // Match member elements - multiple possible formats
  const memberRegex = /(?:PoliticalGroup\.Member\.Name|Member\.Name|Name)[^>]*MepId="(\d+)"[^>]*>([^<]*)</gi;
  let memberMatch: RegExpExecArray | null = memberRegex.exec(groupXml);
  while (memberMatch !== null) {
    const mepId = memberMatch[1] ?? '';
    const name = sanitizeText(memberMatch[2] ?? '');
    if (mepId !== '' && name !== '') {
      votes.push({ mepId, name, politicalGroup: groupName });
    }
    memberMatch = memberRegex.exec(groupXml);
  }
}

/**
 * Parse a single RCV vote element into a structured result.
 */
function parseSingleRcvVote(voteXml: string, fallbackId: string): RcvVoteResult {
  const voteId = extractAttribute(voteXml, 'Identifier') ||
    extractAttribute(voteXml, 'Number') ||
    fallbackId;

  // Description/subject
  const descTexts = extractTagContent(voteXml, 'RollCallVote\\.Description\\.Text');
  const fallbackDesc = extractTagContent(voteXml, 'Description\\.Text');
  const description = descTexts[0] ?? fallbackDesc[0] ?? '';

  // Reference
  const refTexts = extractTagContent(voteXml, 'RollCallVote\\.Reference');
  const reference = refTexts[0] ?? extractAttribute(voteXml, 'Reference');

  // FOR section
  const forSections = extractElements(voteXml, 'Result\\.For');
  const forSection = forSections[0];
  const votesFor = forSection !== undefined ? parseRcvMepVotes(forSection) : [];

  // AGAINST section
  const againstSections = extractElements(voteXml, 'Result\\.Against');
  const againstSection = againstSections[0];
  const votesAgainst = againstSection !== undefined ? parseRcvMepVotes(againstSection) : [];

  // ABSTENTION section
  const abstSections = extractElements(voteXml, 'Result\\.Abstention');
  const abstSection = abstSections[0];
  const abstentions = abstSection !== undefined ? parseRcvMepVotes(abstSection) : [];

  // Determine result - if more FOR than AGAINST
  const result: 'ADOPTED' | 'REJECTED' = votesFor.length > votesAgainst.length ? 'ADOPTED' : 'REJECTED';

  return {
    voteId,
    description: sanitizeText(description),
    reference: sanitizeText(reference),
    votesFor,
    votesAgainst,
    abstentions,
    result,
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
 * Parse a single VOT row into a structured result.
 */
function parseSingleVotResult(row: string, fallbackNumber: string): VotVoteResult {
  const itemNumber = extractAttribute(row, 'Number') ||
    extractAttribute(row, 'Item') ||
    fallbackNumber;

  const subject = extractTagContent(row, 'Subject')[0] ??
    extractTagContent(row, 'Title')[0] ?? '';
  const reference = extractTagContent(row, 'Reference')[0] ?? '';

  const votesFor = parseVoteCount(extractTagContent(row, 'For')[0]);
  const votesAgainst = parseVoteCount(extractTagContent(row, 'Against')[0]);
  const abstentions = parseVoteCount(extractTagContent(row, 'Abstention')[0]);

  const resultStr = extractTagContent(row, 'Result')[0] ?? '';
  const voteType = extractAttribute(row, 'Type') ||
    (extractTagContent(row, 'VoteType')[0] ?? 'single');

  return {
    itemNumber,
    subject: sanitizeText(subject),
    reference: sanitizeText(reference),
    votesFor,
    votesAgainst,
    abstentions,
    result: determineVotOutcome(resultStr),
    voteType: sanitizeText(voteType),
  };
}

/**
 * Parse a VOT (Vote Results) XML document into structured results.
 *
 * @param xml - Raw XML string from VOT document
 * @returns Array of parsed aggregate vote results
 */
export function parseVotXml(xml: string): VotVoteResult[] {
  // VOT XML uses table-row-like structures
  const rows = extractElements(xml, 'Vote\\.Result');
  const voteItems = rows.length > 0 ? rows : extractElements(xml, 'Result');

  return voteItems.map((row, idx) =>
    parseSingleVotResult(row, String(idx + 1))
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
  return votResults.map((vot, index) => ({
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
  }));
}
