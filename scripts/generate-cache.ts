#!/usr/bin/env tsx
import { createHash } from 'node:crypto';
import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { EuropeanParliamentClient } from '../src/clients/europeanParliamentClient.js';
import { RateLimiter } from '../src/utils/rateLimiter.js';
import {
  CommitteeSchema,
  MEPDetailsSchema,
  MEPSchema,
} from '../src/schemas/europeanParliament.js';
import { fetchAllCurrentMEPs } from '../src/utils/allMepFetcher.js';
import { findMissingCurrentCommitteeIds } from '../src/utils/cacheGeneration.js';
import { deriveCurrentPoliticalComposition } from '../src/utils/politicalComposition.js';
import {
  CacheManifestSchema,
  WeeklyCorporateBodiesCacheSchema,
  WeeklyMEPCacheSchema,
  WeeklyVocabulariesCacheSchema,
  getCacheManifestPath,
  getCacheRoot,
  getWeeklyCachePath,
  type CacheManifest,
  type WeeklyCorporateBodiesCache,
  type WeeklyMEPCache,
  type WeeklyVocabulariesCache,
} from '../src/utils/weeklyDataCache.js';

type Dataset = 'meps' | 'corporate-bodies' | 'controlled-vocabularies';
type Scope = 'current' | 'all';

type CachePayload = WeeklyMEPCache | WeeklyCorporateBodiesCache | WeeklyVocabulariesCache;

interface CacheMetadata {
  schemaVersion: number;
  generatedAt: string;
  source: string;
  dataset: Dataset;
  scope: Scope;
  complete: true;
  recordCount: number;
  detailCount: number;
}

interface GeneratedDataset {
  dataset: Dataset;
  scope: Scope;
  payload: CachePayload;
  json: string;
  recordCount: number;
  detailCount: number;
}

const SOURCE = 'European Parliament Open Data Portal API v2';
const CACHE_SCHEMA_VERSION = 3;
const PAGE_SIZE = 100;
const MIN_CURRENT_MEPS = 600;
const MIN_CURRENT_BODIES = 100;
const MIN_VOCABULARIES = 1;
const API_RETRIES = 8;
const CACHE_GENERATION_RATE_LIMIT = 30;
const RETRY_BASE_DELAY_MS = 10_000;
const RETRY_MAX_DELAY_MS = 120_000;

function metadata(
  dataset: Dataset,
  scope: Scope,
  generatedAt: string,
  recordCount: number,
  detailCount: number,
): CacheMetadata {
  return {
    schemaVersion: CACHE_SCHEMA_VERSION,
    generatedAt,
    source: SOURCE,
    dataset,
    scope,
    complete: true,
    recordCount,
    detailCount,
  };
}

function canonicalId(value: string): string {
  return value.replace(/^MEP-/u, '').replace(/^person\//u, '');
}

function shortReference(value: string): string {
  return value.split('/').filter(Boolean).pop() ?? value;
}

function assertUniqueIds(items: readonly { id: string }[], label: string): void {
  const ids = new Set<string>();
  for (const item of items) {
    if (ids.has(item.id)) throw new Error(`${label} contains duplicate id ${item.id}`);
    ids.add(item.id);
  }
}

function isTransientAPIError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('statusCode' in error)) return false;
  const statusCode = (error as { statusCode?: unknown }).statusCode;
  return typeof statusCode === 'number'
    && (statusCode === 408 || statusCode === 425 || statusCode === 429 || statusCode >= 500);
}

function isNotFoundError(error: unknown): boolean {
  return error instanceof Error
    && 'statusCode' in error
    && (error as { statusCode?: unknown }).statusCode === 404;
}

function extractRetryAfterMs(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('details' in error)) return undefined;
  const details = (error as { details?: unknown }).details;
  if (typeof details !== 'object' || details === null || !('retryAfterMs' in details)) return undefined;
  const retryAfterMs = (details as { retryAfterMs?: unknown }).retryAfterMs;
  return typeof retryAfterMs === 'number' && Number.isFinite(retryAfterMs) && retryAfterMs > 0
    ? retryAfterMs
    : undefined;
}

