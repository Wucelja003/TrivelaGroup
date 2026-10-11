/*
 * Google Analytics 4 — sa pristankom (Consent Mode v2).
 *
 * KAKO RADI:
 *  - ID stoji u .env kao VITE_GA_ID (npr. G-XXXXXXXXXX). Ako ga nema,
 *    analitika se NE ucitava uopste — nema skripte, nema trake za pristanak.
 *  - Pre bilo kakvog merenja saljemo "consent default: denied", pa Google ne
 *    sme da postavi kolacic dok posetilac ne klikne Prihvatam.
 *  - Posete salje sam sajt (send_page_view: false), jer je ovo SPA — Google
 *    ne vidi promenu strane kroz react-router.
 */

const GA_ID = import.meta.env.VITE_GA_ID as string | undefined;
const STORAGE_KEY = "trivela.consent";

/* BEZ KOLACICA (VITE_GA_COOKIELESS=true): GA4 radi, ali trajno sa
   analytics_storage: "denied" — ne upisuje nista na uredjaj posetioca, pa
   traka za pristanak nije potrebna. Cena: Google ne prepoznaje istog coveka
   u dve posete, pa su "korisnici" i "nove vs. stare posete" nepouzdani.
   Posete po stranama, zemlje, uredjaji i izvori i dalje rade. */
export const cookieless =
  String(import.meta.env.VITE_GA_COOKIELESS ?? "").toLowerCase() === "true";

export type Consent = "granted" | "denied";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const analyticsEnabled = Boolean(GA_ID);

export function readConsent(): Consent | null {
  /* U rezimu bez kolacica nema sta da se pita — pristanak je trajno "denied" */
  if (cookieless) return "denied";
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    /* privatni prozor ili blokirani kolacici — tretiraj kao "nije odlucio" */
    return null;
  }
}

function push(...args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

let started = false;

/** Ucitava gtag jednom, sa pristankom koji je posetilac ranije dao. */
export function initAnalytics() {
  if (!GA_ID || started || typeof window === "undefined") return;
  started = true;

  const consent = readConsent();

  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: unknown[]) => push(...args);

  /* Mora PRE config-a: bez ovoga Google postavlja kolacice odmah. */
  push("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: consent === "granted" ? "granted" : "denied",
    wait_for_update: 500,
  });

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);

  push("js", new Date());
  push("config", GA_ID, { send_page_view: false });
}

/** Odluka posetioca sa trake za pristanak. */
export function setConsent(consent: Consent) {
  try {
    localStorage.setItem(STORAGE_KEY, consent);
  } catch {
    /* ako ne moze da se upamti, bar vazi za ovu posetu */
  }
  if (!GA_ID) return;
  push("consent", "update", { analytics_storage: consent });
  if (consent === "granted") pageview(location.pathname + location.search);
}

/** Jedna poseta strani — zove se na svakoj promeni rute. */
export function pageview(path: string) {
  if (!GA_ID) return;
  push("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

/** Dogadjaj po meri, npr. track("order_placed", { value: 4590 }). */
export function track(name: string, params?: Record<string, unknown>) {
  if (!GA_ID) return;
  push("event", name, params ?? {});
}
