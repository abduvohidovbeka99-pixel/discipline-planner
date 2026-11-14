import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Counts completed animation cycles (reps) and handles pause/resume of the
 * SMIL animation. Resets when `resetKey` changes (new exercise or tempo) —
 * but NOT on unrelated state changes like marking a set.
 */
export function useRepCounter(svg: React.RefObject<SVGSVGElement | null>, dur: number, resetKey: string) {
  const t0 = useRef(performance.now());
  const pausedAt = useRef(0);
  const [paused, setPaused] = useState(false);
  const [reps, setReps] = useState(0);

  useEffect(() => {
    t0.current = performance.now();
    setPaused(false);
    setReps(0);
  }, [resetKey]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setReps(Math.floor((performance.now() - t0.current) / (dur * 1000))), 250);
    return () => clearInterval(id);
  }, [paused, dur, resetKey]);

  const toggle = useCallback(() => {
    const s = svg.current;
    if (!s) return;
    if (paused) {
      s.unpauseAnimations();
      t0.current += performance.now() - pausedAt.current;
    } else {
      s.pauseAnimations();
      pausedAt.current = performance.now();
    }
    setPaused(!paused);
  }, [paused, svg]);

  return { reps, paused, toggle };
}
