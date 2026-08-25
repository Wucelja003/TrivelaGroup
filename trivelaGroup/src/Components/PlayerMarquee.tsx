import "./PlayerMarquee.css";

/*
 * "Players who trusted our work" — traka koja se sama lista i staje na hover
 * (isti obrazac kao Partners marquee). Svaka kartica: slika 9:16 pa ime i
 * uloga ispod. Boje su Drop (bela strana): tamnoplavo ime, prigusena uloga,
 * ledeno plavi hover.
 */

export interface PlayerItem {
  img: string;
  name: string;
  role: string;
}

function Card({ p }: { p: PlayerItem }) {
  return (
    <figure className="pm-card">
      <div className="pm-thumb">
        <img src={p.img} alt={p.name} loading="lazy" />
      </div>
      <figcaption className="pm-cap">
        <span className="pm-name">{p.name}</span>
        <span className="pm-role">{p.role}</span>
      </figcaption>
    </figure>
  );
}

export default function PlayerMarquee({ items }: { items: PlayerItem[] }) {
  return (
    <div className="pm-marquee">
      {/* TACNO dve iste kopije: pomak je -50%, pa se druga poklopi sa prvom
          i vrti se bez skoka. Razmak ide kroz margin (ne gap), da -50% bude
          tacan — isto kao Partners traka. */}
      <div className="pm-track">
        {items.map((p, i) => (
          <Card key={`1-${i}`} p={p} />
        ))}
        {items.map((p, i) => (
          <Card key={`2-${i}`} p={p} />
        ))}
      </div>
    </div>
  );
}
