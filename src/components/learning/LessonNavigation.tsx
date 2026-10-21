"use client";

import { useEffect, useState } from "react";

type Heading = { id: string; text: string; level: number };

export default function LessonNavigation() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState("");
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const article = document.getElementById("lesson-article");
    if (!article) return;
    const elements = Array.from(article.querySelectorAll<HTMLHeadingElement>("h2[id], h3[id]"));
    const items = elements.map((heading) => ({
      id: heading.id,
      text: heading.textContent?.trim() ?? "",
      level: Number(heading.tagName[1]),
    }));
    setHeadings(items);
    if (items.length) setActive(items[0].id);

    const update = () => {
      // Determine which section is under the sticky header.
      const current = [...elements].reverse().find((el) => el.getBoundingClientRect().top <= 150);
      if (current) setActive(current.id);
      else if (items.length) setActive(items[0].id);

      const rect = article.getBoundingClientRect();
      const full = Math.max(1, rect.height - window.innerHeight);
      const completed = Math.min(Math.max(-rect.top, 0), full);
      setProgress(Math.round((completed / full) * 100));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const navigation = (
    <nav aria-label="On this page" className="space-y-1">
      {headings.length === 0 ? (
        <p className="text-sm text-slate-500">Sections will appear here.</p>
      ) : (
        headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            onClick={() => { setActive(heading.id); setMenuOpen(false); }}
            aria-current={active === heading.id ? "location" : undefined}
            className={`block rounded-lg py-2 pr-3 text-sm transition-colors hover:bg-slate-800 hover:text-white cursor-pointer ${heading.level === 3 ? "pl-6" : "pl-3"} ${active === heading.id ? "bg-blue-500/10 font-semibold text-blue-400" : "text-slate-400"}`}
          >
            {heading.text}
          </a>
        ))
      )}
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-40 h-1 bg-slate-800" aria-hidden="true">
        <div className="h-full bg-blue-500 transition-[width] duration-100" style={{ width: `${progress}%` }} />
      </div>
      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-4 lg:hidden">
        <button type="button" aria-expanded={menuOpen} aria-controls="mobile-lesson-toc" onClick={() => setMenuOpen((v) => !v)} className="flex w-full cursor-pointer items-center justify-between font-medium">
          <span>On this page</span>
          <span aria-hidden="true">{menuOpen ? "−" : "+"}</span>
        </button>
        {menuOpen && <div id="mobile-lesson-toc" className="mt-3 border-t border-slate-800 pt-3">{navigation}</div>}
      </div>
      <aside className="hidden lg:block" aria-label="Lesson table of contents">
        <div className="sticky top-8 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">On this page</p>
          {navigation}
          <div className="mt-6 border-t border-slate-800 pt-4">
            <div className="mb-2 flex justify-between text-xs text-slate-400"><span>Reading progress</span><span>{progress}%</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-blue-500" style={{ width: `${progress}%` }} /></div>
          </div>
        </div>
      </aside>
    </>
  );
}