async function waitForRateLimitRetry(attempt: number, error: unknown): Promise<void> {
  const exponentialDelay = Math.min(
    RETRY_MAX_DELAY_MS,
    RETRY_BASE_DELAY_MS * (2 ** attempt),
  );
  const retryAfterMs = extractRetryAfterMs(error) ?? exponentialDelay;
  await new Promise<void>((resolve) => {
    setTimeout(resolve, retryAfterMs);
  });
}

async function withAPIRetry<T>(operation: () => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt <= API_RETRIES; attempt += 1) {
    try {
      return await operation();
    } catch (error: unknown) {
      if (!isTransientAPIError(error) || attempt === API_RETRIES) throw error;
      console.warn(`[cache] Transient EP API failure; retrying attempt ${String(attempt + 2)}/${String(API_RETRIES + 1)}`);
      await waitForRateLimitRetry(attempt, error);
    }
  }
  throw new Error('Unreachable EP API retry state');
}

async function fetchMEPDetailsWithRetry(
  client: EuropeanParliamentClient,
  mepId: string,
): Promise<ReturnType<typeof MEPDetailsSchema.parse>> {
  return withAPIRetry(() => client.getMEPDetails(mepId, { live: true }));
}

async function fetchCorporateBodyWithRetry(
  client: EuropeanParliamentClient,
  bodyId: string,
): Promise<ReturnType<typeof CommitteeSchema.parse> | null> {
  try {
    return await withAPIRetry(async () => {
      return CommitteeSchema.parse(await client.getCorporateBodyById(bodyId, {
        includeMemberships: false,
      }));
    });
  } catch (error: unknown) {
    if (isNotFoundError(error)) return null;
    throw error;
  }
}

async function fetchAllCurrentCorporateBodies(
  client: EuropeanParliamentClient,
): Promise<ReturnType<typeof CommitteeSchema.parse>[]> {
  const result: ReturnType<typeof CommitteeSchema.parse>[] = [];
  for (let offset = 0;; offset += PAGE_SIZE) {
    const page = await withAPIRetry(() =>
      client.getCurrentCorporateBodies({ limit: PAGE_SIZE, offset, live: true }),
    );
    result.push(...page.data.map((body) => CommitteeSchema.parse(body)));
    if (!page.hasMore) return result;
  }
}

async function fetchAllVocabularies(
  client: EuropeanParliamentClient,
): Promise<Record<string, unknown>[]> {
  const result: Record<string, unknown>[] = [];
  for (let offset = 0;; offset += PAGE_SIZE) {
    const page = await withAPIRetry(() =>
      client.getControlledVocabularies({ limit: PAGE_SIZE, offset }),
    );
    result.push(...page.data);
    if (!page.hasMore) return result;
  }
}

async function buildMEPDataset(
  client: EuropeanParliamentClient,
  generatedAt: string,
): Promise<GeneratedDataset & { payload: WeeklyMEPCache }> {
  const currentMEPClient = {
    getCurrentMEPs: async (
      params: { limit: number; offset: number },
    ): Promise<Awaited<ReturnType<EuropeanParliamentClient['getCurrentMEPs']>>> => {
      const page = await withAPIRetry(() =>
        client.getCurrentMEPs({ ...params, live: true }),
      );
      // Some upstream responses omit pagination metadata. A full page is
      // unambiguously evidence that another page may exist.
      return { ...page, hasMore: page.hasMore || page.data.length >= params.limit };
    },
  };
  const rawMEPs = await fetchAllCurrentMEPs(currentMEPClient, PAGE_SIZE);
  const meps = rawMEPs.map((mep) => MEPSchema.parse(mep));
  if (meps.length < MIN_CURRENT_MEPS) {
    throw new Error(`Current MEP listing is incomplete: ${String(meps.length)} < ${String(MIN_CURRENT_MEPS)}`);
  }
  assertUniqueIds(meps, 'Current MEP listing');

  const mepDetails: WeeklyMEPCache['mepDetails'] = Object.create(null) as WeeklyMEPCache['mepDetails'];
  for (const [index, mep] of meps.entries()) {
    const detail = MEPDetailsSchema.parse(await fetchMEPDetailsWithRetry(client, mep.id));
    if (canonicalId(detail.id) !== canonicalId(mep.id)) {
      throw new Error(`MEP detail mismatch: requested ${mep.id}, received ${detail.id}`);
    }
    mepDetails[mep.id] = detail;
    if ((index + 1) % 50 === 0 || index + 1 === meps.length) {
      console.log(`[cache] MEP details ${String(index + 1)}/${String(meps.length)}`);
    }
  }

  if (Object.keys(mepDetails).length !== meps.length) {
    throw new Error('MEP detail coverage does not match current roster');
  }

  const payload = WeeklyMEPCacheSchema.parse({
    metadata: metadata('meps', 'current', generatedAt, meps.length, meps.length),
    meps,
    mepDetails,
  });
  const composition = deriveCurrentPoliticalComposition(payload, generatedAt.slice(0, 10));
  if (composition.totalMEPs !== meps.length || composition.fallbackMEPs !== 0) {
    throw new Error(
      `Political-group membership coverage incomplete: total=${String(composition.totalMEPs)}, fallback=${String(composition.fallbackMEPs)}`,
    );
  }
  const json = `${JSON.stringify(payload, null, 2)}\n`;
  return {
    dataset: 'meps',
    scope: 'current',
    payload,
    json,
    recordCount: meps.length,
    detailCount: meps.length,
  };
}

