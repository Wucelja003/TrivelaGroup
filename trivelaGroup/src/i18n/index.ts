import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import sr from "./locales/sr";

/*
 * Jezik sajta. Engleski je podrazumevan (klijentov zahtev: prvo EN, pa SR).
 * Izbor se pamti u localStorage, pa posetilac koji prebaci na srpski ostaje
 * na srpskom i posle osvezavanja / sledece posete.
 *
 * Namerno BEZ automatskog prepoznavanja jezika browsera — inace bi posetilac
 * iz Srbije odmah dobio srpski, a zahtev je da je engleski prvi.
 */

export const LANGS = ["en", "sr"] as const;
export type Lang = (typeof LANGS)[number];

const STORAGE_KEY = "trivela.lang";

/* <html lang> za citace ekrana i SEO. Srpski je latinica -> "sr-Latn". */
export const HTML_LANG: Record<Lang, string> = { en: "en", sr: "sr-Latn" };

function readSaved(): Lang {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "sr" ? "sr" : "en";
  } catch {
    // Privatni prozor / blokiran storage — samo idi na podrazumevani.
    return "en";
  }
}

const initial = readSaved();

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    sr: { translation: sr },
  },
  lng: initial,
  fallbackLng: "en",
  supportedLngs: [...LANGS],
  interpolation: {
    // React vec escapuje izlaz; dupli escape bi pokvario npr. "&".
    escapeValue: false,
  },
});

document.documentElement.lang = HTML_LANG[initial];

i18n.on("languageChanged", (lng) => {
  const l: Lang = lng === "sr" ? "sr" : "en";
  document.documentElement.lang = HTML_LANG[l];
  try {
    localStorage.setItem(STORAGE_KEY, l);
  } catch {
    // Ne pamti se, ali promena jezika svejedno radi.
  }
});

export default i18n;
