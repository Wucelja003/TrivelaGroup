import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  analyticsEnabled,
  cookieless,
  readConsent,
  setConsent,
  type Consent,
} from "../lib/analytics";
import "./CookieConsent.css";

/*
 * Traka za pristanak na merenje poseta (GA4).
 *
 * Pokazuje se SAMO ako je analitika ukljucena (postoji VITE_GA_ID) i ako
 * posetilac jos nije odlucio. Odluka se pamti, pa se traka ne vraca.
 *
 * Stoji dole LEVO — dole desno je prekidac jezika.
 */
export default function CookieConsent() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!analyticsEnabled || cookieless) return;
    if (readConsent() !== null) return;
    /* Mali predah: traka ne upada posetiocu u prvi kadar strane. */
    const id = window.setTimeout(() => setOpen(true), 1200);
    return () => window.clearTimeout(id);
  }, []);

  if (!open) return null;

  const decide = (c: Consent) => {
    setConsent(c);
    setOpen(false);
  };

  return (
    <div className="cc" role="dialog" aria-label={t("consent.title")}>
      <p className="cc-title">{t("consent.title")}</p>
      <p className="cc-body">
        {t("consent.body")}{" "}
        <Link to="/terms" className="cc-link">
          {t("consent.more")}
        </Link>
      </p>
      <div className="cc-actions">
        <button
          type="button"
          className="cc-btn cc-btn--yes"
          onClick={() => decide("granted")}
        >
          {t("consent.accept")}
        </button>
        <button
          type="button"
          className="cc-btn cc-btn--no"
          onClick={() => decide("denied")}
        >
          {t("consent.decline")}
        </button>
      </div>
    </div>
  );
}
