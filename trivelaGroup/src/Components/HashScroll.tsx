import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLenis } from "lenis/react";

/*
 * Skrol na "/#nesto".
 *
 * Mora kroz Lenis — nativni hash skrol i scrollIntoView ne prolaze dok on
 * vozi poziciju. Vezano je za `key` lokacije, a ne samo za hash, da radi i
 * kad se ista veza klikne dvaput zaredom.
 *
 * Element cesto jos ne postoji u trenutku promene rute (npr. dolazak sa
 * druge strane), pa se trazi kroz nekoliko pokusaja pre nego sto odustane.
 */
export default function HashScroll() {
  const { hash, key } = useLocation();
  const lenis = useLenis();

  useEffect(() => {
    if (!hash) return;
    let tries = 0;
    let timer = 0;

    const attempt = () => {
      const el = document.querySelector(hash);
      if (el) {
        if (lenis) lenis.scrollTo(el as HTMLElement, { duration: 1.1 });
        else (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
        return;
      }
      if (++tries < 20) timer = window.setTimeout(attempt, 80);
    };

    timer = window.setTimeout(attempt, 60);
    return () => window.clearTimeout(timer);
  }, [hash, key, lenis]);

  return null;
}
