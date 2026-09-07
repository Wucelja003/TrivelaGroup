import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import "./History.css";

/*
 * About Us — priča u dva poglavlja (ruta ostaje /history).
 *  (01) How did Trivela Group begin?  -> vertikalna vremenska linija; zelena
 *       kičma se puni dok skrolujes (useScroll), milestone tačke svetle.
 *  (02) Why Trivela?                  -> editorial sa dva crtana SVG motiva:
 *       kriva "trivele" (spoljnjak) i strelica nagore iz logoa.
 * Boje su nase (teget + zelena), reveal na scroll preko motion whileInView.
 */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const GRAD =
  "bg-gradient-to-b from-[#d6ff9e] via-[#96ff00] to-[#6fd000] bg-clip-text text-transparent";

/* Klijentov tekst, doslovno — svaki pasus je jedan korak na vremenskoj liniji */
const ORIGIN_STEPS: string[] = [
  "The story of Trivela Group goes back to October 2019, when one of its founders began creating sports-focused digital content through an Instagram platform.",
  "As the platform grew, so did the brand behind it. It soon established itself as one of Serbia’s most recognized sports media brands, building a particularly strong presence within the Partizan community.",
  "This growth opened the door to collaborations with Partizan Basketball Club, Partizan Handball Club, and a number of professional football and basketball players representing the black and whites — followed by partnerships with athletes from Red Star Belgrade.",
  "The next chapter began when a graphic designer joined the team, bringing a new creative dimension to the project. What started as a collaboration evolved into a long-term partnership and, several years later, into the foundation of the creative agency known today as Trivela Group.",
];

/* Kriva "trivele" — putanja lopte savijene spoljnim delom stopala. */
function TrivelaCurve() {
  return (
    <svg
      viewBox="0 0 240 200"
      className="hx-draw w-full max-w-[340px]"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hx-grad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#6fd000" />
          <stop offset="55%" stopColor="#96ff00" />
          <stop offset="100%" stopColor="#d6ff9e" />
        </linearGradient>
      </defs>
      {/* putanja */}
      <motion.path
        d="M26 172 C 84 176 104 150 118 112 C 132 74 158 52 214 40"
        fill="none"
        stroke="url(#hx-grad)"
        strokeWidth={4}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1] }}
      />
      {/* lopta na startu */}
      <motion.circle
        cx={26}
        cy={172}
        r={10}
        fill="#ffffff"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, ease: "backOut" }}
        style={{ transformOrigin: "26px 172px" }}
      />
      {/* meta na kraju */}
      <motion.circle
        cx={214}
        cy={40}
        r={6}
        fill="#96ff00"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.4, delay: 1.5, ease: "backOut" }}
        style={{ transformOrigin: "214px 40px" }}
      />
    </svg>
  );
}

