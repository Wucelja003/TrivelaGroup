import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import "./ContactForm.css";

const SERVICES = [
  "Marketing",
  "PR",
  "Consulting",
  "Content Creation",
  "Social Media",
  "Branding",
  "Influencer Marketing",
  "Event Management",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "sending" | "sent" | "error";

/* ---- Underline field sa floating label ---- */
function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  rows,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  rows?: number;
}) {
  const base =
    "peer w-full border-b border-neutral-700 bg-transparent pt-7 pb-2 text-base text-white outline-none transition-colors duration-300 focus:border-white";
  const labelCls =
    "pointer-events-none absolute left-0 top-7 text-base font-normal text-neutral-500 transition-all duration-200 ease-out peer-focus:top-0 peer-focus:text-[11px] peer-focus:uppercase peer-focus:tracking-[0.2em] peer-focus:text-neutral-400 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.2em] peer-[:not(:placeholder-shown)]:text-neutral-400";

  return (
    <div className="relative">
      {rows ? (
        <textarea
          id={id}
          rows={rows}
          placeholder=" "
          value={value}
          onChange={onChange}
          className={`${base} resize-none`}
        />
      ) : (
        <input
          id={id}
          type={type}
          placeholder=" "
          value={value}
          onChange={onChange}
          className={base}
        />
      )}
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
    </div>
  );
}

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const btnRef = useRef<HTMLButtonElement>(null);

  const isValid =
    name.trim().length > 0 &&
    EMAIL_RE.test(email) &&
    message.trim().length >= 10;

  const toggleService = (s: string) =>
    setServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * 0.15}px, ${y * 0.25}px)`;
  };

  const handleLeave = () => {
    if (btnRef.current) btnRef.current.style.transform = "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid || status === "sending") return;
    setStatus("sending");
    try {
      // TODO (backend): POST /api/contact
      //   body: { name, email, company, services, message }
      await new Promise((res) => setTimeout(res, 1500)); // privremena simulacija
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  /* ---- Success screen ---- */
  if (status === "sent") {
    return (
      <section className="flex min-h-screen items-center justify-center bg-teget px-6 text-center">
        <div className="max-w-xl">
          <div className="mb-8 text-7xl text-zelena sm:text-8xl">→</div>
          <h1 className="text-4xl font-medium tracking-tight text-white sm:text-5xl">
            Got it. <span className="text-neutral-500">We'll be in touch.</span>
          </h1>
          <p className="mt-6 text-lg font-normal text-neutral-400">
            One of us will reply within 24 hours. Usually faster.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-teget px-6 pb-24 pt-40 text-white sm:px-10 sm:pt-48">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1fr_1.3fr] lg:gap-24">
        {/* ---- Left ---- */}
        <div className="flex flex-col">
          <span
            className="contact-anim text-[11px] font-normal uppercase tracking-[0.2em] text-neutral-500"
            style={{ animationDelay: "0ms" }}
          >
            (01) — Get in touch
          </span>

          <h1
            className="contact-anim mt-8 text-5xl font-medium leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "90ms" }}
          >
            Let's make
            <br />
            something
            <br />
            <span className="text-zelena">great.</span>
          </h1>

          <p
            className="contact-anim mt-8 max-w-md text-lg font-normal leading-relaxed text-neutral-400"
            style={{ animationDelay: "180ms" }}
          >
            Tell us about your project. We reply within 24 hours, never with a
            templated email.
          </p>

          {/* Studio info 2x2 */}
          <div
            className="contact-anim mt-auto grid grid-cols-2 gap-x-8 gap-y-10 pt-16"
            style={{ animationDelay: "270ms" }}
          >
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                Email
              </div>
              <a
                href="mailto:hello@trivelagroup.com"
                className="mt-2 inline-block text-base text-white transition-colors duration-200 hover:text-zelena"
              >
                hello@trivelagroup.com
              </a>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                Studio
              </div>
              <p className="mt-2 text-base text-white">Belgrade, Serbia</p>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                Social
              </div>
              <div className="mt-2 flex gap-4">
                {["Instagram", "TikTok", "X"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="text-base text-white transition-colors duration-200 hover:text-zelena"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---- Right: form ---- */}
        <form
          onSubmit={handleSubmit}
          className="contact-anim flex flex-col gap-10"
          style={{ animationDelay: "220ms" }}
        >
          <div className="grid gap-10 sm:grid-cols-2">
            <Field
              id="name"
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Field
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Field
            id="company"
            label="Company (optional)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />

          {/* Chips */}
          <div>
            <div className="mb-5 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              What can we help with?
            </div>
            <div className="flex flex-wrap gap-3">
              {SERVICES.map((s) => {
                const active = services.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleService(s)}
                    className={`rounded-full px-5 py-2.5 text-sm transition-all duration-200 ${
                      active
                        ? "bg-zelena text-teget"
                        : "border border-neutral-700 text-neutral-300 hover:border-neutral-400"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <Field
            id="message"
            label="Message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          {/* Submit */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <button
              ref={btnRef}
              type="submit"
              disabled={!isValid || status === "sending"}
              onMouseMove={handleMove}
              onMouseLeave={handleLeave}
              className="group inline-flex items-center gap-3 rounded-full bg-zelena px-9 py-4 text-base font-medium text-teget transition-[opacity,transform] duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-40"
            >
              {status === "sending" ? (
                <>
                  <span className="inline-block animate-spin">◐</span>
                  Sending…
                </>
              ) : (
                <>
                  Send message
                  <span className="transition-transform duration-200 ease-out group-hover:translate-x-1">
                    →
                  </span>
                </>
              )}
            </button>

            {status === "error" && (
              <p className="text-sm text-red-400">
                Couldn't send. Try again or email us directly.
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
