import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Pavement } from "../components/Pavement";
import { useAppState } from "../context/AppState";
import { data } from "../lib/content";
import { groupStone } from "../lib/groups";
import { masteryOf } from "../lib/srs";
import { studyStats } from "../lib/stats";

const DAYS = 14;

export function ProgressPage() {
  const { progress, resetProgress } = useAppState();
  const stats = studyStats(progress);
  const wide = useWide();
  const days = lastDays(DAYS).map((date) => {
    const stat = progress.days.find((day) => day.date === date.key);
    return { ...date, reviews: stat?.reviews ?? 0 };
  });
  const fortnight = days.reduce((sum, day) => sum + day.reviews, 0);
  const activeDays = days.filter((day) => day.reviews > 0).length;

  const levels = { new: 0, learning: 0, familiar: 0, mastered: 0 };
  for (const card of stats.cards) levels[masteryOf(progress.cards[card.id])] += 1;
  const levelRows = [
    { id: "mastered", label: "Mastered", hint: "Next review 21+ days away", color: "var(--ink)" },
    { id: "familiar", label: "Familiar", hint: "Two or more good reviews", color: "var(--sea)" },
    { id: "learning", label: "Learning", hint: "Seen, still settling", color: "var(--sun-deep)" },
    { id: "new", label: "New", hint: "Not studied yet", color: "var(--line)" },
  ] as const;
  const facts = [
    { label: "Streak", value: `${progress.streak} ${progress.streak === 1 ? "day" : "days"}` },
    { label: "Cards reviewed", value: progress.cardReviews.toLocaleString() },
    { label: "Quiz answers", value: progress.quizReviews.toLocaleString() },
    { label: "Accuracy", value: stats.accuracy === null ? "–" : `${stats.accuracy}%` },
  ];

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 lang="pt-BR" className="pt text-[40px] leading-[0.95] sm:text-[var(--t-2xl)] lg:text-[60px]">
            Progresso
          </h1>
          <p className="mt-3 text-[var(--t-base)] text-muted">Every card is one stone. Kept in this browser only.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Clear all study progress saved in this browser?")) resetProgress();
          }}
          className="btn btn-ghost text-muted"
        >
          Reset progress
        </button>
      </div>

      <section className="field-basalt reveal mt-8 overflow-hidden p-2.5 sm:p-3" aria-label="Your pavement">
        <Pavement cards={stats.cards} progress={progress} height={wide ? 420 : 260} label={`Your pavement of ${stats.cards.length} cards`} />
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 px-3 pt-5 pb-3 sm:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-[var(--t-xs)] font-semibold text-[var(--on-basalt-muted)]">{fact.label}</dt>
              <dd className="num mt-1 text-[var(--t-xl)] leading-none font-bold text-[var(--on-basalt)]">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section className="panel lg:col-span-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="h-section">Reviews per day</h2>
            <span className="num text-[var(--t-sm)] text-muted">
              {fortnight.toLocaleString()} in the last {DAYS} days, on {activeDays} {activeDays === 1 ? "day" : "days"}
            </span>
          </div>
          <div className="mt-4">
            <DayBars days={days} />
          </div>
        </section>

        <section className="panel lg:col-span-4">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="h-section">Cards by stage</h2>
            <span className="num text-[var(--t-sm)] text-muted">{stats.cards.length.toLocaleString()} total</span>
          </div>
          <ul className="rows mt-2">
            {levelRows.map((row) => (
              <li key={row.id} className="py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="flex items-center gap-2 text-[var(--t-base)] font-semibold">
                    <i className="h-3 w-3 rounded-[3px]" style={{ background: row.color }} />
                    {row.label}
                  </span>
                  <span className="num text-[var(--t-base)] font-semibold">{levels[row.id].toLocaleString()}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-[2px] bg-sunken">
                  <span className="block h-full rounded-[2px]" style={{ width: `${(levels[row.id] / stats.cards.length) * 100}%`, background: row.color }} />
                </div>
                <p className="mt-1 text-[var(--t-xs)] text-muted">{row.hint}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel lg:col-span-12">
          <h2 className="h-section">By subject</h2>
          <div className="mt-2 overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Subject</th>
                  <th scope="col" className="w-[36%]">
                    <span className="sr-only">Share seen</span>
                  </th>
                  <th scope="col" className="text-right">
                    Seen
                  </th>
                  <th scope="col" className="text-right">
                    Mastered
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.subjects.map((subject) => {
                  const bucket = stats.bySubject.get(subject.id) ?? { total: 0, seen: 0, mastered: 0 };
                  const stone = groupStone(subject.groupId);
                  return (
                    <tr key={subject.id}>
                      <td>
                        <Link to={`/subjects/${subject.id}`} className="flex items-center gap-2.5">
                          <i className="h-3 w-3 flex-none rounded-[3px]" style={{ background: stone.stone }} />
                          <span>
                            <span lang="pt-BR" className="block text-[var(--t-base)] font-semibold">
                              {subject.namePt}
                            </span>
                            <span className="block text-[var(--t-xs)] text-muted">{subject.name}</span>
                          </span>
                        </Link>
                      </td>
                      <td>
                        <div className="h-2 overflow-hidden rounded-[2px] bg-sunken">
                          <span className="block h-full rounded-[2px]" style={{ width: `${bucket.total ? (bucket.seen / bucket.total) * 100 : 0}%`, background: stone.stone }} />
                        </div>
                      </td>
                      <td className="num text-right text-[var(--t-base)]">
                        {bucket.seen}
                        <span className="text-muted">/{bucket.total}</span>
                      </td>
                      <td className={`num text-right text-[var(--t-base)] ${bucket.mastered ? "" : "text-muted"}`}>{bucket.mastered}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

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

/** One series drawn as columns of stones: each stone is a few reviews, today's column in the sun. */
function DayBars({ days }: { days: { key: string; label: string; reviews: number }[] }) {
  // drawn at the real pixel width, so labels stay 12px on a phone instead of scaling down
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(240, Math.round(entry.contentRect.width))));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const height = 220;
  const left = 30;
  const bottom = 24;
  const every = width < 480 ? 4 : width < 720 ? 2 : 1;
  const max = Math.max(...days.map((day) => day.reviews));
  const step = niceStep(max);
  const top = Math.max(step * 3, step * Math.ceil(max / step));
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, index) => index * step);
  const plotH = height - bottom - 8;
  const slot = (width - left) / days.length;
  const y = (value: number) => 8 + plotH - (value / top) * plotH;
  const total = days.reduce((sum, day) => sum + day.reviews, 0);
  const stoneH = 9;

  return (
    <div ref={ref}>
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block" role="img" aria-label={`Reviews per day for the last ${days.length} days, ${total} in all`}>
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={left} x2={width} y1={y(tick)} y2={y(tick)} stroke="var(--rule)" strokeDasharray={tick ? "3 4" : undefined} />
          <text x={left - 8} y={y(tick)} dy="0.32em" textAnchor="end" fontSize="12" fill="var(--muted)" className="num">
            {tick}
          </text>
        </g>
      ))}
      {days.map((day, index) => {
        const x = left + index * slot + slot * 0.2;
        const isToday = index === days.length - 1;
        const barH = y(0) - y(day.reviews);
        const stones = Math.max(day.reviews ? 1 : 0, Math.floor(barH / stoneH));
        return (
          <g key={day.key}>
            <title>{`${day.label}: ${day.reviews} reviews`}</title>
            {Array.from({ length: stones }, (_, s) => (
              <rect key={s} x={x} y={y(0) - (s + 1) * (barH / stones) + 1} width={slot * 0.6} height={barH / stones - 2} rx="2" fill={isToday ? "var(--sun)" : "var(--ink)"} />
            ))}
            {(days.length - 1 - index) % every === 0 ? (
              <text x={isToday ? width - 2 : x + slot * 0.3} y={height - 6} textAnchor={isToday ? "end" : "middle"} fontSize="12" fontWeight={isToday ? 700 : 400} fill={isToday ? "var(--ink)" : "var(--muted)"}>
                {isToday ? "Today" : day.label}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
    </div>
  );
}

function niceStep(max: number) {
  const raw = Math.max(1, max) / 3;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? 10 * magnitude;
}

function lastDays(count: number) {
  const days: { key: string; label: string }[] = [];
  const today = new Date();
  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - index);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    days.push({ key, label: date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) });
  }
  return days;
}
