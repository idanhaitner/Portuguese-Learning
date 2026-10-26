import type { Conjugation, Verb } from "../types";

export const PERSONS = [
  { id: "eu", label: "eu" },
  { id: "ele-ela-voce", label: "ele, ela, você" },
  { id: "nos", label: "nós" },
  { id: "eles-elas-voces", label: "eles, elas, vocês" },
];

export const TENSES: { id: Conjugation["tense"]; label: string; labelEn: string }[] = [
  { id: "present", label: "Presente", labelEn: "Present" },
  { id: "preterite", label: "Pretérito perfeito", labelEn: "Simple past" },
  { id: "imperfect", label: "Pretérito imperfeito", labelEn: "Past habit" },
];

export function formOf(verb: Verb, tense: Conjugation["tense"], person: string) {
  return verb.conjugations.find((row) => row.tense === tense)?.forms.find((form) => form.person === person)?.form;
}

export function gerundOf(verb: Verb) {
  return formOf(verb, "present-continuous", "gerund");
}

/** Person by tense, only for the tenses the lessons cover for this verb. */
export function ConjugationTable({ verb, compact = false }: { verb: Verb; compact?: boolean }) {
  const tenses = TENSES.filter((tense) => verb.conjugations.some((row) => row.tense === tense.id));
  if (!tenses.length) return <p className="empty mt-4">Your notes do not conjugate this verb yet.</p>;
  return (
    <div className={compact ? "mt-4 overflow-x-auto" : "overflow-x-auto"}>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Person</th>
            {tenses.map((tense) => (
              <th key={tense.id} scope="col">
                <span lang="pt-BR">{tense.label}</span>
                {compact ? null : <span className="block text-muted">{tense.labelEn}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERSONS.map((person) => (
            <tr key={person.id}>
              <th scope="row" lang="pt-BR" className="whitespace-nowrap">
                {person.label}
              </th>
              {tenses.map((tense) => (
                <td key={tense.id} lang="pt-BR" className={compact ? "text-[var(--t-base)] font-semibold" : "pt text-[26px] leading-tight"}>
                  {formOf(verb, tense.id, person.id) ?? <span className="text-muted">–</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
