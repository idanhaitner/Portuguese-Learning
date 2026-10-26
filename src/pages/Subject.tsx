import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { TopicBody } from "../components/TopicBody";
import { useAppState } from "../context/AppState";
import { resolveSubjectId, subjectById, teacherNotesFor } from "../lib/content";
import { groupById, groupStone } from "../lib/groups";
import { studyStats } from "../lib/stats";

export function Subject() {
  const { subjectId: rawId = "" } = useParams();
  const { progress } = useAppState();
  const subject = subjectById[resolveSubjectId(rawId)];
  if (!subject) {
    return (
      <div className="mx-auto max-w-[1180px]">
        <PageHeader title="Subject not found" back={{ to: "/subjects", label: "Subjects" }} sub="That subject is not in your notes." />
      </div>
    );
  }
  const stone = groupStone(subject.groupId);
  const group = groupById(subject.groupId);
  const notes = teacherNotesFor(subject.id);
  const stats = studyStats(progress);
  const bucket = stats.bySubject.get(subject.id) ?? { total: 0, seen: 0, mastered: 0 };
  const due = stats.due.filter((card) => card.subjectId === subject.id).length;
  const facts = [
    { label: "Cards", value: bucket.total },
    { label: "Seen", value: bucket.seen },
    { label: "Set", value: bucket.mastered },
    { label: "Due", value: due },
  ];

  return (
    <div className="mx-auto max-w-[1180px]">
      <Link to={`/subjects#${subject.groupId}`} className="mb-5 inline-flex items-center gap-1.5 text-[var(--t-sm)] font-semibold text-muted hover:text-ink">
        <ArrowLeft size={15} strokeWidth={2} />
        {group?.name ?? "Subjects"}
      </Link>
      <header
        className="stone-tile reveal min-h-[300px] gap-10 p-6 sm:p-9"
        style={{ "--tile": stone.stone, "--tile-ink": stone.ink } as React.CSSProperties}
      >
        <div>
          <h1 lang="pt-BR" className="display break-words">
            {subject.namePt}
          </h1>
          <p className="mt-2 text-[var(--t-lg)] font-semibold opacity-85">{subject.name}</p>
          <p className="mt-4 max-w-[60ch] text-[var(--t-base)] leading-relaxed opacity-90">{subject.summary}</p>
          {notes && notes !== subject.summary ? <p className="mt-2 max-w-[60ch] text-[var(--t-sm)] leading-relaxed opacity-80">From your teacher's notes: {notes}</p> : null}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-5">
          <dl className="flex gap-6 sm:gap-9">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-[var(--t-xs)] font-semibold opacity-80">{fact.label}</dt>
                <dd className="num text-[var(--t-xl)] leading-none font-bold">{fact.value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap gap-2">
            <Link to={`/practice?subject=${subject.id}`} className="btn btn-ghost !border-current !text-[var(--tile-ink)] hover:!bg-black/10">
              Quiz
            </Link>
            <Link to={`/study?subject=${subject.id}`} className="btn btn-sun">
              {due ? `Review ${due} due` : "Study this subject"} <ArrowRight size={16} strokeWidth={2.2} />
            </Link>
          </div>
        </div>
      </header>
      <TopicBody subject={subject} />
    </div>
  );
}
