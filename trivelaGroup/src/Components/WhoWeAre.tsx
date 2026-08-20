import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import "./WhoWeAre.css";

/*
 * "Who we are" — tim iza Trivele. Sadrzaj po klijentu: ljudi sa dugogodisnjim
 * iskustvom u fudbalu i medijima, pa videografi i dizajneri.
 *
 * Sidro id="who-we-are" — stavka u meniju (/#who-we-are) skrola pravo ovde.
 * Kartice ulaze iz dubine kad se doskroluje, isti obrazac kao WhatWeDo.
 */

interface Group {
  title: string;
  copy: string;
  icon: ReactNode;
}

const GROUPS: Group[] = [
  {
    title: "Football & media",
    copy: "People who have spent years inside the game and the newsroom — they know how a story lands.",
    icon: (
      <>
        <circle cx="14" cy="14" r="9.3" />
        <path d="M14 8.6l4.4 3.2-1.7 5.1H11.3l-1.7-5.1z" />
        <path d="M14 8.6V6M18.4 11.8l2.1-1.3M16.7 16.9l1.6 1.9M11.3 16.9l-1.6 1.9M9.6 11.8l-2.1-1.3" />
      </>
    ),
  },
  {
    title: "Videographers",
    copy: "Cameras that capture the moments worth keeping — on matchday and off it.",
    icon: (
      <>
        <rect x="3.5" y="8" width="14" height="12" rx="2.4" />
        <path d="M17.5 12.2l6-3.4v10.4l-6-3.4z" />
      </>
    ),
  },
  {
    title: "Designers",
    copy: "Turning those moments into cases and campaigns you actually want to carry.",
    icon: (
      <>
        <path d="M5 21l3.6-9.6L17 4l4 4-7.4 8.4L5 21z" />
        <path d="M8.6 11.4l6 6" />
        <circle cx="10.4" cy="17.6" r="1.1" />
      </>
    ),
  },
];

export default function WhoWeAre() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  /* Reveal na skrol preko IntersectionObserver-a, a NE preko 'scroll' eventa:
     kad se dodje pravo iz menija (/#who-we-are), Lenis skroluje programski i
     nativni 'scroll' ume da izostane — pa bi kartice ostale sakrivene. IO
     okida na presek, bez obzira kako si stigao. */
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -18% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="who-we-are" className="wwa py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header */}
        <div className="mb-14 max-w-2xl">
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-[0.2em] text-zelena">
            Who we are
          </span>
          <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            Built by people who{" "}
            <span className="text-zelena">live sport.</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/60">
            Trivela is made by people with years of experience in football and
            media — together with the videographers and designers who bring every
            idea to life.
          </p>
        </div>

        {/* Tri grupe */}
        <div
          ref={gridRef}
          className={`wwa-grid grid gap-6 md:grid-cols-3 ${shown ? "in" : ""}`}
        >
          {GROUPS.map((g, i) => (
            <div
              key={g.title}
              className="wwa-card-wrap"
              style={{ "--i": i } as CSSProperties}
            >
              <div className="wwa-card group relative flex h-full flex-col overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.03] p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-zelena/40 hover:bg-white/[0.05] hover:shadow-[0_0_34px_rgba(150,255,0,0.12)]">
                <span className="wwa-icon">
                  <svg
                    viewBox="0 0 28 28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {g.icon}
                  </svg>
                </span>
                <h3 className="mt-6 text-xl font-bold text-white">{g.title}</h3>
                <p className="mt-2 leading-relaxed text-white/55">{g.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
