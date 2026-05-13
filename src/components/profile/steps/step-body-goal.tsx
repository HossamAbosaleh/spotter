import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useFormContext,
  type ControllerRenderProps,
  type FieldPath,
} from 'react-hook-form';

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { type Goal, type Profile } from '@/domain/profile';
import { parseLocaleNumber } from '@/utils/digits';

/**
 * Step 2 — Body & Goal. Collects `body.heightCm`, `body.bodyweightKg`,
 * and `goal` (optional).
 *
 * Follows the template established by T024 step-identity:
 * - Consumes the wizard's shared form via useFormContext<Profile>().
 * - Renders CardHeader + CardContent only; the wizard owns the Card
 *   and CardFooter.
 * - Each field is a FormField → FormItem → FormControl → FormMessage
 *   stack so errors surface adjacent to their input.
 *
 * Goal is optional per the schema (`z.enum(...).optional()`), so the
 * RadioGroup renders with nothing pre-selected and Next can advance
 * with goal unset. A picked goal sharpens the future AI plan; we
 * deliberately don't force a default that would silently skew it.
 *
 * Imperial unit display deferred — see the inline TODO at NumericInput.
 */

const GOAL_OPTIONS: readonly { value: Goal; tKey: string }[] = [
  { value: 'strength', tKey: 'strength' },
  { value: 'hypertrophy', tKey: 'hypertrophy' },
  { value: 'fat-loss', tKey: 'fatLoss' },
  { value: 'recomposition', tKey: 'recomposition' },
  { value: 'general-fitness', tKey: 'generalFitness' },
] as const;

export function StepBodyGoal() {
  const { t } = useTranslation();
  const form = useFormContext<Profile>();

  return (
    <>
      <CardHeader>
        <CardTitle>{t('wizard.bodyGoal.title')}</CardTitle>
        <CardDescription>{t('wizard.bodyGoal.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <FormField
          control={form.control}
          name="body.heightCm"
          render={({ field }) => (
            <NumericInput
              field={field}
              label={t('wizard.bodyGoal.fields.height.label')}
              unit={t('wizard.bodyGoal.fields.height.unit.metric')}
            />
          )}
        />

        <FormField
          control={form.control}
          name="body.bodyweightKg"
          render={({ field }) => (
            <NumericInput
              field={field}
              label={t('wizard.bodyGoal.fields.bodyweight.label')}
              unit={t('wizard.bodyGoal.fields.bodyweight.unit.metric')}
            />
          )}
        />

        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('wizard.bodyGoal.fields.goal.label')}</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                >
                  {GOAL_OPTIONS.map(({ value, tKey }) => {
                    const id = `goal-${value}`;
                    return (
                      <label
                        key={value}
                        htmlFor={id}
                        className="flex min-h-11 cursor-pointer items-start gap-3"
                      >
                        <RadioGroupItem
                          value={value}
                          id={id}
                          className="mt-1"
                        />
                        <div className="flex flex-col gap-0.5">
                          <Label htmlFor={id} className="cursor-pointer">
                            {t(`wizard.bodyGoal.fields.goal.options.${tKey}`)}
                          </Label>
                          <p className="text-body-sm text-text-muted">
                            {t(
                              `wizard.bodyGoal.fields.goal.descriptions.${tKey}`
                            )}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </>
  );
}

/**
 * Numeric field with a localized unit suffix.
 *
 * Same partial-typing-preserving pattern as AgeInput from T024:
 * local string state backs the visible input; on change we parse via
 * parseLocaleNumber (handles Arabic-Indic digits + locale separators)
 * and push the parsed number — or `NaN` on invalid — to RHF. The
 * schema's `z.number().min(...).max(...)` rejects NaN naturally, so
 * invalid and out-of-range both surface the same FormMessage (Zod's
 * default English message for now; localization is a separate task).
 *
 * On step round-trip (Next → Back) the component unmounts and
 * remounts; RHF state persists at the wizard level, so useState
 * re-initializes from the still-valid numeric value.
 *
 * TODO: Imperial unit display deferred to a follow-up task.
 * Storage stays metric SI per data-model.md §1 invariant.
 * When the imperial path lands, height/bodyweight inputs need
 * bidirectional conversion: parse imperial input → store metric,
 * read metric storage → display imperial. Until then, Step 2
 * shows cm/kg regardless of language.units selection.
 */
function NumericInput<TName extends FieldPath<Profile>>({
  field,
  label,
  unit,
}: {
  field: ControllerRenderProps<Profile, TName>;
  label: string;
  unit: string;
}) {
  const initial =
    typeof field.value === 'number' && Number.isFinite(field.value)
      ? String(field.value)
      : '';
  const [text, setText] = useState(initial);

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="flex items-center gap-2">
          <Input
            inputMode="decimal"
            autoComplete="off"
            name={field.name}
            ref={field.ref}
            value={text}
            onChange={(event) => {
              const next = event.target.value;
              setText(next);
              const parsed = parseLocaleNumber(next);
              field.onChange(parsed ?? Number.NaN);
            }}
            onBlur={field.onBlur}
            className="flex-1"
          />
          <span className="shrink-0 text-body-sm text-text-muted">{unit}</span>
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
