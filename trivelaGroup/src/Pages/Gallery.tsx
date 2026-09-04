import { useMemo, useState } from "react";
import {
  galleryPhotos,
  GALLERY_CATEGORIES,
  type GalleryCategory,
} from "../data/galleryPhotos";
import LenticularCarousel, {
  type LenticularCarouselItem,
} from "../Components/LenticularCarousel";
import "./Gallery.css";

/*
 * Galerija — "lenticular" carousel (R3F/three): pređeš preko slike i ona se
 * prevrne uz naziv. Iznad su filter tabovi po kategorijama.
 *
 * Svaka kategorija nosi svoj oblik kartice (prirodne veličine slika) — Match
 * Day su portret 9:16, Verifications su landscape (~2:1).
 */
interface CatShape {
  aspect: string;
  cardWidth: number;
  height: string;
}
const DEFAULT_SHAPE: CatShape = {
  aspect: "9 / 16",
  cardWidth: 300,
  height: "h-[640px]",
};
const CAT_SHAPE: Partial<Record<GalleryCategory, CatShape>> = {
  "Match Day": DEFAULT_SHAPE,
  "Trivela Verifications": {
    aspect: "2 / 1",
    cardWidth: 460,
    height: "h-[440px]",
  },
};

export default function Gallery() {
  // Kategorije koje imaju bar jednu sliku (prazne se ne prikazuju)
  const available = useMemo(
    () =>
      GALLERY_CATEGORIES.filter((c) =>
        galleryPhotos.some((p) => p.category === c)
      ),
    []
  );

  const [active, setActive] = useState<GalleryCategory>(
    available[0] ?? "Match Day"
  );

  const items = useMemo<LenticularCarouselItem[]>(
    () =>
      galleryPhotos
        .filter((p) => p.category === active)
        .map((p) => ({ src: p.src, title: p.title, meta: p.category })),
    [active]
  );

  const shape = CAT_SHAPE[active] ?? DEFAULT_SHAPE;

  return (
    <section className="min-h-screen bg-teget pb-24 pt-40 sm:pt-48">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="bg-gradient-to-b from-[#d6ff9e] via-[#96ff00] to-[#6fd000] bg-clip-text pb-[0.16em] text-5xl font-extrabold leading-none tracking-tight text-transparent [filter:drop-shadow(0_0_28px_rgba(150,255,0,0.3))] sm:text-6xl lg:text-7xl">
            Trivela Gallery
          </h1>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-white/50 sm:text-base">
            Hover to reveal · drag or arrow keys to browse
          </p>
        </div>

        {/* Filter tabovi po kategorijama */}
        {available.length > 0 && (
          <div className="mb-10 flex flex-wrap justify-center gap-3">
            {available.map((c) => {
              const on = c === active;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setActive(c)}
                  className={`rounded-full border px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                    on
                      ? "border-zelena bg-zelena text-[#00230a] shadow-[0_8px_24px_-6px_rgba(150,255,0,0.5)]"
                      : "border-white/15 text-white/70 hover:border-white/40 hover:text-white"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Carousel — preko cele širine strane. `key` re-inicijalizuje pri
          promeni kategorije da se novi set slika rasporedi. */}
      <div className="w-full px-2 sm:px-6">
        {items.length > 0 ? (
          <LenticularCarousel
            key={active}
            items={items}
            aspectRatio={shape.aspect}
            cardWidth={shape.cardWidth}
            initialIndex={Math.floor(items.length / 2)}
            gap={30}
            strips={34}
            sweep={0.7}
            foil={0.55}
            tilt={16}
            loop
            className={shape.height}
          />
        ) : (
          <div className="flex h-64 items-center justify-center text-white/40">
            No photos in this category yet.
          </div>
        )}
      </div>
    </section>
  );
}
