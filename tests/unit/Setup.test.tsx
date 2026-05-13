import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Setup from '@/pages/Setup';
import { defaultProfile } from '@/domain/profile';
import { useProfileStore } from '@/stores/profile-store';
import { usePersistenceStore } from '@/stores/persistence-store';

function renderSetup() {
  return render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Setup />
    </MemoryRouter>
  );
}

describe('Setup page', () => {
  beforeEach(() => {
    // Reset stores to a clean ready state for every test.
    useProfileStore.setState({
      profile: null,
      status: 'ready',
      loadError: null,
    });
    usePersistenceStore.setState({
      status: { status: 'available' },
      bannerAcknowledged: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the wizard with the default title when profile is null', () => {
    renderSetup();
    expect(
      screen.getByRole('heading', { name: /set up your profile/i, level: 1 })
    ).toBeInTheDocument();
    // Wizard surface is mounted (step label is unique to the wizard shell).
    expect(screen.getByText(/step 1 of 6/i)).toBeInTheDocument();
  });

  it('renders the wizard with the edit-mode title when a profile is saved', () => {
    useProfileStore.setState({
      profile: defaultProfile(),
      status: 'ready',
      loadError: null,
    });
    renderSetup();
    expect(
      screen.getByRole('heading', { name: /update your profile/i, level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByText(/step 1 of 6/i)).toBeInTheDocument();
  });

  it('renders the corrupt-profile recovery panel when loadError is schema-invalid', () => {
    useProfileStore.setState({
      profile: null,
      status: 'error',
      loadError: 'schema-invalid',
    });
    renderSetup();
    expect(
      screen.getByText(/your profile data couldn't be read/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /start fresh/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /try again/i })
    ).toBeInTheDocument();
    // Wizard is NOT mounted in this branch.
    expect(screen.queryByText(/step 1 of 6/i)).not.toBeInTheDocument();
  });

  it('renders the unknown-error recovery panel when loadError is unknown', () => {
    useProfileStore.setState({
      profile: null,
      status: 'error',
      loadError: 'unknown',
    });
    renderSetup();
    expect(
      screen.getByText(/we couldn't read your profile/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /try again/i })
    ).toBeInTheDocument();
    // No Start fresh CTA — we don't know the profile's state.
    expect(
      screen.queryByRole('button', { name: /start fresh/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/step 1 of 6/i)).not.toBeInTheDocument();
  });

  it('renders the wizard (not a recovery panel) when storage is blocked', () => {
    // Path-B payoff: storage-blocked is a ready state with a warning
    // surfaced by the PersistenceBanner inside the wizard, not a halt.
    useProfileStore.setState({
      profile: null,
      status: 'ready',
      loadError: 'storage-blocked',
    });
    usePersistenceStore.setState({
      status: { status: 'degraded', reason: 'private-mode' },
      bannerAcknowledged: false,
    });
    renderSetup();
    expect(screen.getByText(/step 1 of 6/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/your profile data couldn't be read/i)
    ).not.toBeInTheDocument();
  });
});
