import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Flashcard, GRADES } from "../components/Flashcard";
import { Pavement } from "../components/Pavement";
import { useAppState } from "../context/AppState";
import { data, resolveSubjectId, shuffle, studyCards, subjectName, subjectsInGroup, type StudyCard } from "../lib/content";
import { burst, flyToSocket, vibrate } from "../lib/fx";
import type { Grade } from "../lib/srs";

const ROUND = 20;
type Mode = "due" | "new" | "hard";
const MODES: { id: Mode; label: string }[] = [
  { id: "due", label: "Due and new" },
  { id: "new", label: "New only" },
  { id: "hard", label: "Hard" },
];
const ALL_CARDS = studyCards();
const GRADE_COLOR = Object.fromEntries(GRADES.map((grade) => [grade.id, grade.color])) as Record<Grade, string>;

export function FlashcardsPage() {
  const { progress, gradeCard } = useAppState();
  const [params] = useSearchParams();
  const [subjectId, setSubjectId] = useState(resolveSubjectId(params.get("subject") ?? params.get("lesson") ?? "all"));
  const [kind, setKind] = useState<"all" | StudyCard["kind"]>("all");
  const [mode, setMode] = useState<Mode>((params.get("mode") as Mode) ?? "due");
  const [queue, setQueue] = useState<StudyCard[]>([]);
  const [cursor, setCursor] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [instant, setInstant] = useState(false);
  const [results, setResults] = useState<{ card: StudyCard; grade: Grade }[]>([]);
  const [landed, setLanded] = useState(0);
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const cardRef = useRef<HTMLDivElement>(null);
  const socketsRef = useRef<HTMLDivElement>(null);
  const finishRef = useRef<HTMLDivElement>(null);

  const buildRound = useCallback(() => {
    const snapshot = progressRef.current;
    const now = Date.now();
    const pool = studyCards().filter((card) => (subjectId === "all" || card.subjectId === subjectId) && (kind === "all" || card.kind === kind));
    let next: StudyCard[];
    if (mode === "hard") next = shuffle(pool.filter((card) => snapshot.hardCardIds.includes(card.id)));
    else if (mode === "new") next = shuffle(pool.filter((card) => !snapshot.cards[card.id]));
    else {
      // the most overdue reviews get the seats first, then a random pick of new cards
      const due = pool.filter((card) => snapshot.cards[card.id] && snapshot.cards[card.id].due <= now).sort((a, b) => snapshot.cards[a.id].due - snapshot.cards[b.id].due);
      next = [...due, ...shuffle(pool.filter((card) => !snapshot.cards[card.id]))];
    }
    // shuffle the round itself so words never come in the order of the notes
    setQueue(shuffle(next.slice(0, ROUND)));
    setCursor(0);
    setFlipped(false);
    setResults([]);
    setLanded(0);
  }, [subjectId, kind, mode]);

  useEffect(buildRound, [buildRound]);

  const card = queue[cursor];
  const finished = queue.length > 0 && cursor >= queue.length;

  const grade = useCallback(
    (value: Grade, fromKeyboard = false) => {
      if (!card) return;
      const rect = cardRef.current?.getBoundingClientRect();
      const socket = socketsRef.current?.children[cursor] ?? null;
      gradeCard(card.id, value);
      setResults((current) => [...current, { card, grade: value }]);
      vibrate(value === "again" ? [12, 40, 12] : 10);
      if (rect) flyToSocket(rect, socket, GRADE_COLOR[value], () => setLanded((count) => count + 1));
      else setLanded((count) => count + 1);
      setInstant(fromKeyboard);
      setFlipped(false);
      setCursor((current) => current + 1);
    },
    [card, cursor, gradeCard],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (!card || event.metaKey || event.ctrlKey || target?.closest("input, select, textarea, [role='dialog']")) return;
      if (event.key === " " || (event.key === "Enter" && !flipped)) {
        if (target?.closest("button, a")) return;
        event.preventDefault();
        setInstant(true);
        setFlipped((value) => !value);
        return;
      }
      const match = GRADES.find((item) => item.key === event.key);
      if (match && flipped) {
        event.preventDefault();
        grade(match.id, true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, flipped, grade]);

  const missed = results.filter((result) => result.grade === "again" || result.grade === "hard");
  const knew = results.length - missed.length;

  useEffect(() => {
    if (finished) {
      const timer = window.setTimeout(() => burst(finishRef.current, ["#f3f3f0", "#ffc531", "#3fb3dd", "#121212"], 28), 450);
      return () => window.clearTimeout(timer);
    }
  }, [finished]);

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 lang="pt-BR" className="pt text-[40px] leading-[0.95] sm:text-[var(--t-2xl)]">
          Estudar
        </h1>
        <p className="text-[var(--t-sm)] text-muted">{subjectId === "all" ? "All subjects" : subjectName(subjectId)}</p>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className="field !w-auto max-w-full min-w-0 flex-1 sm:flex-none" aria-label="Subject">
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
        <select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)} className="field !w-auto" aria-label="Card type">
          <option value="all">All cards</option>
          <option value="word">Words</option>
          <option value="sentence">Sentences</option>
          <option value="verb">Verbs</option>
        </select>
        <div className="segmented" role="group" aria-label="Which cards">
          {MODES.map((item) => (
            <button key={item.id} type="button" aria-pressed={mode === item.id} onClick={() => setMode(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {queue.length ? (
        <div className="mt-7">
          <div className="mb-2 flex items-baseline justify-between text-[var(--t-xs)] font-semibold text-muted">
            <span>This round's stones</span>
            <span className="num">
              {Math.min(cursor + 1, queue.length)} of {queue.length}
            </span>
          </div>
          <div
            ref={socketsRef}
            className="sockets"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={queue.length}
            aria-valuenow={cursor}
            aria-label="Round progress"
          >
            {queue.map((item, index) => {
              const result = results[index];
              const set = result && index < landed;
              return (
                <span
                  key={`${item.id}-${index}`}
                  className={`socket ${set ? "is-set" : ""} ${index === cursor && !finished ? "is-current" : ""}`}
                  style={set ? { background: GRADE_COLOR[result.grade] } : undefined}
                />
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        {card ? (
          <Flashcard
            key={card.id}
            card={card}
            cardRef={cardRef}
            state={progress.cards[card.id]}
            flipped={flipped}
            instant={instant}
            onFlip={() => {
              setInstant(false);
              setFlipped((value) => !value);
            }}
            onGrade={(value) => grade(value)}
          />
        ) : finished ? (
          <section ref={finishRef} className="field-basalt verdict p-7 sm:p-10">
            <h2 lang="pt-BR" className="display !text-[64px] sm:!text-[84px]">
              {missed.length === 0 ? "Perfeito." : knew >= results.length * 0.7 ? "Muito bem." : "Quase lá."}
            </h2>
            <p className="mt-3 text-[var(--t-base)] text-[var(--on-basalt-muted)]">
              You knew <span className="num font-bold text-[var(--on-basalt)]">{knew}</span> of <span className="num font-bold text-[var(--on-basalt)]">{results.length}</span> cards
              {subjectId === "all" ? "" : ` in ${subjectName(subjectId)}`}. Watch them set into your pavement.
            </p>
            <div className="mt-7 -mx-2 overflow-hidden rounded-[12px] sm:-mx-3">
              <Pavement
                cards={ALL_CARDS}
                progress={progress}
                height={200}
                fresh={results.map((result) => result.card.id)}
                label={`Your pavement, with the ${results.length} stones from this round just laid`}
              />
            </div>
            <p className="mt-2 text-[var(--t-xs)] text-[var(--on-basalt-muted)]">This round's stones are outlined in sun.</p>
            {missed.length ? (
              <>
                <h3 className="mt-8 text-[var(--t-sm)] font-bold text-[var(--on-basalt)]">To look at again</h3>
                <ul className="mt-2 divide-y divide-[var(--basalt-line)]">
                  {missed.map(({ card: item, grade: value }) => (
                    <li key={item.id} className="flex items-baseline justify-between gap-4 py-3">
                      <span className="min-w-0">
                        <span lang="pt-BR" className="pt block text-[26px] leading-tight text-[var(--on-basalt)]">
                          {item.front}
                        </span>
                        <span className="block text-[var(--t-sm)] text-[var(--on-basalt-muted)]">{item.back}</span>
                      </span>
                      <span className="chip flex-none" style={{ background: GRADE_COLOR[value], color: value === "again" ? "#fff" : "#121212" }}>
                        {value === "again" ? "Again" : "Hard"}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-2">
              {missed.length ? (
                <button
                  type="button"
                  onClick={() => {
                    setQueue(missed.map((result) => result.card));
                    setCursor(0);
                    setResults([]);
                    setLanded(0);
                  }}
                  className="btn btn-sun"
                >
                  <RotateCcw size={16} strokeWidth={2.2} /> Review these {missed.length} again
                </button>
              ) : null}
              <button type="button" onClick={buildRound} className={`btn ${missed.length ? "!border-[var(--basalt-line)] !bg-transparent !text-[var(--on-basalt)]" : "btn-sun"}`}>
                Next round <ArrowRight size={16} strokeWidth={2.2} />
              </button>
              <Link to="/" className="btn btn-ghost !text-[var(--on-basalt-muted)] hover:!bg-[var(--basalt-2)]">
                Today
              </Link>
            </div>
          </section>
        ) : (
          <section className="panel p-7 sm:p-9">
            <h2 className="text-[var(--t-xl)] font-bold tracking-[-0.02em]">{mode === "hard" ? "No hard cards yet." : "Nothing waiting here."}</h2>
            <p className="mt-1.5 text-[var(--t-base)] text-muted">
              {mode === "hard" ? "Cards you mark Again or Hard collect here." : "Choose another subject, or come back when the next cards are due."}
            </p>
            <button
              type="button"
              onClick={() => {
                setSubjectId("all");
                setKind("all");
                setMode("due");
              }}
              className="btn btn-sun mt-5"
            >
              Study all subjects
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
