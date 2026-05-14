import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { DAY_VALUES, type Profile } from '@/domain/profile';

/**
 * Shared section-summary formatters for the wizard's Step 6 Review
 * and the post-setup /profile page.
 *
 * The two surfaces render the same profile data in the same shape
 * (single Card → row per section → pencil affordance for editing).
 * Keeping the formatters in one module prevents drift — both Review
 * and Profile produce identical strings for the same input.
 *
 * Section-summary formatting rules (carried over from the original
 * step-review.tsx implementation):
 * - Required fields always render their value (post-schema-refactor
 *   goal / experience.level / equipment.access are guaranteed
 *   present).
 * - `preferredDays` empty → renders the "I train on irregular days"
 *   label, not "Not set" (per T026's irregular-schedule UX).
 * - `equipment.notes` and `injuries` hide when empty (secondary
 *   elaboration fields — keeps the summary scannable).
 * - Value descriptions (goal/experience/coach helper paragraphs from
 *   the pick screens) are NOT shown here. Only the label the user
 *   picked.
 *
 * Locale handling:
 * - `formatExperienceSchedule` uses Intl.ListFormat for AR-aware
 *   day-list conjunctions ("Mon, Wed, and Fri" vs "الاثنين، الأربعاء،
 *   والجمعة").
 * - Kebab-case enum values are mapped to camelCase for i18n key
 *   lookup (e.g., `fat-loss` → `fatLoss`).
 */

type TFn = ReturnType<typeof useTranslation>['t'];

/** Convert kebab-case enum value to camelCase for i18n key lookup. */
function toCamel(kebab: string): string {
  return kebab.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

export function formatIdentity(profile: Profile, t: TFn): string {
  const sexLabel = t(
    `wizard.identity.fields.sex.options.${toCamel(profile.identity.sex)}`
  );
  return [profile.identity.name, profile.identity.age, sexLabel].join(', ');
}

export function formatBodyGoal(profile: Profile, t: TFn): string {
  // Metric-only display, matching T025's deferred-imperial decision.
  const heightUnit = t('wizard.bodyGoal.fields.height.unit.metric');
  const weightUnit = t('wizard.bodyGoal.fields.bodyweight.unit.metric');
  const goalLabel = t(
    `wizard.bodyGoal.fields.goal.options.${toCamel(profile.goal)}`
  );
  return `${profile.body.heightCm} ${heightUnit}, ${profile.body.bodyweightKg} ${weightUnit}, ${goalLabel}`;
}

export function formatExperienceSchedule(
  profile: Profile,
  t: TFn,
  language: string
): string {
  const experienceLabel = t(
    `wizard.experienceSchedule.fields.experience.options.${profile.experience.level}`
  );
  const days = profile.schedule.preferredDays;
  if (days.length === 0) {
    return `${experienceLabel}, ${t(
      'wizard.experienceSchedule.fields.preferredDays.irregularLabel'
    )}`;
  }
  // Preserve week order regardless of pick order.
  const sortedDays = [...days].sort(
    (a, b) => DAY_VALUES.indexOf(a) - DAY_VALUES.indexOf(b)
  );
  const dayLabels = sortedDays.map((d) =>
    t(`wizard.experienceSchedule.fields.preferredDays.options.${d}`)
  );
  const list = formatList(dayLabels, language);
  return `${experienceLabel}, ${list}`;
}

export function formatEquipmentLimitations(
  profile: Profile,
  t: TFn
): ReactNode {
  const accessLabel = t(
    `wizard.equipmentLimitations.fields.equipment.options.${toCamel(
      profile.equipment.access
    )}`
  );
  const notes = profile.equipment.notes?.trim() ?? '';
  const injuries = profile.injuries?.trim() ?? '';
  // Single-line if no secondary elaboration; otherwise stack lines.
  if (!notes && !injuries) return accessLabel;
  return (
    <span className="flex flex-col gap-0.5">
      <span>{accessLabel}</span>
      {notes ? (
        <span>
          {t('wizard.equipmentLimitations.fields.equipmentNotes.label')}:{' '}
          {notes}
        </span>
      ) : null}
      {injuries ? (
        <span>
          {t('wizard.equipmentLimitations.fields.injuries.label')}: {injuries}
        </span>
      ) : null}
    </span>
  );
}

export function formatLanguageCoach(profile: Profile, t: TFn): string {
  const languageLabel = t(
    `wizard.languageCoach.fields.language.options.${profile.language.preferred}`
  );
  const unitsLabel = t(
    `wizard.languageCoach.fields.units.options.${profile.language.units}`
  );
  const coachLabel = t(
    `wizard.languageCoach.fields.coach.options.${profile.coachPersonality}`
  );
  return `${languageLabel}, ${unitsLabel}, ${coachLabel}`;
}

/**
 * Join a list of items using locale-aware punctuation (Arabic uses
 * `، ` separator and `و` conjunction; English uses commas + "and").
 * Falls back to plain comma-join if Intl.ListFormat is unavailable.
 */
function formatList(items: string[], language: string): string {
  try {
    return new Intl.ListFormat(language, {
      style: 'long',
      type: 'conjunction',
    }).format(items);
  } catch {
    return items.join(', ');
  }
}
