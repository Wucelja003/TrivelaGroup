import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart, type CartItem } from "../context/CartContext";
import { formatPrice } from "../data/cases";
import { supabase } from "../lib/supabase";
import "./Checkout.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s().-]{6,}$/;
const POSTAL_RE = /^[A-Za-z0-9\s-]{3,10}$/;

type FieldKey =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "address"
  | "city"
  | "postal";

/* U state-u se cuva KLJUC greske, ne gotov tekst — prevodi se pri renderu,
   pa poruka prati jezik i ako ga korisnik promeni dok ispravlja polja. */
type ErrKey = "required" | "email" | "phone" | "postal";

type Status = "idle" | "placing" | "done";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal: string;
}

const EMPTY: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postal: "",
};

/* ---- Underline field with floating label ---- */
function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  error,
  animationDelay,
}: {
  id: FieldKey;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  autoComplete?: string;
  error?: string;
  animationDelay: number;
}) {
  const inputCls = `peer w-full border-b bg-transparent pt-7 pb-2 text-base text-white outline-none transition-colors duration-300 ${
    error
      ? "border-red-400/70 focus:border-red-400"
      : "border-neutral-700 focus:border-zelena"
  }`;
  const labelCls =
    "pointer-events-none absolute left-0 top-7 text-base font-normal text-neutral-500 transition-all duration-200 ease-out peer-focus:top-0 peer-focus:text-[11px] peer-focus:uppercase peer-focus:tracking-[0.2em] peer-focus:text-zelena peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.2em] peer-[:not(:placeholder-shown)]:text-neutral-400";

  return (
    <div
      className="co-anim relative"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <input
        id={id}
        type={type}
        placeholder=" "
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className={inputCls}
      />
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      {error && (
        <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

/* ---- Order row (thumbnail) ---- */
function OrderRow({ item }: { item: CartItem }) {
  return (
    <li className="flex items-center gap-3 py-3">
      <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-sm font-bold text-white"
            style={{
              background: `radial-gradient(circle at 50% 35%, ${item.color}55, #01072d 78%)`,
            }}
          >
            {item.badge}
          </div>
        )}
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-zelena px-1 text-[10px] font-bold text-teget">
          {item.qty}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{item.name}</p>
        <p className="truncate text-[11px] uppercase tracking-[0.15em] text-white/40">
          {item.model}
        </p>
      </div>
      <p className="text-sm font-semibold text-zelena">
        {formatPrice(item.price * item.qty)}
      </p>
    </li>
  );
}

/* ---- Page ---- */
export default function Checkout() {
  const { t } = useTranslation();
  const label = t("drop.checkout.fields", { returnObjects: true });
  const errText = t("drop.checkout.errors", { returnObjects: true });
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, ErrKey>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [order, setOrder] = useState<{
    number: string;
    items: CartItem[];
    total: number;
    email: string;
  } | null>(null);

  /* Kljuc greske -> prevedena poruka (ili undefined ako nema greske) */
  const err = (key: FieldKey) => {
    const e = errors[key];
    return e ? errText[e] : undefined;
  };

  // Ako je korpa prazna i nema završene porudžbine → nazad na shop
  useEffect(() => {
    if (items.length === 0 && !order) {
      navigate("/drop", { replace: true });
    }
  }, [items.length, order, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* Dinari: besplatna postarina preko 6.000 RSD, inace 590 RSD. Slobodno
     promeni pragove. */
  const shipping = useMemo(() => (subtotal >= 6000 ? 0 : 590), [subtotal]);
  const total = subtotal + shipping;

  const set = (key: FieldKey) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<FieldKey, ErrKey>> = {};
    if (form.firstName.trim().length < 2) next.firstName = "required";
    if (form.lastName.trim().length < 2) next.lastName = "required";
    if (!EMAIL_RE.test(form.email)) next.email = "email";
    if (!PHONE_RE.test(form.phone.trim())) next.phone = "phone";
    if (form.address.trim().length < 4) next.address = "required";
    if (form.city.trim().length < 2) next.city = "required";
    if (!POSTAL_RE.test(form.postal.trim())) next.postal = "postal";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    if (!validate()) return;

    setStatus("placing");
    // TODO (backend): kreiranje porudzbine u bazi (orders) ide preko servera,
    // da se cena ne bi falsifikovala. Za sad je porudzbina lokalna maketa.
    const number = `TRV-${Date.now().toString(36).slice(-6).toUpperCase()}`;
    const placed = [...items];

    /* Potvrda mejlom — best-effort, ne blokira zavrsetak porudzbine. */
    try {
      await supabase.functions.invoke("send-email", {
        body: {
          kind: "order",
          number,
          email: form.email,
          name: `${form.firstName} ${form.lastName}`.trim(),
          phone: form.phone,
          address: form.address,
          city: form.city,
          postal: form.postal,
          total,
          items: placed.map((it) => ({
            name: it.name,
            model: it.model,
            price: it.price,
            qty: it.qty,
          })),
        },
      });
    } catch (err) {
      console.warn("[checkout] mejl nije poslat:", err);
    }

    setOrder({ number, items: placed, total, email: form.email });
    clear();
    setStatus("done");
  };

  /* ---- Success screen ---- */
  if (status === "done" && order) {
    return (
      <section className="flex min-h-[100vh] items-center justify-center px-6 py-24">
        <div className="co-success mx-auto max-w-2xl text-center">
          <div className="co-check mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-zelena/15 text-zelena ring-1 ring-inset ring-zelena/40">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-12 w-12"
            >
              <path d="M4 12l5 5L20 6" />
            </svg>
          </div>

          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-zelena">
            {t("drop.checkout.orderNumber", { number: order.number })}
          </span>
          <h1 className="mt-4 text-4xl font-medium tracking-tight text-white sm:text-5xl">
            {t("drop.checkout.placedTitle")}{" "}
            <span className="text-neutral-500">
              {t("drop.checkout.thanks", {
                name: form.firstName || t("drop.checkout.friend"),
              })}
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-base text-neutral-400">
            {t("drop.checkout.confirmBefore")}{" "}
            <span className="text-white/80">{order.email}</span>
            {t("drop.checkout.confirmAfter")}
          </p>

          {/* Order recap */}
          <div className="mx-auto mt-10 max-w-md rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left">
            <ul className="divide-y divide-white/5">
              {order.items.map((it) => (
                <OrderRow key={`${it.id}::${it.model}`} item={it} />
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">
                {t("drop.checkout.total")}
              </span>
              <span className="text-xl font-bold text-white">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>

          <div className="mt-10 flex justify-center gap-3">
            <Link
              to="/drop"
              className="rounded-full bg-zelena px-8 py-3.5 text-sm font-semibold text-teget transition-all hover:shadow-[0_14px_38px_rgba(150,255,0,0.45)]"
            >
              {t("drop.cart.continue")}
            </Link>
            <Link
              to="/"
              className="rounded-full border border-white/15 px-8 py-3.5 text-sm font-semibold text-white/80 transition-colors hover:border-zelena hover:text-zelena"
            >
              {t("drop.checkout.backHome")}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  /* ---- Empty state (prevent flash before redirect) ---- */
  if (items.length === 0) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="text-sm uppercase tracking-[0.2em] text-white/40">
          {t("drop.checkout.redirecting")}
        </div>
      </section>
    );
  }

  /* ---- Checkout form ---- */
  return (
    <section className="px-5 pb-20 pt-40 sm:px-8 sm:pb-24 sm:pt-48">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="co-anim mb-14 max-w-2xl">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-zelena">
            {t("drop.checkout.eyebrow")}
          </span>
          <h1 className="mt-4 text-5xl font-medium leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {t("drop.checkout.title")}
          </h1>
          <p className="mt-6 max-w-md text-lg text-neutral-400">
            {t("drop.checkout.lead")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="grid gap-16 lg:grid-cols-[1.3fr_1fr] lg:gap-24"
        >
          {/* Left — form */}
          <div className="flex flex-col gap-10">
            <div>
              <div
                className="co-anim mb-6 text-[11px] uppercase tracking-[0.2em] text-neutral-500"
                style={{ animationDelay: "80ms" }}
              >
                {t("drop.checkout.contact")}
              </div>
              <div className="grid gap-10 sm:grid-cols-2">
                <Field
                  id="firstName"
                  label={label.firstName}
                  value={form.firstName}
                  onChange={set("firstName")}
                  autoComplete="given-name"
                  error={err("firstName")}
                  animationDelay={120}
                />
                <Field
                  id="lastName"
                  label={label.lastName}
                  value={form.lastName}
                  onChange={set("lastName")}
                  autoComplete="family-name"
                  error={err("lastName")}
                  animationDelay={170}
                />
                <Field
                  id="email"
                  label={label.email}
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  autoComplete="email"
                  error={err("email")}
                  animationDelay={220}
                />
                <Field
                  id="phone"
                  label={label.phone}
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  autoComplete="tel"
                  error={err("phone")}
                  animationDelay={270}
                />
              </div>
            </div>

            <div>
              <div
                className="co-anim mb-6 text-[11px] uppercase tracking-[0.2em] text-neutral-500"
                style={{ animationDelay: "320ms" }}
              >
                {t("drop.checkout.shipping")}
              </div>
              <div className="grid gap-10">
                <Field
                  id="address"
                  label={label.address}
                  value={form.address}
                  onChange={set("address")}
                  autoComplete="street-address"
                  error={err("address")}
                  animationDelay={360}
                />
                <div className="grid gap-10 sm:grid-cols-2">
                  <Field
                    id="city"
                    label={label.city}
                    value={form.city}
                    onChange={set("city")}
                    autoComplete="address-level2"
                    error={err("city")}
                    animationDelay={410}
                  />
                  <Field
                    id="postal"
                    label={label.postal}
                    value={form.postal}
                    onChange={set("postal")}
                    autoComplete="postal-code"
                    error={err("postal")}
                    animationDelay={460}
                  />
                </div>
              </div>
            </div>

            {/* Submit (desktop only — mobile ima ispod summary-ja) */}
            <div
              className="co-anim hidden pt-2 lg:block"
              style={{ animationDelay: "520ms" }}
            >
              <button
                type="submit"
                disabled={status !== "idle"}
                className="group inline-flex items-center gap-3 rounded-full bg-zelena px-10 py-4 text-base font-semibold text-teget shadow-[0_10px_30px_rgba(150,255,0,0.28)] transition-all duration-200 hover:shadow-[0_14px_40px_rgba(150,255,0,0.5)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "placing" ? (
                  <>
                    <span className="inline-block animate-spin">◐</span>
                    {t("drop.checkout.placing")}
                  </>
                ) : (
                  <>
                    {t("drop.checkout.place")}
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>
              <p className="mt-4 max-w-md text-xs text-white/40">
                {t("drop.checkout.terms")}
              </p>
            </div>
          </div>

          {/* Right — order summary (sticky) */}
          <aside className="co-side h-fit lg:sticky lg:top-24">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zelena">
                  {t("drop.checkout.yourOrder")}
                </h2>
                <span className="text-xs text-white/40">
                  {t("drop.cart.count", { count: items.length })}
                </span>
              </div>

              <ul className="divide-y divide-white/5">
                {items.map((it) => (
                  <OrderRow key={`${it.id}::${it.model}`} item={it} />
                ))}
              </ul>

              <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
                <div className="flex justify-between text-white/60">
                  <span>{t("drop.checkout.subtotal")}</span>
                  <span className="text-white">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>{t("drop.checkout.shippingLabel")}</span>
                  <span className="text-white">
                    {shipping === 0
                      ? t("drop.checkout.free")
                      : formatPrice(shipping)}
                  </span>
                </div>
                {shipping === 0 && (
                  <p className="text-[11px] uppercase tracking-[0.15em] text-zelena">
                    {t("drop.checkout.freeOver")}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">
                  {t("drop.checkout.total")}
                </span>
                <span className="text-2xl font-bold text-white">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Mobile submit — vidljivo samo ispod lg */}
            <div className="mt-6 lg:hidden">
              <button
                type="submit"
                disabled={status !== "idle"}
                className="group flex w-full items-center justify-center gap-3 rounded-full bg-zelena py-4 text-base font-semibold text-teget shadow-[0_10px_30px_rgba(150,255,0,0.28)] transition-all duration-200 disabled:opacity-60"
              >
                {status === "placing" ? (
                  <>
                    <span className="inline-block animate-spin">◐</span>
                    {t("drop.checkout.placing")}
                  </>
                ) : (
                  <>
                    {t("drop.checkout.place")}
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </aside>
        </form>
      </div>
    </section>
  );
}
