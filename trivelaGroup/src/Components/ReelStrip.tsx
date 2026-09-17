import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/*
 * ReelStrip — reels (video) se listaju kao i galerija slika, samo su video.
 * Horizontalna traka (strelice / swipe / scroll), svaki reel u PRIRODNOJ
 * velicini (visina reda fiksna, sirina prati aspekt — 9:16 ili landscape).
 * U vidokrugu se pušta muted+loop (kao reel preview); dugme uključuje zvuk
 * (uključi jedan -> ostali se uauto-mute-uju). Bez hover animacije.
 */
export interface ReelItem {
  src: string;
  /* Ako je zadat, ispisuje se ISPOD videa (npr. "Restoran Savić"). */
  title?: string;
}

/* Akcenat trake: Group/Drop su zeleni, Trivela Business je zlatna. */
type Accent = "green" | "gold";

const ACCENT: Record<Accent, { arrow: string; soundHover: string }> = {
  green: {
    arrow:
      "bg-zelena text-teget shadow-[0_8px_24px_rgba(150,255,0,0.28)]",
    soundHover: "hover:border-zelena hover:text-zelena",
  },
  gold: {
    arrow:
      "bg-[#d4af37] text-[#1a1408] shadow-[0_8px_24px_rgba(212,175,55,0.3)]",
    soundHover: "hover:border-[#d4af37] hover:text-[#d4af37]",
  },
};

const GAP = 20;

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

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

