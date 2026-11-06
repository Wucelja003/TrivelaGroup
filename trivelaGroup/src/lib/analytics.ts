/*
 * Google Analytics 4 — merenje sa pristankom (Consent Mode v2).
 *
 * KAKO RADI:
 *  - ID stoji u .env kao VITE_GA_ID (npr. G-XXXXXXXXXX). Ako ga nema,
 *    analitika se NE ucitava uopste — nema skripte, nema trake za pristanak.
 *  - Pre bilo kakvog merenja saljemo "consent default: denied", pa Google ne
 *    sme da postavi kolacic dok posetilac ne klikne Prihvatam.
 *  - Posete salje sam sajt (send_page_view: false), jer je ovo SPA — Google
 *    ne vidi promenu strane kroz react-router.
 *
 * ZASTO NEMA REZIMA BEZ KOLACICA: GA4 sa analytics_storage "denied" salje
 * samo signale pristanka — izvestaji ostaju prazni i Google javlja "Data
 * collection isn't active". Da bi brojke postojale, posetilac mora da
 * prihvati. Zato traka za pristanak nije ukras nego uslov.
 */

const GA_ID = import.meta.env.VITE_GA_ID as string | undefined;
const STORAGE_KEY = "trivela.consent";

export type Consent = "granted" | "denied";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const analyticsEnabled = Boolean(GA_ID);

/** Valuta za sve iznose u izvestajima (GA4 prima ISO oznaku). */
export const CURRENCY = "RSD";

export function readConsent(): Consent | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    /* privatni prozor ili blokirani kolacici — tretiraj kao "nije odlucio" */
    return null;
  }
}

/*
 * PAZI NA OBLIK: gtag.js prihvata komandu SAMO kao `arguments` objekat.
 * Ako se gurne obican niz — dataLayer.push(["config", ...]) — komanda se
 * tiho ignorise: nema greske u konzoli, kontejner se ucita, ali se nijedan
 * zahtev ne posalje i GA4 javlja "Data collection isn't active".
 * Zato ovde stoji `function` sa `arguments`, a ne strelica sa rest-om.
 */
const push = function (this: void) {
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
} as (...args: unknown[]) => void;

let started = false;

/** Ucitava gtag jednom, sa pristankom koji je posetilac ranije dao. */
export function initAnalytics() {
  if (!GA_ID || started || typeof window === "undefined") return;
  started = true;

  const consent = readConsent();

  window.dataLayer = window.dataLayer || [];
  window.gtag = push;

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

/* ====================================================================
   PRODAVNICA — standardni GA4 dogadjaji.

   Imena (view_item, add_to_cart, begin_checkout, purchase) nisu izmisljena:
   GA4 ih prepoznaje i sam pravi izvestaj "Monetisation" sa prihodom i
   procentom kupovina. Zato ih NE preimenuj.
   ==================================================================== */

export interface TrackedItem {
  id: string;
  name: string;
  model?: string;
  price: number;
  qty?: number;
  giftBox?: boolean;
}

/** Korpa -> oblik stavki kakav GA4 ocekuje. */
export function gaItems(items: TrackedItem[]) {
  return items.map((it, index) => ({
    item_id: it.id,
    item_name: it.name,
    item_variant: it.model || undefined,
    item_category: it.giftBox ? "with_gift_box" : "case",
    price: it.price,
    quantity: it.qty ?? 1,
    index,
  }));
}

/* ====================================================================
   KLIKOVI — jedan osluskivac za ceo sajt.

   Umesto da svako dugme dobije svoj poziv, hvatamo klikove na linkove u
   fazi "bubbling". Tako znamo sta ljudi stvarno kliknu (Instagram, telefon,
   mejl, spoljni linkovi) bez diranja desetine komponenti.
   ==================================================================== */

const SOCIAL = [
  ["instagram.com", "instagram"],
  ["tiktok.com", "tiktok"],
  ["youtube.com", "youtube"],
  ["youtu.be", "youtube"],
  ["facebook.com", "facebook"],
  ["linkedin.com", "linkedin"],
  ["x.com", "x"],
  ["twitter.com", "x"],
] as const;

let clicksWired = false;

/** Zove se jednom, na podizanju sajta. */
export function initClickTracking() {
  if (!GA_ID || clicksWired || typeof document === "undefined") return;
  clicksWired = true;

  document.addEventListener(
    "click",
    (e) => {
      const el = e.target as HTMLElement | null;
      const a = el?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if (!href) return;

      if (href.startsWith("mailto:") || href.startsWith("tel:")) {
        track("click_contact", {
          method: href.startsWith("tel:") ? "phone" : "email",
          link_url: href,
        });
        return;
      }

      if (!/^https?:/i.test(href)) return;
      let host: string;
      try {
        host = new URL(href, window.location.href).hostname.replace(/^www\./, "");
      } catch {
        return;
      }
      if (host === window.location.hostname.replace(/^www\./, "")) return;

      const social = SOCIAL.find(([domain]) => host.endsWith(domain));
      if (social) track("click_social", { network: social[1], link_url: href });
      else track("click_outbound", { link_domain: host, link_url: href });
    },
    /* bubbling, ne capture: ako komponenta zaustavi dogadjaj, nije ni bio
       pravi odlazak na link */
    false,
  );
}

/* ====================================================================
   DOKLE LJUDI STIGNU NA STRANI — dubina skrola.

   Salje "scroll_depth" sa poljem percent (25/50/75/90), svaki prag jednom
   po poseti strane. U GA4 se gleda kao dogadjaj; da bi video raspodelu po
   procentima, registruj "percent" kao prilagodjenu dimenziju.
   ==================================================================== */

const MARKS = [25, 50, 75, 90];

export function watchScrollDepth(path: string) {
  if (!GA_ID || typeof window === "undefined") return () => {};

  let deepest = 0;
  let timer = 0;

  const stop = () => {
    window.removeEventListener("scroll", onScroll);
    window.clearInterval(timer);
  };

  function onScroll() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    /* Kratka strana (nema sta da se skroluje) se ne meri — inace bi svaka
       takva poseta lazno prijavila 90%. */
    if (max < 200) return;
    const pct = (window.scrollY / max) * 100;
    for (const m of MARKS) {
      if (pct >= m && deepest < m) {
        deepest = m;
        track("scroll_depth", { percent: m, page_path: path });
      }
    }
    /* Dosao je do dna — nema sta vise da se meri na ovoj strani */
    if (deepest >= MARKS[MARKS.length - 1]) stop();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  /* Lenis (smooth scroll) pomera stranu sam i NE emituje pouzdano nativni
     "scroll", pa se polozaj dodatno proverava dva puta u sekundi. Provera
     je obicno citanje dve brojke i prestaje cim se stigne do dna. */
  timer = window.setInterval(onScroll, 500);
  return stop;
}
