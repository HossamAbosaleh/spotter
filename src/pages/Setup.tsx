import { useTranslation } from 'react-i18next';

/**
 * Profile setup page.
 *
 * P1 placeholder — the full six-step wizard lands in US1 phase tasks
 * (T021–T034). This stub exists so the route is mountable as part of the
 * foundational substrate.
 */
export default function Setup() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-bg-canvas px-6 py-10 text-text-primary">
      <div className="mx-auto max-w-2xl">
        <p className="font-mono text-caption uppercase tracking-widest text-text-muted">
          /setup · placeholder
        </p>
        <h1 className="mt-2 font-display text-display-md text-text-primary">
          {t('wizard.shell.title', 'Set up your profile')}
        </h1>
        <p className="mt-4 text-body text-text-muted">
          The wizard ships with the US1 phase. The data layer is already live.
        </p>
      </div>
    </main>
  );
}
