import { cn } from '@/lib/utils';
import { formatWeight, type WeightUnit } from '@/lib/format';

/*
 * WorkingWeightDisplay — the hero numeric for the daily-view ExerciseCard.
 *
 * Spec: DESIGN.md §4.3.
 *   80kg                       calibrated
 *   ○ 80kg (warning leading disc)   uncalibrated
 *
 *   - Calibrated weight text:    accent.primary (lime), the eye anchor
 *   - Uncalibrated leading disc: accent.secondary (orange), 6px
 *   - Numeral: font-mono, mono-xl (24/28px), tabular-nums
 *
 * The component is structural — it does not own the calibration tooltip
 * or long-press interaction described in DESIGN.md §4.3 (those are wired
 * by the consumer).
 *
 * Used as a sibling primitive (not a part of ExerciseCard). The Daily
 * variant of ExerciseCard composes it inside its Body slot. It is also
 * usable on calibration screens, plan-edit modals, and the daily hero.
 */
type WorkingWeightDisplayProps = {
  weight: number;
  unit: WeightUnit;
  calibrated?: boolean;
  className?: string;
};

export function WorkingWeightDisplay({
  weight,
  unit,
  calibrated = true,
  className,
}: WorkingWeightDisplayProps) {
  return (
    <span
      dir="ltr"
      data-slot="working-weight"
      data-calibrated={calibrated}
      className={cn(
        'inline-flex items-baseline gap-2 font-mono text-mono-xl tabular-nums',
        calibrated ? 'text-accent-primary' : 'text-text-primary',
        className
      )}
    >
      {!calibrated ? (
        <span
          aria-hidden="true"
          className="block size-1.5 self-center rounded-pill bg-accent-secondary"
        />
      ) : null}
      <span>{formatWeight(weight, unit)}</span>
    </span>
  );
}
