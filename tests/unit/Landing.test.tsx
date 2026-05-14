import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Landing from '@/pages/Landing';
import { defaultProfile } from '@/domain/profile';
import { useProfileStore } from '@/stores/profile-store';

function renderLanding() {
  return render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Landing />
    </MemoryRouter>
  );
}

describe('Landing page', () => {
  beforeEach(() => {
    useProfileStore.setState({
      profile: null,
      status: 'ready',
      loadError: null,
    });
  });

  it('renders the project name', () => {
    renderLanding();
    expect(
      screen.getByRole('heading', { name: /spotter/i })
    ).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    renderLanding();
    expect(
      screen.getByText(/your gym, your data, your ai coach/i)
    ).toBeInTheDocument();
  });

  it('renders the positioning sentence', () => {
    renderLanding();
    expect(
      screen.getByText(/hands your training data to any ai/i)
    ).toBeInTheDocument();
  });

  it('renders "Get started" → /setup when no profile is saved', () => {
    renderLanding();
    const cta = screen.getByRole('link', { name: /get started/i });
    expect(cta).toHaveAttribute('href', '/setup');
    expect(
      screen.queryByRole('link', { name: /open spotter/i })
    ).not.toBeInTheDocument();
  });

  it('renders "Open Spotter" → /profile when a profile is saved', () => {
    useProfileStore.setState({
      profile: defaultProfile(),
      status: 'ready',
      loadError: null,
    });
    renderLanding();
    const cta = screen.getByRole('link', { name: /open spotter/i });
    expect(cta).toHaveAttribute('href', '/profile');
    expect(
      screen.queryByRole('link', { name: /get started/i })
    ).not.toBeInTheDocument();
  });

  it('renders a GitHub link that opens in a new tab', () => {
    renderLanding();
    const github = screen.getByRole('link', { name: /view on github/i });
    expect(github).toHaveAttribute(
      'href',
      'https://github.com/HossamAbosaleh/spotter'
    );
    expect(github).toHaveAttribute('target', '_blank');
    expect(github).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the privacy line', () => {
    renderLanding();
    expect(
      screen.getByText(/your workouts stay on your device/i)
    ).toBeInTheDocument();
  });
});
