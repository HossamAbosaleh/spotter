import { create } from 'zustand';

import type { Profile } from '@/domain/profile';

/**
 * The single source of truth for the current Profile across the UI.
 *
 * `<ProfileGuard>` calls `profileRepository.get()` once on mount and
 * publishes the result here. Every component reads from this store, never
 * directly from the repository. See R9 in
 * specs/001-profile-wizard/research.md.
 */

export type ProfileStoreStatus = 'loading' | 'ready';

type ProfileStore = {
  profile: Profile | null;
  status: ProfileStoreStatus;
  setProfile: (profile: Profile | null) => void;
  clearProfile: () => void;
  markReady: () => void;
};

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  status: 'loading',
  setProfile: (profile) => set({ profile, status: 'ready' }),
  clearProfile: () => set({ profile: null, status: 'ready' }),
  markReady: () => set({ status: 'ready' }),
}));
