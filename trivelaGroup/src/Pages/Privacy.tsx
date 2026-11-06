import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSeo } from "../lib/seo";
import { readConsent, setConsent, type Consent } from "../lib/analytics";

/*
 * Privatnost i kolačići.
 *
 * Postoji iz dva razloga: traka za pristanak mora da vodi negde (ranije je
 * vodila na /terms, koja ne postoji), i posetilac po zakonu mora da moze da
 * POVUCE pristanak — zato je prekidac ovde, a ne samo u traci koja se vise
 * ne prikazuje posle prve odluke.
 *
 * Sav tekst je u prevodima pod `privacy.*`.
 */

const EMAIL = "trivelabusiness@gmail.com";

export default function Privacy() {
  const { t } = useTranslation();
  useSeo({
    title: t("seo.privacy.title"),
    description: t("seo.privacy.description"),
    path: "/privacy",
  });

  const [consent, setLocal] = useState<Consent | null>(() => readConsent());

  const decide = (c: Consent) => {
    setConsent(c);
    setLocal(c);
  };

  const sections = t("privacy.sections", { returnObjects: true });

  return (
    <section className="min-h-screen bg-teget px-5 pb-24 pt-40 sm:px-8 sm:pt-48">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
          {t("privacy.title")}
        </h1>
        <p className="mt-3 text-sm uppercase tracking-[0.18em] text-white/40">
          {t("privacy.updated")}
        </p>
        <p className="mt-8 text-lg leading-relaxed text-white/75">
          {t("privacy.intro")}
        </p>

        <div className="mt-12 space-y-10">
          {sections.map((s) => (
            <div key={s.h}>
              <h2 className="text-xl font-bold text-zelena sm:text-2xl">
                {s.h}
              </h2>
              <p className="mt-3 leading-relaxed text-white/70">{s.p}</p>
            </div>
          ))}
        </div>

        {/* Prekidac — jedino mesto gde posetilac moze da se predomisli */}
        <div className="mt-14 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white">
            {t("privacy.consent.title")}
          </h2>
          <p className="mt-2 text-white/70">
            {consent === "granted"
              ? t("privacy.consent.granted")
              : consent === "denied"
                ? t("privacy.consent.denied")
                : t("privacy.consent.unset")}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => decide("granted")}
              disabled={consent === "granted"}
              className="rounded-full bg-zelena px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-teget transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            >
              {t("privacy.consent.accept")}
            </button>
            <button
              type="button"
              onClick={() => decide("denied")}
              disabled={consent === "denied"}
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white/80 transition-all duration-300 hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("privacy.consent.revoke")}
            </button>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold text-white">
            {t("privacy.contactTitle")}
          </h2>
          <p className="mt-2 text-white/70">
            {t("privacy.contactBody", { email: EMAIL })}
          </p>
        </div>
      </div>
    </section>
  );
}
