import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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

/* Poznate greske se cuvaju kao KLJUC (prevode se pri renderu, pa prate jezik).
   Sirova poruka sa servera (e.message) ostaje kakva jeste. */
type ErrKey =
  | "noImage"
  | "noName"
  | "badEmail"
  | "noModel"
  | "uploadFailed"
  | "sendFailed";
type FormError = { key: ErrKey } | { raw: string } | null;

export default function CustomCase() {
  const { t } = useTranslation();
  const errText = t("drop.custom.errors", { returnObjects: true });
  const ph = t("drop.custom.placeholders", { returnObjects: true });

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneModel, setPhoneModel] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [notes, setNotes] = useState("");

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<FormError>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const errorText = !error
    ? null
    : "key" in error
      ? errText[error.key]
      : error.raw;

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadCustomImage(file);
      setImageUrl(url);
    } catch (e) {
      setError(
        e instanceof Error ? { raw: e.message } : { key: "uploadFailed" }
      );
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return setError({ key: "noImage" });
    if (!fullName.trim()) return setError({ key: "noName" });
    if (!emailOk(email)) return setError({ key: "badEmail" });
    if (!phoneModel.trim()) return setError({ key: "noModel" });

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
        err instanceof Error ? { raw: err.message } : { key: "sendFailed" }
      );
    }
  };

  /* ---- Uspeh ---- */
  if (status === "sent") {
    return (
      <section
        id="custom-case"
        className="scroll-mt-24 px-5 py-28 sm:px-8 sm:py-32"
      >
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#7cc4ff] to-[#14589b] text-3xl text-white shadow-[0_16px_40px_-8px_rgba(124,196,255,0.7)]">
            ✓
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-mastilo sm:text-4xl">
            {t("drop.custom.successTitle")}
          </h2>
          <p className="mt-4 text-mastilo/70">{t("drop.custom.successBody")}</p>
        </div>
      </section>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-mastilo/20 bg-white px-4 py-3 text-mastilo outline-none transition-colors placeholder:text-mastilo/35 focus:border-ledena";
  const labelCls = "mb-1.5 block text-[13px] font-semibold text-mastilo/70";

  return (
    <section
      id="custom-case"
      className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-mastilo/60">
            {t("drop.custom.eyebrow")}
          </span>
          <h2 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight text-mastilo sm:text-5xl lg:text-6xl">
            {t("drop.custom.titleBefore")}{" "}
            <span className="bg-gradient-to-r from-[#1c6bb8] to-[#08226c] bg-clip-text text-transparent">
              {t("drop.custom.titleAccent")}
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-mastilo/65">
            {t("drop.custom.lead")}
          </p>
        </div>

        <form
          onSubmit={submit}
          className="grid gap-8 rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_40px_100px_-24px_rgba(8,34,108,0.35)] backdrop-blur-xl sm:p-10 lg:grid-cols-[0.85fr_1.15fr]"
        >
          {/* Slika */}
          <div>
            <span className={labelCls}>{t("drop.custom.photo")}</span>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group relative flex aspect-[9/16] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-mastilo/25 bg-gradient-to-br from-[#eaf3ff] to-white shadow-[inset_0_2px_20px_rgba(8,34,108,0.06)] transition-all hover:border-ledena hover:shadow-[0_0_30px_rgba(124,196,255,0.3)]"
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="px-6 text-center text-sm text-mastilo/50">
                  {uploading
                    ? t("drop.custom.uploading")
                    : t("drop.custom.clickToUpload")}
                </span>
              )}
            </button>
            {imageUrl && (
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="mt-2 text-xs font-semibold text-mastilo/55 transition-colors hover:text-mastilo"
              >
                {t("drop.custom.removeImage")}
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
                <label className={labelCls}>{t("drop.custom.fullName")}</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputCls}
                  placeholder={ph.fullName}
                />
              </div>
              <div>
                <label className={labelCls}>{t("drop.custom.email")}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder={ph.email}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>{t("drop.custom.phone")}</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputCls}
                  placeholder={ph.phone}
                />
              </div>
              <div>
                <label className={labelCls}>{t("drop.custom.phoneModel")}</label>
                <input
                  value={phoneModel}
                  onChange={(e) => setPhoneModel(e.target.value)}
                  className={inputCls}
                  placeholder={ph.phoneModel}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_0.6fr]">
              <div>
                <label className={labelCls}>{t("drop.custom.address")}</label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputCls}
                  placeholder={ph.address}
                />
              </div>
              <div>
                <label className={labelCls}>{t("drop.custom.city")}</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>{t("drop.custom.postal")}</label>
                <input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1.4fr_0.6fr]">
              <div>
                <label className={labelCls}>{t("drop.custom.country")}</label>
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>{t("drop.custom.quantity")}</label>
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
              <label className={labelCls}>{t("drop.custom.idea")}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className={`${inputCls} resize-none`}
                placeholder={ph.idea}
              />
            </div>

            {errorText && (
              <p className="text-sm font-medium text-red-500">{errorText}</p>
            )}

            <button
              type="submit"
              disabled={status === "sending" || uploading}
              className="mt-1 inline-flex items-center justify-center gap-2 self-start rounded-full bg-gradient-to-r from-[#08226c] to-[#14589b] px-9 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_16px_36px_-8px_rgba(8,34,108,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-8px_rgba(124,196,255,0.6)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "sending"
                ? t("drop.custom.sending")
                : t("drop.custom.send")}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
