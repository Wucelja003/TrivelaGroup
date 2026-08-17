import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { CaseItem, CollectionName } from "./cases";
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
