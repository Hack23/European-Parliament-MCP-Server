/**
 * MCP Tool: monitor_legislative_pipeline
 * 
 * Real-time legislative pipeline status with bottleneck detection
 * and timeline forecasting.
 * 
 * **Intelligence Perspective:** Pipeline monitoring tool providing situational
 * awareness of legislative progress—enables early warning for stalled procedures,
 * bottleneck identification, and timeline forecasting.
 * 
 * ISMS Policy: SC-002 (Input Validation), AC-003 (Least Privilege)
 */

import { MonitorLegislativePipelineSchema } from '../schemas/europeanParliament.js';
import { epClient } from '../clients/europeanParliamentClient.js';
import type { Procedure } from '../types/europeanParliament.js';
import type { ToolResult } from './shared/types.js';

/** Computed attributes for a single pipeline item */
interface PipelineItemComputedAttrs {
  progressPercentage: number;
  velocityScore: number;
  complexityIndicator: string;
  estimatedCompletionDays: number;
  bottleneckRisk: string;
}

/** A single procedure in the pipeline */
interface PipelineItem {
  procedureId: string;
  title: string;
  type: string;
  currentStage: string;
  committee: string;
  daysInCurrentStage: number;
  isStalled: boolean;
  nextExpectedAction: string;
  computedAttributes: PipelineItemComputedAttrs;
}

/** Bottleneck analysis */
interface BottleneckInfo {
  stage: string;
  procedureCount: number;
  avgDaysStuck: number;
  severity: string;
}

/** Full pipeline analysis result */
interface LegislativePipelineAnalysis {
  period: { from: string; to: string };
  filter: { committee?: string; status: string };
  pipeline: PipelineItem[];
  summary: {
    totalProcedures: number;
    activeCount: number;
    stalledCount: number;
    completedCount: number;
    avgDaysInPipeline: number;
  };
  bottlenecks: BottleneckInfo[];
  computedAttributes: {
    pipelineHealthScore: number;
    throughputRate: number;
    bottleneckIndex: number;
    stalledProcedureRate: number;
    estimatedClearanceTime: number;
    legislativeMomentum: string;
  };
  confidenceLevel: string;
  methodology: string;
}

/**
 * Calculate days between two date strings (or since a date).
 */
