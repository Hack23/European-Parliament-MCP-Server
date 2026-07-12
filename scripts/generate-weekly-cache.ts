#!/usr/bin/env tsx
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { EuropeanParliamentClient } from '../src/clients/europeanParliamentClient.js';
import { CommitteeSchema, MEPDetailsSchema, MEPSchema } from '../src/schemas/europeanParliament.js';
import { fetchAllCurrentMEPs } from '../src/utils/allMepFetcher.js';
import {
  readIncrementalDetailState,
  pruneMissingIds,
  refreshDetailBatch,
  type DetailBatchResult,
} from '../src/utils/weeklyCacheState.js';

type Dataset = 'meps' | 'corporate-bodies' | 'controlled-vocabularies';

interface WeeklyMetadata {
  schemaVersion: number;
  generatedAt: string;
  weekKey: string;
  source: string;
}

interface ScriptOptions {
  dataset: Dataset;
  batchSize: number;
}

function parseScriptArgs(): ScriptOptions {
  const args = process.argv.slice(2);
  const datasetIndex = args.findIndex((arg) => arg === '--dataset');
  const datasetValue = datasetIndex >= 0 ? args[datasetIndex + 1] : undefined;
  if (datasetValue !== 'meps' && datasetValue !== 'corporate-bodies' && datasetValue !== 'controlled-vocabularies') {
    throw new Error('Missing or invalid --dataset (expected: meps | corporate-bodies | controlled-vocabularies)');
  }

  const batchSizeIndex = args.findIndex((arg) => arg === '--batch-size');
  const batchSizeRaw = batchSizeIndex >= 0 ? args[batchSizeIndex + 1] : undefined;
  const batchSize = batchSizeRaw === undefined ? 250 : Number.parseInt(batchSizeRaw, 10);
  if (!Number.isFinite(batchSize) || batchSize < 1) {
    throw new Error('Invalid --batch-size (expected positive integer)');
  }

  return {
    dataset: datasetValue,
    batchSize,
  };
}

function getIsoWeekInfo(date: Date): { year: number; week: number; weekKey: string } {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utc.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return {
    year: utc.getUTCFullYear(),
    week,
    weekKey: `${String(utc.getUTCFullYear())}-W${String(week).padStart(2, '0')}`,
  };
}

function buildMetadata(): WeeklyMetadata {
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    weekKey: getIsoWeekInfo(new Date()).weekKey,
    source: 'EP Open Data Portal API v2',
  };
}

async function writeDataset(dataset: Dataset, payload: unknown): Promise<void> {
  const now = new Date();
  const iso = getIsoWeekInfo(now);
  const baseDir = path.resolve(process.cwd(), 'data', 'weekly', dataset);
  const weeklyDir = path.join(baseDir, String(iso.year), `week-${String(iso.week).padStart(2, '0')}`);
  await mkdir(weeklyDir, { recursive: true });
  const json = `${JSON.stringify(payload, null, 2)}\n`;
  await writeFile(path.join(weeklyDir, 'index.json'), json, 'utf-8');
  await writeFile(path.join(baseDir, 'latest.json'), json, 'utf-8');
}

/** Reads the previously written `latest.json` for a dataset for incremental refresh. */
function readExistingLatest(dataset: Dataset): unknown {
  const latestPath = path.resolve(process.cwd(), 'data', 'weekly', dataset, 'latest.json');
  if (!existsSync(latestPath)) return null;
  try {
    return JSON.parse(readFileSync(latestPath, 'utf-8'));
  } catch {
    return null;
  }
}

function normalizeMepIdentifier(id: string): string {
  if (id.startsWith('MEP-')) return id.substring(4);
  if (id.startsWith('person/')) return id.substring(7);
  return id;
}

/** All identifier variants an MEP detail record should be cached and looked up under. */
function mepKeyVariants(id: string): string[] {
  const normalized = normalizeMepIdentifier(id);
  return [id, normalized, `MEP-${normalized}`, `person/${normalized}`];
}

function isNotFoundError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const candidate = error as { statusCode?: unknown };
  return candidate.statusCode === 404;
}

/** Progress block appended to every incrementally built dataset payload. */
function toProgress(batchSize: number, result: DetailBatchResult): Record<string, unknown> {
  return {
    batchSize,
    fetchedInRun: result.fetchedInRun,
    failedInRun: result.failedDetailIds.length,
    remainingDetails: result.remainingDetails,
    complete: result.complete,
    failedDetailIds: result.failedDetailIds,
  };
}

async function fetchAllCorporateBodies(client: EuropeanParliamentClient): Promise<unknown[]> {
  const result: unknown[] = [];
  let offset = 0;
  const limit = 100;
  for (;;) {
    const page = await client.getCorporateBodies({ limit, offset });
    result.push(...page.data);
    if (!page.hasMore) break;
    offset += limit;
  }
  return result;
}

async function fetchAllVocabularies(client: EuropeanParliamentClient): Promise<Record<string, unknown>[]> {
  const result: Record<string, unknown>[] = [];
  let offset = 0;
  const limit = 100;
  for (;;) {
    const page = await client.getControlledVocabularies({ limit, offset });
    result.push(...page.data);
    if (!page.hasMore) break;
    offset += limit;
  }
  return result;
}

