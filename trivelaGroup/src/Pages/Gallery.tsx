import { useMemo, useState } from "react";
import {
  galleryPhotos,
  GALLERY_CATEGORIES,
  type GalleryCategory,
} from "../data/galleryPhotos";
import LenticularCarousel, {
  type LenticularCarouselItem,
} from "../Components/LenticularCarousel";
import InstagramEmbeds from "../Components/InstagramEmbeds";
import ReelStrip, { type ReelItem } from "../Components/ReelStrip";
import "./Gallery.css";

/* Kategorije koje umesto slika prikazuju Instagram embed-ove (post/reel). */
const GALLERY_EMBEDS: Partial<Record<GalleryCategory, string[]>> = {
  // Namerno izmesano (round-robin po igracu) da ne idu svi jednog igraca
  // uzastopno. Fiksan redosled — stabilan, ne random na svako ucitavanje.
  Posts: [
    "https://www.instagram.com/p/DbGIx96jOOx/", // Kostov
    "https://www.instagram.com/p/Dc0i9OtghXI/", // Ugrešić
    "https://www.instagram.com/p/Dcnrms6jPfY/", // Milosavljević
    "https://www.instagram.com/p/Db1ATQ7DITN/", // Damjanović
    "https://www.instagram.com/p/Db31m43jAsB/", // Ranković
    "https://www.instagram.com/p/DbRXNh8kahn/", // Šarić
    "https://www.instagram.com/p/DM0dFKqsTzL/", // Štulić
    "https://www.instagram.com/p/DYrR4-hjNKn/", // Kostov
    "https://www.instagram.com/p/DcogICpgoD_/", // Ugrešić
    "https://www.instagram.com/p/DZSUopfDEt5/", // Milosavljević
    "https://www.instagram.com/p/Dbl5v3ojAI-/", // Damjanović
    "https://www.instagram.com/p/DaJDZKcDHqv/", // Ranković
    "https://www.instagram.com/p/DcZVdF_EUji/", // Šarić
    "https://www.instagram.com/p/DVEyoGxDFPG/", // Kostov
    "https://www.instagram.com/p/DbOp-m9gmX3/", // Ugrešić
    "https://www.instagram.com/p/DWjsYfADI8V/", // Milosavljević
    "https://www.instagram.com/p/DaXmkPijDEe/", // Damjanović
    "https://www.instagram.com/p/DVvbHvkjMok/", // Ranković
    "https://www.instagram.com/p/DT2drs4jE7h/", // Kostov
    "https://www.instagram.com/p/DX7gipCAg46/", // Ugrešić
    "https://www.instagram.com/p/DQSHJBIjHd7/", // Milosavljević
    "https://www.instagram.com/p/DaJCN5rDP4w/", // Damjanović
    "https://www.instagram.com/p/DTkesgjjPWQ/", // Ranković
    "https://www.instagram.com/p/DSK1Sn2jIAu/", // Kostov
    "https://www.instagram.com/p/DXUSFLljNOM/", // Ugrešić
    "https://www.instagram.com/p/DP0jx8ADAp5/", // Milosavljević
    "https://www.instagram.com/p/DB10TaqRTMs/", // Damjanović
    "https://www.instagram.com/p/DPyvyFxjMGS/", // Ranković
    "https://www.instagram.com/p/DQCrLu1DDZc/", // Kostov
    "https://www.instagram.com/p/DWkLrJtDBAz/", // Ugrešić
    "https://www.instagram.com/p/DOjXop7jJwY/", // Milosavljević
    "https://www.instagram.com/p/C7xGhUVMQNc/", // Damjanović
    "https://www.instagram.com/p/DPcStsqDCoI/", // Kostov
    "https://www.instagram.com/p/DSxn3XrE-vp/", // Ugrešić
    "https://www.instagram.com/p/DPV9TSrDGog/", // Kostov
    "https://www.instagram.com/p/DSOHPs1jGsp/", // Ugrešić
    "https://www.instagram.com/p/C7w6_JeMq1b/", // Kostov
    "https://www.instagram.com/p/DRp6-ZRjNzd/", // Ugrešić
  ],
};

