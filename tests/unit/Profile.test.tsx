import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import Profile from '@/pages/Profile';
import { type Profile as ProfileT } from '@/domain/profile';
import { profileRepository } from '@/data/repositories/profile-repository';
import { ok } from '@/data/result';
import { useProfileStore } from '@/stores/profile-store';
import { useToastStore } from '@/stores/toast-store';

function validProfile(): ProfileT {
  const now = new Date().toISOString();
  return {
    id: 'me',
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,
    identity: { name: 'Hossam', age: 28, sex: 'male' },
    body: { heightCm: 178, bodyweightKg: 75 },
    goal: 'hypertrophy',
    experience: { level: 'intermediate' },
    schedule: { preferredDays: ['mon', 'wed', 'fri'] },
    equipment: { access: 'commercial-gym' },
    language: { preferred: 'en', units: 'metric' },
    coachPersonality: 'direct',
  };
}

function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location">
      {location.pathname}
      {location.search}
    </div>
  );
}

function renderProfile() {
  return render(
    <MemoryRouter
      initialEntries={['/profile']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/setup" element={<LocationProbe />} />
        <Route path="/" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Profile page', () => {
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

  it('renders all 5 section rows when a profile is in the store', () => {
    useProfileStore.setState({ profile: validProfile() });
    renderProfile();

    expect(
      screen.getByRole('heading', { name: /your profile/i, level: 1 })
    ).toBeInTheDocument();
    // Each section's title comes through wizard.review.sections.*.
    expect(screen.getByText(/about you/i)).toBeInTheDocument();
    expect(screen.getByText(/body & goal/i)).toBeInTheDocument();
    expect(screen.getByText(/how you train/i)).toBeInTheDocument();
    expect(screen.getByText(/equipment & limitations/i)).toBeInTheDocument();
    expect(screen.getByText(/how spotter talks to you/i)).toBeInTheDocument();
  });

  it('renders empty state with Get started CTA when profile is null', () => {
    renderProfile();
    expect(screen.getByText(/no profile yet/i)).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: /get started/i });
    expect(cta).toHaveAttribute('href', '/setup');
    // Empty-state path should NOT render the populated headline.
    expect(
      screen.queryByRole('heading', { name: /^your profile$/i, level: 1 })
    ).not.toBeInTheDocument();
  });

  it('Edit profile CTA links to /setup with no step query param', () => {
    useProfileStore.setState({ profile: validProfile() });
    renderProfile();
    const editCta = screen.getByRole('link', { name: /edit profile/i });
    expect(editCta).toHaveAttribute('href', '/setup');
  });

  it('each section row links to /setup?step=N for its section', () => {
    useProfileStore.setState({ profile: validProfile() });
    renderProfile();

    const expectations: Array<[RegExp, string]> = [
      [/edit about you/i, '/setup?step=1'],
      [/edit body & goal/i, '/setup?step=2'],
      [/edit how you train/i, '/setup?step=3'],
      [/edit equipment & limitations/i, '/setup?step=4'],
      [/edit how spotter talks to you/i, '/setup?step=5'],
    ];

    for (const [labelPattern, expectedHref] of expectations) {
      const link = screen.getByRole('link', { name: labelPattern });
      expect(link).toHaveAttribute('href', expectedHref);
    }
  });

  it('Start fresh trigger opens the delete dialog', () => {
    useProfileStore.setState({ profile: validProfile() });
    renderProfile();

    fireEvent.click(screen.getByRole('button', { name: /start fresh/i }));
    expect(
      screen.getByRole('alertdialog', { name: /delete your profile\?/i })
    ).toBeInTheDocument();
  });

  it('delete confirm button stays disabled until the checkbox is checked', () => {
    useProfileStore.setState({ profile: validProfile() });
    renderProfile();

    fireEvent.click(screen.getByRole('button', { name: /start fresh/i }));

    const confirmBtn = document.querySelector(
      '[data-slot="profile-delete-confirm"]'
    ) as HTMLButtonElement;
    expect(confirmBtn).toBeDisabled();

    // Check the acknowledgement.
    fireEvent.click(screen.getByRole('checkbox'));
    expect(confirmBtn).not.toBeDisabled();
  });

  it('on confirm: clears repository, localStorage, store, fires toast, navigates to /', async () => {
    // Seed everything that delete should wipe.
    useProfileStore.setState({ profile: validProfile() });
    localStorage.setItem('spotter.wizardDraft', '{"some":"draft"}');
    localStorage.setItem('spotter.wizardStep', '3');
    const clearSpy = vi
      .spyOn(profileRepository, 'clear')
      .mockResolvedValue(ok(undefined));

    renderProfile();

    fireEvent.click(screen.getByRole('button', { name: /start fresh/i }));
    fireEvent.click(screen.getByRole('checkbox'));

    const confirmBtn = document.querySelector(
      '[data-slot="profile-delete-confirm"]'
    ) as HTMLButtonElement;

    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    // Repository clear was called.
    expect(clearSpy).toHaveBeenCalledTimes(1);
    // localStorage cleared.
    expect(localStorage.getItem('spotter.wizardDraft')).toBeNull();
    expect(localStorage.getItem('spotter.wizardStep')).toBeNull();
    // Store cleared.
    expect(useProfileStore.getState().profile).toBeNull();
    // Toast enqueued.
    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0]?.title).toMatch(/profile deleted/i);
    // Navigation happened.
    expect(screen.getByTestId('location')).toHaveTextContent('/');
  });

  it('checkbox state resets when the dialog is reopened after cancel', () => {
    useProfileStore.setState({ profile: validProfile() });
    renderProfile();

    // Open, check, cancel.
    fireEvent.click(screen.getByRole('button', { name: /start fresh/i }));
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    // Reopen.
    fireEvent.click(screen.getByRole('button', { name: /start fresh/i }));

    // Confirm should be disabled again because the checkbox reset.
    const confirmBtn = document.querySelector(
      '[data-slot="profile-delete-confirm"]'
    ) as HTMLButtonElement;
    expect(confirmBtn).toBeDisabled();
    expect(
      (screen.getByRole('checkbox') as HTMLInputElement).getAttribute(
        'aria-checked'
      )
    ).toBe('false');
  });
});
