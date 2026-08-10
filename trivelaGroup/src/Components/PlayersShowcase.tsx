import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import "./PlayersShowcase.css";

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

/* Reveal na scroll (robusno, sa fallback visinom za preview) */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => {
      const vh =
        window.innerHeight || document.documentElement.clientHeight || 800;
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.82 && r.bottom > 0) {
        setShown(true);
        window.removeEventListener("scroll", check);
        return true;
      }
      return false;
    };
    if (check()) return;
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);
  return [ref, shown] as const;
}

function PlayerVideo({ src, label }: { src: string; label: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted) v.play().catch(() => {});
    setMuted(v.muted);
  };

  return (
    <div className="relative w-full max-w-[300px] lg:max-w-[340px]">
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-[radial-gradient(60%_60%_at_50%_40%,rgba(150,255,0,0.13),transparent_70%)]" />
      <div className="relative aspect-[9/16] overflow-hidden rounded-[1.75rem] border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.5)] transition-shadow duration-300 hover:shadow-[0_0_60px_rgba(150,255,0,0.2)]">
        <video
          ref={videoRef}
          src={src}
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? `Unmute ${label}` : `Mute ${label}`}
          className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-colors duration-200 hover:border-zelena hover:text-zelena"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
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
    </div>
  );
}

function PlayerRow({ player, index }: { player: Player; index: number }) {
  const [ref, shown] = useReveal<HTMLDivElement>();
  const videoLeft = index % 2 === 0;
  const num = String(index + 1).padStart(2, "0");
  /* Vise igraca u redu => manja slova da sva stanu */
  const multi = player.people.length > 1;
  const align = videoLeft
    ? "justify-center lg:justify-start"
    : "justify-center lg:justify-end";

  return (
    <div
      ref={ref}
      className={`grid items-center gap-10 lg:gap-16 ${
        videoLeft
          ? "lg:grid-cols-[minmax(0,360px)_1fr]"
          : "lg:grid-cols-[1fr_minmax(0,360px)]"
      }`}
    >
      {/* Video — hugged to the outer edge */}
      <div
        className={`flex justify-center ${
          videoLeft
            ? "lg:order-1 lg:justify-start pl-from-left"
            : "lg:order-2 lg:justify-end pl-from-right"
        } ${shown ? "show" : ""}`}
      >
        <PlayerVideo
          src={player.video}
          label={player.people.map((p) => p.name).join(", ")}
        />
      </div>

      {/* Text */}
      <div
        className={`relative ${
          videoLeft
            ? "lg:order-2 pl-from-right lg:text-left"
            : "lg:order-1 pl-from-left lg:text-right"
        } ${shown ? "show" : ""} text-center`}
      >
        {/* Ghost number */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 select-none text-[8rem] font-black leading-none text-white/[0.045] sm:text-[11rem]"
        >
          {num}
        </span>

        <div className="relative z-10">
          {/* Eyebrow */}
          <div className={`flex items-center gap-3 ${align}`}>
            <span className="h-px w-8 bg-gradient-to-r from-transparent via-zelena to-transparent" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-zelena">
              ({num}) — {multi ? "Clients" : "Client"}
            </span>
          </div>

          {/* Igraci — svaki se pojavljuje sa malim kasnjenjem (--i) */}
          <div className={`mt-5 flex flex-col ${multi ? "gap-7" : ""}`}>
            {player.people.map((p, i) => (
              <div
                key={p.name}
                className="pl-person"
                style={{ "--i": i } as CSSProperties}
              >
                <h3
                  className={`pl-name font-extrabold leading-[1.02] tracking-tight ${
                    multi
                      ? "text-2xl sm:text-3xl lg:text-4xl"
                      : "text-4xl sm:text-5xl lg:text-6xl"
                  }`}
                >
                  {p.name}
                </h3>

                <div className={`mt-2.5 flex items-center gap-2.5 ${align}`}>
                  <span className="h-2 w-2 shrink-0 rounded-full bg-zelena shadow-[0_0_10px_#96ff00]" />
                  <p
                    className={`text-white/60 ${
                      multi ? "text-sm sm:text-base" : "text-base sm:text-lg"
                    }`}
                  >
                    {p.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlayersShowcase() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header */}
        <div className="mb-20 text-center sm:mb-28">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-zelena">
            Trusted by
          </span>
          <h2 className="mx-auto mt-5 max-w-4xl bg-gradient-to-b from-[#d6ff9e] via-[#96ff00] to-[#6fd000] bg-clip-text pb-[0.16em] text-4xl font-extrabold leading-[1.05] tracking-tight text-transparent [filter:drop-shadow(0_0_28px_rgba(150,255,0,0.28))] sm:text-5xl lg:text-6xl">
            Players who trusted our work
          </h2>
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-24 sm:gap-32">
          {players.map((p, i) => (
            <PlayerRow key={i} player={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
