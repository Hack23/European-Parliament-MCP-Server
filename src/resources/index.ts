/**
 * MCP Resources for European Parliament Data Access
 * 
 * Resource templates and handlers for direct EP data access via MCP resources.
 * Resources provide a standardized way to read EP data using URI patterns.
 * 
 * **Intelligence Perspective:** Resources enable direct data access for intelligence
 * pipelines—bypassing tool call overhead for known-entity lookups and bulk retrieval.
 * 
 * **Business Perspective:** Resource URIs provide stable, addressable data endpoints
 * that enterprise integrations can cache, bookmark, and reference programmatically.
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 * 
 * @see https://spec.modelcontextprotocol.io/specification/server/resources/
 */

import { z } from 'zod';
import { epClient } from '../clients/europeanParliamentClient.js';

/**
 * Resource template metadata for MCP listing
 */
export interface ResourceTemplate {
  uriTemplate: string;
  name: string;
  description: string;
  mimeType: string;
}

/**
 * Resource content result
 */
export interface ResourceContent {
  uri: string;
  mimeType: string;
  text: string;
}

/**
 * Resource read result
 */
export interface ResourceReadResult {
  contents: ResourceContent[];
  [key: string]: unknown;
}

// ─── Resource Templates ──────────────────────────────────────

const mepResourceTemplate: ResourceTemplate = {
  uriTemplate: 'ep://meps/{mepId}',
  name: 'MEP Profile',
  description: 'European Parliament Member profile including biographical info, committee memberships, political group, and contact details.',
  mimeType: 'application/json'
};

const mepListResourceTemplate: ResourceTemplate = {
  uriTemplate: 'ep://meps',
  name: 'MEP List',
  description: 'List of current Members of the European Parliament with basic profile information.',
  mimeType: 'application/json'
};

const committeeResourceTemplate: ResourceTemplate = {
  uriTemplate: 'ep://committees/{committeeId}',
  name: 'Committee Information',
  description: 'European Parliament committee details including membership, leadership, and responsibilities.',
  mimeType: 'application/json'
};

const plenarySessionsResourceTemplate: ResourceTemplate = {
  uriTemplate: 'ep://plenary-sessions',
  name: 'Plenary Sessions',
  description: 'Recent European Parliament plenary sessions with dates, locations, and agenda items.',
  mimeType: 'application/json'
};

const votingRecordResourceTemplate: ResourceTemplate = {
  uriTemplate: 'ep://votes/{sessionId}',
  name: 'Voting Record',
  description: 'Voting records for a specific plenary session including vote breakdowns and results.',
  mimeType: 'application/json'
};

const politicalGroupsResourceTemplate: ResourceTemplate = {
  uriTemplate: 'ep://political-groups',
  name: 'Political Groups',
  description: 'European Parliament political groups with membership counts and leadership.',
  mimeType: 'application/json'
};

// ─── URI Validation ──────────────────────────────────────────

const MepIdSchema = z.string().min(1).max(100);
/** Generic resource ID validator (reused for procedures, plenary sessions, documents) */
const ResourceIdSchema = z.string().min(1).max(200);

/**
 * Match MEP resource URIs
 */
function matchMepUri(segments: string[]): { template: string; params: Record<string, string> } | null {
  if (segments[0] !== 'meps') return null;
  if (segments.length === 2 && segments[1] !== '') {
    return { template: 'mep_detail', params: { mepId: segments[1] ?? '' } };
  }
  if (segments.length === 1) {
    return { template: 'mep_list', params: {} };
  }
  return null;
}

/**
 * Match committee/session/vote resource URIs
 */
function matchOtherUri(segments: string[]): { template: string; params: Record<string, string> } | null {
  const resource = segments[0];
  if (resource === 'committees') {
    return matchCommitteeUri(segments);
  }
  if (resource === 'plenary-sessions' && segments.length === 1) {
    return { template: 'plenary_sessions', params: {} };
  }
  if (resource === 'votes') {
    return matchVoteUri(segments);
  }
  if (resource === 'political-groups' && segments.length === 1) {
    return { template: 'political_groups', params: {} };
  }
  // Extended URI patterns (not listed in getResourceTemplateArray)
  if (resource === 'procedures') {
    return matchProcedureUri(segments);
  }
  if (resource === 'plenary') {
    return matchPlenaryDetailUri(segments);
  }
  if (resource === 'documents') {
    return matchDocumentUri(segments);
  }
  return null;
}

/**
 * Match committee URI
 */
function matchCommitteeUri(segments: string[]): { template: string; params: Record<string, string> } | null {
  if (segments.length === 2 && segments[1] !== '') {
    return { template: 'committee_detail', params: { committeeId: segments[1] ?? '' } };
  }
  return null;
}

/**
 * Match vote URI
 */
function matchVoteUri(segments: string[]): { template: string; params: Record<string, string> } | null {
  if (segments.length === 2 && segments[1] !== '') {
    return { template: 'voting_record', params: { sessionId: segments[1] ?? '' } };
  }
  return null;
}

/**
 * Match procedure detail URI: ep://procedures/{id}
 */
