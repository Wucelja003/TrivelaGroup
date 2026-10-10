import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import ReelStrip, { type ReelItem } from "./ReelStrip";

/*
 * "Our work" na Trivela Business — ista traka koju koristi Gallery → Reels
 * (ReelStrip: strelice / swipe, prirodne velicine, autoplay muted u vidokrugu),
 * samo u ZLATNOM akcentu. Klik na klip ga izbaci u prvi plan (uvecan, sa
 * zvukom). Ispod svakog klipa pise kom klijentu pripada — to nosi grupisanje,
 * pa tabovi iznad nisu potrebni.
 *
 * Videi su web verzije iz public/trivelaBusinessReels-web (originali su
 * izmesteni van projekta — 2.3 GB mastera se ne servira).
 *
 * NAPOMENA: grupe su procitane iz imena fajlova. Ako neki klip pripada drugom
 * klijentu, samo ga prebaci u drugu grupu ovde.
 */

const DIR = "/trivelaBusinessReels-web";

interface Group {
  label: string;
  clips: string[];
}

const GROUPS: Group[] = [
  { label: "KK Vojvodina", clips: ["Vojvodina_MediaDay"] },
  {
    label: "Trivela",
    clips: [
      "golovi",
      "trivelaMain",
      "videoCasesFootballers",
      "videoZoc",
      "videoOsetkowski",
    ],
  },
  {
    label: "Restoran Savić",
    clips: [
      "videoSavicIntroduce",
      "videoSavic",
      "videoSavicTartar",
      "videoSavicDishes",
    ],
  },
  { label: "Vila Vrt", clips: ["VilaVrt_Reel", "vilavrt_3"] },
  { label: "BC Partizan", clips: ["videoBcPartizan_V", "videoBcPartizan"] },
  { label: "Academy", clips: ["videoAcademy"] },
  { label: "Camp Jerkić", clips: ["videoCampJerkic"] },
  { label: "Air Fantast", clips: ["videoAirFantast"] },
  { label: "Rising Star", clips: ["photoRisingStar"] },
];

/* Klipovi koji idu na POCETAK trake, ovim redom. Sve sto je ovde ne ponavlja
   se kasnije, pa se izdvajanje svodi na jedan red. */
const FEATURED = ["Vojvodina_MediaDay", "golovi", "videoSavic"];

/* Bez naziva ispod klipa — traka ostaje cista, a klip uzima punu visinu.
   GROUPS i dalje drzi podelu po klijentu; ako naziv ikad zatreba, dovoljno
   je vratiti `title: g.label` ispod. */
const ITEMS: ReelItem[] = [
  ...FEATURED,
  ...GROUPS.flatMap((g) => g.clips).filter((c) => !FEATURED.includes(c)),
].map((c) => ({ src: `${DIR}/${c}.mp4` }));

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function BusinessReels() {
  const { t } = useTranslation();
  return (
    <section
      id="our-work"
      className="relative scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <span className="text-[12px] font-semibold uppercase tracking-[0.3em] text-[#d4af37]">
            {t("business.reels.eyebrow")}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-[#f4e2a1] to-[#d4af37] bg-clip-text text-transparent">
              {t("business.reels.title")}
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-white/65">
            {t("business.reels.lead")}
          </p>
        </motion.div>
      </div>

      {/* Traka — van max-w-6xl da moze da se lista celom sirinom */}
      <ReelStrip items={ITEMS} accent="gold" zoom />
    </section>
  );
}
