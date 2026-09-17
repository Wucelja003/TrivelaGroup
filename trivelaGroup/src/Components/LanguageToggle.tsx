import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "motion/react";
import { HTML_LANG, LANGS, type Lang } from "../i18n";
import "./LanguageToggle.css";

/*
 * Prekidac jezika — fiksiran dole desno, uvek pri ruci.
 *
 * Boje prate BREND strane preko html[data-page] (isto sto koristi ostatak
 * sajta): Group = teget + lime, Drop = belo + teget, Business = tamno + zlato.
 * Stilovi su u LanguageToggle.css.
 *
 * Nazivi jezika su u SVOM jeziku ("English", "Srpski"), a ne prevedeni —
 * tako posetilac prepozna svoj jezik bez obzira na to sta je trenutno ukljuceno.
 */

const AUTONYM: Record<Lang, string> = { en: "English", sr: "Srpski" };
const SHORT: Record<Lang, string> = { en: "EN", sr: "SR" };

export default function LanguageToggle() {
  const { t, i18n } = useTranslation();
  const reduce = useReducedMotion();
  const current: Lang = i18n.resolvedLanguage === "sr" ? "sr" : "en";

  return (
    <div className="lt" role="group" aria-label={t("lang.label")}>
      <svg
        className="lt-globe"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>

      {LANGS.map((l) => {
        const on = l === current;
        return (
          <button
            key={l}
            type="button"
            className={`lt-btn${on ? " is-on" : ""}`}
            aria-pressed={on}
            aria-label={AUTONYM[l]}
            title={AUTONYM[l]}
            lang={HTML_LANG[l]}
            onClick={() => {
              if (!on) void i18n.changeLanguage(l);
            }}
          >
            {on && (
              <motion.span
                layoutId="lt-pill"
                className="lt-pill"
                aria-hidden="true"
                transition={{
                  duration: reduce ? 0 : 0.35,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            )}
            <span className="lt-txt">{SHORT[l]}</span>
          </button>
        );
      })}
    </div>
  );
}
