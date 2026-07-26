import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { GithubLogo } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { useProfileStore } from '@/stores/profile-store';

const GITHUB_URL = 'https://github.com/HossamAbosaleh/spotter';

/**
 * Landing page (P1).
 *
 * Two-state CTA driven by `useProfileStore.profile`:
 *  - no saved profile → "Get started" routes to /setup (create mode)
 *  - saved profile    → "Open Spotter" routes to /profile
 *
 * The store is always settled by the time Landing renders — ProfileGuard
 * blocks children while `status === 'loading'`, so there's no flicker
 * between CTA labels on first paint.
 */
function Landing() {
  const { t } = useTranslation();
  const profile = useProfileStore((s) => s.profile);

  const hasProfile = profile !== null;
  const ctaLabel = hasProfile ? t('landing.cta.open') : t('landing.cta.start');
  const ctaHref = hasProfile ? '/profile' : '/setup';

  return (
    <main className="min-h-screen bg-bg-canvas px-6 py-16 text-text-primary">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
        <header className="flex flex-col items-center gap-2">
          <h1 className="font-display text-display-lg leading-none text-text-primary">
            {t('app.name').toUpperCase()}
          </h1>
          <p className="font-display text-h1 text-accent-primary">
            {t('app.tagline')}
          </p>
        </header>

        <p className="max-w-xl text-body text-text-primary">
          {t('landing.positioning')}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 text-body-sm text-text-muted">
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

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="primary" size="lg">
            <Link to={ctaHref} data-slot="landing-cta-primary">
              {ctaLabel}
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-slot="landing-cta-github"
            >
              <GithubLogo className="size-5" aria-hidden weight="regular" />
              {t('landing.cta.github')}
            </a>
          </Button>
        </div>

        <p className="text-body-sm text-text-muted">{t('landing.privacy')}</p>
      </div>
    </main>
  );
}

export default Landing;
