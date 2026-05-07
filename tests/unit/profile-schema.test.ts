import { describe, expect, it } from 'vitest';

import {
  defaultProfile,
  type Profile,
  profileCompleteness,
  profileSchema,
} from '@/domain/profile';

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

describe('profileSchema', () => {
  it('parses a valid profile', () => {
    const result = profileSchema.safeParse(validProfile());
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

  it('rejects empty preferredDays', () => {
    const profile = validProfile();
    profile.schedule.preferredDays = [];
    expect(profileSchema.safeParse(profile).success).toBe(false);
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
});

describe('profileCompleteness', () => {
  it('returns 0% when all optional fields are empty', () => {
    const profile = validProfile();
    const result = profileCompleteness(profile);
    expect(result.percent).toBe(0);
    expect(result.missingOptional).toEqual([
      'equipmentNotes',
      'injuries',
      'additionalContext',
    ]);
  });

  it('returns 100% when all optional fields are filled', () => {
    const profile = validProfile();
    profile.equipment.notes = 'rack and barbell';
    profile.injuries = 'left shoulder, no overhead';
    profile.additionalContext = 'training for a meet in October';
    const result = profileCompleteness(profile);
    expect(result.percent).toBe(100);
    expect(result.missingOptional).toEqual([]);
  });

  it('rounds to nearest 5%', () => {
    const profile = validProfile();
    profile.injuries = 'something';
    // 1 of 3 filled = 33.33% → rounds to 35
    const result = profileCompleteness(profile);
    expect(result.percent).toBe(35);
  });

  it('treats whitespace-only values as missing', () => {
    const profile = validProfile();
    profile.equipment.notes = '   ';
    profile.injuries = '\t\n';
    const result = profileCompleteness(profile);
    expect(result.missingOptional).toContain('equipmentNotes');
    expect(result.missingOptional).toContain('injuries');
  });
});
