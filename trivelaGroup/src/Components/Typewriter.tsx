import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import "./Typewriter.css";

/*
 * Kucanje "kao rukom" — tekst se ispisuje slovo po slovo, JEDNOM (bez brisanja
 * i bez petlje), sa trepćućim kursorom koji nestane na kraju.
 *
 * Ceo tekst je uvek u DOM-u: odkucani deo je vidljiv, ostatak je nevidljiv
 * (opacity 0) ali DRŽI prostor — pa dok se kuca ništa ispod ne skače.
 *
 * `start`: kreni tek kad je true (npr. kad se ostali hero elementi pojave).
 * prefers-reduced-motion: ceo tekst odmah, bez kucanja.
 */
interface Props {
  text: string;
  start?: boolean;
  /* ms po slovu */
  speed?: number;
  className?: string;
}

export default function Typewriter({
  text,
  start = true,
  speed = 42,
  className = "",
}: Props) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    /* Namerno postavljanje stanja u efektu — vezano za start/reduce/text
       (kontrolisan reset kucanja, ne izvedeno stanje). */
    if (!start) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCount(0);
      return;
    }
    if (reduce) {
      setCount(text.length);
      return;
    }
    setCount(0);
    let i = 0;
    const tick = () => {
      i += 1;
      setCount(i);
      if (i < text.length) timer.current = setTimeout(tick, speed);
    };
    timer.current = setTimeout(tick, speed);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [start, reduce, text, speed]);

  const done = count >= text.length;

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">{text.slice(0, count)}</span>
      {!reduce && start && !done && (
        <span className="tw-caret" aria-hidden="true">
          |
        </span>
      )}
      {/* Ostatak drži prostor da ništa ne skače dok se kuca */}
      <span aria-hidden="true" style={{ opacity: 0 }}>
        {text.slice(count)}
      </span>
    </span>
  );
}
