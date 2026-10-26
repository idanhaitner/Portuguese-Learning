import { useRef, useState, type PointerEvent, type Ref } from "react";
import { Link } from "react-router-dom";
import { reviewCard, type Grade, type SrsCard } from "../lib/srs";
import { subjectName, verbForCard, type StudyCard } from "../lib/content";
import { subjectStone } from "../lib/groups";
import { SpeakButton } from "./WordList";

export const GRADES: { id: Grade; label: string; key: string; color: string }[] = [
  { id: "again", label: "Again", key: "1", color: "#b8392a" },
  { id: "hard", label: "Hard", key: "2", color: "#e8a800" },
  { id: "good", label: "Good", key: "3", color: "#3fb3dd" },
  { id: "easy", label: "Easy", key: "4", color: "#2f9e62" },
];

const KIND_LABEL = { word: "Word", sentence: "Sentence", verb: "Verb" };
const SWIPE_DISTANCE = 110;
const SWIPE_VELOCITY = 0.11; // px per ms: a quick flick grades even when short

function intervalLabel(previous: SrsCard | undefined, grade: Grade) {
  const days = reviewCard(previous, grade).interval;
  return days === 1 ? "Tomorrow" : days < 30 ? `In ${days} days` : `In ${Math.round(days / 30)} mo`;
}

