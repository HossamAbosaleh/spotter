import { z } from 'zod';

/**
 * Profile — the single per-device record describing the human using Spotter.
 *
 * Source of truth for the wizard's data model. See
 * specs/001-profile-wizard/data-model.md §1 for the full field table and
 * invariants.
 *
 * Required fields are the absolute minimum for "this profile can exist":
 * identity (name, age, sex), body (height, bodyweight), and language. Every
 * other field is optional at the schema level. The wizard collects them to
 * build a richer plan, but a stripped-down profile is a valid persisted
 * profile. `profileCompleteness()` distinguishes between "recommended
 * before generating a plan" and "nice-to-have."
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

    // Required: minimum viable identity.
    identity: z.object({
      name: z.string().trim().min(1).max(60),
      age: z.number().int().min(13).max(100),
      sex: z.enum(SEX_VALUES),
    }),

    // Required: minimum viable body data for working-weight defaults.
    body: z.object({
      heightCm: z.number().min(120).max(230),
      bodyweightKg: z.number().min(30).max(250),
    }),

    // Required: a chosen training goal is the strongest signal the AI
    // plan generator has. We refuse to save a profile without it rather
    // than ship a thin prompt the LLM has to guess around.
    goal: z.enum(GOAL_VALUES),

    // Required. Wrapper kept as an object (forward-compat: P2+ may add
    // more experience-related fields like yearsLifting). `level` itself
    // is mandatory.
    experience: z.object({
      level: z.enum(EXPERIENCE_VALUES),
    }),

    // Wrapper required, array can be empty. Some users train irregular
    // cycles and don't think in weekly days; forcing a weekly schedule
    // would be presumptuous.
    schedule: z.object({
      preferredDays: z.array(z.enum(DAY_VALUES)).max(7),
    }),

    // Wrapper required. `access` is required (determines which
    // exercises Spotter can suggest at all). `notes` stays optional
    // (nice-to-have elaboration on the equipment context).
    equipment: z.object({
      access: z.enum(EQUIPMENT_VALUES),
      notes: z.string().trim().max(500).optional(),
    }),

    /**
     * Free-text injuries / movement limitations.
     *
     * v1: freeform text. Future: P2 AI bridge will likely require
     * structured injury data (affectedJoints + details). Migration
     * expected when the AI bridge needs to filter exercises by injury.
     * The schema bump will add a structured field; this freeform field
     * stays as fallback / archive.
     */
    injuries: z.string().trim().max(500).optional(),

    // Required: language preference is needed from first paint (RTL
    // detection) so it cannot be optional.
    language: z.object({
      preferred: z.enum(LANGUAGE_VALUES),
      units: z.enum(UNITS_VALUES),
    }),

    // Required at the type level via `.default('direct')`. The wizard's
    // form may leave this unset; the resolver applies the default on
    // submit so the persisted Profile always has a value. Adjustable
    // later via settings.
    coachPersonality: z.enum(COACH_VALUES).default('direct'),

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
export type ProfileInput = z.input<typeof profileSchema>;

export type Sex = (typeof SEX_VALUES)[number];
export type Goal = (typeof GOAL_VALUES)[number];
export type ExperienceLevel = (typeof EXPERIENCE_VALUES)[number];
export type Day = (typeof DAY_VALUES)[number];
export type EquipmentAccess = (typeof EQUIPMENT_VALUES)[number];
export type Language = (typeof LANGUAGE_VALUES)[number];
export type Units = (typeof UNITS_VALUES)[number];
export type CoachPersonality = (typeof COACH_VALUES)[number];

