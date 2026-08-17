import { supabase } from "../lib/supabase";
import { clearCasesCache } from "./useCases";

/*
 * CRUD nad maskicama za /admin.
 *
 * Odvojeno od useCases jer:
 *  - admin vidi I sakrivene (active=false), a javni upit ih filtrira,
 *  - radi puna polja (collection_id, slug), ne samo prikazna,
 *  - posle svake izmene brise deljeni cache javne prodavnice.
 *
 * Sve pise samo admin — RLS u bazi to obezbedjuje, front samo salje zahtev.
 */

export interface Collection {
  id: string;
  name: string;
  slug: string;
}

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  collectionId: string;
  collectionName: string;
  price: number;
  description: string;
  badge: string;
  color: string;
  imageUrl: string | null;
  active: boolean;
}

export interface ProductInput {
  name: string;
  collectionId: string;
  price: number;
  description: string;
  badge: string;
  color: string;
  imageUrl: string | null;
}

interface Row {
  id: string;
  slug: string;
  name: string;
  collection_id: string;
  price: number | string;
  description: string | null;
  badge: string | null;
  color: string | null;
  image_url: string | null;
  active: boolean;
  collections: { name: string } | { name: string }[] | null;
}

function toProduct(r: Row): AdminProduct {
  const c = Array.isArray(r.collections) ? r.collections[0] : r.collections;
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    collectionId: r.collection_id,
    collectionName: c?.name ?? "—",
    price: Number(r.price),
    description: r.description ?? "",
    badge: r.badge ?? "",
    color: r.color ?? "#7cc4ff",
    imageUrl: r.image_url,
    active: r.active,
  };
}

const SELECT =
  "id, slug, name, collection_id, price, description, badge, color, image_url, active, collections(name)";

export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map(toProduct);
}

export async function fetchCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from("collections")
    .select("id, name, slug")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Collection[];
}

/* Cist slug iz imena: mala slova, crtice, bez znakova. Prazan (npr. ime na
   cirilici) dobija rezervni koren. */
function baseSlug(name: string): string {
  const s = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "case";
}

/* Jedinstven slug: ako je zauzet, dodaj -2, -3 ... Baza ima unique
   ogranicenje, ovo je da ne udarimo u njega bez potrebe. */
function uniqueSlug(name: string, taken: Set<string>): string {
  const base = baseSlug(name);
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

/* Otprema sliku u Storage i vraca javni URL. Ime je timestamp + cist
   nastavak, da se dve iste slike ne pregaze. new Date() je ovde u redu —
   ovo je korisnicka akcija u browseru, ne workflow skripta. */
export async function uploadImage(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function createProduct(
  input: ProductInput,
  existingSlugs: string[]
): Promise<void> {
  const slug = uniqueSlug(input.name, new Set(existingSlugs));
  const { error } = await supabase.from("products").insert({
    slug,
    name: input.name.trim(),
    collection_id: input.collectionId,
    price: input.price,
    description: input.description.trim() || null,
    badge: input.badge.trim() || null,
    color: input.color,
    image_url: input.imageUrl,
    active: true,
  });
  if (error) throw new Error(error.message);
  clearCasesCache();
}

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({
      name: input.name.trim(),
      collection_id: input.collectionId,
      price: input.price,
      description: input.description.trim() || null,
      badge: input.badge.trim() || null,
      color: input.color,
      image_url: input.imageUrl,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  clearCasesCache();
}

export async function setActive(id: string, active: boolean): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ active })
    .eq("id", id);
  if (error) throw new Error(error.message);
  clearCasesCache();
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  clearCasesCache();
}
