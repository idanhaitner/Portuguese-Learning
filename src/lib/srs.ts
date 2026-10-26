export type Grade = "again" | "hard" | "good" | "easy";

export interface SrsCard {
  ease: number;
  interval: number;
  repetitions: number;
  due: number;
  lapses: number;
}

const QUALITY: Record<Grade, number> = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5,
};

export function emptyCard(now = Date.now()): SrsCard {
  return { ease: 2.5, interval: 0, repetitions: 0, due: now, lapses: 0 };
}

/** Lightweight SM-2. Again resets the step. Hard, Good, and Easy grow the interval. */
export function reviewCard(previous: SrsCard | undefined, grade: Grade, now = Date.now()): SrsCard {
  const current = previous ?? emptyCard(now);
  const quality = QUALITY[grade];
  let ease = current.ease;
  let interval = current.interval;
  let repetitions = current.repetitions;
  let lapses = current.lapses;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
    lapses += 1;
  } else if (repetitions === 0) {
    interval = 1;
    repetitions = 1;
  } else if (repetitions === 1) {
    interval = 6;
    repetitions += 1;
  } else {
    interval = Math.max(1, Math.round(interval * ease));
    repetitions += 1;
  }

  ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  return { ease, interval, repetitions, due: now + interval * 86_400_000, lapses };
}

export function masteryOf(card: SrsCard | undefined): "new" | "learning" | "familiar" | "mastered" {
  if (!card || card.repetitions === 0) return card?.lapses ? "learning" : "new";
  if (card.interval >= 21) return "mastered";
  if (card.repetitions < 2) return "learning";
  return "familiar";
}
