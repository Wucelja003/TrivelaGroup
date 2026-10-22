/* Ime kolekcije je slobodan tekst — kolekcije se prave iz admina (tabela
   `collections` u bazi), pa nije fiksni union. */
export type CollectionName = string;

export interface CaseItem {
  id: string; // slug iz baze — koristi se u ruti /shop/:id
  name: string;
  collection: CollectionName;
  price: number; // RSD (dinari) — cele vrednosti, npr 2900
  badge: string;
  color: string;
  image?: string;
  /* Kad je maskica dodata — po tome ide "najnovije prvo" i oznaka NOVO.
     Statични fallback podaci ga nemaju, pa je opciono. */
  createdAt?: string;
  isNew?: boolean;
}

/* Maskica je "nova" prvih 30 dana od dodavanja. Posle sama prestane da
   nosi oznaku — niko ne mora da je skida rucno. */
export const NEW_FOR_DAYS = 30;

export function isNewCase(createdAt?: string): boolean {
  if (!createdAt) return false;
  const added = new Date(createdAt).getTime();
  if (Number.isNaN(added)) return false;
  return Date.now() - added < NEW_FOR_DAYS * 24 * 60 * 60 * 1000;
}

export const collections: CollectionName[] = ["World Cup", "Euroleague"];

/* Cena u dinarima: "2.900 RSD" (bez decimala, tacka kao hiljadu — sr-RS). */
const rsdFmt = new Intl.NumberFormat("sr-RS", { maximumFractionDigits: 0 });
export const formatPrice = (v: number): string => `${rsdFmt.format(v)} RSD`;
