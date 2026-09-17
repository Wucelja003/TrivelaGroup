import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  LuImage,
  LuSmartphone,
  LuUser,
  LuMapPin,
  LuStickyNote,
  LuSend,
  LuLayoutGrid,
  LuShoppingBag,
  LuTruck,
  LuCircleCheck,
  LuArrowRight,
  LuCheck,
  LuX,
} from "react-icons/lu";
import Typewriter from "./Typewriter";
import ShopClickDemo from "./ShopClickDemo";
import CartOpenDemo from "./CartOpenDemo";

/*
 * "How it works" za Trivela Drop — dva vodica u jednom: kako poslati zahtev za
 * custom maskicu, i kako naruciti maskicu iz drop-a.
 *
 * Isti oblik kao Tournament Journey na Atakhan League: koraci levo, prikaz
 * desno. Boje su Drop — bela podloga, teget tekst (#08226c), ledeno plavi
 * akcenti (#7cc4ff).
 *
 * Svaki panel pokazuje kako polje stvarno izgleda popunjeno, umesto da opisuje
 * recima sta treba upisati. Zato su primeri konkretni ("iPhone 15 Pro", ne
 * "model telefona") — covek prepise oblik, ne smisao.
 *
 * Tekst je u prevodima pod drop.journey.* — koraci pod steps.<panel>, jer
 * svaki korak ima jedinstven panel.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

const NAVY = "#08226c";

/* Typing speeds, in ms per character. The copy on the left runs fast enough not
   to hold anyone up; the values in the fields go slower because they are the
   thing to read and copy. */
const COPY_SPEED = 13;
const VALUE_SPEED = 26;

/* Fields type one after another rather than all at once — six cursors going at
   the same time reads as noise. Each waits for the ones above it to finish. */
function delaysFor(values: string[], gap = 240): number[] {
  let t = 140;
  return values.map((v) => {
    const at = t;
    t += v.length * VALUE_SPEED + gap;
    return at;
  });
}

/* true once `ms` has passed since this mounted. The panel remounts on every
   step change, so the sequence restarts with it. */
function useStartAfter(ms: number): boolean {
  const [on, setOn] = useState(ms <= 0);
  useEffect(() => {
    if (ms <= 0) return;
    const id = setTimeout(() => setOn(true), ms);
    return () => clearTimeout(id);
  }, [ms]);
  return on;
}

type PanelKind =
  | "image"
  | "model"
  | "contact"
  | "address"
  | "extras"
  | "send"
  | "browse"
  | "cart"
  | "details"
  | "placed";

/* Tekst koraka (naslov, meta, labela, opis) je u drop.journey.steps.<panel>. */
type Step = {
  icon: typeof LuImage;
  panel: PanelKind;
};

const CUSTOM_STEPS: Step[] = [
  { icon: LuImage, panel: "image" },
  { icon: LuSmartphone, panel: "model" },
  { icon: LuUser, panel: "contact" },
  { icon: LuMapPin, panel: "address" },
  { icon: LuStickyNote, panel: "extras" },
  { icon: LuSend, panel: "send" },
];

const ORDER_STEPS: Step[] = [
  { icon: LuLayoutGrid, panel: "browse" },
  { icon: LuShoppingBag, panel: "cart" },
  { icon: LuTruck, panel: "details" },
  { icon: LuCircleCheck, panel: "placed" },
];

/* ---------- small pieces the panels are built from ---------- */

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-dashed border-mastilo/25 bg-[#f4f9ff] px-4 py-3">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[rgba(124,196,255,0.25)] text-mastilo">
        <LuArrowRight className="h-3.5 w-3.5" />
      </span>
      <span className="text-[13px] leading-relaxed text-mastilo/70">{children}</span>
    </div>
  );
}

/* A field filling itself in, the way it would if someone were typing it. The
   value is the point — it's the shape a visitor copies — so it types rather than
   simply appearing, and the tick only lands once it's finished. */
