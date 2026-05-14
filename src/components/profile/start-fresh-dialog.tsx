import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { UseFormReturn } from 'react-hook-form';
import { Trash } from '@phosphor-icons/react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { clearDraft, clearStep } from '@/data/wizard-draft';
import { defaultProfile, type Profile } from '@/domain/profile';

type StartFreshDialogProps = {
  form: UseFormReturn<Profile>;
  onReset: () => void;
  disabled?: boolean;
};

/**
 * Destructive confirmation flow for discarding the wizard's
 * in-progress answers.
 *
 * Scoped strictly to localStorage draft state and the form's current
 * values. Does NOT touch the committed profile in IndexedDB — if the
 * user is in edit mode (resumed from a previously-saved profile),
 * Start fresh resets the wizard back to blank without destroying the
 * saved profile. To delete a committed profile, use the /profile
 * page's separate affordance.
 *
 * Hidden on step 1 by the parent (wizard.tsx) — at step 1 there's
 * nothing to reset.
 */
export function StartFreshDialog({
  form,
  onReset,
  disabled = false,
}: StartFreshDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  function handleConfirm() {
    // 1. Drop the persisted draft + step so the next mount opens fresh.
    clearDraft();
    clearStep();
    // 2. Re-seed the form to defaultProfile() — NOT to a saved profile.
    //    Start fresh means blank; the user explicitly asked for it.
    form.reset(defaultProfile());
    // 3. Wizard shell handles routing back to step 1 via onReset.
    onReset();
    setOpen(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          data-slot="wizard-start-fresh-trigger"
        >
          <Trash className="size-4" aria-hidden />
          {t('wizard.shell.startFresh.cta')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('wizard.shell.startFresh.title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('wizard.shell.startFresh.confirm')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button type="button" variant="ghost">
              {t('wizard.shell.startFresh.cancel')}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirm}
              data-slot="wizard-start-fresh-confirm"
            >
              {t('wizard.shell.startFresh.cta')}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
