import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/*
 * Poklon kutija uz maskicu — 3D prikaz + prekidac.
 *
 * Model je 2 MB, pa se SKIDA TEK kad kartica udje u kadar. Dok se ne ucita
 * (ili ako WebGL ne radi), stoji nacrtana kutija — opcija mora da postoji i
 * bez 3D-a, jer o njoj zavisi cena.
 *
 * Tri.js se vrti rucno (bez @react-three/fiber) jer je scena mala: jedan
 * model, jedno svetlo i polako okretanje.
 */

const MODEL_URL = "/models/box.glb";

function BoxCanvas({ active }: { active: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const reduce = useReducedMotion();
  /* Da animacija vidi tekucu vrednost bez ponovnog pravljenja scene */
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setFailed(true);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    /* Kamera gleda ODOZGO, pod uglom — tako se vidi znak na poklopcu,
       a kutija i dalje ima dubinu (ne izgleda kao ravna slika). */
    camera.position.set(0, 2.35, 3.0);
    camera.lookAt(0, -0.02, 0);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    /* Meko studijsko svetlo — kutija je mat, ne treba joj odsjaj */
    scene.add(new THREE.AmbientLight(0xffffff, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(2.5, 3, 2.5);
    scene.add(key);
    /* Zeleni rub samo nagovesti brend — jace bi obojilo belu kutiju */
    const rim = new THREE.DirectionalLight(0x96ff00, 0.3);
    rim.position.set(-2.5, 1.5, -2);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0xffffff, 0.8);
    fill.position.set(-1.5, 0.5, 2);
    scene.add(fill);

    const group = new THREE.Group();
    scene.add(group);

    /* Meka senka ispod kutije — bez nje izgleda kao nalepnica */
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 1.9),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -0.22;
    group.add(shadow);

    let raf = 0;
    let disposed = false;

    new GLTFLoader().load(
      MODEL_URL,
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene;

        /* Model dolazi iz Blendera u proizvoljnoj velicini i polozaju —
           centriraj ga i skaliraj da uvek popuni kadar isto. */
        const size = new THREE.Box3()
          .setFromObject(model)
          .getSize(new THREE.Vector3());

        /* Kutija iz Blendera moze da stoji uspravno — tada bismo odozgo
           gledali njenu tanku ivicu. Okreni je tako da NAJTANJA strana ide
           nagore, pa poklopac sa znakom uvek gleda u kameru. */
        const thinnest = Math.min(size.x, size.y, size.z);
        if (thinnest === size.x) model.rotation.z = Math.PI / 2;
        else if (thinnest === size.z) model.rotation.x = -Math.PI / 2;

        /* Znak na poklopcu ide uz kracu stranu kutije — okreni je za cetvrt
           kruga da natpis stoji vodoravno. */
        model.rotation.y = Math.PI / 2;

        /* Kadar na ovoj udaljenosti prima oko 2.2 jedinice, pa se skalira po
           NAJVECOJ strani da kutija cela stane. */
        model.scale.setScalar(2.3 / Math.max(size.x, size.y, size.z));

        /* Centriranje IDE POSLE skaliranja: matrica je T·R·S, pa pomeraj
           racunat na neskaliranom modelu ne bi odgovarao. */
        const center = new THREE.Box3()
          .setFromObject(model)
          .getCenter(new THREE.Vector3());
        model.position.sub(center);

        /* Natpis na poklopcu gledamo pod uglom. Bez anizotropnog
           filtriranja takva tekstura se razmaze — ovo je glavni razlog
           zasto je znak bio mutan. */
        const maxAniso = renderer.capabilities.getMaxAnisotropy();
        model.traverse((o) => {
          const mesh = o as THREE.Mesh;
          const mats = Array.isArray(mesh.material)
            ? mesh.material
            : mesh.material
              ? [mesh.material]
              : [];
          for (const mat of mats) {
            const m = mat as THREE.MeshStandardMaterial;
            for (const map of [m.map, m.roughnessMap, m.normalMap]) {
              if (!map) continue;
              map.anisotropy = maxAniso;
              map.minFilter = THREE.LinearMipmapLinearFilter;
              map.magFilter = THREE.LinearFilter;
              map.needsUpdate = true;
            }
          }
        });

        group.add(model);
      },
      undefined,
      () => {
        if (!disposed) setFailed(true);
      },
    );

    const onResize = () => {
      if (!host.clientWidth) return;
      renderer.setSize(host.clientWidth, host.clientHeight, false);
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(host);
    onResize();

    let t = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!reduce) {
        t += 0.012;
        /* Ne vrti se u krug — lagano se njise levo-desno, pa znak na
           poklopcu ostaje okrenut ka posetiocu. */
        group.rotation.y = Math.sin(t * 0.45) * 0.18;
        /* Mali nagib unapred — poklopac sa znakom gleda ka posetiocu */
        group.rotation.x = -0.07;
        /* Kad je izabrana, podigne se i stoji malo uspravnije */
        const lift = activeRef.current ? 0.14 : 0;
        group.position.y += (lift + Math.sin(t) * 0.025 - group.position.y) * 0.08;
      }
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else if (mat) (mat as THREE.Material).dispose();
      });
      host.replaceChildren();
    };
  }, [reduce]);

  if (failed) return <BoxFallback />;
  return <div ref={hostRef} className="gb-canvas" aria-hidden="true" />;
}

