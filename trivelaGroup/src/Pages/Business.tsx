import { useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, type Variants } from "motion/react";
import AuroraField from "../Components/AuroraField";
import "./Business.css";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};
const headline: Variants = {
  hidden: { opacity: 0, y: 26, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: EASE },
  },
};


interface Pillar {
  title: string;
  copy: string;
  icon: ReactNode;
}
const PILLARS: Pillar[] = [
  {
    title: "Marketing & Content",
    copy: "Complete management of your brand’s digital presence: from day-to-day social media operations to premium content creation that reflects the quality and identity of your business. We build a consistent online image supported by a clear communication, content and advertising strategy.",
    icon: (
      <path d="M4 20V9m6 11V4m6 16v-7m6 7V8" />
    ),
  },
  {
    title: "PR & Media",
    copy: "Developing tailored PR strategies and building strong media relationships to increase brand visibility, strengthen reputation and create meaningful exposure. Our approach also includes strategic PR activation, corporate social responsibility initiatives and adds making.",
    icon: (
      <>
        <path d="M3 11l16-6v14L3 15z" />
        <path d="M7 13v4a2 2 0 0 0 4 0" />
      </>
    ),
  },
  {
    title: "Marketing & Branding",
    copy: "Building and strengthening the identity of your organization and the products, services and ideas behind it. From brand positioning and creative direction to sponsorship strategy and brand partnerships, we create opportunities that drive recognition, connection and long-term growth.",
    icon: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" />
      </>
    ),
  },
];

/* --- Klijenti (PLACEHOLDER — vidi napomenu na vrhu) --- */
interface Client {
  name: string;
  /* ime fajla u /public/logosBusiness (bez .png) */
  file: string;
  /* boja SAMOG logotipa: "light" (belo/svetlo) ide na tamnu plocicu, a
     "dark"/sareni na belu — da se svaki vidi. */
  tone: "light" | "dark";
}
const CLIENTS: Client[] = [
  { name: "Concierge of Football", file: "ConciergeOfFootball", tone: "dark" },
  { name: "Liga Pub", file: "LigaPub", tone: "dark" },
  { name: "M55 Performance Center", file: "M55_PerformanceCenter", tone: "dark" },
  { name: "Rising Stars Camp", file: "RisingStars_BasketballCamp", tone: "dark" },
  { name: "Sava Jerkić Camp", file: "SavaJerkic_BasketballCamp", tone: "dark" },
  { name: "Skills Academy", file: "SkillsAcademyCH", tone: "dark" },
  { name: "Vila Vrt", file: "VilaVrt", tone: "dark" },
  { name: "Fantazi Masteri", file: "FantaziMasteri", tone: "light" },
  { name: "Ide Trojka", file: "IdeTrojka", tone: "light" },
  {
    name: "Restoran Savić",
    file: "restoran-savic_logo_transparent",
    tone: "light",
  },
];

function ClientTile({ c }: { c: Client }) {
  return (
    <div className="biz-item">
      <span className={`biz-logo biz-logo--${c.tone}`}>
        <img src={`/logosBusiness/${c.file}.png`} alt={c.name} loading="lazy" />
      </span>
      <span className="biz-item-name">{c.name}</span>
    </div>
  );
}

/* Traka mora da nosi TACNO dve iste kopije: pomak je -50%, pa se ostatak
   poklopi sa pocetkom i vrti bez skoka. */
function MarqueeRow({ variant }: { variant?: "b" }) {
  return (
    <div className={`biz-track${variant ? " biz-track--b" : ""}`}>
      {CLIENTS.map((c) => (
        <ClientTile key={`1-${c.name}`} c={c} />
      ))}
      {CLIENTS.map((c) => (
        <ClientTile key={`2-${c.name}`} c={c} />
      ))}
    </div>
  );
}

/* --- Spotlight: izdvojeni klijent (video/foto + dva podteksta) i duza prica.
   PLACEHOLDER tekst — restoran, ispravicemo posle. Ako `video` postoji renderuje
   se video, u suprotnom `image`. --- */
interface Spotlight {
  video?: string;
  image?: string;
  name: string;
  role: string;
  kicker: string;
  title: string;
  story: string;
  tags: string[];
}
const SPOTLIGHTS: Spotlight[] = [
  {
    video: "/videoTrivela-web/restaurant.mp4",
    name: "Restaurant Savic",
    role: "Brand & social film",
    kicker: "Case 01",
    title: "A table worth talking about.",
    story:
      "We gave Restaurant Savic more than a menu — we gave it a mood. From the plating to the lighting, we shot and cut the content that fills the room every night, and built the social presence that keeps the reservations coming. Proof that the same eye for a story works just as well in a kitchen as on a pitch.",
    tags: ["Content", "Social", "Film"],
  },
  {
    video: "/videoTrivela-web/restaurant_2.mp4",
    name: "Restaurant Savic — Grand opening",
    role: "Launch campaign",
    kicker: "Case 02",
    title: "Opening night, sold out.",
    story:
      "For the launch we ran the full campaign — teaser films, influencer seeding and a night the whole city wanted an invite to. The doors opened to a full house and a waiting list, and the footage lived on long after the last plate was cleared.",
    tags: ["Launch", "Campaign", "Video"],
  },
];

