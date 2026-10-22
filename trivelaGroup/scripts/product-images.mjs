/* Skida slike proizvoda iz Supabase Storage-a, pretvara ih u WebP i upisuje
   spisak u src/data/productImages.ts.
   Pokretanje: npm run images:products
   Treba cwebp (brew install webp). */
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const URL_BASE = process.env.VITE_SUPABASE_URL;
const KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!URL_BASE || !KEY) {
  console.error("Fale VITE_SUPABASE_URL i VITE_SUPABASE_PUBLISHABLE_KEY");
  process.exit(1);
}

const res = await fetch(
  `${URL_BASE}/rest/v1/products?select=slug,image_url&order=slug`,
  { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } },
);
const rows = await res.json();
const out = new URL("../public/products/", import.meta.url).pathname;
mkdirSync(out, { recursive: true });

let done = 0;
for (const r of rows) {
  if (!r.image_url) continue;
  const target = join(out, `${r.slug}.webp`);
  const tmp = join(tmpdir(), `${r.slug}.src`);
  const buf = Buffer.from(await (await fetch(r.image_url)).arrayBuffer());
  writeFileSync(tmp, buf);
  /* 900px je dovoljno: najveci prikaz maskice na sajtu je oko 450px */
  execFileSync("cwebp", ["-quiet", "-resize", "900", "0", "-q", "82",
    "-alpha_q", "90", "-m", "6", tmp, "-o", target]);
  done++;
}

const slugs = readdirSync(out).filter((f) => f.endsWith(".webp"))
  .map((f) => f.replace(/\.webp$/, "")).sort();

writeFileSync(
  new URL("../src/data/productImages.ts", import.meta.url),
  `/* Auto-generisano: npm run images:products — ne menjaj rucno. */
export const LOCAL_PRODUCT_IMAGES = new Set<string>([
${slugs.map((s) => `  "${s}",`).join("\n")}
]);

/** Lokalna slika ako postoji, inace ono sto je u bazi (nove maskice). */
export function productImage(slug: string, fromDb?: string | null) {
  return LOCAL_PRODUCT_IMAGES.has(slug)
    ? \`/products/\${slug}.webp\`
    : (fromDb ?? undefined);
}
`,
);
console.log(`obradjeno ${done}, u folderu ${slugs.length} slika`);
