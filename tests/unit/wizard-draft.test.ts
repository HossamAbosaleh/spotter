import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearDraft,
  clearStep,
  readDraft,
  readStep,
  writeDraft,
  writeStep,
} from '@/data/wizard-draft';
import { defaultProfile } from '@/domain/profile';

describe('wizard-draft (localStorage helpers)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('draft (form values)', () => {
    it('readDraft returns null when no draft is stored', () => {
      expect(readDraft()).toBeNull();
    });

    it('writeDraft + readDraft roundtrip preserves the values', () => {
      const profile = defaultProfile();
      profile.identity.name = 'Hossam';
      profile.body.heightCm = 178;
      const result = writeDraft(profile);
      expect(result.ok).toBe(true);
      const read = readDraft();
      expect(read?.identity.name).toBe('Hossam');
      expect(read?.body.heightCm).toBe(178);
    });

    it('readDraft returns null when stored value is corrupt JSON', () => {
      // Bypass writeDraft to plant a corrupt payload deliberately.
      localStorage.setItem('spotter.wizardDraft', '{not valid json');
      expect(readDraft()).toBeNull();
    });

    it('clearDraft removes the key', () => {
      writeDraft(defaultProfile());
      expect(readDraft()).not.toBeNull();
      clearDraft();
      expect(readDraft()).toBeNull();
    });

    it('writeDraft classifies QuotaExceededError', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('quota', 'QuotaExceededError');
      });
      const result = writeDraft(defaultProfile());
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe('storage-quota-exceeded');
      }
    });
  });

  describe('step (active step number)', () => {
    it('readStep returns null when no step is stored', () => {
      expect(readStep()).toBeNull();
    });

    it('writeStep + readStep roundtrip', () => {
      writeStep(3);
      expect(readStep()).toBe(3);
    });

    it('readStep returns null for out-of-range or non-integer values', () => {
      localStorage.setItem('spotter.wizardStep', '99');
      expect(readStep()).toBeNull();
      localStorage.setItem('spotter.wizardStep', '0');
      expect(readStep()).toBeNull();
      localStorage.setItem('spotter.wizardStep', 'not-a-number');
      expect(readStep()).toBeNull();
    });

    it('clearStep removes the key', () => {
      writeStep(4);
      clearStep();
      expect(readStep()).toBeNull();
    });
  });
});
