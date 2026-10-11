import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/*
 * SEO po strani.
 *
 * index.html nosi POCETNE oznake (to vide mreze pri deljenju, jer one ne
 * izvrsavaju JavaScript). Google izvrsava, pa svaka strana ovde prepise
 * naslov, opis, kanonsku adresu i OG oznake.
 *
 * Tekstovi su u prevodima pod `seo.<strana>`, pa se menjaju i sa jezikom.
 */

export const SITE_URL = "https://trivela-group.com";
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

function meta(selector: string, attr: "name" | "property", key: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  return el;
}

function setMeta(name: string, content: string) {
  meta(`meta[name="${name}"]`, "name", name).content = content;
}

function setOg(property: string, content: string) {
  meta(`meta[property="${property}"]`, "property", property).content = content;
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

export interface SeoInput {
  /** Naslov strane bez "| Trivela Group" — to se dodaje samo */
  title: string;
  description: string;
  /** Putanja sa vodecom kosom crtom, npr. "/drop" */
  path: string;
  /** Apsolutna ili relativna slika za deljenje; bez nje ide podrazumevana */
  image?: string;
  /** Strane koje nemaju sta da traze u pretrazi (korpa, admin) */
  noindex?: boolean;
}

/** Postavlja naslov i oznake strane; prati i promenu jezika. */
export function useSeo({
  title,
  description,
  path,
  image,
  noindex = false,
}: SeoInput) {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;

  useEffect(() => {
    const full =
      title === "Trivela Group" ? title : `${title} | Trivela Group`;
    const url = `${SITE_URL}${path}`;
    const img = image
      ? image.startsWith("http")
        ? image
        : `${SITE_URL}${image}`
      : OG_IMAGE;

    document.title = full;
    setMeta("description", description);
    setMeta("robots", noindex ? "noindex, nofollow" : "index, follow");
    setCanonical(url);

    setOg("og:title", full);
    setOg("og:description", description);
    setOg("og:url", url);
    setOg("og:image", img);
    setOg("og:locale", lang?.startsWith("sr") ? "sr_RS" : "en_US");

    setMeta("twitter:title", full);
    setMeta("twitter:description", description);
    setMeta("twitter:image", img);
  }, [title, description, path, image, noindex, lang]);
}
