import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  LuImage,
  LuSmartphone,
  LuUser,
  LuMapPin,
  LuStickyNote,
  LuSend,
  LuLayoutGrid,
  LuScanSearch,
  LuShoppingBag,
  LuTruck,
  LuCircleCheck,
  LuArrowRight,
  LuCheck,
  LuX,
} from "react-icons/lu";
import Typewriter from "./Typewriter";

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
  | "open"
  | "pickModel"
  | "cart"
  | "details"
  | "placed";

type Step = {
  icon: typeof LuImage;
  title: string;
  meta: string;
  label: string;
  copy: string;
  panel: PanelKind;
};

const CUSTOM_STEPS: Step[] = [
  {
    icon: LuImage,
    title: "Upload your picture",
    meta: "Start here",
    label: "The image",
    copy: "The photo is the whole case, so it decides how the case turns out. Send the biggest version you have — straight from the camera roll, not a screenshot and not something saved off Instagram.",
    panel: "image",
  },
  {
    icon: LuSmartphone,
    title: "Write your exact phone model",
    meta: "Be precise",
    label: "Phone model",
    copy: "Write the full model, including Pro or Max. A 15 Pro case does not fit a 15, and the camera cut-out is the part that goes wrong.",
    panel: "model",
  },
  {
    icon: LuUser,
    title: "Leave your name and contact",
    meta: "So we can reply",
    label: "Contact",
    copy: "Full name, an email you actually read, and a phone number. We come back to you with the mock-up on the email, and the courier calls the number.",
    panel: "contact",
  },
  {
    icon: LuMapPin,
    title: "Where it should arrive",
    meta: "Delivery",
    label: "Address",
    copy: "Street with the number, city, postal code and country. Add the flat or floor in the notes if the building needs it — that is what saves a failed delivery.",
    panel: "address",
  },
  {
    icon: LuStickyNote,
    title: "How many, and anything else",
    meta: "Optional",
    label: "Quantity & notes",
    copy: "Say how many cases you want, and use the notes for anything the picture cannot say: a name to print, which part to keep in frame, a deadline you need it by.",
    panel: "extras",
  },
  {
    icon: LuSend,
    title: "Send it and wait for the mock-up",
    meta: "Then us",
    label: "After you send",
    copy: "We answer with a mock-up of how your case will look. Nothing is printed until you say yes to it.",
    panel: "send",
  },
];

