import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

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
/* Kartica ima FIKSNU visinu, istu kao placeholder i fallback (520px).
   Bez toga: placeholder je 520, a pravi IG embed se renderuje od ~430 do ~670 —
   pa svaka zamena placeholder -> embed pomeri celu stranu, a kad embed naraste
   iznad trake, traka postane i vertikalno skrolabilna i krade skrol prsta. */
const CARD_H = 520;
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
  d.dataset.i18n = "loading";
  d.textContent = i18n.t("common.loading");
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
  /* Ikonica je staticki markup; tekst ide kroz textContent (ne innerHTML) i
     nosi data-i18n, da ga efekat u komponenti osvezi pri promeni jezika. */
  a.innerHTML = `
    <span style="display:flex;align-items:center;justify-content:center;height:64px;width:64px;border-radius:18px;background:rgba(150,255,0,0.12);border:1px solid rgba(150,255,0,0.35)">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#96ff00" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1.2" fill="#96ff00" stroke="none"/>
      </svg>
    </span>`;
  const title = document.createElement("span");
  title.style.cssText = "font-weight:700;font-size:16px";
  title.dataset.i18n = "view";
  title.textContent = i18n.t("common.viewOnInstagram");
  const hint = document.createElement("span");
  hint.style.cssText = "opacity:.55;font-size:13px";
  hint.dataset.i18n = "tap";
  hint.textContent = i18n.t("common.tapToOpen");
  a.append(title, hint);
  return a;
}

export default function InstagramEmbeds({
  permalinks,
}: {
  permalinks: string[];
}) {
  const { t, i18n: inst } = useTranslation();
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* Placeholder i fallback kartice su imperativni DOM (van React-a), pa ih
     React ne prevodi sam. Na promenu jezika samo osvezi njihov tekst — BEZ
     remount-a, jer bi remount ponovo povukao sve Instagram iframe-ove. */
  useEffect(() => {
    const root = trackRef.current;
    if (!root) return;
    const set = (id: string, text: string) =>
      root
        .querySelectorAll<HTMLElement>(`[data-i18n="${id}"]`)
        .forEach((el) => {
          el.textContent = text;
        });
    set("loading", t("common.loading"));
    set("view", t("common.viewOnInstagram"));
    set("tap", t("common.tapToOpen"));
  }, [t, inst.resolvedLanguage]);

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
        aria-label={t("common.previous")}
        className="absolute left-1 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-zelena text-teget shadow-[0_8px_24px_rgba(150,255,0,0.28)] transition-transform duration-150 active:scale-90 sm:left-2 sm:flex sm:h-12 sm:w-12"
      >
        <Chevron dir="left" />
      </button>
      <button
        type="button"
        onClick={() => page(1)}
        aria-label={t("common.next")}
        className="absolute right-1 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-zelena text-teget shadow-[0_8px_24px_rgba(150,255,0,0.28)] transition-transform duration-150 active:scale-90 sm:right-2 sm:flex sm:h-12 sm:w-12"
      >
        <Chevron dir="right" />
      </button>

      <div
        ref={trackRef}
        /* overflow-y-hidden je vazno: sa samo overflow-x-auto, overflow-y
           izracuna se na "auto", pa traka moze i vertikalno da skroluje i na
           telefonu pojede skrol prsta. Padding je mali na telefonu (strelice su
           tamo sakrivene, prst svajpuje), a 48px na desktopu da oslobodi mesto
           strelicama. */
        className="flex snap-x snap-mandatory items-start gap-5 overflow-x-auto overflow-y-hidden scroll-smooth px-3 py-2 sm:px-12 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {permalinks.map((url, i) => (
          <div
            key={url}
            data-idx={i}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="shrink-0 snap-center overflow-hidden"
            style={{
              /* Na telefonu se skupi da stane u ekran (IG ne ide pod 326px),
                 na sirem ekranu ostaje 340. */
              width: `min(${CARD}px, calc(100vw - 1.5rem))`,
              height: CARD_H,
            }}
          />
        ))}
      </div>
    </div>
  );
}
