/*
 * Donji uglovi hero-a: lokacija levo, drustvene mreze desno.
 * Stoji u toku (izmedju sadrzaja i trake sa karticama), a ne apsolutno —
 * tako se ne sudara sa panelom koji ulazi preko dna hero-a.
 */
const socials = [
  { label: "Instagram", href: "https://www.instagram.com/trivelagroup" },
  { label: "TikTok", href: "https://www.tiktok.com/@trivelagroup" },
];

export default function HeroCorners() {
  return (
    <div className="hero-corners">
      {/* Lokacija — dva reda jedan ispod drugog, u levom uglu */}
      <div className="hero-corner-loc">
        <span className="hero-corner-item">Based in:</span>
        <span className="hero-corner-item">Belgrade, Serbia</span>
      </div>
      <div className="hero-corner-socials flex items-center gap-5">
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            className="hero-corner-item hero-corner-link"
          >
            {s.label}
          </a>
        ))}
      </div>
    </div>
  );
}
