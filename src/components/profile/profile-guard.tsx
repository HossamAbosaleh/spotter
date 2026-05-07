import { useEffect, type ReactNode } from 'react';

import { detectPersistence } from '@/data/persistence-availability';
import { profileRepository } from '@/data/repositories/profile-repository';
import { usePersistenceStore } from '@/stores/persistence-store';
import { useProfileStore } from '@/stores/profile-store';

/**
 * Bootstraps the data layer for the app:
 *  - probes IndexedDB availability and publishes to usePersistenceStore
 *  - loads the persisted profile (if any) and publishes to useProfileStore
 *
 * Renders a minimal canvas-coloured skeleton while loading so the user
 * doesn't see a flash of "no profile, here's the wizard" before the
 * repository has answered. See R9 in specs/001-profile-wizard/research.md.
 */
export function ProfileGuard({ children }: { children: ReactNode }) {
  const status = useProfileStore((s) => s.status);
  const setProfile = useProfileStore((s) => s.setProfile);
  const markReady = useProfileStore((s) => s.markReady);
  const setPersistence = usePersistenceStore((s) => s.setStatus);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const persistenceResult = await detectPersistence();
      if (cancelled) return;
      setPersistence(persistenceResult);

      if (persistenceResult.status !== 'available') {
        // No durable storage; nothing to load. Mark ready so the UI can
        // render without the loading skeleton.
        markReady();
        return;
      }

      const profileResult = await profileRepository.get();
      if (cancelled) return;

      if (profileResult.ok) {
        setProfile(profileResult.value);
      } else {
        // Treat read failure as "no profile" for now; the wizard or a
        // dedicated recovery surface handles schema-invalid in later tasks.
        markReady();
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [markReady, setPersistence, setProfile]);

  if (status === 'loading') {
    return <div aria-hidden className="min-h-screen bg-bg-canvas" />;
  }

  return <>{children}</>;
}
