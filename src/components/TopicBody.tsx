import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { data } from "../lib/content";
import { groupStone } from "../lib/groups";
import type { Subject } from "../types";
import { SpeakButton, WordList } from "./WordList";

const SENTENCE_STEP = 10;

/** Everything a subject holds: its rules, words, verbs and sentences. */
export function TopicBody({ subject }: { subject: Subject }) {
  const [sentenceCount, setSentenceCount] = useState(SENTENCE_STEP);
  const stone = groupStone(subject.groupId);
  const grammar = data.grammar.filter((item) => item.subjectId === subject.id);
  const vocabulary = data.vocabulary.filter((item) => item.subjectId === subject.id);
  const phrases = data.phrases.filter((item) => item.subjectId === subject.id);
  const verbs = data.verbs.filter((item) => item.subjectIds.includes(subject.id));

  return (
    <div className="mt-10 grid gap-12">
      {grammar.map((rule) => (
        <section key={rule.id} aria-labelledby={rule.id}>
          <h2 id={rule.id} className="h-section">
            {rule.title}
          </h2>
          <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-6">
            <div>
              <p className="max-w-[65ch] text-[var(--t-base)] leading-relaxed">{rule.explanation}</p>
              {rule.usageNote ? <p className="mt-3 max-w-[65ch] text-[var(--t-base)] leading-relaxed text-muted">{rule.usageNote}</p> : null}
              {rule.patterns.length ? (
                <ul className="mt-5 flex flex-wrap gap-2">
                  {rule.patterns.map((pattern) => (
                    <li key={pattern} lang="pt-BR" className="rounded-[8px] px-3 py-1.5 text-[var(--t-sm)] font-semibold" style={{ background: `color-mix(in srgb, ${stone.stone} 14%, var(--raised))` }}>
                      {pattern}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <ul className="panel rows !py-1">
              {rule.examples.map((example) => (
                <li key={example.portuguese} className="flex items-center gap-3 py-3.5">
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
          {rule.exceptions?.length ? (
            <div className="mt-6">
              <h3 className="text-[var(--t-sm)] font-bold">Easy to get wrong</h3>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {rule.exceptions.map((item) => (
                  <li key={item.wrong} lang="pt-BR" className="rounded-[var(--radius-sm)] bg-sunken px-4 py-3 text-[var(--t-base)]">
                    <span className="text-negative line-through decoration-2">{item.wrong}</span>
                    <span className="mx-2 text-muted">→</span>
                    <span className="font-bold">{item.right}</span>
                    {item.note ? <span className="mt-0.5 block text-[var(--t-sm)] text-muted">{item.note}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ))}

      {vocabulary.length ? (
        <section aria-labelledby="words-title">
          <h2 id="words-title" className="h-section">
            Words <span className="chip ml-1 align-middle">{vocabulary.length}</span>
          </h2>
          <div className="panel mt-4 !py-1">
            <WordList words={vocabulary} />
          </div>
        </section>
      ) : null}

      {verbs.length ? (
        <section aria-labelledby="verbs-title">
          <h2 id="verbs-title" className="h-section">
            Verbs <span className="chip ml-1 align-middle">{verbs.length}</span>
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {verbs.map((verb) => (
              <li key={verb.id}>
                <Link to={`/verbs/${verb.id}`} className="subject-card pressable !gap-1 !p-4" style={{ "--tile": stone.stone } as React.CSSProperties}>
                  <span className="bar-stone" aria-hidden="true" />
                  <span className="flex items-center justify-between gap-2">
                    <span lang="pt-BR" className="pt truncate text-[24px] leading-tight">
                      {verb.infinitive}
                    </span>
                    <ArrowRight size={15} className="flex-none text-muted" />
                  </span>
                  <span className="truncate text-[var(--t-sm)] text-muted">{verb.translation}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {phrases.length ? (
        <section aria-labelledby="sentences-title">
          <h2 id="sentences-title" className="h-section">
            Sentences <span className="chip ml-1 align-middle">{phrases.length}</span>
          </h2>
          <ul className="panel rows mt-4 !py-1">
            {phrases.slice(0, sentenceCount).map((phrase) => (
              <li key={phrase.id} className="flex items-center gap-3 py-3.5">
                <div className="min-w-0 flex-1">
                  <p lang="pt-BR" className="text-[var(--t-lg)] leading-snug font-semibold tracking-[-0.01em]">
                    {phrase.portuguese}
                  </p>
                  <p className="text-[var(--t-sm)] text-muted">{phrase.english}</p>
                  {phrase.incorrectForm ? (
                    <p lang="pt-BR" className="mt-0.5 text-[var(--t-sm)] text-muted">
                      Not <span className="text-negative line-through decoration-2">{phrase.incorrectForm}</span>
                    </p>
                  ) : null}
                </div>
                <SpeakButton text={phrase.portuguese} />
              </li>
            ))}
          </ul>
          {phrases.length > sentenceCount ? (
            <button type="button" onClick={() => setSentenceCount((count) => count + SENTENCE_STEP * 2)} className="btn mt-3">
              Show more ({phrases.length - sentenceCount} left)
            </button>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