async function buildMEPDataset(client: EuropeanParliamentClient, batchSize: number): Promise<void> {
  const { details: mepDetails, missingIds } = readIncrementalDetailState(
    readExistingLatest('meps'),
    'mepDetails',
  );
  const mepsRaw = await fetchAllCurrentMEPs(client, batchSize);
  const meps = mepsRaw.map((mep) => MEPSchema.parse(mep));

  pruneMissingIds(missingIds, new Set(meps.map((mep) => mep.id)));

  const result = await refreshDetailBatch({
    items: meps,
    batchSize,
    details: mepDetails,
    missingIds,
    idFor: (mep) => mep.id,
    keysFor: (mep) => mepKeyVariants(mep.id),
    fetchDetail: async (mep) => MEPDetailsSchema.parse(await client.getMEPDetails(mep.id)),
    extraKeysFromDetail: (detail) => {
      const identifier = (detail as { identifier?: unknown }).identifier;
      return typeof identifier === 'string' ? mepKeyVariants(identifier) : [];
    },
    isNotFound: isNotFoundError,
    onSkip: (id) => { console.warn(`[weekly-cache] MEP details not found for ${id}; skipping future retries this week.`); },
    onRetry: (id) => { console.warn(`[weekly-cache] Failed to fetch MEP details for ${id}; will retry in a future run.`); },
  });

  await writeDataset('meps', {
    metadata: buildMetadata(),
    meps,
    mepDetails,
    missingDetailIds: Array.from(missingIds).sort(),
    progress: toProgress(batchSize, result),
  });
}

async function buildCorporateBodiesDataset(client: EuropeanParliamentClient, batchSize: number): Promise<void> {
  const { details: corporateBodyDetails, missingIds } = readIncrementalDetailState(
    readExistingLatest('corporate-bodies'),
    'corporateBodyDetails',
  );
  const bodiesRaw = await fetchAllCorporateBodies(client);
  const corporateBodies = bodiesRaw.map((body) => CommitteeSchema.parse(body));

  pruneMissingIds(missingIds, new Set(corporateBodies.map((body) => body.id)));

  const result = await refreshDetailBatch({
    items: corporateBodies,
    batchSize,
    details: corporateBodyDetails,
    missingIds,
    idFor: (body) => body.id,
    keysFor: (body) => (body.abbreviation.trim() === '' ? [body.id] : [body.id, body.abbreviation]),
    fetchDetail: async (body) => CommitteeSchema.parse(await client.getCorporateBodyById(body.id)),
    isNotFound: isNotFoundError,
    onSkip: (id) => { console.warn(`[weekly-cache] Corporate body not found for ${id}; skipping future retries this week.`); },
    onRetry: (id) => { console.warn(`[weekly-cache] Failed to fetch corporate body ${id}; will retry in a future run.`); },
  });

  await writeDataset('corporate-bodies', {
    metadata: buildMetadata(),
    corporateBodies,
    corporateBodyDetails,
    missingDetailIds: Array.from(missingIds).sort(),
    progress: toProgress(batchSize, result),
  });
}

async function buildControlledVocabulariesDataset(client: EuropeanParliamentClient, batchSize: number): Promise<void> {
  const { details: vocabularyDetails, missingIds } = readIncrementalDetailState(
    readExistingLatest('controlled-vocabularies'),
    'vocabularyDetails',
  );
  const allVocabularies = await fetchAllVocabularies(client);
  const vocabularies = allVocabularies.filter((vocabulary) => {
    const id = vocabulary['id'];
    return typeof id === 'string' && id.trim() !== '';
  });

  pruneMissingIds(missingIds, new Set(vocabularies.map((vocabulary) => vocabulary['id'] as string)));

  const result = await refreshDetailBatch({
    items: vocabularies,
    batchSize,
    details: vocabularyDetails,
    missingIds,
    idFor: (vocabulary) => vocabulary['id'] as string,
    keysFor: (vocabulary) => [vocabulary['id'] as string],
    fetchDetail: async (vocabulary) => client.getControlledVocabularyById(vocabulary['id'] as string),
    isNotFound: isNotFoundError,
    onSkip: (id) => { console.warn(`[weekly-cache] Vocabulary not found for ${id}; skipping future retries this week.`); },
    onRetry: (id) => { console.warn(`[weekly-cache] Failed to fetch vocabulary ${id}; will retry in a future run.`); },
  });

  await writeDataset('controlled-vocabularies', {
    metadata: buildMetadata(),
    vocabularies,
    vocabularyDetails,
    missingDetailIds: Array.from(missingIds).sort(),
    progress: toProgress(batchSize, result),
  });
}

async function main(): Promise<void> {
  const options = parseScriptArgs();
  const client = new EuropeanParliamentClient();

  if (options.dataset === 'meps') {
    await buildMEPDataset(client, options.batchSize);
    return;
  }
  if (options.dataset === 'corporate-bodies') {
    await buildCorporateBodiesDataset(client, options.batchSize);
    return;
  }
  await buildControlledVocabulariesDataset(client, options.batchSize);
}

void main();
