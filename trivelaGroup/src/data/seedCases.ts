import type { CaseItem } from "./cases";

/*
 * Rezervni katalog za RAZVOJ.
 *
 * Isti redovi kao seed u api/supabase/schema.sql. Koristi se samo kad
 * Supabase ne odgovori I samo u `npm run dev` — u produkcionom buildu se
 * nikad ne prikazuje. Razlog: prodavnica koja nudi maskice sto se ne mogu
 * naruciti je gora od prodavnice koja posteno kaze da je pala.
 *
 * Kad podignes novu Supabase bazu, ovo prestaje da se vidi samo od sebe.
 */
export const seedCases: CaseItem[] = [
  { id: "wc-ar", name: "Argentina", collection: "World Cup", price: 24.9, badge: "🇦🇷", color: "#75aadb" },
  { id: "wc-br", name: "Brazil", collection: "World Cup", price: 24.9, badge: "🇧🇷", color: "#f7d117" },
  { id: "wc-rs", name: "Serbia", collection: "World Cup", price: 22.9, badge: "🇷🇸", color: "#c1121f" },
  { id: "wc-fr", name: "France", collection: "World Cup", price: 26.9, badge: "🇫🇷", color: "#3b5bdb" },
  { id: "wc-pt", name: "Portugal", collection: "World Cup", price: 24.9, badge: "🇵🇹", color: "#2a9d8f" },
  { id: "wc-es", name: "Spain", collection: "World Cup", price: 25.9, badge: "🇪🇸", color: "#e63946" },
  { id: "wc-en", name: "England", collection: "World Cup", price: 23.9, badge: "🏴", color: "#457b9d" },
  { id: "wc-de", name: "Germany", collection: "World Cup", price: 26.9, badge: "🇩🇪", color: "#ffb703" },
  { id: "wc-nl", name: "Netherlands", collection: "World Cup", price: 22.9, badge: "🇳🇱", color: "#fb8500" },
  { id: "wc-hr", name: "Croatia", collection: "World Cup", price: 24.9, badge: "🇭🇷", color: "#7209b7" },
  { id: "el-rm", name: "Real Madrid", collection: "Euroleague", price: 27.9, badge: "RM", color: "#d4af37" },
  { id: "el-fcb", name: "Barcelona", collection: "Euroleague", price: 27.9, badge: "FCB", color: "#a50044" },
  { id: "el-bay", name: "Bayern", collection: "Euroleague", price: 26.9, badge: "FCB", color: "#dc052d" },
  { id: "el-mci", name: "Man City", collection: "Euroleague", price: 28.9, badge: "MC", color: "#6cabdd" },
  { id: "el-liv", name: "Liverpool", collection: "Euroleague", price: 27.9, badge: "LFC", color: "#c8102e" },
  { id: "el-psg", name: "PSG", collection: "Euroleague", price: 28.9, badge: "PSG", color: "#1a557f" },
  { id: "el-juv", name: "Juventus", collection: "Euroleague", price: 26.9, badge: "JUV", color: "#9aa0a6" },
  { id: "el-mil", name: "AC Milan", collection: "Euroleague", price: 25.9, badge: "ACM", color: "#fb090b" },
];
