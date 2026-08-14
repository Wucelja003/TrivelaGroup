import { useEffect, useMemo, useRef } from "react";

interface RotatingCardsProps {
  images: string[];
  radius?: number;
  cardWidth?: number;
  cardHeight?: number;
  duration?: number; // sekundi po punom krugu
  initialRotation?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  showTrackLine?: boolean;
  trackLineOffset?: number;
  className?: string;
}

export default function RotatingCards({
  images,
  radius = 900,
  /* 9:16 — isti odnos kao fotke, pa `object-cover` nema sta da odseca */
  cardWidth = 169,
  cardHeight = 300,
  duration = 85,
  initialRotation = -90,
  reverse = false,
  pauseOnHover = true,
  showTrackLine = true,
  trackLineOffset = 26,
  className = "",
}: RotatingCardsProps) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(initialRotation);
  const lastRef = useRef<number | null>(null);
  const hoverRef = useRef(false);

  const positions = useMemo(() => {
    const n = images.length;
    const step = (2 * Math.PI) / n;
    return images.map((_, i) => {
      const angle = step * i + (initialRotation * Math.PI) / 180;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        angle: (angle * 180) / Math.PI,
      };
    });
  }, [images, radius, initialRotation]);

  useEffect(() => {
    let raf = 0;
    lastRef.current = null;
    const animate = (t: number) => {
      if (lastRef.current !== null && !hoverRef.current) {
        const dt = Math.min((t - lastRef.current) / 1000, 0.1);
        const dps = 360 / duration;
        rotationRef.current += dps * dt * (reverse ? -1 : 1);
        if (wheelRef.current) {
          wheelRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
        }
      }
      lastRef.current = t;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [duration, reverse]);

  const containerW = radius * 2 + cardWidth;
  const containerH = radius * 2 + cardHeight;
  const trackR = radius + trackLineOffset;

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center ${className}`}
      style={{ width: `${containerW}px`, height: `${containerH}px` }}
    >
      {showTrackLine && (
        <svg
          className="pointer-events-none absolute inset-0"
          width="100%"
          height="100%"
          viewBox={`0 0 ${containerW} ${containerH}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <circle
            cx={containerW / 2}
            cy={containerH / 2}
            r={trackR}
            fill="none"
            stroke="rgba(150,255,0,0.18)"
            strokeWidth={1}
          />
        </svg>
      )}

      <div
        ref={wheelRef}
        className="relative h-full w-full"
        style={{
          transform: `rotate(${initialRotation}deg)`,
          willChange: "transform",
        }}
      >
        {images.map((src, i) => {
          const p = positions[i];
            return (
              <div
                key={i}
                className="group absolute overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:z-10 hover:scale-[1.06]"
                style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  left: "50%",
                  top: "50%",
                  marginLeft: `-${cardWidth / 2}px`,
                  marginTop: `-${cardHeight / 2}px`,
                  transform: `translate(${p.x}px, ${p.y}px) rotate(${p.angle + 90}deg)`,
                  willChange: "transform",
                }}
                onMouseEnter={() => {
                  if (pauseOnHover) hoverRef.current = true;
                }}
                onMouseLeave={() => {
                  if (pauseOnHover) hoverRef.current = false;
                }}
              >
                {/* Slika se glatko pojavi kad se ucita — bez iskakanja.
                    ref pokriva i vec kesirane slike, gde onLoad ume da
                    okine pre nego sto React zakaci handler. */}
                <img
                  src={src}
                  alt=""
                  draggable={false}
                  ref={(el) => {
                    if (el?.complete) el.style.opacity = "1";
                  }}
                  onLoad={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                  className="h-full w-full select-none object-cover opacity-0 transition-opacity duration-[900ms] ease-out"
                />
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />
              </div>
            );
          })}
      </div>
    </div>
  );
}
