/**
 * Tagged-union result type for repository boundaries.
 *
 * Repositories never throw across the UI boundary — they return Result so
 * callers branch on `result.ok` instead of try/catch. See R8 in
 * specs/001-profile-wizard/research.md.
 */
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export type DomainError =
  | 'storage-unavailable'
  | 'storage-quota-exceeded'
  | 'schema-invalid'
  | 'unknown';

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
