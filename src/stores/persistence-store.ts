import { create } from 'zustand';

import type { PersistenceStatus } from '@/data/persistence-availability';

/**
 * Holds the result of `detectPersistence()` plus a flag tracking whether
 * the user has acknowledged the in-memory-mode banner.
 *
 * The acknowledgement flag is mirrored to localStorage so that a banner
 * the user dismissed on a previous private-mode session does not re-appear
 * on every step transition.
 */

const ACK_KEY = 'spotter.persistenceAcknowledged';

function readAcknowledged(): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    return localStorage.getItem(ACK_KEY) === '1';
  } catch {
    return false;
  }
}

function writeAcknowledged(value: boolean): void {
  if (typeof localStorage === 'undefined') return;
  try {
    if (value) {
      localStorage.setItem(ACK_KEY, '1');
    } else {
      localStorage.removeItem(ACK_KEY);
    }
  } catch {
    // localStorage may itself be disabled; degrade silently.
  }
}

type PersistenceStore = {
  status: PersistenceStatus;
  bannerAcknowledged: boolean;
  setStatus: (status: PersistenceStatus) => void;
  acknowledgeBanner: () => void;
};

export const usePersistenceStore = create<PersistenceStore>((set) => ({
  status: { status: 'available' },
  bannerAcknowledged: readAcknowledged(),
  setStatus: (status) => set({ status }),
  acknowledgeBanner: () => {
    writeAcknowledged(true);
    set({ bannerAcknowledged: true });
  },
}));
