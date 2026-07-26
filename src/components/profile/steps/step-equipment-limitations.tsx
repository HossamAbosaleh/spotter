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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { type EquipmentAccess, type Profile } from '@/domain/profile';

/**
 * Step 4 — Equipment & Limitations. Three optional fields:
 * `equipment.access` (RadioGroup), `equipment.notes` (Textarea), and
 * `injuries` (Textarea).
 *
 * Follows the T024–T026 template:
 * - Consumes the shared form via useFormContext<Profile>().
 * - Renders CardHeader + CardContent only.
 * - Each field is a FormField → FormItem → FormControl → FormMessage
 *   stack.
 *
 * All three fields are optional; Next advances even when empty.
 * Length cap (≤500) is enforced by the Zod schema and surfaces via
 * FormMessage if the user types past the limit.
 */

const EQUIPMENT_OPTIONS: readonly { value: EquipmentAccess; tKey: string }[] = [
  { value: 'commercial-gym', tKey: 'commercialGym' },
  { value: 'home-full', tKey: 'homeFull' },
  { value: 'home-minimal', tKey: 'homeMinimal' },
  { value: 'bodyweight-only', tKey: 'bodyweightOnly' },
] as const;

export function StepEquipmentLimitations() {
  const { t } = useTranslation();
  const form = useFormContext<Profile>();

  return (
    <>
      <CardHeader>
        <CardTitle role="heading" aria-level={2}>
          {t('wizard.equipmentLimitations.title')}
        </CardTitle>
        <CardDescription>
          {t('wizard.equipmentLimitations.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <FormField
          control={form.control}
          name="equipment.access"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('wizard.equipmentLimitations.fields.equipment.label')}
              </FormLabel>
              <FormControl>
                {/* undefined possible during wizard draft state (defaultProfile lies — see domain/profile.ts JSDoc). */}
                <RadioGroup
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                  aria-label={t(
                    'wizard.equipmentLimitations.fields.equipment.label'
                  )}
                >
                  {EQUIPMENT_OPTIONS.map(({ value, tKey }) => {
                    const id = `equipment-${value}`;
                    return (
                      <label
                        key={value}
                        htmlFor={id}
                        className="flex min-h-11 cursor-pointer items-center gap-3"
                      >
                        <RadioGroupItem value={value} id={id} />
                        <Label htmlFor={id} className="cursor-pointer">
                          {t(
                            `wizard.equipmentLimitations.fields.equipment.options.${tKey}`
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
          name="equipment.notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('wizard.equipmentLimitations.fields.equipmentNotes.label')}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t(
                    'wizard.equipmentLimitations.fields.equipmentNotes.placeholder'
                  )}
                  name={field.name}
                  ref={field.ref}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="injuries"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('wizard.equipmentLimitations.fields.injuries.label')}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t(
                    'wizard.equipmentLimitations.fields.injuries.placeholder'
                  )}
                  name={field.name}
                  ref={field.ref}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              </FormControl>
              <FormDescription>
                {t('wizard.equipmentLimitations.fields.injuries.helper')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </>
  );
}
