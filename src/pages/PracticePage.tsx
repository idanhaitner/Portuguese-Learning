import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowRight, Blocks, Crosshair, ListChecks, Shuffle, TextCursorInput } from "lucide-react";
import { PracticeSession } from "../components/PracticeSession";
import { useAppState } from "../context/AppState";
import { data, questionsForMode, resolveSubjectId, subjectsInGroup } from "../lib/content";
import type { QuizQuestion } from "../types";

const modes = [
  { id: "mixed", title: "Mixed round", copy: "A little of every exercise.", icon: Shuffle },
  { id: "multiple-choice", title: "Multiple choice", copy: "Word meanings and verb forms.", icon: ListChecks },
  { id: "fill-blank", title: "Fill in the blank", copy: "Contractions, para and por, foi, era and estava.", icon: TextCursorInput },
  { id: "sentence-builder", title: "Sentence builder", copy: "Put the words of a sentence in order.", icon: Blocks },
  { id: "targeted", title: "Targeted", copy: "Questions you missed, then grammar and verbs.", icon: Crosshair },
] as const;

export function PracticePage() {
  const { progress } = useAppState();
  const [params] = useSearchParams();
  const [subjectId, setSubjectId] = useState(resolveSubjectId(params.get("subject") ?? params.get("lesson") ?? "all"));
  const [active, setActive] = useState<QuizQuestion[] | null>(null);

  if (active) return <PracticeSession questions={active} onExit={() => setActive(null)} />;

  const pool = data.quizzes.filter((item) => subjectId === "all" || item.subjectId === subjectId);
  const countFor = (mode: (typeof modes)[number]["id"]) => {
    if (mode === "mixed") return pool.length;
    if (mode === "targeted") return progress.missedQuizIds.length || pool.filter((item) => item.focus === "conjugation" || item.focus === "grammar").length;
    return pool.filter((item) => item.type === mode).length;
  };

  function start(mode: (typeof modes)[number]["id"]) {
    const missed = mode === "targeted" ? [...progress.missedQuizIds, ...progress.hardCardIds] : progress.missedQuizIds;
    setActive(questionsForMode(mode, subjectId, missed));
  }

  const [lead, ...rest] = modes;

  return (
    <div className="mx-auto max-w-[860px]">
      <h1 lang="pt-BR" className="pt text-[40px] leading-[0.95] sm:text-[var(--t-2xl)]">
        Praticar
      </h1>
      <p className="mt-3 text-[var(--t-base)] text-muted">Rounds of ten questions. The ones you miss come back in Targeted.</p>
      <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className="field mt-5 max-w-sm" aria-label="Subject">
        <option value="all">All subjects</option>
        {data.groups.map((group) => (
          <optgroup key={group.id} label={group.name}>
            {subjectsInGroup(group.id).map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <button
        type="button"
        disabled={countFor(lead.id) === 0}
        onClick={() => start(lead.id)}
        className="field-basalt pressable reveal mt-6 flex w-full cursor-pointer flex-col gap-8 p-6 text-left disabled:cursor-not-allowed disabled:opacity-50 sm:flex-row sm:items-end sm:justify-between sm:p-8"
      >
        <span>
          <lead.icon size={26} strokeWidth={1.8} className="text-[var(--sun)]" />
          <span className="mt-4 block text-[var(--t-xl)] leading-tight font-bold tracking-[-0.02em]">{lead.title}</span>
          <span className="mt-1 block text-[var(--t-base)] text-[var(--on-basalt-muted)]">
            {lead.copy} <span className="num">{countFor(lead.id)} questions</span> to draw from.
          </span>
        </span>
        <span className="btn btn-sun btn-lg flex-none">
          Start <ArrowRight size={18} strokeWidth={2.2} />
        </span>
      </button>

      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {rest.map((mode, index) => {
          const count = countFor(mode.id);
          return (
            <li key={mode.id} className="reveal" style={{ "--i": index + 1 } as React.CSSProperties}>
              <button
                type="button"
                disabled={count === 0}
                onClick={() => start(mode.id)}
                className="panel pressable flex h-full w-full cursor-pointer flex-col gap-5 text-left hover:border-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="flex items-center justify-between gap-3">
                  <mode.icon size={22} strokeWidth={1.8} className="text-sea" />
                  <span className="chip num">{mode.id === "targeted" && progress.missedQuizIds.length ? `${count} missed` : `${count} questions`}</span>
                </span>
                <span>
                  <span className="block text-[var(--t-lg)] font-bold tracking-[-0.015em]">{mode.title}</span>
                  <span className="mt-0.5 block text-[var(--t-sm)] text-muted">{mode.copy}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
