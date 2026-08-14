import { Link } from "react-router-dom";
import { formatPrice, type CaseItem } from "../data/cases";
import { useCases } from "../data/useCases";

function CaseCard({ item }: { item: CaseItem }) {
  return (
    <Link
      to={`/drop/${item.id}`}
      className="group relative block aspect-[9/16] overflow-hidden rounded-2xl border border-white/10 transition-all duration-300 hover:border-zelena/50 hover:shadow-[0_0_34px_rgba(150,255,0,0.18)]"
    >
      {/* Slika / placeholder */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out group-hover:scale-110"
        style={{
          background: `radial-gradient(circle at 50% 35%, ${item.color}45, #000b38 72%)`,
        }}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-7xl drop-shadow-lg">{item.badge}</span>
        )}
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-teget via-teget/70 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <h3 className="translate-y-3 text-base font-semibold text-white transition-transform duration-300 group-hover:translate-y-0">
          {item.name}
        </h3>
        <p className="translate-y-3 text-sm font-medium text-zelena transition-transform delay-75 duration-300 group-hover:translate-y-0">
          {formatPrice(item.price)}
        </p>
        <span className="mt-3 inline-flex w-fit translate-y-3 items-center gap-1.5 rounded-full bg-zelena px-4 py-2 text-xs font-bold uppercase tracking-wide text-teget opacity-0 shadow-[0_6px_18px_rgba(150,255,0,0.3)] transition-all delay-100 duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          View case →
        </span>
      </div>
    </Link>
  );
}

export default function Collection() {
  const { cases, loading } = useCases();
  const worldCup = cases.filter((c) => c.collection === "World Cup");

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Naslov + podnaslov */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold leading-tight text-zelena sm:text-4xl lg:text-5xl">
            World Cup 2026 collection
          </h2>
          <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-zelena to-transparent" />
          <p className="mt-5 text-base text-white/60 sm:text-lg">
            Explore our World Cup cases
          </p>
        </div>

        {/* Grid 5 u redu */}
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={`skel-${i}`}
                  className="aspect-[9/16] animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"
                />
              ))
            : worldCup.map((item) => (
                <CaseCard key={item.id} item={item} />
              ))}
        </div>
      </div>
    </section>
  );
}