function matchProcedureUri(segments: string[]): { template: string; params: Record<string, string> } | null {
  if (segments.length === 2 && segments[1] !== '') {
    return { template: 'procedure_detail', params: { procedureId: segments[1] ?? '' } };
  }
  return null;
}

/**
 * Match plenary detail URI: ep://plenary/{id}
 */
function matchPlenaryDetailUri(segments: string[]): { template: string; params: Record<string, string> } | null {
  if (segments.length === 2 && segments[1] !== '') {
    return { template: 'plenary_detail', params: { plenaryId: segments[1] ?? '' } };
  }
  return null;
}

/**
 * Match document detail URI: ep://documents/{id}
 */
function matchDocumentUri(segments: string[]): { template: string; params: Record<string, string> } | null {
  if (segments.length === 2 && segments[1] !== '') {
    return { template: 'document_detail', params: { documentId: segments[1] ?? '' } };
  }
  return null;
}

/**
 * Parse a resource URI and extract template parameters
 */
function parseResourceUri(uri: string): { template: string; params: Record<string, string> } {
  // Validate URI format
  if (!uri.startsWith('ep://')) {
    throw new Error(`Invalid resource URI scheme: ${uri}. Must start with "ep://"`);
  }

  const path = uri.slice(5); // Remove 'ep://'
  const segments = path.split('/');

  if (segments.length === 0 || segments[0] === '') {
    throw new Error(`Invalid resource URI: ${uri}`);
  }

  const mepMatch = matchMepUri(segments);
  if (mepMatch !== null) return mepMatch;

  const otherMatch = matchOtherUri(segments);
  if (otherMatch !== null) return otherMatch;

  throw new Error(`Unknown resource URI: ${uri}`);
}

// ─── Resource Handlers ───────────────────────────────────────

/**
 * Handle MEP detail resource request
 *
 * @param mepId - MEP identifier to look up
 * @returns Resource content with MEP details as JSON
 */
async function handleMepDetail(mepId: string): Promise<ResourceContent> {
  const validId = MepIdSchema.parse(mepId);
  const data = await epClient.getMEPDetails(validId);

  return {
    uri: `ep://meps/${validId}`,
    mimeType: 'application/json',
    text: JSON.stringify({
      ...data,
      _source: 'European Parliament Open Data Portal',
      _accessedAt: new Date().toISOString()
    }, null, 2)
  };
}

/**
 * Handle MEP list resource request
 *
 * @returns Resource content with paginated MEP list as JSON
 */
async function handleMepList(): Promise<ResourceContent> {
  const data = await epClient.getMEPs({ limit: 50 });

  return {
    uri: 'ep://meps',
    mimeType: 'application/json',
    text: JSON.stringify({
      ...data,
      _source: 'European Parliament Open Data Portal',
      _accessedAt: new Date().toISOString()
    }, null, 2)
  };
}

/**
 * Handle committee detail resource request
 *
 * @param committeeId - Committee identifier or abbreviation
 * @returns Resource content with committee details as JSON
 */
async function handleCommitteeDetail(committeeId: string): Promise<ResourceContent> {
  const validId = MepIdSchema.parse(committeeId);
  const data = await epClient.getCommitteeInfo({ abbreviation: validId });

  return {
    uri: `ep://committees/${validId}`,
    mimeType: 'application/json',
    text: JSON.stringify({
      ...data,
      _source: 'European Parliament Open Data Portal',
      _accessedAt: new Date().toISOString()
    }, null, 2)
  };
}

/**
 * Handle plenary sessions resource request
 *
 * @returns Resource content with recent plenary sessions as JSON
 */
async function handlePlenarySessions(): Promise<ResourceContent> {
  const data = await epClient.getPlenarySessions({ limit: 20 });

  return {
    uri: 'ep://plenary-sessions',
    mimeType: 'application/json',
    text: JSON.stringify({
      ...data,
      _source: 'European Parliament Open Data Portal',
      _accessedAt: new Date().toISOString()
    }, null, 2)
  };
}

/**
 * Handle voting record resource request
 *
 * @param sessionId - Session identifier for vote retrieval
 * @returns Resource content with voting records as JSON
 */
async function handleVotingRecord(sessionId: string): Promise<ResourceContent> {
  const validId = MepIdSchema.parse(sessionId);
  const data = await epClient.getVotingRecords({ sessionId: validId });

  return {
    uri: `ep://votes/${validId}`,
    mimeType: 'application/json',
    text: JSON.stringify({
      ...data,
      _source: 'European Parliament Open Data Portal',
      _accessedAt: new Date().toISOString()
    }, null, 2)
  };
}

/**
 * Handle political groups resource request
 *
 * @returns Resource content with political group composition as JSON
 */
async function handlePoliticalGroups(): Promise<ResourceContent> {
  const data = await epClient.getMEPs({ limit: 100 });

  // Extract unique political groups from MEP data
  const groups = new Map<string, number>();
  if (Array.isArray(data.data)) {
    for (const mep of data.data) {
      const group = (mep as { politicalGroup?: string }).politicalGroup ?? 'Unknown';
      groups.set(group, (groups.get(group) ?? 0) + 1);
    }
  }

  const groupList = Array.from(groups.entries()).map(([name, memberCount]) => ({
    name,
    memberCount
  }));

  return {
    uri: 'ep://political-groups',
    mimeType: 'application/json',
    text: JSON.stringify({
      politicalGroups: groupList,
      total: groupList.length,
      _source: 'European Parliament Open Data Portal',
      _accessedAt: new Date().toISOString()
    }, null, 2)
  };
}

