/**
 * MCP Prompts for European Parliament Intelligence Analysis
 * 
 * Pre-built prompt templates for common EU parliamentary intelligence queries.
 * These prompts guide AI assistants through structured analysis using EP data.
 * 
 * **Intelligence Perspective:** Standardized analytical templates ensure consistent,
 * reproducible intelligence products—from MEP briefings to coalition assessments.
 * 
 * **Business Perspective:** Pre-built prompts lower the barrier to entry for users
 * and demonstrate the full analytical capability of the MCP server.
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 * 
 * @see https://spec.modelcontextprotocol.io/specification/server/prompts/
 */

import { z } from 'zod';

/**
 * Prompt metadata for MCP listing
 */
interface PromptMetadata {
  name: string;
  description: string;
  arguments?: {
    name: string;
    description: string;
    required: boolean;
  }[];
}

/**
 * Prompt message content
 */
interface PromptMessage {
  role: 'user' | 'assistant';
  content: {
    type: 'text';
    text: string;
  };
}

/**
 * Prompt result
 */
interface PromptResult {
  description: string;
  messages: PromptMessage[];
  [key: string]: unknown;
}

// ─── Prompt Definitions ──────────────────────────────────────

const mepBriefingPrompt: PromptMetadata = {
  name: 'mep_briefing',
  description: 'Generate a comprehensive MEP intelligence briefing covering voting record, committee roles, legislative activity, and influence assessment.',
  arguments: [
    { name: 'mepId', description: 'MEP identifier', required: true },
    { name: 'period', description: 'Analysis period (e.g., "2024", "last-6-months")', required: false }
  ]
};

const coalitionAnalysisPrompt: PromptMetadata = {
  name: 'coalition_analysis',
  description: 'Analyze coalition dynamics and voting blocs in the European Parliament, identifying cross-party alliances and emerging political alignments.',
  arguments: [
    { name: 'policyArea', description: 'Policy area to focus on (e.g., "environment", "digital", "trade")', required: false },
    { name: 'period', description: 'Analysis period', required: false }
  ]
};

const legislativeTrackingPrompt: PromptMetadata = {
  name: 'legislative_tracking',
  description: 'Track and analyze the progress of legislative procedures through the European Parliament, including committee stages, amendments, and voting outcomes.',
  arguments: [
    { name: 'procedureId', description: 'Legislative procedure identifier', required: false },
    { name: 'committee', description: 'Committee abbreviation to filter by', required: false }
  ]
};

const politicalGroupComparisonPrompt: PromptMetadata = {
  name: 'political_group_comparison',
  description: 'Compare political groups across voting discipline, legislative output, attendance, and cohesion metrics.',
  arguments: [
    { name: 'groups', description: 'Comma-separated political group names (e.g., "EPP,S&D,Renew")', required: false }
  ]
};

const committeeActivityPrompt: PromptMetadata = {
  name: 'committee_activity_report',
  description: 'Generate an activity report for a European Parliament committee, covering meetings, documents produced, legislative opinions, and member engagement.',
  arguments: [
    { name: 'committeeId', description: 'Committee abbreviation (e.g., "ENVI", "ITRE", "LIBE")', required: true }
  ]
};

const votingPatternAnalysisPrompt: PromptMetadata = {
  name: 'voting_pattern_analysis',
  description: 'Analyze voting patterns to identify trends, anomalies, and cross-party alignments on specific policy topics.',
  arguments: [
    { name: 'topic', description: 'Policy topic or keyword', required: false },
    { name: 'mepId', description: 'Focus on specific MEP', required: false }
  ]
};

// ─── Prompt Argument Schema ──────────────────────────────────

const PromptArgsSchema = z.record(
  z.string().min(1).max(50),
  z.string().min(1).max(200)
);

// ─── Prompt Result Generators ────────────────────────────────

/**
 * Generate an MEP intelligence briefing prompt
 *
 * @param args - Prompt arguments containing mepId and optional period
 * @returns Structured prompt result for MEP profiling analysis
 */
