import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { markDone, onDone } from "../lib/sequence";
import HeroCorners from "../Components/HeroCorners";
import SectionThemes from "../Components/SectionThemes";
import StaggeredText from "../Components/StaggeredText";
import Typewriter from "../Components/Typewriter";
import HeroVideo from "../Components/HeroVideo";
import RotatingCards from "../Components/RotatingCards";
import Introduce from "../Components/Introduce";
import WhoWeAre from "../Components/WhoWeAre";
import WhatWeDo from "../Components/WhatWeDo";
import SeeOurWork from "../Components/SeeOurWork";
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
  /* Subtitle se kuca "kao rukom" TEK kad se ostali hero elementi pojave
     (naslov, tagline, dugme, kartice) — signal je markDone("hero"). */
  const [subtitleStart, setSubtitleStart] = useState(false);

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

  useEffect(() => {
    const off = onDone("hero", () => setSubtitleStart(true));
    /* Osigurac: kucanje mora da krene i ako sekvenca zapne */
    const safety = window.setTimeout(() => setSubtitleStart(true), 9000);
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
      const targets = [".hero-actions", ".hero-cards"];

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

        /* Naslov, tagline i subtitle vode StaggeredText (ispisuju se rec po
           rec) — ovde ostaju samo dugme i kartice, posle njih. */
        tl.fromTo(
          ".hero-actions",
          { autoAlpha: 0, y: 24, scale: 0.97, filter: "blur(8px)" },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 1,
            ease: "power2.out",
            delay: 1.6,
          },
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
            delay={26}
            duration={0.5}
            enabled={heroIn}
          />
          <StaggeredText
            as="p"
            text="Crafting iconic athlete brands."
            className="hero-tagline"
            segmentBy="words"
            direction="top"
            blur
            delay={40}
            duration={0.5}
            startDelay={0.32}
            enabled={heroIn}
          />
          <div className="hero-subtitle">
            <Typewriter
              text="Exclusive boutique agency for world-class players: elite vision, timeless legacy & unstoppable passion."
              start={subtitleStart}
              speed={42}
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
       <div data-theme="blue">
        <PlayersShowcase />
      </div>
      <div data-theme="deep">
        <SeeOurWork />
      </div>
     
    </>
  );
}
