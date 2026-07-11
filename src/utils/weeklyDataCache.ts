import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import {
  CommitteeSchema,
  MEPDetailsSchema,
  MEPSchema,
} from '../schemas/europeanParliament.js';

const WeeklyMetadataSchema = z.object({
  schemaVersion: z.number().int().min(1),
  generatedAt: z.string(),
  weekKey: z.string(),
  source: z.string(),
});

const WeeklyMEPCacheSchema = z.object({
  metadata: WeeklyMetadataSchema,
  meps: z.array(MEPSchema),
  mepDetails: z.record(z.string(), MEPDetailsSchema),
});

const WeeklyCorporateBodiesCacheSchema = z.object({
  metadata: WeeklyMetadataSchema,
  corporateBodies: z.array(CommitteeSchema),
  corporateBodyDetails: z.record(z.string(), CommitteeSchema).optional(),
});

const WeeklyVocabulariesCacheSchema = z.object({
  metadata: WeeklyMetadataSchema,
  vocabularies: z.array(z.record(z.string(), z.unknown())),
  vocabularyDetails: z.record(z.string(), z.record(z.string(), z.unknown())).optional(),
});

export type WeeklyMEPCache = z.infer<typeof WeeklyMEPCacheSchema>;
export type WeeklyCorporateBodiesCache = z.infer<typeof WeeklyCorporateBodiesCacheSchema>;
export type WeeklyVocabulariesCache = z.infer<typeof WeeklyVocabulariesCacheSchema>;

function getWeeklyCachePath(dataset: 'meps' | 'corporate-bodies' | 'controlled-vocabularies'): string {
  return path.resolve(process.cwd(), 'data', 'weekly', dataset, 'latest.json');
}

async function loadAndValidate<T>(filePath: string, schema: z.ZodType<T>): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf-8');
    const parsed: unknown = JSON.parse(raw);
    return schema.safeParse(parsed).success ? schema.parse(parsed) : null;
  } catch {
    return null;
  }
}

export async function loadWeeklyMEPCache(): Promise<WeeklyMEPCache | null> {
  return loadAndValidate(getWeeklyCachePath('meps'), WeeklyMEPCacheSchema);
}

export async function loadWeeklyCorporateBodiesCache(): Promise<WeeklyCorporateBodiesCache | null> {
  return loadAndValidate(
    getWeeklyCachePath('corporate-bodies'),
    WeeklyCorporateBodiesCacheSchema,
  );
}

export async function loadWeeklyVocabulariesCache(): Promise<WeeklyVocabulariesCache | null> {
  return loadAndValidate(
    getWeeklyCachePath('controlled-vocabularies'),
    WeeklyVocabulariesCacheSchema,
  );
}
