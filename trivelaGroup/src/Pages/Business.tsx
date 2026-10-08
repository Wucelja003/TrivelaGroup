import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion, type Variants } from "motion/react";
import AuroraField from "../Components/AuroraField";
import BusinessReels from "../Components/BusinessReels";
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


/* Naslov i opis su u prevodima pod business.beyond.pillars.<id>. */
interface Pillar {
  id: "social" | "pr" | "marketing";
  icon: ReactNode;
}
const PILLARS: Pillar[] = [
  {
    id: "social",
    icon: (
      <path d="M4 20V9m6 11V4m6 16v-7m6 7V8" />
    ),
  },
  {
    id: "pr",
    icon: (
      <>
        <path d="M3 11l16-6v14L3 15z" />
        <path d="M7 13v4a2 2 0 0 0 4 0" />
      </>
    ),
  },
  {
    id: "marketing",
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
  { name: "Fudbalski savez Srbije", file: "FudbalskiSavezSrbije", tone: "dark" },
  { name: "KK Vojvodina", file: "KK_Vojvodina_2022", tone: "dark" },
  { name: "Noah Yerevan", file: "Noah_Yerevan", tone: "dark" },
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

function Emblem({ reduce }: { reduce: boolean | null }) {
  return (
    <div className="relative h-24 w-24">
      <div
        aria-hidden="true"
        className="absolute -inset-6 rounded-full bg-[#d4af37]/25 blur-2xl"
      />
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-[conic-gradient(from_140deg,#5a4413,#d4af37,#f4e2a1,#545d67,#5a4413)] blur-[5px]"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ rotate: { duration: 22, repeat: Infinity, ease: "linear" } }}
      />
      <div className="absolute inset-[12px] flex items-center justify-center rounded-full border border-white/12 bg-[#14171a]/85 backdrop-blur-sm">
        <img
          src="/Trivela_Logo_mark_gold.svg"
          alt="Trivela"
          className="h-9 w-9 [filter:drop-shadow(0_0_10px_rgba(212,175,55,0.6))]"
        />
      </div>
    </div>
  );
}

export default function Business() {
  const { t } = useTranslation();
  const pillarText = t("business.beyond.pillars", { returnObjects: true });
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
            className="mt-7 text-[12px] font-semibold uppercase tracking-[0.35em] text-[#d4af37]"
          >
            Trivela Business
          </motion.span>

          <motion.h1
            variants={headline}
            className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-6xl md:text-7xl"
          >
            {t("business.hero.title1")}
            <br />
            <span className="bg-gradient-to-r from-[#f4e2a1] via-[#d4af37] to-[#a8802a] bg-clip-text text-transparent">
              {t("business.hero.title2")}
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg"
          >
            {t("business.hero.lead")}
          </motion.p>

          <motion.div
            variants={item}
            className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
          >
            <Link
              to="/getInTouch"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#a8802a] to-[#d4af37] px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-[#2a1e02] shadow-[0_16px_40px_-10px_rgba(212,175,55,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_52px_-10px_rgba(212,175,55,0.8)] sm:w-auto"
            >
              {t("business.hero.ctaPrimary")}
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
            <button
              type="button"
              onClick={toClients}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white backdrop-blur transition-colors duration-300 hover:border-[#d4af37]/60 hover:bg-white/10 sm:w-auto"
            >
              {t("business.hero.ctaSecondary")}
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
              className="text-[12px] font-semibold uppercase tracking-[0.3em] text-[#d4af37]"
            >
              {t("business.beyond.eyebrow")}
            </motion.span>
            <motion.h2
              variants={headline}
              className="mt-4 text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl"
            >
              {t("business.beyond.title")}
            </motion.h2>
            <motion.p
              variants={item}
              className="mx-auto mt-5 max-w-xl text-white/65"
            >
              {t("business.beyond.lead")}
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
                key={p.id}
                variants={item}
                className="group rounded-2xl border border-white/10 bg-white/[0.035] p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#d4af37]/45 hover:bg-[#d4af37]/[0.06] hover:shadow-[0_24px_60px_-24px_rgba(212,175,55,0.5)]"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4af37]/12 text-[#d4af37] ring-1 ring-inset ring-[#d4af37]/25">
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
                  {pillarText[p.id].title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-white/60">
                  {pillarText[p.id].copy}
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
              className="text-[12px] font-semibold uppercase tracking-[0.3em] text-[#d4af37]"
            >
              {t("business.clients.eyebrow")}
            </motion.span>
            <motion.h2
              variants={headline}
              className="mt-4 text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl"
            >
              {t("business.clients.titleBefore")}{" "}
              <span className="bg-gradient-to-r from-[#f4e2a1] to-[#d4af37] bg-clip-text text-transparent">
                {t("business.clients.titleAccent")}
              </span>
              {t("business.clients.titleAfter")}
            </motion.h2>
            <motion.p
              variants={item}
              className="mx-auto mt-5 max-w-xl text-white/65"
            >
              {t("business.clients.lead")}
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

      {/* ===== OUR WORK (traka reels-a po klijentu) ===== */}
      <BusinessReels />

      {/* ===== CTA ===== */}
      <section className="relative px-5 pb-32 pt-10 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#2a2418]/80 to-[#14171a]/80 px-6 py-16 text-center backdrop-blur-md sm:px-12 sm:py-20"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.35),transparent_70%)] blur-2xl"
          />
          <h2 className="relative text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("business.cta.title")}
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-white/65">
            {t("business.cta.lead")}
          </p>
          <Link
            to="/getInTouch"
            className="group relative mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#a8802a] to-[#d4af37] px-9 py-4 text-sm font-bold uppercase tracking-[0.12em] text-[#2a1e02] shadow-[0_16px_40px_-10px_rgba(212,175,55,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_52px_-10px_rgba(212,175,55,0.85)]"
          >
            {t("business.cta.button")}
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
