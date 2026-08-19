import { useCallback, useEffect, useState } from "react";
import { galleryPhotos, type GalleryPhoto } from "../data/galleryPhotos";
import "./Gallery.css";

/* ---------- Icons ---------- */
function Close({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function Chevron({
  dir,
  className = "h-7 w-7",
}: {
  dir: "left" | "right";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {dir === "left" ? <path d="m15 6-6 6 6 6" /> : <path d="m9 6 6 6-6 6" />}
    </svg>
  );
}

/* ---------- Lightbox ---------- */
function Lightbox({
  photos,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  photos: GalleryPhoto[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const photo = photos[index];

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onPrev, onNext]);

  if (!photo) return null;

  return (
    <div
      className="gal-backdrop fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      {/* Close */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full border border-white/15 p-2.5 text-white/80 transition-colors hover:border-zelena hover:text-zelena sm:right-6 sm:top-6"
      >
        <Close />
      </button>

      {/* Prev */}
      <button
        type="button"
        aria-label="Previous"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="absolute left-2 z-10 rounded-full border border-white/15 bg-black/30 p-2.5 text-white/80 transition-colors hover:border-zelena hover:text-zelena sm:left-6"
      >
        <Chevron dir="left" />
      </button>

      {/* Next */}
      <button
        type="button"
        aria-label="Next"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-2 z-10 rounded-full border border-white/15 bg-black/30 p-2.5 text-white/80 transition-colors hover:border-zelena hover:text-zelena sm:right-6"
      >
        <Chevron dir="right" />
      </button>

      {/* Figure */}
      <figure
        key={index}
        className="gal-figure flex max-h-full max-w-full flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.src}
          alt={photo.title}
          className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
        />
        <figcaption className="mt-4 text-center">
          <p className="text-base font-medium text-white">{photo.title}</p>
          <p className="mt-1 text-sm text-white/50">{photo.description}</p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-white/30">
            {index + 1} / {photos.length}
          </p>
        </figcaption>
      </figure>
    </div>
  );
}

/* ---------- Item ---------- */
function GalleryItem({
  photo,
  index,
  onOpen,
}: {
  photo: GalleryPhoto;
  index: number;
  onOpen: (i: number) => void;
}) {
  return (
    <figure
      className="gal-item group mb-5 break-inside-avoid cursor-pointer"
      style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
      onClick={() => onOpen(index)}
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 transition-all duration-300 group-hover:border-zelena/40 group-hover:shadow-[0_0_34px_rgba(150,255,0,0.15)]">
        <img
          src={photo.src}
          alt={photo.title}
          loading="lazy"
          className="h-auto w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        {/* Opis — overlay na hover (ne menja layout, bez glitcha) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-teget via-teget/70 to-transparent p-4 pt-14 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <p className="text-sm leading-relaxed text-white/90">
            {photo.description}
          </p>
        </div>
      </div>

      <figcaption className="mt-3 px-1">
        <h3 className="text-[15px] font-medium text-white transition-colors duration-300 group-hover:text-zelena">
          {photo.title}
        </h3>
      </figcaption>
    </figure>
  );
}

/* ---------- Page ---------- */
export default function Gallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const photos = galleryPhotos;
  const count = photos.length;

  const open = useCallback((i: number) => setOpenIndex(i), []);
  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i - 1 + count) % count)),
    [count]
  );
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i + 1) % count)),
    [count]
  );

  return (
    <section className="min-h-screen bg-teget px-5 pb-24 pt-40 sm:px-8 sm:pt-48">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-14 text-center">
          <h1 className="bg-gradient-to-b from-[#d6ff9e] via-[#96ff00] to-[#6fd000] bg-clip-text pb-[0.16em] text-5xl font-extrabold leading-none tracking-tight text-transparent [filter:drop-shadow(0_0_28px_rgba(150,255,0,0.3))] sm:text-6xl lg:text-7xl">
            Trivela Gallery
          </h1>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-white/50 sm:text-base">
            Matchday Designs
          </p>
        </div>

        {/* Masonry preko cele sirine */}
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {photos.map((photo, i) => (
            <GalleryItem key={photo.src} photo={photo} index={i} onOpen={open} />
          ))}
        </div>
      </div>

      {openIndex !== null && (
        <Lightbox
          photos={photos}
          index={openIndex}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </section>
  );
}
