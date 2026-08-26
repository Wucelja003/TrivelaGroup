import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";

/*
 * Aurora pozadina za Trivela Business (tamna). Shader (simplex noise -> fbm ->
 * trake) je isti kao u referenci, ali su boje prebojene u NASE: siva podloga
 * (kao Business dugme) + tamno zelene i smaragdne trake koje "disu".
 *
 * Jedna tema (tamna) — nema light/dark prebacivanja, pa nema ni detekcije
 * klase na <html>. Racuna se samo dok je vidljivo; na prefers-reduced-motion
 * stoji na jednom kadru.
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform vec2 uResolution;
  uniform float uTime;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * snoise(p);
      p = p * 2.03 + vec3(13.7, 7.3, 3.1);
      amplitude *= 0.5;
    }
    return value;
  }

  float grain(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
    vec2 p = (vUv - 0.5) * aspect;
    float t = uTime * 0.05;

    vec2 flow = p;
    flow.x += sin(flow.y * 2.1 + t * 1.3) * 0.17;
    flow.y += cos(flow.x * 2.5 - t * 1.1) * 0.12;

    float cloud = fbm(vec3(flow * 1.4, t * 0.8));
    float veil = fbm(vec3(flow * 2.3 + vec2(cloud * 0.2, -cloud * 0.14), t * 0.6 + 4.0));
    float ribbon = sin((flow.y + cloud * 0.38) * 6.4 + flow.x * 2.4 - uTime * 0.2);
    float aurora = smoothstep(0.06, 0.9, ribbon * 0.5 + 0.5) * smoothstep(-0.3, 0.8, veil);
    float drift = smoothstep(0.08, 0.82, cloud * 0.5 + 0.5);
    float glowCore = pow(smoothstep(0.92, 0.06, length(p + vec2(0.0, 0.08))), 2.6);
    float vign = smoothstep(1.18, 0.24, length(p * vec2(0.86, 1.22)));

    // NASE boje: siva podloga (kao Business dugme) + tamno zelene trake
    vec3 color = vec3(0.086, 0.098, 0.109);              // ~#161a1c ugljena siva
    color += vec3(0.11, 0.42, 0.24) * aurora * 0.55 * vign;   // smaragdna traka
    color += vec3(0.28, 0.62, 0.16) * aurora * 0.22 * vign;   // dodir zelene marke
    color += vec3(0.10, 0.30, 0.22) * drift * 0.26 * vign;    // tamni teal preliv
    color += vec3(0.55, 0.72, 0.60) * glowCore * 0.10;        // meko sivo-zeleno jezgro
    color *= 0.5 + vign * 0.7;
    color += (grain(gl_FragCoord.xy) - 0.5) * 0.018;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function AuroraField() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uResolution: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
      },
      depthWrite: false,
      depthTest: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        powerPreference: "high-performance",
      });
    } catch {
      geometry.dispose();
      material.dispose();
      return;
    }

    renderer.domElement.className = "absolute inset-0 h-full w-full";
    container.appendChild(renderer.domElement);

    const clock = new THREE.Clock();
    const staticTime = 26;
    let frame = 0;

    const renderFrame = () => {
      material.uniforms.uTime.value = reduceMotion
        ? staticTime
        : clock.getElapsedTime();
      renderer.render(scene, camera);
    };

    const loop = () => {
      renderFrame();
      frame = requestAnimationFrame(loop);
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      material.uniforms.uResolution.value.set(width, height);
      renderFrame();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    if (!reduceMotion) {
      frame = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [reduceMotion]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
    />
  );
}
