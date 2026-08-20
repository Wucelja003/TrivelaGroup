import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { markDone, onDone } from "../lib/sequence";
import HeroCorners from "../Components/HeroCorners";
import SectionThemes from "../Components/SectionThemes";
import StaggeredText from "../Components/StaggeredText";
import TextType from "../Components/TextType";
import HeroVideo from "../Components/HeroVideo";
import RotatingCards from "../Components/RotatingCards";
import Introduce from "../Components/Introduce";
import WhoWeAre from "../Components/WhoWeAre";
import WhatWeDo from "../Components/WhatWeDo";
import Partners from "../Components/Partners";
import PlayersShowcase from "../Components/PlayersShowcase";
import { galleryPhotos } from "../data/galleryPhotos";
import "./Home.css";

// Izbor matchday postera za rotirajući točak (svaki 3. za raznovrsnost)
const heroImages = galleryPhotos
  .filter((_, i) => i % 3 === 0)
  .slice(0, 12)
  .map((p) => p.src);

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  /* Tekst (naslov, tagline) ide preko StaggeredText-a i ceka intro zavesu */
  const [heroIn, setHeroIn] = useState(false);

  useEffect(() => {
    const off = onDone("intro", () => setHeroIn(true));
    /* Osigurac: ako intro nikad ne javi da je gotov, tekst svejedno mora da
       se pojavi — nikad ne ostavljaj sadrzaj zavisan od animacije. */
    const safety = window.setTimeout(() => setHeroIn(true), 7000);
    return () => {
      off();
      window.clearTimeout(safety);
    };
  }, []);

  /* Ostali hero elementi ulaze jedan po jedan — takodje tek kad zavesa spadne.
     Ranije je ovo bila CSS animacija koja se vrtela odmah po mount-u, dakle
     iza introa, pa je niko nije video. */
  useLayoutEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      const targets = [".hero-subtitle", ".hero-actions", ".hero-cards"];

      if (reduce) {
        markDone("hero");
        return;
      }

      // Sakrij pre prvog paint-a (useLayoutEffect) da nema bleska.
      // Ako GSAP nikad ne krene, sve ostaje nevidljivo — zato dole stoji
      // sigurnosni timeout koji svakako otkrije sadrzaj.
      gsap.set(targets, { autoAlpha: 0 });

      let tl: gsap.core.Timeline | null = null;

      const play = () => {
        tl = gsap.timeline({ onComplete: () => markDone("hero") });

        /* Naslov i tagline vodi StaggeredText — ovo krece posle njih.
           Duze trajanje + mekši ease da prelaz bude gladak. */
        tl.fromTo(
          ".hero-subtitle",
          { autoAlpha: 0, y: 20, filter: "blur(8px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power2.out",
            delay: 0.95,
          },
        )
          .fromTo(
            ".hero-actions",
            { autoAlpha: 0, y: 24, scale: 0.97, filter: "blur(8px)" },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: 1,
              ease: "power2.out",
            },
            "-=0.55",
          )
          .fromTo(
            ".hero-cards",
            { autoAlpha: 0, y: 70, scale: 0.97 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 1.4,
              ease: "power2.out",
            },
            "-=0.7",
          );
      };

      const off = onDone("intro", play);

      /* Sigurnosni izlaz — nikad ne ostavljaj sadrzaj nevidljiv.
         Ako je animacija vec krenula, DOVRSI je (progress(1)) umesto da je
         pregazis: gsap.set usred leta bi napravio vidljiv skok. */
      const safety = window.setTimeout(() => {
        off();
        if (tl) {
          tl.progress(1); // okida onComplete -> markDone("hero")
        } else {
          gsap.set(targets, { autoAlpha: 1, y: 0, scale: 1, filter: "none" });
          markDone("hero");
        }
      }, 9000);

      return () => {
        off();
        window.clearTimeout(safety);
      };
    }, heroRef);

    return () => ctx.revert();
  }, []);

  /* Pozadina "pliva" i sa skrolom: vezano za poziciju (scrub), pa prati
     tocak/prst umesto da ide po tajmeru. Radi zajedno sa sopstvenom
     animacijom shadera — jedno je stalno kretanje, drugo reakcija na skrol. */
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.to(".site-bg", {
        scale: 1.18,
        yPercent: -6,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* Pozadina cele strane, ne samo hero-a. Fiksirana je, pa svaka sekcija
          stoji na istoj zivoj podlozi — nema granice na kojoj bi se videla
          razlika izmedju "hero ima animaciju" i "ostalo je ravno teget". */}
      <div className="site-bg" aria-hidden="true">
        <HeroVideo />
      </div>

      <SectionThemes />

      <section className="hero" ref={heroRef} data-theme="hero">

        <div className="hero-content">
          <StaggeredText
            as="h1"
            text="Trivela Group"
            className="hero-title"
            segmentBy="chars"
            direction="top"
            blur
            delay={45}
            duration={0.85}
            enabled={heroIn}
          />
          <StaggeredText
            as="p"
            text="Crafting icons athlete brands"
            className="hero-tagline"
            segmentBy="words"
            direction="top"
            blur
            delay={70}
            duration={0.75}
            startDelay={0.55}
            enabled={heroIn}
          />
          <div className="hero-subtitle">
            <TextType
              as="span"
              text={[
                "Marketing that sticks — turning fans into believers.",
                "PR that opens doors and keeps them wide open.",
                "Consulting that makes a real difference off the pitch.",
                "Cases with your favorite footballers, made to carry.",
              ]}
              typingSpeed={55}
              deletingSpeed={28}
              pauseDuration={2000}
              cursorCharacter="|"
            />
          </div>

          <div className="hero-actions">
            <Link to="/getInTouch" className="hero-cta">
              <span className="hero-cta-label">Start working with us</span>
              <span className="hero-cta-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>

        <HeroCorners />

        <div className="hero-cards">
          <div className="hero-cards-inner">
            <RotatingCards
              images={heroImages}
              radius={900}
              cardWidth={198}
              cardHeight={352}
              duration={90}
              initialRotation={-90}
              showTrackLine
            />
          </div>
        </div>
      </section>

      {/* data-theme cita SectionThemes i menja ton fiksirane pozadine */}
      <div data-theme="blue">
        <Introduce />
      </div>
      <div data-theme="blue">
        <WhoWeAre />
      </div>
      <div data-theme="green">
        <WhatWeDo />
      </div>
      <div data-theme="deep">
        <Partners />
      </div>
      <div data-theme="blue">
        <PlayersShowcase />
      </div>
    </>
  );
}
