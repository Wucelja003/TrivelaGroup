import { useEffect, useRef, useState } from "react";

/*
 * ReelStrip — reels (video) se listaju kao i galerija slika, samo su video.
 * Horizontalna traka (strelice / swipe / scroll), svaki reel u PRIRODNOJ
 * velicini (visina reda fiksna, sirina prati aspekt — 9:16 ili landscape).
 * U vidokrugu se pušta muted+loop (kao reel preview); dugme uključuje zvuk
 * (uključi jedan -> ostali se uauto-mute-uju). Bez hover animacije.
 */
export interface ReelItem {
  src: string;
  title?: string;
}

const GAP = 20;

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

export default function ReelStrip({ items }: { items: ReelItem[] }) {
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
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-12 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ height: "clamp(420px, 70vh, 640px)" }}
      >
        {items.map((it, i) => {
          const soundOn = unmuted === it.src;
          return (
            <figure
              key={it.src}
              className="relative h-full shrink-0 snap-center overflow-hidden rounded-2xl border border-white/10 bg-black"
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
                onClick={() => toggleSound(it.src, i)}
                aria-label={soundOn ? "Mute" : "Unmute"}
                className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-md transition-colors duration-200 hover:border-zelena hover:text-zelena"
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
            </figure>
          );
        })}
      </div>
    </div>
  );
}
