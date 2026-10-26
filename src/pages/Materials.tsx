import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useAppState } from "../context/AppState";
import { data, subjectsInGroup } from "../lib/content";
import { groupStone } from "../lib/groups";
import { studyStats } from "../lib/stats";

const STONES = 10;

export function Materials() {
  const { progress } = useAppState();
  const stats = studyStats(progress);
  const { hash } = useLocation();
  const dueBySubject = new Map<string, number>();
  for (const card of stats.due) dueBySubject.set(card.subjectId, (dueBySubject.get(card.subjectId) ?? 0) + 1);

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash]);

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="Assuntos"
        titleLang="pt-BR"
        sub={
          <>
            {data.subjects.length} subjects in {data.groups.length} groups. Press <span className="kbd">/</span> to search every word.
          </>
        }
      />

      <nav aria-label="Groups" className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {data.groups.map((group) => {
          const stone = groupStone(group.id);
          return (
            <a key={group.id} href={`#${group.id}`} className="pressable inline-flex h-9 flex-none items-center gap-2 rounded-full border border-line bg-raised pr-3.5 pl-2.5 text-[var(--t-sm)] font-semibold">
              <i className="h-3 w-3 rounded-[3px]" style={{ background: stone.stone }} />
              {group.name}
            </a>
          );
        })}
      </nav>

      <div className="mt-10 grid gap-14">
        {data.groups.map((group) => {
          const stone = groupStone(group.id);
          const subjects = subjectsInGroup(group.id);
          return (
            <section key={group.id} id={group.id} className="grid scroll-mt-24 gap-4 lg:grid-cols-12 lg:gap-6" aria-labelledby={`${group.id}-title`}>
              <div className="lg:col-span-3">
                <div className="flex items-center gap-3">
                  <i className="h-5 w-5 flex-none rounded-[4px]" style={{ background: stone.stone }} />
                  <h2 id={`${group.id}-title`} className="text-[var(--t-xl)] leading-tight font-bold tracking-[-0.025em]">
                    {group.name}
                  </h2>
                </div>
                <p className="mt-2 text-[var(--t-sm)] text-muted lg:pr-4">{group.blurb}</p>
              </div>
              <ul className="grid gap-2.5 sm:grid-cols-2 lg:col-span-9 lg:grid-cols-3">
                {subjects.map((subject) => {
                  const bucket = stats.bySubject.get(subject.id) ?? { total: 0, seen: 0, mastered: 0 };
                  const due = dueBySubject.get(subject.id) ?? 0;
                  const seenStones = bucket.total ? Math.round((bucket.seen / bucket.total) * STONES) : 0;
                  const setStones = bucket.total ? Math.round((bucket.mastered / bucket.total) * STONES) : 0;
                  return (
                    <li key={subject.id}>
                      <Link
                        to={`/subjects/${subject.id}`}
                        className="subject-card pressable h-full"
                        style={{ "--tile": stone.stone } as React.CSSProperties}
                      >
                        <span className="bar-stone" aria-hidden="true" />
                        <span className="flex items-start justify-between gap-3">
                          <span className="min-w-0">
                            <span lang="pt-BR" className="pt block text-[28px] leading-[0.95]">
                              {subject.namePt}
                            </span>
                            <span className="mt-1.5 block truncate text-[var(--t-sm)] text-muted">{subject.name}</span>
                          </span>
                          {due ? <span className="chip sun num flex-none">{due} due</span> : null}
                        </span>
                        <span className="mt-auto">
                          <span className="stones" style={{ color: stone.stone }} aria-hidden="true">
                            {Array.from({ length: STONES }, (_, i) => (
                              <i key={i} className={i < setStones ? "on" : i < seenStones ? "half" : ""} />
                            ))}
                          </span>
                          <span className="num mt-2 block text-[var(--t-xs)] text-muted">
                            {bucket.seen ? `${bucket.seen} of ${bucket.total} cards seen` : `${bucket.total} cards`}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
