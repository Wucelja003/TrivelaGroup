import { useEffect, useRef } from "react";

/*
 * InstagramEmbeds — zvanicni Instagram embed-ovi (post/reel) u HORIZONTALNOJ
 * traci koja se lista (strelice / swipe / scroll), kao ostatak galerije.
 *
 * LAZY: embed se ucitava TEK kad kartica dodje blizu vidokruga (Instagram
 * gusi kad se povuce 10+ iframe-ova odjednom — zato se prva dva prikazu a
 * ostali ostanu beli). Ako embed ipak ne prodje (Safari "Prevent Cross-Site
 * Tracking", ad-blocker, mreza), umesto belog boksa ide tamna "View on
 * Instagram" kartica. Sadrzaj kartica gradimo imperativno (DOM), da React
 * re-render ne pregazi iframe koji je IG ubacio.
 */

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const IG_SCRIPT_SRC = "https://www.instagram.com/embed.js";
const IG_SCRIPT_ID = "instagram-embed-script";
const CARD = 340; // Instagram embed min-width je 326
const CHECK_MS = 6000; // koliko cekamo da se embed ucita pre fallback-a

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {dir === "left" ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  );
}

function buildPlaceholder(): HTMLElement {
  const d = document.createElement("div");
  d.dataset.role = "placeholder";
  d.style.cssText = [
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "width:100%",
    "height:520px",
    "border-radius:16px",
    "background:rgba(255,255,255,0.03)",
    "border:1px solid rgba(255,255,255,0.08)",
    "color:rgba(255,255,255,0.35)",
    "font-size:13px",
  ].join(";");
  d.textContent = "Loading…";
  return d;
}

function buildBlockquote(url: string): HTMLElement {
  const bq = document.createElement("blockquote");
  bq.className = "instagram-media";
  bq.setAttribute(
    "data-instgrm-permalink",
    `${url}?utm_source=ig_embed&utm_campaign=loading`
  );
  bq.setAttribute("data-instgrm-version", "14");
  bq.style.cssText = [
    "background:#FFF",
    "border:0",
    "border-radius:8px",
    "margin:0",
    `max-width:${CARD}px`,
    "min-width:326px",
    "min-height:420px",
    "width:100%",
  ].join(";");
  return bq;
}

function buildFallback(url: string): HTMLAnchorElement {
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noreferrer";
  a.style.cssText = [
    "display:flex",
    "flex-direction:column",
    "align-items:center",
    "justify-content:center",
    "gap:16px",
    "width:100%",
    "height:520px",
    "border-radius:16px",
    "background:linear-gradient(160deg,#12203f,#0a1428)",
    "border:1px solid rgba(255,255,255,0.1)",
    "color:#fff",
    "text-decoration:none",
    "text-align:center",
    "padding:24px",
  ].join(";");
  a.innerHTML = `
    <span style="display:flex;align-items:center;justify-content:center;height:64px;width:64px;border-radius:18px;background:rgba(150,255,0,0.12);border:1px solid rgba(150,255,0,0.35)">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#96ff00" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1.2" fill="#96ff00" stroke="none"/>
      </svg>
    </span>
    <span style="font-weight:700;font-size:16px">View this post on Instagram</span>
    <span style="opacity:.55;font-size:13px">Tap to open</span>`;
  return a;
}

export default function InstagramEmbeds({
  permalinks,
}: {
  permalinks: string[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const process = () => window.instgrm?.Embeds?.process();

    // Ucitaj IG skriptu jednom.
    let script = document.getElementById(
      IG_SCRIPT_ID
    ) as HTMLScriptElement | null;
    if (!window.instgrm?.Embeds) {
      if (!script) {
        script = document.createElement("script");
        script.id = IG_SCRIPT_ID;
        script.src = IG_SCRIPT_SRC;
        script.async = true;
        document.body.appendChild(script);
      }
      script.addEventListener("load", process);
    }

    // Pocetni placeholder u svakoj kartici.
    cardRefs.current.forEach((el) => {
      if (el && !el.firstChild) el.appendChild(buildPlaceholder());
    });

    const timers: number[] = [];

    const activate = (el: HTMLDivElement, url: string) => {
      if (el.dataset.state) return;
      el.dataset.state = "loading";
      el.replaceChildren(buildBlockquote(url));
      process();
      /* Provera PO KARTICI, CHECK_MS od NJENE aktivacije (ne fiksno od mount-a
         — inace bi kod mnogo kartica poslednje dobile fallback pre nego sto
         stignu da se ucitaju). Ako nema iframe ILI je ostao prazan (nizak),
         zameni tamnom "View on Instagram" karticom — nikad beli blok. Ucitan
         embed je uvek visok (>450px), pa se pravi embed ne dira. */
      timers.push(
        window.setTimeout(() => {
          if (el.dataset.state === "fallback") return;
          const iframe = el.querySelector("iframe");
          const h = iframe ? iframe.getBoundingClientRect().height : 0;
          if (!iframe || h < 450) {
            el.replaceChildren(buildFallback(url));
            el.dataset.state = "fallback";
          }
        }, CHECK_MS)
      );
    };

    /* LAZY na skrol: ucitava se samo ono sto je u vidokrugu trake (+ jedan
       ekran bafera). Sa mnogo postova (30+) Instagram gusi ako se svi povuku
       odjednom — ovako uvek radi jer nikad ne krene vise od par u isti mah.
       Dok listas (strelice / swipe / scroll) sledeci se aktiviraju. */
    const track = trackRef.current;
    const activateVisible = () => {
      if (!track) return;
      const trackLeft = track.getBoundingClientRect().left;
      const limit = track.clientWidth * 2; // vidokrug + ~1 ekran unapred
      cardRefs.current.forEach((el, idx) => {
        if (!el || el.dataset.state) return;
        const left = el.getBoundingClientRect().left - trackLeft;
        if (left <= limit) activate(el, permalinks[idx]);
      });
    };

    activateVisible();
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(activateVisible);
    };
    track?.addEventListener("scroll", onScroll, { passive: true });
    // Osigurac: jos jedan prolaz kad se layout smiri.
    timers.push(window.setTimeout(activateVisible, 400));

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      cancelAnimationFrame(raf);
      track?.removeEventListener("scroll", onScroll);
      script?.removeEventListener("load", process);
    };
  }, [permalinks]);

  const page = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div className="relative mx-auto max-w-7xl px-2 sm:px-6">
      <button
        type="button"
        onClick={() => page(-1)}
        aria-label="Previous"
        className="absolute left-1 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-zelena text-teget shadow-[0_8px_24px_rgba(150,255,0,0.28)] transition-transform duration-150 active:scale-90 sm:left-2 sm:h-12 sm:w-12"
      >
        <Chevron dir="left" />
      </button>
      <button
        type="button"
        onClick={() => page(1)}
        aria-label="Next"
        className="absolute right-1 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-zelena text-teget shadow-[0_8px_24px_rgba(150,255,0,0.28)] transition-transform duration-150 active:scale-90 sm:right-2 sm:h-12 sm:w-12"
      >
        <Chevron dir="right" />
      </button>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory items-start gap-5 overflow-x-auto scroll-smooth px-12 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {permalinks.map((url, i) => (
          <div
            key={url}
            data-idx={i}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="shrink-0 snap-center"
            style={{ width: CARD }}
          />
        ))}
      </div>
    </div>
  );
}
