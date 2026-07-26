import { useTranslation } from 'react-i18next';

import { Wizard } from '@/components/profile/wizard';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { profileRepository } from '@/data/repositories/profile-repository';
import { useProfileStore } from '@/stores/profile-store';

/**
 * Profile setup page.
 *
 * Renders one of three surfaces depending on the profile store state:
 *  - Wizard (create or edit) when status is 'ready'. Edit mode is
 *    signalled by a subtle title change; the wizard's pre-fill is the
 *    primary affordance.
 *  - Corrupt-profile recovery panel when loadError is 'schema-invalid'.
 *  - Unknown-error recovery panel when loadError is 'unknown'.
 *
 * Storage-blocked is orthogonal — it pairs with status 'ready' and is
 * surfaced by the PersistenceBanner inside the wizard, not here.
 */
export default function Setup() {
  const { t } = useTranslation();
  const status = useProfileStore((s) => s.status);
  const loadError = useProfileStore((s) => s.loadError);
  const profile = useProfileStore((s) => s.profile);
  const clearProfile = useProfileStore((s) => s.clearProfile);

  const isEditing = Boolean(profile);
  const title = isEditing
    ? t('wizard.shell.editTitle')
    : t('wizard.shell.title');

  async function handleStartFresh() {
    // Best-effort clear: even if Dexie can't reach storage (already
    // surfaced as schema-invalid in this branch only when the row
    // existed), reset the in-memory store so the wizard renders.
    await profileRepository.clear();
    clearProfile();
  }

  function handleReload() {
    window.location.reload();
  }

  const showCorruptRecovery =
    status === 'error' && loadError === 'schema-invalid';
  const showUnknownRecovery = status === 'error' && loadError === 'unknown';

  return (
    <main className="min-h-screen bg-bg-canvas px-6 py-10 text-text-primary">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <header className="flex flex-col gap-1">
          <p className="font-mono text-caption uppercase tracking-widest text-text-muted">
            /setup
          </p>
          <h1 className="font-display text-display-md text-text-primary">
            {title}
          </h1>
        </header>

        {showCorruptRecovery ? (
          <Card data-slot="setup-recovery-corrupt">
            <CardHeader>
              <CardTitle>{t('wizard.errors.corruptProfile.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body text-text-muted">
                {t('wizard.errors.corruptProfile.body')}
              </p>
            </CardContent>
            <CardFooter className="justify-end gap-3">
              <Button type="button" variant="ghost" onClick={handleReload}>
                {t('wizard.shell.tryAgain')}
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => void handleStartFresh()}
              >
                {t('wizard.errors.corruptProfile.cta')}
              </Button>
            </CardFooter>
          </Card>
        ) : showUnknownRecovery ? (
          <Card data-slot="setup-recovery-unknown">
            <CardHeader>
              <CardTitle>{t('wizard.errors.unknownLoad.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body text-text-muted">
                {t('wizard.errors.unknownLoad.body')}
              </p>
            </CardContent>
            <CardFooter className="justify-end gap-3">
              <Button type="button" variant="primary" onClick={handleReload}>
                {t('wizard.shell.tryAgain')}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Wizard />
        )}
      </div>
    </main>
  );
}
