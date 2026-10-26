import { Link, useParams } from "react-router-dom";
import { ConjugationTable, gerundOf } from "../components/ConjugationTable";
import { PageHeader } from "../components/PageHeader";
import { SpeakButton } from "../components/WordList";
import { sentencesWithVerb, subjectById, verbById } from "../lib/content";

const ENDING: Record<string, string> = { ar: "Regular -ar verb", er: "Regular -er verb", ir: "Regular -ir verb", irregular: "Irregular verb" };

export function Verb() {
  const { verbId = "" } = useParams();
  const verb = verbById[verbId];
  if (!verb) {
    return (
      <div className="mx-auto max-w-[1100px]">
        <PageHeader title="Verb not found" back={{ to: "/subjects", label: "Subjects" }} sub="That verb is not in your notes." />
      </div>
    );
  }
  const gerund = gerundOf(verb);
  const subjects = verb.subjectIds.map((id) => subjectById[id]).filter(Boolean);
  const examples = sentencesWithVerb(verb);
  const facts = [
    { label: "Type", value: ENDING[verb.ending] },
    { label: "Gerund", value: gerund ?? "–", pt: Boolean(gerund) },
    { label: "Participle", value: verb.participle ?? "–", pt: Boolean(verb.participle) },
    { label: "Takes", value: verb.preposition ?? "–", pt: Boolean(verb.preposition) },
  ];

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader
        back={subjects[0] ? { to: `/subjects/${subjects[0].id}`, label: subjects[0].name } : { to: "/subjects", label: "Subjects" }}
        title={verb.infinitive}
        titleLang="pt-BR"
        sub={verb.translation}
        actions={<SpeakButton text={verb.infinitive} />}
      />

      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section className="panel lg:col-span-8">
          <h2 className="h-section">Conjugation</h2>
          <div className="mt-2">
            <ConjugationTable verb={verb} />
          </div>
        </section>
        <section className="panel lg:col-span-4">
          <h2 className="h-section">At a glance</h2>
          <dl className="rows mt-2">
            {facts.map((fact) => (
              <div key={fact.label} className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-[var(--t-sm)] text-muted">{fact.label}</dt>
                <dd lang={fact.pt ? "pt-BR" : undefined} className={fact.pt ? "pt text-[26px] leading-none" : fact.value === "–" ? "text-muted" : "text-[var(--t-base)] font-semibold"}>
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
          {verb.notes ? <p className="mt-3 text-[var(--t-sm)] text-muted">{verb.notes}</p> : null}
          {subjects.length ? (
            <p className="mt-3 text-[var(--t-sm)] text-muted">
              In{" "}
              {subjects.map((subject, index) => (
                <span key={subject.id}>
                  {index ? ", " : ""}
                  <Link to={`/subjects/${subject.id}`} className="font-semibold text-ink underline underline-offset-4">
                    {subject.name}
                  </Link>
                </span>
              ))}
            </p>
          ) : null}
        </section>

        <section className="panel lg:col-span-12">
          <h2 className="h-section">
            In sentences {examples.length ? <span className="chip ml-1 align-middle">{examples.length}</span> : null}
          </h2>
          {examples.length ? (
            <div className="mt-2">
              <ul className="rows">
                {examples.map((example) => (
                  <li key={example.portuguese} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p lang="pt-BR" className="text-[var(--t-lg)] leading-snug font-semibold tracking-[-0.01em]">
                        {example.portuguese}
                      </p>
                      <p className="text-[var(--t-sm)] text-muted">{example.english}</p>
                    </div>
                    <SpeakButton text={example.portuguese} />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="empty mt-3">Your notes have no sentences with this verb yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