export default function History() {
  const timelineRef = useRef<HTMLDivElement>(null);
  /* Zelena kičma se puni tacno onoliko koliko si prosao kroz vremensku liniju */
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 72%", "end 55%"],
  });
  const spineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <main className="hx-page min-h-screen pb-28 pt-36 sm:pt-44">
      {/* ===== HERO ===== */}
      <section className="relative">
        <div
          className="hx-glow"
          style={{
            top: "-6rem",
            left: "50%",
            width: "42rem",
            height: "42rem",
            transform: "translateX(-50%)",
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(150,255,0,0.16), transparent 70%)",
          }}
        />
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative z-10 mx-auto max-w-4xl px-5 text-center sm:px-8"
        >
          <motion.span
            variants={fadeUp}
            className="text-[11px] font-semibold uppercase tracking-[0.34em] text-zelena sm:text-xs"
          >
            Est. 2019 — Belgrade, Serbia
          </motion.span>
          <motion.h1
            variants={fadeUp}
            className="mt-6 text-6xl font-bold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="text-white">About</span>{" "}
            <span className={`pb-[0.12em] ${GRAD}`}>Us</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg"
          >
            From a single Instagram page to a creative agency crafting iconic
            athlete brands — this is how it happened, and why we're called
            Trivela.
          </motion.p>
        </motion.div>
      </section>

      {/* ===== CHAPTER 01 — ORIGINS ===== */}
      <section className="relative mt-28 sm:mt-36">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="mb-14 sm:mb-20"
          >
            <motion.span
              variants={fadeUp}
              className="text-[11px] font-semibold uppercase tracking-[0.3em] text-zelena"
            >
              (01) — Origins
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="mt-4 text-3xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              How did Trivela Group{" "}
              <span className={GRAD}>begin?</span>
            </motion.h2>
          </motion.div>

          {/* Vremenska linija */}
          <div ref={timelineRef} className="hx-timeline">
            <span className="hx-spine" aria-hidden="true" />
            <motion.span
              className="hx-spine-fill"
              style={{ scaleY: spineScale }}
              aria-hidden="true"
            />

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
            >
              {ORIGIN_STEPS.map((body, i) => (
                <motion.div key={i} variants={fadeUp} className="hx-mile">
                  <span className="hx-node" aria-hidden="true" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zelena">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-3 max-w-2xl text-lg leading-relaxed text-white/75">
                    {body}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== CHAPTER 02 — WHY TRIVELA ===== */}
      <section className="relative mt-32 sm:mt-44">
        <div
          className="hx-glow"
          style={{
            top: "10%",
            right: "-8rem",
            width: "34rem",
            height: "34rem",
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(150,255,0,0.12), transparent 70%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.span
              variants={fadeUp}
              className="text-[11px] font-semibold uppercase tracking-[0.3em] text-zelena"
            >
              (02) — Identity
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="mt-4 text-3xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Why <span className={GRAD}>Trivela?</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-6 max-w-2xl leading-relaxed text-white/65"
            >
              While Trivela Group is now an established name in Belgrade and
              across Serbia, its identity was built around a simple idea shared
              by its founders.
            </motion.p>
          </motion.div>

          {/* The name — kriva trivele */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="mt-20 grid items-center gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-16"
          >
            <motion.div variants={fadeUp}>
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zelena">
                The name
              </span>
              <p className="mt-5 text-lg leading-relaxed text-white/75">
                The name{" "}
                <span className="font-semibold text-zelena">Trivela</span> was
                inspired by one of football’s most distinctive and spectacular
                techniques — an outside-of-the-foot strike associated with
                creativity, confidence and exceptional ability. A move not
                everyone can master.
              </p>
              <p className="mt-4 leading-relaxed text-white/60">
                That philosophy remains at the heart of our identity today.
              </p>
            </motion.div>
            <motion.div
              variants={fadeUp}
              className="flex justify-center rounded-3xl border border-white/10 bg-white/[0.03] p-10"
            >
              <TrivelaCurve />
            </motion.div>
          </motion.div>

          {/* The arrow — strelica nagore */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="mt-14 grid items-center gap-12 lg:grid-cols-[0.9fr_1fr] lg:gap-16"
          >
            <motion.div
              variants={fadeUp}
              className="order-2 flex justify-center rounded-3xl border border-white/10 bg-white/[0.03] p-10 lg:order-1"
            >
              <div className="relative flex items-center justify-center py-4">
                {/* Zeleni odsjaj iza logoa */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-8 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(150,255,0,0.2), transparent 70%)",
                  }}
                />
                <img
                  src="/Logo_Trivela-2.svg"
                  alt="Trivela Group logo"
                  className="relative w-36 sm:w-44"
                />
              </div>
            </motion.div>
            <motion.div variants={fadeUp} className="order-1 lg:order-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zelena">
                The arrow
              </span>
              <p className="mt-5 text-lg leading-relaxed text-white/75">
                The upward-facing arrow embedded within the Trivela Group logo
                represents our ambition and forward-thinking mindset: to help
                talented young athletes grow into elite professionals and build
                powerful personal brands that resonate across Serbian, European
                and global markets.
              </p>
            </motion.div>
          </motion.div>

          {/* Zavrsni CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="mt-24 flex flex-col items-center gap-6 text-center"
          >
            <p
              className="max-w-2xl text-2xl font-bold leading-snug text-white sm:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Careers into stories. Personalities into brands.{" "}
              <span className={GRAD}>Athletes into icons.</span>
            </p>
            <Link
              to="/getInTouch"
              className="inline-flex items-center gap-2 rounded-full bg-zelena px-8 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-teget shadow-[0_10px_30px_rgba(150,255,0,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(150,255,0,0.5)]"
            >
              Work with us
              <span aria-hidden="true">→</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
