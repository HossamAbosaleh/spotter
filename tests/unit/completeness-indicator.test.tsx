import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { CompletenessIndicator } from '@/components/profile/completeness-indicator';
import { useProfileStore } from '@/stores/profile-store';

import { validProfile } from '../fixtures/profile';

/**
 * Coverage for the T045 visual states.
 *
 * The percent math itself lives in `profileCompleteness()` and is
 * covered by domain tests — these assertions exercise what the
 * component renders for each completeness fraction (and the null
 * paths). Missing-field labels are sampled to confirm the i18n key
 * lookup wires through correctly.
 *
 * Note: `validProfile()` returns a baseline with `preferredDays`
 * filled but all three optional fields missing → 75% rounded. We
 * mutate copies of that baseline to hit the other thresholds.
 */
function setProfile(modify: (p: ReturnType<typeof validProfile>) => void) {
  const profile = validProfile();
  modify(profile);
  useProfileStore.setState({ profile, status: 'ready', loadError: null });
}

describe('CompletenessIndicator', () => {
  beforeEach(() => {
    useProfileStore.setState({
      profile: null,
      status: 'ready',
      loadError: null,
    });
  });

  it('returns null when no profile is loaded', () => {
    const { container } = render(<CompletenessIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null at 100% completion', () => {
    setProfile((p) => {
      p.equipment.notes = 'Half rack only.';
      p.injuries = 'Right shoulder.';
      p.additionalContext = 'Morning sessions.';
    });
    const { container } = render(<CompletenessIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it('renders 25% when only optional fields are missing', () => {
    // baseline: 1 recommended filled, 3 optional missing → 1/4 filled → 25%
    setProfile(() => {});
    render(<CompletenessIndicator />);
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('Equipment notes')).toBeInTheDocument();
    expect(screen.getByText('Injuries')).toBeInTheDocument();
    expect(screen.getByText('Additional context')).toBeInTheDocument();
    // preferredDays filled → not listed
    expect(screen.queryByText('Schedule')).not.toBeInTheDocument();
  });

  it('renders 50% when half the fields are missing', () => {
    setProfile((p) => {
      p.equipment.notes = 'Pulley + bench only.';
      // injuries + additionalContext stay missing; preferredDays filled
    });
    render(<CompletenessIndicator />);
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Injuries')).toBeInTheDocument();
    expect(screen.getByText('Additional context')).toBeInTheDocument();
    expect(screen.queryByText('Equipment notes')).not.toBeInTheDocument();
  });

  it('lists the schedule label when preferredDays is empty', () => {
    setProfile((p) => {
      p.schedule.preferredDays = [];
      p.equipment.notes = 'Notes.';
      p.injuries = 'Injuries.';
      p.additionalContext = 'Context.';
    });
    render(<CompletenessIndicator />);
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('Schedule')).toBeInTheDocument();
  });

  it('exposes the percent to assistive tech via the Progress aria-label', () => {
    setProfile(() => {});
    render(<CompletenessIndicator />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute(
      'aria-label',
      expect.stringContaining('25%')
    );
    expect(progressbar).toHaveAttribute('aria-valuenow', '25');
  });
});
