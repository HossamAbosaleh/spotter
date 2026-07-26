import { describe, expect, it } from 'vitest';

import {
  saveErrorDescriptionKey,
  saveErrorTitleKey,
} from '@/components/profile/save-error-keys';
import type { DomainError } from '@/data/result';

describe('save-error-keys', () => {
  it.each<[DomainError, string, string]>([
    [
      'storage-quota-exceeded',
      'wizard.toast.errors.quotaExceeded.title',
      'wizard.toast.errors.quotaExceeded.description',
    ],
    [
      'storage-unavailable',
      'wizard.toast.errors.storageBlocked.title',
      'wizard.toast.errors.storageBlocked.description',
    ],
    [
      'unknown',
      'wizard.toast.errors.unknown.title',
      'wizard.toast.errors.unknown.description',
    ],
    // schema-invalid folds into 'unknown' — it's unreachable in practice
    // (per-step validation gates it), and a "schema invalid" toast isn't
    // actionable for an end user.
    [
      'schema-invalid',
      'wizard.toast.errors.unknown.title',
      'wizard.toast.errors.unknown.description',
    ],
  ])('%s maps to its expected toast keys', (error, title, description) => {
    expect(saveErrorTitleKey(error)).toBe(title);
    expect(saveErrorDescriptionKey(error)).toBe(description);
  });
});