/* Reels (video) iz public/trivelaReels — listaju se isto kao galerija slika,
   samo su video, svaki u prirodnoj velicini (9:16, jedan landscape). */
const REEL_FILES = [
  "trivelaReelsMain",
  "trivelaReels3",
  "trivelaReels3-2",
  "trivelaReelsPartizan",
  "trivelaReelsFootball",
  "trivelaReelsBcPartizan",
  "trivelaReelsCases",
  "trivelsReelsMoneke",
  "trivelaReelsZoc",
  "trivelaReelsStulic",
  "trivelaReelsUgresic",
  "trivelaReelsOsetkowski",
  "trivelaReelsDress",
  "trivelaReelsLandscape",
];
const GALLERY_REELS: Partial<Record<GalleryCategory, ReelItem[]>> = {
  Reels: REEL_FILES.map((n) => ({ src: `/trivelaReels/${n}.mp4` })),
};

/*
 * Galerija — široki "lenticular" carousel (R3F/three) koji se lepo lista
 * (drag / strelice / scroll). Hover flip je isključen — slike se samo
 * prelistavaju, bez ikakve hover animacije. Iznad su filter tabovi.
 *
 * Svaka kategorija nosi svoj oblik kartice (prirodne veličine slika) —
 * Matchdays su portret 9:16, Verifications su landscape (~2:1).
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
  Matchdays: DEFAULT_SHAPE,
  Verifications: {
    aspect: "2 / 1",
    cardWidth: 460,
    height: "h-[440px]",
  },
};

export default function Gallery() {
  // Prikazujemo SVE kategorije kao tabove — i one prazne (Reels, Posts) da bi
  // se videlo da stižu. Prazna kategorija dobije "coming soon" prazno stanje.
  const available = GALLERY_CATEGORIES;

  // Prvi tab koji stvarno ima fotke — da galerija ne otvori prazan tab.
  const firstWithPhotos =
    available.find((c) => galleryPhotos.some((p) => p.category === c)) ??
    available[0];

  const [active, setActive] = useState<GalleryCategory>(firstWithPhotos);

  const items = useMemo<LenticularCarouselItem[]>(
    () =>
      galleryPhotos
        .filter((p) => p.category === active)
        .map((p) => ({ src: p.src, title: p.title, meta: p.category })),
    [active]
  );

  const shape = CAT_SHAPE[active] ?? DEFAULT_SHAPE;
  const embeds = GALLERY_EMBEDS[active] ?? [];
  const reels = GALLERY_REELS[active] ?? [];

  return (
    <section className="min-h-screen bg-teget pb-24 pt-40 sm:pt-48">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="bg-gradient-to-b from-[#d6ff9e] via-[#96ff00] to-[#6fd000] bg-clip-text pb-[0.16em] text-5xl font-extrabold leading-none tracking-tight text-transparent [filter:drop-shadow(0_0_28px_rgba(150,255,0,0.3))] sm:text-6xl lg:text-7xl">
            Trivela Gallery
          </h1>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-white/50 sm:text-base">
            Drag or use the arrows to browse
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

      {/* Prikaz zavisi od kategorije: Instagram embed-ovi (Posts), carousel
          slika, ili "coming soon". `key` re-inicijalizuje pri promeni taba. */}
      <div className="w-full px-2 sm:px-6">
        {embeds.length > 0 ? (
          <InstagramEmbeds key={active} permalinks={embeds} />
        ) : reels.length > 0 ? (
          <ReelStrip key={active} items={reels} />
        ) : items.length > 0 ? (
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
            trigger="none"
            loop
            className={shape.height}
          />
        ) : (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
            <span className="text-lg font-bold uppercase tracking-[0.2em] text-zelena">
              Coming soon
            </span>
            <span className="text-sm text-white/45">
              {active} are on the way — check back shortly.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