function generateMepBriefing(args: Record<string, string>): PromptResult {
  const mepId = args['mepId'] ?? 'unknown';
  const period = args['period'] ?? 'current term';

  return {
    description: `MEP Intelligence Briefing for ${mepId}`,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Generate a comprehensive intelligence briefing for MEP ${mepId} covering the ${period} period.

Use these European Parliament MCP tools to gather data:
1. **get_mep_details** — Get MEP profile, committee memberships, and contact info
2. **analyze_voting_patterns** — Analyze voting record and political group alignment
3. **assess_mep_influence** — Compute composite influence score across 5 dimensions
4. **get_parliamentary_questions** — Review parliamentary questions filed

Structure the briefing as follows:
- **Executive Summary**: Key findings and overall assessment
- **Profile Overview**: Political group, country, committee roles, tenure
- **Voting Record**: Attendance rate, party loyalty, key votes
- **Legislative Activity**: Reports authored, amendments, opinions
- **Influence Assessment**: Score, rank, dimension breakdown
- **Parliamentary Questions**: Focus areas, question trends
- **Analytical Judgments**: Confidence-rated assessments of influence trajectory

Data source: European Parliament Open Data Portal
Confidence levels: HIGH (>80% data coverage), MEDIUM (50-80%), LOW (<50%)`
        }
      }
    ]
  };
}

/**
 * Generate a coalition dynamics analysis prompt
 *
 * @param args - Prompt arguments containing optional policyArea and period
 * @returns Structured prompt result for coalition mapping
 */
function generateCoalitionAnalysis(args: Record<string, string>): PromptResult {
  const policyArea = args['policyArea'] ?? 'all policy areas';
  const period = args['period'] ?? 'current term';

  return {
    description: `Coalition dynamics analysis for ${policyArea}`,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Analyze coalition dynamics in the European Parliament for ${policyArea} during ${period}.

Use these MCP tools:
1. **analyze_coalition_dynamics** — Detect voting blocs and cross-party alliances
2. **compare_political_groups** — Compare group metrics across dimensions
3. **detect_voting_anomalies** — Identify unexpected voting behavior
4. **get_voting_records** — Retrieve raw voting data

Analysis framework:
- **Current Coalition Map**: Identify active voting blocs and alliances
- **Grand Coalition Analysis**: EPP + S&D vs alternative majority patterns
- **Cross-Party Bridges**: MEPs or groups acting as coalition brokers
- **Cohesion Metrics**: Internal discipline within each political group
- **Emerging Trends**: New alignments or shifting alliances
- **Anomaly Detection**: Unexpected voting patterns signaling realignment
- **Risk Assessment**: Coalition stability and fracture probability

Data source: European Parliament Open Data Portal`
        }
      }
    ]
  };
}

/**
 * Generate a legislative tracking prompt
 *
 * @param args - Prompt arguments containing optional procedureId and committee
 * @returns Structured prompt result for legislative pipeline monitoring
 */
function generateLegislativeTracking(args: Record<string, string>): PromptResult {
  const procedureId = args['procedureId'];
  const committee = args['committee'];
  const focusParts: string[] = [];
  if (procedureId !== undefined) {
    focusParts.push(`procedure ${procedureId}`);
  }
  if (committee !== undefined) {
    focusParts.push(`committee ${committee}`);
  }
  const focus = focusParts.length > 0
    ? focusParts.join(', ')
    : 'active legislative pipeline';

  return {
    description: `Legislative tracking for ${focus}`,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Track and analyze the legislative pipeline for ${focus}.

Use these MCP tools:
1. **track_legislation** — Get procedure status, timeline, and key actors
2. **monitor_legislative_pipeline** — Pipeline overview with status filtering
3. **search_documents** — Find related legislative documents
4. **analyze_legislative_effectiveness** — Measure legislative output metrics

Deliver a report covering:
- **Pipeline Status**: Current stage, next milestones, timeline
- **Key Actors**: Rapporteur, shadow rapporteurs, committee responsibilities
- **Amendment Analysis**: Volume, success rate, key contested provisions
- **Voting Outlook**: Probable outcome based on political alignment
- **Timeline Assessment**: On-track vs delayed with contributing factors
- **Related Procedures**: Cross-referencing linked legislative files

Data source: European Parliament Open Data Portal`
        }
      }
    ]
  };
}

/**
 * Generate a political group comparison prompt
 *
 * @param args - Prompt arguments containing optional groups list
 * @returns Structured prompt result for multi-group comparison
 */
function generateGroupComparison(args: Record<string, string>): PromptResult {
  const groups = args['groups'] ?? 'EPP, S&D, Renew Europe, Greens/EFA, ECR, ID, The Left';

  return {
    description: `Political group comparison: ${groups}`,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Compare the following European Parliament political groups: ${groups}

Use these MCP tools:
1. **compare_political_groups** — Multi-dimensional comparison
2. **analyze_coalition_dynamics** — Cross-group voting patterns
3. **get_meps** — Group membership and composition data
4. **get_voting_records** — Group-level voting statistics

Compare across these dimensions:
- **Size & Composition**: Member count, national delegation breakdown
- **Voting Discipline**: Cohesion rate, dissent patterns
- **Legislative Output**: Reports, amendments, opinions authored
- **Attendance**: Plenary and committee participation rates
- **Policy Alignment**: Voting patterns on key policy domains
- **Coalition Behavior**: Alliance frequencies and preferred partners
- **Effectiveness Metrics**: Legislative success rate

Data source: European Parliament Open Data Portal`
        }
      }
    ]
  };
}

