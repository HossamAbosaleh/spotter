import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { profileRepository } from '@/data/repositories/profile-repository';
import { clearDraft, clearStep } from '@/data/wizard-draft';
import { useProfileStore } from '@/stores/profile-store';
import { useToastStore } from '@/stores/toast-store';

/**
 * Destructive confirmation flow for deleting the user's saved
 * profile from /profile.
 *
 * This is the ONLY truly irreversible action in Spotter today —
 * unlike the wizard's "Start fresh" (which only discards in-flight
 * drafts and preserves the committed profile), this one wipes the
 * IndexedDB row, clears localStorage drafts/step, and routes the
 * user back to Landing as if they were a first-time visitor.
 *
 * Friction model (F1 — checkbox confirmation):
 *   1. User clicks the ghost "Start fresh" trigger.
 *   2. AlertDialog opens with strong "Delete your profile?" copy
 *      enumerating what's lost.
 *   3. User must check "I understand this cannot be undone." —
 *      confirm button stays disabled until then.
 *   4. User clicks the destructive "Delete" button.
 *   5. Repo clear + localStorage clear + store clear + toast +
 *      navigate to /. Landing now renders "Get started" again.
 *
 * The checkbox state resets to unchecked whenever the dialog
 * closes (cancel, esc, or post-confirm) so reopening the dialog
 * never inherits a stale "yes I'm sure" from a previous attempt.
 *
 * On clear() failure: the in-memory store + localStorage are
 * still cleared so the user lands in a coherent post-delete state
 * rather than a half-deleted limbo. The next successful save
 * (if the user changes their mind and re-runs the wizard) would
 * overwrite the row regardless.
 */
export function DeleteProfileDialog() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const clearProfile = useProfileStore((s) => s.clearProfile);
  const enqueueToast = useToastStore((s) => s.enqueue);

  async function handleDelete() {
    await profileRepository.clear();
    clearDraft();
    clearStep();
    clearProfile();

    enqueueToast({
      variant: 'default',
      title: t('profile.deletedToast.title'),
      durationMs: 4000,
    });

    setOpen(false);
    navigate('/');
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) setAcknowledged(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          data-slot="profile-delete-trigger"
        >
          <Trash className="size-4" aria-hidden />
          {t('profile.deleteTrigger')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('profile.deleteDialog.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('profile.deleteDialog.body')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <label
          htmlFor="profile-delete-acknowledge"
          className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-border bg-bg-canvas px-4 py-3"
        >
          <Checkbox
            id="profile-delete-acknowledge"
            checked={acknowledged}
            onCheckedChange={(checked) => setAcknowledged(checked === true)}
          />
          <Label
            htmlFor="profile-delete-acknowledge"
            className="cursor-pointer text-body-sm"
          >
            {t('profile.deleteDialog.checkbox')}
          </Label>
        </label>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button type="button" variant="ghost">
              {t('profile.deleteDialog.cancel')}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              type="button"
              variant="destructive"
              disabled={!acknowledged}
              onClick={() => void handleDelete()}
              data-slot="profile-delete-confirm"
            >
              {t('profile.deleteDialog.confirm')}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
