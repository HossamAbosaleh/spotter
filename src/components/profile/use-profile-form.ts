import { useMemo } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { defaultProfile, profileSchema, type Profile } from '@/domain/profile';
import { readDraft } from '@/data/wizard-draft';
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
 * Edit-mode handling — defaultValues priority (highest wins):
 * 1. Wizard draft from localStorage. If the user closed the tab mid-
 *    wizard, the draft holds their in-progress answers — restoring
 *    it makes the wizard "just continue" per US2 (no Resume? modal).
 *    This wins over the saved profile because if both exist, the
 *    user has been editing their saved profile and the draft is the
 *    newer state they care about resuming.
 * 2. `useProfileStore.profile` if populated (edit mode entry from
 *    a previously saved profile) — pre-fills with their existing
 *    answers.
 * 3. `defaultProfile()` seed shape. Intentionally fails
 *    `profileSchema.parse` (empty name) — defaults are valid as form
 *    state, not as a persisted Profile.
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

  // Read draft once at mount. Re-reading on every render would
  // require the wizard to re-render any time localStorage changes,
  // which doesn't fire React updates anyway (no storage event in
  // same-tab writes). Mount-time read is the right granularity for
  // a "resume on tab reopen" feature.
  const draft = useMemo(() => readDraft(), []);

  const defaultValues = useMemo<Profile>(
    () => draft ?? savedProfile ?? defaultProfile(),
    [draft, savedProfile]
  );

  return useForm<Profile>({
    resolver: zodResolver(profileSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues,
  });
}
