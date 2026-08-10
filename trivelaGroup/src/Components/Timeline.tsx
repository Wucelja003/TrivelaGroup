import { useEffect, useRef, useState } from "react";
import "./Timeline.css";

/*
 * Zmijolika vremenska linija sa karticama naizmenicno levo/desno.
 *
 * Izdvojeno iz Clients strane da bi isto koristio i Trivela Drop. Geometrija
 * (bezijeova kriva kroz centre redova + crtanje linije preko stroke-dashoffset)
 * je previse osetljiva da stoji u dve kopije.
 *
 * Boje idu kroz CSS promenljive na .tl-scope — vidi Timeline.css.
 */

export interface TimelineItem {
  img: string;
  name: string;
  role: string;
}

interface Geo {
  d: string;
  xs: number[];
  w: number;
  h: number;
}

export default function Timeline({
  items,
  variant = "green",
}: {
  items: TimelineItem[];
  /* green = tamna podloga (Clients), blue = bela podloga (Trivela Drop) */
  variant?: "green" | "blue";
}) {
  const itemsRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<SVGPathElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lenRef = useRef(0);
  const [geo, setGeo] = useState<Geo>({ d: "", xs: [], w: 0, h: 0 });

  /* Zmijolika putanja kroz centre redova — naizmenicno levo/desno,
     sa vertikalnim tangentama u cvorovima pa krive lepo tecu jedna u drugu. */
  useEffect(() => {
    const root = itemsRef.current;
    if (!root) return;

    const measure = () => {
      const rows = rowRefs.current.filter(Boolean) as HTMLDivElement[];
      if (rows.length < 2) return;
      const cr = root.getBoundingClientRect();
      const w = root.clientWidth;
      const h = root.clientHeight;
      /* Bez dimenzija nema smisla racunati — RO ce nas pozvati opet kad
         layout slegne. Inace bi upisali pokvaren viewBox (npr. "0 0 0 1396"). */
      if (!w || !h) return;

      /* Ne oslanjaj se na innerWidth/matchMedia — u nekim okruzenjima vrate 0
         pa dobijemo mobilnu geometriju preko desktop rasporeda. Spacer je
         "hidden sm:block", pa njegova sirina je pouzdan signal sta je CSS
         zaista primenio. */
      const spacer = rows[0].querySelector(".tl-spacer");
      const wide = !!spacer && spacer.getBoundingClientRect().width > 0;
      const cx = wide ? w / 2 : 27;
      /* Amplituda mora da stane u razmak izmedju kartica i sredine */
      const amp = wide ? Math.min(70, w * 0.07) : 14;

      const pts = rows.map((r, i) => {
        const rr = r.getBoundingClientRect();
        return {
          /* Paznja: klasa "from-left" zbog flex order-a renderuje karticu
             DESNO (i obrnuto). Talas se izvija ka kartici, pa parni red ide
             udesno. */
          x: cx + (i % 2 === 0 ? amp : -amp),
          y: rr.top + rr.height / 2 - cr.top,
        };
      });

      let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        const dy = (b.y - a.y) / 2;
        d +=
          ` C ${a.x.toFixed(1)} ${(a.y + dy).toFixed(1)},` +
          ` ${b.x.toFixed(1)} ${(b.y - dy).toFixed(1)},` +
          ` ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
      }

      const xs = pts.map((p) => p.x);
      setGeo((g) => (g.d === d && g.w === w && g.h === h ? g : { d, xs, w, h }));
    };

    measure();
    /* ResizeObserver hvata i ucitavanje slika, ne samo resize prozora */
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, [items.length]);

  /* Duzina putanje -> dasharray, da se linija moze "crtati" */
  useEffect(() => {
    const p = fillRef.current;
    if (!p || !geo.d) return;
    const len = p.getTotalLength();
    lenRef.current = len;
    p.style.strokeDasharray = `${len}`;
    p.style.strokeDashoffset = `${len}`;
  }, [geo.d]);

  /* Punjenje linije i paljenje cvorova na skrol */
  useEffect(() => {
    const root = itemsRef.current;
    if (!root) return;
    let raf = 0;
    let running = false;

    const tick = () => {
      const nodes = nodeRefs.current;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (first && last) {
        /* innerHeight je 0 u preview-u — fallback kao i drugde na sajtu */
        const vh =
          window.innerHeight || document.documentElement.clientHeight || 800;
        const activation = vh * 0.62;
        const fr = first.getBoundingClientRect();
        const lr = last.getBoundingClientRect();
        const fC = fr.top + fr.height / 2;
        const lC = lr.top + lr.height / 2;
        const span = lC - fC;
        const pct =
          span > 0 ? Math.min(1, Math.max(0, (activation - fC) / span)) : 0;
        if (fillRef.current && lenRef.current) {
          fillRef.current.style.strokeDashoffset = `${
            lenRef.current * (1 - pct)
          }`;
        }
        nodes.forEach((n) => {
          if (!n) return;
          const nr = n.getBoundingClientRect();
          const nc = nr.top + nr.height / 2;
          const row = n.closest(".tl-row");
          if (nc <= activation) {
            n.classList.add("is-active");
            row?.classList.add("is-active");
          } else {
            n.classList.remove("is-active");
            row?.classList.remove("is-active");
          }
        });
      }
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !running) {
            running = true;
            raf = requestAnimationFrame(tick);
          } else if (!e.isIntersecting && running) {
            running = false;
            cancelAnimationFrame(raf);
          }
        });
      },
      { rootMargin: "300px 0px" }
    );
    io.observe(root);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  /* Kartice klize sa svoje strane kad udju u vidno polje */
  useEffect(() => {
    const cards = itemsRef.current?.querySelectorAll(".tl-card");
    if (!cards) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [items.length]);

  return (
    <div
      ref={itemsRef}
      className={`tl-scope relative${variant === "blue" ? " tl-scope--blue" : ""}`}
    >
      {/* Zmijolika linija — isprekidana baza + akcenat koji se crta */}
      {geo.d && (
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${geo.w} ${geo.h}`}
          fill="none"
        >
          <path
            className="tl-base"
            d={geo.d}
            strokeWidth={1.5}
            strokeDasharray="5 7"
            strokeLinecap="round"
          />
          <path
            ref={fillRef}
            className="tl-fill"
            d={geo.d}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </svg>
      )}

      <div className="flex flex-col gap-16 sm:gap-24">
        {items.map((c, i) => {
          const side = i % 2 === 0 ? "left" : "right";
          return (
            <div
              key={`${c.name}-${i}`}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              className="tl-row relative flex items-center pl-16 sm:pl-0"
            >
              {/* Cvor — sedi tacno na krivini */}
              <div
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
                style={{ left: geo.xs[i] ?? 27 }}
                className="tl-node absolute top-1/2 z-10 grid -translate-x-1/2 -translate-y-1/2 place-items-center"
              >
                <span className="tl-pulse absolute h-6 w-6 rounded-full" />
                <span className="tl-dot h-4 w-4 rounded-full border" />
              </div>

              {/* Spacer (desktop levo/desno raspored) — njegova sirina
                  sluzi i kao signal da li je sm: layout aktivan */}
              <div
                className={`tl-spacer hidden sm:block sm:w-1/2 ${
                  side === "right" ? "sm:order-2" : ""
                }`}
              />

              <article
                className={`tl-card group w-full sm:w-1/2 ${
                  side === "left"
                    ? "from-left sm:pr-24 sm:text-right"
                    : "from-right sm:order-1 sm:pl-24"
                }`}
              >
                <div
                  className={`flex flex-col gap-4 ${
                    side === "left" ? "sm:items-end" : "sm:items-start"
                  }`}
                >
                  <div className="tl-thumb w-full max-w-xs overflow-hidden rounded-2xl border shadow-2xl transition-all duration-300">
                    <img
                      src={c.img}
                      alt={c.name}
                      loading="lazy"
                      className="aspect-[4/5] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                  </div>

                  <div>
                    <h3 className="tl-name text-2xl font-bold tracking-tight sm:text-3xl">
                      {c.name}
                    </h3>
                    <p className="tl-role mt-1 text-sm sm:text-base">{c.role}</p>
                  </div>
                </div>
              </article>
            </div>
          );
        })}
      </div>
    </div>
  );
}
