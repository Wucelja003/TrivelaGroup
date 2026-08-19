import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  collections,
  formatPrice,
  type CaseItem,
  type CollectionName,
} from "../data/cases";
import { useCases } from "../data/useCases";
import { useCart } from "../context/CartContext";
import DropHero from "../Components/DropHero";
import Timeline, { type TimelineItem } from "../Components/Timeline";
import "./Shop.css";

/* Pet igraca za "Players who trusted our work".
   Imena/uloge su placeholder gde nisu poznata — slobodno menjaj. */
const dropPlayers: TimelineItem[] = [
  { img: "/TrivelaGroupPhotos/ZachLedayPhoto.jpg", name: "Zach Leday", role: "Basketball Player · Olimpia Milano" },
  { img: "/TrivelaGroupPhotos/MusaPhoto.JPG", name: "Đžanan Musa", role: "Basketball Player · Dubai Basketball" },
  { img: "/TrivelaGroupPhotos/lucic.jpg", name: "Vladimir Lučić", role: "Basketball player · Club Name" },
  { img: "/TrivelaGroupPhotos/petko_lagalaxy.jpg", name: "Player Name", role: "Footballer · Club Name" },
  { img: "/TrivelaGroupPhotos/TracyLessorPhoto.JPG", name: "Tracy Lessort", role: "Basketball player · Club Name" },
];

type SortKey = "az" | "za" | "price-asc" | "price-desc";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "az", label: "Name: A – Z" },
  { key: "za", label: "Name: Z – A" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
];

/* ---------- Icons ---------- */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CartIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="9" cy="21" r="1.5" />
      <circle cx="18" cy="21" r="1.5" />
      <path d="M2.5 3h2l2.2 12.4a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.2L21.5 7H6" />
    </svg>
  );
}

function Check({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 12l5 5L20 6" />
    </svg>
  );
}

/* ---------- Add to cart button (lokalni feedback) ---------- */
function AddToCart({ item }: { item: CaseItem }) {
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  return (
    <button
      type="button"
      aria-label={`Add ${item.name} to cart`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({
          id: item.id,
          name: item.name,
          model: "iPhone 17 Pro Max", // podrazumevani model iz shop kartice
          price: item.price,
          badge: item.badge,
          color: item.color,
          image: item.image,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1600);
      }}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
        added
          ? "bg-mastilo text-white"
          : "bg-ledena text-ledena-ink shadow-[0_6px_18px_rgba(124,196,255,0.3)] hover:shadow-[0_8px_24px_rgba(124,196,255,0.5)]"
      }`}
    >
      {added ? <Check /> : <CartIcon />}
    </button>
  );
}

/* ---------- Phone-case mockup ---------- */
function PhoneCase({ item }: { item: CaseItem }) {
  return (
    <div
      className="flex h-full items-center justify-center p-7"
      style={{
        background: `radial-gradient(circle at 50% 30%, ${item.color}3a, #06294d 74%)`,
      }}
    >
      <div
        className="phone-case relative flex aspect-[9/18] h-[86%] items-center justify-center rounded-[1.6rem] border border-mastilo/20 shadow-[0_22px_45px_rgba(0,0,0,0.45)]"
        style={{ background: `linear-gradient(150deg, ${item.color}, ${item.color}22)` }}
      >
        {/* Kamera modul */}
        <div className="absolute right-2.5 top-2.5 grid grid-cols-2 gap-1 rounded-xl bg-black/25 p-1.5">
          <span className="h-2 w-2 rounded-full bg-black/40" />
          <span className="h-2 w-2 rounded-full bg-black/40" />
          <span className="h-2 w-2 rounded-full bg-black/40" />
          <span className="h-2 w-2 rounded-full bg-white/30" />
        </div>

        {/* Badge (zastava / monogram) */}
        <span className="text-4xl font-bold tracking-tight text-white drop-shadow-lg sm:text-5xl">
          {item.badge}
        </span>

        {/* Gloss */}
        <div className="pointer-events-none absolute inset-0 rounded-[1.6rem] bg-gradient-to-tr from-transparent via-white/5 to-white/25" />
      </div>
    </div>
  );
}

/* ---------- Card ---------- */
function ShopCard({ item, index }: { item: CaseItem; index: number }) {
  return (
    <article
      className="shop-anim group"
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <Link
        to={`/drop/${item.id}`}
        className="relative block aspect-[9/16] overflow-hidden rounded-2xl border border-mastilo/12 transition-all duration-500 group-hover:border-ledena/40 group-hover:shadow-[0_0_40px_rgba(124,196,255,0.15)]"
      >
        {/* Zoom sloj */}
        <div className="h-full w-full transition-transform duration-[650ms] ease-out group-hover:scale-[1.07]">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <PhoneCase item={item} />
          )}
        </div>

        {/* Zatamnjenje odozdo */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-teget/70 via-teget/15 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Strelica u uglu */}
        <div className="pointer-events-none absolute right-3 top-3 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-ledena text-ledena-ink opacity-0 shadow-[0_6px_18px_rgba(124,196,255,0.35)] transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M7 17 17 7M17 7H8M17 7v9" />
          </svg>
        </div>
      </Link>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to={`/drop/${item.id}`} className="block">
            <h3 className="truncate text-base font-semibold text-mastilo transition-colors duration-300 group-hover:text-ledena-ink">
              {item.name}
            </h3>
          </Link>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.15em] text-mastilo/65">
            {item.collection}
          </p>
          <p className="mt-1 text-lg font-bold text-mastilo">
            {formatPrice(item.price)}
          </p>
        </div>
        <div className="pt-1">
          <AddToCart item={item} />
        </div>
      </div>
    </article>
  );
}

