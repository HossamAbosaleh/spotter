import { describe, it, expect } from 'vitest';
import {
  formatSetsReps,
  formatWeight,
  formatRest,
  formatRPE,
} from '@/lib/format';

describe('formatSetsReps', () => {
  it('uses lowercase × with no spaces', () => {
    expect(formatSetsReps(4, 8)).toBe('4×8');
    expect(formatSetsReps(1, 5)).toBe('1×5');
    expect(formatSetsReps(10, 3)).toBe('10×3');
  });
});

describe('formatWeight', () => {
  it('appends unit with no space', () => {
    expect(formatWeight(80, 'kg')).toBe('80kg');
    expect(formatWeight(175, 'lb')).toBe('175lb');
  });

  it('preserves decimals when given', () => {
    expect(formatWeight(82.5, 'kg')).toBe('82.5kg');
  });
});

describe('formatRest', () => {
  it('returns seconds form below 60', () => {
    expect(formatRest(30)).toBe('30s');
    expect(formatRest(45)).toBe('45s');
    expect(formatRest(59)).toBe('59s');
  });

  it('collapses whole minutes ≥ 60s to Nmin', () => {
    expect(formatRest(60)).toBe('1min');
    expect(formatRest(120)).toBe('2min');
    expect(formatRest(180)).toBe('3min');
  });

  it('keeps partial-minute durations in seconds', () => {
    expect(formatRest(90)).toBe('90s');
    expect(formatRest(150)).toBe('150s');
  });
});

describe('formatRPE', () => {
  it('renders as "RPE N" with integer rounding', () => {
    expect(formatRPE(7)).toBe('RPE 7');
    expect(formatRPE(8.4)).toBe('RPE 8');
    expect(formatRPE(8.6)).toBe('RPE 9');
  });
});
