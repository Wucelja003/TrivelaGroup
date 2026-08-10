import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type MouseEvent,
} from "react";
import { Link } from "react-router-dom";
import "./GooeyNav.css";

export interface GooeyNavItem {
  label: string;
  to: string;
}

interface GooeyNavProps {
  items: GooeyNavItem[];
  animationTime?: number;
  particleCount?: number;
  particleDistances?: [number, number];
  particleR?: number;
  timeVariance?: number;
  colors?: number[];
}

interface ParticleOptions {
  animationTime: number;
  particleCount: number;
  particleDistances: [number, number];
  particleR: number;
  timeVariance: number;
  colors: number[];
}

/* ===== Pure helperi (module scope, ne zavise od render-a) ===== */

const noise = (n = 1) => n / 2 - Math.random() * n;

const getXY = (
  distance: number,
  pointIndex: number,
  totalPoints: number
): [number, number] => {
  const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
  return [distance * Math.cos(angle), distance * Math.sin(angle)];
};

const createParticle = (i: number, t: number, o: ParticleOptions) => {
  const r = o.particleR;
  const d = o.particleDistances;
  const rotate = noise(r / 10);
  return {
    start: getXY(d[0], o.particleCount - i, o.particleCount),
    end: getXY(d[1] + noise(7), o.particleCount - i, o.particleCount),
    time: t,
    scale: 1 + noise(0.2),
    color: o.colors[Math.floor(Math.random() * o.colors.length)],
    rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10,
  };
};

const makeParticles = (element: HTMLElement, o: ParticleOptions) => {
  const bubbleTime = o.animationTime * 2 + o.timeVariance;
  element.style.setProperty("--time", `${bubbleTime}ms`);

  for (let i = 0; i < o.particleCount; i++) {
    const t = o.animationTime * 2 + noise(o.timeVariance * 2);
    const p = createParticle(i, t, o);
    element.classList.remove("active");

    setTimeout(() => {
      const particle = document.createElement("span");
      const point = document.createElement("span");
      particle.classList.add("particle");
      particle.style.setProperty("--start-x", `${p.start[0]}px`);
      particle.style.setProperty("--start-y", `${p.start[1]}px`);
      particle.style.setProperty("--end-x", `${p.end[0]}px`);
      particle.style.setProperty("--end-y", `${p.end[1]}px`);
      particle.style.setProperty("--time", `${p.time}ms`);
      particle.style.setProperty("--scale", `${p.scale}`);
      particle.style.setProperty("--color", `var(--color-${p.color}, white)`);
      particle.style.setProperty("--rotate", `${p.rotate}deg`);

      point.classList.add("point");
      particle.appendChild(point);
      element.appendChild(particle);
      requestAnimationFrame(() => element.classList.add("active"));
      setTimeout(() => {
        try {
          element.removeChild(particle);
        } catch {
          // Do nothing
        }
      }, t);
    }, 30);
  }
};

/* ===== Komponenta ===== */

export default function GooeyNav({
  items,
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
}: GooeyNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const filterRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  // -1 = nijedna stavka nije aktivna (čisto hover-driven)
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const updateEffectPosition = useCallback((element: HTMLElement) => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();

    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`,
    };
    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    textRef.current.innerText = element.innerText;
  }, []);

  const showEffects = () => {
    if (filterRef.current) filterRef.current.style.opacity = "1";
    if (textRef.current) textRef.current.style.opacity = "1";
  };

  const hideEffects = () => {
    if (filterRef.current) filterRef.current.style.opacity = "0";
    if (textRef.current) {
      textRef.current.style.opacity = "0";
      textRef.current.classList.remove("active");
    }
  };

  // Pomeri "kapljicu" + particle burst na zadatu stavku
  const goTo = (index: number, liEl: HTMLElement) => {
    setActiveIndex(index);
    showEffects();
    updateEffectPosition(liEl);

    if (filterRef.current) {
      filterRef.current.querySelectorAll(".particle").forEach((p) => p.remove());
    }
    if (textRef.current) {
      textRef.current.classList.remove("active");
      void textRef.current.offsetWidth;
      textRef.current.classList.add("active");
    }
    if (filterRef.current) {
      makeParticles(filterRef.current, {
        animationTime,
        particleCount,
        particleDistances,
        particleR,
        timeVariance,
        colors,
      });
    }
  };

  const handleEnter = (e: MouseEvent<HTMLLIElement>, index: number) => {
    if (activeIndex === index) return;
    goTo(index, e.currentTarget);
  };

  // Miš napustio nav → sakrij pill (ne ostaje ni na jednoj stavci)
  const handleLeave = () => {
    setActiveIndex(-1);
    hideEffects();
  };

  // Drži efekat poravnat sa aktivnom stavkom pri resize-u
  useEffect(() => {
    if (activeIndex < 0 || !navRef.current || !containerRef.current) return;
    const li = navRef.current.querySelectorAll("li")[activeIndex];
    if (li) {
      updateEffectPosition(li as HTMLElement);
      textRef.current?.classList.add("active");
    }

    const resizeObserver = new ResizeObserver(() => {
      const current = navRef.current?.querySelectorAll("li")[activeIndex];
      if (current) updateEffectPosition(current as HTMLElement);
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [activeIndex, updateEffectPosition]);

  return (
    <div
      className="gooey-nav-container"
      ref={containerRef}
      onMouseLeave={handleLeave}
    >
      <nav>
        <ul ref={navRef}>
          {items.map((item, index) => (
            <li
              key={item.to + index}
              className={activeIndex === index ? "active" : ""}
              onMouseEnter={(e) => handleEnter(e, index)}
            >
              <Link to={item.to}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <span className="effect filter" ref={filterRef} />
      <span className="effect text" ref={textRef} />
    </div>
  );
}
