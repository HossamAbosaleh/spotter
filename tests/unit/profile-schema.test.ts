import { describe, expect, it } from 'vitest';

import {
  defaultProfile,
  type Profile,
  profileCompleteness,
  profileSchema,
} from '@/domain/profile';

/**
 * A "fully populated" valid profile. Every recommended and optional field
 * is filled. Tests start from this and mutate to exercise individual
 * validators.
 */
function validProfile(): Profile {
  const now = new Date().toISOString();
  return {
    id: 'me',
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,
    identity: {
      name: 'Hossam',
      age: 32,
      sex: 'male',
    },
    body: {
      heightCm: 180,
      bodyweightKg: 80,
    },
    goal: 'strength',
    experience: { level: 'intermediate' },
    schedule: { preferredDays: ['mon', 'wed', 'fri'] },
    equipment: { access: 'commercial-gym' },
    language: { preferred: 'en', units: 'metric' },
    coachPersonality: 'direct',
  };
}

/**
 * Minimum viable profile: only the required fields filled (identity,
 * body, language). Everything else either undefined or empty.
 */
function minimalProfile(): Profile {
  const now = new Date().toISOString();
  return {
    id: 'me',
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,
    identity: {
      name: 'Hossam',
      age: 32,
      sex: 'male',
    },
    body: {
      heightCm: 180,
      bodyweightKg: 80,
    },
    experience: {},
    schedule: { preferredDays: [] },
    equipment: {},
    language: { preferred: 'en', units: 'metric' },
    coachPersonality: 'direct',
  };
}

describe('profileSchema', () => {
  it('parses a fully populated profile', () => {
    const result = profileSchema.safeParse(validProfile());
    expect(result.success).toBe(true);
  });

  it('parses a minimum viable profile (only required fields filled)', () => {
    const result = profileSchema.safeParse(minimalProfile());
    expect(result.success).toBe(true);
  });

  it('rejects out-of-range age', () => {
    const profile = validProfile();
    profile.identity.age = 12;
    expect(profileSchema.safeParse(profile).success).toBe(false);

    profile.identity.age = 101;
    expect(profileSchema.safeParse(profile).success).toBe(false);
  });

  it('rejects non-integer age', () => {
    const profile = validProfile();
    profile.identity.age = 25.5;
    expect(profileSchema.safeParse(profile).success).toBe(false);
  });

  it('rejects empty name', () => {
    const profile = validProfile();
    profile.identity.name = '';
    expect(profileSchema.safeParse(profile).success).toBe(false);
  });

  it('rejects out-of-range bodyweight', () => {
    const profile = validProfile();
    profile.body.bodyweightKg = 29;
    expect(profileSchema.safeParse(profile).success).toBe(false);

    profile.body.bodyweightKg = 251;
    expect(profileSchema.safeParse(profile).success).toBe(false);
  });

  it('accepts an empty preferredDays array', () => {
    const profile = validProfile();
    profile.schedule.preferredDays = [];
    expect(profileSchema.safeParse(profile).success).toBe(true);
  });

  it('rejects duplicate days', () => {
    const profile = validProfile();
    profile.schedule.preferredDays = ['mon', 'mon', 'wed'];
    expect(profileSchema.safeParse(profile).success).toBe(false);
  });

  it('rejects updatedAt earlier than createdAt', () => {
    const profile = validProfile();
    profile.createdAt = new Date('2026-05-07').toISOString();
    profile.updatedAt = new Date('2026-05-01').toISOString();
    expect(profileSchema.safeParse(profile).success).toBe(false);
  });

  it('accepts all three sex values', () => {
    for (const sex of ['male', 'female', 'prefer-not-to-say'] as const) {
      const profile = validProfile();
      profile.identity.sex = sex;
      expect(profileSchema.safeParse(profile).success).toBe(true);
    }
  });

  it('accepts all five goal values', () => {
    for (const goal of [
      'strength',
      'hypertrophy',
      'fat-loss',
      'recomposition',
      'general-fitness',
    ] as const) {
      const profile = validProfile();
      profile.goal = goal;
      expect(profileSchema.safeParse(profile).success).toBe(true);
    }
  });

  it('applies the coachPersonality default when input omits it', () => {
    const input = minimalProfile() as unknown as Record<string, unknown>;
    delete input.coachPersonality;
    const result = profileSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.coachPersonality).toBe('direct');
    }
  });
});

