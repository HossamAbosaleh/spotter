import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { type Profile, type Sex } from '@/domain/profile';
import { parseLocaleNumber } from '@/utils/digits';

/**
 * Step 1 — Identity. Collects `identity.{name, age, sex}`.
 *
 * Pattern intended as the template for steps 2–6 (T025–T029):
 * - Reads the wizard's shared form via `useFormContext<Profile>()`. No
 *   props — the wizard wraps in `<FormProvider>` so context flows down.
 * - Renders `<CardHeader>` + `<CardContent>` only; the wizard owns the
 *   `<Card>` boundary and `<CardFooter>` with Back / Next.
 * - Each field is a `<FormField>` → `<FormItem>` → `<FormControl>` →
 *   `<FormMessage>` stack so errors surface next to their input.
 *
 * Sex default is `'prefer-not-to-say'` (defined in `defaultProfile()` —
 * domain/profile.ts:172). Users who breeze through Step 1 ship with
 * that value; it's a schema-driven, privacy-preserving default and we
 * deliberately don't override it here.
 */

const SEX_OPTIONS: readonly { value: Sex; tKey: string }[] = [
  { value: 'male', tKey: 'male' },
  { value: 'female', tKey: 'female' },
  { value: 'prefer-not-to-say', tKey: 'preferNotToSay' },
] as const;

export function StepIdentity() {
  const { t } = useTranslation();
  const form = useFormContext<Profile>();

  return (
    <>
      <CardHeader>
        <CardTitle>{t('wizard.identity.title')}</CardTitle>
        <CardDescription>{t('wizard.identity.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <FormField
          control={form.control}
          name="identity.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('wizard.identity.fields.name.label')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('wizard.identity.fields.name.placeholder')}
                  autoComplete="given-name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="identity.age"
          render={({ field }) => <AgeInput field={field} />}
        />

        <FormField
          control={form.control}
          name="identity.sex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('wizard.identity.fields.sex.label')}</FormLabel>
              <FormControl>
                <RadioGroup value={field.value} onValueChange={field.onChange}>
                  {SEX_OPTIONS.map(({ value, tKey }) => {
                    const id = `identity-sex-${value}`;
                    return (
                      <label
                        key={value}
                        htmlFor={id}
                        className="flex min-h-11 cursor-pointer items-center gap-3"
                      >
                        <RadioGroupItem value={value} id={id} />
                        <Label htmlFor={id} className="cursor-pointer">
                          {t(`wizard.identity.fields.sex.options.${tKey}`)}
                        </Label>
                      </label>
                    );
                  })}
                </RadioGroup>
              </FormControl>
              <FormDescription>
                {t('wizard.identity.fields.sex.helper')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </>
  );
}

/**
 * Age input with bilingual numeric support.
 *
 * RHF holds `identity.age` as `number`. The visible value is a local
 * string so partial typing ("2", "٢") doesn't get clobbered by a round
 * trip through Number(). On every change we parse via parseLocaleNumber
 * (handles Arabic-Indic digits + locale separators) and push the parsed
 * number — or `NaN` on invalid — to RHF. The `z.number().int()` rule on
 * the schema rejects NaN naturally, so no extra branching is needed for
 * "invalid" vs "out of range" — both surface the same FormMessage.
 *
 * On step round-trip (Next → Back), this component unmounts and remounts
 * (wizard renders one step at a time). RHF state persists at the wizard
 * level, so `useState(String(field.value ?? ''))` re-initializes from
 * the still-valid numeric value. Note: Arabic-Indic input is normalized
 * to Latin digits on round-trip — by design, not a bug.
 */
function AgeInput({
  field,
}: {
  field: {
    value: number;
    onChange: (value: number) => void;
    onBlur: () => void;
    name: string;
    ref: React.Ref<HTMLInputElement>;
  };
}) {
  const { t } = useTranslation();
  const [ageText, setAgeText] = useState(
    Number.isFinite(field.value) ? String(field.value) : ''
  );

  return (
    <FormItem>
      <FormLabel>{t('wizard.identity.fields.age.label')}</FormLabel>
      <FormControl>
        <Input
          inputMode="decimal"
          autoComplete="off"
          name={field.name}
          ref={field.ref}
          value={ageText}
          onChange={(event) => {
            const next = event.target.value;
            setAgeText(next);
            const parsed = parseLocaleNumber(next);
            field.onChange(parsed ?? Number.NaN);
          }}
          onBlur={field.onBlur}
        />
      </FormControl>
      <FormDescription>
        {t('wizard.identity.fields.age.helper')}
      </FormDescription>
      <FormMessage />
    </FormItem>
  );
}
