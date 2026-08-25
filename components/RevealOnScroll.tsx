"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";

const SELECTOR =
  ".head, .card, .qtile, .stat, .step, .plan, .wcard, .fstep, .phone, .dash, .faq details, .appcta, .advcard";

// Global reveal-on-scroll controller (mirrors the original vanilla script).
// Re-scans on every client navigation.
export default function RevealOnScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return;

    const els = Array.from(
      document.querySelectorAll<HTMLElement>(SELECTOR),
    ).filter((e) => !e.classList.contains("in"));

    els.forEach((e, i) => {
      e.classList.add("rv");
      e.style.transitionDelay = Math.min(i % 5, 4) * 55 + "ms";
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );
    els.forEach((e) => io.observe(e));

    return () => io.disconnect();
  }, [pathname]);

  return null;
}
