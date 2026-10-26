import type { ProgressState } from "../context/AppState";
import { studyCards, type StudyCard } from "./content";
import { masteryOf } from "./srs";

const ALL_CARDS = studyCards();

export interface SubjectProgress {
  total: number;
  seen: number;
  mastered: number;
}

export interface StudyStats {
  cards: StudyCard[];
  due: StudyCard[];
  fresh: StudyCard[];
  seen: number;
  mastered: number;
  accuracy: number | null;
  attempts: number;
  bySubject: Map<string, SubjectProgress>;
}

/** Every figure on the home and progress screens comes from here, so a number shown twice is one value. */
export function studyStats(progress: ProgressState, now = Date.now()): StudyStats {
  const due: StudyCard[] = [];
  const fresh: StudyCard[] = [];
  const bySubject = new Map<string, SubjectProgress>();
  let seen = 0;
  let mastered = 0;
  for (const card of ALL_CARDS) {
    const state = progress.cards[card.id];
    const bucket = bySubject.get(card.subjectId) ?? { total: 0, seen: 0, mastered: 0 };
    bucket.total += 1;
    if (!state) fresh.push(card);
    else {
      seen += 1;
      bucket.seen += 1;
      if (state.due <= now) due.push(card);
      if (masteryOf(state) === "mastered") {
        mastered += 1;
        bucket.mastered += 1;
      }
    }
    bySubject.set(card.subjectId, bucket);
  }
  const attempts = progress.cardReviews + progress.quizReviews;
  const accuracy = attempts ? Math.round(((progress.cardCorrect + progress.quizCorrect) / attempts) * 100) : null;
  return { cards: ALL_CARDS, due, fresh, seen, mastered, accuracy, attempts, bySubject };
}

export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}
