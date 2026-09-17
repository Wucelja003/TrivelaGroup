import "i18next";
import type en from "./locales/en";

/*
 * Tipski vezani kljucevi: t("home.hero.tagline") se proverava pri kompajliranju,
 * pa greska u kucanju kljuca puca u build-u umesto da se na sajtu pojavi
 * sirovi kljuc.
 */
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: typeof en;
    };
  }
}
