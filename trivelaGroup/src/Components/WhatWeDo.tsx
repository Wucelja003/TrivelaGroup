import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import "./WhatWeDo.css";

interface Service {
  num: string;
  title: string;
  desc: string;
  icon: ReactNode;
}

const svgProps = {
  viewBox: "0 0 64 64",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  className: "wwd-icon h-32 w-32",
};

/* --i odredjuje redosled paljenja talasa (radiating efekat ka spolja) */
const wave = (i: number) => ({ "--i": i }) as CSSProperties;

/* Marketing — megafon, zvucni talasi se sire udesno */
function MegaphoneIcon() {
  return (
    <svg {...svgProps}>
      <g className="wwd-core">
        <path d="M10 27h7l21-11v32L17 37h-7a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3z" />
        <path d="M20 37v8a4 4 0 0 0 8 0v-4" />
      </g>
      <path className="wwd-wave" style={wave(0)} d="M44 24a10 10 0 0 1 0 16" />
      <path className="wwd-wave" style={wave(1)} d="M50 19a17 17 0 0 1 0 26" />
      <path className="wwd-wave" style={wave(2)} d="M56 14a24 24 0 0 1 0 36" />
    </svg>
  );
}

/* PR — mikrofon, talasi se sire na obe strane */
function MicrophoneIcon() {
  return (
    <svg {...svgProps}>
      <g className="wwd-core">
        <rect x="26" y="8" width="12" height="26" rx="6" />
        <path d="M19 29a13 13 0 0 0 26 0" />
        <path d="M32 42v8" />
        <path d="M24 50h16" />
      </g>
      <path className="wwd-wave" style={wave(0)} d="M50 22a14 14 0 0 1 0 14" />
      <path className="wwd-wave" style={wave(0)} d="M14 22a14 14 0 0 0 0 14" />
      <path className="wwd-wave" style={wave(1)} d="M56 17a21 21 0 0 1 0 24" />
      <path className="wwd-wave" style={wave(1)} d="M8 17a21 21 0 0 0 0 24" />
    </svg>
  );
}

/* Consulting — sijalica, zraci se pale u krug */
function LightbulbIcon() {
  return (
    <svg {...svgProps}>
      <g className="wwd-core">
        <circle cx="32" cy="25" r="12" />
        <path d="M26 37v3a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3" />
        <path d="M28 46h8" />
        <path d="M29 50h6" />
      </g>
      <path className="wwd-wave" style={wave(0)} d="M32 5v6" />
      <path className="wwd-wave" style={wave(1)} d="M17 10l4 4" />
      <path className="wwd-wave" style={wave(1)} d="M47 10l-4 4" />
      <path className="wwd-wave" style={wave(2)} d="M8 25h6" />
      <path className="wwd-wave" style={wave(2)} d="M50 25h6" />
    </svg>
  );
}

const services: Service[] = [
  {
    num: "01.",
    title: "Marketing",
    desc: "Creative campaigns, social media and digital strategy that build a recognizable brand — on and off the pitch.",
    icon: <MegaphoneIcon />,
  },
  {
    num: "02.",
    title: "PR",
    desc: "Public relations, media appearances and reputation management for athletes, clubs and brands.",
    icon: <MicrophoneIcon />,
  },
  {
    num: "03.",
    title: "Consulting",
    desc: "Career guidance, personal branding and smart business decisions beyond the game.",
    icon: <LightbulbIcon />,
  },
];

/* Reveal na scroll — scroll-check sa fallback visinom, ista konvencija kao
   useReveal u PlayersShowcase. IntersectionObserver se ovde NE koristi jer
   u nekim okruzenjima window.innerHeight vrati 0 pa nikad ne okine, a onda
   bi kartice ostale nevidljive. */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      const vh =
        window.innerHeight || document.documentElement.clientHeight || 800;
      const r = el.getBoundingClientRect();
      return r.top < vh * 0.82 && r.bottom > 0;
    };

    if (check()) {
      setShown(true);
      return;
    }

    let poll = 0;
    const stop = () => {
      window.removeEventListener("scroll", onScroll);
      window.clearInterval(poll);
    };
    const tryShow = () => {
      if (!check()) return;
      setShown(true);
      stop();
    };
    function onScroll() {
      tryShow();
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    /* Rezervna provera: nikad ne otkriva "na slepo" nego samo kad je sekcija
       zaista u vidnom polju. Ranije je ovde stajao tajmer od 6s koji je
       kartice puštao bez obzira na poziciju — animacija se odigrala dok su
       jos bile van ekrana, pa je do njih niko nije video.
       Interval pokriva slucaj da smooth-scroll biblioteka ne salje scroll
       dogadjaje. */
    poll = window.setInterval(tryShow, 400);

    return stop;
  }, []);

  return [ref, shown] as const;
}

export default function WhatWeDo() {
  const [gridRef, shown] = useReveal<HTMLDivElement>();

  return (
    <section id="what-we-do" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header */}
        <div className="mb-14 max-w-2xl">
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-[0.2em] text-zelena">
            What we do
          </span>
          <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            Three pillars, one goal —{" "}
            <span className="text-zelena">making you unmissable.</span>
          </h2>
        </div>

        {/* Cards — ulaze iz dubine, jedna za drugom, kad se doskroluje */}
        <div
          ref={gridRef}
          className={`wwd-grid grid gap-6 md:grid-cols-3 ${shown ? "in" : ""}`}
        >
          {services.map((s, i) => (
            <div
              key={s.title}
              /* Zaseban omotac nosi ulaznu animaciju: kartica ima svoj
                 hover transform pa bi se dve animacije tukle oko istog
                 svojstva. */
              className="wwd-card-wrap"
              style={{ "--i": i } as CSSProperties}
            >
            <div
              className="wwd-card group relative flex h-full flex-col overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.03] p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-zelena/40 hover:bg-white/[0.05] hover:shadow-[0_0_34px_rgba(150,255,0,0.12)]"
            >
              {/* Brojač + linija */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold tracking-wider text-white/50 transition-colors duration-300 group-hover:text-zelena">
                  {s.num}
                </span>
                <span className="h-px w-full max-w-20 bg-white/20 transition-colors duration-300 group-hover:bg-zelena/50" />
              </div>

              {/* Ikonica — klizi gore na hover */}
              <div className="flex justify-center py-10 text-white/30 transition-all duration-300 ease-in-out group-hover:-translate-y-3 group-hover:text-zelena group-hover:[filter:drop-shadow(0_0_22px_rgba(150,255,0,0.45))]">
                {s.icon}
              </div>

              <h3 className="text-2xl font-semibold text-white transition-colors duration-300 group-hover:text-zelena">
                {s.title}
              </h3>

              {/* Opis — izlazi na hover (0fr -> 1fr) */}
              <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-out group-hover:mt-4 group-hover:grid-rows-[1fr]">
                <div className="overflow-hidden">
                  <p className="text-sm leading-relaxed text-white/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:delay-150">
                    {s.desc}
                  </p>
                </div>
              </div>

              {/* Donja akcent linija */}
              <span className="mt-6 h-0.5 w-10 bg-zelena/30 transition-all duration-300 group-hover:w-20 group-hover:bg-zelena" />
            </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
