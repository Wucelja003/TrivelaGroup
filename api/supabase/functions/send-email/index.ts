// =====================================================================
//  Supabase Edge Function: send-email
//  Salje mejlove preko Resend-a. Zove je frontend posle:
//    - custom case zahteva  (kind: "custom")
//    - porudzbine           (kind: "order")
//  Za svaki: potvrda KUPCU + obavestenje FIRMI.
//
//  RESEND_API_KEY je Supabase secret — NIKAD ne ide u frontend ni u git.
//  Postavi ga: Dashboard -> Edge Functions -> Secrets, ili
//    supabase secrets set RESEND_API_KEY=...
//
//  Opcioni secreti:
//    RESEND_FROM     posiljalac, npr "Trivela Group <noreply@trivelagroup.com>"
//                    (domen mora biti verifikovan u Resend-u; do tada radi
//                    "onboarding@resend.dev", ali salje samo na tvoj nalog)
//    BUSINESS_EMAIL  gde stize obavestenje firmi (default info@trivelagroup.com)
// =====================================================================

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM = Deno.env.get("RESEND_FROM") ??
  "Trivela Group <onboarding@resend.dev>";
const BUSINESS_EMAIL = Deno.env.get("BUSINESS_EMAIL") ?? "info@trivelagroup.com";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const rsd = (v: number) =>
  new Intl.NumberFormat("sr-RS", { maximumFractionDigits: 0 }).format(v) +
  " RSD";

/* Zajednicki omotac maila — brend teget + zelena. */
function shell(title: string, body: string): string {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;background:#000b38;border-radius:16px;overflow:hidden">
    <div style="padding:28px 28px 8px">
      <div style="color:#96ff00;font-weight:700;letter-spacing:.18em;font-size:12px;text-transform:uppercase">Trivela Group</div>
      <h1 style="color:#fff;font-size:22px;margin:10px 0 0">${title}</h1>
    </div>
    <div style="padding:8px 28px 28px;color:#c9d3e6;font-size:14px;line-height:1.6">${body}</div>
    <div style="padding:16px 28px;border-top:1px solid rgba(255,255,255,.1);color:#6b7a99;font-size:12px">Trivela Group · Belgrade, Serbia</div>
  </div>`;
}

function row(label: string, value: unknown): string {
  if (!value) return "";
  return `<tr><td style="padding:4px 12px 4px 0;color:#8b98b5">${esc(label)}</td><td style="padding:4px 0;color:#fff">${esc(value)}</td></tr>`;
}

async function send(to: string | string[], subject: string, html: string) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!r.ok) {
    throw new Error(`Resend ${r.status}: ${await r.text()}`);
  }
}

// deno-lint-ignore no-explicit-any
function customEmails(d: any) {
  const details = `<table style="border-collapse:collapse;font-size:14px">
    ${row("Ime", d.fullName)}
    ${row("Email", d.email)}
    ${row("Telefon", d.phone)}
    ${row("Model", d.phoneModel)}
    ${row("Kolicina", d.quantity)}
    ${row("Adresa", [d.address, d.city, d.postalCode, d.country].filter(Boolean).join(", "))}
    ${row("Ideja", d.notes)}
  </table>`;

  const image = d.imageUrl
    ? `<p style="margin-top:14px"><a href="${esc(d.imageUrl)}" style="color:#96ff00">View uploaded image</a></p>`
    : "";

  return [
    {
      to: d.email,
      subject: "We received your custom case request",
      html: shell(
        "Request received",
        `<p>Hi ${esc(d.fullName)},</p>
         <p>Thanks — we've got your custom case request and we'll get back to you by email within 24 hours.</p>
         <p style="margin-top:14px;color:#8b98b5">A copy of your details:</p>${details}${image}`
      ),
    },
    {
      to: BUSINESS_EMAIL,
      subject: `New custom case request — ${esc(d.fullName)}`,
      html: shell("New custom case request", `${details}${image}`),
    },
  ];
}

// deno-lint-ignore no-explicit-any
function orderEmails(d: any) {
  // deno-lint-ignore no-explicit-any
  const lines = (d.items ?? [])
    .map(
      // deno-lint-ignore no-explicit-any
      (it: any) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#fff">${esc(it.name)} · ${esc(it.model)} ×${esc(it.qty)}</td><td style="padding:4px 0;color:#96ff00;text-align:right">${rsd(Number(it.price) * Number(it.qty))}</td></tr>`
    )
    .join("");
  const items = `<table style="width:100%;border-collapse:collapse;font-size:14px">${lines}
    <tr><td style="padding:10px 0 0;border-top:1px solid rgba(255,255,255,.1);color:#8b98b5">Total</td><td style="padding:10px 0 0;border-top:1px solid rgba(255,255,255,.1);color:#fff;text-align:right;font-weight:700">${rsd(Number(d.total))}</td></tr>
  </table>`;

  const ship = `<table style="border-collapse:collapse;font-size:14px;margin-top:14px">
    ${row("Name", d.name)}
    ${row("Phone", d.phone)}
    ${row("Address", [d.address, d.city, d.postal].filter(Boolean).join(", "))}
  </table>`;

  return [
    {
      to: d.email,
      subject: `Order received — ${esc(d.number)}`,
      html: shell(
        `Order ${esc(d.number)}`,
        `<p>Thanks for your order! We've received it and will be in touch about shipping.</p>${items}`
      ),
    },
    {
      to: BUSINESS_EMAIL,
      subject: `New order — ${esc(d.number)}`,
      html: shell(`New order ${esc(d.number)}`, `${items}${ship}`),
    },
  ];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ error: "RESEND_API_KEY nije postavljen" }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const mails =
      body.kind === "custom"
        ? customEmails(body)
        : body.kind === "order"
          ? orderEmails(body)
          : null;

    if (!mails) {
      return new Response(JSON.stringify({ error: "Nepoznat kind" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    await Promise.all(mails.map((m) => send(m.to, m.subject, m.html)));

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
