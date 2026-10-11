/* Pravi public/sitemap.xml. Pokrece se pre build-a (npm run build). */
import { writeFileSync } from "node:fs";

const SITE = "https://trivela-group.com";
const today = new Date().toISOString().slice(0, 10);

/* Strane sajta. Proizvodi se ucitavaju iz baze u pregledacu, pa ih ovde
   nema — Google ih nalazi preko linkova sa /drop. */
const routes = [
  { path: "/", priority: "1.0", freq: "weekly" },
  { path: "/drop", priority: "0.9", freq: "weekly" },
  { path: "/business", priority: "0.9", freq: "monthly" },
  { path: "/gallery", priority: "0.7", freq: "weekly" },
  { path: "/history", priority: "0.6", freq: "monthly" },
  { path: "/getInTouch", priority: "0.8", freq: "monthly" },
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) => `  <url>
    <loc>${SITE}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.freq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

writeFileSync(new URL("../public/sitemap.xml", import.meta.url), xml);
console.log(`sitemap.xml: ${routes.length} strana`);
