#!/usr/bin/env tsx
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { EuropeanParliamentClient } from '../src/clients/europeanParliamentClient.js';
import { CommitteeSchema, MEPDetailsSchema, MEPSchema } from '../src/schemas/europeanParliament.js';
import { fetchAllCurrentMEPs } from '../src/utils/allMepFetcher.js';
import {
  readIncrementalDetailState,
  compactDetailMap,
  pruneMissingIds,
  refreshDetailBatch,
  type DetailBatchResult,
} from '../src/utils/weeklyCacheState.js';
import {
  findMissingCurrentCommitteeIds,
  getIsoWeekInfo,
} from '../src/utils/weeklyCacheGeneration.js';
import { getWeeklyCachePath, loadWeeklyMEPCache } from '../src/utils/weeklyDataCache.js';

type Dataset = 'meps' | 'corporate-bodies' | 'controlled-vocabularies';

interface WeeklyMetadata {
  schemaVersion: number;
  generatedAt: string;
  weekKey: string;
  source: string;
  dataset: Dataset;
  scope: 'current' | 'all';
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

function buildMetadata(dataset: Dataset): WeeklyMetadata {
  return {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    weekKey: getIsoWeekInfo(new Date()).weekKey,
    source: 'EP Open Data Portal API v2',
    dataset,
    scope: dataset === 'controlled-vocabularies' ? 'all' : 'current',
  };
}

async function writeDataset(dataset: Dataset, payload: unknown): Promise<void> {
  const now = new Date();
  const iso = getIsoWeekInfo(now);
  const latestPath = getWeeklyCachePath(dataset);
  const baseDir = path.dirname(latestPath);
  const weeklyDir = path.join(baseDir, String(iso.year), `week-${String(iso.week).padStart(2, '0')}`);
  await mkdir(weeklyDir, { recursive: true });
  const json = `${JSON.stringify(payload, null, 2)}\n`;
  await writeFile(path.join(weeklyDir, 'index.json'), json, 'utf-8');
  await writeFile(latestPath, json, 'utf-8');
}

/** Reads the previously written `latest.json` for a dataset for incremental refresh. */
function readExistingLatest(dataset: Dataset): unknown {
  const latestPath = getWeeklyCachePath(dataset);
  if (!existsSync(latestPath)) return null;
  try {
    return JSON.parse(readFileSync(latestPath, 'utf-8'));
  } catch {
    return null;
  }
}

function readExistingList<T>(
  payload: unknown,
  key: string,
  parseItem: (item: unknown) => T,
): T[] {
  if (typeof payload !== 'object' || payload === null) return [];
  const raw = (payload as Record<string, unknown>)[key];
  if (!Array.isArray(raw)) return [];
  const parsed: T[] = [];
  for (const item of raw) {
    try {
      parsed.push(parseItem(item));
    } catch {
      return [];
    }
  }
  return parsed;
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

async function fetchAllCurrentCorporateBodies(client: EuropeanParliamentClient): Promise<unknown[]> {
  const result: unknown[] = [];
  let offset = 0;
  const limit = 100;
  for (;;) {
    const page = await client.getCurrentCorporateBodies({ limit, offset });
    result.push(...page.data);
    if (!page.hasMore) break;
    offset += limit;
  }
  return result;
}

async function fetchMissingCurrentCommittees(
  client: EuropeanParliamentClient,
  existingBodyIds: ReadonlySet<string>,
): Promise<ReturnType<typeof CommitteeSchema.parse>[]> {
  const mepCache = await loadWeeklyMEPCache();
  if (mepCache === null) return [];

  const supplements: ReturnType<typeof CommitteeSchema.parse>[] = [];
  for (const id of findMissingCurrentCommitteeIds(mepCache, existingBodyIds)) {
    try {
      supplements.push(CommitteeSchema.parse(await client.getCorporateBodyById(id)));
    } catch {
      console.warn(`[weekly-cache] Current committee body ${id} could not be resolved directly.`);
    }
  }
  return supplements;
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
  const { details: previousDetails, missingIds } = readIncrementalDetailState(
    readExistingLatest('meps'),
    'mepDetails',
  );
  const mepsRaw = await fetchAllCurrentMEPs(client, batchSize);
  const meps = mepsRaw.map((mep) => MEPSchema.parse(mep));
  const mepDetails = compactDetailMap({
    items: meps,
    details: previousDetails,
    idFor: (mep) => mep.id,
    keysFor: (mep) => mepKeyVariants(mep.id),
  });

  pruneMissingIds(missingIds, new Set(meps.map((mep) => mep.id)));

  const result = await refreshDetailBatch({
    items: meps,
    batchSize,
    details: mepDetails,
    missingIds,
    idFor: (mep) => mep.id,
    keysFor: (mep) => [mep.id],
    fetchDetail: async (mep) => MEPDetailsSchema.parse(await client.getMEPDetails(mep.id)),
    isNotFound: isNotFoundError,
    onSkip: (id) => { console.warn(`[weekly-cache] MEP details not found for ${id}; skipping future retries this week.`); },
    onRetry: (id) => { console.warn(`[weekly-cache] Failed to fetch MEP details for ${id}; will retry in a future run.`); },
  });

  await writeDataset('meps', {
    metadata: buildMetadata('meps'),
    meps,
    mepDetails,
    missingDetailIds: Array.from(missingIds).sort(),
    progress: toProgress(batchSize, result),
  });
}

async function buildCorporateBodiesDataset(client: EuropeanParliamentClient, batchSize: number): Promise<void> {
  const previousPayload = readExistingLatest('corporate-bodies');
  const { details: previousDetails, missingIds } = readIncrementalDetailState(
    previousPayload,
    'corporateBodyDetails',
  );
  let listedBodies: ReturnType<typeof CommitteeSchema.parse>[];
  try {
    const bodiesRaw = await fetchAllCurrentCorporateBodies(client);
    listedBodies = bodiesRaw.map((body) => CommitteeSchema.parse(body));
  } catch (error: unknown) {
    listedBodies = readExistingList(previousPayload, 'corporateBodies', (body) => CommitteeSchema.parse(body));
    if (listedBodies.length === 0) throw error;
    console.warn('[weekly-cache] Current corporate-body listing unavailable; reusing the last validated snapshot.');
  }
  const supplementalCommittees = await fetchMissingCurrentCommittees(
    client,
    new Set(listedBodies.map((body) => body.id)),
  );
  const corporateBodies = [...listedBodies, ...supplementalCommittees]
    .sort((left, right) => left.id.localeCompare(right.id));
  const committees = corporateBodies.filter((body) =>
    body.responsibilities?.some((classification) =>
      classification.startsWith('COMMITTEE_PARLIAMENTARY_'),
    ) === true,
  );
  const detailSource = {
    ...previousDetails,
    ...Object.fromEntries(supplementalCommittees.map((body) => [body.id, body])),
  };
  const corporateBodyDetails = compactDetailMap({
    items: committees,
    details: detailSource,
    idFor: (body) => body.id,
    keysFor: (body) => [body.id, body.abbreviation],
  });

  pruneMissingIds(missingIds, new Set(committees.map((body) => body.id)));

  const result = await refreshDetailBatch({
    items: committees,
    batchSize,
    details: corporateBodyDetails,
    missingIds,
    idFor: (body) => body.id,
    keysFor: (body) => [body.id],
    fetchDetail: async (body) => CommitteeSchema.parse(await client.getCorporateBodyById(body.id)),
    isNotFound: isNotFoundError,
    onSkip: (id) => { console.warn(`[weekly-cache] Corporate body not found for ${id}; skipping future retries this week.`); },
    onRetry: (id) => { console.warn(`[weekly-cache] Failed to fetch corporate body ${id}; will retry in a future run.`); },
  });

  await writeDataset('corporate-bodies', {
    metadata: buildMetadata('corporate-bodies'),
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
    metadata: buildMetadata('controlled-vocabularies'),
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
