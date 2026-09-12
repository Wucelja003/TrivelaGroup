import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { LuArrowUpRight, LuRotateCw } from "react-icons/lu";
import DemoPointer from "./DemoPointer";
import Typewriter from "./Typewriter";

/*
 * Grid → klik → strana proizvoda, odigrano samo.
 *
 * Mala kopija Drop grida sa cetiri prave maskice. Pokazivac se dovuce do jedne,
 * klikne je, i prikaz prelazi na stranu proizvoda — isto kako to radi na sajtu.
 *
 * Kopija je namerno mala i nezavisna: pravi ShopCard vuce Link, korpu i podatke
 * iz Supabase-a, a ovo treba samo da POKAZE potez. Zato su cene i imena fiksni.
 *
 * prefers-reduced-motion: nema pokazivaca ni putovanja — odmah se vidi strana
 * proizvoda, jer je ona poenta koraka.
 */

type DemoCase = {
  id: string;
  name: string;
  collection: string;
  price: string;
  img: string;
};

const CASES: DemoCase[] = [
  { id: "nole", name: "Nole", collection: "Legends", price: "2.490 RSD", img: "/dropHero/nole.png" },
  { id: "messi", name: "Messi", collection: "Legends", price: "2.490 RSD", img: "/dropHero/messi.png" },
  { id: "cr7", name: "CR7", collection: "Legends", price: "2.490 RSD", img: "/dropHero/cr7.png" },
  { id: "mbappe", name: "Mbappé", collection: "Icons", price: "2.490 RSD", img: "/dropHero/mbappe.png" },
];

/* Which card the pointer goes for. Second one, so the travel is visible
   rather than starting on top of the target. */
const TARGET = 1;

const EASE = [0.22, 1, 0.36, 1] as const;

type Phase = "idle" | "moving" | "pressing" | "product";

