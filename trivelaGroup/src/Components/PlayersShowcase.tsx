import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import SkewedCarousel, {
  type SkewedCarouselItem,
} from "./SkewedCarousel";
import "./PlayersShowcase.css";

/*
 * "Players who trust our work" — traka Fantasy kartica koja se sama lista i
 * staje na hover. Igrac (isecen PNG) "iskace" iznad okvira kartice, a ispod
 * je plocica sa imenom.
 *
 * SLIKE: public/igraci — JEDINI folder sa igracima. Unutra su WebP kopije na
 * 480px; originali stoje van projekta (Desktop/VV/Reserved folders), jer su
 * preteski da se vuku na svakoj poseti.
 */

interface Player {
  first: string;
  last: string;
  /* Ime fajla u public/igraci, bez ekstenzije */
  file: string;
}

/* Prvih osam je namerno ovim redom (trazio klijent); ostali abecedno po
   prezimenu. */
const players: Player[] = [
  { first: "Veljko", last: "Milosavljević", file: "Veljko_Milosavljevic" },
  { first: "Ognjen", last: "Ugrešić", file: "Ognjen_Ugresic" },
  { first: "Vasilije", last: "Kostov", file: "Vasilije_Kostov" },
  { first: "Matija", last: "Popović", file: "Matija_Popovic" },
  { first: "Marko", last: "Veličković", file: "Velicko"},
  { first: "Dimitrije", last: "Šarić", file: "Dimitrije_Saric" },
  { first: "Aleksa", last: "Damjanović", file: "Aleksa_Damjanovic" },
  { first: "Vladimir", last: "Lučić", file: "Vladimir_Lucic" },
  { first: "Đorđe", last: "Ranković", file: "Djordje_Rankovic" },
  { first: "Igor", last: "Miladinović", file: "Igor_Miladinovic" },
  { first: "Stefan", last: "Džodić", file: "Stefan_Dzodic" },
  { first: "Patrick", last: "Enrici", file: "Patrick_Enrici" },
  { first: "Mihajlo", last: "Ilić", file: "Mihajlo_Ilic" },
  { first: "Mihailo", last: "Ivanović", file: "Mihailo_Ivanovic" },
  { first: "Lazar", last: "Jovanović", file: "Lazar_Jovanovic" },
  { first: "Stefan", last: "Mitrović", file: "Stefan_Mitrovic" },
  { first: "Bibars", last: "Natcho", file: "Bibars_Natcho" },
  { first: "Nemanja", last: "Nikolić", file: "Nemanja_Nikolic" },
  { first: "Nikola", last: "Petković", file: "Nikola_Petkovic" },
  { first: "Viktor", last: "Radojević", file: "Viktor_Radojevic" },
  { first: "Levi", last: "Randolph", file: "Levi_Randolph" },
  { first: "Petar", last: "Ratkov", file: "Petar_Ratkov" },
  { first: "Mihailo", last: "Stevanović", file: "Mihailo_Stevanovic" },
  { first: "Sara", last: "Stokić", file: "Sara_Stokic" },
  { first: "Nikola", last: "Štulić", file: "Nikola_Stulic" },
  { first: "Nemanja", last: "Trifunović", file: "Nemanja_Trifunovic" },
  { first: "Aljoša", last: "Vasić", file: "Aljosa_Vasic" },
  { first: "Ibrahim", last: "Zubairu", file: "Ibrahim_Zubairu" },
];

/* Karusel nosi samo sliku i naslov, pa igraca vracamo po naslovu */
const byTitle = new Map(players.map((p) => [`${p.first} ${p.last}`, p]));

function PlayerCard({
  player,
  load,
  focused = true,
}: {
  player: Player;
  load: boolean;
  /* Kartica u fokusu je puna; bocne su malo prigusene */
  focused?: boolean;
}) {
  return (
    <figure className={`pls-card${focused ? " is-focused" : ""}`}>
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
            src={load ? `/igraci/${player.file}.webp` : undefined}
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

/* true od trenutka kad element PRVI PUT udje u (prosireni) kadar */
function useSeenOnce<T extends Element>(options: IntersectionObserverInit) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  const { rootMargin, threshold } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSeen(true);
        io.disconnect();
      },
      { rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, threshold]);

  return [ref, seen] as const;
}

/* Kartice za karusel: slika je ono sto karusel zna, a `player` nosimo uz
   nju da kartica moze da se nacrta u renderItem. */
const items: SkewedCarouselItem[] = players.map((p) => ({
  src: `/igraci/${p.file}.webp`,
  title: `${p.first} ${p.last}`,
}));

export default function PlayersShowcase() {
  const { t } = useTranslation();
  /* Slike se ucitaju SVE kad se sekcija priblizi, ne jedna po jedna:
     karusel drzi bocne kartice van kadra, pa bi "lazy" svaku dovlacio tek
     kad dodje na red i kartica bi bila prazna dok se ne skine. */
  const [sectionRef, load] = useSeenOnce<HTMLElement>({
    rootMargin: "800px 0px",
  });

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-24 sm:py-32">
      <div className="relative z-10">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-7xl px-5 text-center sm:mb-16 sm:px-8">
          <h2 className="mx-auto max-w-4xl bg-gradient-to-b from-[#d6ff9e] via-[#96ff00] to-[#6fd000] bg-clip-text pb-[0.16em] text-4xl font-extrabold leading-[1.05] tracking-tight text-transparent [filter:drop-shadow(0_0_28px_rgba(150,255,0,0.28))] sm:text-5xl lg:text-6xl">
            {t("home.players.title")}
          </h2>
        </div>

        {/* Coverflow: karusel daje 3D okvir, strelice, tackice, prevlacenje i
            tastere, a kartica ostaje nasa (okvir, znak, plocica sa imenom). */}
        <div className="pls-rail text-white">
          <SkewedCarousel
            items={items}
            renderItem={(item, focused) => {
              const player = byTitle.get(item.title);
              if (!player) return null;
              return <PlayerCard player={player} load={load} focused={focused} />;
            }}
            initialIndex={0}
            cardWidth={218}
            aspectRatio="10 / 13"
            rotation={52}
            inactiveScale={0.84}
            perspective={950}
            borderRadius={18}
            loop
            /* Bez automatskog listanja — posetilac vodi, strelicama,
               tackicama, prevlacenjem ili tasterima. */
            autoplay={false}
            showTitles={false}
            showControls
            showDots
            enableDrag
            enableKeyboard
          />
        </div>
      </div>
    </section>
  );
}