/* Nacrtana kutija — stoji dok se model skida i ako WebGL ne radi */
function BoxFallback() {
  return (
    <svg viewBox="0 0 64 64" className="gb-fallback" aria-hidden="true">
      <path
        d="M8 22l24-10 24 10-24 10L8 22z"
        fill="currentColor"
        opacity="0.9"
      />
      <path d="M8 22v20l24 10V32L8 22z" fill="currentColor" opacity="0.55" />
      <path d="M56 22v20L32 52V32l24-10z" fill="currentColor" opacity="0.7" />
      <path
        d="M32 12v40M8 22l48 0"
        stroke="#96ff00"
        strokeWidth="2.5"
        fill="none"
        opacity="0.9"
      />
    </svg>
  );
}

export default function GiftBoxOption({
  checked,
  onChange,
  price,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  /* Prikazana cena, vec formatirana ("400 RSD") */
  price: string;
}) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  /* 2 MB model se ne skida dok kartica ne dodje blizu kadra */
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* Provera polozajem, ne samo posmatracem: IntersectionObserver zna da
       cuti dok je kartica u pozadini (skriven prozor), pa bi kutija ostala
       nenacrtana i kad korisnik dodje do nje. */
    const check = () => {
      const r = el.getBoundingClientRect();
      const margin = 300;
      if (r.top < window.innerHeight + margin && r.bottom > -margin) {
        setNear(true);
        return true;
      }
      return false;
    };

    if (check()) return;

    const onScroll = () => {
      if (check()) cleanup();
    };
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          setNear(true);
          cleanup();
        },
        { rootMargin: "300px 0px" },
      );
      io.observe(el);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    function cleanup() {
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    }
    return cleanup;
  }, []);

  return (
    <div ref={ref} className="mt-7">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        className={`gb-card${checked ? " is-on" : ""}`}
      >
        {/* 3D prikaz */}
        <span className="gb-stage">
          {near ? <BoxCanvas active={checked} /> : <BoxFallback />}
        </span>

        {/* Tekst */}
        <span className="gb-text">
          <span className="gb-title-row">
            <span className="gb-title">{t("drop.product.giftBox")}</span>
            <span className="gb-price">+{price}</span>
          </span>
          <span className="gb-desc">{t("drop.product.giftBoxDesc")}</span>
        </span>

        {/* Prekidac */}
        <span className="gb-check" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12l5 5L20 6" />
          </svg>
        </span>
      </button>
    </div>
  );
}