export function Flashcard({
  card,
  state,
  flipped,
  instant,
  onFlip,
  onGrade,
  cardRef,
}: {
  card: StudyCard;
  state: SrsCard | undefined;
  flipped: boolean;
  instant: boolean;
  onFlip: () => void;
  onGrade: (grade: Grade) => void;
  cardRef?: Ref<HTMLDivElement>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const goodStamp = useRef<HTMLSpanElement>(null);
  const againStamp = useRef<HTMLSpanElement>(null);
  const drag = useRef<{ id: number; x: number; t: number; dx: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const verb = verbForCard(card.id);
  const stone = subjectStone(card.subjectId);
  const long = card.front.length > 22;

  function setOffset(dx: number) {
    // write the transform on the element itself; a CSS variable would restyle every child
    if (ref.current) ref.current.style.transform = dx ? `translateX(${dx}px) rotate(${dx / 30}deg)` : "";
    const amount = Math.min(1, Math.abs(dx) / SWIPE_DISTANCE);
    if (goodStamp.current) goodStamp.current.style.opacity = dx > 0 ? String(amount) : "0";
    if (againStamp.current) againStamp.current.style.opacity = dx < 0 ? String(amount) : "0";
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (drag.current || event.pointerType === "mouse" || !flipped) return;
    drag.current = { id: event.pointerId, x: event.clientX, t: performance.now(), dx: 0 };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    const dx = event.clientX - current.x;
    if (!dragging && Math.abs(dx) > 8) {
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    current.dx = dx;
    if (Math.abs(dx) > 8) setOffset(dx);
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    drag.current = null;
    const wasDragging = dragging;
    setDragging(false);
    const velocity = Math.abs(current.dx) / Math.max(1, performance.now() - current.t);
    if (wasDragging && (Math.abs(current.dx) > SWIPE_DISTANCE || velocity > SWIPE_VELOCITY)) {
      onGrade(current.dx > 0 ? "good" : "again");
      return;
    }
    setOffset(0);
  }

  return (
    <div>
      <div className="deck">
        <div className="deck-shadow" style={{ transform: "translateY(18px) scale(0.92) rotate(2deg)", opacity: 0.6 }} aria-hidden="true" />
        <div className="deck-shadow" style={{ transform: "translateY(9px) scale(0.96) rotate(-1.2deg)" }} aria-hidden="true" />
        <div
          ref={(node) => {
            ref.current = node;
            if (typeof cardRef === "function") cardRef(node);
            else if (cardRef) (cardRef as { current: HTMLDivElement | null }).current = node;
          }}
          className={`swipe-card card-enter relative ${dragging ? "is-dragging" : ""}`}
          style={{ "--tile": stone.stone, "--tile-ink": stone.ink } as React.CSSProperties}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <span ref={goodStamp} className="swipe-stamp left-6 rotate-[-8deg] bg-[#3fb3dd] text-[#121212]">
            Good
          </span>
          <span ref={againStamp} className="swipe-stamp right-6 rotate-[8deg] bg-[#b8392a] text-white">
            Again
          </span>
          <div className={`flip-inner ${flipped ? "is-flipped" : ""} ${instant ? "is-instant" : ""}`}>
            <div
              role="button"
              tabIndex={flipped ? -1 : 0}
              aria-label="Show the answer"
              aria-hidden={flipped}
              onClick={() => !dragging && onFlip()}
              className="flip-face flip-front cursor-pointer p-6 sm:p-9"
            >
              <Meta card={card} />
              <p lang="pt-BR" className={`pt my-auto py-8 break-words ${card.kind === "sentence" || long ? "text-[38px] leading-[1] sm:text-[52px]" : "text-[64px] leading-[0.9] sm:text-[96px]"}`}>
                {card.front}
              </p>
              <p className="text-[var(--t-sm)] font-medium opacity-80">
                Tap<span className="hidden sm:inline">
                  {" "}or press <span className="kbd">Space</span>
                </span>{" "}
                to turn it over
              </p>
            </div>
            <div aria-hidden={!flipped} onClick={() => !dragging && onFlip()} className="flip-face flip-back cursor-pointer p-6 sm:p-9">
              <Meta card={card} muted />
              <div className="my-auto py-6">
                <p lang="pt-BR" className="pt flex items-center gap-2.5 text-[26px] leading-tight text-muted">
                  <i className="h-3 w-3 flex-none rounded-[3px]" style={{ background: stone.stone }} aria-hidden="true" />
                  {card.front}
                </p>
                <p className="mt-2 text-[36px] leading-[1.05] font-bold tracking-[-0.03em] sm:text-[48px]">{card.back}</p>
              </div>
              <div className="grid gap-2 text-[var(--t-base)] leading-relaxed">
                {card.feminine ? (
                  <p>
                    <span className="text-muted">Feminine </span>
                    <span lang="pt-BR" className="font-semibold">
                      {card.feminine}
                    </span>
                  </p>
                ) : null}
                {card.hint ? (
                  <p lang="pt-BR" className="font-semibold">
                    {card.hint}
                  </p>
                ) : null}
                {card.examplePt ? (
                  <p lang="pt-BR">
                    {card.examplePt}
                    {card.exampleEn ? <span className="block text-muted">{card.exampleEn}</span> : null}
                  </p>
                ) : null}
                {card.note ? <p className="text-muted">{card.note}</p> : null}
                {card.usageNote ? <p className="text-muted">{card.usageNote}</p> : null}
                {verb ? (
                  <Link to={`/verbs/${verb.id}`} onClick={(event) => event.stopPropagation()} className="link">
                    All forms of {verb.infinitive}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grade-row" aria-label="How well did you know it?">
        {GRADES.map((grade) => (
          <button key={grade.id} type="button" data-grade={grade.id} disabled={!flipped} onClick={() => onGrade(grade.id)} className="grade-btn">
            <span className="flex w-full items-center justify-between gap-2">
              {grade.label}
              <span className="kbd hidden sm:inline-grid">{grade.key}</span>
            </span>
            <small>{intervalLabel(state, grade.id)}</small>
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-[13px] text-muted sm:hidden">After turning it over, swipe right for Good, left for Again.</p>
    </div>
  );
}

function Meta({ card, muted = false }: { card: StudyCard; muted?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 text-[var(--t-sm)] font-semibold ${muted ? "text-muted" : "opacity-85"}`}>
      <span>
        {subjectName(card.subjectId)} · {KIND_LABEL[card.kind]}
      </span>
      <span className={muted ? "" : "[&_.speak]:text-current"}>
        <SpeakButton text={card.front} />
      </span>
    </div>
  );
}
