import { supabase } from "../lib/supabase";
import { clearCasesCache, clearCollectionsCache } from "./useCases";

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

/* Nova kolekcija: slug se pravi iz imena. Pise samo admin (RLS). */
export async function createCollection(name: string): Promise<void> {
  const clean = name.trim();
  if (!clean) throw new Error("Ime kolekcije je obavezno.");
  const { error } = await supabase
    .from("collections")
    .insert({ slug: baseSlug(clean), name: clean });
  if (error) throw new Error(error.message);
  /* Da se nova kolekcija odmah pojavi u Drop filteru */
  clearCollectionsCache();
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

/* Najsira tacka prikaza maskice na sajtu je oko 450px, pa je 900px tacno
   dvostruko (ostro i na retina ekranima). Sve preko toga je cist utrosak
   saobracaja. */
const MAX_WIDTH = 900;

/* Smanji i pretvori u WebP PRE slanja.
   ZASTO: originali iz telefona/Photoshopa su bili 6-9 MB. Sa 25 maskica
   jedna poseta prodavnici povlacila je ~170 MB i za par nedelja potrosila
   mesecnu kvotu saobracaja, posle cega Supabase zakljuca ceo projekat.
   Ako kompresija ne uspe ili ne pomogne, salje se original — bolje veliki
   fajl nego prekinuta otprema. */
async function shrink(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_WIDTH / bitmap.width);
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.82),
    );
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp" });
  } catch {
    return file;
  }
}

/* Otprema sliku u Storage i vraca javni URL. Ime je timestamp + cist
   nastavak, da se dve iste slike ne pregaze. new Date() je ovde u redu —
   ovo je korisnicka akcija u browseru, ne workflow skripta. */
export async function uploadImage(original: File): Promise<string> {
  const file = await shrink(original);
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
