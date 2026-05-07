import type { WeightUnit } from '@/lib/format';

/*
 * Domain types — minimal shape for P0.5.
 *
 * These will be refined in P1+ when the data layer (Dexie/IndexedDB)
 * is wired. For now they cover what ExerciseCard needs to compile.
 *
 * Strings here are assumed already-localized at the boundary that
 * loads them (e.g. the library page resolves bilingual exercise names
 * to the active UI language before passing into the card). The card
 * itself does not perform exercise-name translation.
 */

export type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  imageUrl?: string;
};

export type LoggedSet = {
  weight: number;
  unit: WeightUnit;
  reps: number;
  rpe?: number;
};

export type PlannedSet = {
  targetWeight: number;
  targetReps: number;
  unit: WeightUnit;
};

/*
 * One entry inside a LiveSetList during the Daily variant. Sets cycle
 * through pending → current → logged | skipped over the course of a
 * session. The discriminated union makes invalid combinations
 * (e.g. logged set without weight) unrepresentable.
 */
export type LiveSet =
  | ({ status: 'logged' } & LoggedSet)
  | ({ status: 'current' } & PlannedSet)
  | ({ status: 'pending' } & PlannedSet)
  | { status: 'skipped' };

export type SummarySet =
  | ({ status: 'logged' } & LoggedSet)
  | { status: 'skipped' };
