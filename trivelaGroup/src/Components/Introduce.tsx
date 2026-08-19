import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Introduce.css";

const stats = [
  { value: "20+", label: "Athletes" },
  { value: "50+", label: "Projects" },
  { value: "3", label: "Core services" },
];

// Broji od 0 do ciljne vrednosti kad `start` postane true (čuva sufiks npr "+")
function CountUp({ value, start }: { value: string; start: boolean }) {
  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : "";
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!start) return;
    let raf = 0;
    let t0: number | null = null;
    const dur = 2400;
    const tick = (t: number) => {
      if (t0 === null) t0 = t;
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target]);

  return (
    <>
      {n}
      {suffix}
    </>
  );
}

function VideoShowcase() {
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
    <div className="relative mx-auto w-full max-w-[320px] lg:max-w-[360px]">
      {/* Green glow behind */}
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-[radial-gradient(60%_60%_at_50%_40%,rgba(150,255,0,0.14),transparent_70%)]" />

      <div className="group relative aspect-[9/16] overflow-hidden rounded-[1.75rem] border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.5)] transition-shadow duration-300 hover:shadow-[0_0_60px_rgba(150,255,0,0.22)]">
        <video
          ref={videoRef}
          src="/videoTrivela-web/mainCaseVideo.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        />

        {/* Top badge */}
        <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zelena opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-zelena" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/85">
            Showreel
          </span>
        </div>

        {/* Bottom gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/55 to-transparent" />

        {/* Mute toggle */}
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
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

      {/* Caption under video */}
      <p className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-white/40">
        Custom cases — in motion
      </p>
    </div>
  );
}

export default function Introduce() {
  const sectionRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [statsShown, setStatsShown] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const check = () => {
      const vh =
        window.innerHeight || document.documentElement.clientHeight || 800;
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.8 && r.bottom > 0) {
        setVisible(true);
        window.removeEventListener("scroll", check);
        return true;
      }
      return false;
    };
    if (check()) return;
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  // Count-up kreće tek kad su statistike stvarno u vidokrugu (da se vidi animacija)
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const check = () => {
      const vh =
        window.innerHeight || document.documentElement.clientHeight || 800;
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.75 && r.bottom > 0) {
        setStatsShown(true);
        window.removeEventListener("scroll", check);
        return true;
      }
      return false;
    };
    if (check()) return;
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative mt-20 pb-20 pt-10 sm:mt-28 sm:pb-28 sm:pt-14"
    >
      {/* Zaglavlje panela — logo pa naslov, na temenu luka */}
      <div className="relative z-10 mb-16 flex flex-col items-center gap-4 px-5 text-center sm:mb-20">
        <img
          src="/Logo_Trivela-2.svg"
          alt=""
          aria-hidden="true"
          className="h-10 w-auto [filter:drop-shadow(0_0_16px_rgba(150,255,0,0.4))] sm:h-11"
        />
        <span className="text-sm font-medium tracking-[0.14em] text-zelena sm:text-[15px]">
          The story of Trivela
        </span>
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        {/* Left — editorial text */}
        <div className={`intro-left ${visible ? "in" : ""}`}>
          {/* Eyebrow */}
          <div className="flex items-center gap-4">
            <span className="intro-hline" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zelena">
              (01) — Who we are
            </span>
          </div>

          {/* Headline */}
          <h2 className="mt-7 text-4xl font-bold leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-6xl">
            What is{" "}
            <span className="bg-gradient-to-b from-[#d6ff9e] via-[#96ff00] to-[#6fd000] bg-clip-text pb-[0.16em] text-transparent">
              Trivela Group
            </span>
            <span className="text-zelena">?</span>
          </h2>

          {/* Text with vertical accent line */}
          <div className="mt-9 flex gap-6">
            <span className="intro-vline" />
            <div className="max-w-xl space-y-5">
              <p className="text-lg leading-relaxed text-white/80 sm:text-xl">
                <span className="text-white">A young, creative agency</span>{" "}
                built around marketing, PR and consulting — we help footballers
                and brands tell their story and stand out, on and off the pitch.
              </p>
              <p className="leading-relaxed text-white/55">
                Beyond managing the profiles of our clients, we craft custom
                phone cases featuring your favorite players — turning passion for
                football into something you can carry every day.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div ref={statsRef} className="mt-11 flex flex-wrap gap-x-12 gap-y-6">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold tracking-tight text-zelena sm:text-4xl">
                  <CountUp value={s.value} start={statsShown} />
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/45">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/gallery"
            className="btn-ripple btn-wind-green relative mt-11 inline-flex items-center gap-2 overflow-hidden rounded-full px-7 py-3.5 text-sm font-semibold"
          >
            See our work
            <span aria-hidden="true" className="arrow">
              →
            </span>
          </Link>
        </div>

        {/* Right — showcase video */}
        <div className={`intro-right ${visible ? "in" : ""}`}>
          <VideoShowcase />
        </div>
      </div>
    </section>
  );
}
