import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ProgressState } from "../context/AppState";
import type { StudyCard } from "../lib/content";
import { masteryOf } from "../lib/srs";

export type StoneState = "set" | "learning" | "due" | "bare";

const COLORS = {
  mortar: "#2c2b27",
  white: "#f3f3f0",
  black: "#0a0a09",
  blackEdge: "#4a4943",
  learning: "#3fb3dd",
  due: "#ffc531",
  bare: "#353430",
  bareWave: "#8d8c82",
};

const RANK: Record<StoneState, number> = { set: 0, learning: 1, due: 2, bare: 3 };

export function stoneState(progress: ProgressState, cardId: string, now: number): StoneState {
  const card = progress.cards[cardId];
  if (!card) return "bare";
  if (card.due <= now) return "due";
  const level = masteryOf(card);
  return level === "mastered" || level === "familiar" ? "set" : "learning";
}

interface Cell {
  x: number;
  y: number;
  /** 0 or 1: which band of the Copacabana wave this cell sits in */
  band: number;
  card: StudyCard;
  state: StoneState;
  delay: number;
  fresh: boolean;
}

/**
 * Every study card is one stone. The pavement is laid left to right along a wavy work front:
 * set stones show the black and white wave, learning stones are wet sea blue, due stones are sun
 * yellow at the front, and the rest is bare sand waiting to be laid.
 */
