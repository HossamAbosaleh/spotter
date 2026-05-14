/**
 * US3 integration test — mid-wizard language switch preservation.
 *
 * Exercises US3 acceptance scenario 1: a user starts the wizard in
 * EN, types form data, switches to AR. The page re-renders in
 * Arabic with RTL direction; every entered value survives the
 * switch; activeStep position is preserved.
 *
 * The preservation works by construction:
 *   - RHF form state is decoupled from i18n. Field values live in
 *     the form's internal state, not in translation lookups.
 *   - `i18n.changeLanguage` triggers re-render via the React-i18next
 *     subscription, but does NOT unmount step components — so
 *     RHF state survives intact.
 *
 * This test locks the construction in place. If a future refactor
 * silently introduced a re-mount path (e.g., reading defaultValues
 * in a way that recomputed on locale change), the assertions here
 * would catch it.
 *
 * Test composes a TestApp wrapper that mirrors App.tsx's direction
 * sync (useDirection hook + Direction.DirectionProvider) without
 * pulling in ProfileGuard (which would force a profileRepository.get
 * round-trip we don't care about for this test). Setup is the page
 * route element — same surface a real user lands on.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Direction } from 'radix-ui';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';

import Setup from '@/pages/Setup';
import i18n from '@/i18n';
import { useDirection } from '@/i18n/useDirection';
import { useProfileStore } from '@/stores/profile-store';

/**
 * Test harness that reproduces App.tsx's direction-sync wiring:
 *   - calls `useDirection` so <html dir> + <html lang> track i18n
 *   - wraps children in Radix's DirectionProvider with a reactive
 *     `dir` prop, so any Radix primitive inside Setup honors the
 *     active locale
 *
 * Deliberately omits ProfileGuard — these tests don't need to
 * exercise the bootstrap path, and ProfileGuard's loading
 * skeleton would just delay rendering for no signal.
 */
function TestApp({ children }: { children: ReactNode }) {
  useDirection();
  const { i18n } = useTranslation();
  const dir = i18n.language?.startsWith('ar') ? 'rtl' : 'ltr';
  return (
    <Direction.DirectionProvider dir={dir}>
      {children}
    </Direction.DirectionProvider>
  );
}

function renderSetup() {
  return render(
    <TestApp>
      <MemoryRouter
        initialEntries={['/setup']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Setup />
      </MemoryRouter>
    </TestApp>
  );
}

describe('US3 — wizard language switch integration', () => {
  beforeEach(async () => {
    localStorage.clear();
    useProfileStore.setState({
      profile: null,
      status: 'ready',
      loadError: null,
    });
    // Pin starting language so this suite is order-independent.
    // i18n.language persists module-globally across test files.
    await i18n.changeLanguage('en');
  });

  afterEach(async () => {
    // Restore so other suites start in a known state.
    await i18n.changeLanguage('en');
    vi.restoreAllMocks();
  });

  it('preserves form state when switching from EN to AR mid-wizard', async () => {
    renderSetup();

    // Starting state: EN, LTR.
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');

    // Type into the name input (matched by its EN label).
    const nameInputEn = screen.getByLabelText(/name/i) as HTMLInputElement;
    fireEvent.change(nameInputEn, { target: { value: 'Test User' } });
    expect(nameInputEn.value).toBe('Test User');

    // Switch to Arabic. changeLanguage is async; act() flushes the
    // subscription-driven re-renders that follow.
    await act(async () => {
      await i18n.changeLanguage('ar');
    });

    // <html> attributes flipped.
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');

    // Re-find the input by its AR label — proves the form re-rendered
    // in Arabic AND that the input retains its prior value.
    const nameInputAr = screen.getByLabelText(/الاسم/) as HTMLInputElement;
    expect(nameInputAr.value).toBe('Test User');
  });

  it('reverts dir + lang and re-renders EN labels when switching back', async () => {
    renderSetup();

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Cycle Test' } });

    // EN → AR
    await act(async () => {
      await i18n.changeLanguage('ar');
    });
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');
    expect((screen.getByLabelText(/الاسم/) as HTMLInputElement).value).toBe(
      'Cycle Test'
    );

    // AR → EN
    await act(async () => {
      await i18n.changeLanguage('en');
    });
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('en');
    expect((screen.getByLabelText(/name/i) as HTMLInputElement).value).toBe(
      'Cycle Test'
    );
  });

  it('preserves activeStep across language switch', async () => {
    renderSetup();

    // Fill Step 1's name so validation passes. age + sex are
    // satisfied by defaultProfile()'s defaults (25 +
    // 'prefer-not-to-say'), so Next can advance.
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Step Test' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    });
    expect(screen.getByText(/step 2 of 6/i)).toBeInTheDocument();

    await act(async () => {
      await i18n.changeLanguage('ar');
    });

    // Step indicator now renders the AR template "الخطوة 2 من 6"
    // — proving the wizard didn't reset to step 1 on language change.
    expect(screen.getByText(/الخطوة 2 من 6/)).toBeInTheDocument();
  });
});
