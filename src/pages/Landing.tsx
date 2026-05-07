import { useTranslation } from 'react-i18next';

/**
 * Landing page.
 *
 * Phase P0 placeholder. Will be replaced in P1 with the real landing page
 * (one-sentence value prop, "Try it" CTA, "View on GitHub" link, privacy
 * line). For now: confirms the stack runs end-to-end.
 */
function Landing() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-bg-canvas px-6 py-16 text-text-primary">
      <div className="mx-auto max-w-2xl">
        <p className="font-mono text-caption uppercase tracking-widest text-text-muted">
          {t('landing.phaseLabel')}
        </p>
        <h1 className="mt-4 font-display text-display-lg leading-none text-text-primary">
          {t('app.name').toUpperCase()}
        </h1>
        <p className="mt-2 font-display text-h1 text-accent-primary">
          {t('app.tagline')}
        </p>
        <p className="mt-8 text-body text-text-muted">
          {t('landing.introBody')}
        </p>
        <p className="mt-4 text-body text-text-muted">
          {t('landing.nextPhase')}{' '}
          <span className="text-text-primary">
            {t('landing.nextPhaseName')}
          </span>
          . {t('landing.runCommand')}{' '}
          <code className="rounded-sm bg-bg-elevated px-1.5 py-0.5 font-mono text-mono text-accent-primary">
            /impeccable teach
          </code>{' '}
          {t('landing.toBegin')}
        </p>
        <div className="mt-12 flex flex-wrap items-center gap-4 text-body-sm text-text-dim">
          <span className="rounded-pill border border-border px-3 py-1">
            {t('landing.badges.noServer')}
          </span>
          <span className="rounded-pill border border-border px-3 py-1">
            {t('landing.badges.freeForever')}
          </span>
          <span className="rounded-pill border border-border px-3 py-1">
            {t('landing.badges.openSource')}
          </span>
          <span className="rounded-pill border border-border px-3 py-1">
            {t('landing.badges.allDataLocal')}
          </span>
        </div>
      </div>
    </main>
  );
}

export default Landing;
