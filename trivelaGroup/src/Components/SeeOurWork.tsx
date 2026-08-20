import { Link } from "react-router-dom";
import SkewedCarousel, {
  type SkewedCarouselItem,
} from "./SkewedCarousel";
import { galleryPhotos } from "../data/galleryPhotos";

/*
 * "See our work" — vitrina odabranih radova na pocetnoj, kao najava galerije
 * (galerija ostaje ista). Skew/coverflow karusel se sam okrece i moze da se
 * prevlaci; klijent je hteo sto siri spektar, pa uzimamo raspon kroz celu
 * galeriju, ne prvih par.
 */

/* Raspon kroz galeriju: svaka treca fotka -> ~15 razlicitih radova.
   Fotke su 9:16, pa i karusel ide 9:16 (bez odsecanja). */
const picks = galleryPhotos.filter((_, i) => i % 3 === 0).slice(0, 15);

/* Imena ISPOD radova (redosled prati `picks`). Popuni pravim imenima igraca;
   prazno polje padne na naziv iz galerije. Odvojeno od galerije — menjanje
   ovde ne dira galerijski lightbox.
   Primer: NAMES[0] = "Veljko Milosavljević", NAMES[1] = "..." */
const NAMES: string[] = [
  // 1
  // 2
  // 3
  // ...popuni po redu do 15
];

const works: SkewedCarouselItem[] = picks.map((p, i) => ({
  src: p.src,
  title: NAMES[i]?.trim() || p.title,
}));

export default function SeeOurWork() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 text-center sm:px-8">
        {/* Header */}
        <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-[0.2em] text-zelena">
          See our work
        </span>
        <h2 className="mx-auto max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
          A broad spectrum of{" "}
          <span className="text-zelena">what we make.</span>
        </h2>

        {/* Karusel — belo nasledjuje boju za strelice/traku na tamnoj podlozi */}
        <div className="mt-14 text-white">
          <SkewedCarousel
            items={works}
            initialIndex={Math.floor(works.length / 2)}
            cardWidth={220}
            aspectRatio="9 / 16"
            rotation={58}
            inactiveScale={0.86}
            perspective={900}
            borderRadius={16}
            loop
            autoplay
            autoplayDelay={2800}
            showTitles
            showControls
            showDots
          />
        </div>

        {/* CTA ka punoj galeriji */}
        <Link
          to="/gallery"
          className="mt-12 inline-flex items-center gap-2 rounded-full bg-zelena px-8 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-teget shadow-[0_10px_30px_rgba(150,255,0,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(150,255,0,0.5)]"
        >
          See our work
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
