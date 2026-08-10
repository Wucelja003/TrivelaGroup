import { useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Partners.css";

gsap.registerPlugin(ScrollTrigger);

/*
 * "Who we work with" — traka logotipa koja neprekidno klizi.
 *
 * PAZNJA: sve marke ispod su IZMISLJENE, samo da se vidi kako sekcija radi.
 * Nisu stavljeni logotipi stvarnih firmi — na zivom sajtu bi to tvrdilo
 * saradnju koje nema. Zameni imena i znake stvarnim partnerima pre nego
 * sto ovo ode u produkciju.
 *
 * Znaci su inline SVG (stroke: currentColor) pa prate boju na hover i
 * ostaju ostri na svakoj velicini — nema slika za skidanje.
 */
interface Partner {
  name: string;
  mark: ReactNode;
}

const PARTNERS: Partner[] = [
  {
    name: "Nordvelt",
    mark: <path d="M5 17l9-9 9 9M5 23l9-9 9 9" />,
  },
  {
    name: "Kapra",
    mark: (
      <>
        <circle cx="14" cy="14" r="9" />
        <path d="M8.5 19.5L19.5 8.5" />
      </>
    ),
  },
  {
    name: "Velocis",
    mark: (
      <>
        <path d="M3 14h12M9.5 8.5l5.5 5.5-5.5 5.5" />
        <path d="M20 7v14" />
      </>
    ),
  },
  {
    name: "Atria Sport",
    mark: (
      <>
        <path d="M14 4l10 18H4z" />
        <path d="M14 13l4.5 9h-9z" />
      </>
    ),
  },
  {
    name: "Lumen Labs",
    mark: (
      <>
        <circle cx="14" cy="14" r="4" />
        <path d="M14 3v4M14 21v4M3 14h4M21 14h4M6.2 6.2l2.8 2.8M19 19l2.8 2.8M21.8 6.2L19 9M9 19l-2.8 2.8" />
      </>
    ),
  },
  {
    name: "Ferro",
    mark: <path d="M14 3.5l9.1 5.25v10.5L14 24.5l-9.1-5.25V8.75z" />,
  },
  {
    name: "Orbit Nine",
    mark: (
      <>
        <ellipse cx="14" cy="14" rx="11" ry="5.5" transform="rotate(-25 14 14)" />
        <circle cx="14" cy="14" r="3.2" />
      </>
    ),
  },
  {
    name: "Meridian",
    mark: <path d="M4 23V6l10 9.5L24 6v17" />,
  },
  {
    name: "Strata",
    mark: <path d="M4 21h20M7.5 15h13M11 9h6" />,
  },
  {
    name: "Pulsar",
    mark: <path d="M3 14h4.5l3-8.5 4.5 17 3-8.5H25" />,
  },
];

function LogoTile({ p }: { p: Partner }) {
  return (
    <div className="pt-item">
      <svg
        viewBox="0 0 28 28"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {p.mark}
      </svg>
      <span className="pt-name">{p.name}</span>
    </div>
  );
}

/* Traka mora da sadrzi TACNO dve iste kopije: animacija je pomak za -50%,
   pa se sav ostatak poklopi sa pocetkom i sav se vrti bez skoka. */
function Row({ dir }: { dir: "a" | "b" }) {
  return (
    <div className={`pt-row pt-row--${dir}`}>
      <div className="pt-track">
        {PARTNERS.map((p) => (
          <LogoTile key={`1-${p.name}`} p={p} />
        ))}
        {PARTNERS.map((p) => (
          <LogoTile key={`2-${p.name}`} p={p} />
        ))}
      </div>
    </div>
  );
}

export default function Partners() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const lines = gsap.utils.toArray<HTMLElement>(".pt-line > span");

      if (reduce) {
        gsap.set(lines, { yPercent: 0 });
        return;
      }

      /* Naslov ulazi red po red, iza maske */
      gsap.fromTo(
        lines,
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 1.05,
          ease: "power4.out",
          stagger: 0.1,
          scrollTrigger: { trigger: ".pt-head", start: "top 80%" },
        }
      );

      /* Trake se dodatno razmicu dok skrolujes — beskonacna petlja je na
         .pt-track (CSS), a ovo je pomak na .pt-row, pa se ne tuku oko
         istog `transform`. */
      const drift = (sel: string, from: number, to: number) =>
        gsap.fromTo(
          sel,
          { x: from },
          {
            x: to,
            ease: "none",
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          }
        );

      drift(".pt-row--a", 110, -110);
      drift(".pt-row--b", -110, 110);
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="pt-section">
      <div className="pt-head">
        <span className="pt-eyebrow">(03) — Partners</span>
        <h2 className="pt-title">
          <span className="pt-line">
            <span>Who we</span>
          </span>
          <span className="pt-line">
            <span className="pt-green">work with</span>
          </span>
        </h2>
        <p className="pt-lead">
          Clubs, brands and agencies we build with — from matchday campaigns to
          full-season partnerships.
        </p>
      </div>

      <div className="pt-marquee">
        <Row dir="a" />
        <Row dir="b" />
      </div>

    </section>
  );
}
