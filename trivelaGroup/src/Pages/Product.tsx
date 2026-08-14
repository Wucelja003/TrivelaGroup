import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatPrice, type CaseItem } from "../data/cases";
import { useCases } from "../data/useCases";
import { useCart } from "../context/CartContext";
import "./Product.css";

const MODELS = [
  "iPhone 17 Pro Max",
  "iPhone 17 Pro",
  "iPhone 17",
  "iPhone 16 Pro Max",
  "iPhone 16 Pro",
  "iPhone 16",
  "iPhone 15 Pro Max",
  "iPhone 15 Pro",
  "iPhone 15",
  "Samsung S24 Ultra",
  "Samsung S24",
];

/* ---------- Icons ---------- */
function Chevron({ open = false }: { open?: boolean }) {
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

/* ---------- Case visual (slika ili mockup) ---------- */
function CaseVisual({ item, big = false }: { item: CaseItem; big?: boolean }) {
  if (item.image) {
    return (
      <img
        src={item.image}
        alt={item.name}
        className="h-full w-full object-cover"
      />
    );
  }
  return (
    <div
      className="flex h-full items-center justify-center p-8"
      style={{
        background: `radial-gradient(circle at 50% 30%, ${item.color}3a, #06294d 74%)`,
      }}
    >
      <div
        className="relative flex aspect-[9/18] items-center justify-center rounded-[1.8rem] border border-mastilo/20 shadow-[0_28px_60px_rgba(0,0,0,0.5)]"
        style={{
          height: big ? "88%" : "84%",
          background: `linear-gradient(150deg, ${item.color}, ${item.color}22)`,
        }}
      >
        <div className="absolute right-3 top-3 grid grid-cols-2 gap-1 rounded-xl bg-black/25 p-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-black/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-black/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-black/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
        </div>
        <span
          className={`font-bold tracking-tight text-white drop-shadow-lg ${
            big ? "text-7xl" : "text-3xl"
          }`}
        >
          {item.badge}
        </span>
        <div className="pointer-events-none absolute inset-0 rounded-[1.8rem] bg-gradient-to-tr from-transparent via-white/5 to-white/25" />
      </div>
    </div>
  );
}

/* ---------- Suggested card ---------- */
function SuggestCard({ item }: { item: CaseItem }) {
  return (
    <Link to={`/drop/${item.id}`} className="group block">
      <div className="relative aspect-[9/16] overflow-hidden rounded-2xl border border-mastilo/12 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-ledena/40 group-hover:shadow-[0_0_34px_rgba(124,196,255,0.15)]">
        <div className="h-full transition-transform duration-500 ease-out group-hover:scale-105">
          <CaseVisual item={item} />
        </div>
      </div>
      <h3 className="mt-3 text-sm font-semibold text-mastilo transition-colors group-hover:text-ledena-ink">
        {item.name}
      </h3>
      <p className="text-[11px] uppercase tracking-[0.15em] text-mastilo/65">
        {item.collection}
      </p>
      <p className="mt-1 text-sm font-bold text-mastilo">
        {formatPrice(item.price)}
      </p>
    </Link>
  );
}

/* ---------- Page ---------- */
export default function Product() {
  const { id } = useParams();
  const { cases, loading } = useCases();
  const item = cases.find((c) => c.id === id) ?? null;

  const [model, setModel] = useState(MODELS[0]);
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // zatvori dropdown na klik van njega
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const suggestions = useMemo(() => {
    if (!item) return [];
    const same = cases.filter(
      (c) => c.collection === item.collection && c.id !== item.id
    );
    const others = cases.filter((c) => c.collection !== item.collection);
    return [...same, ...others].slice(0, 4);
  }, [item, cases]);

  if (loading) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="text-sm uppercase tracking-[0.2em] text-mastilo/65">
          Loading…
        </div>
      </section>
    );
  }

  if (!item) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-bold text-mastilo">Case not found</h1>
        <p className="mt-3 text-mastilo/70">
          The product you're looking for doesn't exist.
        </p>
        <Link
          to="/drop"
          className="mt-8 rounded-full bg-mastilo px-8 py-3.5 font-semibold text-white transition-colors hover:bg-mastilo/85"
        >
          Back to shop
        </Link>
      </section>
    );
  }

  return (
    <section className="px-5 pb-12 pt-40 sm:px-8 sm:pb-16 sm:pt-48">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-mastilo/65">
          <Link to="/drop" className="transition-colors hover:text-mastilo">
            Trivela Drop
          </Link>
          <span className="mx-2">/</span>
          <span className="text-mastilo/70">{item.name}</span>
        </nav>

        {/* Main */}
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left — big visual */}
          <div className="prod-left">
            <div
              className="relative aspect-[9/16] overflow-hidden rounded-3xl border border-mastilo/12"
              style={{
                boxShadow: `0 0 60px ${item.color}22`,
              }}
            >
              <CaseVisual item={item} big />
            </div>
          </div>

          {/* Right — info */}
          <div className="prod-anim flex flex-col justify-center" style={{ animationDelay: "120ms" }}>
            <span className="text-[12px] font-semibold uppercase tracking-[0.25em] text-mastilo">
              {item.collection} collection
            </span>

            <h1 className="mt-4 text-5xl font-bold uppercase leading-[0.95] tracking-tight text-mastilo sm:text-6xl lg:text-7xl">
              {item.name}
            </h1>

            <p className="mt-6 text-3xl font-bold text-mastilo">
              {formatPrice(item.price)}
            </p>

            <p className="mt-6 max-w-md leading-relaxed text-mastilo/70">
              Premium hard case with a soft-touch finish. Slim, drop-tested and
              built to show your colors. Precise cutouts, wireless-charging
              friendly.
            </p>

            {/* Model selector */}
            <div className="mt-9 max-w-md">
              <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-mastilo/65">
                Select model
              </div>
              <div className="relative" ref={ddRef}>
                <button
                  type="button"
                  onClick={() => setOpen((o) => !o)}
                  className={`flex w-full items-center justify-between rounded-xl border bg-white px-5 py-4 text-left text-base text-mastilo transition-colors duration-200 ${
                    open ? "border-ledena" : "border-mastilo/15 hover:border-mastilo/35"
                  }`}
                >
                  {model}
                  <Chevron open={open} />
                </button>

                {/* Podloga je BELA — ostala je tamna (#050f33) iz stare teme,
                    pa se tamnoplav tekst modela na njoj nije video. */}
                {open && (
                  <ul className="prod-dropdown absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-mastilo/15 bg-white p-1.5 shadow-[0_18px_44px_rgba(6,41,77,0.18)]">
                    {MODELS.map((m) => {
                      const active = m === model;
                      return (
                        <li key={m}>
                          <button
                            type="button"
                            onClick={() => {
                              setModel(m);
                              setOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm transition-colors duration-150 ${
                              active
                                ? "bg-ledena/25 text-mastilo"
                                : "text-mastilo/70 hover:bg-mastilo/5 hover:text-mastilo"
                            }`}
                          >
                            {m}
                            {active && <Check className="h-4 w-4" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* Add to cart */}
            <div className="mt-8 max-w-md">
              <button
                type="button"
                onClick={() => {
                  if (!item) return;
                  addItem({
                    id: item.id,
                    name: item.name,
                    model,
                    price: item.price,
                    badge: item.badge,
                    color: item.color,
                    image: item.image,
                  });
                  setAdded(true);
                  setTimeout(() => setAdded(false), 1800);
                }}
                className={`group flex w-full items-center justify-center gap-3 rounded-full py-4.5 text-base font-semibold transition-all duration-300 ${
                  added
                    ? "bg-mastilo text-white"
                    : "bg-ledena text-ledena-ink shadow-[0_10px_30px_rgba(124,196,255,0.3)] hover:shadow-[0_14px_40px_rgba(124,196,255,0.5)]"
                }`}
                style={{ paddingTop: "1.05rem", paddingBottom: "1.05rem" }}
              >
                {added ? (
                  <>
                    <Check /> Added to cart
                  </>
                ) : (
                  <>
                    Add to cart
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>
              <p className="mt-4 text-center text-xs text-mastilo/65">
                In stock · Ships in 2–4 business days
              </p>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="mt-24 sm:mt-32">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-mastilo sm:text-3xl">
              You might also like
            </h2>
            <Link
              to="/drop"
              className="text-sm text-mastilo/70 transition-colors hover:text-mastilo"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {suggestions.map((s) => (
              <SuggestCard key={s.id} item={s} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
