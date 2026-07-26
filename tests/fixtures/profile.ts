import type { Profile } from '@/domain/profile';

/**
 * A fully-valid Profile fixture for tests.
 *
 * Returns a fresh object on every call (timestamps use `Date.now()`)
 * so tests can mutate without leaking state across runs. All required
 * schema fields are populated; optional fields (`equipment.notes`,
 * `injuries`, `additionalContext`) are intentionally omitted to
 * represent a "minimum-viable saved profile" baseline.
 *
 * Consumed by wizard-save / wizard-resume / wizard-completion /
 * Profile test suites. Extracted from per-file duplicates once a
 * fourth consumer landed — the pre-committed "extract when the
 * third consumer needs it" threshold tipped over.
 */
export function validProfile(): Profile {
  const now = new Date().toISOString();
  return {
    id: 'me',
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,
    identity: { name: 'Test User', age: 30, sex: 'male' },
    body: { heightCm: 180, bodyweightKg: 80 },
    goal: 'strength',
    experience: { level: 'intermediate' },
    schedule: { preferredDays: ['mon', 'wed', 'fri'] },
    equipment: { access: 'commercial-gym' },
    language: { preferred: 'en', units: 'metric' },
    coachPersonality: 'direct',
  };
}
