import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLenis } from "lenis/react";

/*
 * Svaka nova ruta krece od vrha.
 *
 * Bez ovoga React Router zadrzi poziciju skrola sa prethodne strane — ako si
 * bio na dnu duge strane, kraca te doceka na istoj visini, obicno u footeru.
 *
 * Mora kroz Lenis: nativni window.scrollTo on pregazi na sledecem kadru.
 * `force` je tu jer je Lenis zaustavljen dok je meni otvoren, a navigacija
 * ide bas iz menija.
 *
 * Ako u adresi ima hash, ovo se sklanja — tada skrol vodi HashScroll.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const lenis = useLenis();

  useEffect(() => {
    if (hash) return;
    /* Oba, namerno:
       - lenis.scrollTo drzi Lenisovo unutrasnje stanje na nuli, inace bi
         sledeci potez tocka krenuo od stare pozicije,
       - window.scrollTo pomera stvarnu poziciju odmah, jer Lenis svoju
         primenjuje tek na sledecem rAF kadru — a taj ume da izostane
         (skrivena kartica, prigusen rAF). Lenis ne vraca nativni skrol
         nazad, provereno. */
    lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }, [pathname, hash, lenis]);

  return null;
}
