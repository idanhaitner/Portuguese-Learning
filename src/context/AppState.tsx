import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Grade, SrsCard } from "../lib/srs";
import { reviewCard } from "../lib/srs";

const PROGRESS_KEY = "pt-study-progress-v1";
const SETTINGS_KEY = "pt-study-settings-v1";

interface DayStat {
  date: string;
  reviews: number;
  correct: number;
}

export interface ProgressState {
  cards: Record<string, SrsCard>;
  days: DayStat[];
  lastStudyDate: string | null;
  streak: number;
  cardReviews: number;
  cardCorrect: number;
  quizReviews: number;
  quizCorrect: number;
  missedQuizIds: string[];
  hardCardIds: string[];
}

export interface SettingsState {
  theme: "light" | "dark";
}

interface AppStateValue {
  progress: ProgressState;
  settings: SettingsState;
  setTheme: (theme: SettingsState["theme"]) => void;
  gradeCard: (cardId: string, grade: Grade) => void;
  recordQuiz: (quizId: string, correct: boolean) => void;
  resetProgress: () => void;
}

const emptyProgress = (): ProgressState => ({
  cards: {},
  days: [],
  lastStudyDate: null,
  streak: 0,
  cardReviews: 0,
  cardCorrect: 0,
  quizReviews: 0,
  quizCorrect: 0,
  missedQuizIds: [],
  hardCardIds: [],
});

const AppStateContext = createContext<AppStateValue | null>(null);

function dateKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function previousDate(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  return dateKey(date);
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? ({ ...fallback, ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
}

function initialSettings(): SettingsState {
  const saved = loadJson<Partial<SettingsState> | null>(SETTINGS_KEY, null);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return { theme: saved?.theme ?? (prefersDark ? "dark" : "light") };
}

function withDay(progress: ProgressState, correct: boolean): ProgressState {
  const today = dateKey();
  const days = progress.days.filter((day) => day.date !== today);
  const current = progress.days.find((day) => day.date === today) ?? { date: today, reviews: 0, correct: 0 };
  days.push({ date: today, reviews: current.reviews + 1, correct: current.correct + (correct ? 1 : 0) });
  days.sort((a, b) => a.date.localeCompare(b.date));
  let streak = progress.streak;
  if (progress.lastStudyDate !== today) {
    streak = progress.lastStudyDate === previousDate(today) ? progress.streak + 1 : 1;
  }
  return { ...progress, days: days.slice(-60), lastStudyDate: today, streak };
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(() => loadJson(PROGRESS_KEY, emptyProgress()));
  const [settings, setSettings] = useState<SettingsState>(initialSettings);

  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, [settings]);

  const value = useMemo<AppStateValue>(() => {
    return {
      progress,
      settings,
      setTheme: (theme) => setSettings({ theme }),
      gradeCard: (cardId, grade) => {
        setProgress((current) => {
          const nextCard = reviewCard(current.cards[cardId], grade);
          const correct = grade !== "again";
          const hardCardIds = new Set(current.hardCardIds);
          if (grade === "again" || grade === "hard") hardCardIds.add(cardId);
          else hardCardIds.delete(cardId);
          return withDay(
            {
              ...current,
              cards: { ...current.cards, [cardId]: nextCard },
              cardReviews: current.cardReviews + 1,
              cardCorrect: current.cardCorrect + (correct ? 1 : 0),
              hardCardIds: [...hardCardIds].slice(-200),
            },
            correct,
          );
        });
      },
      recordQuiz: (quizId, correct) => {
        setProgress((current) => {
          const missed = new Set(current.missedQuizIds);
          if (correct) missed.delete(quizId);
          else missed.add(quizId);
          return withDay(
            {
              ...current,
              quizReviews: current.quizReviews + 1,
              quizCorrect: current.quizCorrect + (correct ? 1 : 0),
              missedQuizIds: [...missed].slice(-150),
            },
            correct,
          );
        });
      },
      resetProgress: () => setProgress(emptyProgress()),
    };
  }, [progress, settings]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) throw new Error("useAppState must be used inside AppStateProvider");
  return value;
}
