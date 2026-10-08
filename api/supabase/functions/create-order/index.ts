// @ts-nocheck  Deno edge funkcija — radi na Supabase Edge runtime-u, ne na
// projektnom TypeScript-u. Editor bez Deno ekstenzije ne poznaje globalni
// `Deno`, pa ovde iskljucujemo tsc proveru. Frontend build (tsc -b) ionako
// gleda samo src/, ovaj fajl je van toga.
// =====================================================================
//  Supabase Edge Function: create-order
//  Upisuje porudzbinu u `orders` + `order_items` i vraca broj porudzbine.
//
//  ZASTO SERVER: tabele imaju RLS "samo admin", a cene se citaju IZ BAZE,
//  ne iz tela zahteva. Da frontend sam upisuje, kupac bi mogao da posalje
//  svoju cenu. Ovde klijent salje samo slug, model i kolicinu.
//
//  SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY Supabase sam ubacuje u okruzenje
//  edge funkcije — NE postavljaj ih rucno i NIKAD ne stavljaj service_role
//  u frontend ni u git.
//
//  Deploy:
//    supabase functions deploy create-order
// =====================================================================

const SB_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

/* Postarina — isti pragovi kao na Checkout strani. */
const FREE_SHIPPING_FROM = 6000;
const SHIPPING_FEE = 590;

const MAX_QTY_PER_LINE = 20;
const MAX_LINES = 30;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* PostgREST poziv sa service_role kljucem (zaobilazi RLS). */
async function db(
  path: string,
  init: RequestInit & { prefer?: string } = {},
): Promise<Response> {
  const { prefer, headers, ...rest } = init;
  return await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...rest,
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
      ...(headers ?? {}),
    },
  });
}

/* TRV-XXXXXX — isti oblik koji kupac vidi na ekranu i u mejlu. */
function orderNumber(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  let n = 0;
  for (const b of bytes) n = n * 256 + b;
  return `TRV-${n.toString(36).toUpperCase().padStart(6, "0").slice(-6)}`;
}

const money = (v: number) => Math.round(v * 100) / 100;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  if (!SB_URL || !SB_KEY) {
    return json({ error: "Okruzenje nije podeseno" }, 500);
  }

  try {
    const body = await req.json();
    const c = body?.customer ?? {};
    const rawItems = Array.isArray(body?.items) ? body.items : [];

    /* ---------- Provera podataka kupca ---------- */
    const name = `${String(c.firstName ?? "").trim()} ${String(c.lastName ?? "").trim()}`.trim();
    const email = String(c.email ?? "").trim();
    if (name.length < 3) return json({ error: "Ime je obavezno" }, 400);
    if (!EMAIL_RE.test(email)) return json({ error: "Neispravan email" }, 400);
    if (!rawItems.length) return json({ error: "Korpa je prazna" }, 400);
    if (rawItems.length > MAX_LINES) {
      return json({ error: "Previse razlicitih artikala" }, 400);
    }

    /* ---------- Normalizacija korpe ----------
       Slug u korpi moze da nosi i boju (slug--color), a u bazi stoji osnovni
       slug — zato se deli na "--". */
    const lines = rawItems.map((it: unknown) => {
      const raw = String((it as Record<string, unknown>)?.slug ?? "");
      return {
        slug: raw.split("--")[0],
        label: String((it as Record<string, unknown>)?.name ?? "").trim(),
        model: String((it as Record<string, unknown>)?.model ?? "").trim(),
        qty: Math.min(
          Math.max(parseInt(String((it as Record<string, unknown>)?.qty ?? "1"), 10) || 1, 1),
          MAX_QTY_PER_LINE,
        ),
      };
    });

    if (lines.some((l) => !l.slug || !l.model)) {
      return json({ error: "Nepotpun artikal u korpi" }, 400);
    }

    /* ---------- Cene IZ BAZE ---------- */
    const slugs = [...new Set(lines.map((l) => l.slug))];
    const q = new URLSearchParams({
      select: "id,slug,name,price,active,collections(name)",
      slug: `in.(${slugs.map((s) => `"${s}"`).join(",")})`,
    });
    const pr = await db(`products?${q}`);
    if (!pr.ok) throw new Error(`products ${pr.status}: ${await pr.text()}`);
    const products = await pr.json();

    const bySlug = new Map(products.map((p: Record<string, unknown>) => [p.slug, p]));
    const missing = slugs.filter((s) => {
      const p = bySlug.get(s);
      return !p || p.active === false;
    });
    if (missing.length) {
      return json({ error: `Proizvod nije dostupan: ${missing.join(", ")}` }, 409);
    }

    const items = lines.map((l) => {
      const p = bySlug.get(l.slug) as Record<string, unknown>;
      const unit = money(Number(p.price));
      return {
        product_id: p.id,
        /* Ime iz korpe nosi i boju ("… — Zelena"); ako ga nema, ime iz baze */
        product_name: l.label || String(p.name),
        collection_name:
          (p.collections as Record<string, unknown> | null)?.name ?? null,
        model: l.model,
        unit_price: unit,
        quantity: l.qty,
        line_total: money(unit * l.qty),
      };
    });

    const subtotal = money(items.reduce((s, it) => s + it.line_total, 0));
    const shipping = subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
    const total = money(subtotal + shipping);

    /* ---------- Upis porudzbine ----------
       Broj je unique, pa na sudar (23505) probaj novi. */
    let order: Record<string, unknown> | null = null;
    let lastErr = "";
    for (let attempt = 0; attempt < 5 && !order; attempt++) {
      const number = orderNumber();
      const res = await db("orders", {
        method: "POST",
        prefer: "return=representation",
        body: JSON.stringify({
          order_number: number,
          customer_name: name,
          customer_email: email,
          customer_phone: String(c.phone ?? "").trim() || null,
          shipping_address: String(c.address ?? "").trim() || null,
          shipping_city:
            [String(c.city ?? "").trim(), String(c.postal ?? "").trim()]
              .filter(Boolean)
              .join(" ") || null,
          shipping_country: String(c.country ?? "Srbija").trim() || null,
          subtotal,
          shipping,
          total,
        }),
      });
      if (res.ok) {
        order = (await res.json())[0];
        break;
      }
      lastErr = await res.text();
      if (!lastErr.includes("23505")) {
        throw new Error(`orders ${res.status}: ${lastErr}`);
      }
    }
    if (!order) throw new Error(`orders: broj se ne moze dodeliti (${lastErr})`);

    /* ---------- Upis artikala ----------
       Ako padne, porudzbina se brise — bolje nista nego porudzbina bez
       artikala koju niko ne moze da spakuje. */
    const ir = await db("order_items", {
      method: "POST",
      body: JSON.stringify(items.map((it) => ({ ...it, order_id: order.id }))),
    });
    if (!ir.ok) {
      const txt = await ir.text();
      await db(`orders?id=eq.${order.id}`, { method: "DELETE" });
      throw new Error(`order_items ${ir.status}: ${txt}`);
    }

    return json({
      ok: true,
      number: order.order_number,
      subtotal,
      shipping,
      total,
    });
  } catch (e) {
    console.error("[create-order]", e);
    return json({ error: String(e) }, 500);
  }
});