export function Pavement({
  cards,
  progress,
  height,
  intro = true,
  fresh,
  label,
}: {
  cards: StudyCard[];
  progress: ProgressState;
  height: number;
  intro?: boolean;
  /** cards laid in the round just finished: everything else is already in place, these drop in last */
  fresh?: string[];
  label: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ w: 0, h: height });
  const [hover, setHover] = useState<{ cell: Cell; x: number; y: number } | null>(null);
  const pointer = useRef<{ x: number; y: number; t: number } | null>(null);
  const ripples = useRef<{ x: number; y: number; t: number }[]>([]);
  const startedAt = useRef<number>(0);

  const ordered = useMemo(() => {
    const now = Date.now();
    return cards
      .map((card, index) => ({ card, index, state: stoneState(progress, card.id, now) }))
      .sort((a, b) => RANK[a.state] - RANK[b.state] || a.index - b.index);
  }, [cards, progress]);

  const freshKey = fresh?.join("|") ?? "";
  const freshOrder = useMemo(() => (freshKey ? new Map(freshKey.split("|").map((id, i) => [id, i] as const)) : null), [freshKey]);

  const layout = useMemo(() => {
    const { w, h } = size;
    if (!w || !h || !ordered.length) return null;
    const n = ordered.length;
    let pitch = Math.sqrt((w * h) / n);
    let cols = Math.ceil(w / pitch);
    let rows = Math.ceil(n / cols);
    pitch = Math.min(w / cols, h / rows);
    // trim the grid so the stones fill the field edge to edge
    cols = Math.floor(w / pitch);
    rows = Math.ceil(n / cols);
    pitch = Math.min(w / cols, h / rows);
    const offsetX = (w - cols * pitch) / 2;
    const offsetY = (h - rows * pitch) / 2;
    const slots: { c: number; r: number; key: number }[] = [];
    for (let c = 0; c < cols; c += 1) {
      for (let r = 0; r < rows; r += 1) {
        if (slots.length >= cols * rows) break;
        // the work front leans like a wave, so the laid area has a curved edge
        slots.push({ c, r, key: c + Math.sin((r / rows) * Math.PI * 1.6) * 2.4 + ((c * 7 + r * 13) % 5) * 0.08 });
      }
    }
    slots.sort((a, b) => a.key - b.key);
    // two to three broad swells across the band, like the promenade seen from above
    const waves = Math.max(1, Math.min(3, Math.round(cols / 28)));
    const cells: Cell[] = ordered.map((item, index) => {
      const slot = slots[index];
      const u = slot.c / cols;
      const v = slot.r / rows;
      const wave = v + 0.2 * Math.sin(u * Math.PI * 2 * waves + 0.6);
      return {
        x: offsetX + slot.c * pitch,
        y: offsetY + slot.r * pitch,
        band: ((Math.floor(wave * 4) % 2) + 2) % 2,
        card: item.card,
        state: item.state,
        delay: freshOrder ? (freshOrder.has(item.card.id) ? 500 + freshOrder.get(item.card.id)! * 90 : -1000) : (index / n) * 1300 + ((slot.r * 37) % 11) * 12,
        fresh: freshOrder?.has(item.card.id) ?? false,
      };
    });
    return { cells, pitch };
  }, [ordered, size, freshOrder]);

  useLayoutEffect(() => {
    const element = wrapRef.current;
    if (!element) return;
    // measure once now so the first paint has a size; the observer keeps it current
    const rect = element.getBoundingClientRect();
    setSize({ w: Math.round(rect.width), h: Math.round(rect.height) });
    const observer = new ResizeObserver(([entry]) => setSize({ w: Math.round(entry.contentRect.width), h: Math.round(entry.contentRect.height) }));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !layout) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!startedAt.current) startedAt.current = performance.now() - (intro && !reduce ? 0 : 5000);

    const { cells, pitch } = layout;
    const gap = Math.max(1, pitch * 0.13);
    const stone = pitch - gap;
    const radius = Math.min(3, stone * 0.22);
    let frame = 0;
    let visible = true;

    function draw(now: number) {
      const elapsed = now - startedAt.current;
      ctx.fillStyle = COLORS.mortar;
      ctx.fillRect(0, 0, size.w, size.h);
      const p = pointer.current;
      const pointerFade = p ? Math.max(0, 1 - (now - p.t) / 1600) : 0;
      ripples.current = ripples.current.filter((ripple) => now - ripple.t < 1400);
      const glint = reduce ? -9999 : ((now / 5200) % 1.6) * (size.w + size.h) - size.h * 0.4;

      for (const cell of cells) {
        const local = elapsed - cell.delay;
        let grow = local >= 420 ? 1 : local <= 0 ? 0 : easeOutBack(local / 420);
        if (grow <= 0) continue;
        const cx = cell.x + pitch / 2;
        const cy = cell.y + pitch / 2;
        let lift = 0;
        if (p && pointerFade > 0) {
          const d2 = (cx - p.x) ** 2 + (cy - p.y) ** 2;
          lift = Math.exp(-d2 / (2 * (pitch * 3.2) ** 2)) * pointerFade;
        }
        for (const ripple of ripples.current) {
          const age = (now - ripple.t) / 1400;
          const ring = age * Math.max(size.w, size.h) * 0.9;
          const d = Math.hypot(cx - ripple.x, cy - ripple.y);
          lift = Math.max(lift, Math.exp(-((d - ring) ** 2) / (2 * (pitch * 1.6) ** 2)) * (1 - age));
        }
        let fill: string;
        let scale = 1;
        if (cell.state === "bare") {
          // unlaid grains still trace the wave, so the pattern to be laid is visible from day one
          fill = cell.band ? COLORS.bareWave : COLORS.bare;
          scale = cell.band ? 0.56 : 0.34;
        } else if (cell.state === "learning") fill = COLORS.learning;
        else if (cell.state === "due") fill = COLORS.due;
        else fill = cell.band ? COLORS.white : COLORS.black;
        scale *= grow * (1 + lift * (cell.state === "bare" ? 1.2 : 0.38));
        // a fresh stone falls into its socket from above
        const fall = cell.fresh && local < 420 ? (1 - grow) * pitch * 6 : 0;
        const s = stone * scale;
        const x = cx - s / 2;
        const y = cy - s / 2 - lift * pitch * 0.25 - fall;
        ctx.fillStyle = fill;
        roundRect(ctx, x, y, s, s, radius * Math.min(1, scale));
        ctx.fill();
        if (cell.state === "set" && !cell.band) {
          ctx.fillStyle = COLORS.blackEdge;
          ctx.fillRect(x + radius * 0.5, y, Math.max(0, s - radius), Math.max(0.6, s * 0.08));
        }
        // this round's stones keep a sun outline once they have set
        if (cell.fresh && grow >= 1) {
          ctx.strokeStyle = COLORS.due;
          ctx.lineWidth = Math.max(1.5, pitch * 0.12);
          roundRect(ctx, x - 1, y - 1, s + 2, s + 2, radius + 1);
          ctx.stroke();
        }
        if (cell.fresh && local > 0 && local < 1600) {
          const ring = Math.min(1, local / 1600);
          ctx.strokeStyle = `rgba(255, 197, 49, ${1 - ring})`;
          ctx.lineWidth = 2;
          const r = s / 2 + ring * pitch * 2.2;
          roundRect(ctx, cx - r, cy - r, r * 2, r * 2, radius * 2);
          ctx.stroke();
        }
        // a slow sun glint crosses the laid stones
        if (cell.state !== "bare") {
          const g = 1 - Math.min(1, Math.abs(cx + cy * 0.6 - glint) / (pitch * 5));
          if (g > 0) {
            ctx.fillStyle = `rgba(255, 236, 180, ${g * 0.22})`;
            roundRect(ctx, x, y, s, s, radius);
            ctx.fill();
          }
        }
      }
      const settling = elapsed < 1300 + 520 + 140 + (freshOrder ? freshOrder.size * 90 + 2200 : 0);
      if (visible && !document.hidden && (settling || !reduce)) frame = requestAnimationFrame(draw);
    }

    // paint the first frame now, so the pavement never shows an empty field while waiting for a frame
    draw(performance.now());
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(draw);
      }
    });
    io.observe(canvas);
    const onVisibility = () => {
      if (!document.hidden) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [layout, size, intro]);

  function cellAt(x: number, y: number) {
    if (!layout) return undefined;
    const { cells, pitch } = layout;
    return cells.find((cell) => x >= cell.x && x < cell.x + pitch && y >= cell.y && y < cell.y + pitch);
  }

  function local(event: React.PointerEvent) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  return (
    <div ref={wrapRef} className="relative w-full overflow-hidden" style={{ height }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        className="block h-full w-full cursor-crosshair"
        style={{ width: size.w || "100%", height: size.h }}
        onPointerMove={(event) => {
          const { x, y } = local(event);
          pointer.current = { x, y, t: performance.now() };
          const cell = event.pointerType === "mouse" ? cellAt(x, y) : undefined;
          setHover(cell ? { cell, x, y } : null);
        }}
        onPointerLeave={() => setHover(null)}
        onPointerDown={(event) => {
          const { x, y } = local(event);
          ripples.current.push({ x, y, t: performance.now() });
        }}
      />
      {hover ? (
        <div
          className="pointer-events-none absolute z-10 max-w-[260px] rounded-[10px] bg-[var(--limestone)] px-3 py-2 text-[#121212] shadow-[0_12px_30px_-10px_rgb(0_0_0/0.6)]"
          style={{
            left: Math.min(Math.max(8, hover.x - 20), size.w - 200),
            top: hover.y > size.h / 2 ? hover.y - 64 : hover.y + 18,
          }}
        >
          <span lang="pt-BR" className="pt block truncate text-[17px] leading-tight">
            {hover.cell.card.front}
          </span>
          <span className="block truncate text-[12px] text-[#5d5d57]">
            {hover.cell.card.back} · {STATE_LABEL[hover.cell.state]}
          </span>
        </div>
      ) : null}
    </div>
  );
}

export const STATE_LABEL: Record<StoneState, string> = { set: "set in the pavement", learning: "still settling", due: "due today", bare: "not studied yet" };

function easeOutBack(t: number) {
  const c1 = 1.5;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, Math.max(0, r));
  else ctx.rect(x, y, w, h);
}