/**
 * Handle procedure detail resource request (extended URI: ep://procedures/{id})
 *
 * @param procedureId - Legislative procedure identifier (process-id format YYYY-NNNN)
 * @returns Resource content with procedure details as JSON
 */
async function handleProcedureDetail(procedureId: string): Promise<ResourceContent> {
  const validId = ResourceIdSchema.parse(procedureId);
  const data = await epClient.getProcedureById(validId);

  return {
    uri: `ep://procedures/${validId}`,
    mimeType: 'application/json',
    text: JSON.stringify({
      ...data,
      _source: 'European Parliament Open Data Portal',
      _accessedAt: new Date().toISOString()
    }, null, 2)
  };
}

/**
 * Handle plenary detail resource request (extended URI: ep://plenary/{id})
 *
 * Fetches recent plenary sessions and filters by the requested session ID.
 * Falls back to the full list when no match is found.
 *
 * @param plenaryId - Plenary session identifier
 * @returns Resource content with plenary session details as JSON
 */
async function handlePlenaryDetail(plenaryId: string): Promise<ResourceContent> {
  const validId = ResourceIdSchema.parse(plenaryId);
  const data = await epClient.getPlenarySessions({ limit: 50 });

  // Try to isolate the requested session from the returned list
  const sessions = Array.isArray(data.data) ? data.data : [];
  const session = sessions.find(
    (s) => (s as { id?: string }).id === validId
  ) ?? sessions[0];

  return {
    uri: `ep://plenary/${validId}`,
    mimeType: 'application/json',
    text: JSON.stringify({
      plenaryId: validId,
      session: session ?? null,
      _source: 'European Parliament Open Data Portal',
      _accessedAt: new Date().toISOString()
    }, null, 2)
  };
}

/**
 * Handle document detail resource request (extended URI: ep://documents/{id})
 *
 * @param documentId - Legislative document identifier
 * @returns Resource content with document details as JSON
 */
async function handleDocumentDetail(documentId: string): Promise<ResourceContent> {
  const validId = ResourceIdSchema.parse(documentId);
  const data = await epClient.getDocumentById(validId);

  return {
    uri: `ep://documents/${validId}`,
    mimeType: 'application/json',
    text: JSON.stringify({
      ...data,
      _source: 'European Parliament Open Data Portal',
      _accessedAt: new Date().toISOString()
    }, null, 2)
  };
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Get all resource template metadata for MCP listing
 */
export function getResourceTemplateArray(): ResourceTemplate[] {
  return [
    mepResourceTemplate,
    mepListResourceTemplate,
    committeeResourceTemplate,
    plenarySessionsResourceTemplate,
    votingRecordResourceTemplate,
    politicalGroupsResourceTemplate
  ];
}

/**
 * Validate and extract required parameter from params
 */
function requireParam(params: Record<string, string>, key: string, uriPattern: string): string {
  const value = params[key];
  if (value === undefined || value === '') {
    throw new Error(`${key} is required for ${uriPattern}`);
  }
  return value;
}

/**
 * Handle ReadResource request
 * 
 * @param uri - Resource URI (e.g., "ep://meps/12345")
 * @returns Resource content
 * @throws Error if URI is invalid or resource not found
 */
export async function handleReadResource(uri: string): Promise<ResourceReadResult> {
  const { template, params } = parseResourceUri(uri);

  let content: ResourceContent;

  switch (template) {
    case 'mep_detail':
      content = await handleMepDetail(requireParam(params, 'mepId', 'ep://meps/{mepId}'));
      break;
    case 'mep_list':
      content = await handleMepList();
      break;
    case 'committee_detail':
      content = await handleCommitteeDetail(requireParam(params, 'committeeId', 'ep://committees/{committeeId}'));
      break;
    case 'plenary_sessions':
      content = await handlePlenarySessions();
      break;
    case 'voting_record':
      content = await handleVotingRecord(requireParam(params, 'sessionId', 'ep://votes/{sessionId}'));
      break;
    case 'political_groups':
      content = await handlePoliticalGroups();
      break;
    // Extended URI patterns (not listed in getResourceTemplateArray)
    case 'procedure_detail':
      content = await handleProcedureDetail(requireParam(params, 'procedureId', 'ep://procedures/{id}'));
      break;
    case 'plenary_detail':
      content = await handlePlenaryDetail(requireParam(params, 'plenaryId', 'ep://plenary/{id}'));
      break;
    case 'document_detail':
      content = await handleDocumentDetail(requireParam(params, 'documentId', 'ep://documents/{id}'));
      break;
    default:
      throw new Error(`Unhandled resource template: ${template}`);
  }

  return { contents: [content] };
}

/** Export parseResourceUri for testing */
export { parseResourceUri };
