/*
 * Numerical formatters for Spotter's data display.
 *
 * Format rules are fixed by DESIGN.md §4.3 (MetaPill spec). Don't reinvent.
 *   Sets×Reps:  4×8        — lowercase ×, no spaces
 *   Weight:     80kg, 175lb — no space, unit lowercase
 *   Rest:       90s, 2min   — no space, unit lowercase
 *   RPE:        RPE 7       — uppercase RPE, single space, integer
 *
 * These return raw display strings. Wrap with <span dir="ltr"> in RTL
 * contexts so the numerics don't reorder.
 */

export type WeightUnit = 'kg' | 'lb';

export function formatSetsReps(sets: number, reps: number): string {
  return `${sets}×${reps}`;
}

export function formatWeight(value: number, unit: WeightUnit): string {
  return `${value}${unit}`;
}

/*
 * Rest seconds → display string. Whole minutes (≥60s) collapse to `Nmin`;
 * partial minutes stay as `Ns`. Examples: 30→"30s", 60→"1min", 90→"90s",
 * 120→"2min", 150→"150s", 180→"3min".
 */
export function formatRest(seconds: number): string {
  if (seconds >= 60 && seconds % 60 === 0) {
    return `${seconds / 60}min`;
  }
  return `${seconds}s`;
}

export function formatRPE(value: number): string {
  return `RPE ${Math.round(value)}`;
}