export default function ReelStrip({
  items,
  accent = "green",
  zoom = false,
}: {
  items: ReelItem[];
  accent?: Accent;
  /* Klik na klip ga izbacuje u prvi plan (uvecan, preko zamracene podloge).
     Opciono — Gallery ga ne koristi, pa tamo klik ostaje bez efekta. */
  zoom?: boolean;
}) {
  const { t } = useTranslation();
  const acc = ACCENT[accent];
  const reduce = useReducedMotion();
  const [focused, setFocused] = useState<ReelItem | null>(null);

  /* Esc zatvara uvecani prikaz. */
  useEffect(() => {
    if (!focused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFocused(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focused]);
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [unmuted, setUnmuted] = useState<string | null>(null);

  /* Puštaj samo reels koji su u vidokrugu trake; ostale pauziraj (performanse
     + osecaj reels-a). preload=metadata drži pocetno ucitavanje lakim. */
  useEffect(() => {
    const root = trackRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }
      },
      { root, threshold: 0.55 }
    );
    videoRefs.current.forEach((v) => v && io.observe(v));
    return () => io.disconnect();
  }, [items]);

  const page = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.7 + GAP), behavior: "smooth" });
  };

  const toggleSound = (src: string, i: number) => {
    const v = videoRefs.current[i];
    if (!v) return;
    const willUnmute = unmuted !== src;
    // Samo jedan reel svira zvuk — ostale utišaj.
    videoRefs.current.forEach((vid) => {
      if (vid) vid.muted = true;
    });
    if (willUnmute) {
      v.muted = false;
      v.play().catch(() => {});
      setUnmuted(src);
    } else {
      setUnmuted(null);
    }
  };

  return (
    <div className="relative mx-auto max-w-7xl px-2 sm:px-6">
      <button
        type="button"
        onClick={() => page(-1)}
        aria-label={t("common.previous")}
        className={`absolute left-1 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full ${acc.arrow} transition-transform duration-150 active:scale-90 sm:left-2 sm:h-12 sm:w-12`}
      >
        <Chevron dir="left" />
      </button>
      <button
        type="button"
        onClick={() => page(1)}
        aria-label={t("common.next")}
        className={`absolute right-1 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full ${acc.arrow} transition-transform duration-150 active:scale-90 sm:right-2 sm:h-12 sm:w-12`}
      >
        <Chevron dir="right" />
      </button>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-12 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ height: "clamp(420px, 70vh, 640px)" }}
      >
        {items.map((it, i) => {
          const soundOn = unmuted === it.src;
          return (
            <figure key={it.src} className="h-full shrink-0 snap-center">
              {/* Visina okvira MORA biti definitivna (ne flex-1): video je
                  h-full w-auto, pa mu iz visine sledi sirina, a iz nje sirina
                  kartice. Sa flex-1 video nije dobijao definitivnu visinu i
                  padao je na prirodnih 720px sirine — pa se vertikalno secao.
                  Kad nema naziva, okvir uzima punu visinu (Gallery ostaje isti). */}
              <div
                onClick={zoom ? () => setFocused(it) : undefined}
                role={zoom ? "button" : undefined}
                tabIndex={zoom ? 0 : undefined}
                aria-label={
                  zoom
                    ? t("common.openClip", { name: it.title ?? t("common.clip") })
                    : undefined
                }
                onKeyDown={
                  zoom
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setFocused(it);
                        }
                      }
                    : undefined
                }
                className={`relative overflow-hidden rounded-2xl border border-white/10 bg-black ${
                  it.title ? "h-[calc(100%-2.75rem)]" : "h-full"
                } ${
                  zoom
                    ? "cursor-zoom-in transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    : ""
                }`}
              >
                <video
                  ref={(el) => {
                    videoRefs.current[i] = el;
                  }}
                  src={it.src}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="h-full w-auto"
                />
                {/* Zvuk on/off — reels startuju muted (autoplay pravilo) */}
                <button
                  type="button"
                  onClick={(e) => {
                    /* Da klik na zvuk ne otvori uvecani prikaz. */
                    e.stopPropagation();
                    toggleSound(it.src, i);
                  }}
                  aria-label={soundOn ? t("common.mute") : t("common.unmute")}
                  className={`absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-md transition-colors duration-200 ${acc.soundHover}`}
                >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M11 5 6 9H2v6h4l5 4V5z" />
                  {soundOn ? (
                    <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" />
                  ) : (
                    <path d="m22 9-6 6M16 9l6 6" />
                  )}
                  </svg>
                </button>
              </div>

              {/* Naziv grupe/klijenta ispod klipa */}
              {it.title && (
                <figcaption className="mt-3 truncate px-1 text-center text-[12px] font-semibold uppercase tracking-[0.16em] text-white/60">
                  {it.title}
                </figcaption>
              )}
            </figure>
          );
        })}
      </div>

      {/* ===== Uvecani prikaz: klik na klip ga izbaci u prvi plan =====
          Otvara se korisnickim klikom, pa sme da krene SA zvukom; ako browser
          to ipak odbije, pada na muted i svejedno pusta. */}
      <AnimatePresence>
        {focused && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.25 }}
            onClick={() => setFocused(null)}
            role="dialog"
            aria-modal="true"
            aria-label={focused.title ?? t("common.clip")}
          >
            <motion.figure
              className="relative flex max-h-full flex-col items-center"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
              transition={{ duration: reduce ? 0 : 0.34, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
            >
              <video
                key={focused.src}
                ref={(el) => {
                  if (!el) return;
                  el.muted = false;
                  el.play().catch(() => {
                    el.muted = true;
                    el.play().catch(() => {});
                  });
                }}
                src={focused.src}
                loop
                playsInline
                controls
                className="max-h-[78vh] w-auto rounded-2xl border border-white/15 bg-black shadow-[0_30px_80px_rgba(0,0,0,0.7)]"
              />
              {focused.title && (
                <figcaption className="mt-4 text-center text-[13px] font-semibold uppercase tracking-[0.18em] text-white/75">
                  {focused.title}
                </figcaption>
              )}
            </motion.figure>

            <button
              type="button"
              onClick={() => setFocused(null)}
              aria-label={t("common.close")}
              className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-colors duration-200 sm:right-6 sm:top-6 ${acc.soundHover}`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                className="h-5 w-5"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
