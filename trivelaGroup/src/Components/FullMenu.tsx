import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import LiquidLines from "./LiquidLines";
import "./FullMenu.css";

/*
 * Hamburger koji otvara meni preko CELE strane, sa velikim slovima.
 *
 * Spoj dva pristupa:
 *  - lando.com: meni zauzima ceo ekran (100svh), stavke su velike verzalne
 *  - staggered menu: pre panela ulaze obojeni "prelayers" jedan za drugim,
 *    stavke se dizu odozdo uz blagu rotaciju, i imaju numeraciju
 *
 * Boje su nase: teget slojevi + zelena kao akcenat.
 */

const ITEMS = [
  { label: "Trivela Group", to: "/" },
  { label: "What we do", to: "/#what-we-do" },
  { label: "Who we are", to: "/" },
  { label: "Gallery", to: "/gallery" },
  { label: "Trivela Drop", to: "/drop" },
  { label: "Trivela Business", to: "/drop" },
  { label: "Get in Touch", to: "/getInTouch" },
];

const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/trivelagroup" },
  { label: "TikTok", href: "https://www.tiktok.com/@trivelagroup" },
];

/* Slojevi koji ulaze pre panela — od tamnijeg ka svetlijem */
const PRELAYERS = ["#04123a", "#0a2a1c"];

/* Kolaz uz stavke. Web verzije (720px, ~80 kB) — originali su 1–5 MB
   i ne smeju u meni koji stoji u DOM-u od ucitavanja strane. */
const MEDIA = [
  "/menu/menu-01.jpg",
  "/menu/menu-02.jpg",
  "/menu/menu-03.jpg",
  "/menu/menu-04.jpg",
];

