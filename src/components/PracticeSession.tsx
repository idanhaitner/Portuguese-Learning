import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { useAppState } from "../context/AppState";
import { shuffle, subjectName } from "../lib/content";
import { burst, vibrate } from "../lib/fx";
import { subjectStone } from "../lib/groups";
import { useCountUp } from "../hooks/useCountUp";
import type { QuizQuestion } from "../types";

const RIGHT = "#2f9e62";
const WRONG = "#b8392a";
const normalized = (value: string) => value.normalize("NFC").replace(/[?.!,]/g, "").replace(/\s+/g, " ").trim().toLowerCase();

export function PracticeSession({ questions, onExit }: { questions: QuizQuestion[]; onExit: () => void }) {
  const { recordQuiz } = useAppState();
  const [index, setIndex] = useState(0);
  const [outcomes, setOutcomes] = useState<boolean[]>([]);
  const [missed, setMissed] = useState<QuizQuestion[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [built, setBuilt] = useState<string[]>([]);
  const [typed, setTyped] = useState("");
  const choiceRefs = useRef(new Map<string, HTMLButtonElement>());
  const answerRef = useRef<HTMLDivElement>(null);
  const question = questions[index];
  const finished = index >= questions.length;
  const reveal = picked !== null;

  const choices = useMemo(() => {
    if (!question || question.type === "sentence-builder") return [];
    return shuffle([question.answer, ...(question.options ?? [])].filter((value, itemIndex, all) => all.indexOf(value) === itemIndex));
  }, [question]);

  const bank = useMemo(() => {
    if (!question?.tokens) return [];
    return shuffle(question.tokens.map((text, tokenIndex) => ({ id: `${question.id}-${tokenIndex}`, text })));
  }, [question]);

  const sentence = built.map((id) => bank.find((token) => token.id === id)?.text).filter(Boolean).join(" ");
  const accepted = question ? (question.type === "fill-blank" ? (question.acceptableAnswers ?? [question.answer]) : [question.answer]) : [];
  const isRight = (value: string) => accepted.some((item) => normalized(item) === normalized(value));
  const correct = picked !== null && isRight(picked);

  let combo = 0;
  for (let i = outcomes.length - 1; i >= 0 && outcomes[i]; i -= 1) combo += 1;

  const commit = useCallback(
    (value: string) => {
      if (!question || picked !== null) return;
      const ok = accepted.some((item) => normalized(item) === normalized(value));
      setPicked(value);
      setOutcomes((current) => [...current, ok]);
      if (!ok) setMissed((current) => [...current, question]);
      recordQuiz(question.id, ok);
      vibrate(ok ? 14 : [14, 50, 14]);
      if (ok) {
        const target = choiceRefs.current.get(value) ?? answerRef.current;
        burst(target, ["#ffc531", "#3fb3dd", "#f3f3f0", RIGHT], 16);
      }
    },
    [accepted, picked, question, recordQuiz],
  );

  const next = useCallback(() => {
    setIndex((current) => current + 1);
    setPicked(null);
    setBuilt([]);
    setTyped("");
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (event.metaKey || event.ctrlKey || target?.closest("[role='dialog']")) return;
      if (reveal && event.key === "Enter" && !target?.closest("button")) {
        event.preventDefault();
        next();
        return;
      }
      if (!reveal && question?.type === "multiple-choice" && !target?.closest("input")) {
        const choice = choices[Number(event.key) - 1];
        if (choice) commit(choice);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choices, commit, next, question, reveal]);

  if (!questions.length) {
    return (
      <section className="panel mx-auto max-w-[760px] p-7 sm:p-9">
        <h2 className="text-[var(--t-xl)] font-bold tracking-[-0.02em]">No questions in this subject yet.</h2>
        <button type="button" onClick={onExit} className="btn btn-sun mt-5">
          Back to practice
        </button>
      </section>
    );
  }

  if (finished) return <Finish questions={questions} outcomes={outcomes} missed={missed} onExit={onExit} />;

  const stone = subjectStone(question.subjectId);

  return (
    <section className="mx-auto max-w-[760px]">
      <div className="mb-5 flex items-center gap-3">
        <button type="button" onClick={onExit} className="btn btn-ghost btn-icon -ml-2 flex-none" aria-label="End the round">
          <X size={20} strokeWidth={2} />
        </button>
        <div className="sockets flex-1" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={index} aria-label="Round progress">
          {questions.map((item, i) => (
            <span
              key={item.id}
              className={`socket ${outcomes[i] !== undefined ? "is-set" : ""} ${i === index && !reveal ? "is-current" : ""}`}
              style={outcomes[i] !== undefined ? { background: outcomes[i] ? RIGHT : WRONG } : undefined}
            />
          ))}
        </div>
        <span className="num flex-none text-[var(--t-sm)] font-semibold text-muted">
          {index + 1}/{questions.length}
        </span>
      </div>

      <div key={question.id} className="card-enter">
        <div className="flex min-h-8 justify-end">
          {combo >= 2 ? (
            <span key={combo} className="combo">
              {combo} seguidas
            </span>
          ) : null}
        </div>
        <h2
          lang={question.promptLang === "pt" ? "pt-BR" : "en"}
          className={`mt-1 ${question.promptLang === "pt" ? "pt text-[44px] leading-[0.95] sm:text-[60px]" : "text-[30px] leading-[1.1] font-bold tracking-[-0.025em] sm:text-[40px]"}`}
        >
          {question.prompt}
        </h2>
        <p className="mt-3 flex items-center gap-2 text-[var(--t-sm)] font-semibold text-muted">
          <i className="h-3 w-3 rounded-[3px]" style={{ background: stone.stone }} aria-hidden="true" />
          {subjectName(question.subjectId)}
        </p>
        {question.blankSentence ? (
          <p lang="pt-BR" className="mt-4 text-[var(--t-xl)] leading-snug font-semibold tracking-[-0.02em]">
            {question.blankSentence}
          </p>
        ) : null}

        {question.type === "sentence-builder" ? (
          <div className="mt-7" ref={answerRef}>
            <div
              className="flex min-h-[72px] flex-wrap gap-2 rounded-[16px] border-2 border-dashed p-3"
              style={{ borderColor: reveal ? (correct ? RIGHT : WRONG) : "var(--line)" }}
              aria-label="Your sentence"
            >
              {built.length === 0 ? <span className="self-center px-1 text-[var(--t-sm)] text-muted">Tap the words below in order</span> : null}
              {built.map((id) => (
                <button key={id} type="button" disabled={reveal} onClick={() => setBuilt((current) => current.filter((item) => item !== id))} className="token is-placed pressable" lang="pt-BR">
                  {bank.find((item) => item.id === id)?.text}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {bank
                .filter((token) => !built.includes(token.id))
                .map((token) => (
                  <button key={token.id} type="button" disabled={reveal} onClick={() => setBuilt((current) => [...current, token.id])} className="token pressable" lang="pt-BR">
                    {token.text}
                  </button>
                ))}
            </div>
            {!reveal ? (
              <button type="button" disabled={!built.length} onClick={() => commit(sentence)} className="btn btn-sun btn-lg mt-6">
                Check sentence
              </button>
            ) : null}
          </div>
        ) : (
          <div className="mt-7 grid gap-2.5">
            {question.type === "fill-blank" ? (
              <form
                ref={(node) => {
                  answerRef.current = node as unknown as HTMLDivElement;
                }}
                onSubmit={(event) => {
                  event.preventDefault();
                  if (typed.trim()) commit(typed);
                }}
                className="flex gap-2"
              >
                <input
                  autoFocus
                  value={typed}
                  disabled={reveal}
                  onChange={(event) => setTyped(event.target.value)}
                  placeholder="Type the missing word"
                  aria-label="Missing word"
                  lang="pt-BR"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="field !h-[58px] !text-[var(--t-lg)] font-semibold"
                  style={reveal ? { borderColor: correct ? RIGHT : WRONG } : undefined}
                />
                <button type="submit" disabled={reveal || !typed.trim()} className="btn btn-sun btn-lg">
                  Check
                </button>
              </form>
            ) : null}
            {choices.map((choice, choiceIndex) => {
              const right = isRight(choice);
              const chosen = picked !== null && normalized(picked) === normalized(choice);
              const state = reveal && right ? "is-correct" : reveal && chosen ? "is-wrong" : reveal ? "is-faded" : "";
              return (
                <button
                  key={choice}
                  ref={(node) => {
                    if (node) choiceRefs.current.set(choice, node);
                    else choiceRefs.current.delete(choice);
                  }}
                  type="button"
                  disabled={reveal}
                  onClick={() => commit(choice)}
                  className={`choice pressable ${state}`}
                  lang="pt-BR"
                >
                  <span>{choice}</span>
                  {reveal && right ? (
                    <Check size={22} strokeWidth={2.6} aria-label="Correct answer" />
                  ) : reveal && chosen ? (
                    <X size={22} strokeWidth={2.6} aria-label="Your answer" />
                  ) : !reveal && question.type === "multiple-choice" ? (
                    <span className="kbd hidden sm:inline-grid">{choiceIndex + 1}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}

        {reveal ? (
          <div
            className="verdict mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius)] p-5"
            style={{ background: correct ? "var(--positive-soft)" : "var(--negative-soft)" }}
            role="status"
          >
            <p className="flex items-center gap-3 text-[var(--t-base)]" style={{ color: correct ? "var(--positive)" : "var(--negative)" }}>
              <span className="grid h-9 w-9 flex-none place-items-center rounded-[8px] text-white" style={{ background: correct ? RIGHT : WRONG }}>
                {correct ? <Check size={20} strokeWidth={2.8} /> : <X size={20} strokeWidth={2.8} />}
              </span>
              {correct ? (
                <span lang="pt-BR" className="text-[var(--t-xl)] font-extrabold tracking-[-0.02em]">
                  Isso!
                </span>
              ) : (
                <span className="text-ink">
                  The answer is{" "}
                  <span lang="pt-BR" className="font-extrabold">
                    {question.answer}
                  </span>
                </span>
              )}
            </p>
            <button type="button" autoFocus onClick={next} className="btn btn-ink">
              {index + 1 === questions.length ? "See results" : "Next"} <ArrowRight size={16} strokeWidth={2.2} />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Finish({ questions, outcomes, missed, onExit }: { questions: QuizQuestion[]; outcomes: boolean[]; missed: QuizQuestion[]; onExit: () => void }) {
  const right = outcomes.filter(Boolean).length;
  const shown = useCountUp(right, 900);
  const ref = useRef<HTMLElement>(null);
  const title = right === questions.length ? "Perfeito." : right >= questions.length * 0.7 ? "Muito bem." : "Quase lá.";

  useEffect(() => {
    const timer = window.setTimeout(() => burst(ref.current, ["#ffc531", "#3fb3dd", "#f3f3f0", RIGHT], right === questions.length ? 40 : 24), 500);
    return () => window.clearTimeout(timer);
  }, [right, questions.length]);

  return (
    <section ref={ref} className="field-basalt verdict mx-auto max-w-[760px] p-7 sm:p-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 lang="pt-BR" className="display !text-[64px] sm:!text-[84px]">
          {title}
        </h2>
        <p className="num text-[72px] leading-[0.85] font-extrabold tracking-[-0.05em] text-[var(--sun)] [font-variation-settings:'wdth'_78]">
          {shown}
          <span className="text-[var(--t-xl)] text-[var(--on-basalt-muted)]">/{questions.length}</span>
        </p>
      </div>
      <div className="mt-7 grid grid-cols-10 gap-1.5" aria-hidden="true">
        {outcomes.map((ok, index) => (
          <span key={index} className="reveal aspect-square rounded-[4px]" style={{ background: ok ? RIGHT : WRONG, "--i": index * 1.5 } as React.CSSProperties} />
        ))}
      </div>
      {missed.length ? (
        <>
          <h3 className="mt-8 text-[var(--t-sm)] font-bold text-[var(--on-basalt)]">Missed</h3>
          <ul className="mt-2 divide-y divide-[var(--basalt-line)]">
            {missed.map((item) => (
              <li key={item.id} className="py-3">
                <p lang={item.promptLang === "pt" ? "pt-BR" : "en"} className="text-[var(--t-sm)] text-[var(--on-basalt-muted)]">
                  {item.blankSentence ?? item.prompt}
                </p>
                <p lang={item.promptLang === "pt" ? "en" : "pt-BR"} className={`text-[24px] leading-tight text-[var(--on-basalt)] ${item.promptLang === "pt" ? "font-bold tracking-[-0.02em]" : "pt"}`}>
                  {item.answer}
                </p>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-2">
        <button type="button" onClick={onExit} className="btn btn-sun">
          Back to practice <ArrowRight size={16} strokeWidth={2.2} />
        </button>
      </div>
    </section>
  );
}
