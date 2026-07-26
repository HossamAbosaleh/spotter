/**
 * Product-level test that the wizard's three numeric inputs (age,
 * height, bodyweight) correctly canonicalize Arabic-Indic digit
 * input through to RHF state. Closes T042.
 *
 * The unit utilities (parseLocaleNumber, toCanonicalDigits) are
 * already covered by tests/unit/digits.test.ts. This file's
 * unique value is proving the wizard's input components actually
 * call those utilities at the integration point:
 *
 *   <Input value={text} onChange={(e) => {
 *     setText(e.target.value);
 *     field.onChange(parseLocaleNumber(e.target.value) ?? NaN);
 *   }} />
 *
 * If the integration drifted (e.g., a refactor replaced
 * parseLocaleNumber with Number() or parseInt() in one of the
 * three inputs), the schema's z.number() rule would reject the
 * NaN that Number('٢٥') produces, and Next would stay disabled.
 * Successful Next-advance after typing Arabic digits proves the
 * canonicalization works at the wizard layer.
 *
 * Note: age + height/weight are implemented in two separate
 * file-local components (AgeInput in step-identity.tsx,
 * NumericInput in step-body-goal.tsx). Same parseLocaleNumber
 * pattern, separate code paths — three independent tests prevent
 * a refactor from quietly regressing only one of them.
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

// Replicates App.tsx's direction-sync wiring without ProfileGuard.
// Same harness pattern as wizard-rtl-switch.test.tsx.
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

async function clickNext() {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /^التالي$/i }));
  });
}

describe('Wizard numeric inputs accept Arabic-Indic digits', () => {
  beforeEach(async () => {
    localStorage.clear();
    useProfileStore.setState({
      profile: null,
      status: 'ready',
      loadError: null,
    });
    await i18n.changeLanguage('ar');
  });

  afterEach(async () => {
    await i18n.changeLanguage('en');
    vi.restoreAllMocks();
  });

  it('age input (Step 1) accepts Arabic-Indic digits and advances on Next', async () => {
    renderSetup();

    // Step 1 requires identity.{name, age, sex}. Defaults satisfy
    // sex ('prefer-not-to-say'); we provide a name and an Arabic
    // age. age default is 25 (Latin) so we must overwrite it to
    // genuinely test the AR-digit path.
    fireEvent.change(screen.getByLabelText(/الاسم/), {
      target: { value: 'مستخدم اختبار' },
    });
    fireEvent.change(screen.getByLabelText(/العمر/), {
      target: { value: '٢٥' }, // Arabic-Indic 25
    });

    await clickNext();

    // Step 2 indicator renders only if Step 1 validation passed,
    // which means '٢٥' was canonicalized to 25 before z.number()
    // ran. If parsing had failed, the schema rule would have
    // rejected NaN and Next would have stayed on Step 1.
    expect(screen.getByText(/الخطوة 2 من 6/)).toBeInTheDocument();
  });

  it('height input (Step 2) accepts Arabic-Indic digits and advances on Next', async () => {
    renderSetup();

    // Advance Step 1 → Step 2 with Latin defaults + a name.
    fireEvent.change(screen.getByLabelText(/الاسم/), {
      target: { value: 'مستخدم اختبار' },
    });
    await clickNext();
    expect(screen.getByText(/الخطوة 2 من 6/)).toBeInTheDocument();

    // Overwrite height with Arabic digits. Bodyweight stays at
    // the Latin default (75) — keeps the test isolated to the
    // height field's canonicalization.
    //
    // Query by `name` attribute rather than getByLabelText: the
    // NumericInput component wraps <Input> in a <div> to render
    // the unit suffix, so FormControl auto-wires the FormLabel
    // htmlFor to the wrapping div (non-labellable per HTML spec).
    // Production aria semantics still work via FormControl's
    // aria-* attributes; only Testing Library's strict htmlFor
    // lookup is affected.
    const heightInput = document.querySelector(
      'input[name="body.heightCm"]'
    ) as HTMLInputElement;
    fireEvent.change(heightInput, { target: { value: '١٧٥' } }); // 175

    // Step 2 also requires goal (no default). Pick the first
    // available goal radio. Its accessible name is multi-line
    // (label + description) so match by prefix.
    // Match by `تضخّم` (hypertrophy) — distinctive word that
    // doesn't appear in any other goal's description, unlike
    // `القوّة` which leaks across recomposition + fatLoss bodies.
    fireEvent.click(screen.getByRole('radio', { name: /تضخّم/ }));

    await clickNext();

    expect(screen.getByText(/الخطوة 3 من 6/)).toBeInTheDocument();
  });

  it('bodyweight input (Step 2) accepts Arabic-Indic digits and advances on Next', async () => {
    renderSetup();

    fireEvent.change(screen.getByLabelText(/الاسم/), {
      target: { value: 'مستخدم اختبار' },
    });
    await clickNext();
    expect(screen.getByText(/الخطوة 2 من 6/)).toBeInTheDocument();

    // Overwrite bodyweight with Arabic digits. Height stays at
    // the Latin default (170). See height-test for why we query
    // by name attribute rather than getByLabelText.
    const weightInput = document.querySelector(
      'input[name="body.bodyweightKg"]'
    ) as HTMLInputElement;
    fireEvent.change(weightInput, { target: { value: '٧٥' } }); // 75

    // Match by `تضخّم` (hypertrophy) — distinctive word that
    // doesn't appear in any other goal's description, unlike
    // `القوّة` which leaks across recomposition + fatLoss bodies.
    fireEvent.click(screen.getByRole('radio', { name: /تضخّم/ }));

    await clickNext();

    expect(screen.getByText(/الخطوة 3 من 6/)).toBeInTheDocument();
  });
});