export default function FullMenu({
  media = true,
  /* U grupi sa korpom dugme gubi svoj okvir — okvir nosi grupa */
  flat = false,
  /* Sakrij stavke za rute na kojima vec jesi */
  exclude,
}: {
  media?: boolean;
  flat?: boolean;
  exclude?: string[];
}) {
  const visibleItems = exclude?.length
    ? ITEMS.filter((it) => !exclude.includes(it.to))
    : ITEMS;
  const [open, setOpen] = useState(false);
  /* Slike i WebGL platno se prave tek kad zatreba — dok meni stoji zatvoren
     nema razloga da se skidaju ni da GPU radi. Okviri kolaza su ipak uvek u
     DOM-u, da ih GSAP nadje i na prvom otvaranju. */
  const [mediaReady, setMediaReady] = useState(false);
  const openRef = useRef(false);
  const busyRef = useRef(false);
  const lenis = useLenis();
  const navigate = useNavigate();

  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const preWrapRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const barTopRef = useRef<HTMLSpanElement>(null);
  const barBotRef = useRef<HTMLSpanElement>(null);

  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);

  /* Pocetno stanje: sve je van ekrana, iznad gornje ivice.
     Slojevi se traze preko preWrapRef, a NE selektorom u gsap.context —
     portal ih je izmestio na <body>, van rootRef-a, pa ih scoped selektor
     ne bi nasao i ostali bi vidljivi preko cele strane. */
  useLayoutEffect(() => {
    const layers = preWrapRef.current
      ? Array.from(preWrapRef.current.querySelectorAll<HTMLElement>(".fm-prelayer"))
      : [];
    const targets = [panelRef.current, ...layers].filter(Boolean);
    gsap.set(targets, { yPercent: -100 });
    gsap.set(iconRef.current, { rotate: 0, transformOrigin: "50% 50%" });
    gsap.set(barTopRef.current, { y: -5, rotate: 0, transformOrigin: "50% 50%" });
    gsap.set(barBotRef.current, { y: 5, rotate: 0, transformOrigin: "50% 50%" });
  }, []);

  const buildOpen = useCallback(() => {
    const panel = panelRef.current;
    const wrap = preWrapRef.current;
    if (!panel || !wrap) return null;

    openTlRef.current?.kill();
    closeTweenRef.current?.kill();

    const layers = Array.from(
      wrap.querySelectorAll<HTMLElement>(".fm-prelayer")
    );
    const labels = Array.from(
      panel.querySelectorAll<HTMLElement>(".fm-item-label")
    );
    const rows = Array.from(panel.querySelectorAll<HTMLElement>(".fm-item"));
    const meta = Array.from(panel.querySelectorAll<HTMLElement>(".fm-meta-row"));
    const media = Array.from(
      panel.querySelectorAll<HTMLElement>(".fm-media-item")
    );

    gsap.set(labels, { yPercent: 140, rotate: 8 });
    gsap.set(rows, { "--fm-num": 0 });
    gsap.set(meta, { y: 24, autoAlpha: 0 });
    gsap.set(media, { autoAlpha: 0, y: 46, scale: 0.94 });

    const tl = gsap.timeline({ paused: true });

    /* Slojevi ulaze jedan za drugim */
    layers.forEach((el, i) => {
      tl.fromTo(
        el,
        { yPercent: -100 },
        { yPercent: 0, duration: 0.55, ease: "power4.out" },
        i * 0.08
      );
    });

    const panelAt = layers.length * 0.08;
    tl.fromTo(
      panel,
      { yPercent: -100 },
      { yPercent: 0, duration: 0.7, ease: "power4.out" },
      panelAt
    );

    /* Velika slova se dizu iza maske */
    tl.to(
      labels,
      {
        yPercent: 0,
        rotate: 0,
        duration: 1,
        ease: "power4.out",
        stagger: 0.075,
      },
      panelAt + 0.12
    );

    /* Brojevi se pale za slovima */
    tl.to(
      rows,
      { "--fm-num": 1, duration: 0.5, ease: "power2.out", stagger: 0.06 },
      panelAt + 0.22
    );

    /* Kolaz ulazi uz slova, malo pomerena faza da ne krene sve u isti tren */
    tl.to(
      media,
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        ease: "power4.out",
        stagger: 0.09,
      },
      panelAt + 0.2
    );

    tl.to(
      meta,
      { y: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out", stagger: 0.06 },
      panelAt + 0.4
    );

    openTlRef.current = tl;
    return tl;
  }, []);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpen();
    if (!tl) {
      busyRef.current = false;
      return;
    }
    tl.eventCallback("onComplete", () => {
      busyRef.current = false;
    });
    tl.play(0);
  }, [buildOpen]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;
    const panel = panelRef.current;
    const wrap = preWrapRef.current;
    if (!panel || !wrap) return;

    const layers = Array.from(
      wrap.querySelectorAll<HTMLElement>(".fm-prelayer")
    );
    closeTweenRef.current?.kill();
    closeTweenRef.current = gsap.to([...layers, panel], {
      yPercent: -100,
      duration: 0.4,
      ease: "power3.in",
      overwrite: "auto",
      onComplete: () => {
        busyRef.current = false;
      },
    });
  }, []);

  /* Ceo znak se okrene za pola kruga, a linije se u hodu sklope u X.
     Donja kasni koji kadar, pa se cita kao makaze a ne kao jedan pokret. */
  const animateIcon = useCallback((opening: boolean) => {
    const icon = iconRef.current;
    const top = barTopRef.current;
    const bot = barBotRef.current;
    if (!icon || !top || !bot) return;

    gsap.killTweensOf([icon, top, bot]);

    gsap.to(icon, {
      rotate: opening ? 180 : 0,
      duration: 0.7,
      ease: "power4.inOut",
    });

    const dur = opening ? 0.6 : 0.45;
    const ease = opening ? "back.out(2.2)" : "power3.inOut";

    gsap.to(top, {
      y: opening ? 0 : -5,
      rotate: opening ? 45 : 0,
      duration: dur,
      ease,
    });
    gsap.to(bot, {
      y: opening ? 0 : 5,
      rotate: opening ? -45 : 0,
      duration: dur,
      ease,
      delay: 0.06,
    });
  }, []);

  const toggle = useCallback(() => {
    const next = !openRef.current;
    openRef.current = next;
    setOpen(next);
    if (next) setMediaReady(true);
    if (next) playOpen();
    else playClose();
    animateIcon(next);
  }, [playOpen, playClose, animateIcon]);

  const close = useCallback(() => {
    if (!openRef.current) return;
    openRef.current = false;
    setOpen(false);
    playClose();
    animateIcon(false);
  }, [playClose, animateIcon]);

  /* Zakljucaj skrol dok je meni otvoren + Escape zatvara */
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      html.style.overflow = prev;
      lenis?.start();
    };
  }, [open, lenis, close]);

  /* Navigacija tek kad se meni zatvori, da se ne vidi presek */
  const go = (to: string) => {
    close();
    window.setTimeout(() => navigate(to), 380);
  };

  return (
    <div ref={rootRef} className="fm-root">
      <button
        type="button"
        onClick={toggle}
        onPointerEnter={() => setMediaReady(true)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className={`fm-toggle${flat ? " fm-toggle--flat" : ""}`}
      >
        <span ref={iconRef} className="fm-icon" aria-hidden="true">
          <span ref={barTopRef} className="fm-bar fm-bar--top" />
          <span ref={barBotRef} className="fm-bar fm-bar--bot" />
        </span>
      </button>

      {/* Slojevi i panel idu PORTALOM na <body>.
          Razlog: roditelj u traci dobija GSAP transform (ulazna animacija),
          a transformisani predak postaje containing block za position:fixed —
          pa bi meni bio sabijen u kutiju dugmeta umesto preko cele strane. */}
      {createPortal(
        <>
      <div ref={preWrapRef} className="fm-prelayers" aria-hidden="true">
        {PRELAYERS.map((c) => (
          <div key={c} className="fm-prelayer" style={{ background: c }} />
        ))}
      </div>

      <div
        ref={panelRef}
        className="fm-panel"
        aria-hidden={!open}
        role="dialog"
        aria-label="Menu"
      >
        {/* Talasaste linije u pozadini panela — nase plave */}
        {mediaReady && (
          <LiquidLines
            className="fm-bg"
            active={open}
            speed={0.3}
            iterations={3}
            waveFrequency={60}
            depthStep={0.05}
            lineThickness={0.008}
            waveAmplitude={0.8}
            scale={0.46}
            brightness={1.9}
            contrast={1.1}
            opacity={0.85}
            lineColor="#3d74ff"
            backgroundColor="#020c2e"
          />
        )}
        {/* Veo preko linija — bez njega bela slova plivaju po saru */}
        <div className="fm-veil" aria-hidden="true" />

        <div className={`fm-body${media ? "" : " fm-body--solo"}`}>
          <ul className="fm-list">
            {visibleItems.map((it, i) => (
              <li key={it.label} className="fm-item" data-num={String(i + 1).padStart(2, "0")}>
                <span className="fm-item-mask">
                  <span className="fm-item-label">
                    <button type="button" onClick={() => go(it.to)} className="fm-item-btn">
                      {it.label}
                    </button>
                  </span>
                </span>
              </li>
            ))}
          </ul>

          {media && (
            <div className="fm-media" aria-hidden="true">
              {MEDIA.map((src) => (
                <div key={src} className="fm-media-item">
                  {mediaReady && (
                    <img src={src} alt="" loading="lazy" decoding="async" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="fm-foot">
          <span className="fm-meta-row">Belgrade, Serbia</span>
          <div className="fm-meta-row flex items-center gap-6">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="fm-social"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
        </>,
        document.body
      )}
    </div>
  );
}
