import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { LuRotateCw, LuTrash2, LuX } from "react-icons/lu";
import DemoPointer from "./DemoPointer";

/*
 * "Add to cart" -> torbica gore -> korpa izlazi sa strane, odigrano samo.
 *
 * Nastavak je ShopClickDemo-a: tamo se maskica otvori i model upise, ovde se
 * dodaje u korpu. Zato ovaj prikaz krece od iste strane proizvoda (Messi,
 * iPhone 18 Pro) — covek vidi jedan potez, ne dva odvojena.
 *
 * Kao i tamo, kopija je namerno mala i nezavisna od pravog CartDrawer-a: on
 * vuce CartContext, navigaciju i cene iz podataka, a ovde treba samo da se VIDI
 * odakle korpa izlazi i sta u njoj stoji.
 *
 * prefers-reduced-motion: nema pokazivaca ni putovanja — korpa je odmah
 * otvorena, jer je ona poenta koraka.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

const ITEM = {
  img: "/dropHero/messi.png",
  name: "Messi",
  model: "iPhone 18 Pro",
  price: "2.490 RSD",
};

/* Poredak je fiksan; svaki korak je tacka u vremenu, ne stanje koje se racuna. */
type Phase =
  | "idle"
  | "aimAdd"
  | "pressAdd"
  | "added"
  | "aimBag"
  | "pressBag"
  | "open"
  | "aimCheckout"
  | "pressCheckout"
  | "done";

/* Torba, ista kao u traci gore na sajtu — manje linija nego kolica, pa ostaje
   citka i na 20px. */
function Bag({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5.6 8h12.8l1 11.2a1.6 1.6 0 0 1-1.6 1.8H6.2a1.6 1.6 0 0 1-1.6-1.8L5.6 8Z" />
      <path d="M9 10.4V6.9a3 3 0 0 1 6 0v3.5" />
    </svg>
  );
}

