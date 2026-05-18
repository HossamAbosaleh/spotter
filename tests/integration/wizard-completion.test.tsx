/**
 * US1 + US4 integration tests — first-time profile setup that
 * survives reload, plus the US4 skip-optionals contract.
 *
 * Covers the US1 acceptance scenarios + US4's skip-optionals
 * acceptance end-to-end via the actual page route elements
 * (/setup → <Setup>, /profile → <Profile>), not the wizard
 * component in isolation. This is the regression catch for the
 * full pipeline:
 *
 *   Setup page mounts Wizard → form.handleSubmit fires → repo.save
 *   succeeds → setProfile + clearDraft + clearStep + success toast
 *   + navigate('/profile') → Profile page renders the saved state
 *   with section summaries + edit affordances.
 *
 * Per the proposal cycle, Test 1 absorbs the original Test 4 (a
 * standalone "Profile renders sections" check) — Test 1's post-save
 * /profile render coverage makes Test 4 redundant against
 * Profile.test.tsx's existing render coverage.
 *
 * Test 1 also pre-seeds a valid draft into localStorage rather than
 * driving every required field across all six steps. The unit tests
 * (wizard-save.test.tsx) cover field-driving in detail; this file's
 * unique value is the routing + persistence pipeline. Driving every
 * radio click to satisfy the schema (goal / experience.level /
 * equipment.access are all required) would add 40+ LOC of DOM
 * choreography and duplicate that coverage.
 *
 * The two US4 tests at the bottom reuse the same draft-seed pattern
 * but exercise the partial-profile path: validProfile() already
 * omits the three optional fields, so walking Next five times
 * without touching them is exactly the skip-optionals scenario.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import Profile from '@/pages/Profile';
import Setup from '@/pages/Setup';
import { profileRepository } from '@/data/repositories/profile-repository';
import { ok } from '@/data/result';
import { profileCompleteness } from '@/domain/profile';
import { useProfileStore } from '@/stores/profile-store';
import { useToastStore } from '@/stores/toast-store';
import { validProfile } from '../fixtures/profile';

function renderRoutes(initialEntry = '/setup') {
  return render(
    <MemoryRouter
      initialEntries={[initialEntry]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/setup" element={<Setup />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </MemoryRouter>
  );
}

async function clickNext() {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
  });
}

describe('US1 + US4 — wizard completion integration', () => {
  beforeEach(() => {
    localStorage.clear();
    useToastStore.getState().clear();
    useProfileStore.setState({
      profile: null,
      status: 'ready',
      loadError: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('first-time completion: wizard → save → /profile renders the saved state', async () => {
    // Pre-seed a valid draft so each step's form.trigger() passes
    // on Next. Empty store + valid draft = "create-mode" branch in
    // handleFinish (profile === null at submit time → "Profile
    // saved." copy).
    const draft = validProfile();
    localStorage.setItem('spotter.wizardDraft', JSON.stringify(draft));

    const saveSpy = vi
      .spyOn(profileRepository, 'save')
      .mockResolvedValue(ok(undefined));
    vi.spyOn(profileRepository, 'get').mockResolvedValue(ok(draft));

    renderRoutes('/setup');

    // The Setup wrapper shows "Set up your profile" (create-mode
    // title) because profile is still null at this point.
    expect(
      screen.getByRole('heading', { name: /set up your profile/i, level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByText(/step 1 of 6/i)).toBeInTheDocument();

    // Walk Step 1 → Step 6.
    for (let i = 0; i < 5; i++) {
      await clickNext();
      await waitFor(() => {
        expect(
          screen.getByText(new RegExp(`step ${i + 2} of 6`, 'i'))
        ).toBeInTheDocument();
      });
    }

    // Save.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save my profile/i }));
    });

    // Wait for navigation to /profile (the Profile page renders its
    // populated headline once the route element swaps in).
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /^your profile$/i, level: 1 })
      ).toBeInTheDocument();
    });

    // Pipeline assertions.
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(useProfileStore.getState().profile).not.toBeNull();
    // Wizard cleared the draft + step on successful Finish.
    expect(localStorage.getItem('spotter.wizardDraft')).toBeNull();
    expect(localStorage.getItem('spotter.wizardStep')).toBeNull();

    // Create-mode toast copy.
    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0]?.title).toMatch(/profile saved/i);

    // /profile renders the post-completion state: section headers
    // + edit/start-fresh footer (Test 4 absorbed here).
    expect(screen.getByText(/about you/i)).toBeInTheDocument();
    expect(screen.getByText(/body & goal/i)).toBeInTheDocument();
    expect(screen.getByText(/how spotter talks to you/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /edit profile/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /start fresh/i })
    ).toBeInTheDocument();
  });

  it('return after completion: wizard opens in edit mode with values pre-filled', () => {
    useProfileStore.setState({
      profile: validProfile(),
      status: 'ready',
      loadError: null,
    });
    // No localStorage draft — pure edit-mode entry, not a resume.
    renderRoutes('/setup');

    // Edit-mode title from T030 (Setup branches on profile presence).
    expect(
      screen.getByRole('heading', { name: /update your profile/i, level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByText(/step 1 of 6/i)).toBeInTheDocument();

    // Step 1 name input pre-fills from useProfileStore.profile via
    // useProfileForm's defaultValues priority chain (draft → store
    // → defaultProfile).
    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    expect(nameInput.value).toBe(validProfile().identity.name);
  });

  it('deep-link edit: change a field via ?step=N → save → updated value persists', async () => {
    const saved = validProfile();
    expect(saved.goal).toBe('strength');
    useProfileStore.setState({
      profile: saved,
      status: 'ready',
      loadError: null,
    });

    // After-save fetch returns the mutated profile.
    const expectedAfter = { ...saved, goal: 'hypertrophy' as const };
    const saveSpy = vi
      .spyOn(profileRepository, 'save')
      .mockResolvedValue(ok(undefined));
    vi.spyOn(profileRepository, 'get').mockResolvedValue(ok(expectedAfter));

    // Deep-link entry from Profile's section pencil.
    renderRoutes('/setup?step=2');

    expect(screen.getByText(/step 2 of 6/i)).toBeInTheDocument();

    // Change the goal radio. Each option's wrapping <label> ties
    // the input to its localized title; the radio's accessible
    // name is the full label content (title + description), so
    // we match by prefix rather than exact.
    fireEvent.click(screen.getByRole('radio', { name: /hypertrophy/i }));

    // Walk Step 2 → Step 6.
    for (let i = 0; i < 4; i++) {
      await clickNext();
      await waitFor(() => {
        expect(
          screen.getByText(new RegExp(`step ${i + 3} of 6`, 'i'))
        ).toBeInTheDocument();
      });
    }

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save my profile/i }));
    });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /^your profile$/i, level: 1 })
      ).toBeInTheDocument();
    });

    // Pipeline assertions.
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy.mock.calls[0]?.[0]?.goal).toBe('hypertrophy');
    expect(useProfileStore.getState().profile?.goal).toBe('hypertrophy');

    // Edit-mode toast copy (profile was non-null at submit time).
    const toasts = useToastStore.getState().toasts;
    expect(toasts[0]?.title).toMatch(/profile updated/i);
  });

  it('US4: wizard saves successfully with all optional fields skipped', async () => {
    // validProfile() omits equipment.notes, injuries, and
    // additionalContext — exactly the skip-optionals shape. Pre-seed
    // as a draft, walk Next five times without touching the optional
    // inputs, and Save. The wizard must accept the partial profile.
    const draft = validProfile();
    localStorage.setItem('spotter.wizardDraft', JSON.stringify(draft));

    const saveSpy = vi
      .spyOn(profileRepository, 'save')
      .mockResolvedValue(ok(undefined));
    vi.spyOn(profileRepository, 'get').mockResolvedValue(ok(draft));

    renderRoutes('/setup');

    for (let i = 0; i < 5; i++) {
      await clickNext();
      await waitFor(() => {
        expect(
          screen.getByText(new RegExp(`step ${i + 2} of 6`, 'i'))
        ).toBeInTheDocument();
      });
    }
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save my profile/i }));
    });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /^your profile$/i, level: 1 })
      ).toBeInTheDocument();
    });

    expect(saveSpy).toHaveBeenCalledTimes(1);

    // Don't assert raw field equality — equipment.notes / injuries /
    // additionalContext may persist as undefined OR '' depending on
    // RHF binding details. profileCompleteness treats both as
    // unfilled, so the contract that matters is the completeness
    // verdict, not the literal field value.
    const submitted = saveSpy.mock.calls[0]?.[0];
    expect(submitted).toBeDefined();
    if (!submitted) return;
    const { percent, optionalMissing } = profileCompleteness(submitted);
    expect(percent).toBeLessThan(100);
    expect(optionalMissing).toEqual(
      expect.arrayContaining([
        'equipmentNotes',
        'injuries',
        'additionalContext',
      ])
    );
  });

  it('US4: post-save toast + completeness indicator surface when optionals are empty', async () => {
    // Same drive as the previous test. This one asserts the
    // user-facing wiring: the toast picks up the incompleteHint
    // description (T046) and the indicator mounts on /profile with
    // its title + dismiss button (T045 + T047).
    //
    // Catches regressions where any single layer (isIncomplete
    // computation, Profile.tsx mount, indicator render) could break
    // independently while its unit tests still pass.
    const draft = validProfile();
    localStorage.setItem('spotter.wizardDraft', JSON.stringify(draft));

    vi.spyOn(profileRepository, 'save').mockResolvedValue(ok(undefined));
    vi.spyOn(profileRepository, 'get').mockResolvedValue(ok(draft));

    renderRoutes('/setup');

    for (let i = 0; i < 5; i++) {
      await clickNext();
      await waitFor(() => {
        expect(
          screen.getByText(new RegExp(`step ${i + 2} of 6`, 'i'))
        ).toBeInTheDocument();
      });
    }
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save my profile/i }));
    });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /^your profile$/i, level: 1 })
      ).toBeInTheDocument();
    });

    const toast = useToastStore.getState().toasts[0];
    expect(toast?.description).toMatch(
      /optional details can be added on your profile page/i
    );
    expect(screen.getByText(/profile completeness/i)).toBeInTheDocument();
    // Got it button proves the indicator's full render path fired,
    // not just the title — locks T047's dismiss affordance against
    // future drift.
    expect(screen.getByRole('button', { name: /got it/i })).toBeInTheDocument();
  });
});
