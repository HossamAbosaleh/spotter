import { z } from 'zod';

/**
 * Profile — the single per-device record describing the human using Spotter.
 *
 * Source of truth for the wizard's data model. See
 * specs/001-profile-wizard/data-model.md §1 for the full field table and
 * invariants.
 */

export const SEX_VALUES = ['male', 'female', 'prefer-not-to-say'] as const;
export const GOAL_VALUES = [
  'strength',
  'hypertrophy',
  'fat-loss',
  'recomposition',
  'general-fitness',
] as const;
export const EXPERIENCE_VALUES = [
  'novice',
  'intermediate',
  'advanced',
] as const;
export const DAY_VALUES = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
] as const;
export const EQUIPMENT_VALUES = [
  'commercial-gym',
  'home-full',
  'home-minimal',
  'bodyweight-only',
] as const;
export const LANGUAGE_VALUES = ['en', 'ar'] as const;
export const UNITS_VALUES = ['metric', 'imperial'] as const;
export const COACH_VALUES = ['encouraging', 'direct', 'technical'] as const;

const isoDateString = z
  .string()
  .refine(
    (value) => !Number.isNaN(Date.parse(value)),
    'Must be an ISO 8601 date string'
  );

export const profileSchema = z
  .object({
    id: z.literal('me'),
    schemaVersion: z.literal(1),
    createdAt: isoDateString,
    updatedAt: isoDateString,

    identity: z.object({
      name: z.string().trim().min(1).max(60),
      age: z.number().int().min(13).max(100),
      sex: z.enum(SEX_VALUES),
    }),

    body: z.object({
      heightCm: z.number().min(120).max(230),
      bodyweightKg: z.number().min(30).max(250),
    }),

    goal: z.enum(GOAL_VALUES),

    experience: z.object({
      level: z.enum(EXPERIENCE_VALUES),
    }),

    schedule: z.object({
      preferredDays: z.array(z.enum(DAY_VALUES)).min(1).max(7),
    }),

    equipment: z.object({
      access: z.enum(EQUIPMENT_VALUES),
      notes: z.string().trim().max(500).optional(),
    }),

    injuries: z.string().trim().max(500).optional(),

    language: z.object({
      preferred: z.enum(LANGUAGE_VALUES),
      units: z.enum(UNITS_VALUES),
    }),

    coachPersonality: z.enum(COACH_VALUES),

    additionalContext: z.string().trim().max(1000).optional(),
  })
  .refine(
    (profile) => Date.parse(profile.updatedAt) >= Date.parse(profile.createdAt),
    {
      message: 'updatedAt must be greater than or equal to createdAt',
      path: ['updatedAt'],
    }
  )
  .refine(
    (profile) =>
      new Set(profile.schedule.preferredDays).size ===
      profile.schedule.preferredDays.length,
    {
      message: 'preferredDays must not contain duplicates',
      path: ['schedule', 'preferredDays'],
    }
  );

export type Profile = z.infer<typeof profileSchema>;

export type Sex = (typeof SEX_VALUES)[number];
export type Goal = (typeof GOAL_VALUES)[number];
export type ExperienceLevel = (typeof EXPERIENCE_VALUES)[number];
export type Day = (typeof DAY_VALUES)[number];
export type EquipmentAccess = (typeof EQUIPMENT_VALUES)[number];
export type Language = (typeof LANGUAGE_VALUES)[number];
export type Units = (typeof UNITS_VALUES)[number];
export type CoachPersonality = (typeof COACH_VALUES)[number];

/**
 * Returns a Profile with empty defaults suitable as `react-hook-form`
 * `defaultValues`. The schema fails to parse this — that's expected; defaults
 * are only valid as a *form* state, not as a *persisted* state.
 */
export function defaultProfile(): Profile {
  const now = new Date().toISOString();
  return {
    id: 'me',
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,
    identity: {
      name: '',
      age: 25,
      sex: 'prefer-not-to-say',
    },
    body: {
      heightCm: 170,
      bodyweightKg: 75,
    },
    goal: 'general-fitness',
    experience: {
      level: 'intermediate',
    },
    schedule: {
      preferredDays: ['mon', 'wed', 'fri'],
    },
    equipment: {
      access: 'commercial-gym',
      notes: undefined,
    },
    injuries: undefined,
    language: {
      preferred: 'en',
      units: 'metric',
    },
    coachPersonality: 'direct',
    additionalContext: undefined,
  };
}

/**
 * Names of optional fields used by the completeness indicator.
 * Required fields are excluded by definition — they're filled or the wizard
 * wouldn't have completed.
 */
export const OPTIONAL_FIELDS = [
  'equipmentNotes',
  'injuries',
  'additionalContext',
] as const;

export type OptionalField = (typeof OPTIONAL_FIELDS)[number];

export type CompletenessResult = {
  /** Percentage filled, rounded to nearest 5 to avoid jitter. */
  percent: number;
  /** Optional fields that are still empty. */
  missingOptional: OptionalField[];
};

/**
 * Compute profile completeness from optional fields only. See R7 in
 * specs/001-profile-wizard/research.md.
 */
export function profileCompleteness(profile: Profile): CompletenessResult {
  const missing: OptionalField[] = [];

  if (!profile.equipment.notes || profile.equipment.notes.trim() === '') {
    missing.push('equipmentNotes');
  }
  if (!profile.injuries || profile.injuries.trim() === '') {
    missing.push('injuries');
  }
  if (!profile.additionalContext || profile.additionalContext.trim() === '') {
    missing.push('additionalContext');
  }

  const total = OPTIONAL_FIELDS.length;
  const filled = total - missing.length;
  const rawPercent = (filled / total) * 100;
  const percent = Math.round(rawPercent / 5) * 5;

  return { percent, missingOptional: missing };
}
