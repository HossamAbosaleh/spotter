import { useMemo } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { defaultProfile, profileSchema, type Profile } from '@/domain/profile';
import { useProfileStore } from '@/stores/profile-store';

/**
 * Bootstraps the single shared `react-hook-form` instance for the
 * profile wizard.
 *
 * Why one form for the whole wizard:
 * - The wizard renders one step at a time, but every step writes into
 *   the same Profile. A single form instance keeps step state aligned
 *   without prop-drilling or a parallel reducer.
 * - Steps consume the form via `useFormContext()` (the shadcn `<Form>`
 *   primitive's intended pattern). They never receive the form as a
 *   prop; the wizard shell wraps everything in `<FormProvider>`.
 *
 * Edit-mode handling:
 * - If `useProfileStore.profile` is populated (a previously saved
 *   profile), `defaultValues` is hydrated from it so the wizard opens
 *   with the user's existing answers.
 * - Otherwise `defaultValues` is the seed shape from `defaultProfile()`.
 *   That seed intentionally fails `profileSchema.parse` (empty name) —
 *   defaults are valid as form state, not as a persisted Profile.
 *
 * Validation:
 * - `mode: 'onBlur'` matches DESIGN.md §3.7 (errors surface when the
 *   user moves off a field, not on every keystroke).
 * - `reValidateMode: 'onChange'` re-runs once an error is visible so
 *   typing a valid value clears the message immediately.
 * - The Zod resolver runs the full schema. The wizard shell gates step
 *   navigation by calling `form.trigger(stepFields)` so steps validate
 *   their own subset on Next.
 */
export function useProfileForm(): UseFormReturn<Profile> {
  const savedProfile = useProfileStore((s) => s.profile);

  const defaultValues = useMemo<Profile>(
    () => savedProfile ?? defaultProfile(),
    [savedProfile]
  );

  return useForm<Profile>({
    resolver: zodResolver(profileSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues,
  });
}
