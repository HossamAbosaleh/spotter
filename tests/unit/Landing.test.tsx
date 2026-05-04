import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Landing from '@/pages/Landing';

describe('Landing page', () => {
  it('renders the project name', () => {
    render(
      <MemoryRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Landing />
      </MemoryRouter>
    );
    expect(
      screen.getByRole('heading', { name: /spotter/i })
    ).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    render(
      <MemoryRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Landing />
      </MemoryRouter>
    );
    expect(
      screen.getByText(/your gym, your data, your ai coach/i)
    ).toBeInTheDocument();
  });
});
