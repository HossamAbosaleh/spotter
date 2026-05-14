import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { Wizard } from '@/components/profile/wizard';
import { profileRepository } from '@/data/repositories/profile-repository';
import { err, ok } from '@/data/result';
import { useProfileStore } from '@/stores/profile-store';
import { useToastStore } from '@/stores/toast-store';
import { validProfile } from '../fixtures/profile';

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function renderWizard() {
  return render(
    <MemoryRouter
      initialEntries={['/setup']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/setup" element={<Wizard />} />
        <Route path="/profile" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

async function advanceToReview() {
  // Click Next five times to walk Step 1 → Step 6 (Review). Each click
  // triggers form.trigger() against the step's fields; the seeded
  // profile satisfies every field, so each trigger passes.
  for (let i = 0; i < 5; i++) {
    const next = screen.getByRole('button', { name: /^next$/i });
    fireEvent.click(next);
    // Wait for the step indicator to advance before the next click —
    // RHF.trigger is async, and the click handler is also async.
    await waitFor(() => {
      expect(
        screen.getByText(new RegExp(`step ${i + 2} of 6`, 'i'))
      ).toBeInTheDocument();
    });
  }
}

describe('Wizard save flow', () => {
  beforeEach(() => {
    // Reset localStorage so wizard-draft / wizard-step keys from a
    // prior test (or another suite) don't preload form values or
    // jump-start activeStep before this test's wizard mounts.
    localStorage.clear();
    useToastStore.getState().clear();
    useProfileStore.setState({
      profile: validProfile(),
      status: 'ready',
      loadError: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('navigates to /profile and enqueues the updated toast on save success (edit mode)', async () => {
    const saveSpy = vi
      .spyOn(profileRepository, 'save')
      .mockResolvedValue(ok(undefined));
    vi.spyOn(profileRepository, 'get').mockResolvedValue(ok(validProfile()));

    renderWizard();
    await advanceToReview();

    fireEvent.click(screen.getByRole('button', { name: /save my profile/i }));

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/profile');
    });

    expect(saveSpy).toHaveBeenCalledTimes(1);
    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0]?.variant).toBe('default');
    // Profile was non-null at submit time → "updated" copy.
    expect(toasts[0]?.title).toMatch(/profile updated/i);
  });

  it('enqueues the saved toast and uses create-mode copy when no profile is present at submit', async () => {
    vi.spyOn(profileRepository, 'save').mockResolvedValue(ok(undefined));
    vi.spyOn(profileRepository, 'get').mockResolvedValue(ok(validProfile()));

    renderWizard();
    await advanceToReview();

    // Flip the store to "no saved profile" just before clicking Finish.
    // handleFinish reads useProfileStore.getState().profile synchronously
    // at submit time to decide create-vs-edit toast copy, so this
    // flips the branch without disturbing the form's already-filled
    // state.
    useProfileStore.setState({ profile: null });

    fireEvent.click(screen.getByRole('button', { name: /save my profile/i }));

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/profile');
    });

    const toasts = useToastStore.getState().toasts;
    expect(toasts[0]?.title).toMatch(/profile saved/i);
  });

  it('shows the quotaExceeded toast and stays on /setup when storage is full', async () => {
    vi.spyOn(profileRepository, 'save').mockResolvedValue(
      err('storage-quota-exceeded')
    );

    renderWizard();
    await advanceToReview();

    fireEvent.click(screen.getByRole('button', { name: /save my profile/i }));

    await waitFor(() => {
      expect(useToastStore.getState().toasts).toHaveLength(1);
    });

    const toast = useToastStore.getState().toasts[0];
    expect(toast?.variant).toBe('destructive');
    expect(toast?.title).toMatch(/storage is full/i);
    // No navigation: we remain on /setup. The route element is still
    // <Wizard />, so Step 6 indicator stays visible.
    expect(screen.getByText(/step 6 of 6/i)).toBeInTheDocument();
    expect(screen.queryByTestId('location')).not.toBeInTheDocument();
  });

  it('folds schema-invalid into the unknown toast', async () => {
    vi.spyOn(profileRepository, 'save').mockResolvedValue(
      err('schema-invalid')
    );

    renderWizard();
    await advanceToReview();

    fireEvent.click(screen.getByRole('button', { name: /save my profile/i }));

    await waitFor(() => {
      expect(useToastStore.getState().toasts).toHaveLength(1);
    });

    const toast = useToastStore.getState().toasts[0];
    expect(toast?.variant).toBe('destructive');
    expect(toast?.title).toMatch(/^couldn't save\.$/i);
  });

  it('disables the Back button while a save is in flight', async () => {
    // Hand-controlled promise so we can observe the in-flight state.
    let resolveSave: () => void = () => {};
    vi.spyOn(profileRepository, 'save').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSave = () => resolve(ok(undefined));
        })
    );
    vi.spyOn(profileRepository, 'get').mockResolvedValue(ok(validProfile()));

    renderWizard();
    await advanceToReview();

    fireEvent.click(screen.getByRole('button', { name: /save my profile/i }));

    // Back must become disabled once submission starts.
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back/i })).toBeDisabled();
    });
    // Finish button shows the saving label.
    expect(screen.getByText(/saving/i)).toBeInTheDocument();

    // Resolve the save so React's act() warnings stay quiet.
    resolveSave();
    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/profile');
    });
  });
});
