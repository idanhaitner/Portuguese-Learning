/** Small motion helpers shared by the study and practice screens. All of them no-op under reduced motion. */

export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** A card leaves its place and lands in a socket of the round strip, shrinking into a stone on the way. */
export function flyToSocket(from: DOMRect, socket: Element | null, color: string, onLand?: () => void) {
  if (!socket || reducedMotion()) {
    onLand?.();
    return;
  }
  const to = socket.getBoundingClientRect();
  const flyer = document.createElement("div");
  flyer.className = "flyer";
  Object.assign(flyer.style, {
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    background: color,
    transformOrigin: "0 0",
  });
  document.body.appendChild(flyer);
  const sx = to.width / from.width;
  const sy = to.height / from.height;
  const dx = to.left - from.left;
  const dy = to.top - from.top;
  const midX = dx * 0.55;
  const midY = Math.min(dy, 0) - 60;
  const animation = flyer.animate(
    [
      { transform: "translate(0, 0) scale(1, 1) rotate(0deg)", borderRadius: "26px", opacity: 1 },
      { transform: `translate(${midX}px, ${midY}px) scale(${0.32}, ${0.32}) rotate(-8deg)`, borderRadius: "40px", opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy}) rotate(0deg)`, borderRadius: `${3 / Math.max(sx, 0.001)}px`, opacity: 1 },
    ],
    { duration: 640, easing: "cubic-bezier(0.55, 0, 0.25, 1)" },
  );
  animation.onfinish = () => {
    flyer.remove();
    onLand?.();
  };
}

/** A burst of tesserae from the centre of an element: the pavement chipping in celebration. */
export function burst(target: Element | null, colors: string[], count = 18) {
  if (!target || reducedMotion()) return;
  const rect = target.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  for (let index = 0; index < count; index += 1) {
    const shard = document.createElement("i");
    shard.className = "shard";
    shard.style.left = `${cx}px`;
    shard.style.top = `${cy}px`;
    shard.style.background = colors[index % colors.length];
    document.body.appendChild(shard);
    const angle = (index / count) * Math.PI * 2 + Math.random() * 0.5;
    const distance = 60 + Math.random() * Math.max(80, rect.width * 0.45);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance * 0.7 - 30;
    const spin = (Math.random() - 0.5) * 540;
    shard
      .animate(
        [
          { transform: "translate(-50%, -50%) scale(0.4) rotate(0deg)", opacity: 1 },
          { transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1) rotate(${spin}deg)`, opacity: 1, offset: 0.6 },
          { transform: `translate(calc(-50% + ${x * 1.1}px), calc(-50% + ${y + 70}px)) scale(0.6) rotate(${spin * 1.4}deg)`, opacity: 0 },
        ],
        { duration: 900 + Math.random() * 300, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      )
      .finished.then(() => shard.remove());
  }
}

export function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // vibration is a nicety; browsers that refuse it lose nothing
  }
}
