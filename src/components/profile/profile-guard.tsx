import { useEffect, type ReactNode } from 'react';

import { detectPersistence } from '@/data/persistence-availability';
import { profileRepository } from '@/data/repositories/profile-repository';
import type { DomainError } from '@/data/result';
import { type LoadError, useProfileStore } from '@/stores/profile-store';
import { usePersistenceStore } from '@/stores/persistence-store';

/**
 * Bootstraps the data layer for the app:
 *  - probes IndexedDB availability and publishes to usePersistenceStore
 *  - loads the persisted profile (if any) and publishes to useProfileStore
 *  - on unrecoverable failure, transitions the profile store to 'error'
 *    with a specific loadError so a downstream recovery surface
 *    (Setup.tsx in T030) can offer a "Start fresh" path
 *
 * Renders a minimal canvas-coloured skeleton while loading so the user
 * doesn't see a flash of "no profile, here's the wizard" before the
 * repository has answered. See R9 in specs/001-profile-wizard/research.md.
 */
export function ProfileGuard({ children }: { children: ReactNode }) {
  const status = useProfileStore((s) => s.status);
  const setProfile = useProfileStore((s) => s.setProfile);
  const markReady = useProfileStore((s) => s.markReady);
  const setLoadError = useProfileStore((s) => s.setLoadError);
  const setPersistence = usePersistenceStore((s) => s.setStatus);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const persistenceResult = await detectPersistence();
      if (cancelled) return;
      setPersistence(persistenceResult);

      if (persistenceResult.status !== 'available') {
        // Storage is blocked, disabled, quota-exhausted, or unknown.
        // Surface it explicitly so the recovery UI can render the matching
        // banner / explanation rather than dropping the user into a fresh
        // wizard that silently won't persist their work.
        setLoadError('storage-blocked');
        return;
      }

      const profileResult = await profileRepository.get();
      if (cancelled) return;

      if (profileResult.ok) {
        // Either a parsed Profile or null (no profile yet). Both are
        // healthy "ready" states.
        setProfile(profileResult.value);
        return;
      }

      // Read failed. Map repository DomainError → store LoadError and
      // surface to the user; never silently fall through to "no profile."
      setLoadError(mapDomainErrorToLoadError(profileResult.error));
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [markReady, setLoadError, setPersistence, setProfile]);

  if (status === 'loading') {
    return <div aria-hidden className="min-h-screen bg-bg-canvas" />;
  }

  return <>{children}</>;
}

function mapDomainErrorToLoadError(error: DomainError): LoadError {
  switch (error) {
    case 'schema-invalid':
      return 'schema-invalid';
    case 'storage-unavailable':
    case 'storage-quota-exceeded':
      return 'storage-blocked';
    case 'unknown':
    default:
      return 'unknown';
  }
}