function isCommittee(body: ReturnType<typeof CommitteeSchema.parse>): boolean {
  return body.responsibilities?.some((classification) =>
    classification.startsWith('COMMITTEE_PARLIAMENTARY_'),
  ) === true;
}

async function buildCorporateBodiesDataset(
  client: EuropeanParliamentClient,
  generatedAt: string,
  mepCache: WeeklyMEPCache,
): Promise<GeneratedDataset & { payload: WeeklyCorporateBodiesCache }> {
  const listedBodies = await fetchAllCurrentCorporateBodies(client);
  if (listedBodies.length < MIN_CURRENT_BODIES) {
    throw new Error(`Current corporate-body listing is incomplete: ${String(listedBodies.length)} < ${String(MIN_CURRENT_BODIES)}`);
  }
  const byId = new Map(listedBodies.map((body) => [shortReference(body.id), body]));
  for (const id of findMissingCurrentCommitteeIds(mepCache, new Set(byId.keys()), generatedAt.slice(0, 10))) {
    const detail = await fetchCorporateBodyWithRetry(client, id);
    if (detail === null) {
      console.warn(`[cache] Skipping stale or unavailable corporate body reference ${id}`);
      continue;
    }
    byId.set(shortReference(detail.id), detail);
  }
  const corporateBodies = [...byId.values()].sort((left, right) => left.id.localeCompare(right.id));
  assertUniqueIds(corporateBodies, 'Current corporate-body listing');

  const committees = corporateBodies.filter(isCommittee);
  const corporateBodyDetails: NonNullable<WeeklyCorporateBodiesCache['corporateBodyDetails']> = Object.create(null) as NonNullable<WeeklyCorporateBodiesCache['corporateBodyDetails']>;
  for (const [index, body] of committees.entries()) {
    const detail = await fetchCorporateBodyWithRetry(client, body.id);
    if (detail === null) {
      throw new Error(`Committee detail unavailable for listed body ${body.id}`);
    }
    corporateBodyDetails[body.id] = detail;
    if ((index + 1) % 20 === 0 || index + 1 === committees.length) {
      console.log(`[cache] Committee details ${String(index + 1)}/${String(committees.length)}`);
    }
  }
  if (Object.keys(corporateBodyDetails).length !== committees.length) {
    throw new Error('Committee detail coverage does not match committee listing');
  }

  const payload = WeeklyCorporateBodiesCacheSchema.parse({
    metadata: metadata(
      'corporate-bodies',
      'current',
      generatedAt,
      corporateBodies.length,
      committees.length,
    ),
    corporateBodies,
    corporateBodyDetails,
  });
  const json = `${JSON.stringify(payload, null, 2)}\n`;
  return {
    dataset: 'corporate-bodies',
    scope: 'current',
    payload,
    json,
    recordCount: corporateBodies.length,
    detailCount: committees.length,
  };
}

