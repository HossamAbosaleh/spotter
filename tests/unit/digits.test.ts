import { describe, expect, it } from 'vitest';

import { parseLocaleNumber, toCanonicalDigits } from '@/utils/digits';

describe('toCanonicalDigits', () => {
  it('passes Latin digits through unchanged', () => {
    expect(toCanonicalDigits('80.5')).toBe('80.5');
  });

  it('converts Arabic-Indic digits to Latin', () => {
    expect(toCanonicalDigits('٨٠')).toBe('80');
    expect(toCanonicalDigits('٧٨٫٥')).toBe('78.5');
  });

  it('handles mixed input', () => {
    expect(toCanonicalDigits('1٢3')).toBe('123');
  });

  it('preserves non-digit characters', () => {
    expect(toCanonicalDigits('age: ٢٥')).toBe('age: 25');
  });
});

describe('parseLocaleNumber', () => {
  it('parses Latin integers', () => {
    expect(parseLocaleNumber('25')).toBe(25);
  });

  it('parses Latin decimals', () => {
    expect(parseLocaleNumber('80.5')).toBe(80.5);
  });

  it('parses Arabic-Indic numbers with Arabic decimal separator', () => {
    expect(parseLocaleNumber('٧٨٫٥')).toBe(78.5);
  });

  it('strips thousands separators', () => {
    expect(parseLocaleNumber('1,234.5')).toBe(1234.5);
    expect(parseLocaleNumber('١٬٢٣٤')).toBe(1234);
  });

  it('strips surrounding whitespace', () => {
    expect(parseLocaleNumber('  42  ')).toBe(42);
  });

  it('returns null for empty input', () => {
    expect(parseLocaleNumber('')).toBeNull();
    expect(parseLocaleNumber('   ')).toBeNull();
  });

  it('returns null for non-numeric input', () => {
    expect(parseLocaleNumber('abc')).toBeNull();
    expect(parseLocaleNumber('80kg')).toBeNull();
    expect(parseLocaleNumber('1e5')).toBeNull();
  });

  it('returns null for malformed numbers', () => {
    expect(parseLocaleNumber('1.2.3')).toBeNull();
    expect(parseLocaleNumber('--5')).toBeNull();
  });

  it('handles negative numbers', () => {
    expect(parseLocaleNumber('-5')).toBe(-5);
  });
});
