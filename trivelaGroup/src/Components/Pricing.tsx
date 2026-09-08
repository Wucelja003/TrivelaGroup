import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/*
 * "Packages" — tri paketa (Standard / Premium / Elite). Levo su tri izbora,
 * desno se panel menja prema izabranom. Tekst je klijentov (finalan), bez cene.
 *
 * Adaptirano iz react-bits Pricing13: bez "use client", bez lucide-react
 * (inline Check SVG), prebojeno u Trivela temu (tamno + zeleni akcenat).
 */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface Plan {
  name: string;
  badge: string | null;
  tagline: string;
  cta: string;
  lead: string;
  features: string[];
}

const plans: Plan[] = [
  {
    name: "Standard",
    badge: null,
    tagline: "Everything you need to look the part.",
    cta: "Choose Standard",
    lead: "What's included:",
    features: [
      "Social media management",
      "Photo editing",
      "Matchday design",
      "Monthly performance report",
      "Basic PR outreach",
      "Community management",
    ],
  },
  {
    name: "Premium",
    badge: null,
    tagline: "For athletes ready to become a brand.",
    cta: "Choose Premium",
    lead: "Everything in Standard, plus:",
    features: [
      "Social media management (more platforms)",
      "Video production & editing",
      "PR & media relations",
      "Paid ads management",
      "Interviews & Media",
    ],
  },
  {
    name: "Elite",
    badge: null,
    tagline: "Complete brand partnership.",
    cta: "Choose Elite",
    lead: "Everything in Premium, plus:",
    features: [
      "Dedicated account manager",
      "Brand strategy & consulting",
      "Influencer partnerships",
      "Priority support",
    ],
  },
];

function Check({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 12l5 5L20 6" />
    </svg>
  );
}

export default function Pricing() {
  const [active, setActive] = useState(1);
  const reduceMotion = useReducedMotion();
  const plan = plans[active];
  const shift = reduceMotion ? 0 : 18;

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: shift },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
  };

  return (
    <section className="relative w-full px-5 py-20 sm:px-8 sm:py-28">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={container}
        className="mx-auto w-full max-w-7xl"
      >
        <motion.div variants={item} className="max-w-2xl">
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-[0.2em] text-zelena">
            Packages
          </span>
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            Built around <span className="text-zelena">your game.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/60 sm:text-lg">
            Every athlete is different. So is the way we work.
          </p>
          <p className="mt-3 text-base leading-relaxed text-white/60 sm:text-lg">
            Choose the level of support that fits your career, your ambitions
            and the brand you want to build.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
          {/* Levo — izbor paketa */}
          <div>
            <div className="space-y-3" role="group" aria-label="Select a package">
              {plans.map((option, index) => {
                const selected = active === index;
                return (
                  <motion.button
                    key={option.name}
                    variants={item}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setActive(index)}
                    className={`relative w-full cursor-pointer rounded-2xl border p-5 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zelena focus-visible:ring-offset-2 focus-visible:ring-offset-teget ${
                      selected
                        ? "border-transparent"
                        : "border-white/10 hover:border-white/25"
                    }`}
                  >
                    {selected && (
                      <motion.span
                        layoutId="pricing-selected"
                        transition={{
                          duration: reduceMotion ? 0 : 0.35,
                          ease: EASE,
                        }}
                        className="absolute -inset-px rounded-2xl bg-white/[0.06] ring-2 ring-inset ring-zelena"
                      />
                    )}
                    <span className="relative z-10 flex items-start gap-4">
                      <span
                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors duration-200 ${
                          selected ? "border-zelena" : "border-white/25"
                        }`}
                      >
                        <motion.span
                          initial={false}
                          animate={{ scale: selected ? 1 : 0 }}
                          transition={{
                            duration: reduceMotion ? 0 : 0.2,
                            ease: EASE,
                          }}
                          className="h-2.5 w-2.5 rounded-full bg-zelena"
                        />
                      </span>
                      <span className="flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-semibold text-white">
                            {option.name}
                          </span>
                          {option.badge && (
                            <span className="rounded-full bg-zelena px-2 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wide text-[#00230a]">
                              {option.badge}
                            </span>
                          )}
                        </span>
                        <span className="mt-1 block text-sm leading-relaxed text-white/55">
                          {option.tagline}
                        </span>
                      </span>
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Desno — detalji izabranog */}
          <motion.div
            variants={item}
            className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur-sm sm:p-8 lg:p-10"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
                transition={{ duration: reduceMotion ? 0 : 0.25, ease: EASE }}
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-2xl font-semibold tracking-tight text-white">
                    {plan.name}
                  </h3>
                  {plan.badge && (
                    <span className="rounded-full bg-zelena px-2 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wide text-[#00230a]">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {plan.tagline}
                </p>

                <p className="mt-8 text-sm font-medium text-white">
                  {plan.lead}
                </p>
                <ul className="mt-4 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm leading-relaxed text-white/70"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-zelena" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/getInTouch"
                  className="mt-8 block w-full rounded-full bg-zelena px-8 py-3.5 text-center text-sm font-bold uppercase tracking-[0.08em] text-[#00230a] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-8px_rgba(150,255,0,0.55)]"
                >
                  {plan.cta}
                </Link>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