function SpotlightBlock({ s, flip }: { s: Spotlight; flip: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted) v.play().catch(() => {});
    setMuted(v.muted);
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
    >
      {/* Foto + dva podteksta (ime + uloga) */}
      <motion.figure
        variants={item}
        className={`relative mx-auto w-full max-w-[360px] ${
          flip ? "lg:order-2" : ""
        }`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-5 -z-10 rounded-[2rem] bg-[radial-gradient(60%_60%_at_50%_45%,rgba(62,207,142,0.18),transparent_70%)]"
        />
        <div className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.5)] transition-shadow duration-300 hover:shadow-[0_0_60px_rgba(62,207,142,0.22)]">
          {s.video ? (
            <>
              <video
                ref={videoRef}
                src={s.video}
                autoPlay
                muted
                loop
                playsInline
                className="aspect-[9/16] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              {/* Gradijent + dugme za zvuk — isti obrazac kao ostali video */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? "Unmute" : "Mute"}
                className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-colors duration-200 hover:border-[#3ecf8e] hover:text-[#3ecf8e]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M11 5 6 9H2v6h4l5 4V5z" />
                  {muted ? (
                    <path d="m22 9-6 6M16 9l6 6" />
                  ) : (
                    <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" />
                  )}
                </svg>
              </button>
            </>
          ) : (
            <img
              src={s.image}
              alt={s.name}
              loading="lazy"
              className="aspect-[9/16] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          )}
        </div>
        <figcaption className="mt-5 flex items-baseline justify-between gap-4">
          <span className="text-xl font-bold tracking-tight text-white">
            {s.name}
          </span>
          <span className="inline-flex items-center gap-2 text-sm text-white/60">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#3ecf8e] shadow-[0_0_10px_#3ecf8e]" />
            {s.role}
          </span>
        </figcaption>
      </motion.figure>

      {/* Duza prica */}
      <motion.div variants={item} className={flip ? "lg:order-1" : ""}>
        <span className="text-[12px] font-semibold uppercase tracking-[0.3em] text-[#3ecf8e]">
          {s.kicker}
        </span>
        <h3 className="mt-4 text-2xl font-extrabold leading-[1.12] tracking-tight sm:text-3xl">
          {s.title}
        </h3>
        <p className="mt-5 text-base leading-relaxed text-white/70 sm:text-lg">
          {s.story}
        </p>
        <div className="mt-7 flex flex-wrap gap-2.5">
          {s.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white/70"
            >
              {t}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Emblem({ reduce }: { reduce: boolean | null }) {
  return (
    <div className="relative h-24 w-24">
      <div
        aria-hidden="true"
        className="absolute -inset-6 rounded-full bg-[#3ecf8e]/25 blur-2xl"
      />
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-[conic-gradient(from_140deg,#14532d,#3ecf8e,#7ff0bb,#545d67,#14532d)] blur-[5px]"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ rotate: { duration: 22, repeat: Infinity, ease: "linear" } }}
      />
      <div className="absolute inset-[12px] flex items-center justify-center rounded-full border border-white/12 bg-[#14171a]/85 backdrop-blur-sm">
        <img
          src="/Trivela_Logo_mark.svg"
          alt="Trivela"
          className="h-9 w-9 [filter:drop-shadow(0_0_10px_rgba(62,207,142,0.6))]"
        />
      </div>
    </div>
  );
}

export default function Business() {
  const reduce = useReducedMotion();

  const toClients = () =>
    document
      .getElementById("clients")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <main className="biz">
      {/* Aurora + preliv — fiksirano iza cele strane */}
      <div className="biz-bg" aria-hidden="true">
        <AuroraField />
      </div>

      {/* ===== HERO ===== */}
      <section className="relative flex min-h-screen items-center overflow-hidden px-5 pb-24 pt-32 sm:px-8">
        <div className="biz-grid" aria-hidden="true" />
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center"
        >
          <motion.div variants={item}>
            <Emblem reduce={reduce} />
          </motion.div>

          <motion.span
            variants={item}
            className="mt-7 text-[12px] font-semibold uppercase tracking-[0.35em] text-[#3ecf8e]"
          >
            Trivela Business
          </motion.span>

          <motion.h1
            variants={headline}
            className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-6xl md:text-7xl"
          >
            Beyond the game
            <br />
            <span className="bg-gradient-to-r from-[#7ff0bb] via-[#3ecf8e] to-[#2f8f5b] bg-clip-text text-transparent">
              Built for business.
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg"
          >
            The same storytelling that turned athletes into icons — now working
            for companies, founders and brands far outside sport.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
          >
            <Link
              to="/getInTouch"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2f8f5b] to-[#3ecf8e] px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-[#06231a] shadow-[0_16px_40px_-10px_rgba(62,207,142,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_52px_-10px_rgba(62,207,142,0.8)] sm:w-auto"
            >
              Start a project
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
            <button
              type="button"
              onClick={toClients}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white backdrop-blur transition-colors duration-300 hover:border-[#3ecf8e]/60 hover:bg-white/10 sm:w-auto"
            >
              See our clients
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== BEYOND SPORT ===== */}
      <section className="relative px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.span
              variants={item}
              className="text-[12px] font-semibold uppercase tracking-[0.3em] text-[#3ecf8e]"
            >
              (01) — Beyond sport
            </motion.span>
            <motion.h2
              variants={headline}
              className="mt-4 text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl"
            >
              Not just athletes.
            </motion.h2>
            <motion.p
              variants={item}
              className="mx-auto mt-5 max-w-xl text-white/65"
            >
              We spent years making sportspeople unforgettable. That same craft —
              marketing, PR and brand consulting — now powers companies in every
              industry.
            </motion.p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="mt-14 grid gap-6 sm:mt-16 sm:grid-cols-3"
          >
            {PILLARS.map((p) => (
              <motion.div
                key={p.title}
                variants={item}
                className="group rounded-2xl border border-white/10 bg-white/[0.035] p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#3ecf8e]/45 hover:bg-[#3ecf8e]/[0.06] hover:shadow-[0_24px_60px_-24px_rgba(62,207,142,0.5)]"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#3ecf8e]/12 text-[#3ecf8e] ring-1 ring-inset ring-[#3ecf8e]/25">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    {p.icon}
                  </svg>
                </span>
                <h3 className="mt-5 text-xl font-bold tracking-tight">
                  {p.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-white/60">
                  {p.copy}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== CLIENTS ===== */}
      <section id="clients" className="relative scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.span
              variants={item}
              className="text-[12px] font-semibold uppercase tracking-[0.3em] text-[#3ecf8e]"
            >
              (02) — Clients
            </motion.span>
            <motion.h2
              variants={headline}
              className="mt-4 text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl"
            >
              Companies who{" "}
              <span className="bg-gradient-to-r from-[#7ff0bb] to-[#3ecf8e] bg-clip-text text-transparent">
                trust Trivela
              </span>
              .
            </motion.h2>
            <motion.p
              variants={item}
              className="mx-auto mt-5 max-w-xl text-white/65"
            >
              From startups to established names — inside sport and far beyond it.
            </motion.p>
          </motion.div>

          {/* Dve trake logotipa klize u suprotnim smerovima, staju na hover */}
          <div className="mt-14 sm:mt-16">
            <div className="biz-marquee">
              <MarqueeRow />
              <MarqueeRow variant="b" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== MASTERPIECES (spotlight klijenti) ===== */}
      <section className="relative px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.span
              variants={item}
              className="text-[12px] font-semibold uppercase tracking-[0.3em] text-[#3ecf8e]"
            >
              (03) — Clients &amp; masterpieces
            </motion.span>
            <motion.h2
              variants={headline}
              className="mt-4 text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl"
            >
              Masterpieces,{" "}
              <span className="bg-gradient-to-r from-[#7ff0bb] to-[#3ecf8e] bg-clip-text text-transparent">
                made together
              </span>
              .
            </motion.h2>
            <motion.p
              variants={item}
              className="mx-auto mt-5 max-w-xl text-white/65"
            >
              Every brand we touch gets the same obsession we bring to an
              athlete's name. A few of the stories we're proud of.
            </motion.p>
          </motion.div>

          <div className="mt-16 space-y-20 sm:mt-20 sm:space-y-28">
            {SPOTLIGHTS.map((s, i) => (
              <SpotlightBlock key={s.name} s={s} flip={i % 2 === 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative px-5 pb-32 pt-10 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1b2f26]/80 to-[#14171a]/80 px-6 py-16 text-center backdrop-blur-md sm:px-12 sm:py-20"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(62,207,142,0.35),transparent_70%)] blur-2xl"
          />
          <h2 className="relative text-3xl font-extrabold tracking-tight sm:text-4xl">
            Let's build your brand.
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-white/65">
            Tell us where you want to be. We'll bring the story that gets you
            there.
          </p>
          <Link
            to="/getInTouch"
            className="group relative mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2f8f5b] to-[#3ecf8e] px-9 py-4 text-sm font-bold uppercase tracking-[0.12em] text-[#06231a] shadow-[0_16px_40px_-10px_rgba(62,207,142,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_52px_-10px_rgba(62,207,142,0.85)]"
          >
            Get in touch
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
