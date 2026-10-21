"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Heading = { id: string; text: string; level: number };
const ROOT_ID = "lesson-article";
const READER_ID = "javs-workbench-reading";
const NAV_ID = "javs-lesson-nav";

function motionBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

function getReader() {
  return document.getElementById(READER_ID);
}

function isIndependentReader(reader: HTMLElement | null): reader is HTMLElement {
  return !!reader && window.getComputedStyle(reader).overflowY === "auto" && reader.scrollHeight > reader.clientHeight + 2;
}

function getNavOffset() {
  const nav = document.getElementById(NAV_ID);
  const header = document.querySelector<HTMLElement>(".jav-header");
  return (nav?.getBoundingClientRect().height ?? 60) + (header?.getBoundingClientRect().height ?? 76) + 22;
}

export default function LessonNavigation() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState("");
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const frame = useRef<number | null>(null);

  const goTo = useCallback((id: string, updateHash = true) => {
    const target = document.getElementById(id);
    if (!target) return;
    const reader = getReader();
    const behavior = motionBehavior();

    if (isIndependentReader(reader) && reader.contains(target)) {
      // Bring the workbench into the page viewport, then scroll the inner notes.
      const workbench = document.getElementById("workbench");
      if (workbench) {
        const absoluteTop = window.scrollY + workbench.getBoundingClientRect().top - getNavOffset();
        window.scrollTo({ top: Math.max(0, absoluteTop), behavior });
      }
      const relativeTop = target.getBoundingClientRect().top - reader.getBoundingClientRect().top;
      reader.scrollTo({ top: Math.max(0, reader.scrollTop + relativeTop - 32), behavior });
    } else {
      const absoluteTop = window.scrollY + target.getBoundingClientRect().top - getNavOffset();
      window.scrollTo({ top: Math.max(0, absoluteTop), behavior });
    }
    setActive(id);
    setMenuOpen(false);
    if (updateHash) window.history.replaceState(null, "", `#${encodeURIComponent(id)}`);
  }, []);

  useEffect(() => {
    const article = document.getElementById(ROOT_ID);
    if (!article) return;
    const reader = getReader();
    const sections = Array.from(article.querySelectorAll<HTMLHeadingElement>("h2[id], h3[id]"))
      // Ignore any headings that might be generated inside a separate lab component.
      .filter((el) => !el.closest(".javs-workbench-lab"));
    const items = sections.map(el => ({ id: el.id, text: el.textContent?.trim() ?? "", level: Number(el.tagName[1]) }));
    setHeadings(items);
    if (items.length) setActive(items[0].id);

    const update = () => {
      const offset = getNavOffset();
      const readerRect = reader?.getBoundingClientRect();
      const readerActive = isIndependentReader(reader) && !!readerRect && readerRect.top < window.innerHeight - 80 && readerRect.bottom > offset + 25;
      let selected = sections[0];

      for (const heading of sections) {
        const insideReader = isIndependentReader(reader) && reader.contains(heading);
        if (insideReader) {
          if (!readerActive) continue;
          if (heading.getBoundingClientRect().top <= Math.max(readerRect!.top, offset) + 62) selected = heading;
        } else if (heading.getBoundingClientRect().top <= offset + 40) {
          selected = heading;
        }
      }
      if (selected) setActive((old) => old === selected.id ? old : selected.id);

      // Reading progress includes the page introduction AND the independently
      // scrollable notes. Avoid using just document scrollY (which misses the panel).
      const workbench = document.getElementById("workbench");
      if (workbench && isIndependentReader(reader)) {
        const introStart = article.getBoundingClientRect().top + window.scrollY;
        const workbenchStart = workbench.getBoundingClientRect().top + window.scrollY;
        const introDistance = Math.max(1, workbenchStart - introStart);
        const doneIntro = Math.max(0, Math.min(introDistance, window.scrollY + offset - introStart));
        const innerDistance = Math.max(0, reader.scrollHeight - reader.clientHeight);
        const innerDone = reader.scrollTop;
        const fraction = (doneIntro + innerDone) / Math.max(1, introDistance + innerDistance);
        setProgress(Math.max(0, Math.min(100, Math.round(100 * fraction))));
      } else {
        const rect = article.getBoundingClientRect();
        const total = Math.max(1, rect.height - window.innerHeight * .6);
        setProgress(Math.max(0, Math.min(100, Math.round(100 * Math.max(0, -rect.top) / total))));
      }
    };
    const schedule = () => {
      if (frame.current !== null) return;
      frame.current = window.requestAnimationFrame(() => { frame.current = null; update(); });
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reader?.addEventListener("scroll", schedule, { passive: true });

    // Native hash navigation does not scroll within nested overflow panels.
    // Restore deep links on initial load and browser back/forward.
    const onHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id && document.getElementById(id)) goTo(id, false);
    };
    const startup = window.requestAnimationFrame(onHash);
    window.addEventListener("hashchange", onHash);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reader?.removeEventListener("scroll", schedule);
      window.removeEventListener("hashchange", onHash);
      window.cancelAnimationFrame(startup);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    };
  }, [goTo]);

  return (
    <div className="javs-lesson-nav" id={NAV_ID}>
      <div className="javs-lesson-shell javs-nav-layout">
        <div className="javs-nav-identity" aria-hidden="true"><span>∴</span> CHAPTERS</div>
        <nav className="javs-nav-links" aria-label="Lesson chapters">
          {headings.filter(h => h.level === 2).map((heading, i) => (
            <a key={heading.id} href={`#${heading.id}`}
              onClick={(event) => { event.preventDefault(); goTo(heading.id); }}
              className={`javs-nav-link ${(() => {
                const start = headings.findIndex(h => h.id === heading.id);
                const next = headings.findIndex((h, n) => n > start && h.level === 2);
                const selected = headings.findIndex(h => h.id === active);
                return selected >= start && (next < 0 || selected < next) ? "is-active" : "";
              })()}`}
              aria-current={active === heading.id ? "location" : undefined}>
              <span className="javs-nav-num">{String(i + 1).padStart(2,"0")}</span>{heading.text}
            </a>
          ))}
        </nav>
        <div className="javs-nav-progress" aria-label={`Reading progress ${progress}%`}>
          <span>READING</span><strong>{progress}%</strong>
        </div>
        <button type="button" className="javs-nav-mobile-button" aria-expanded={menuOpen}
          aria-controls="javs-nav-mobile-menu" onClick={() => setMenuOpen(open => !open)}>
          {headings.find(h => h.id === active)?.text ?? "Chapters"}<span aria-hidden="true">{menuOpen ? "−" : "+"}</span>
        </button>
      </div>
      {menuOpen && <nav className="javs-nav-mobile-menu" id="javs-nav-mobile-menu" aria-label="Mobile lesson chapters">
        {headings.map((heading) => <a key={heading.id} href={`#${heading.id}`} onClick={(event) => { event.preventDefault(); goTo(heading.id); }}
          className={active === heading.id ? "is-active" : ""} style={{ paddingLeft: heading.level === 3 ? "28px" : undefined }}>{heading.text}</a>)}
      </nav>}
      <div className="javs-nav-progress-track" aria-hidden="true"><div style={{ width:`${progress}%` }} /></div>
    </div>
  );
}
