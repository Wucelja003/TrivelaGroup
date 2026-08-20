import { useLayoutEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./DropHero.css";

gsap.registerPlugin(ScrollTrigger);

/*
 * Hero za Trivela Drop: prstenovi plocica sa slikama koji se okrecu oko
 * naslova.
 *
 * Predlozak radi isto preko @react-three/fiber + three sa SDF shaderima.
 * Ovde je na CSS transformacijama, iz dva razloga: r3f nam je vec jednom
 * oborio `tsc -b` (sudar JSX namespace-a), a three je ~600 kB za efekat koji
 * CSS ume — same rotacije, bez per-pixel racuna.
 *
 * Trik sa uspravnim slikama: prsten se okrece, pa bi se i slika okretala s
 * njim. Zato svaka plocica ima dva omotaca — jedan ponisti staticki ugao
 * postavljanja, drugi vrti istu animaciju unazad i ponisti rotaciju prstena.
 * Trajanja MORAJU biti ista, zato oba citaju --dur.
 */

const IMAGES = [
  "/hero/h-01.jpg",
  "/hero/h-02.jpg",
  "/hero/h-03.jpg",
  "/hero/h-04.jpg",
  "/hero/h-05.jpg",
  "/hero/h-06.jpg",
];

interface Ring {
  /* Poluprecnik u vmax, sa gornjom granicom u px da na sirokim ekranima
     prsten ne pobegne van vidnog polja */
  radius: string;
  duration: number;
  count: number;
  /* Pomak pocetnog ugla, da se plocice susednih prstenova ne poklope */
  phase: number;
  reverse?: boolean;
}

const RINGS: Ring[] = [
  { radius: "min(29vmax, 340px)", duration: 64, count: 5, phase: 0 },
  { radius: "min(44vmax, 530px)", duration: 96, count: 9, phase: 22, reverse: true },
  { radius: "min(60vmax, 730px)", duration: 132, count: 12, phase: 14 },
];

function Tile({
  src,
  angle,
  radius,
  duration,
  reverse,
  index,
}: {
  src: string;
  angle: number;
  radius: string;
  duration: number;
  reverse: boolean;
  index: number;
}) {
  return (
    <div
      className="dh-tile"
      style={
        {
          "--a": `${angle}deg`,
          "--r": radius,
        } as React.CSSProperties
      }
    >
      {/* ponisti staticki ugao postavljanja */}
      <div className="dh-tile-fix" style={{ "--a": `${angle}deg` } as React.CSSProperties}>
        {/* ponisti rotaciju prstena — ista duzina, suprotan smer */}
        <div
          className={`dh-tile-spin${reverse ? " dh-tile-spin--rev" : ""}`}
          style={{ "--dur": `${duration}s` } as React.CSSProperties}
        >
          <img
            src={src}
            alt=""
            aria-hidden="true"
            loading={index < 6 ? "eager" : "lazy"}
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}

export default function DropHero() {
  const rootRef = useRef<HTMLElement>(null);
  const lenis = useLenis();

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      /* Ulazak: polje se razvije, tekst dodje za njim */
      gsap.fromTo(
        ".dh-field",
        { autoAlpha: 0, scale: 0.9 },
        { autoAlpha: 1, scale: 1, duration: 1.4, ease: "power3.out" }
      );
      gsap.fromTo(
        ".dh-reveal",
        { autoAlpha: 0, y: 26 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
          delay: 0.25,
        }
      );

      /* Na skrol polje malo odlebdi. Ide na .dh-field-wrap, a NE na sam
         prsten — prsten vec ima CSS animaciju na `transform`. */
      gsap.to(".dh-field-wrap", {
        scale: 1.18,
        autoAlpha: 0.25,
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  /* Skrol mora da ide kroz Lenis. Nativni scrollIntoView ne radi kako treba
     dok Lenis vozi poziciju — ostaje `scrollTo` kao rezerva ako ga nema. */
  const toCustom = () => {
    const el = document.getElementById("custom-case");
    if (!el) return;
    if (lenis) {
      lenis.scrollTo(el, { duration: 1.1 });
      return;
    }
    window.scrollTo({ top: el.offsetTop, behavior: "smooth" });
  };

  return (
    <section ref={rootRef} className="dh-hero">
      <div className="dh-field-wrap" aria-hidden="true">
        <div className="dh-field">
          {RINGS.map((ring, ri) => (
            <div
              key={ri}
              className={`dh-ring${ring.reverse ? " dh-ring--rev" : ""}`}
              style={{ "--dur": `${ring.duration}s` } as React.CSSProperties}
            >
              {Array.from({ length: ring.count }).map((_, i) => (
                <Tile
                  key={i}
                  src={IMAGES[(ri * 2 + i) % IMAGES.length]}
                  angle={ring.phase + (360 / ring.count) * i}
                  radius={ring.radius}
                  duration={ring.duration}
                  reverse={!!ring.reverse}
                  index={ri * 10 + i}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="dh-content">
        <span className="dh-eyebrow dh-reveal">Trivela Drop</span>
        <h1 className="dh-title dh-reveal">
          Carry your
          <br />
          <span className="dh-title-accent">colors</span>
        </h1>
        <p className="dh-lead dh-reveal">
          Phone cases built around the players you actually watch. Limited runs,
          printed in Belgrade.
        </p>
        <div className="dh-actions dh-reveal">
          <button type="button" onClick={toCustom} className="dh-cta">
            Create your custom case
            <span aria-hidden="true">↓</span>
          </button>
        </div>
      </div>
    </section>
  );
}
