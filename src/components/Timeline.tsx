"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  minYear: number;
  maxYear: number;
  initialYear: number;
  onYearChange: (year: number) => void;
};

const PX_PER_YEAR = 1.0;
const MINOR_STEP = 50; // tick every 50 years (50px apart)
const MAJOR_EVERY = 5; // every 5th minor tick is a major (every 250 years)

function yearLabel(y: number): string {
  if (y < 0) return `${Math.abs(y).toLocaleString()} BCE`;
  if (y === 0) return "1 CE";
  return `${y.toLocaleString()} CE`;
}

function shortLabel(y: number): string {
  if (y < 0) return `${Math.abs(y)} BCE`;
  if (y === 0) return "0";
  return `${y} CE`;
}

export function Timeline({
  minYear,
  maxYear,
  initialYear,
  onYearChange,
}: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [year, setYear] = useState(initialYear);
  const rafRef = useRef<number | null>(null);

  const totalWidth = (maxYear - minYear) * PX_PER_YEAR;

  const ticks = useMemo(() => {
    const out: { year: number; major: boolean }[] = [];
    let i = 0;
    for (let y = minYear; y <= maxYear; y += MINOR_STEP) {
      out.push({ year: y, major: i % MAJOR_EVERY === 0 });
      i++;
    }
    return out;
  }, [minYear, maxYear]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => setViewportWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);

    // --- Momentum state shared by drag + wheel.
    let momentumRaf: number | null = null;
    let velocity = 0; // px per ms, positive = scrolling rightward

    function cancelMomentum() {
      if (momentumRaf !== null) {
        cancelAnimationFrame(momentumRaf);
        momentumRaf = null;
      }
      velocity = 0;
    }

    function startMomentum() {
      const node = el;
      if (!node) return;
      if (Math.abs(velocity) < 0.08) {
        velocity = 0;
        return;
      }
      // Clamp so an aggressive flick doesn't shoot off into geological time.
      velocity = Math.max(-3.5, Math.min(3.5, velocity));
      let last = performance.now();
      const tick = (now: number) => {
        const dt = now - last;
        last = now;
        node.scrollLeft += velocity * dt;
        // Half-life ≈ 300 ms.
        velocity *= Math.pow(0.997, dt);
        // Stop on ends.
        const max = node.scrollWidth - node.clientWidth;
        if (node.scrollLeft <= 0 || node.scrollLeft >= max) {
          velocity = 0;
        }
        if (Math.abs(velocity) < 0.02) {
          velocity = 0;
          momentumRaf = null;
          return;
        }
        momentumRaf = requestAnimationFrame(tick);
      };
      momentumRaf = requestAnimationFrame(tick);
    }

    // --- Wheel: convert vertical mouse-wheel into horizontal scrub.
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0 && e.deltaX === 0) return;
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta === 0) return;
      e.preventDefault();
      cancelMomentum();
      el.scrollLeft += delta;
    };
    el.addEventListener("wheel", onWheel, { passive: false });

    // --- Pointer drag with momentum on release.
    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    let activePointerId: number | null = null;
    let lastMoveTime = 0;
    let lastMoveX = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return; // native touch-scroll wins
      if (e.button !== 0) return; // primary button only
      cancelMomentum();
      dragging = true;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      lastMoveTime = e.timeStamp;
      lastMoveX = e.clientX;
      activePointerId = e.pointerId;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {}
      el.style.cursor = "grabbing";
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      e.preventDefault();
      const dx = e.clientX - startX;
      el.scrollLeft = startScroll - dx;
      // Track instantaneous velocity from the last frame.
      const dt = e.timeStamp - lastMoveTime;
      if (dt > 0) {
        const frameDx = e.clientX - lastMoveX;
        // Negate: dragging the strip rightward scrolls the view leftward.
        const instant = -frameDx / dt;
        // Smooth via EMA so a single jittery frame doesn't dominate.
        velocity = velocity * 0.6 + instant * 0.4;
      }
      lastMoveTime = e.timeStamp;
      lastMoveX = e.clientX;
    };
    const onPointerEnd = () => {
      if (!dragging) return;
      dragging = false;
      el.style.cursor = "";
      if (activePointerId !== null) {
        try {
          el.releasePointerCapture(activePointerId);
        } catch {}
        activePointerId = null;
      }
      startMomentum();
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerEnd);
    el.addEventListener("pointercancel", onPointerEnd);
    el.addEventListener("pointerleave", onPointerEnd);

    return () => {
      ro.disconnect();
      cancelMomentum();
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerEnd);
      el.removeEventListener("pointercancel", onPointerEnd);
      el.removeEventListener("pointerleave", onPointerEnd);
    };
  }, []);

  // Set initial scroll once viewport width is known.
  const initialScrollSet = useRef(false);
  useEffect(() => {
    if (initialScrollSet.current) return;
    if (viewportWidth === 0) return;
    const el = viewportRef.current;
    if (!el) return;
    el.scrollLeft = (initialYear - minYear) * PX_PER_YEAR;
    initialScrollSet.current = true;
  }, [viewportWidth, initialYear, minYear]);

  function handleScroll() {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = viewportRef.current;
      if (!el) return;
      const raw = minYear + el.scrollLeft / PX_PER_YEAR;
      const next = Math.max(minYear, Math.min(maxYear, Math.round(raw)));
      if (next !== year) {
        setYear(next);
        onYearChange(next);
      }
    });
  }

  const innerWidth = viewportWidth + totalWidth;
  const leadOffset = viewportWidth / 2;

  return (
    <div className="hatime">
      <div className="hatime-readout">{yearLabel(year)}</div>
      <div className="hatime-frame">
        <div
          className="hatime-viewport"
          ref={viewportRef}
          onScroll={handleScroll}
        >
          {viewportWidth > 0 && (
            <div
              className="hatime-inner"
              style={{ width: `${innerWidth}px` }}
            >
              {ticks.map((t) => (
                <div
                  key={t.year}
                  className={`hatime-tick${t.major ? " hatime-tick-major" : ""}`}
                  style={{
                    left: `${leadOffset + (t.year - minYear) * PX_PER_YEAR}px`,
                  }}
                >
                  {t.major && (
                    <span className="hatime-tick-label">
                      {shortLabel(t.year)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="hatime-bracket" aria-hidden>
          <div className="hatime-bracket-line hatime-bracket-line-left" />
          <div className="hatime-bracket-line hatime-bracket-line-right" />
          <div className="hatime-bracket-band" />
        </div>
      </div>
      <p className="hatime-help" aria-hidden>
        Drag the timeline. The year at the center comes into focus.
      </p>
    </div>
  );
}