export default function CartOpenDemo() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduce ? "open" : "idle");
  const [run, setRun] = useState(0); // bumping this replays the whole thing

  const boxRef = useRef<HTMLDivElement>(null);
  const addRef = useRef<HTMLSpanElement>(null);
  const bagRef = useRef<HTMLSpanElement>(null);
  const checkoutRef = useRef<HTMLSpanElement>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [travel, setTravel] = useState(0.85);

  /* Jedan effect, jedan lanac, i jedini ulazi su brojac ponavljanja i postavka
     za pokret. Svaki setState unutra bi inace ponovo pokrenuo effect i vratio
     sekvencu na pocetak pre nego sto stigne do korpe.

     Pozicije se mere iz kutije prikaza, ne pisu se rukom — prikaz menja sirinu
     sa ekranom, pa bi fiksne koordinate promasile dugme. */
  useEffect(() => {
    if (reduce) {
      setPhase("open");
      return;
    }

    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(() => alive && fn(), ms));

    const spot = (el: HTMLElement | null, fx: number, fy: number) => {
      const box = boxRef.current;
      if (!box || !el) return null;
      const b = box.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return { x: r.left - b.left + r.width * fx, y: r.top - b.top + r.height * fy };
    };

    setPhase("idle");
    // Krece od slike maskice — odatle je put do dugmeta ocigledan.
    const from = spot(addRef.current, 0.12, 2.4);
    if (from) setPointer(from);

    at(600, () => {
      const to = spot(addRef.current, 0.5, 0.5);
      if (to) setPointer(to);
      setTravel(0.85);
      setPhase("aimAdd");
    });
    at(1450, () => setPhase("pressAdd"));
    at(1800, () => setPhase("added"));

    at(2100, () => {
      const to = spot(bagRef.current, 0.5, 0.55);
      if (to) setPointer(to);
      setTravel(0.7);
      setPhase("aimBag");
    });
    at(2850, () => setPhase("pressBag"));
    at(3200, () => setPhase("open"));

    /* Korpa klizi 420ms; meri se tek kad stane, inace bi se dugme izmerilo
       dok je jos van kadra. */
    at(3800, () => {
      const to = spot(checkoutRef.current, 0.5, 0.5);
      if (to) setPointer(to);
      setTravel(0.7);
      setPhase("aimCheckout");
    });
    at(4550, () => setPhase("pressCheckout"));
    at(4900, () => setPhase("done"));

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [run, reduce]);

  const added = phase !== "idle" && phase !== "aimAdd" && phase !== "pressAdd";
  const open =
    phase === "open" ||
    phase === "aimCheckout" ||
    phase === "pressCheckout" ||
    phase === "done";
  const aimingCheckout = phase === "aimCheckout" || phase === "pressCheckout";
  const pressing = phase === "pressAdd" || phase === "pressBag" || phase === "pressCheckout";

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={boxRef}
        className="relative min-h-[300px] overflow-hidden rounded-2xl border border-mastilo/12 bg-white shadow-[0_8px_24px_rgba(8,34,108,0.07)]"
      >
        {/* ---------- traka gore ---------- */}
        <div className="flex items-center justify-between border-b border-mastilo/10 px-4 py-2.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-mastilo">
            Trivela Drop
          </span>

          <span
            ref={bagRef}
            className={`relative grid h-9 w-9 place-items-center rounded-full border text-mastilo transition-colors duration-300 ${
              phase === "aimBag" || phase === "pressBag"
                ? "border-ledena shadow-[0_0_0_3px_rgba(124,196,255,0.22)]"
                : "border-mastilo/15"
            }`}
          >
            <motion.span
              className="inline-flex"
              animate={{ scale: phase === "pressBag" ? 0.9 : added ? 1.08 : 1 }}
              transition={{ duration: 0.24, ease: EASE }}
            >
              <Bag className="h-[20px] w-[20px]" />
            </motion.span>

            {/* Prsten koji odskoci kad maskica upadne u korpu — isto sto traka
                gore radi na sajtu, da se vidi da je klik primljen. */}
            {added && (
              <motion.span
                className="pointer-events-none absolute inset-0 rounded-full border-2 border-ledena"
                initial={{ scale: 1, opacity: 0.9 }}
                animate={{ scale: 1.7, opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                aria-hidden
              />
            )}

            {added && (
              <motion.span
                className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-ledena px-1 text-[10px] font-bold leading-none text-ledena-ink"
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                1
              </motion.span>
            )}
          </span>
        </div>

        {/* ---------- strana proizvoda, ista ona na kojoj se stalo ---------- */}
        <div className="flex gap-4 p-4">
          <div className="aspect-[9/16] w-[96px] shrink-0 overflow-hidden rounded-xl border border-mastilo/12 bg-gradient-to-br from-[#eaf3ff] to-white">
            <img src={ITEM.img} alt={ITEM.name} className="h-full w-full object-cover" />
          </div>

          <div className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-mastilo/50">
              Legends
            </span>
            <span className="mt-1 block text-[20px] font-bold leading-tight text-mastilo">
              {ITEM.name}
            </span>
            <span className="mt-1 block text-[15px] font-bold text-mastilo/85">{ITEM.price}</span>

            <span className="mt-3 block text-[10px] font-semibold uppercase tracking-[0.16em] text-mastilo/45">
              Your phone model
            </span>
            <div className="mt-1.5 rounded-lg border border-mastilo/15 bg-white px-3 py-2 text-[13px] font-medium text-mastilo">
              {ITEM.model}
            </div>

            {/* Dugme je zivo jer je model upisan — u koraku pre ovoga je
                mrtvo dok polje stoji prazno. */}
            <motion.span
              ref={addRef}
              className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#08226c] to-[#14589b] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white"
              animate={{
                scale: phase === "pressAdd" ? 0.95 : 1,
                boxShadow:
                  phase === "aimAdd" || phase === "pressAdd"
                    ? "0 0 0 3px rgba(124,196,255,0.35)"
                    : "0 0 0 0 rgba(124,196,255,0)",
              }}
              transition={{ duration: 0.22, ease: EASE }}
            >
              {added ? "Added to cart" : "Add to cart"}
            </motion.span>
          </div>
        </div>

        {/* ---------- zavesa ispod korpe ---------- */}
        <motion.div
          className="pointer-events-none absolute inset-0 bg-mastilo/45 backdrop-blur-[2px]"
          initial={false}
          animate={{ opacity: open ? 1 : 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          aria-hidden
        />

        {/* ---------- korpa, izlazi sa desne strane ---------- */}
        <motion.aside
          className="absolute right-0 top-0 z-20 flex h-full w-[66%] max-w-[320px] flex-col border-l border-mastilo/12 bg-white shadow-[-8px_0_40px_rgba(8,34,108,0.18)]"
          initial={false}
          animate={{ x: open ? "0%" : "100%" }}
          transition={{ duration: 0.42, ease: EASE }}
          aria-hidden={!open}
        >
          <div className="flex items-center justify-between border-b border-mastilo/12 px-4 py-3">
            <div>
              <span className="block text-[12px] font-semibold uppercase tracking-[0.15em] text-mastilo">
                Your cart
              </span>
              <span className="mt-0.5 block text-[11px] text-mastilo/55">1 item</span>
            </div>
            <span className="grid h-7 w-7 place-items-center rounded-full border border-mastilo/12 text-mastilo/60">
              <LuX className="h-3.5 w-3.5" />
            </span>
          </div>

          <div className="flex-1 px-4">
            <div className="flex gap-3 py-3.5">
              <div className="h-[68px] w-[50px] shrink-0 overflow-hidden rounded-lg border border-mastilo/12 bg-[#eaf3ff]">
                <img src={ITEM.img} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold text-mastilo">
                      {ITEM.name}
                    </span>
                    {/* Model stoji uz maskicu, ne uz porudzbinu — zato dve iste
                        maskice za dva telefona ostaju odvojene. */}
                    <span className="mt-0.5 block truncate text-[10px] uppercase tracking-[0.15em] text-mastilo/55">
                      {ITEM.model}
                    </span>
                  </div>
                  <LuTrash2 className="h-3.5 w-3.5 shrink-0 text-mastilo/40" />
                </div>
                <div className="mt-auto flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-mastilo/20 px-2 py-0.5 text-[11px] text-mastilo/70">
                    <span>−</span>
                    <span className="font-medium text-mastilo">1</span>
                    <span>+</span>
                  </span>
                  <span className="text-[12px] font-bold text-mastilo">{ITEM.price}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-mastilo/12 px-4 py-3.5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] text-mastilo/55">
                Subtotal
              </span>
              <span className="text-[16px] font-bold text-mastilo">{ITEM.price}</span>
            </div>
            {/* Poslednji klik — odavde se ide na sledeci korak, popunjavanje
                podataka za isporuku. */}
            <motion.span
              ref={checkoutRef}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-mastilo py-2.5 text-[12px] font-semibold text-white shadow-[0_10px_30px_rgba(8,34,108,0.28)]"
              animate={{
                scale: phase === "pressCheckout" ? 0.95 : 1,
                boxShadow: aimingCheckout
                  ? "0 0 0 3px rgba(124,196,255,0.45)"
                  : "0 10px 30px rgba(8,34,108,0.28)",
              }}
              transition={{ duration: 0.22, ease: EASE }}
            >
              Checkout <span aria-hidden>→</span>
            </motion.span>
          </div>
        </motion.aside>

        {/* Pokazivac ostaje i preko korpe — tamo ga ceka jos jedan klik.
            Odlazi tek kad je Checkout pritisnut, jer posle toga strana ionako
            odlazi na sledeci korak. */}
        {!reduce && phase !== "done" && (
          <DemoPointer x={pointer.x} y={pointer.y} pressing={pressing} travel={travel} />
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] text-mastilo/50">
          {phase === "done"
            ? "Checkout takes you to the next step — your delivery details."
            : open
              ? "The cart slides in from the right — the model stays with the case."
              : "Watch: Add to cart, then the bag up top."}
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
