import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { CaseItem, CollectionName } from "./cases";
import { collections as staticCollections } from "./cases";
import { seedCases } from "./seedCases";

// Deljeni cache — svi komponenti povuku podatke jednom
let cache: CaseItem[] | null = null;
let inflight: Promise<CaseItem[]> | null = null;

/* Admin poziva ovo posle izmene, da prodavnica pri sledecem ulasku povuce
   svez spisak umesto starog cache-a. */
export function clearCasesCache(): void {
  cache = null;
  inflight = null;
}

/* --- Kolekcije (za filter u prodavnici) --- */
let collCache: string[] | null = null;
let collInflight: Promise<string[]> | null = null;

/* Admin poziva posle dodavanja kolekcije, da se odmah pojavi u Drop filteru. */
export function clearCollectionsCache(): void {
  collCache = null;
  collInflight = null;
}

async function fetchCollections(): Promise<string[]> {
  if (collCache) return collCache;
  if (collInflight) return collInflight;

  collInflight = (async () => {
    const { data, error } = await supabase
      .from("collections")
      .select("name")
      .order("name", { ascending: true });

    if (error) throw error;
    const names = ((data ?? []) as { name: string }[]).map((r) => r.name);
    collCache = names;
    return names;
  })();

  try {
    return await collInflight;
  } finally {
    collInflight = null;
  }
}

/* Spisak kolekcija iz baze (uklljucuje i nove dodate iz admina). Dok se ucitava
   ili ako baza ne odgovara, vraca staticni fallback da filter nikad ne bude prazan. */
export function useCollections(): string[] {
  const [names, setNames] = useState<string[]>(collCache ?? []);

  useEffect(() => {
    let cancelled = false;
    fetchCollections()
      .then((n) => {
        if (!cancelled && n.length) setNames(n);
      })
      .catch(() => {
        /* Baza ne odgovara — ostavi sta vec imamo, ili staticni spisak */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return names.length ? names : [...staticCollections];
}

interface ProductRow {
  slug: string;
  name: string;
  price: number | string;
  badge: string | null;
  color: string | null;
  image_url: string | null;
  collections: { name: string } | { name: string }[] | null;
}

function normalize(row: ProductRow): CaseItem {
  const c = Array.isArray(row.collections) ? row.collections[0] : row.collections;
  return {
    id: row.slug,
    name: row.name,
    collection: (c?.name ?? "World Cup") as CollectionName,
    price: Number(row.price),
    badge: row.badge ?? "",
    color: row.color ?? "#000b38",
    image: row.image_url ?? undefined,
  };
}

async function fetchCases(): Promise<CaseItem[]> {
  if (cache) return cache;
  if (inflight) return inflight;

  inflight = (async () => {
    const { data, error } = await supabase
      .from("products")
      .select("slug, name, price, badge, color, image_url, collections(name)")
      .eq("active", true)
      .order("name", { ascending: true });

    if (error) throw error;
    const items = ((data ?? []) as ProductRow[]).map(normalize);
    cache = items;
    return items;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

export function useCases() {
  const [cases, setCases] = useState<CaseItem[] | null>(cache);
  const [error, setError] = useState<string | null>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (cases) return;
    let cancelled = false;
    fetchCases()
      .then((items) => {
        if (!cancelled) setCases(items);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "Failed to load products";

        /* U razvoju baza ne sme da zakoci rad na dizajnu: ubaci lokalni seed
           i jasno oznaci da to nisu pravi podaci. U produkciji NIKAD — bolje
           je posteno reci da je prodavnica pala nego nuditi maskice koje se
           ne mogu naruciti. Vite u build-u zameni ovo sa `false` i izbaci
           granu zajedno sa uvozom seed-a. */
        if (import.meta.env.DEV) {
          console.warn(
            `[useCases] Supabase ne odgovara (${msg}) — prikazujem lokalni seed iz seedCases.ts`
          );
          setFallback(true);
          setCases(seedCases);
          return;
        }
        setError(msg);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    cases: cases ?? [],
    loading: cases === null && !error,
    error,
    /* true = gledas lokalni seed, ne bazu (samo u razvoju) */
    fallback,
  };
}
