import { useTranslation } from 'react-i18next';

import { Wizard } from '@/components/profile/wizard';

/**
 * Profile setup page.
 *
 * Mounts the wizard shell. Full edit-mode wiring and the
 * corrupt-profile recovery surface land with T030; the page already
 * renders the live wizard so the shell, step components, and
 * navigation can be verified in the browser as each step (T024–T029)
 * ships.
 */
export default function Setup() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-bg-canvas px-6 py-10 text-text-primary">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <header className="flex flex-col gap-1">
          <p className="font-mono text-caption uppercase tracking-widest text-text-muted">
            /setup
          </p>
          <h1 className="font-display text-display-md text-text-primary">
            {t('wizard.shell.title')}
          </h1>
        </header>
        <Wizard />
      </div>
    </main>
  );
}
