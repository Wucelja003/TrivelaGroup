import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { onDone } from "../lib/sequence";
import { useCart } from "../context/CartContext";
import FullMenu from "./FullMenu";
import "./LandingNav.css";
import "./CartDrawer.css";

/*
 * Gornja traka: logo levo, dva dugmeta na sredini, korpa + meni desno.
 *
 * Na landingu ulazi poslednja u sekvenci (intro -> hero -> traka).
 *
 * Drugo dugme vodi tamo gde NISI: sa landinga na Trivela Drop, a sa Drop
 * strane nazad na Trivela Group. Za Trivela Business ruta jos nije
 * dogovorena, pa ostaje dugme bez akcije.
 */
type NavItem = {
  label: string;
  variant: "business" | "drop" | "group";
  to: string | null;
};

const buildItems = (backToGroup: boolean): NavItem[] => [
  { label: "Trivela Business", variant: "business", to: null },
  backToGroup
    ? /* Nosi zelenu Trivela Group — boju odredista na koje vraca */
      { label: "Trivela Group", variant: "group", to: "/" }
    : { label: "Trivela Drop", variant: "drop", to: "/drop" },
];

/* Korpa iz starog headera — bez nje se sa Drop strane ne bi moglo do nje.
   Kad je u grupi sa menijem, gubi svoj okvir; okvir nosi sama grupa. */
function CartButton() {
  const cart = useCart();
  const bumped = cart.bumpKey > 0;
  return (
    <button
      type="button"
      onClick={cart.open}
      aria-label={`Cart (${cart.count} items)`}
      className="tg-seg tg-seg--cart"
    >
      {bumped && (
        <span
          key={`ping-${cart.bumpKey}`}
          className="cart-ping pointer-events-none absolute inset-0 rounded-full border-2 border-ledena"
        />
      )}
      <span
        key={`icon-${cart.bumpKey}`}
        className={bumped ? "cart-icon-bump inline-flex" : "inline-flex"}
      >
        {/* Torba umesto kolica — manje linija, pa ostaje citka na 20px */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[22px] w-[22px]"
        >
          <path d="M5.6 8h12.8l1 11.2a1.6 1.6 0 0 1-1.6 1.8H6.2a1.6 1.6 0 0 1-1.6-1.8L5.6 8Z" />
          <path d="M9 10.4V6.9a3 3 0 0 1 6 0v3.5" />
        </svg>
      </span>
      {cart.count > 0 && (
        <span key={cart.count} className="cart-badge tg-cart-badge">
          {cart.count > 99 ? "99+" : cart.count}
        </span>
      )}
    </button>
  );
}

interface Props {
  /* Na landingu traka ceka sekvencu (intro -> hero -> traka). Na ostalim
     stranama te sekvence nema, pa bi `onDone("hero")` cutao do sigurnosnog
     tajmera i traka bi 11s stajala nevidljiva — zato ulazi odmah. */
  immediate?: boolean;
  /* Korpa je obavezna na prodavnici; na landingu nema sta da radi. */
  cart?: boolean;
  /* Kolaz slika u meniju — na landingu da, drugde ne mora. */
  menuMedia?: boolean;
  /* Svetla tema: bela podloga ispod trake (Trivela Drop) */
  light?: boolean;
  /* Na Drop strani drugo dugme vodi NAZAD na Trivela Group */
  backToGroup?: boolean;
  /* Rute koje se skrivaju iz menija — npr. strana na kojoj vec jesi */
  menuExclude?: string[];
  /* Hamburger meni. Na Drop strani ga nema — ostaje samo korpa. */
  menu?: boolean;
}

export default function LandingNav({
  immediate = false,
  cart = false,
  menuMedia = true,
  light = false,
  backToGroup = false,
  menuExclude,
  menu = true,
}: Props) {
  const items = buildItems(backToGroup);
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      const targets = "[data-nav-item]";
      gsap.set(targets, { autoAlpha: 0 });

      let tw: gsap.core.Tween | null = null;

      const play = () => {
        tw = gsap.fromTo(
          targets,
          { autoAlpha: 0, y: -30, scale: 0.9, filter: "blur(10px)" },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.75,
            stagger: 0.12,
            ease: "back.out(1.6)",
          }
        );
      };

      if (immediate) {
        play();
        return;
      }

      const off = onDone("hero", play);

      /* Nikad ne ostavljaj traku nevidljivu ako sekvenca zapne.
         Zapocetu animaciju dovrsi, ne pregazi je. */
      const safety = window.setTimeout(() => {
        off();
        if (tw) tw.progress(1);
        else
          gsap.set(targets, { autoAlpha: 1, y: 0, scale: 1, filter: "none" });
      }, 11000);

      return () => {
        off();
        window.clearTimeout(safety);
      };
    }, rootRef);

    return () => ctx.revert();
  }, [immediate]);

  return (
    <nav
      ref={rootRef}
      aria-label="Trivela"
      className={`pointer-events-none fixed inset-x-0 top-3 z-50 px-5 sm:top-4 sm:px-8${
        light ? " tg-nav--light" : ""
      }`}
    >
      <div className="relative flex items-center justify-between">
        {/* Logo — levo, veliki */}
        <Link
          to="/"
          data-nav-item
          className="pointer-events-auto flex shrink-0 items-center"
        >
          <img
            src="/Logo_Trivela-2.svg"
            alt="Trivela Group"
            className={`h-24 w-auto sm:h-32 ${
              light
                ? ""
                : "[filter:drop-shadow(0_0_22px_rgba(150,255,0,0.45))]"
            }`}
          />
        </Link>

        {/* Dva dugmeta — tacno na sredini ekrana */}
        <div
          className="pointer-events-auto absolute left-1/2 flex -translate-x-1/2 items-center gap-3 sm:gap-4"
        >
          {items.map((it) => {
            const cls = `tg-btn tg-btn--${it.variant} rounded-full px-5 py-3 text-[11px] font-bold uppercase tracking-[2px] sm:px-7 sm:py-3.5 sm:text-[12px]`;
            return it.to ? (
              <Link key={it.variant} data-nav-item to={it.to} className={cls}>
                <span>{it.label}</span>
              </Link>
            ) : (
              <button key={it.variant} data-nav-item type="button" className={cls}>
                <span>{it.label}</span>
              </button>
            );
          })}
        </div>

        {/* Desno: korpa i meni u JEDNOJ piluli — okvir nosi grupa, a polovine
            ostaju dva dugmeta jer imaju dve razlicite akcije. */}
        <div data-nav-item className="pointer-events-auto shrink-0">
          <div
            className={`tg-cluster${cart && menu ? "" : " tg-cluster--solo"}`}
          >
            {cart && <CartButton />}
            {cart && menu && (
              <span className="tg-cluster-div" aria-hidden="true" />
            )}
            {menu && (
              <FullMenu
                media={menuMedia}
                flat={cart}
                exclude={menuExclude}
              />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
