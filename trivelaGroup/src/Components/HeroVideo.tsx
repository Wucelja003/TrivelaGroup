import { MeshGradient } from "@paper-design/shaders-react";

/**
 * Hero pozadina — animirani MeshGradient (teget sa zelenim akcentom).
 *
 * Zelena animacija se vrti sve vreme, ali preko nje stoji FIKSNI teget veo
 * (.hero-overlay) koji se NE menja po sekcijama. Zato zelena nikad ne postaje
 * dominantna na sredini strane — ostaje "teget-zelena" konstantno.
 * (Ranije je SectionThemes menjao ton veoa po sekciji -> zelena bi preuzela
 * sredinu; to je uklonjeno.)
 */
export default function HeroVideo() {
  return (
    <>
      <div className="hero-video">
        <MeshGradient
          className="hero-mesh"
          colors={["#01072d", "#01123f", "#96ff00", "#01123f", "#01072d"]}
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
