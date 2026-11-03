// @ts-nocheck  Deno edge funkcija — radi na Supabase Edge runtime-u, ne na
// projektnom TypeScript-u. Editor bez Deno ekstenzije ne poznaje globalni
// `Deno`, pa ovde iskljucujemo tsc proveru. Frontend build (tsc -b) ionako
// gleda samo src/, ovaj fajl je van toga.
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
const BUSINESS_EMAIL = Deno.env.get("BUSINESS_EMAIL") ??
  "trivelabusiness@gmail.com";
/* Gde stize odgovor kupca; bez posebnog secreta ide na BUSINESS_EMAIL */
const REPLY_TO = Deno.env.get("REPLY_TO") ?? BUSINESS_EMAIL;

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

const SITE = "https://trivela-group.com";

/* Zajednicki omotac maila — brend teget + zelena.
   Mejl se crta TABELAMA i inline stilovima: Outlook ne zna za flex ni grid,
   Gmail brise <style> blok, a SVG se nigde ne prikazuje (zato PNG logo).
   Boje su pune (bez rgba), jer ih stari klijenti ne razumeju. */
function shell(
  title: string,
  body: string,
  opts: { eyebrow?: string; cta?: { label: string; href: string } } = {},
): string {
  const { eyebrow = "Trivela Group", cta } = opts;

  const button = cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px auto 4px">
        <tr><td style="background:#96ff00;border-radius:999px">
          <a href="${esc(cta.href)}" style="display:inline-block;padding:13px 30px;color:#01072d;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:.02em">${esc(cta.label)}</a>
        </td></tr>
      </table>`
    : "";

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#060d24;padding:28px 12px;font-family:'Helvetica Neue',Arial,Helvetica,sans-serif">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#01072d;border-radius:20px;border:1px solid #16205a;overflow:hidden">

      <!-- Zaglavlje: znak + naslov -->
      <tr><td align="center" style="padding:34px 30px 0">
        <img src="${SITE}/email-logo.png" width="54" height="54" alt="Trivela Group" style="display:block;border:0;outline:none">
        <div style="margin-top:14px;color:#96ff00;font-size:11px;font-weight:700;letter-spacing:.22em;text-transform:uppercase">${esc(eyebrow)}</div>
        <h1 style="margin:10px 0 0;color:#ffffff;font-size:25px;line-height:1.25;font-weight:700">${title}</h1>
      </td></tr>

      <!-- Zelena crta ispod naslova -->
      <tr><td align="center" style="padding:18px 30px 0">
        <table role="presentation" cellpadding="0" cellspacing="0" width="56"><tr>
          <td height="3" style="background:#96ff00;border-radius:999px;font-size:0;line-height:0">&nbsp;</td>
        </tr></table>
      </td></tr>

      <!-- Sadrzaj -->
      <tr><td style="padding:22px 30px 4px;color:#c9d3e6;font-size:14px;line-height:1.65">${body}</td></tr>

      ${button ? `<tr><td align="center" style="padding:0 30px">${button}</td></tr>` : ""}

      <!-- Podnozje -->
      <tr><td style="padding:26px 30px 28px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr><td height="1" style="background:#16205a;font-size:0;line-height:0">&nbsp;</td></tr>
        </table>
        <p style="margin:18px 0 0;color:#6b7a99;font-size:12px;line-height:1.7">
          <a href="${SITE}" style="color:#96ff00;text-decoration:none;font-weight:700">trivela-group.com</a><br>
          Beograd, Srbija · <a href="tel:+381653887181" style="color:#8b98b5;text-decoration:none">+381 65 388 71 81</a><br>
          <a href="https://www.instagram.com/trivelagroup" style="color:#8b98b5;text-decoration:none">Instagram</a> &nbsp;·&nbsp;
          <a href="https://www.tiktok.com/@trivelagroup" style="color:#8b98b5;text-decoration:none">TikTok</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>`;
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
    /* Posiljalac MORA biti na verifikovanom domenu, pa je to npr.
       porudzbine@trivela-group.com. Odgovor kupca zato vracamo na adresu
       koju tim stvarno cita (BUSINESS_EMAIL, moze i gmail). */
    body: JSON.stringify({
      from: FROM,
      to,
      reply_to: REPLY_TO,
      subject,
      html,
    }),
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

/* Kupcu pisemo na jeziku na kom je i poruciо; firmi uvek na srpskom. */
const T = {
  sr: {
    subject: (n: string) => `Porudžbina primljena — ${n}`,
    orderNo: "Porudžbina",
    thanks: "Hvala na porudžbini!",
    cta: "Pogledaj još maskica",
    intro:
      "Hvala na porudžbini! Primili smo je i javljamo se čim maskica krene ka tebi.",
    items: "Artikli",
    subtotal: "Međuzbir",
    shipping: "Dostava",
    free: "Besplatno",
    total: "Ukupno",
    deliverTo: "Isporuka na adresu",
    noteLabel: "Napomena",
    eta: "Isporuka obično traje 5–7 radnih dana.",
    help: "Ako nešto nije u redu, odgovori na ovaj mejl i javljamo se u roku od 24 sata.",
  },
  en: {
    subject: (n: string) => `Order received — ${n}`,
    orderNo: "Order",
    thanks: "Thanks for your order!",
    cta: "See more cases",
    intro:
      "Thanks for your order! We've got it and we'll be in touch as soon as it ships.",
    items: "Items",
    subtotal: "Subtotal",
    shipping: "Shipping",
    free: "Free",
    total: "Total",
    deliverTo: "Delivery address",
    noteLabel: "Note",
    eta: "Delivery usually takes 5–7 working days.",
    help: "If anything looks wrong, just reply to this email — we answer within 24 hours.",
  },
};

// deno-lint-ignore no-explicit-any
function orderEmails(d: any) {
  const lang = String(d.lang ?? "").startsWith("sr") ? "sr" : "en";
  const t = T[lang];

  /* Ako front ne posalje razdvojeno, racunamo iz artikala da racun uvek
     ima sve tri stavke (medjuzbir, dostava, ukupno). */
  const items = (d.items ?? []) as Array<Record<string, unknown>>;
  const subtotal =
    d.subtotal != null
      ? Number(d.subtotal)
      : items.reduce((s, it) => s + Number(it.price) * Number(it.qty), 0);
  const total = Number(d.total ?? subtotal);
  const shipping = d.shipping != null ? Number(d.shipping) : total - subtotal;

  /* Ako bilo koji artikal ima sliku, tabela dobija kolonu za slicice —
     tada i stavka bez slike (npr. poklon kutija) mora da ima praznu
     celiju, inace bi joj se naziv pomerio u kolonu sa slikama. */
  const hasThumbs = items.some((it) => it.image);

  /* Sličica maskice uz artikal; bez slike ostaje samo tekst. */
  const thumb = (src: unknown) =>
    src
      ? `<td width="56" style="padding:10px 12px 10px 0;vertical-align:top">
           <img src="${esc(src)}" width="56" height="56" alt="" style="display:block;border:0;border-radius:10px;background:#0a1544;object-fit:cover">
         </td>`
      : hasThumbs
        ? `<td width="56" style="padding:10px 12px 10px 0;font-size:0;line-height:0">&nbsp;</td>`
        : "";

  const lines = items
    .map(
      (it) =>
        `<tr>
          ${thumb(it.image)}
          <td style="padding:10px 12px 10px 0;color:#ffffff;font-size:14px;line-height:1.4;vertical-align:top">
            ${esc(it.name)}<br>
            <span style="color:#8b98b5;font-size:12px">${esc(it.model)} · ×${esc(it.qty)}</span>
          </td>
          <td style="padding:10px 0;color:#96ff00;font-size:14px;font-weight:700;text-align:right;white-space:nowrap;vertical-align:top">${rsd(Number(it.price) * Number(it.qty))}</td>
        </tr>`,
    )
    .join("");

  const span = hasThumbs ? 2 : 1;

  const sum = (label: string, value: string, strong = false) =>
    `<tr>
      <td colspan="${span}" style="padding:5px 12px 5px 0;color:${strong ? "#ffffff" : "#8b98b5"};font-size:${strong ? "15px" : "13px"};${strong ? "font-weight:700" : ""}">${esc(label)}</td>
      <td style="padding:5px 0;text-align:right;color:${strong ? "#96ff00" : "#ffffff"};font-size:${strong ? "16px" : "13px"};${strong ? "font-weight:700" : ""};white-space:nowrap">${value}</td>
    </tr>`;

  const bill = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:8px">
    ${lines}
    <tr><td colspan="${span + 1}" height="1" style="background:#16205a;font-size:0;line-height:0;padding:0">&nbsp;</td></tr>
    <tr><td colspan="${span + 1}" style="height:10px;font-size:0;line-height:0">&nbsp;</td></tr>
    ${sum(t.subtotal, rsd(subtotal))}
    ${sum(t.shipping, shipping > 0 ? rsd(shipping) : t.free)}
    ${sum(t.total, rsd(total), true)}
  </table>`;

  const address = [d.address, [d.postal, d.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");

  /* Adresa u svojoj kutiji — kupac na prvi pogled proveri gde ide paket */
  const ship = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px">
    <tr><td style="background:#0a1138;border:1px solid #16205a;border-radius:14px;padding:14px 16px">
      <div style="color:#8b98b5;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">${esc(t.deliverTo)}</div>
      <div style="margin-top:6px;color:#ffffff;font-size:14px;line-height:1.5">${esc(d.name)}<br>${esc(address)}</div>
    </td></tr>
  </table>`;

  /* Firmi: sve sto treba da se spakuje i posalje, bez otvaranja sajta. */
  const forBusiness = `<table style="border-collapse:collapse;font-size:14px">
    ${row("Kupac", d.name)}
    ${row("Email", d.email)}
    ${row("Telefon", d.phone)}
    ${row("Adresa", address)}
  </table>`;

  /* Napomena kupca — istaknuta, da se ne previdi pri pakovanju. */
  const note = d.note
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px">
         <tr><td style="background:#132008;border:1px solid #2f4d12;border-left:3px solid #96ff00;border-radius:12px;padding:14px 16px">
           <div style="color:#96ff00;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">${esc(t.noteLabel)}</div>
           <div style="margin-top:6px;color:#ffffff;font-size:14px;line-height:1.5">${esc(d.note)}</div>
         </td></tr>
       </table>`
    : "";

  return [
    {
      to: d.email,
      subject: t.subject(String(d.number)),
      html: shell(
        t.thanks,
        `<p style="margin:0">${t.intro}</p>
         <p style="margin:22px 0 0;color:#8b98b5;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">${t.items}</p>
         ${bill}${ship}${note}
         <p style="margin:20px 0 0;color:#c9d3e6">${t.eta}</p>
         <p style="margin:10px 0 0;color:#8b98b5;font-size:13px">${t.help}</p>`,
        {
          eyebrow: `${t.orderNo} ${esc(d.number)}`,
          cta: { label: t.cta, href: `${SITE}/drop` },
        },
      ),
    },
    {
      to: BUSINESS_EMAIL,
      subject: `Nova porudžbina — ${esc(d.number)} · ${rsd(total)}`,
      html: shell(
        `Nova porudžbina`,
        `${forBusiness}${note}
         <p style="margin:22px 0 0;color:#8b98b5;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">Artikli</p>
         ${bill}`,
        { eyebrow: `Porudžbina ${esc(d.number)}` },
      ),
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
