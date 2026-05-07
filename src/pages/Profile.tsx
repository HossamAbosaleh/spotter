import { useTranslation } from 'react-i18next';

import { useProfileStore } from '@/stores/profile-store';

/**
 * Saved-profile view.
 *
 * P1 placeholder — fields list, edit links, and the completeness indicator
 * land with US1 (T031) and US4 (T045–T047). This stub displays the bare
 * minimum so the route is mountable.
 */
export default function Profile() {
  const { t } = useTranslation();
  const profile = useProfileStore((s) => s.profile);

  return (
    <main className="min-h-screen bg-bg-canvas px-6 py-10 text-text-primary">
      <div className="mx-auto max-w-2xl">
        <p className="font-mono text-caption uppercase tracking-widest text-text-muted">
          /profile · placeholder
        </p>
        <h1 className="mt-2 font-display text-display-md text-text-primary">
          {t('profile.shell.title', 'Your profile')}
        </h1>
        {profile ? (
          <p className="mt-4 text-body text-text-muted">
            Hello, {profile.identity.name}.
          </p>
        ) : (
          <p className="mt-4 text-body text-text-muted">
            No profile saved yet.
          </p>
        )}
      </div>
    </main>
  );
}
