/**
 * Session and SetLog type stubs for forward-compatibility.
 *
 * The Dexie v1 schema declares the `sessions`, `setLogs`, and
 * `exportPayloads` tables now so P5 / P9 land without a schema bump.
 * P1 does not write to these tables.
 */

export type Session = {
  id: string;
  planId: string;
  trainingDayId: string;
  startedAt: string;
  finishedAt?: string;
  perceivedRpe?: number;
  notes?: string;
};

export type SetLog = {
  id: string;
  sessionId: string;
  exerciseId: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  rpe?: number;
  note?: string;
  loggedAt: string;
};

export type ExportPayload = {
  id: string;
  createdAt: string;
  schemaVersion: number;
  payload: unknown;
};
