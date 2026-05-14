import type { Profile } from '@/domain/profile';
import { err, ok, type Result } from '@/data/result';

/**
 * Wizard draft persistence — localStorage layer.
 *
 * Stores in-progress wizard form values and the active step so a user
 * can close the tab and reopen later with the form exactly where they
 * left it.
 *
 * Lives in localStorage (not IndexedDB) for three reasons:
 *
 * 1. The wizard form is partial by definition — `name: ''` plus several
 *    undefined enum fields. `profileSchema.safeParse` rejects every
 *    partial mid-wizard state, so `profileRepository.save` can't carry
 *    drafts.
 * 2. The profile row at `id: 'me'` is the user's *committed* profile.
 *    Overwriting it with mid-wizard partial data would destroy a saved
 *    profile if the user closed the tab mid-edit.
 * 3. localStorage is synchronous and small — no debounce/concurrency
 *    questions, no Dexie transaction wrapping. Drafts are intrinsically
 *    ephemeral (cleared on Finish or Start Fresh), which matches
 *    localStorage's lifecycle expectations.
 *
 * The committed profile in IndexedDB is untouched until the user clicks
 * Finish (T032 / handleFinish), at which point both draft keys are
 * cleared.
 */

const DRAFT_KEY = 'spotter.wizardDraft';
const STEP_KEY = 'spotter.wizardStep';

export type DraftWriteError =
  | 'storage-quota-exceeded'
  | 'storage-unavailable'
  | 'unknown';

function classifyError(e: unknown): DraftWriteError {
  if (e instanceof DOMException) {
    if (e.name === 'QuotaExceededError') return 'storage-quota-exceeded';
    if (e.name === 'SecurityError') return 'storage-unavailable';
  }
  return 'unknown';
}

/**
 * Reads the persisted wizard draft. Returns `null` if no draft exists
 * OR if the stored value is unparseable — corrupt draft state should
 * degrade to "fresh wizard," never crash the page. The profile schema
 * is intentionally NOT enforced here: the whole point of a draft is
 * that it may be incomplete.
 */
export function readDraft(): Profile | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw == null) return null;
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
}

export function writeDraft(values: Profile): Result<void, DraftWriteError> {
  if (typeof localStorage === 'undefined') {
    return err('storage-unavailable');
  }
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    return ok(undefined);
  } catch (e) {
    return err(classifyError(e));
  }
}

export function clearDraft(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Best-effort. If localStorage refuses removal we can't do anything
    // useful — the draft will linger until the user clears site data,
    // but the wizard's mount-time read will gracefully handle stale
    // drafts overwriting fresh state on the next visit.
  }
}

/**
 * Reads the persisted activeStep. Returns `null` when absent or when
 * the value can't be parsed as a 1..6 integer. Caller defaults to 1
 * on null.
 */
export function readStep(): number | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STEP_KEY);
    if (raw == null) return null;
    const n = Number.parseInt(raw, 10);
    if (!Number.isInteger(n) || n < 1 || n > 6) return null;
    return n;
  } catch {
    return null;
  }
}

export function writeStep(step: number): Result<void, DraftWriteError> {
  if (typeof localStorage === 'undefined') {
    return err('storage-unavailable');
  }
  try {
    localStorage.setItem(STEP_KEY, String(step));
    return ok(undefined);
  } catch (e) {
    return err(classifyError(e));
  }
}

export function clearStep(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(STEP_KEY);
  } catch {
    // See clearDraft.
  }
}
