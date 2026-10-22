/*
 * Slike proizvoda koje stoje U PROJEKTU (public/products), pa ih servira
 * Vercel umesto Supabase Storage-a.
 *
 * ZASTO: originali u Storage-u su bili 6-9 MB po maskici. Jedna poseta
 * prodavnici povlacila je oko 170 MB i za par nedelja potrosila mesecnu
 * kvotu saobracaja, posle cega je Supabase zakljucao ceo projekat.
 * Ove su WebP, ~100 kB — cela prodavnica je 2,5 MB.
 *
 * Fajl se pravi skriptom: npm run images:products
 */
export const LOCAL_PRODUCT_IMAGES = new Set<string>([
  "carlik-jones",
  "chima-moneke",
  "chris-jones",
  "cristiano-ronaldo",
  "desire-doue",
  "edin-dzeko",
  "erling-haaland",
  "ethan-thompson",
  "jared-butler",
  "jordan-nwora",
  "jude-bellingham",
  "kevarrius-hayes",
  "kylian-mbappe",
  "lamar-stevens",
  "lamine-yanal",
  "lionel-messi",
  "luca-vildoza",
  "luka-modric",
  "michael-olise",
  "neymar-jr",
  "nick-weiler-babb",
  "novak-djokovic",
  "ousmane-dembele",
  "vini-jr",
  "zeljko-obradovic",
]);

/** Lokalna slika ako postoji, inace ono sto je u bazi (nove maskice). */
export function productImage(slug: string, fromDb?: string | null) {
  return LOCAL_PRODUCT_IMAGES.has(slug)
    ? `/products/${slug}.webp`
    : (fromDb ?? undefined);
}
