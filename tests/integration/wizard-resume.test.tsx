/**
 * US2 integration tests — resume an interrupted wizard.
 *
 * Exercises the full pipeline end-to-end:
 *   form change → debounce → writeDraft (localStorage) → unmount →
 *   remount → readDraft + readStep → form pre-fills + activeStep
 *   restored.
 *
 * Per the proposal cycle, Test 1 uses a single-input proof rather
 * than fully driving every field across two steps. Per-field
 * validation lives in the unit tests; the integration test's job is
 * to confirm the pipeline holds together end-to-end.
 *
 * Test 3 is the spec-deviation guardrail: T037 deliberately scoped
 * "Start fresh" to localStorage only, leaving the committed Profile
 * in IndexedDB untouched. If this test ever fails, someone has
 * regressed that protection and an edit-mode user's saved profile
 * is at risk of being wiped by a "Start fresh" click.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { Wizard } from '@/components/profile/wizard';
import { useProfileStore } from '@/stores/profile-store';
import { validProfile } from '../fixtures/profile';

function renderWizard() {
  return render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Wizard />
    </MemoryRouter>
  );
}

describe('US2 — wizard resume integration', () => {
  beforeEach(() => {
    localStorage.clear();
    useProfileStore.setState({
      profile: null,
      status: 'ready',
      loadError: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('autosaves form changes, advances step, survives unmount/remount with state intact', async () => {
    vi.useFakeTimers();

    // ── Phase 1: fresh render, type into the name field ──
    const { unmount } = renderWizard();
    expect(screen.getByText(/step 1 of 6/i)).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'Resume Test' } });

    // Debounce fires; autosave writes draft to localStorage.
    await act(async () => {
      vi.advanceTimersByTime(600);
    });
    expect(localStorage.getItem('spotter.wizardDraft')).not.toBeNull();

    // ── Phase 2: advance to step 2 ──
    // NOTE: Step 1 advance depends on defaultProfile() returning
    // valid age (25) and sex ('prefer-not-to-say'). Only name was
    // driven above; age + sex satisfy validation via the form's
    // initial defaults. If those defaults change, this test will
    // fail with a confusing "Next disabled" / "still on step 1"
    // error. Either pin the values explicitly here (fireEvent
    // change on the age input + radio click on a sex option) or
    // update this test if defaultProfile() evolves.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
      // RHF.trigger is async; flush any timers it schedules.
      await vi.runAllTimersAsync();
    });
    expect(screen.getByText(/step 2 of 6/i)).toBeInTheDocument();
    expect(localStorage.getItem('spotter.wizardStep')).toBe('2');

    // ── Phase 3: unmount (simulate tab close) ──
    unmount();

    // localStorage survives unmount (it's not cleared automatically).
    expect(localStorage.getItem('spotter.wizardDraft')).not.toBeNull();
    expect(localStorage.getItem('spotter.wizardStep')).toBe('2');

    // ── Phase 4: remount (simulate tab reopen) ──
    // Switch to real timers so the wizard's mount-time effects
    // (form initialization, useEffect for step persistence) run
    // without timer manipulation getting in the way.
    vi.useRealTimers();
    renderWizard();

    // Wizard resumes at the persisted step, not back at step 1.
    expect(screen.getByText(/step 2 of 6/i)).toBeInTheDocument();
    // Draft is still in localStorage (Finish hasn't fired).
    const restored = localStorage.getItem('spotter.wizardDraft');
    expect(restored).not.toBeNull();
    expect(JSON.parse(restored ?? '{}').identity.name).toBe('Resume Test');
  });

  it('autosaves form changes to localStorage after the 600ms debounce', async () => {
    vi.useFakeTimers();
    renderWizard();

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Debounced' },
    });

    // Before the debounce fires, nothing is written.
    expect(localStorage.getItem('spotter.wizardDraft')).toBeNull();

    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    const draft = localStorage.getItem('spotter.wizardDraft');
    expect(draft).not.toBeNull();
    expect(JSON.parse(draft ?? '{}').identity.name).toBe('Debounced');
    expect(localStorage.getItem('spotter.wizardStep')).toBe('1');
  });

  it('Start fresh clears the draft but preserves the committed profile (spec-deviation guardrail)', async () => {
    // ── Seed an edit-mode session: saved profile in store ──
    // T037 deliberately scoped Start fresh to localStorage only. If
    // this test fails because useProfileStore.profile is null after
    // the confirm, someone has reverted that protection and an
    // edit-mode user's saved profile is being wiped by Start fresh.
    const saved = validProfile();
    useProfileStore.setState({
      profile: saved,
      status: 'ready',
      loadError: null,
    });

    // Pre-seed localStorage at step 2 so the wizard mounts with the
    // Start fresh trigger already visible (it hides on step 1).
    const draftValues = {
      ...saved,
      identity: { ...saved.identity, name: 'Mid Edit' },
    };
    localStorage.setItem('spotter.wizardDraft', JSON.stringify(draftValues));
    localStorage.setItem('spotter.wizardStep', '2');

    renderWizard();
    expect(screen.getByText(/step 2 of 6/i)).toBeInTheDocument();

    // ── Open the dialog ──
    fireEvent.click(screen.getByRole('button', { name: /start fresh/i }));
    expect(
      screen.getByRole('alertdialog', { name: /start fresh\?/i })
    ).toBeInTheDocument();

    // ── Confirm the destructive action ──
    const confirmBtn = document.querySelector(
      '[data-slot="wizard-start-fresh-confirm"]'
    ) as HTMLButtonElement;
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    // ── Assertions ──
    // Wizard routed back to step 1.
    expect(screen.getByText(/step 1 of 6/i)).toBeInTheDocument();

    // Draft cleared. Step is re-written to '1' by the wizard's
    // useEffect-on-activeStep persistence, not left null.
    expect(localStorage.getItem('spotter.wizardDraft')).toBeNull();
    expect(localStorage.getItem('spotter.wizardStep')).toBe('1');

    // ── THE GUARDRAIL ──
    // useProfileStore.profile is unchanged. The user's saved profile
    // in IndexedDB (mirrored here as the store value) survives the
    // Start fresh action untouched. If this line ever fails:
    //   * Check src/components/profile/start-fresh-dialog.tsx
    //   * Make sure it isn't calling profileRepository.clear() or
    //     useProfileStore.clearProfile() — that's the spec deviation
    //     T037 deliberately rejected.
    expect(useProfileStore.getState().profile).toEqual(saved);
  });
});
