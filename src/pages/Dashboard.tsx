import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { data, sentencesWithVerb, studyCards, subjectsInGroup, verbById } from "../lib/content";
import { greeting, studyStats } from "../lib/stats";
import { groupStone } from "../lib/groups";
import { useAppState } from "../context/AppState";
import { useCountUp } from "../hooks/useCountUp";
import { ConjugationTable } from "../components/ConjugationTable";
import { Pavement, stoneState, type StoneState } from "../components/Pavement";
import { SpeakButton } from "../components/WordList";

const ROUND = 20;
const cardById = new Map(studyCards().map((card) => [card.id, card]));

function useWide() {
  const query = "(min-width: 1024px)";
  const [wide, setWide] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const onChange = () => setWide(list.matches);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, []);
  return wide;
}

export function Dashboard() {
  const { progress } = useAppState();
  const stats = studyStats(progress);
  const today = new Date();
  const wide = useWide();
  const due = stats.due.length;
  const shown = useCountUp(due || Math.min(ROUND, stats.fresh.length));

  // the first subject, in the order of the groups, that still has cards you have never seen
  const nextSubject =
    data.subjects.find((subject) => {
      const bucket = stats.bySubject.get(subject.id);
      return bucket && bucket.seen < bucket.total;
    }) ?? data.subjects[0];

  const now = Date.now();
  const counts: Record<StoneState, number> = { set: 0, learning: 0, due: 0, bare: 0 };
  for (const card of stats.cards) counts[stoneState(progress, card.id, now)] += 1;
  const set = counts.set;
  const headline = due ? (
    <>
      <span className="text-sea">{due === 1 ? "Uma carta" : `${due} cartas`}</span> para hoje.
    </>
  ) : stats.seen ? (
    <>
      Tudo <span className="text-sea">em dia.</span>
    </>
  ) : (
    <>
      Vamos <span className="text-sea">começar.</span>
    </>
  );

  const hard = progress.hardCardIds
    .slice()
    .reverse()
    .map((id) => cardById.get(id))
    .filter((card) => card !== undefined)
    .slice(0, 5);
  const starter = stats.cards.filter((card) => card.subjectId === nextSubject.id && card.kind !== "sentence").slice(0, 5);
  const watch = hard.length ? hard : starter;

  const verbOfDay = data.verbs[dayNumber(today) % data.verbs.length];
  const verbSentences = sentencesWithVerb(verbOfDay, 2);

  return (
    <div className="mx-auto max-w-[1180px]">
      <header>
        <h1 lang="pt-BR" className="display">
          {greeting(today)}.
          <br />
          {headline}
        </h1>
        <p className="mt-4 text-[var(--t-sm)] text-muted sm:text-[var(--t-base)]">
          {today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} ·{" "}
          {due ? `${due} ${due === 1 ? "card is" : "cards are"} due` : stats.seen ? "nothing is due" : "nothing studied yet"} ·{" "}
          <span className="num">{set.toLocaleString()}</span> of <span className="num">{stats.cards.length.toLocaleString()}</span> stones laid
        </p>
      </header>

      <section className="mt-6 grid gap-3 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-4" aria-label="Your pavement">
        <div className="field-basalt reveal overflow-hidden p-2.5 sm:p-3">
          <Pavement
            cards={stats.cards}
            progress={progress}
            height={wide ? 290 : 190}
            label={`Your pavement: ${set} stones laid, ${due} due, ${stats.fresh.length} not studied yet`}
          />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-2 pt-3 pb-1 text-[var(--t-xs)] text-[var(--on-basalt-muted)]">
            <Legend color="#f3f3f0" label="Laid" value={counts.set} />
            <Legend color="#3fb3dd" label="Settling" value={counts.learning} />
            <Legend color="#ffc531" label="Due today" value={counts.due} />
            <Legend color="#4a4943" label="Not studied" value={counts.bare} />
            <span className="ml-auto hidden sm:inline">Hover a stone to read it</span>
          </div>
        </div>

        <div className="reveal order-first flex flex-col justify-between gap-4 rounded-[var(--radius)] bg-[var(--sea)] p-4 text-white sm:gap-6 sm:p-6 lg:order-none dark:bg-[#0b5a7a]" style={{ "--i": 2 } as React.CSSProperties}>
          <div className="flex items-end gap-4 lg:flex-col lg:items-start lg:gap-0">
            <p className="num text-[72px] leading-[0.85] font-extrabold tracking-[-0.05em] [font-variation-settings:'wdth'_78] lg:order-2 lg:mt-1 lg:text-[112px]">{shown}</p>
            <div className="min-w-0 lg:contents">
              <p className="text-[var(--t-sm)] font-semibold text-white/85 lg:order-1">{due ? "Today's review" : "Lay new stones"}</p>
              <p className="mt-1 text-[var(--t-sm)] text-white/90 lg:order-3 lg:mt-3">
                {due ? `cards are waiting. A round takes ${Math.min(ROUND, due)}.` : `new cards from ${nextSubject.name}, the next subject you have not finished.`}
              </p>
            </div>
          </div>
          <Link to={due ? "/study" : `/study?subject=${nextSubject.id}`} className="btn btn-sun btn-lg w-full justify-between">
            {due ? `Review ${Math.min(ROUND, due)} cards` : `Start ${nextSubject.name}`}
            <ArrowRight size={18} strokeWidth={2.2} />
          </Link>
        </div>
      </section>

      <section className="mt-8 lg:mt-9" aria-labelledby="groups-title">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="groups-title" className="h-section">
            Subjects
          </h2>
          <Link to="/subjects" className="link">
            All {data.subjects.length} subjects <ArrowRight size={14} />
          </Link>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3 xl:grid-cols-8">
          {data.groups.map((group, index) => {
            const subjects = subjectsInGroup(group.id);
            const stone = groupStone(group.id);
            let total = 0;
            let seen = 0;
            for (const subject of subjects) {
              const bucket = stats.bySubject.get(subject.id);
              total += bucket?.total ?? 0;
              seen += bucket?.seen ?? 0;
            }
            const filled = total ? Math.round((seen / total) * 12) : 0;
            return (
              <li key={group.id} className="reveal" style={{ "--i": index + 3 } as React.CSSProperties}>
                <Link
                  to={`/subjects#${group.id}`}
                  className="stone-tile pressable h-[128px] p-4 xl:h-[124px] xl:p-3.5"
                  style={{ "--tile": stone.stone, "--tile-ink": stone.ink } as React.CSSProperties}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-[17px] leading-[1.1] font-bold tracking-[-0.015em] xl:text-[15px]">{group.name}</span>
                    <ArrowRight size={16} strokeWidth={2.2} className="tile-arrow mt-1 flex-none xl:hidden" />
                  </span>
                  <span>
                    <span className="num block truncate text-[var(--t-xs)] font-medium opacity-85">
                      {seen}/{total}
                      <span className="xl:sr-only"> cards</span>
                    </span>
                    <span className="stones mt-2" aria-hidden="true">
                      {Array.from({ length: 12 }, (_, i) => (
                        <i key={i} className={i < filled ? "on" : ""} style={{ background: i < filled ? "currentColor" : "color-mix(in srgb, currentColor 22%, transparent)" }} />
                      ))}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mt-12 grid gap-4 lg:grid-cols-12">
        <section className="panel lg:col-span-5" aria-labelledby="watch-title">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="watch-title" className="h-section">
              {hard.length ? "Words to watch" : `Start with ${nextSubject.name}`}
            </h2>
            {hard.length ? (
              <Link to="/study?mode=hard" className="link">
                Review these
              </Link>
            ) : null}
          </div>
          <ul className="rows mt-3">
            {watch.map((card) => (
              <li key={card.id} className="flex items-center gap-3 py-3">
                <span className="min-w-0 flex-1">
                  <span lang="pt-BR" className="pt block truncate text-[24px] leading-tight">
                    {card.front}
                  </span>
                  <span className="block truncate text-[var(--t-sm)] text-muted">{card.back}</span>
                </span>
                <SpeakButton text={card.front} />
              </li>
            ))}
          </ul>
        </section>

        <section className="panel lg:col-span-7" aria-labelledby="verb-title">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="verb-title" className="h-section">
              Verb of the day
            </h2>
            <Link to={`/verbs/${verbOfDay.id}`} className="link">
              All forms <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <p lang="pt-BR" className="pt text-[56px] leading-[0.9]">
                {verbOfDay.infinitive}
              </p>
              <p className="mt-2 text-[var(--t-base)] text-muted">
                {verbOfDay.translation}
                {verbOfDay.preposition ? ` · takes ${verbOfDay.preposition}` : ""}
              </p>
            </div>
            <SpeakButton text={verbOfDay.infinitive} />
          </div>
          <ConjugationTable verb={verbById[verbOfDay.id]} compact />
          {verbSentences.length ? (
            <ul className="mt-4 grid gap-3 border-t border-rule pt-4">
              {verbSentences.map((example) => (
                <li key={example.portuguese}>
                  <p lang="pt-BR" className="text-[17px] font-medium">
                    {example.portuguese}
                  </p>
                  <p className="text-[var(--t-sm)] text-muted">{example.english}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <i className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ background: color }} />
      {label} <span className="num font-semibold text-[var(--on-basalt)]">{value.toLocaleString()}</span>
    </span>
  );
}

function dayNumber(date: Date) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}
