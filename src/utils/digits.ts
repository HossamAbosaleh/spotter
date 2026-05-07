/**
 * Digit normalization for bilingual numeric input.
 *
 * Spotter accepts Arabic-Indic digits (٠-٩) or Latin digits (0-9) in
 * numeric fields and stores values in a canonical Latin form. See R6 in
 * specs/001-profile-wizard/research.md.
 */

const ARABIC_INDIC_TO_LATIN: Record<string, string> = {
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
  // Arabic decimal separator → standard dot.
  '٫': '.',
  // Arabic thousands separator → strip via parseLocaleNumber.
  '٬': ',',
};

/**
 * Replace any Arabic-Indic digits in `input` with their Latin equivalents.
 * Leaves other characters untouched.
 */
export function toCanonicalDigits(input: string): string {
  let result = '';
  for (const char of input) {
    result += ARABIC_INDIC_TO_LATIN[char] ?? char;
  }
  return result;
}

/**
 * Parse a numeric string that may contain Arabic-Indic digits, locale
 * separators, or surrounding whitespace. Returns `null` for input that
 * does not represent a finite number.
 *
 * Strips thousands separators (`,` and `٬`) and trims whitespace before
 * parsing. The result is always a finite Latin-format number.
 */
export function parseLocaleNumber(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed === '') return null;

  const canonical = toCanonicalDigits(trimmed)
    .replace(/[,٬]/g, '')
    .replace(/\s+/g, '');

  // Reject anything not matching a basic numeric form (optional sign,
  // digits, optional decimal). Avoids exponent notation, hex, etc.
  if (!/^-?\d+(\.\d+)?$/.test(canonical)) {
    return null;
  }

  const value = Number(canonical);
  return Number.isFinite(value) ? value : null;
}
