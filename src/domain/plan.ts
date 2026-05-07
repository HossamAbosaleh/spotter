/**
 * Plan hierarchy type stubs for forward-compatibility.
 *
 * The Dexie v1 schema declares `plans`, `blocks`, `trainingDays`, and
 * `plannedExercises` tables now so P3 / P4 land without a schema bump.
 * P1 does not write to these tables.
 */

export type BlockType =
  | 'volume'
  | 'intensity'
  | 'peaking'
  | 'deload'
  | 'general';

export type Plan = {
  id: string;
  name: string;
  createdAt: string;
  isActive: boolean;
};

export type Block = {
  id: string;
  planId: string;
  blockIndex: number;
  type: BlockType;
};

export type TrainingDay = {
  id: string;
  blockId: string;
  dayIndex: number;
  name?: string;
};

export type PlannedExercise = {
  id: string;
  dayId: string;
  exerciseId: string;
  sets: number;
  targetReps: number;
  targetWeightKg?: number;
  restSeconds: number;
  rpeTarget?: number;
  orderIndex: number;
};