function FieldMock({
  label,
  value,
  hint,
  after = 0,
}: {
  label: string;
  value: string;
  hint?: string;
  after?: number;
}) {
  const start = useStartAfter(after);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!start) return;
    const id = setTimeout(() => setDone(true), value.length * VALUE_SPEED + 120);
    return () => clearTimeout(id);
  }, [start, value]);

  return (
    <div>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-mastilo/50">
        {label}
      </span>
      <div
        className={`flex items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 transition-colors duration-300 ${
          start && !done
            ? "border-ledena shadow-[0_0_0_3px_rgba(124,196,255,0.18)]"
            : "border-mastilo/15 shadow-[0_2px_10px_rgba(8,34,108,0.05)]"
        }`}
      >
        <span className="min-w-0 truncate text-[15px] font-medium text-mastilo">
          <Typewriter text={value} start={start} speed={VALUE_SPEED} />
        </span>
        <LuCheck
          className={`h-4 w-4 shrink-0 text-[#1c9d54] transition-opacity duration-300 ${
            done ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
      {hint && <span className="mt-1.5 block text-[12px] text-mastilo/50">{hint}</span>}
    </div>
  );
}

function DoDont({ good, bad }: { good: string[]; bad: string[] }) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-[#1c9d54]/25 bg-[#1c9d54]/[0.06] p-4">
        <span className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#127a3f]">
          <LuCheck className="h-3.5 w-3.5" /> {t("drop.journey.sendThis")}
        </span>
        <ul className="flex flex-col gap-2">
          {good.map((g) => (
            <li key={g} className="text-[13px] leading-relaxed text-mastilo/75">
              {g}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-[#d13b3b]/25 bg-[#d13b3b]/[0.05] p-4">
        <span className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#b32c2c]">
          <LuX className="h-3.5 w-3.5" /> {t("drop.journey.notThis")}
        </span>
        <ul className="flex flex-col gap-2">
          {bad.map((b) => (
            <li key={b} className="text-[13px] leading-relaxed text-mastilo/75">
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* Real cases from the drop, used as the example of a finished print. */
function CaseStrip({ images, caption }: { images: string[]; caption: string }) {
  return (
    <div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {images.map((src) => (
          <div
            key={src}
            className="relative aspect-[9/16] w-[92px] shrink-0 overflow-hidden rounded-xl border border-mastilo/12 bg-gradient-to-br from-[#eaf3ff] to-white shadow-[0_6px_18px_rgba(8,34,108,0.10)]"
          >
            <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
          </div>
        ))}
      </div>
      <span className="mt-2 block text-[12px] text-mastilo/50">{caption}</span>
    </div>
  );
}

/* Primeri koji se ne prevode — oblik koji posetilac prepise. */
const GOOD_MODELS = ["iPhone 18 Pro", "iPhone 17 Pro Max", "Samsung Galaxy S24 Ultra"];

function Panel({ kind }: { kind: PanelKind }) {
  // Hook mora ici pre switch-a (ne sme uslovno).
  const { t } = useTranslation();
  const p = t("drop.journey.panels", { returnObjects: true });

  switch (kind) {
    case "image":
      return (
        <div className="flex flex-col gap-5">
          <CaseStrip
            images={["/dropHero/messi.png", "/dropHero/nole.png", "/dropHero/haland.png"]}
            caption={p.image.caption}
          />
          <DoDont good={p.image.good} bad={p.image.bad} />
          <Note>{p.image.note}</Note>
        </div>
      );

    case "model": {
      return (
        <div className="flex flex-col gap-5">
          <FieldMock label={p.model.label} value="iPhone 18 Pro" hint={p.model.hint} />
          <DoDont good={GOOD_MODELS} bad={p.model.bad} />
          <Note>{p.model.note}</Note>
        </div>
      );
    }

    case "contact": {
      const v = ["Marko Marković", "marko.markovic@gmail.com", "+381 64 123 4567"];
      const d = delaysFor(v);
      return (
        <div className="flex flex-col gap-4">
          <FieldMock label={p.contact.name} value={v[0]} after={d[0]} />
          <FieldMock
            label={p.contact.email}
            value={v[1]}
            after={d[1]}
            hint={p.contact.emailHint}
          />
          <FieldMock
            label={p.contact.phone}
            value={v[2]}
            after={d[2]}
            hint={p.contact.phoneHint}
          />
        </div>
      );
    }

    case "address": {
      const v = ["Bulevar Oslobođenja 12/4", "Novi Sad", "21000", p.address.countryValue];
      const d = delaysFor(v);
      return (
        <div className="flex flex-col gap-4">
          <FieldMock label={p.address.address} value={v[0]} after={d[0]} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldMock label={p.address.city} value={v[1]} after={d[1]} />
            <FieldMock label={p.address.postal} value={v[2]} after={d[2]} />
          </div>
          <FieldMock label={p.address.country} value={v[3]} after={d[3]} />
          <Note>{p.address.note}</Note>
        </div>
      );
    }

    case "extras":
      return (
        <div className="flex flex-col gap-5">
          <FieldMock label={p.extras.quantity} value="2" hint={p.extras.quantityHint} />
          <div>
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-mastilo/50">
              {p.extras.notes}
            </span>
            <div className="rounded-xl border border-mastilo/15 bg-white px-4 py-3 text-[14px] leading-relaxed text-mastilo shadow-[0_2px_10px_rgba(8,34,108,0.05)]">
              <Typewriter text={p.extras.notesValue} speed={16} />
            </div>
          </div>
          <Note>{p.extras.note}</Note>
        </div>
      );

    case "send":
      return (
        <div className="flex flex-col gap-5">
          <ol className="flex flex-col">
            {p.send.list.map((line, i) => (
              <li
                key={i}
                className="flex items-center gap-3 border-b border-mastilo/10 py-3 last:border-b-0"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#7cc4ff] to-[#14589b] text-[12px] font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-[14px] leading-relaxed text-mastilo/80">{line}</span>
              </li>
            ))}
          </ol>
          <a
            href="#custom-case"
            className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-gradient-to-r from-[#08226c] to-[#14589b] px-8 py-3.5 text-[13px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_16px_36px_-8px_rgba(8,34,108,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-8px_rgba(124,196,255,0.6)]"
          >
            {p.send.cta}
            <LuArrowRight className="h-4 w-4" />
          </a>
        </div>
      );

    case "browse":
      return (
        <div className="flex flex-col gap-5">
          <ShopClickDemo />

          {/* The model is typed, not picked off a list, so the rule that goes
              with it belongs next to the demo that types it. */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-mastilo/12 bg-[#f4f9ff] p-4">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-mastilo/40">
                {p.browse.fieldEmpty}
              </span>
              <span className="inline-flex w-full items-center justify-center rounded-full bg-mastilo/10 px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] text-mastilo/35">
                {t("drop.product.addToCart")}
              </span>
            </div>
            <div className="rounded-2xl border border-mastilo/12 bg-[#f4f9ff] p-4">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-mastilo/40">
                {p.browse.modelWritten}
              </span>
              <span className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#08226c] to-[#14589b] px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] text-white">
                {t("drop.product.addToCart")}
              </span>
            </div>
          </div>

          <Note>{p.browse.note}</Note>
          <Link
            to="/drop#drop-grid"
            className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-mastilo/20 bg-white px-7 py-3 text-[13px] font-bold uppercase tracking-[0.12em] text-mastilo transition-all duration-300 hover:-translate-y-0.5 hover:border-mastilo/40"
          >
            {p.browse.goToAll}
            <LuArrowRight className="h-4 w-4" />
          </Link>
        </div>
      );

    case "cart":
      return (
        <div className="flex flex-col gap-5">
          <CartOpenDemo />
          <Note>{p.cart.note}</Note>
        </div>
      );

    case "details": {
      const v = [
        "Marko",
        "Marković",
        "marko.markovic@gmail.com",
        "+381 64 123 4567",
        "Bulevar Oslobođenja 12/4",
        "Novi Sad",
        "21000",
      ];
      // Seven fields typed one by one would be a long wait, so this one runs
      // with barely a gap between them — it reads as a form being filled in.
      const d = delaysFor(v, 90);
      const rows: [string, string][] = [
        [t("drop.checkout.subtotal"), "4.980 RSD"],
        [t("drop.checkout.shippingLabel"), t("drop.checkout.free")],
      ];
      return (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldMock label={p.details.firstName} value={v[0]} after={d[0]} />
            <FieldMock label={p.details.lastName} value={v[1]} after={d[1]} />
          </div>
          <FieldMock label={p.details.email} value={v[2]} after={d[2]} />
          <FieldMock label={p.details.phone} value={v[3]} after={d[3]} />
          <FieldMock label={p.details.address} value={v[4]} after={d[4]} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldMock label={p.details.city} value={v[5]} after={d[5]} />
            <FieldMock label={p.details.postal} value={v[6]} after={d[6]} />
          </div>

          <div className="mt-1 rounded-2xl border border-mastilo/12 bg-white p-4">
            {rows.map(([k, val], i) => (
              <div key={i} className="flex items-center justify-between py-1.5 text-[13px]">
                <span className="text-mastilo/60">{k}</span>
                <span className="font-semibold text-mastilo">{val}</span>
              </div>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-mastilo/10 pt-3">
              <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-mastilo/50">
                {t("drop.checkout.total")}
              </span>
              <span className="text-[18px] font-bold text-mastilo">4.980 RSD</span>
            </div>
            <span className="mt-2 block text-[12px] text-[#127a3f]">
              {p.details.freeNote}
            </span>
          </div>
        </div>
      );
    }

    case "placed":
      return (
        <div className="flex flex-col items-center gap-5 py-4 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[#7cc4ff] to-[#14589b] text-white shadow-[0_16px_40px_-8px_rgba(124,196,255,0.7)]">
            <LuCircleCheck className="h-8 w-8" />
          </span>
          <div>
            <span className="block text-[24px] font-bold leading-tight text-mastilo">
              {p.placed.title}
            </span>
            <span className="mt-2 block text-[14px] text-mastilo/60">
              {p.placed.numberIs}
            </span>
            <span className="mt-1 block font-mono text-[20px] font-bold tracking-wider text-mastilo">
              TRV-8K21QP
            </span>
          </div>
          <Note>{p.placed.note}</Note>
        </div>
      );

    default:
      return null;
  }
}

/* ---------- the journey itself ---------- */

const FLOWS = [
  { key: "custom" as const, steps: CUSTOM_STEPS },
  { key: "order" as const, steps: ORDER_STEPS },
];

export default function TrivelaJourney() {
  const { t } = useTranslation();
  const flowText = t("drop.journey.flows", { returnObjects: true });
  const stepText = t("drop.journey.steps", { returnObjects: true });

  const [flowKey, setFlowKey] = useState<"custom" | "order">("custom");
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  const flow = FLOWS.find((f) => f.key === flowKey)!;
  const flowCopy = flowText[flowKey];
  const step = flow.steps[active];

  const switchFlow = (key: "custom" | "order") => {
    setFlowKey(key);
    // Step 4 of one guide means nothing in the other.
    setActive(0);
  };

  return (
    <section
      id="how-it-works"
      className="relative w-full overflow-hidden bg-gradient-to-b from-white via-[#f6faff] to-white px-5 py-20 sm:px-8 sm:py-28"
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* Heading */}
        <div className="mb-10 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-mastilo">
            {flowCopy.eyebrow}
          </span>
          <h2 className="mt-4 bg-gradient-to-b from-[#1c6bb8] via-[#0d3f70] to-[#08226c] bg-clip-text pb-[0.16em] text-4xl font-extrabold leading-[1.05] tracking-tight text-transparent sm:text-5xl lg:text-6xl">
            {flowCopy.heading}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-mastilo/60">{flowCopy.sub}</p>
        </div>

        {/* Which guide */}
        <div className="mb-12 flex justify-center">
          <div
            role="tablist"
            aria-label={t("drop.journey.guides")}
            className="inline-flex gap-1 rounded-full border border-mastilo/12 bg-white p-1 shadow-[0_8px_24px_rgba(8,34,108,0.07)]"
          >
            {FLOWS.map((f) => {
              const on = f.key === flowKey;
              return (
                <button
                  key={f.key}
                  role="tab"
                  aria-selected={on}
                  onClick={() => switchFlow(f.key)}
                  className={`relative rounded-full px-6 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] transition-colors duration-200 ${
                    on ? "text-white" : "text-mastilo/60 hover:text-mastilo"
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="tj-flow"
                      transition={{ duration: 0.35, ease: EASE }}
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[#08226c] to-[#14589b]"
                      aria-hidden
                    />
                  )}
                  <span className="relative">{flowText[f.key].tab}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(320px,0.95fr)_1.15fr] lg:items-start lg:gap-14">
          {/* Left — the steps */}
          <div role="tablist" aria-label={flowCopy.heading} className="flex flex-col gap-2">
            {flow.steps.map((s, i) => {
              const on = active === i;
              const Icon = s.icon;
              const copy = stepText[s.panel];
              return (
                <button
                  key={s.panel}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActive(i)}
                  className="relative w-full cursor-pointer rounded-2xl px-5 py-4 text-left transition-colors duration-200"
                >
                  {on && (
                    <motion.span
                      layoutId="tj-step"
                      transition={{ duration: 0.4, ease: EASE }}
                      className="absolute inset-0 rounded-2xl border border-[rgba(124,196,255,0.6)] bg-white shadow-[0_10px_30px_rgba(8,34,108,0.08)]"
                      aria-hidden
                    />
                  )}
                  <span className="relative flex items-start gap-4">
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors duration-200 ${
                        on
                          ? "border-transparent bg-gradient-to-br from-[#08226c] to-[#14589b] text-white"
                          : "border-mastilo/15 bg-white text-mastilo/45"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span
                          className={`text-[17px] font-bold leading-snug tracking-tight sm:text-[18px] ${
                            on ? "text-mastilo" : "text-mastilo/70"
                          }`}
                        >
                          {copy.title}
                        </span>
                        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-mastilo/40">
                          {copy.meta}
                        </span>
                      </span>
                      <AnimatePresence initial={false}>
                        {on && (
                          <motion.span
                            key="copy"
                            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: EASE }}
                            className="block overflow-hidden"
                          >
                            <span className="block pt-2 text-[13.5px] leading-relaxed text-mastilo/60">
                              {/* Types itself out when the card opens. The full
                                  text is always in the DOM holding its space, so
                                  the card doesn't grow line by line while it
                                  runs. */}
                              <Typewriter text={copy.copy} speed={COPY_SPEED} />
                            </span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right — what that step looks like */}
          <div className="min-w-0">
            <div className="rounded-3xl border border-mastilo/12 bg-white/70 p-2 backdrop-blur-sm">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-mastilo">
                  {stepText[step.panel].label}
                </span>
                <span className="text-[11px] font-medium text-mastilo/45">
                  {t("drop.journey.stepOf", {
                    current: active + 1,
                    total: flow.steps.length,
                  })}
                </span>
              </div>
              <div className="min-h-[420px] rounded-2xl border border-mastilo/10 bg-gradient-to-b from-[#fbfdff] to-white p-5 sm:p-7">
                <motion.div
                  key={`${flowKey}-${active}`}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <Panel kind={step.panel} />
                </motion.div>
              </div>
            </div>

            {/* Step through without going back to the list */}
            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                onClick={() => setActive((i) => Math.max(0, i - 1))}
                disabled={active === 0}
                className="rounded-full border border-mastilo/15 bg-white px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] text-mastilo transition-all duration-200 hover:border-mastilo/35 disabled:cursor-not-allowed disabled:opacity-35"
              >
                {t("drop.journey.back")}
              </button>
              <div className="flex gap-1.5" aria-hidden>
                {flow.steps.map((s, i) => (
                  <span
                    key={s.panel}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === active ? "w-6 bg-[color:var(--color-mastilo)]" : "w-1.5 bg-mastilo/20"
                    }`}
                    style={i === active ? { backgroundColor: NAVY } : undefined}
                  />
                ))}
              </div>
              <button
                onClick={() => setActive((i) => Math.min(flow.steps.length - 1, i + 1))}
                disabled={active === flow.steps.length - 1}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#08226c] to-[#14589b] px-6 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_10px_26px_-8px_rgba(8,34,108,0.6)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0"
              >
                {t("drop.journey.next")}
                <LuArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