const ORDER_STEPS: Step[] = [
  {
    icon: LuLayoutGrid,
    title: "Browse the drop",
    meta: "Start here",
    label: "All cases",
    copy: "Every case we have ready is on the Drop page. Filter by collection, or sort by name or price to get to yours faster.",
    panel: "browse",
  },
  {
    icon: LuScanSearch,
    title: "Open the case you want",
    meta: "Look closer",
    label: "The case",
    copy: "Tap a case to open it full size, with its price and collection. This is where you check the print before you commit to it.",
    panel: "open",
  },
  {
    icon: LuSmartphone,
    title: "Pick your phone model",
    meta: "Required",
    label: "Your model",
    copy: "Choose your model from the list. The Add to cart button stays off until you do — that is on purpose, because a case is cut for one model only.",
    panel: "pickModel",
  },
  {
    icon: LuShoppingBag,
    title: "Add it to the cart",
    meta: "Collect",
    label: "Cart",
    copy: "The cart opens from the side and keeps the model with each case, so two of the same print for two different phones stay apart.",
    panel: "cart",
  },
  {
    icon: LuTruck,
    title: "Fill in the delivery details",
    meta: "Checkout",
    label: "Checkout",
    copy: "Name, email, phone, address, city and postal code. Shipping is free over 6.000 RSD and 590 RSD under it — the total updates as you go.",
    panel: "details",
  },
  {
    icon: LuCircleCheck,
    title: "Place the order",
    meta: "Done",
    label: "Confirmation",
    copy: "You get an order number on screen and by email. Keep it — it is what we look you up by if you write to us.",
    panel: "placed",
  },
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
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-[#1c9d54]/25 bg-[#1c9d54]/[0.06] p-4">
        <span className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#127a3f]">
          <LuCheck className="h-3.5 w-3.5" /> Send this
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
          <LuX className="h-3.5 w-3.5" /> Not this
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

function Panel({ kind }: { kind: PanelKind }) {
  switch (kind) {
    case "image":
      return (
        <div className="flex flex-col gap-5">
          <CaseStrip
            images={["/dropHero/messi.png", "/dropHero/nole.png", "/dropHero/haland.png"]}
            caption="Cases we printed from photos customers sent in."
          />
          <DoDont
            good={[
              "The original photo, straight from your gallery",
              "The face or subject fully in frame, not cropped at the edge",
              "Good light — what looks dull on screen prints dull",
            ]}
            bad={[
              "A screenshot of a photo",
              "An image saved from Instagram or WhatsApp — both shrink it",
              "A picture that is already blurry when you zoom in",
            ]}
          />
          <Note>
            Not sure whether yours is big enough? Send it anyway — we check it and tell you
            before anything is printed.
          </Note>
        </div>
      );

    case "model": {
      return (
        <div className="flex flex-col gap-5">
          <FieldMock
            label="Phone model"
            value="iPhone 18 Pro"
            hint="Type it in full — the Pro and the Max are different cases."
          />
          <DoDont
            good={["iPhone 18 Pro", "iPhone 17 Pro Max", "Samsung Galaxy S24 Ultra"]}
            bad={["iPhone", "the new one", "18 pro maybe"]}
          />
          <Note>
            Not sure your model is one we cut? Write it anyway — we tell you before anything is
            printed.
          </Note>
        </div>
      );
    }

    case "contact": {
      const v = ["Marko Marković", "marko.markovic@gmail.com", "+381 64 123 4567"];
      const d = delaysFor(v);
      return (
        <div className="flex flex-col gap-4">
          <FieldMock label="Full name" value={v[0]} after={d[0]} />
          <FieldMock
            label="Email"
            value={v[1]}
            after={d[1]}
            hint="The mock-up goes here, so use one you check."
          />
          <FieldMock
            label="Phone"
            value={v[2]}
            after={d[2]}
            hint="The courier calls this number."
          />
        </div>
      );
    }

    case "address": {
      const v = ["Bulevar Oslobođenja 12/4", "Novi Sad", "21000", "Serbia"];
      const d = delaysFor(v);
      return (
        <div className="flex flex-col gap-4">
          <FieldMock label="Address" value={v[0]} after={d[0]} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldMock label="City" value={v[1]} after={d[1]} />
            <FieldMock label="Postal code" value={v[2]} after={d[2]} />
          </div>
          <FieldMock label="Country" value={v[3]} after={d[3]} />
          <Note>
            Flat number, floor, or an intercom that does not work — put it in the notes on the
            next step. That is what stops a delivery coming back to us.
          </Note>
        </div>
      );
    }

    case "extras":
      return (
        <div className="flex flex-col gap-5">
          <FieldMock label="Quantity" value="2" hint="Same picture on two cases, or two models." />
          <div>
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-mastilo/50">
              Notes
            </span>
            <div className="rounded-xl border border-mastilo/15 bg-white px-4 py-3 text-[14px] leading-relaxed text-mastilo shadow-[0_2px_10px_rgba(8,34,108,0.05)]">
              <Typewriter
                text="“Second case is for a Samsung S24. Please keep both of us in frame and print the name MARKO under the photo. Needed before the 20th if possible.”"
                speed={16}
              />
            </div>
          </div>
          <Note>
            Anything the picture cannot say belongs here — a name to print, which part to keep,
            a date you need it by.
          </Note>
        </div>
      );

    case "send":
      return (
        <div className="flex flex-col gap-5">
          <ol className="flex flex-col">
            {[
              "Your request lands with us, picture and all",
              "We come back on email with a mock-up of your case",
              "You say yes — or ask for a change, as many times as it takes",
              "Only then do we print it and send it out",
            ].map((t, i) => (
              <li
                key={t}
                className="flex items-center gap-3 border-b border-mastilo/10 py-3 last:border-b-0"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#7cc4ff] to-[#14589b] text-[12px] font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-[14px] leading-relaxed text-mastilo/80">{t}</span>
              </li>
            ))}
          </ol>
          <a
            href="#custom-case"
            className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-gradient-to-r from-[#08226c] to-[#14589b] px-8 py-3.5 text-[13px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_16px_36px_-8px_rgba(8,34,108,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-8px_rgba(124,196,255,0.6)]"
          >
            Send my request
            <LuArrowRight className="h-4 w-4" />
          </a>
        </div>
      );

    case "browse":
      return (
        <div className="flex flex-col gap-5">
          <CaseStrip
            images={[
              "/dropHero/cr7.png",
              "/dropHero/mbappe.png",
              "/dropHero/vini.png",
              "/dropHero/musa.png",
            ]}
            caption="Part of what is in the drop right now."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-mastilo/12 bg-white p-4">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-mastilo/50">
                Filter by collection
              </span>
              <span className="text-[13px] text-mastilo/70">
                Narrow the grid down to one collection at a time.
              </span>
            </div>
            <div className="rounded-2xl border border-mastilo/12 bg-white p-4">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-mastilo/50">
                Sort
              </span>
              <span className="text-[13px] text-mastilo/70">
                Name A–Z or Z–A, price low to high or high to low.
              </span>
            </div>
          </div>
          <Link
            to="/drop#drop-grid"
            className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-mastilo/20 bg-white px-7 py-3 text-[13px] font-bold uppercase tracking-[0.12em] text-mastilo transition-all duration-300 hover:-translate-y-0.5 hover:border-mastilo/40"
          >
            Go to all cases
            <LuArrowRight className="h-4 w-4" />
          </Link>
        </div>
      );

    case "open":
      return (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-5 rounded-2xl border border-mastilo/12 bg-white p-4 shadow-[0_8px_24px_rgba(8,34,108,0.07)]">
            <div className="relative aspect-[9/16] w-[104px] shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#eaf3ff] to-white">
              <img src="/dropHero/nole.png" alt="" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-mastilo/50">
                Legends
              </span>
              <span className="mt-1 block text-[22px] font-bold leading-tight text-mastilo">
                Nole
              </span>
              <span className="mt-2 block text-[16px] font-semibold text-mastilo/80">
                2.490 RSD
              </span>
            </div>
          </div>
          <Note>
            The price on the case is the price you pay for it — shipping is counted separately at
            the end.
          </Note>
        </div>
      );

    case "pickModel": {
      return (
        <div className="flex flex-col gap-5">
          <FieldMock label="Your phone model" value="iPhone 18 Pro" />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-mastilo/12 bg-[#f4f9ff] p-4">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-mastilo/40">
                Field empty
              </span>
              <span className="inline-flex w-full items-center justify-center rounded-full bg-mastilo/10 px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] text-mastilo/35">
                Add to cart
              </span>
            </div>
            <div className="rounded-2xl border border-mastilo/12 bg-[#f4f9ff] p-4">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-mastilo/40">
                Model written
              </span>
              <span className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#08226c] to-[#14589b] px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] text-white">
                Add to cart
              </span>
            </div>
          </div>

          <Note>
            The button stays dead until the field has something in it — a case is cut for one
            model, and the camera cut-out is what goes wrong otherwise.
          </Note>
        </div>
      );
    }

    case "cart":
      return (
        <div className="flex flex-col gap-5">
          <div className="overflow-hidden rounded-2xl border border-mastilo/12 bg-white shadow-[0_8px_24px_rgba(8,34,108,0.07)]">
            {[
              { img: "/dropHero/nole.png", name: "Nole", model: "iPhone 15 Pro", price: "2.490 RSD" },
              { img: "/dropHero/messi.png", name: "Messi", model: "Samsung S24", price: "2.490 RSD" },
            ].map((it) => (
              <div
                key={it.name}
                className="flex items-center gap-3 border-b border-mastilo/10 px-4 py-3 last:border-b-0"
              >
                <div className="aspect-[9/16] w-9 shrink-0 overflow-hidden rounded-md bg-[#eaf3ff]">
                  <img src={it.img} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-mastilo">
                    {it.name}
                  </span>
                  <span className="block text-[12px] text-mastilo/55">{it.model}</span>
                </div>
                <span className="shrink-0 text-[13px] font-semibold text-mastilo">{it.price}</span>
              </div>
            ))}
          </div>
          <Note>
            Same print, two different phones — the cart keeps them apart because the model rides
            along with each case.
          </Note>
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
      return (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldMock label="First name" value={v[0]} after={d[0]} />
            <FieldMock label="Last name" value={v[1]} after={d[1]} />
          </div>
          <FieldMock label="Email" value={v[2]} after={d[2]} />
          <FieldMock label="Phone" value={v[3]} after={d[3]} />
          <FieldMock label="Address" value={v[4]} after={d[4]} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldMock label="City" value={v[5]} after={d[5]} />
            <FieldMock label="Postal code" value={v[6]} after={d[6]} />
          </div>

          <div className="mt-1 rounded-2xl border border-mastilo/12 bg-white p-4">
            {[
              ["Subtotal", "4.980 RSD"],
              ["Shipping", "Free"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-1.5 text-[13px]">
                <span className="text-mastilo/60">{k}</span>
                <span className="font-semibold text-mastilo">{v}</span>
              </div>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-mastilo/10 pt-3">
              <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-mastilo/50">
                Total
              </span>
              <span className="text-[18px] font-bold text-mastilo">4.980 RSD</span>
            </div>
            <span className="mt-2 block text-[12px] text-[#127a3f]">
              Free shipping over 6.000 RSD — under that it is 590 RSD.
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
              Order placed
            </span>
            <span className="mt-2 block text-[14px] text-mastilo/60">
              Your order number is
            </span>
            <span className="mt-1 block font-mono text-[20px] font-bold tracking-wider text-mastilo">
              TRV-8K21QP
            </span>
          </div>
          <Note>
            The same number goes to your email. Keep it — it is how we find your order if you
            write to us.
          </Note>
        </div>
      );

    default:
      return null;
  }
}

/* ---------- the journey itself ---------- */

const FLOWS = [
  {
    key: "custom" as const,
    tab: "Custom case",
    eyebrow: "Your picture, our case",
    heading: "How to send a custom request",
    sub: "What to write, field by field — so the first mock-up is already the right one.",
    steps: CUSTOM_STEPS,
  },
  {
    key: "order" as const,
    tab: "Order a case",
    eyebrow: "From the drop",
    heading: "How to order a case",
    sub: "Six steps from the grid to a confirmed order.",
    steps: ORDER_STEPS,
  },
];

export default function TrivelaJourney() {
  const [flowKey, setFlowKey] = useState<"custom" | "order">("custom");
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  const flow = FLOWS.find((f) => f.key === flowKey)!;
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
            {flow.eyebrow}
          </span>
          <h2 className="mt-4 bg-gradient-to-b from-[#1c6bb8] via-[#0d3f70] to-[#08226c] bg-clip-text pb-[0.16em] text-4xl font-extrabold leading-[1.05] tracking-tight text-transparent sm:text-5xl lg:text-6xl">
            {flow.heading}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-mastilo/60">{flow.sub}</p>
        </div>

        {/* Which guide */}
        <div className="mb-12 flex justify-center">
          <div
            role="tablist"
            aria-label="Guides"
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
                  <span className="relative">{f.tab}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(320px,0.95fr)_1.15fr] lg:items-start lg:gap-14">
          {/* Left — the steps */}
          <div role="tablist" aria-label={flow.heading} className="flex flex-col gap-2">
            {flow.steps.map((s, i) => {
              const on = active === i;
              const Icon = s.icon;
              return (
                <button
                  key={s.title}
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
                          {s.title}
                        </span>
                        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-mastilo/40">
                          {s.meta}
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
                              <Typewriter text={s.copy} speed={COPY_SPEED} />
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
                  {step.label}
                </span>
                <span className="text-[11px] font-medium text-mastilo/45">
                  Step {active + 1} of {flow.steps.length}
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
                Back
              </button>
              <div className="flex gap-1.5" aria-hidden>
                {flow.steps.map((s, i) => (
                  <span
                    key={s.title}
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
                Next
                <LuArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
