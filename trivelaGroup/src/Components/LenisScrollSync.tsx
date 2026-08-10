import { useEffect } from "react";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Spaja Lenis i GSAP ScrollTrigger.
 *
 * Bez ovoga ScrollTrigger racuna poziciju iz nativnog skrola po svom
 * rasporedu, dok Lenis sliku interpolira glatko — animacija onda kasni za
 * onim sto se vidi i deluje trzavo. Ovde ScrollTrigger.update() ide na
 * svaki Lenis frejm, pa su slika i animacija u istom taktu.
 *
 * Mora stajati UNUTAR <ReactLenis>, jer useLenis cita instancu iz konteksta.
 */
export default function LenisScrollSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    /* lagSmoothing(0) sprecava da GSAP "preskace" pri zastojima, sto bi
       raskinulo sinhronizaciju sa Lenis-om. */
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, [lenis]);

  return null;
}