describe('defaultProfile', () => {
  it('returns a profile with a present-valid timestamp pair', () => {
    const profile = defaultProfile();
    expect(profile.id).toBe('me');
    expect(profile.schemaVersion).toBe(1);
    expect(Date.parse(profile.createdAt)).toBe(Date.parse(profile.updatedAt));
  });

  it('returns a profile that fails name validation (intentional — defaults are form state, not persisted state)', () => {
    expect(profileSchema.safeParse(defaultProfile()).success).toBe(false);
  });

  it('starts every recommended field unset', () => {
    const profile = defaultProfile();
    expect(profile.goal).toBeUndefined();
    expect(profile.experience.level).toBeUndefined();
    expect(profile.equipment.access).toBeUndefined();
    expect(profile.schedule.preferredDays).toEqual([]);
  });

  it('defaults coachPersonality to "direct"', () => {
    expect(defaultProfile().coachPersonality).toBe('direct');
  });
});

describe('profileCompleteness', () => {
  it('returns 0% when no recommended or optional fields are filled', () => {
    const profile = minimalProfile();
    const result = profileCompleteness(profile);
    expect(result.percent).toBe(0);
    expect(result.recommendedMissing).toEqual([
      'goal',
      'experience',
      'equipmentAccess',
      'preferredDays',
    ]);
    expect(result.optionalMissing).toEqual([
      'equipmentNotes',
      'injuries',
      'additionalContext',
    ]);
  });

  it('returns 100% when every recommended and optional field is filled', () => {
    const profile = validProfile();
    profile.equipment.notes = 'rack and barbell';
    profile.injuries = 'left shoulder, no overhead';
    profile.additionalContext = 'training for a meet in October';
    const result = profileCompleteness(profile);
    expect(result.percent).toBe(100);
    expect(result.recommendedMissing).toEqual([]);
    expect(result.optionalMissing).toEqual([]);
  });

  it('flags goal, experience, equipmentAccess, and preferredDays as recommended', () => {
    const profile = minimalProfile();
    profile.equipment.notes = 'something';
    profile.injuries = 'something';
    profile.additionalContext = 'something';
    const result = profileCompleteness(profile);
    // 3 of 7 filled = 42.86% → rounds to 45.
    expect(result.percent).toBe(45);
    expect(result.recommendedMissing).toEqual([
      'goal',
      'experience',
      'equipmentAccess',
      'preferredDays',
    ]);
    expect(result.optionalMissing).toEqual([]);
  });

  it('flags all four recommended fields when only required fields are filled', () => {
    const profile = minimalProfile();
    const result = profileCompleteness(profile);
    expect(result.recommendedMissing).toHaveLength(4);
  });

  it('rounds to nearest 5%', () => {
    const profile = minimalProfile();
    profile.goal = 'strength';
    // 1 of 7 filled = 14.28% → rounds to 15.
    const result = profileCompleteness(profile);
    expect(result.percent).toBe(15);
  });

  it('treats whitespace-only values as missing', () => {
    const profile = validProfile();
    profile.equipment.notes = '   ';
    profile.injuries = '\t\n';
    const result = profileCompleteness(profile);
    expect(result.optionalMissing).toContain('equipmentNotes');
    expect(result.optionalMissing).toContain('injuries');
  });

  it('treats empty preferredDays as recommended-missing', () => {
    const profile = validProfile();
    profile.schedule.preferredDays = [];
    const result = profileCompleteness(profile);
    expect(result.recommendedMissing).toContain('preferredDays');
  });
});
