import { describe, expect, it } from 'vitest';

import ar from '@/i18n/ar.json';
import en from '@/i18n/en.json';

/**
 * Recursively extracts every leaf-key path from a nested JSON
 * object. A "leaf" is anything that isn't a plain object: strings,
 * numbers, booleans, null, and arrays (arrays are treated as leaves
 * — both i18n files currently contain zero arrays, verified at
 * test-write time).
 *
 * Returns a Set of dot-separated paths.
 *
 *   { a: { b: "x", c: { d: "y" } } }
 *     → Set { "a.b", "a.c.d" }
 *
 * Used to lock EN ↔ AR parity in CI. Closes T043.
 */
function extractLeafPaths(obj: unknown, prefix = ''): Set<string> {
  const paths = new Set<string>();
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    if (prefix) paths.add(prefix);
    return paths;
  }
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      paths.add(path);
    } else {
      const nested = extractLeafPaths(value, path);
      nested.forEach((p) => paths.add(p));
    }
  }
  return paths;
}

describe('i18n key parity (EN ↔ AR)', () => {
  const enPaths = extractLeafPaths(en);
  const arPaths = extractLeafPaths(ar);

  it('has matching leaf-key count between locales', () => {
    expect(arPaths.size).toBe(enPaths.size);
  });

  it('has no EN keys missing from AR', () => {
    const missing = [...enPaths].filter((p) => !arPaths.has(p)).sort();
    expect(missing).toEqual([]);
  });

  it('has no AR keys missing from EN (no dangling translations)', () => {
    const dangling = [...arPaths].filter((p) => !enPaths.has(p)).sort();
    expect(dangling).toEqual([]);
  });
});
