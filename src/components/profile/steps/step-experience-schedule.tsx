import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  DAY_VALUES,
  EXPERIENCE_VALUES,
  type Day,
  type ExperienceLevel,
  type Profile,
} from '@/domain/profile';

/**
 * Step 3 — Experience & Schedule. Collects `experience.level` and
 * `schedule.preferredDays`. Both optional per schema.
 *
 * Follows the template from T024/T025:
 * - Consumes the wizard's shared form via useFormContext<Profile>().
 * - Renders CardHeader + CardContent; the wizard owns the Card and
 *   CardFooter.
 * - Each schema-backed field is a FormField → FormItem → FormControl →
 *   FormMessage stack.
 *
 * Irregular-schedule affordance: a Checkbox below the day list, NOT a
 * FormField — it's pure UI state. See PreferredDaysField below for the
 * mount-init heuristic and lossy-persistence note.
 */

const EXPERIENCE_OPTIONS: readonly ExperienceLevel[] = EXPERIENCE_VALUES;
const DAYS: readonly Day[] = DAY_VALUES;

export function StepExperienceSchedule() {
  const { t } = useTranslation();
  const form = useFormContext<Profile>();

  return (
    <>
      <CardHeader>
        <CardTitle role="heading" aria-level={2}>
          {t('wizard.experienceSchedule.title')}
        </CardTitle>
        <CardDescription>
          {t('wizard.experienceSchedule.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <FormField
          control={form.control}
          name="experience.level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('wizard.experienceSchedule.fields.experience.label')}
              </FormLabel>
              <FormControl>
                {/* undefined possible during wizard draft state (defaultProfile lies — see domain/profile.ts JSDoc). */}
                <RadioGroup
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                  aria-label={t(
                    'wizard.experienceSchedule.fields.experience.label'
                  )}
                >
                  {EXPERIENCE_OPTIONS.map((value) => {
                    const id = `experience-${value}`;
                    return (
                      <label
                        key={value}
                        htmlFor={id}
                        className="flex min-h-11 cursor-pointer items-center gap-3"
                      >
                        <RadioGroupItem value={value} id={id} />
                        <Label htmlFor={id} className="cursor-pointer">
                          {t(
                            `wizard.experienceSchedule.fields.experience.options.${value}`
                          )}
                        </Label>
                      </label>
                    );
                  })}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="schedule.preferredDays"
          render={({ field }) => <PreferredDaysField field={field} />}
        />
      </CardContent>
    </>
  );
}

/**
 * Day picker with the irregular-schedule affordance.
 *
 * The `irregular` flag is local UI state (not a FormField). It's
 * initialized lazily on mount from `field.value.length === 0`, then
 * only toggles via user click — no auto-flip when the user manually
 * unchecks all days. A user revisiting this step with empty
 * preferredDays sees irregular ON; that's by design (empty days IS
 * the irregular state in storage).
 *
 * Lossy persistence: a user who picks "irregular" and a user who
 * skips this step both save preferredDays: []. The schema can't
 * distinguish these intents — that's acceptable for v1, since the AI
 * plan generator treats empty as "no weekly preference" regardless
 * of cause. A future P2+ schema migration may add
 * `schedule.declaredIrregular: boolean` if disambiguation is needed.
 *
 * Toggle-ON clears preferredDays explicitly. Toggle-OFF leaves the
 * array empty for fresh selection (no restore of prior picks — the
 * user's gesture is meaningful enough to warrant a clean slate).
 */
function PreferredDaysField({
  field,
}: {
  field: {
    value: Day[];
    onChange: (value: Day[]) => void;
    onBlur: () => void;
    name: string;
  };
}) {
  const { t } = useTranslation();
  const [irregular, setIrregular] = useState(() => field.value.length === 0);

  function toggleDay(day: Day, checked: boolean) {
    const next = checked
      ? [...field.value, day]
      : field.value.filter((d) => d !== day);
    field.onChange(next);
  }

  return (
    <FormItem>
      <FormLabel>
        {t('wizard.experienceSchedule.fields.preferredDays.label')}
      </FormLabel>
      <FormControl>
        <div
          className="flex flex-col"
          role="group"
          aria-label={t('wizard.experienceSchedule.fields.preferredDays.label')}
        >
          {DAYS.map((day) => {
            const id = `day-${day}`;
            const checked = field.value.includes(day);
            return (
              <label
                key={day}
                htmlFor={id}
                className={
                  'flex min-h-11 cursor-pointer items-center gap-3' +
                  (irregular ? ' cursor-not-allowed opacity-50' : '')
                }
              >
                <Checkbox
                  id={id}
                  checked={checked}
                  disabled={irregular}
                  onCheckedChange={(c) => toggleDay(day, c === true)}
                />
                <Label
                  htmlFor={id}
                  className={
                    irregular ? 'cursor-not-allowed' : 'cursor-pointer'
                  }
                >
                  {t(
                    `wizard.experienceSchedule.fields.preferredDays.options.${day}`
                  )}
                </Label>
              </label>
            );
          })}
        </div>
      </FormControl>
      <FormDescription>
        {t('wizard.experienceSchedule.fields.preferredDays.helper')}
      </FormDescription>
      <label
        htmlFor="day-irregular"
        className="mt-2 flex min-h-11 cursor-pointer items-center gap-3"
      >
        <Checkbox
          id="day-irregular"
          checked={irregular}
          onCheckedChange={(c) => {
            const next = c === true;
            setIrregular(next);
            if (next) field.onChange([]);
          }}
        />
        <Label htmlFor="day-irregular" className="cursor-pointer">
          {t('wizard.experienceSchedule.fields.preferredDays.irregularLabel')}
        </Label>
      </label>
      <FormMessage />
    </FormItem>
  );
}