/**
 * Generate a committee activity report prompt
 *
 * @param args - Prompt arguments containing committeeId
 * @returns Structured prompt result for committee workload analysis
 */
function generateCommitteeActivity(args: Record<string, string>): PromptResult {
  const committeeId = args['committeeId'] ?? 'unknown';

  return {
    description: `Committee activity report for ${committeeId}`,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Generate a comprehensive activity report for the ${committeeId} committee.

Use these MCP tools:
1. **get_committee_info** — Committee membership, leadership, responsibilities
2. **search_documents** — Documents produced by the committee
3. **monitor_legislative_pipeline** — Active legislative files in committee
4. **analyze_legislative_effectiveness** — Committee effectiveness metrics

Report structure:
- **Committee Overview**: Mandate, membership, leadership, meeting frequency
- **Legislative Workload**: Active files, opinions requested, reports adopted
- **Document Production**: Reports, opinions, amendments volume
- **Meeting Activity**: Frequency, attendance, agenda topics
- **Key Legislative Files**: Priority items and their status
- **Cross-Committee Coordination**: Joint work with other committees

Data source: European Parliament Open Data Portal`
        }
      }
    ]
  };
}

/**
 * Generate a voting pattern analysis prompt
 *
 * @param args - Prompt arguments containing optional topic and mepId
 * @returns Structured prompt result for voting pattern detection
 */
function generateVotingAnalysis(args: Record<string, string>): PromptResult {
  const topic = args['topic'] ?? 'key legislative votes';
  const mepId = args['mepId'];
  const focus = mepId !== undefined ? `MEP ${mepId} on ${topic}` : topic;

  return {
    description: `Voting pattern analysis: ${focus}`,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Analyze voting patterns for ${focus} in the European Parliament.

Use these MCP tools:
1. **get_voting_records** — Retrieve voting data
2. **analyze_voting_patterns** — Pattern detection and group alignment${mepId !== undefined ? `\n3. **assess_mep_influence** — MEP influence metrics for ${mepId}` : ''}
4. **detect_voting_anomalies** — Identify anomalous patterns
5. **analyze_coalition_dynamics** — Coalition formation on these votes

Analysis framework:
- **Voting Distribution**: For/Against/Abstain breakdowns
- **Group Alignment**: How political groups voted
- **Cross-Party Patterns**: Unexpected cross-group voting blocs
- **Anomaly Detection**: Statistically unusual voting behavior
- **Trend Analysis**: Evolution of voting patterns over time
- **Predictive Assessment**: Likely voting direction for upcoming related votes

Data source: European Parliament Open Data Portal`
        }
      }
    ]
  };
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Get all prompt metadata for MCP listing
 */
export function getPromptMetadataArray(): PromptMetadata[] {
  return [
    mepBriefingPrompt,
    coalitionAnalysisPrompt,
    legislativeTrackingPrompt,
    politicalGroupComparisonPrompt,
    committeeActivityPrompt,
    votingPatternAnalysisPrompt
  ];
}

/**
 * Handle GetPrompt request
 * 
 * @param name - Prompt name
 * @param args - Prompt arguments  
 * @returns Prompt result with messages
 * @throws Error if prompt name is unknown
 */
export function handleGetPrompt(
  name: string,
  args?: Record<string, string>
): PromptResult {
  const validatedArgs = args !== undefined
    ? PromptArgsSchema.parse(args)
    : {};

  const promptGenerators: Record<string, (a: Record<string, string>) => PromptResult> = {
    'mep_briefing': generateMepBriefing,
    'coalition_analysis': generateCoalitionAnalysis,
    'legislative_tracking': generateLegislativeTracking,
    'political_group_comparison': generateGroupComparison,
    'committee_activity_report': generateCommitteeActivity,
    'voting_pattern_analysis': generateVotingAnalysis
  };

  const generator = promptGenerators[name];
  if (generator === undefined) {
    throw new Error(`Unknown prompt: ${name}`);
  }

  // Enforce required arguments based on prompt metadata
  const metadata = getPromptMetadataArray().find((prompt) => prompt.name === name);
  if (metadata?.arguments !== undefined) {
    const missingRequired = metadata.arguments
      .filter((arg) => arg.required)
      .filter((arg) => {
        const value = validatedArgs[arg.name];
        return value === undefined || value.trim() === '';
      })
      .map((arg) => arg.name);

    if (missingRequired.length > 0) {
      throw new Error(
        `Missing required argument(s) for prompt "${name}": ${missingRequired.join(', ')}`
      );
    }
  }

  return generator(validatedArgs);
}
