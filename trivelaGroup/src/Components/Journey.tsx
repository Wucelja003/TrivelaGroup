import { Link } from "react-router-dom";
import { motion, type Variants } from "motion/react";
import SimpleGraph, { type DataPoint } from "./SimpleGraph";

/*
 * "Our journey" — kratak teaser rasta na pocetnoj: rastuci graf od 2019. do
 * danas + dugme ka punoj prici (Trivela History). Vrednosti su ILUSTRATIVNE
 * (relativni indeks rasta), godine su prave; hover na tacki pokazuje godinu.
 */

const JOURNEY: DataPoint[] = [
  { value: 8, label: "2019" },
  { value: 23, label: "2020" },
  { value: 42, label: "2021" },
  { value: 61, label: "2022" },
  { value: 82, label: "2023" },
  { value: 100, label: "Today" },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
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

export default function Journey() {
  return (
    <section className="relative py-20 sm:py-28">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto max-w-5xl px-5 sm:px-8"
      >
        {/* Zaglavlje */}
        <div className="mx-auto max-w-2xl text-center">
          <motion.span
            variants={fadeUp}
            className="text-[11px] font-semibold uppercase tracking-[0.3em] text-zelena"
          >
            Our journey
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="mt-4 text-3xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            From one post to an{" "}
            <span className="bg-gradient-to-b from-[#d6ff9e] via-[#96ff00] to-[#6fd000] bg-clip-text text-transparent">
              agency.
            </span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-5 max-w-xl leading-relaxed text-white/60"
          >
            Since October 2019, Trivela has grown from a single Instagram page
            into a full creative agency — here's the shape of that climb.
          </motion.p>
        </div>

        {/* Graf */}
        <motion.div
          variants={fadeUp}
          className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-8"
        >
          <SimpleGraph
            data={JOURNEY}
            lineColor="#96ff00"
            dotColor="#96ff00"
            height={340}
            curved
            gradientFade
            showGrid={false}
            showDots
            dotSize={6}
            dotHoverGlow
            graphLineThickness={4}
            animationDuration={2.2}
            animateOnScroll
            animateOnce
            className="w-full text-white"
          />
        </motion.div>

        {/* CTA ka punoj prici */}
        <motion.div variants={fadeUp} className="mt-10 flex justify-center">
          <Link
            to="/history"
            className="group inline-flex items-center gap-2 rounded-full border border-zelena/50 px-8 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-zelena transition-all duration-300 hover:bg-zelena hover:text-teget hover:shadow-[0_14px_40px_rgba(150,255,0,0.4)]"
          >
            View Trivela History
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
