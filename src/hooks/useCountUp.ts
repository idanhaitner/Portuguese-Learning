import { useEffect, useState } from "react";

/** Counts a figure up from zero once, with an exponential ease-out; reduced motion shows it at once. */
export function useCountUp(target: number, duration = 1100) {
  const [value, setValue] = useState(() => (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? target : 0));
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - 2 ** (-10 * t))));
      if (t < 1) frame = requestAnimationFrame(tick);
      else setValue(target);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}
