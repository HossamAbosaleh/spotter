import { create } from 'zustand';

import type { Profile } from '@/domain/profile';

/**
 * The single source of truth for the current Profile across the UI.
 *
 * `<ProfileGuard>` calls `profileRepository.get()` once on mount and
 * publishes the result here. Every component reads from this store, never
 * directly from the repository. See R9 in
 * specs/001-profile-wizard/research.md.
 *
 * The `'error'` status surfaces unrecoverable load failures — corrupt
 * records and unknown errors — to a dedicated recovery surface
 * (Setup.tsx). Without an explicit error state, schema drift silently
 * looks like "no profile yet," which loses the user's data without
 * telling them why.
 *
 * `loadError === 'storage-blocked'` is orthogonal to status: the user
 * can still proceed (their answers just won't persist), so it pairs
 * with status `'ready'` and the in-wizard PersistenceBanner surfaces
 * the warning.
 */

export type ProfileStoreStatus = 'loading' | 'ready' | 'error';

export type LoadError = 'schema-invalid' | 'storage-blocked' | 'unknown';

type ProfileStore = {
  profile: Profile | null;
  status: ProfileStoreStatus;
  loadError: LoadError | null;
  setProfile: (profile: Profile | null) => void;
  clearProfile: () => void;
  markReady: () => void;
  setLoadError: (error: LoadError) => void;
};

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  status: 'loading',
  loadError: null,
  setProfile: (profile) => set({ profile, status: 'ready', loadError: null }),
  clearProfile: () => set({ profile: null, status: 'ready', loadError: null }),
  markReady: () => set({ status: 'ready', loadError: null }),
  setLoadError: (error) =>
    set({
      profile: null,
      // storage-blocked is recoverable from the user's perspective —
      // the wizard renders and the banner surfaces the warning. Only
      // schema-invalid and unknown halt the user with a recovery panel.
      status: error === 'storage-blocked' ? 'ready' : 'error',
      loadError: error,
    }),
}));
