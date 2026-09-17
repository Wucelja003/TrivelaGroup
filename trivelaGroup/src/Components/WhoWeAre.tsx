import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import "./WhoWeAre.css";

/*
 * "Who we are" — tim iza Trivele. Cetiri uloge sa brojem ljudi (headcount),
 * naslovom i opisom. Sadrzaj po klijentu.
 *
 * Sidro id="who-we-are" — stavka u meniju (/#who-we-are) skrola pravo ovde.
 * Kartice ulaze iz dubine kad se doskroluje; brojevi se odbrojavaju (count-up).
 */

/* Tekst (naslov + opis) je u prevodima pod home.whoWeAre.roles.<id>;
   ovde ostaju samo broj ljudi i ikonica, koji se ne menjaju sa jezikom. */
type RoleId = "social" | "pr" | "video" | "design";

interface Role {
  id: RoleId;
  count: number;
  icon: ReactNode;
}

const ROLES: Role[] = [
  {
    id: "social",
    count: 2,
    icon: (
      <>
        <path d="M5 6h18v12H11l-4 4v-4H5z" />
        <path d="M10 12h.01M14 12h.01M18 12h.01" />
      </>
    ),
  },
  {
    id: "pr",
    count: 1,
    icon: (
      <>
        <path d="M4 11l15-6v18l-15-6z" />
        <path d="M8 13v4a2 2 0 0 0 4 0" />
      </>
    ),
  },
  {
    id: "video",
    count: 3,
    icon: (
      <>
        <rect x="3.5" y="7.5" width="13" height="13" rx="2.4" />
        <path d="M16.5 12l7-3.5v11l-7-3.5z" />
      </>
    ),
  },
  {
    id: "design",
    count: 6,
    icon: (
      <>
        <path d="M4 21l3.6-9.6L16 3l5 5-8.4 8.4L4 21z" />
        <path d="M7.6 11.4l5 5" />
      </>
    ),
  },
];

/* Broj se odbrojava 0 -> count kad kartica postane vidljiva */
function CountUp({ value, start }: { value: number; start: boolean }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!start) return;
    let raf = 0;
    let t0: number | null = null;
    const dur = 1300;
    const tick = (t: number) => {
      if (t0 === null) t0 = t;
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, value]);

  return <>{n}</>;
}

export default function WhoWeAre() {
  const { t } = useTranslation();
  const roleText = t("home.whoWeAre.roles", { returnObjects: true });
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
        <div className="mb-14 max-w-3xl">
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-[0.2em] text-zelena">
            {t("home.whoWeAre.eyebrow")}
          </span>
          <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            {t("home.whoWeAre.titleBefore")}{" "}
            <span className="text-zelena">{t("home.whoWeAre.titleAccent")}</span>
          </h2>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-white/60">
            <p>{t("home.whoWeAre.p1")}</p>
            <p>{t("home.whoWeAre.p2")}</p>
          </div>
        </div>

        {/* Cetiri uloge */}
        <div
          ref={gridRef}
          className={`wwa-grid grid gap-6 sm:grid-cols-2 lg:grid-cols-4 ${
            shown ? "in" : ""
          }`}
        >
          {ROLES.map((r, i) => (
            <div
              key={r.id}
              className="wwa-card-wrap"
              style={{ "--i": i } as CSSProperties}
            >
              <div className="wwa-card group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.03] p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-zelena/40 hover:bg-white/[0.05] hover:shadow-[0_0_38px_rgba(150,255,0,0.14)]">
                {/* Akcenat ikonica, gore desno */}
                <span className="wwa-badge" aria-hidden="true">
                  <svg
                    viewBox="0 0 28 28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {r.icon}
                  </svg>
                </span>

                {/* Veliki broj (headcount) */}
                <span className="wwa-num bg-gradient-to-b from-[#d6ff9e] via-[#96ff00] to-[#6fd000] bg-clip-text text-transparent">
                  <CountUp value={r.count} start={shown} />
                </span>

                <span className="wwa-line" aria-hidden="true" />

                <h3 className="wwa-role">{roleText[r.id].title}</h3>
                <p className="wwa-desc">{roleText[r.id].copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
