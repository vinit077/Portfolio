"use client";

import { useEffect } from "react";

// Scroll reveal — runs once on mount
export function RevealInit() {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const els = document.querySelectorAll<HTMLElement>(".reveal");

    if (prefersReduced) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }

    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    // Observe with a small delay so initial paint completes
    requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>(".reveal").forEach((el) => io.observe(el));
    });

    return () => io.disconnect();
  }, []);

  return null;
}
