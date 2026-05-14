import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';

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
import { type Profile } from '@/domain/profile';

import {
  formatBodyGoal,
  formatEquipmentLimitations,
  formatExperienceSchedule,
  formatIdentity,
  formatLanguageCoach,
} from '../section-formatters';
import { SectionRow } from '../section-row';

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
