import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { markDone, resetSequence } from "../lib/sequence";
import "./Intro.css";

const WORD = "TRIVELA GROUP";
const SPACE_INDEX = WORD.indexOf(" ");

export default function Intro() {
  const [done, setDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    /* Nova poseta landingu — hero i dugmad ponovo cekaju svoj red.
       Ovo se izvrsava pre Home-ovog effect-a (App renderuje SiteIntro pre
       Routes), pa Home stigne da se pretplati. */
    resetSequence();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    // Otkljucaj skrol na kraju — NE samo u cleanup-u: komponenta posle
    // done ostaje montirana (renderuje null), pa se cleanup ne bi pozvao.
    const unlock = () => {
      html.style.overflow = prevOverflow;
    };
    const finish = () => {
      unlock();
      setDone(true);
      markDone("intro"); // pusta hero sekvencu
    };

    if (reduce) {
      const t = window.setTimeout(finish, 500);
      return () => {
        window.clearTimeout(t);
        unlock();
      };
    }

    // fromTo sa eksplicitnim krajem — StrictMode dev-double-invoke bi kod
    // gsap.from procitao "trenutno" stanje (vec 0) kao cilj i ostavio slova
    // nevidljiva. Eksplicitni "to" to sprecava.
    const tl = gsap.timeline({ onComplete: finish });
    tl.fromTo(
      logoRef.current,
      { scale: 0.8, autoAlpha: 0 },
      { scale: 1, autoAlpha: 1, duration: 0.55, ease: "power3.out" }
    )
      .fromTo(
        lettersRef.current,
        { yPercent: 80, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          stagger: 0.04,
          duration: 0.4,
          ease: "power3.out",
        },
        "-=0.15"
      )
      .fromTo(
        lineRef.current,
        { scaleX: 0, autoAlpha: 0 },
        { scaleX: 1, autoAlpha: 1, duration: 0.45, ease: "power2.out" },
        "-=0.1"
      )
      .to(
        rootRef.current,
        { yPercent: -100, duration: 0.7, ease: "power4.inOut" },
        "+=0.45"
      );

    /* Sigurnosni izlaz: ako rAF stane (npr. preview alat) ili GSAP zakaze,
       onComplete se nikad ne okine — pa intro mora sam da se skloni. */
    const fallback = window.setTimeout(finish, 3800);

    return () => {
      window.clearTimeout(fallback);
      tl.kill();
      unlock();
    };
  }, []);

  if (done) return null;

  return (
    <div ref={rootRef} className="intro" role="presentation" aria-hidden="true">
      <div className="intro-inner">
        <img
          ref={logoRef}
          src="/Trivela_Logo.svg"
          alt=""
          className="intro-logo"
        />
        <div className="intro-word">
          {WORD.split("").map((ch, i) => (
            <span
              key={i}
              ref={(el) => {
                lettersRef.current[i] = el;
              }}
              className={`intro-letter ${
                i > SPACE_INDEX ? "intro-letter--accent" : ""
              }`}
            >
              {ch === " " ? " " : ch}
            </span>
          ))}
        </div>
        <div ref={lineRef} className="intro-line" />
      </div>
    </div>
  );
}
