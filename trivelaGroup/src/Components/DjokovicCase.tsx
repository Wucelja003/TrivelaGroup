import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/*
 * Izdvojena maskica — Novak Đoković, sa vise varijacija boje. Ispod/pored
 * slike su mali krugovi (swatch-evi); klik menja prikazanu maskicu uz meki
 * crossfade. Slike: /public/DjokovicCases (4:5, transparentne).
 *
 * Drop je svetla tema: bela podloga, mastilo (navy) tekst, ledeno plavi akcenti.
 */
interface Variant {
  name: string;
  file: string;
  /* boja kruga (swatch) i sjaja iza slike */
  swatch: string;
}

const VARIANTS: Variant[] = [
  { name: "Green", file: "DjokovicZelena", swatch: "#1f7a3d" },
  { name: "Light Green", file: "DjokovicSvetloZelena", swatch: "#a3e043" },
  { name: "Blue", file: "DjokovicPlava", swatch: "#2b6cb0" },
  { name: "Black", file: "DjokovicCrna", swatch: "#1a1a1a" },
];

export default function DjokovicCase() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const v = VARIANTS[active];

  return (
    <section id="djokovic" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Slika maskice */}
        <div className="relative mx-auto w-full max-w-[400px] lg:order-2">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] blur-2xl transition-colors duration-500"
            style={{ background: `radial-gradient(60% 60% at 50% 45%, ${v.swatch}55, transparent 70%)` }}
          />
          <div className="relative aspect-[4/5] w-full">
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={v.file}
                src={`/DjokovicCases/${v.file}.PNG`}
                alt={`Novak Đoković case — ${v.name}`}
                initial={{ opacity: 0, y: reduce ? 0 : 14, scale: reduce ? 1 : 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: reduce ? 0 : -14, scale: reduce ? 1 : 0.98 }}
                transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_30px_50px_rgba(6,41,77,0.25)]"
              />
            </AnimatePresence>
          </div>
        </div>

        {/* Info + izbor boje */}
        <div className="lg:order-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-ledena-ink/70">
            Featured drop
          </span>
          <h2 className="mt-3 text-4xl font-bold leading-[1.05] tracking-tight text-mastilo sm:text-5xl">
            Novak Đoković
          </h2>
          <p className="mt-4 max-w-md text-mastilo/65">
            One icon, four looks. Pick your colour — the case swaps instantly.
            Made to carry the GOAT wherever you go.
          </p>

          {/* Swatch-evi */}
          <div className="mt-8">
            <div className="mb-3 text-sm font-semibold text-mastilo">
              Colour: <span className="text-mastilo/60">{v.name}</span>
            </div>
            <div className="flex items-center gap-3">
              {VARIANTS.map((opt, i) => {
                const on = i === active;
                return (
                  <button
                    key={opt.file}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={opt.name}
                    aria-pressed={on}
                    title={opt.name}
                    className={`relative h-9 w-9 rounded-full border transition-all duration-200 ${
                      on
                        ? "border-mastilo ring-2 ring-mastilo ring-offset-2 ring-offset-white"
                        : "border-mastilo/20 hover:scale-110"
                    }`}
                    style={{ backgroundColor: opt.swatch }}
                  />
                );
              })}
            </div>
          </div>

          <Link
            to="/getInTouch"
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-mastilo px-8 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-ledena-ink hover:shadow-[0_16px_36px_-10px_rgba(6,41,77,0.5)]"
          >
            Order yours
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
