"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Leave server-rendered content visible until JS is ready.
    if (element.getBoundingClientRect().top > window.innerHeight * 0.88) {
      element.classList.add("jav-reveal-pending");
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.remove("jav-reveal-pending");
          element.classList.add("jav-revealed");
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -25px 0px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={className}>{children}</div>;
}
