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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  COACH_VALUES,
  LANGUAGE_VALUES,
  UNITS_VALUES,
  type CoachPersonality,
  type Language,
  type Profile,
  type Units,
} from '@/domain/profile';
import { setLanguage } from '@/i18n';

/**
 * Step 5 — Language & Coach. Three schema-required fields, each with
 * a concrete default in defaultProfile() (`en`, `metric`, `direct`),
 * so RHF never surfaces undefined here and the radios always render
 * with one option selected.
 *
 * Language behavior (Option A — apply on selection):
 * - Picking a language fires `setLanguage()` from src/i18n. That
 *   triggers `i18n.changeLanguage` (so every `useTranslation` consumer
 *   re-renders) and writes through to `localStorage['spotter.lang']`.
 *   `useDirection`, mounted at App root, re-syncs `<html lang>` +
 *   `<html dir>` via its effect on `i18n.language`.
 * - RHF state and i18n state update in the same event handler. The
 *   single frame between RHF state set and i18n re-render is
 *   imperceptible.
 *
 * Coach default acceptance: 'direct' is pre-selected per schema
 * default. Unlike goal/experience/equipment — where pre-selection
 * would let users breeze past required prompt input — coach personality
 * only shapes voice/tone, and 'direct' is a defensible neutral default.
 */

const LANGUAGE_OPTIONS: readonly Language[] = LANGUAGE_VALUES;
const UNIT_OPTIONS: readonly Units[] = UNITS_VALUES;
const COACH_OPTIONS: readonly CoachPersonality[] = COACH_VALUES;

export function StepLanguageCoach() {
  const { t } = useTranslation();
  const form = useFormContext<Profile>();

  return (
    <>
      <CardHeader>
        <CardTitle role="heading" aria-level={2}>
          {t('wizard.languageCoach.title')}
        </CardTitle>
        <CardDescription>{t('wizard.languageCoach.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <FormField
          control={form.control}
          name="language.preferred"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('wizard.languageCoach.fields.language.label')}
              </FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setLanguage(value as Language);
                  }}
                  aria-label={t('wizard.languageCoach.fields.language.label')}
                >
                  {LANGUAGE_OPTIONS.map((value) => {
                    const id = `language-${value}`;
                    return (
                      <label
                        key={value}
                        htmlFor={id}
                        className="flex min-h-11 cursor-pointer items-center gap-3"
                      >
                        <RadioGroupItem value={value} id={id} />
                        <Label htmlFor={id} className="cursor-pointer">
                          {t(
                            `wizard.languageCoach.fields.language.options.${value}`
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
          name="language.units"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('wizard.languageCoach.fields.units.label')}
              </FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  aria-label={t('wizard.languageCoach.fields.units.label')}
                >
                  {UNIT_OPTIONS.map((value) => {
                    const id = `units-${value}`;
                    return (
                      <label
                        key={value}
                        htmlFor={id}
                        className="flex min-h-11 cursor-pointer items-center gap-3"
                      >
                        <RadioGroupItem value={value} id={id} />
                        <Label htmlFor={id} className="cursor-pointer">
                          {t(
                            `wizard.languageCoach.fields.units.options.${value}`
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
          name="coachPersonality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('wizard.languageCoach.fields.coach.label')}
              </FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  aria-label={t('wizard.languageCoach.fields.coach.label')}
                >
                  {COACH_OPTIONS.map((value) => {
                    const id = `coach-${value}`;
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
                            {t(
                              `wizard.languageCoach.fields.coach.options.${value}`
                            )}
                          </Label>
                          <p className="text-body-sm text-text-muted">
                            {t(
                              `wizard.languageCoach.fields.coach.descriptions.${value}`
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
