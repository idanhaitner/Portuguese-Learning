import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { data, fold, searchContent, subjectName } from "../lib/content";
import { subjectStone } from "../lib/groups";

interface Result {
  key: string;
  kind: "Subject" | "Verb" | "Word" | "Sentence";
  subjectId?: string;
  pt: string;
  en: string;
  to: string;
}

function buildResults(query: string): Result[] {
  const needle = fold(query.trim());
  if (!needle) {
    return data.subjects.slice(0, 8).map((subject) => ({ key: subject.id, kind: "Subject", pt: subject.namePt, en: subject.name, to: `/subjects/${subject.id}`, subjectId: subject.id }));
  }
  const hit = (value: string) => fold(value).includes(needle);
  const found = searchContent(query);
  const topics: Result[] = data.subjects
    .filter((subject) => hit(subject.name) || hit(subject.namePt))
    .map((subject) => ({ key: subject.id, kind: "Subject", pt: subject.namePt, en: subject.name, to: `/subjects/${subject.id}`, subjectId: subject.id }));
  const verbs: Result[] = found.verbs.map((verb) => ({ key: verb.id, kind: "Verb", pt: verb.infinitive, en: verb.translation, to: `/verbs/${verb.id}`, subjectId: verb.subjectIds[0] }));
  const words: Result[] = found.vocabulary.map((item) => ({
    key: item.id,
    kind: "Word",
    pt: item.feminine ? `${item.lemma} / ${item.feminine}` : item.lemma,
    en: `${item.translation} · ${subjectName(item.subjectId)}`,
    to: `/subjects/${item.subjectId}`,
    subjectId: item.subjectId,
  }));
  const sentences: Result[] = found.phrases.slice(0, 8).map((item) => ({ key: item.id, kind: "Sentence", pt: item.portuguese, en: item.english, to: `/subjects/${item.subjectId}`, subjectId: item.subjectId }));
  return [...topics, ...verbs, ...words, ...sentences].slice(0, 40);
}

export function SearchPalette({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const results = useMemo(() => buildResults(query), [query]);

  useEffect(() => setCursor(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${cursor}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  function open(result: Result | undefined) {
    if (!result) return;
    navigate(result.to);
    onClose();
  }

  return (
    <>
      <div className="palette-backdrop" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label="Search" className="palette">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search size={18} strokeWidth={1.6} className="flex-none text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") onClose();
              else if (event.key === "ArrowDown") {
                event.preventDefault();
                setCursor((value) => Math.min(value + 1, results.length - 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setCursor((value) => Math.max(value - 1, 0));
              } else if (event.key === "Enter") open(results[cursor]);
            }}
            placeholder="Search words, verbs, subjects, sentences"
            aria-label="Search words, verbs, subjects and sentences"
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
            aria-activedescendant={results[cursor] ? `search-${cursor}` : undefined}
            className="h-14 w-full bg-transparent text-base outline-none"
          />
          <span className="kbd">esc</span>
        </div>
        <div ref={listRef} id="search-results" role="listbox" className="overflow-y-auto p-2">
          {!query.trim() ? <p className="px-4 pt-2 pb-1 text-xs text-muted">Subjects</p> : null}
          {results.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted">Nothing in your notes matches “{query}”.</p>
          ) : (
            results.map((result, index) => (
              <div
                key={`${result.kind}-${result.key}`}
                id={`search-${index}`}
                data-index={index}
                role="option"
                aria-selected={index === cursor}
                onMouseMove={() => setCursor(index)}
                onClick={() => open(result)}
                className="palette-item cursor-pointer"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <i className="h-3 w-3 flex-none rounded-[3px]" style={{ background: result.subjectId ? subjectStone(result.subjectId).stone : "var(--line)" }} />
                  <span className="min-w-0">
                  <span lang="pt-BR" className="pt block truncate text-[22px] leading-tight">
                    {result.pt}
                  </span>
                  <span className="block truncate text-sm text-muted">{result.en}</span>
                  </span>
                </span>
                <span className="flex-none text-xs text-muted">{result.kind}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
