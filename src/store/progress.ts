import { persistentAtom } from '@nanostores/persistent';

export interface ChapterActivity {
  quizPracticed?: boolean;
  flashcardsReviewed?: boolean;
  drawingCompleted?: boolean;
  chapterReviewed?: boolean;
}

export interface UserProgress {
  // Key is chapterId
  activities: Record<number, ChapterActivity>;
}

const initialValue: UserProgress = {
  activities: {},
};

export const progressStore = persistentAtom<UserProgress>('ichibit_progress_v2', initialValue, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export function markActivity(chapterId: number, activity: keyof ChapterActivity) {
  const current = progressStore.get();
  const chapterActivity = current.activities[chapterId] || {};
  
  progressStore.set({
    ...current,
    activities: {
      ...current.activities,
      [chapterId]: {
        ...chapterActivity,
        [activity]: true
      }
    }
  });
}

/**
 * @deprecated Use markActivity instead. Kept for backward compatibility if needed during migration.
 */
export function saveQuizScore(chapterId: number, _score: number) {
  markActivity(chapterId, 'quizPracticed');
}
