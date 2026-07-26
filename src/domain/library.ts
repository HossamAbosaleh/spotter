/**
 * Library exercise type stub for forward-compatibility.
 *
 * The Dexie v1 schema declares the `libraryExercises` table now so later
 * phases (P2: library page) compose without a schema bump. P1 does not
 * write to this table.
 *
 * Full Zod schema and validation rules land with P2.
 */
export type LibraryExercise = {
  id: string;
  nameEn: string;
  nameAr: string;
  category: string;
  imageUrl?: string;
  isCustom: boolean;
};

export type UserExercisePreference = {
  exerciseId: string;
  mark: 'yes' | 'sub' | 'no';
  note?: string;
};
