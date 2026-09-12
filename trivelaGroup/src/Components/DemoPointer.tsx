import { motion } from "motion/react";

/*
 * Pokazivac koji se seta po odigranim prikazima (grid -> proizvod, korpa).
 *
 * Pozicija je apsolutna u odnosu na kutiju demoa, pa se `x`/`y` salju u
 * pikselima izmerenim iz te kutije — nista nije hardkodovano, jer prikaz menja
 * sirinu sa ekranom.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

export default function DemoPointer({
  x,
  y,
  pressing,
  travel = 0.85,
}: {
  x: number;
  y: number;
  pressing: boolean;
  /* Koliko putovanje traje, u sekundama. Kratki skokovi (dugme -> torbica)
     ne treba da traju koliko i prelazak preko celog grida. */
  travel?: number;
}) {
  return (
    <motion.span
      className="pointer-events-none absolute left-0 top-0 z-30"
      animate={{ x, y }}
      transition={{ duration: travel, ease: EASE }}
      aria-hidden
    >
      <span className="relative block">
        {/* Talas na klik. Montira se tek kad pritisak pocne, pa se animacija
            vrti iz pocetka na svaki klik. */}
        {pressing && (
          <motion.span
            className="absolute -left-3 -top-3 block h-10 w-10 rounded-full bg-[rgba(124,196,255,0.45)]"
            initial={{ scale: 0.3, opacity: 0.9 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        )}
        <svg viewBox="0 0 24 24" className="h-6 w-6 drop-shadow-[0_2px_6px_rgba(8,34,108,0.45)]">
          <path
            d="M5 2.5 19 12.2l-6.1.7 3.2 6.6-2.6 1.3-3.2-6.6-4.3 4.4z"
            fill="#08226c"
            stroke="#fff"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </motion.span>
  );
}
