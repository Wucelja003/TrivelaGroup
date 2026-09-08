import { useEffect, useRef } from "react";

/*
 * InstagramEmbeds — zvanicni Instagram embed-ovi (post/reel) u HORIZONTALNOJ
 * traci koja se lista (strelice / swipe / scroll), isto kao ostatak galerije,
 * a ne jedan ispod drugog. Svaki blockquote Instagram-ov embed.js zameni
 * iframe-om; skripta se ucitava jednom, process() se pozove kad su u DOM-u.
 */

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const IG_SCRIPT_SRC = "https://www.instagram.com/embed.js";
const IG_SCRIPT_ID = "instagram-embed-script";
const CARD = 340; // px — Instagram embed min-width je 326

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

export default function InstagramEmbeds({
  permalinks,
}: {
  permalinks: string[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const process = () => window.instgrm?.Embeds?.process();

    if (window.instgrm?.Embeds) {
      process();
      return;
    }

    let script = document.getElementById(
      IG_SCRIPT_ID
    ) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = IG_SCRIPT_ID;
      script.src = IG_SCRIPT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
    script.addEventListener("load", process);

    // Osigurac ako je skripta vec u kesu (bez novog "load" dogadjaja).
    const poll = window.setInterval(() => {
      if (window.instgrm?.Embeds) {
        window.clearInterval(poll);
        process();
      }
    }, 300);
    const stop = window.setTimeout(() => window.clearInterval(poll), 8000);

    return () => {
      script?.removeEventListener("load", process);
      window.clearInterval(poll);
      window.clearTimeout(stop);
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
        {permalinks.map((url) => (
          <div
            key={url}
            className="shrink-0 snap-center"
            style={{ width: CARD }}
          >
            <blockquote
              className="instagram-media"
              data-instgrm-permalink={`${url}?utm_source=ig_embed&utm_campaign=loading`}
              data-instgrm-version="14"
              style={{
                background: "#FFF",
                border: 0,
                borderRadius: 8,
                margin: 0,
                maxWidth: CARD,
                minWidth: 326,
                minHeight: 420,
                width: "100%",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