/**
 * Default profile shape used as the wizard's initial form values.
 *
 * CONTAINED TYPE LIE: This returns `Profile` via cast, but at runtime
 * `goal`, `experience.level`, and `equipment.access` are `undefined`
 * until the user picks them in the wizard. The lie is bounded to
 * "wizard draft state" — after `form.handleSubmit` runs
 * `profileSchema.parse`, the data is genuinely Profile-shaped, and
 * `useProfileStore.profile` never holds undefined for these fields
 * (persistence requires a valid schema parse).
 *
 * Consumers reading `form.watch()` or `field.value` during the wizard
 * MUST tolerate `undefined` for these three paths. The wizard step
 * components use `value={field.value ?? ''}` as defensive runtime
 * guards (see steps 2/3/4).
 *
 * DO NOT "fix" the cast by introducing plausible defaults — that was
 * the bug we're explicitly fixing. Pre-selecting goal/experience/
 * equipment in the UI lets users breeze past required data, producing
 * thin AI prompts that defeat Spotter's value proposition.
 *
 * The empty-string `name` and undefined required fields also mean
 * `profileSchema.parse(defaultProfile())` intentionally fails. That's
 * the seed shape for a form, not a persisted record.
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
    goal: undefined,
    experience: {
      level: undefined,
    },
    schedule: {
      preferredDays: [],
    },
    equipment: {
      access: undefined,
      notes: undefined,
    },
    injuries: undefined,
    language: {
      preferred: 'en',
      units: 'metric',
    },
    coachPersonality: 'direct',
    additionalContext: undefined,
  } as unknown as Profile;
}

/**
 * Fields recommended before the AI bridge generates a plan. A profile
 * saves without these (the wizard doesn't block) but the post-setup
 * nudge surfaces them.
 *
 * Note: goal, experience.level, and equipment.access used to live here
 * but are now schema-required — the wizard can't save a profile
 * without them, so they don't belong in completeness math any more.
 */
export const RECOMMENDED_FIELDS = ['preferredDays'] as const;

/**
 * Nice-to-have fields. Never block, never preempt the AI bridge — surface
 * as a quiet "fill these when you have a moment" indicator.
 */
export const OPTIONAL_FIELDS = [
  'equipmentNotes',
  'injuries',
  'additionalContext',
] as const;

export type RecommendedField = (typeof RECOMMENDED_FIELDS)[number];
export type OptionalField = (typeof OPTIONAL_FIELDS)[number];

export type CompletenessResult = {
  /** Total fill percentage across recommended + optional fields, rounded to nearest 5%. */
  percent: number;
  /** Fields recommended before plan generation. Surface prominently. */
  recommendedMissing: RecommendedField[];
  /** Nice-to-have fields. Surface quietly. */
  optionalMissing: OptionalField[];
};

/**
 * Compute profile completeness across recommended and nice-to-have
 * fields. Required fields (identity, body, language) are excluded — by
 * definition they're filled or the wizard wouldn't have completed.
 *
 * `recommendedMissing` and `optionalMissing` are returned separately so
 * the UI can prioritize "fill these before generating a plan" prompts
 * over decorative nudges. See R7 in specs/001-profile-wizard/research.md.
 */
export function profileCompleteness(profile: Profile): CompletenessResult {
  const recommendedMissing: RecommendedField[] = [];
  const optionalMissing: OptionalField[] = [];

  if (profile.schedule.preferredDays.length === 0) {
    recommendedMissing.push('preferredDays');
  }

  if (!profile.equipment.notes || profile.equipment.notes.trim() === '') {
    optionalMissing.push('equipmentNotes');
  }
  if (!profile.injuries || profile.injuries.trim() === '') {
    optionalMissing.push('injuries');
  }
  if (!profile.additionalContext || profile.additionalContext.trim() === '') {
    optionalMissing.push('additionalContext');
  }

  const total = RECOMMENDED_FIELDS.length + OPTIONAL_FIELDS.length; // 4
  const filled = total - recommendedMissing.length - optionalMissing.length;
  const rawPercent = (filled / total) * 100;
  const percent = Math.round(rawPercent / 5) * 5;

  return { percent, recommendedMissing, optionalMissing };
}