export default function ShopClickDemo() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduce ? "product" : "idle");
  const [run, setRun] = useState(0); // bumping this replays the whole thing

  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  /* One effect, one chain, and its only inputs are the replay counter and the
     motion preference. An earlier version also depended on a callback, and
     every setState re-ran the effect, which reset the sequence back to the
     start before it could ever reach the product page.

     Positions are measured off the grid box rather than hardcoded, so the
     pointer lands on the card wherever the grid sits. */
  useEffect(() => {
    if (reduce) {
      setPhase("product");
      return;
    }

    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(() => alive && fn(), ms));

    const spot = (index: number, fx: number, fy: number) => {
      const grid = gridRef.current;
      const card = cardRefs.current[index];
      if (!grid || !card) return null;
      const g = grid.getBoundingClientRect();
      const c = card.getBoundingClientRect();
      return { x: c.left - g.left + c.width * fx, y: c.top - g.top + c.height * fy };
    };

    setPhase("idle");
    // Start off to the side of the first card, so the travel reads as travel.
    const from = spot(0, 0.3, 0.85);
    if (from) setPointer(from);

    at(600, () => {
      const to = spot(TARGET, 0.55, 0.55);
      if (to) setPointer(to);
      setPhase("moving");
    });
    at(1500, () => setPhase("pressing"));
    at(1950, () => setPhase("product"));

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [run, reduce]);

  const showingProduct = phase === "product";
  const target = CASES[TARGET];

  return (
    <div className="flex flex-col gap-4">
      {/* Both views stay mounted, one over the other, and the swap is a
          cross-fade. An AnimatePresence with mode="wait" was doing this before
          and the exit never resolved, so the product page never arrived —
          nothing to choreograph here, so nothing to get stuck. */}
      <div className="relative overflow-hidden rounded-2xl border border-mastilo/12 bg-white p-4 shadow-[0_8px_24px_rgba(8,34,108,0.07)]">
        {/* ---------- the grid ---------- */}
        <motion.div
          ref={gridRef}
          className="relative"
          animate={{ opacity: showingProduct ? 0 : 1, x: showingProduct ? -24 : 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          style={{ pointerEvents: showingProduct ? "none" : "auto" }}
          aria-hidden={showingProduct}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-mastilo/45">
              All cases
            </span>
            <span className="text-[10px] font-medium text-mastilo/35">4 products</span>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {CASES.map((c, i) => {
              const aimed = phase !== "idle" && i === TARGET;
              return (
                <div
                  key={c.id}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                >
                  <motion.div
                    animate={
                      phase === "pressing" && i === TARGET
                        ? { scale: 0.94 }
                        : { scale: aimed ? 1.03 : 1 }
                    }
                    transition={{ duration: 0.22, ease: EASE }}
                    className={`relative aspect-[9/16] overflow-hidden rounded-xl border transition-colors duration-300 ${
                      aimed
                        ? "border-ledena shadow-[0_0_28px_rgba(124,196,255,0.35)]"
                        : "border-mastilo/12"
                    }`}
                  >
                    <img src={c.img} alt={c.name} className="h-full w-full object-cover" />
                    {/* The corner arrow the real card shows on hover */}
                    <span
                      className={`absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-ledena text-ledena-ink transition-all duration-300 ${
                        aimed ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
                      }`}
                    >
                      <LuArrowUpRight className="h-3 w-3" />
                    </span>
                  </motion.div>
                  <span className="mt-1.5 block truncate text-[11px] font-semibold text-mastilo">
                    {c.name}
                  </span>
                  <span className="block text-[10px] font-medium text-mastilo/55">{c.price}</span>
                </div>
              );
            })}
          </div>

          {/* The pointer. Absolute inside the grid, so it travels with it. */}
          {!reduce && !showingProduct && (
            <DemoPointer x={pointer.x} y={pointer.y} pressing={phase === "pressing"} />
          )}
        </motion.div>

        {/* ---------- where the click lands ---------- */}
        <motion.div
          className="absolute inset-0 p-4"
          initial={false}
          animate={{ opacity: showingProduct ? 1 : 0, x: showingProduct ? 0 : 24 }}
          transition={{ duration: 0.34, ease: EASE }}
          style={{ pointerEvents: showingProduct ? "auto" : "none" }}
          aria-hidden={!showingProduct}
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[10px] font-medium text-mastilo/35">Drop</span>
            <span className="text-[10px] text-mastilo/25">/</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-mastilo">
              {target.name}
            </span>
          </div>

          <div className="flex gap-4">
            <div className="aspect-[9/16] w-[110px] shrink-0 overflow-hidden rounded-xl border border-mastilo/12 bg-gradient-to-br from-[#eaf3ff] to-white">
              <img src={target.img} alt={target.name} className="h-full w-full object-cover" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-mastilo/50">
                {target.collection}
              </span>
              <span className="mt-1 block text-[22px] font-bold leading-tight text-mastilo">
                {target.name}
              </span>
              <span className="mt-1.5 block text-[16px] font-bold text-mastilo/85">
                {target.price}
              </span>

              <span className="mt-4 block text-[10px] font-semibold uppercase tracking-[0.16em] text-mastilo/45">
                Your phone model
              </span>
              <div className="mt-1.5 rounded-lg border border-ledena bg-white px-3 py-2 text-[13px] font-medium text-mastilo shadow-[0_0_0_3px_rgba(124,196,255,0.18)]">
                {/* Only starts once the page is actually showing, or it would
                    have typed itself out behind the grid. */}
                <Typewriter text="iPhone 18 Pro" start={showingProduct} speed={30} />
              </div>

              <span className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#08226c] to-[#14589b] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
                Add to cart
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] text-mastilo/50">
          {showingProduct
            ? "That is the case's own page — price, collection, and the model field."
            : "Watch: the grid, one case, and where it takes you."}
        </span>
        <button
          onClick={() => setRun((r) => r + 1)}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-mastilo/15 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-mastilo transition-all duration-200 hover:-translate-y-0.5 hover:border-mastilo/35"
        >
          <LuRotateCw className="h-3.5 w-3.5" />
          Replay
        </button>
      </div>
    </div>
  );
}
