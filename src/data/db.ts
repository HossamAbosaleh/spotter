/**
 * SpotterDB — the single Dexie/IndexedDB instance for all client-side data.
 *
 * IMPORTANT: This file MUST only be imported by code in `src/data/`. UI
 * components, pages, and stores read and write through repositories,
 * never the raw `db` instance. See specs/001-profile-wizard/contracts/
 * persistence.md.
 *
 * The v1 schema declares all 11 tables — Profile (the only one P1's UI
 * exercises) plus 10 forward-compatibility tables (libraryExercises,
 * userExercisePreferences, workingWeights, plans, blocks, trainingDays,
 * plannedExercises, sessions, setLogs, exportPayloads). Future phases add
 * tables additively without a v2 bump (Dexie's `version(N).stores({...})`
 * pattern); see R1 in the research notes.
 */

import Dexie, { type Table } from 'dexie';

import type { Profile } from '@/domain/profile';
import type { Block, Plan, PlannedExercise, TrainingDay } from '@/domain/plan';
import type { LibraryExercise, UserExercisePreference } from '@/domain/library';
import type { ExportPayload, Session, SetLog } from '@/domain/session';
import type { WorkingWeight } from '@/domain/working-weight';

export class SpotterDB extends Dexie {
  profile!: Table<Profile, 'me'>;
  libraryExercises!: Table<LibraryExercise, string>;
  userExercisePreferences!: Table<UserExercisePreference, string>;
  workingWeights!: Table<WorkingWeight, string>;
  plans!: Table<Plan, string>;
  blocks!: Table<Block, string>;
  trainingDays!: Table<TrainingDay, string>;
  plannedExercises!: Table<PlannedExercise, string>;
  sessions!: Table<Session, string>;
  setLogs!: Table<SetLog, string>;
  exportPayloads!: Table<ExportPayload, string>;

  constructor() {
    super('spotter');
    this.version(1).stores({
      profile: 'id',
      libraryExercises: 'id, nameEn, nameAr, category, isCustom',
      userExercisePreferences: 'exerciseId, mark',
      workingWeights: 'exerciseId, lastUpdatedAt',
      plans: 'id, name, createdAt, isActive',
      blocks: 'id, planId, blockIndex, type',
      trainingDays: 'id, blockId, dayIndex',
      plannedExercises: 'id, dayId, exerciseId, orderIndex',
      sessions: 'id, planId, trainingDayId, startedAt',
      setLogs: 'id, sessionId, exerciseId, loggedAt',
      exportPayloads: 'id, createdAt',
    });
  }
}

export const db = new SpotterDB();
