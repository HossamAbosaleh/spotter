import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { Wizard } from '@/components/profile/wizard';
import { defaultProfile } from '@/domain/profile';
import { useProfileStore } from '@/stores/profile-store';

function renderWizard() {
  return render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Wizard />
    </MemoryRouter>
  );
}

function seedDraftAtStep2() {
  const seed = defaultProfile();
  seed.identity.name = 'Resume Me';
  seed.identity.age = 29;
  seed.identity.sex = 'male';
  localStorage.setItem('spotter.wizardDraft', JSON.stringify(seed));
  localStorage.setItem('spotter.wizardStep', '2');
}

describe('Wizard Start Fresh', () => {
  beforeEach(() => {
    localStorage.clear();
    useProfileStore.setState({
      profile: null,
      status: 'ready',
      loadError: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('hides the Start fresh trigger on step 1', () => {
    renderWizard();
    expect(screen.getByText(/step 1 of 6/i)).toBeInTheDocument();
    // The trigger button uses data-slot wizard-start-fresh-trigger;
    // matching on the visible label is more user-facing.
    expect(
      screen.queryByRole('button', { name: /start fresh/i })
    ).not.toBeInTheDocument();
  });

  it('shows the Start fresh trigger from step 2 onward', () => {
    seedDraftAtStep2();
    renderWizard();
    expect(screen.getByText(/step 2 of 6/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /start fresh/i })
    ).toBeInTheDocument();
  });

  it('on confirm: clears localStorage, routes to step 1', async () => {
    seedDraftAtStep2();
    renderWizard();

    // Open the dialog.
    fireEvent.click(screen.getByRole('button', { name: /start fresh/i }));

    // Dialog title is rendered now — Radix renders alert dialogs in a
    // portal, but Testing Library's render scopes the portal under
    // document.body so screen.* still finds it.
    expect(
      screen.getByRole('alertdialog', { name: /start fresh\?/i })
    ).toBeInTheDocument();

    // Confirm — two buttons match /start fresh/, so target the
    // destructive confirm via its data-slot.
    const confirmBtn = document.querySelector(
      '[data-slot="wizard-start-fresh-confirm"]'
    ) as HTMLButtonElement;
    expect(confirmBtn).not.toBeNull();
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    // localStorage cleared.
    expect(localStorage.getItem('spotter.wizardDraft')).toBeNull();
    expect(localStorage.getItem('spotter.wizardStep')).toBe('1');

    // Wizard back at step 1 (and the Start fresh trigger hides again).
    expect(screen.getByText(/step 1 of 6/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /start fresh/i })
    ).not.toBeInTheDocument();
  });

  it('on cancel: leaves draft + step + form values untouched', async () => {
    seedDraftAtStep2();
    renderWizard();

    fireEvent.click(screen.getByRole('button', { name: /start fresh/i }));

    // Cancel button label (matches the new wizard.shell.startFresh.cancel key).
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    });

    // localStorage preserved.
    const draft = localStorage.getItem('spotter.wizardDraft');
    expect(draft).not.toBeNull();
    expect(JSON.parse(draft ?? '{}').identity.name).toBe('Resume Me');
    expect(localStorage.getItem('spotter.wizardStep')).toBe('2');

    // Still at step 2.
    expect(screen.getByText(/step 2 of 6/i)).toBeInTheDocument();
  });
});
