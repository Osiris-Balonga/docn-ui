"use client";

import { useSyncExternalStore } from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const mediaQuery = window.matchMedia(reducedMotionQuery);
  mediaQuery.addEventListener("change", onChange);

  return () => mediaQuery.removeEventListener("change", onChange);
}

function prefersReducedMotion() {
  return window.matchMedia(reducedMotionQuery).matches;
}

export function HomeVideoBackground() {
  const reduceMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    prefersReducedMotion,
    () => true,
  );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-slate-950"
    >
      {!reduceMotion ? (
        <video
          autoPlay
          className="size-full object-cover"
          loop
          muted
          playsInline
          preload="metadata"
        >
          <source
            media="(max-width: 767px)"
            src="/media/home-hero-720.mp4"
            type="video/mp4"
          />
          <source
            media="(min-width: 1921px)"
            src="/media/home-hero-1440.mp4"
            type="video/mp4"
          />
          <source src="/media/home-hero-1080.mp4" type="video/mp4" />
        </video>
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.4)_0%,rgba(2,6,23,0.58)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,6,23,0.12)_0%,rgba(2,6,23,0.38)_72%)]" />
    </div>
  );
}
