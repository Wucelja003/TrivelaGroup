export type CollectionName = "World Cup" | "Euroleague";

export interface CaseItem {
  id: string; // slug iz baze — koristi se u ruti /shop/:id
  name: string;
  collection: CollectionName;
  price: number; // RSD (dinari) — cele vrednosti, npr 2900
  badge: string;
  color: string;
  image?: string;
}

export const collections: CollectionName[] = ["World Cup", "Euroleague"];

/* Cena u dinarima: "2.900 RSD" (bez decimala, tacka kao hiljadu — sr-RS). */
const rsdFmt = new Intl.NumberFormat("sr-RS", { maximumFractionDigits: 0 });
export const formatPrice = (v: number): string => `${rsdFmt.format(v)} RSD`;
