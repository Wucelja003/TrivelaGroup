import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { markDone, onDone } from "../lib/sequence";
import HeroCorners from "../Components/HeroCorners";
import StaggeredText from "../Components/StaggeredText";
import Typewriter from "../Components/Typewriter";
import HeroVideo from "../Components/HeroVideo";
import RotatingCards from "../Components/RotatingCards";
import Introduce from "../Components/Introduce";
import WhoWeAre from "../Components/WhoWeAre";
import WhatWeDo from "../Components/WhatWeDo";
import SeeOurWork from "../Components/SeeOurWork";
import PlayersShowcase from "../Components/PlayersShowcase";
import Pricing from "../Components/Pricing";
import "./Home.css";

// Slike za rotirajući točak u hero-u — iz public/TrivelaHero
const heroImages = [
  "/TrivelaHero/IMG_3620.JPG",
  "/TrivelaHero/IMG_4181.JPG",
  "/TrivelaHero/IMG_4878.jpg",
  "/TrivelaHero/IMG_7923.JPG",
  "/TrivelaHero/IMG_8577.JPG",
  "/TrivelaHero/IMG_9469.JPG",
  "/TrivelaHero/IMG_9537.JPG",
  "/TrivelaHero/kostov-hapoel.jpg",
  "/TrivelaHero/petko_lagalaxy.jpg",
  "/TrivelaHero/whatsapp-1.jpeg",
];

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
            duration: 0.6,
            ease: "power2.out",
            delay: 0.5,
          },
        )
          .fromTo(
            ".hero-cards",
            { autoAlpha: 0, y: 70, scale: 0.97 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.9,
              ease: "power2.out",
            },
            "-=0.45",
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
     tocak/prst umesto da ide po tajmeru. Jeftin transform (scale/yPercent)
     na fiksiranoj podlozi — samo kompozitor, bez repaint-a. */
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
      {/* Pozadina cele strane, ne samo hero-a. Fiksirana je i JEDNE boje
          (teget) — nema promene tona po sekcijama (to je pravilo lag) niti
          WebGL shadera; ostaje samo suptilno "disanje" i skrol-parallax. */}
      <div className="site-bg" aria-hidden="true">
        <HeroVideo />
      </div>

      <section className="hero" ref={heroRef}>

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
              speed={28}
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

      <Introduce />
      <WhoWeAre />
      <WhatWeDo />
      <PlayersShowcase />
      <Pricing />
      <SeeOurWork />
    </>
  );
}
