import { useEffect } from "react";

/*
 * InstagramEmbeds — renderuje zvanicne Instagram embed-ove (post/reel).
 * Svaki embed je <blockquote class="instagram-media" data-instgrm-permalink=...>,
 * a Instagram-ov embed.js ga zameni pravim iframe-om. Skripta se ucitava jednom;
 * process() se pozove kad su blockquote-ovi u DOM-u (i pri promeni liste).
 */

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const IG_SCRIPT_SRC = "https://www.instagram.com/embed.js";
const IG_SCRIPT_ID = "instagram-embed-script";

export default function InstagramEmbeds({
  permalinks,
}: {
  permalinks: string[];
}) {
  useEffect(() => {
    const process = () => window.instgrm?.Embeds?.process();

    if (window.instgrm?.Embeds) {
      process();
      return;
    }

    // Skripta jos nije ucitana — dodaj je jednom, pa procesiraj na load.
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

    // Osigurac: ako je skripta vec bila u kesu (bez novog "load" dogadjaja),
    // kratko proveravaj dok instgrm ne postane dostupan.
    const poll = window.setInterval(() => {
      if (window.instgrm?.Embeds) {
        window.clearInterval(poll);
        process();
      }
    }, 300);
    const stop = window.setTimeout(() => window.clearInterval(poll), 6000);

    return () => {
      script?.removeEventListener("load", process);
      window.clearInterval(poll);
      window.clearTimeout(stop);
    };
  }, [permalinks]);

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 justify-items-center gap-6 px-4 sm:px-6 md:grid-cols-2">
      {permalinks.map((url) => (
        <blockquote
          key={url}
          className="instagram-media w-full"
          data-instgrm-permalink={`${url}?utm_source=ig_embed&utm_campaign=loading`}
          data-instgrm-version="14"
          style={{
            background: "#FFF",
            border: 0,
            borderRadius: 8,
            margin: 0,
            maxWidth: 540,
            minHeight: 420,
            width: "100%",
          }}
        />
      ))}
    </div>
  );
}
