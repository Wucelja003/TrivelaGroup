import { MeshGradient } from "@paper-design/shaders-react";

/**
 * Hero pozadina — animirani MeshGradient shader.
 *
 * Taktika: teget (#000b38, ista boja kao ostatak sajta) je DOMINANTAN — cetiri
 * od pet stopova su teget ili tik uz njega, pa hero ne odudara od ostalih
 * sekcija. Zelena je samo JEDAN stop, pa se ponasa kao pokretni akcenat koji
 * pluta kroz tamnoplavo polje.
 *
 * Ranije su ovde bila DVA jaka zelena stopa (#2a8a00 i #96ff00) pa je zelena
 * preuzimala celu povrsinu i hero je izgledao kao potpuno druga pozadina.
 */
export default function HeroVideo() {
  return (
    <>
      <div className="hero-video">
        <MeshGradient
          className="absolute inset-0 h-full w-full"
          style={{ width: "100%", height: "100%" }}
          colors={["#000b38", "#01123f", "#96ff00", "#01123f", "#000b38"]}
          distortion={0.9}
          swirl={0.22}
          grainMixer={0.12}
          grainOverlay={0.04}
          scale={1.1}
          speed={0.45}
        />
      </div>
      <div className="hero-overlay" />
    </>
  );
}