function daysBetween(dateStr: string, endStr?: string): number {
  const start = new Date(dateStr);
  const end = endStr !== undefined && endStr !== '' ? new Date(endStr) : new Date();
  if (isNaN(start.getTime())) return 0;
  if (isNaN(end.getTime())) return 0;
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

/** Classify complexity from days in stage */
function classifyComplexity(days: number): string {
  if (days > 60) return 'HIGH';
  if (days > 30) return 'MEDIUM';
  return 'LOW';
}

/** Classify bottleneck risk */
function classifyBottleneckRisk(isStalled: boolean, days: number): string {
  if (isStalled) return 'HIGH';
  if (days > 45) return 'MEDIUM';
  return 'LOW';
}

/** Classify bottleneck severity */
function classifyBottleneckSeverity(count: number): string {
  if (count > 3) return 'CRITICAL';
  if (count > 1) return 'HIGH';
  return 'MODERATE';
}

/** Classify legislative momentum */
function classifyMomentum(healthScore: number): string {
  if (healthScore > 80) return 'STRONG';
  if (healthScore > 60) return 'MODERATE';
  if (healthScore > 40) return 'SLOW';
  return 'STALLED';
}

/**
 * Check if a procedure status indicates completion.
 */
function isStatusCompleted(status: string): boolean {
  const lower = status.toLowerCase();
  return lower.includes('adopted') || lower.includes('completed');
}

/**
 * Compute progress metrics for a procedure.
 */
function computePipelineMetrics(proc: Procedure): {
  daysInStage: number; isCompleted: boolean; isStalled: boolean;
  totalDays: number; progressEstimate: number; velocityScore: number; estimatedDays: number;
} {
  const lastActivity = proc.dateLastActivity !== '' ? proc.dateLastActivity : proc.dateInitiated;
  const daysInStage = daysBetween(lastActivity);
  const isCompleted = isStatusCompleted(proc.status);
  const isStalled = !isCompleted && daysInStage > 60;
  const initiated = proc.dateInitiated !== '' ? proc.dateInitiated : '';
  const lastAct = proc.dateLastActivity !== '' ? proc.dateLastActivity : undefined;
  const totalDays = daysBetween(initiated, lastAct);
  const progressEstimate = isCompleted ? 100 : Math.min(90, Math.max(5, Math.round(totalDays / 10)));
  const velocityScore = isStalled ? 20 : Math.min(100, 100 - Math.min(80, daysInStage));
  const estimatedDays = isCompleted ? 0 : Math.max(30, daysInStage * 2);
  return { daysInStage, isCompleted, isStalled, totalDays, progressEstimate, velocityScore, estimatedDays };
}

/**
 * Transform a real EP API Procedure into a PipelineItem.
 * All data is derived from the real procedure fields.
 */
function procedureToPipelineItem(proc: Procedure): PipelineItem {
  const m = computePipelineMetrics(proc);
  let currentStage = 'Unknown';
  if (proc.stage !== '') {
    currentStage = proc.stage;
  } else if (proc.status !== '') {
    currentStage = proc.status;
  }
  const committee = proc.responsibleCommittee !== '' ? proc.responsibleCommittee : 'Unknown';
  const stageLabel = proc.stage !== '' ? proc.stage : 'processing';
  const nextAction = m.isCompleted ? 'COMPLETED' : `Continue ${stageLabel}`;

  return {
    procedureId: proc.id,
    title: proc.title,
    type: proc.type,
    currentStage,
    committee,
    daysInCurrentStage: m.daysInStage,
    isStalled: m.isStalled,
    nextExpectedAction: nextAction,
    computedAttributes: {
      progressPercentage: m.progressEstimate,
      velocityScore: m.velocityScore,
      complexityIndicator: classifyComplexity(m.daysInStage),
      estimatedCompletionDays: m.estimatedDays,
      bottleneckRisk: classifyBottleneckRisk(m.isStalled, m.daysInStage),
    },
  };
}

/** Check if item matches status filter */
function matchesStatusFilter(item: PipelineItem, status: string): boolean {
  if (status === 'ALL') return true;
  if (status === 'ACTIVE') return !item.isStalled && item.computedAttributes.progressPercentage < 100;
  if (status === 'STALLED') return item.isStalled;
  if (status === 'COMPLETED') return item.computedAttributes.progressPercentage >= 100;
  return true;
}

/** Check if item matches committee filter */
function matchesCommitteeFilter(item: PipelineItem, committee: string | undefined): boolean {
  if (committee === undefined) return true;
  return item.committee === committee;
}

/** Detect bottlenecks from stalled pipeline items */
function detectBottlenecks(pipeline: PipelineItem[]): BottleneckInfo[] {
  const stageCounts: Record<string, { count: number; totalDays: number }> = {};
  for (const item of pipeline) {
    if (item.isStalled) {
      const entry = stageCounts[item.currentStage] ?? { count: 0, totalDays: 0 };
      entry.count++;
      entry.totalDays += item.daysInCurrentStage;
      stageCounts[item.currentStage] = entry;
    }
  }
  return Object.entries(stageCounts)
    .map(([stage, data]) => ({
      stage,
      procedureCount: data.count,
      avgDaysStuck: Math.round(data.totalDays / data.count),
      severity: classifyBottleneckSeverity(data.count),
    }))
    .sort((a, b) => b.procedureCount - a.procedureCount);
}

/** Compute pipeline summary statistics */
function computePipelineSummary(pipeline: PipelineItem[]): {
  activeCount: number; stalledCount: number; completedCount: number; avgDays: number;
} {
  const activeCount = pipeline.filter(p => !p.isStalled && p.computedAttributes.progressPercentage < 100).length;
  const stalledCount = pipeline.filter(p => p.isStalled).length;
  const completedCount = pipeline.filter(p => p.computedAttributes.progressPercentage >= 100).length;
  const totalDays = pipeline.reduce((sum, p) => sum + p.daysInCurrentStage, 0);
  const avgDays = pipeline.length > 0 ? Math.round(totalDays / pipeline.length) : 0;
  return { activeCount, stalledCount, completedCount, avgDays };
}

/** Compute pipeline health metrics */
function computeHealthMetrics(pipeline: PipelineItem[], summary: ReturnType<typeof computePipelineSummary>): {
  healthScore: number; throughputRate: number; stalledRate: number;
} {
  const stalledRate = pipeline.length > 0 ? summary.stalledCount / pipeline.length : 0;
  const healthScore = Math.round((1 - stalledRate) * 100 * 100) / 100;
  const throughputRate = pipeline.length > 0
    ? Math.round((summary.completedCount / pipeline.length) * 100 * 100) / 100
    : 0;
  return { healthScore, throughputRate, stalledRate };
}

/**
 * Monitor legislative pipeline tool handler.
 * 
 * Fetches real procedures from the EP API and computes pipeline
 * health metrics. All procedure data comes from the API—computed
 * attributes (health score, velocity, bottleneck risk) are derived
 * from real dates and stages.
 */
export async function handleMonitorLegislativePipeline(
  args: unknown
): Promise<ToolResult> {
  const params = MonitorLegislativePipelineSchema.parse(args);

  try {
    const procedures = await epClient.getProcedures({ limit: params.limit });

    const dateFrom = params.dateFrom;
    const dateTo = params.dateTo;
    const filteredProcs = procedures.data.filter(proc => {
      const lastActivity = proc.dateLastActivity !== '' ? proc.dateLastActivity : proc.dateInitiated;
      const initiated = proc.dateInitiated !== '' ? proc.dateInitiated : undefined;
      if (dateFrom !== undefined && lastActivity !== '' && lastActivity < dateFrom) return false;
      if (dateTo !== undefined && initiated !== undefined && initiated > dateTo) return false;
      return true;
    });

    const allItems = filteredProcs
      .map(proc => procedureToPipelineItem(proc))
      .filter(item => matchesStatusFilter(item, params.status))
      .filter(item => matchesCommitteeFilter(item, params.committee));

    const pipeline = allItems.slice(0, params.limit);
    const summary = computePipelineSummary(pipeline);
    const bottlenecks = detectBottlenecks(pipeline);
    const health = computeHealthMetrics(pipeline, summary);

    const analysis: LegislativePipelineAnalysis = {
      period: { from: params.dateFrom ?? '2024-01-01', to: params.dateTo ?? '2024-12-31' },
      filter: { ...(params.committee !== undefined ? { committee: params.committee } : {}), status: params.status },
      pipeline,
      summary: {
        totalProcedures: pipeline.length,
        activeCount: summary.activeCount,
        stalledCount: summary.stalledCount,
        completedCount: summary.completedCount,
        avgDaysInPipeline: summary.avgDays,
      },
      bottlenecks,
      computedAttributes: {
        pipelineHealthScore: health.healthScore,
        throughputRate: health.throughputRate,
        bottleneckIndex: Math.round(health.stalledRate * summary.avgDays * 100) / 100,
        stalledProcedureRate: Math.round(health.stalledRate * 100 * 100) / 100,
        estimatedClearanceTime: summary.avgDays * Math.max(1, summary.activeCount),
        legislativeMomentum: classifyMomentum(health.healthScore),
      },
      confidenceLevel: pipeline.length >= 10 ? 'MEDIUM' : 'LOW',
      methodology: 'Real-time pipeline analysis using EP API /procedures endpoint. '
        + 'All procedure data (title, type, stage, status, dates, committee) sourced from '
        + 'European Parliament open data. Computed attributes (health score, velocity, '
        + 'bottleneck risk, momentum) are derived from real procedure dates and stages. '
        + 'Data source: https://data.europarl.europa.eu/api/v2/procedures',
    };

    return { content: [{ type: 'text', text: JSON.stringify(analysis, null, 2) }] };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to monitor legislative pipeline: ${errorMessage}`);
  }
}

/**
 * Tool metadata for MCP registration
 */
export const monitorLegislativePipelineToolMetadata = {
  name: 'monitor_legislative_pipeline',
  description: 'Monitor legislative pipeline status with bottleneck detection and timeline forecasting. Tracks procedures through stages (proposal → committee → plenary → trilogue → adoption). Returns pipeline health score, throughput rate, bottleneck index, stalled procedure rate, and legislative momentum assessment.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      committee: {
        type: 'string',
        description: 'Filter by committee',
        minLength: 1,
        maxLength: 100
      },
      status: {
        type: 'string',
        enum: ['ALL', 'ACTIVE', 'STALLED', 'COMPLETED'],
        description: 'Pipeline status filter',
        default: 'ACTIVE'
      },
      dateFrom: {
        type: 'string',
        description: 'Analysis start date (YYYY-MM-DD format)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$'
      },
      dateTo: {
        type: 'string',
        description: 'Analysis end date (YYYY-MM-DD format)',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$'
      },
      limit: {
        type: 'number',
        description: 'Maximum results to return (1-100)',
        minimum: 1,
        maximum: 100,
        default: 20
      }
    }
  }
};
