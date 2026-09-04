import { useRef, useState } from "react";
import "./PlayersShowcase.css";

/*
 * "Players who trusted our work" — traka video kartica koja se sama lista i
 * staje na hover (isti obrazac kao Partners/PlayerMarquee). Ispod svakog videa
 * idu ime i uloga. Jedna kartica moze da ima vise osoba (isti video).
 */

interface Person {
  name: string;
  role: string;
}

interface Player {
  video: string;
  people: Person[];
}

const players: Player[] = [
  {
    video: "/videoTrivela-web/moneke_case.mp4",
    people: [{ name: "Chima Moneke", role: "BC Player of Crvena Zvezda" }],
  },
  {
    video: "/videoTrivela-web/CaseVideo_2.mp4",
    people: [
      { name: "Ognjen Ugrešić", role: "Football player" },
      { name: "Veljko Milosavljević", role: "Football player" },
      { name: "Vasilije Kostov", role: "Football player" },
    ],
  },
  {
    /* Placeholder — ime/uloga se jos ne znaju. */
    video: "/videoTrivela-web/zocCase.mp4",
    people: [{ name: "Player Name", role: "Club / Role" }],
  },
];

function PlayerCard({ player }: { player: Player }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const multi = player.people.length > 1;

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted) v.play().catch(() => {});
    setMuted(v.muted);
  };

  return (
    <figure className="pls-card">
      <div className="pls-thumb">
        <video
          ref={videoRef}
          src={player.video}
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-colors duration-200 hover:border-zelena hover:text-zelena"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M11 5 6 9H2v6h4l5 4V5z" />
            {muted ? (
              <path d="m22 9-6 6M16 9l6 6" />
            ) : (
              <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" />
            )}
          </svg>
        </button>
      </div>

      <figcaption className={`pls-cap${multi ? " pls-cap--multi" : ""}`}>
        {player.people.map((p) => (
          <div key={p.name} className="pls-person">
            <span className="pls-name">{p.name}</span>
            <span className="pls-role">
              <span className="pls-dot" />
              {p.role}
            </span>
          </div>
        ))}
      </figcaption>
    </figure>
  );
}

export default function PlayersShowcase() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="relative z-10">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-7xl px-5 text-center sm:mb-20 sm:px-8">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-zelena">
            Trusted by
          </span>
          <h2 className="mx-auto mt-5 max-w-4xl bg-gradient-to-b from-[#d6ff9e] via-[#96ff00] to-[#6fd000] bg-clip-text pb-[0.16em] text-4xl font-extrabold leading-[1.05] tracking-tight text-transparent [filter:drop-shadow(0_0_28px_rgba(150,255,0,0.28))] sm:text-5xl lg:text-6xl">
            Players who trust our work
          </h2>
        </div>

        {/* Traka — TACNO dve iste kopije, pomak -50% pa se vrti bez skoka.
            Razmak kroz margin (ne gap), da -50% bude tacan. */}
        <div className="pls-marquee">
          <div className="pls-track">
            {players.map((p, i) => (
              <PlayerCard key={`1-${i}`} player={p} />
            ))}
            {players.map((p, i) => (
              <PlayerCard key={`2-${i}`} player={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
