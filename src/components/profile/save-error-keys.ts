import type { DomainError } from '@/data/result';

/**
 * Maps a save-time `DomainError` to its toast i18n keys.
 *
 * `schema-invalid` folds into the generic 'unknown' bucket: per-step
 * validation gates make it effectively unreachable, and surfacing a
 * "schema invalid" toast to an end user wouldn't be actionable.
 *
 * Lives in its own module (rather than inside wizard.tsx) so it can
 * be imported by tests without triggering `react-refresh/only-export-
 * components` warnings on the wizard file.
 */

export function saveErrorTitleKey(error: DomainError): string {
  switch (error) {
    case 'storage-quota-exceeded':
      return 'wizard.toast.errors.quotaExceeded.title';
    case 'storage-unavailable':
      return 'wizard.toast.errors.storageBlocked.title';
    case 'schema-invalid':
    case 'unknown':
    default:
      return 'wizard.toast.errors.unknown.title';
  }
}

export function saveErrorDescriptionKey(error: DomainError): string {
  switch (error) {
    case 'storage-quota-exceeded':
      return 'wizard.toast.errors.quotaExceeded.description';
    case 'storage-unavailable':
      return 'wizard.toast.errors.storageBlocked.description';
    case 'schema-invalid':
    case 'unknown':
    default:
      return 'wizard.toast.errors.unknown.description';
  }
}
