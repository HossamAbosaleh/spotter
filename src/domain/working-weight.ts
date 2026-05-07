/**
 * Working weight type stub for forward-compatibility.
 *
 * The Dexie v1 schema declares the `workingWeights` table now so P4 lands
 * without a schema bump. P1 does not write to this table.
 */
export type WorkingWeight = {
  exerciseId: string;
  weightKg: number;
  confidenceCalibrated: boolean;
  lastUpdatedAt: string;
};
