import { useState } from "react";
import { Volume2 } from "lucide-react";
import { speakPortuguese } from "../lib/speech";
import type { VocabularyItem } from "../types";

const GENDER: Record<string, string> = { m: "masc.", f: "fem.", both: "masc. / fem.", invariable: "same in both" };

export function SpeakButton({ text, label }: { text: string; label?: string }) {
  const [live, setLive] = useState(false);
  return (
    <button
      type="button"
      aria-label={label ?? `Pronounce ${text}`}
      className={`speak pressable ${live ? "is-live" : ""}`}
      onClick={(event) => {
        event.stopPropagation();
        setLive(true);
        speakPortuguese(text, () => setLive(false));
      }}
    >
      <Volume2 size={17} strokeWidth={1.8} />
    </button>
  );
}

/** Words as rows: Portuguese large and condensed, English beside it, grammar notes as a quiet subline. */
export function WordList({ words }: { words: VocabularyItem[] }) {
  return (
    <ul className="rows">
      {words.map((item) => {
        const pt = item.feminine ? `${item.lemma} / ${item.feminine}` : item.lemma;
        const meta = [item.gender ? GENDER[item.gender] : "", item.plural ? `pl. ${item.plural}` : "", item.usageNote ?? ""].filter(Boolean).join(" · ");
        return (
          <li key={item.id} className="flex items-center gap-4 py-3">
            <div className="grid min-w-0 flex-1 gap-x-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-baseline">
              <p lang="pt-BR" className="pt text-[26px] leading-tight">
                {pt}
              </p>
              <div className="min-w-0">
                <p className="text-[var(--t-base)]">{item.translation}</p>
                {meta ? <p className="text-[var(--t-sm)] text-muted">{meta}</p> : null}
              </div>
            </div>
            <SpeakButton text={item.lemma} />
          </li>
        );
      })}
    </ul>
  );
}