/* ---------- Sidebar ---------- */
function Sidebar({
  sort,
  setSort,
  selected,
  toggleCollection,
  collectionsOpen,
  setCollectionsOpen,
}: {
  sort: SortKey;
  setSort: (s: SortKey) => void;
  selected: CollectionName[];
  toggleCollection: (c: CollectionName) => void;
  collectionsOpen: boolean;
  setCollectionsOpen: (v: boolean) => void;
}) {
  return (
    <aside className="shop-side h-fit lg:sticky lg:top-24">
      {/* Sort */}
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mastilo">
        Sort by
      </div>
      <div className="mt-5 flex flex-col gap-1">
        {sortOptions.map((o) => {
          const active = sort === o.key;
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => setSort(o.key)}
              className="group/opt flex items-center gap-3 py-1.5 text-left"
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full border transition-all duration-300 ${
                  active ? "border-ledena" : "border-mastilo/25 group-hover/opt:border-mastilo/45"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full bg-ledena transition-transform duration-300 ${
                    active ? "scale-100" : "scale-0"
                  }`}
                />
              </span>
              <span
                className={`text-sm transition-colors duration-200 ${
                  active ? "text-mastilo" : "text-mastilo/70 group-hover/opt:text-mastilo/80"
                }`}
              >
                {o.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="my-7 h-px w-full bg-mastilo/8" />

      {/* Collections dropdown */}
      <button
        type="button"
        onClick={() => setCollectionsOpen(!collectionsOpen)}
        className="flex w-full items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-mastilo"
      >
        Collections
        <Chevron open={collectionsOpen} />
      </button>

      <div className={`shop-collapse mt-1 ${collectionsOpen ? "open" : ""}`}>
        <div>
          <div className="flex flex-col gap-1 pt-4">
            {collections.map((c) => {
              const checked = selected.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCollection(c)}
                  className="group/col flex items-center gap-3 py-1.5 text-left"
                >
                  <span
                    className={`flex h-4.5 w-4.5 items-center justify-center rounded-[5px] border transition-all duration-300 ${
                      checked
                        ? "border-ledena bg-ledena text-ledena-ink"
                        : "border-mastilo/25 text-transparent group-hover/col:border-mastilo/45"
                    }`}
                    style={{ height: "18px", width: "18px" }}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                  <span
                    className={`text-sm transition-colors duration-200 ${
                      checked ? "text-mastilo" : "text-mastilo/70 group-hover/col:text-mastilo/80"
                    }`}
                  >
                    {c}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ---------- Page ---------- */
export default function Shop() {
  const { cases, loading, error, fallback } = useCases();
  const [sort, setSort] = useState<SortKey>("az");
  const [selected, setSelected] = useState<CollectionName[]>([]);
  const [collectionsOpen, setCollectionsOpen] = useState(true);

  const toggleCollection = (c: CollectionName) =>
    setSelected((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );

  const visible = useMemo(() => {
    const list =
      selected.length === 0
        ? [...cases]
        : cases.filter((c) => selected.includes(c.collection));
    list.sort((a, b) => {
      switch (sort) {
        case "az":
          return a.name.localeCompare(b.name);
        case "za":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
      }
    });
    return list;
  }, [sort, selected, cases]);

  return (
    <>
      <DropHero />
      <section id="drop-grid" className="min-h-screen px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mastilo">
            Trivela Drop
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-mastilo sm:text-5xl lg:text-6xl">
            All cases
          </h1>
          <p className="mt-3 text-mastilo/70">
            {visible.length} {visible.length === 1 ? "product" : "products"}
          </p>

          {/* Vidi se samo u razvoju, kad Supabase ne odgovara.
              `import.meta.env.DEV` stoji i ovde da bi build izbacio i samu
              traku — bez toga ostaje mrtav JSX u produkcionom bundle-u. */}
          {import.meta.env.DEV && fallback && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs font-medium text-amber-200">
              <span aria-hidden="true">⚠</span>
              Baza ne odgovara — ovo je lokalni seed, ne pravi katalog.
            </p>
          )}
        </div>

        <div className="grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-14">
          <Sidebar
            sort={sort}
            setSort={setSort}
            selected={selected}
            toggleCollection={toggleCollection}
            collectionsOpen={collectionsOpen}
            setCollectionsOpen={setCollectionsOpen}
          />

          {/* Grid — key okida re-animaciju pri promeni filtera */}
          <div
            key={`${sort}-${selected.join(",")}-${loading ? "l" : "r"}`}
            className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4"
          >
            {error && (
              <div className="col-span-full rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-sm text-red-300">
                Failed to load products: {error}
              </div>
            )}
            {loading &&
              Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={`skel-${i}`}
                  className="aspect-[9/16] animate-pulse rounded-2xl border border-mastilo/12 bg-mastilo/[0.04]"
                />
              ))}
            {!loading &&
              !error &&
              visible.map((item, i) => (
                <ShopCard key={item.id} item={item} index={i} />
              ))}
          </div>
        </div>

        {/* Players carousel */}
        <div className="mt-28 sm:mt-36">
          <div className="mb-12 text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-mastilo">
              Trusted by the best
            </span>
            <h2 className="mt-4 bg-gradient-to-b from-[#1c6bb8] via-[#0d3f70] to-[#06294d] bg-clip-text pb-[0.16em] text-4xl font-extrabold leading-[1.05] tracking-tight text-transparent sm:text-5xl lg:text-6xl">
              Players who trusted
              <br />
              our work
            </h2>
          </div>

          <Timeline items={dropPlayers} variant="blue" />
        </div>
      </div>
      </section>
    </>
  );
}
