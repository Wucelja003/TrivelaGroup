import { useMemo, useState } from "react";
import {
  galleryPhotos,
  GALLERY_CATEGORIES,
  type GalleryCategory,
} from "../data/galleryPhotos";
import GradientCarousel from "../Components/GradientCarousel";
import "./Gallery.css";

/*
 * Galerija — 3D "gradient" carousel (GradientCarousel), a iznad njega filter
 * tabovi po kategorijama. Prikazuje se samo izabrana kategorija; menjaš tab i
 * carousel prelista drugu grupu.
 *
 * Za sad su sve slike "Match Day" — ostali tabovi se pojave čim neka slika u
 * galleryPhotos.ts dobije tu kategoriju.
 */
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

  const images = useMemo(
    () =>
      galleryPhotos.filter((p) => p.category === active).map((p) => p.src),
    [active]
  );

  return (
    <section className="min-h-screen bg-teget pb-24 pt-40 sm:pt-48">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="bg-gradient-to-b from-[#d6ff9e] via-[#96ff00] to-[#6fd000] bg-clip-text pb-[0.16em] text-5xl font-extrabold leading-none tracking-tight text-transparent [filter:drop-shadow(0_0_28px_rgba(150,255,0,0.3))] sm:text-6xl lg:text-7xl">
            Trivela Gallery
          </h1>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-white/50 sm:text-base">
            Drag, scroll or use arrow keys
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

      {/* Carousel — preko CELE širine strane (edge-to-edge), 9:16 kartice.
          `key` re-inicijalizuje pri promeni kategorije da se slike rasporede. */}
      <div className="relative h-[82vh] min-h-[560px] w-full">
        {images.length > 0 ? (
          <GradientCarousel
            key={active}
            images={images}
            cardAspectRatio={9 / 16}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-white/40">
            No photos in this category yet.
          </div>
        )}
      </div>
    </section>
  );
}
