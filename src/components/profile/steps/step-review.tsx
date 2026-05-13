import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { PencilSimple } from '@phosphor-icons/react';

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { DAY_VALUES, type Profile } from '@/domain/profile';

/**
 * Step 6 — Review. Renders a summary of every prior step's choices,
 * lets the user jump back to any step to edit, and houses the
 * `additionalContext` textarea as the wizard's last form field.
 *
 * Edit-then-return flow (v1): clicking a section row jumps the wizard
 * to that step via `onJumpToStep`. The user edits the value and walks
 * forward via Next through the remaining steps to return to Review.
 * No shortcut path back — that "Done editing" affordance is a
 * deliberate P2+ polish task. RHF state survives the unmounts, so
 * edited values appear correctly when Review re-mounts.
 *
 * Confirm CTA: the wizard's footer Next button is relabelled to
 * `wizard.review.confirmCta` ("Save my profile") on this step.
 * Behavior is still placeholder (logs to console); T032 wires
 * profileRepository.save() with loading state, toast, and navigation.
 *
 * Section-summary formatting rules:
 * - Required fields always render their value (post-schema-refactor
 *   goal / experience.level / equipment.access are guaranteed present).
 * - `preferredDays` empty → renders the "I train on irregular days"
 *   label, not "Not set" (per T026's irregular-schedule UX).
 * - `equipment.notes` and `injuries` hide when empty (secondary
 *   elaboration fields — keeps the summary scannable). The
 *   `wizard.review.empty` key is kept imported for forward-compat if
 *   a primary field becomes optional later.
 * - Value descriptions (goal/experience/coach helper paragraphs from
 *   the pick screens) are NOT shown here. Only the label the user
 *   picked.
 */

type StepProps = {
  activeStep: number;
  onJumpToStep?: (step: number) => void;
};

export function StepReview({ onJumpToStep }: StepProps): ReactNode {
  const { t, i18n } = useTranslation();
  const form = useFormContext<Profile>();

  // `watch()` re-renders on any change; Review is read-mostly so the
  // cost is fine, and we need every step's data available at once.
  const profile = form.watch();

  const sections = [
    {
      step: 1,
      titleKey: 'wizard.review.sections.identity',
      summary: formatIdentity(profile, t),
    },
    {
      step: 2,
      titleKey: 'wizard.review.sections.bodyGoal',
      summary: formatBodyGoal(profile, t),
    },
    {
      step: 3,
      titleKey: 'wizard.review.sections.experienceSchedule',
      summary: formatExperienceSchedule(profile, t, i18n.language),
    },
    {
      step: 4,
      titleKey: 'wizard.review.sections.equipmentLimitations',
      summary: formatEquipmentLimitations(profile, t),
    },
    {
      step: 5,
      titleKey: 'wizard.review.sections.languageCoach',
      summary: formatLanguageCoach(profile, t),
    },
  ] as const;

  return (
    <>
      <CardHeader>
        <CardTitle>{t('wizard.review.title')}</CardTitle>
        <CardDescription>{t('wizard.review.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col">
        <div className="flex flex-col">
          {sections.map(({ step, titleKey, summary }, idx) => (
            <SectionRow
              key={step}
              title={t(titleKey)}
              summary={summary}
              ariaLabel={t('wizard.review.editAria', { field: t(titleKey) })}
              onClick={onJumpToStep ? () => onJumpToStep(step) : undefined}
              isLast={idx === sections.length - 1}
            />
          ))}
        </div>

        <FormField
          control={form.control}
          name="additionalContext"
          render={({ field }) => (
            <FormItem className="mt-6">
              <FormLabel>
                {t('wizard.review.additionalContext.label')}
              </FormLabel>
              <FormControl>
                <Textarea
                  name={field.name}
                  ref={field.ref}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              </FormControl>
              <FormDescription>
                {t('wizard.review.additionalContext.helper')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </>
  );
}

/* --------------------------------- row --------------------------------- */

function SectionRow({
  title,
  summary,
  ariaLabel,
  onClick,
  isLast,
}: {
  title: string;
  summary: ReactNode;
  ariaLabel: string;
  onClick: (() => void) | undefined;
  isLast: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-label={ariaLabel}
      className={
        'group flex w-full flex-col items-stretch gap-1 py-3 text-start outline-none transition-colors duration-micro ease-standard' +
        ' rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background' +
        (isLast ? '' : ' border-b border-border')
      }
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-text-primary">{title}</span>
        <PencilSimple
          className="size-4 shrink-0 text-text-muted transition-colors group-hover:text-text-primary"
          aria-hidden
        />
      </div>
      <div className="text-body-sm text-text-muted">{summary}</div>
    </button>
  );
}

/* ------------------------------ formatters ----------------------------- */

type TFn = ReturnType<typeof useTranslation>['t'];

/** Convert kebab-case enum value to camelCase for i18n key lookup. */
function toCamel(kebab: string): string {
  return kebab.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

function formatIdentity(profile: Profile, t: TFn): string {
  const sexLabel = t(
    `wizard.identity.fields.sex.options.${toCamel(profile.identity.sex)}`
  );
  return [profile.identity.name, profile.identity.age, sexLabel].join(', ');
}

function formatBodyGoal(profile: Profile, t: TFn): string {
  // Metric-only display, matching T025's deferred-imperial decision.
  const heightUnit = t('wizard.bodyGoal.fields.height.unit.metric');
  const weightUnit = t('wizard.bodyGoal.fields.bodyweight.unit.metric');
  const goalLabel = t(
    `wizard.bodyGoal.fields.goal.options.${toCamel(profile.goal)}`
  );
  return `${profile.body.heightCm} ${heightUnit}, ${profile.body.bodyweightKg} ${weightUnit}, ${goalLabel}`;
}

function formatExperienceSchedule(
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

function formatEquipmentLimitations(profile: Profile, t: TFn): ReactNode {
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

function formatLanguageCoach(profile: Profile, t: TFn): string {
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