async function buildVocabularyDataset(
  client: EuropeanParliamentClient,
  generatedAt: string,
): Promise<GeneratedDataset & { payload: WeeklyVocabulariesCache }> {
  const vocabularies = (await fetchAllVocabularies(client))
    .filter((vocabulary) => typeof vocabulary['id'] === 'string' && vocabulary['id'].trim() !== '')
    .sort((left, right) => String(left['id']).localeCompare(String(right['id'])));
  if (vocabularies.length < MIN_VOCABULARIES) {
    throw new Error('Controlled-vocabulary listing is empty');
  }
  const ids = vocabularies.map((vocabulary) => String(vocabulary['id']));
  if (new Set(ids).size !== ids.length) throw new Error('Controlled-vocabulary listing contains duplicate IDs');

  const vocabularyDetails: NonNullable<WeeklyVocabulariesCache['vocabularyDetails']> = Object.create(null) as NonNullable<WeeklyVocabulariesCache['vocabularyDetails']>;
  for (const id of ids) {
    vocabularyDetails[id] = await withAPIRetry(() =>
      client.getControlledVocabularyById(shortReference(id)),
    );
  }
  if (Object.keys(vocabularyDetails).length !== vocabularies.length) {
    throw new Error('Vocabulary detail coverage does not match vocabulary listing');
  }

  const payload = WeeklyVocabulariesCacheSchema.parse({
    metadata: metadata(
      'controlled-vocabularies',
      'all',
      generatedAt,
      vocabularies.length,
      vocabularies.length,
    ),
    vocabularies,
    vocabularyDetails,
  });
  const json = `${JSON.stringify(payload, null, 2)}\n`;
  return {
    dataset: 'controlled-vocabularies',
    scope: 'all',
    payload,
    json,
    recordCount: vocabularies.length,
    detailCount: vocabularies.length,
  };
}

function sha256(json: string): string {
  return createHash('sha256').update(json).digest('hex');
}

async function writeBundleAtomically(
  datasets: readonly GeneratedDataset[],
  generatedAt: string,
): Promise<void> {
  const cacheRoot = getCacheRoot();
  const stagingRoot = path.join(cacheRoot, `.staging-${String(process.pid)}`);
  await rm(stagingRoot, { recursive: true, force: true });
  await mkdir(stagingRoot, { recursive: true });

  const manifestDatasets = Object.fromEntries(datasets.map((dataset) => [dataset.dataset, {
    file: `${dataset.dataset}.json`,
    generatedAt,
    scope: dataset.scope,
    recordCount: dataset.recordCount,
    detailCount: dataset.detailCount,
    sha256: sha256(dataset.json),
  }])) as CacheManifest['datasets'];
  const manifest = CacheManifestSchema.parse({
    schemaVersion: 1,
    generatedAt,
    source: SOURCE,
    datasets: manifestDatasets,
  });

  try {
    for (const dataset of datasets) {
      await writeFile(path.join(stagingRoot, `${dataset.dataset}.json`), dataset.json, 'utf-8');
    }
    await writeFile(
      path.join(stagingRoot, 'manifest.json'),
      `${JSON.stringify(manifest, null, 2)}\n`,
      'utf-8',
    );
    await mkdir(cacheRoot, { recursive: true });
    for (const dataset of datasets) {
      await rename(
        path.join(stagingRoot, `${dataset.dataset}.json`),
        getWeeklyCachePath(dataset.dataset),
      );
    }
    await rename(path.join(stagingRoot, 'manifest.json'), getCacheManifestPath());
  } finally {
    await rm(stagingRoot, { recursive: true, force: true });
  }
}

async function main(): Promise<void> {
  const generatedAt = new Date().toISOString();
  const client = new EuropeanParliamentClient({
    timeoutMs: 180_000,
    maxResponseBytes: 50 * 1024 * 1024,
    rateLimiter: new RateLimiter({
      tokensPerInterval: CACHE_GENERATION_RATE_LIMIT,
      interval: 'minute',
    }),
  });
  console.log(`[cache] Building complete cache generation ${generatedAt}`);
  const meps = await buildMEPDataset(client, generatedAt);
  const bodies = await buildCorporateBodiesDataset(client, generatedAt, meps.payload);
  const vocabularies = await buildVocabularyDataset(client, generatedAt);
  await writeBundleAtomically([meps, bodies, vocabularies], generatedAt);
  console.log(
    `[cache] Published generation: ${String(meps.recordCount)} MEPs, ${String(bodies.recordCount)} corporate bodies, ${String(vocabularies.recordCount)} vocabularies`,
  );
}

void main();
