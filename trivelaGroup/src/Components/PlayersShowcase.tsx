import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import "./PlayersShowcase.css";

/*
 * "Players who trust our work" — traka Fantasy kartica koja se sama lista i
 * staje na hover. Igrac (isecen PNG) "iskace" iznad okvira kartice, a ispod
 * je plocica sa imenom. Slike su WebP kopije iz public/png_igraci
 * (public/png_igraci-web, 480px) — originali su preteski za traku.
 */

interface Player {
  first: string;
  last: string;
  /* Ime fajla u public/png_igraci-web, bez ekstenzije */
  file: string;
}

/* Prvih sest je namerno ovim redom (trazio klijent); ostali abecedno. */
const players: Player[] = [
  { first: "Vasilije", last: "Kostov", file: "Kostov" },
  { first: "Ognjen", last: "Ugrešić", file: "Ugresic" },
  { first: "Veljko", last: "Milosavljević", file: "Veljko_Milosavljevic" },
  { first: "Dimitrije", last: "Sarić", file: "Dimitrije_Saric" },
  { first: "Vladimir", last: "Lučić", file: "Vladimir_Lucic" },
  { first: "Igor", last: "Miladinović", file: "Igor_Miladinovic" },
  { first: "Aleksa", last: "Damjanović", file: "Aleksa_Damjanovic" },
  { first: "Aljoša", last: "Vasić", file: "Aljosa_Vasic" },
  { first: "Bibras", last: "Natcho", file: "Bibars_Natcho" },
  { first: "Đorđe", last: "Ranković", file: "Djordje_Rankovic" },
  { first: "Ibrahim", last: "Zubairu", file: "Ibrahim_Zubairu" },
  { first: "Lazar", last: "Jovanović", file: "Lazar_Jovanovic" },
  { first: "Levi", last: "Randolph", file: "Levi_Randolph" },
  { first: "Mihailo", last: "Ivanović", file: "Mihailo_Ivanovic" },
  { first: "Mihailo", last: "Stevanović", file: "Mihailo_Stevanovic" },
  { first: "Mihajlo", last: "Ilić", file: "Mihajlo_Ilic" },
  { first: "Nemanja", last: "Nikolić", file: "Nemanja_Nikolic" },
  { first: "Nemanja", last: "Trifunović", file: "Nemanja_Trifunovic" },
  { first: "Nikola", last: "Petković", file: "Nikola_Petkovic" },
  { first: "Nikola", last: "Štulić", file: "Nikola_Stulic" },
  { first: "Patrick", last: "Enrici", file: "Patrick_Enrici" },
  { first: "Petar", last: "Ratkov", file: "Petar_Ratkov" },
  { first: "Sara", last: "Stokić", file: "Sara_Stokic" },
  { first: "Stefan", last: "Džodić", file: "Stefan_Dzodic" },
  { first: "Stefan", last: "Mitrović", file: "Stefan_Mitrovic" },
  { first: "Viktor", last: "Radojević", file: "Viktor_Radojevic" },
];

/* Brzina trake ne zavisi od broja kartica: ~4.5s po kartici */
const DURATION = `${players.length * 4.5}s`;

function PlayerCard({
  player,
  copy,
  load,
}: {
  player: Player;
  copy?: boolean;
  load: boolean;
}) {
  return (
    <figure className="pls-card" aria-hidden={copy || undefined}>
      <div className="pls-frame">
        <div className="pls-panel" />
        <img
          src="/Trivela_Logo_mark.svg"
          alt=""
          aria-hidden="true"
          className="pls-badge"
          draggable={false}
        />
        {/* Glatko se pojavi kad se ucita; ref pokriva i vec kesirane slike,
            gde onLoad ume da okine pre nego sto React zakaci handler. */}
        <div className="pls-photo-clip">
          <img
            src={load ? `/png_igraci-web/${player.file}.webp` : undefined}
            alt=""
            width={480}
            height={480}
            decoding="async"
            draggable={false}
            className="pls-photo"
            ref={(el) => {
              /* complete je true i za <img> bez src-a, pa proveri i sliku */
              if (el?.complete && el.naturalWidth > 0) el.classList.add("is-in");
            }}
            onLoad={(e) => e.currentTarget.classList.add("is-in")}
          />
        </div>
      </div>

      <figcaption className="pls-plate">
        <span className="pls-first">{player.first}</span>
        <span className="pls-last">{player.last}</span>
      </figcaption>
    </figure>
  );
}

export default function PlayersShowcase() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  /* Slike se ucitaju SVE kad se sekcija priblizi, ne jedna po jedna:
     loading="lazy" ne vidi kartice odsecene trakom (desno van kadra), pa bi
     svaka iskocila tek na ivici. */
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setLoad(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setLoad(true);
        io.disconnect();
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-24 sm:py-32">
      <div className="relative z-10">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-7xl px-5 text-center sm:mb-16 sm:px-8">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-zelena">
            {t("home.players.eyebrow")}
          </span>
          <h2 className="mx-auto mt-5 max-w-4xl bg-gradient-to-b from-[#d6ff9e] via-[#96ff00] to-[#6fd000] bg-clip-text pb-[0.16em] text-4xl font-extrabold leading-[1.05] tracking-tight text-transparent [filter:drop-shadow(0_0_28px_rgba(150,255,0,0.28))] sm:text-5xl lg:text-6xl">
            {t("home.players.title")}
          </h2>
        </div>

        {/* Traka — TACNO dve iste kopije, pomak -50% pa se vrti bez skoka.
            Razmak kroz margin (ne gap), da -50% bude tacan. Druga kopija je
            samo vizuelna, citac ekrana je preskace. */}
        <div className="pls-marquee">
          <div
            className="pls-track"
            style={{ "--pls-duration": DURATION } as CSSProperties}
          >
            {players.map((p) => (
              <PlayerCard key={`1-${p.file}`} player={p} load={load} />
            ))}
            {players.map((p) => (
              <PlayerCard key={`2-${p.file}`} player={p} load={load} copy />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
