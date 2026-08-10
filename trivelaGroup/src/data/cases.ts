export type CollectionName = "World Cup" | "Euroleague";

export interface CaseItem {
  id: string; // slug iz baze — koristi se u ruti /shop/:id
  name: string;
  collection: CollectionName;
  price: number; // EUR
  badge: string;
  color: string;
  image?: string;
}

export const collections: CollectionName[] = ["World Cup", "Euroleague"];

export const formatPrice = (v: number): string => `€${v.toFixed(2)}`;
