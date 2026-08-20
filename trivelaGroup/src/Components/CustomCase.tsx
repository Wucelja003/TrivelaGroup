import { useRef, useState } from "react";
import { PHONE_MODELS } from "../data/phoneModels";
import {
  submitCustomRequest,
  uploadCustomImage,
} from "../data/customRequests";

/*
 * "Create your custom case" — forma na Trivela Drop strani. Kupac ubaci svoju
 * sliku i podatke (model, kontakt, adresa), zahtev ode u Supabase (slika u
 * Storage, red u custom_requests). Boje su Drop: bela podloga, teget tekst,
 * ledeno plavi akcenti.
 *
 * Sidro id="custom-case" — dugme u hero-u skrola pravo ovde.
 */

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

type Status = "idle" | "sending" | "sent" | "error";

export default function CustomCase() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneModel, setPhoneModel] = useState<string>(PHONE_MODELS[0]);
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [notes, setNotes] = useState("");

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadCustomImage(file);
      setImageUrl(url);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Slika nije otpremljena, probaj opet."
      );
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return setError("Dodaj svoju sliku za masku.");
    if (!fullName.trim()) return setError("Ime je obavezno.");
    if (!emailOk(email)) return setError("Unesi ispravan email.");

    setStatus("sending");
    setError(null);
    try {
      await submitCustomRequest({
        fullName,
        email,
        phone,
        phoneModel,
        quantity,
        address,
        city,
        postalCode,
        country,
        notes,
        imageUrl,
      });
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Slanje nije uspelo, probaj opet."
      );
    }
  };

  /* ---- Uspeh ---- */
  if (status === "sent") {
    return (
      <section id="custom-case" className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-xl text-center">
          <div className="mb-6 text-6xl text-ledena">✓</div>
          <h2 className="text-3xl font-bold tracking-tight text-mastilo sm:text-4xl">
            Request received.
          </h2>
          <p className="mt-4 text-mastilo/70">
            We'll review your idea and get back to you by email within 24 hours.
          </p>
        </div>
      </section>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-mastilo/20 bg-white px-4 py-3 text-mastilo outline-none transition-colors placeholder:text-mastilo/35 focus:border-ledena";
  const labelCls = "mb-1.5 block text-[13px] font-semibold text-mastilo/70";

  return (
    <section id="custom-case" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-mastilo/60">
            Made for you
          </span>
          <h2 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight text-mastilo sm:text-5xl lg:text-6xl">
            Create your{" "}
            <span className="bg-gradient-to-r from-[#1c6bb8] to-[#06294d] bg-clip-text text-transparent">
              custom case
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-mastilo/65">
            Upload your photo, pick your phone, tell us where to ship it — and
            we'll craft a one-off case just for you.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="grid gap-8 rounded-3xl border border-mastilo/12 bg-white p-6 shadow-[0_24px_60px_rgba(6,41,77,0.1)] sm:p-9 lg:grid-cols-[0.85fr_1.15fr]"
        >
          {/* Slika */}
          <div>
            <span className={labelCls}>Your photo</span>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group relative flex aspect-[9/16] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-mastilo/25 bg-mastilo/[0.03] transition-colors hover:border-ledena"
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="px-6 text-center text-sm text-mastilo/50">
                  {uploading ? "Uploading…" : "Click to upload your image"}
                </span>
              )}
            </button>
            {imageUrl && (
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="mt-2 text-xs font-semibold text-mastilo/55 transition-colors hover:text-mastilo"
              >
                Remove image
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </div>

          {/* Polja */}
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Full name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputCls}
                  placeholder="Marko Marković"
                />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="you@email.com"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Phone number</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputCls}
                  placeholder="+381 …"
                />
              </div>
              <div>
                <label className={labelCls}>Phone model</label>
                <select
                  value={phoneModel}
                  onChange={(e) => setPhoneModel(e.target.value)}
                  className={inputCls}
                >
                  {PHONE_MODELS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_0.6fr]">
              <div>
                <label className={labelCls}>Address</label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputCls}
                  placeholder="Street & number"
                />
              </div>
              <div>
                <label className={labelCls}>City</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Postal</label>
                <input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1.4fr_0.6fr]">
              <div>
                <label className={labelCls}>Country</label>
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Number(e.target.value) || 1))
                  }
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Your idea (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className={`${inputCls} resize-none`}
                placeholder="Player, club, colours, text — anything you want on it."
              />
            </div>

            {error && <p className="text-sm font-medium text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={status === "sending" || uploading}
              className="mt-1 inline-flex items-center justify-center gap-2 self-start rounded-full bg-mastilo px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_12px_30px_rgba(6,41,77,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0d3f70] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send my request"}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
