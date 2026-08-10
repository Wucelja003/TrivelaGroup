import { useEffect, useRef } from "react";

/*
 * Liquid lines — talasaste linije koje plivaju u pozadini.
 *
 * Original je pisan za @react-three/fiber + three + next-themes. Ovde je isti
 * fragment shader, ali na golom WebGL-u, iz tri razloga:
 *   1) shader je obican fullscreen quad — scene graph iz three-a nam ne treba,
 *   2) three + r3f su ~600 kB, a r3f v9 nam je vec jednom oborio `tsc -b`
 *      (njegov JSX namespace se sudara sa nasim tipovima),
 *   3) next-themes je za Next.js, a sajt je ionako samo tamna tema.
 *
 * Petlja stoji dok je `active` false — meni je zatvoren najveci deo vremena
 * pa nema razloga da GPU radi u prazno.
 */

export interface LiquidLinesProps {
  className?: string;
  /** Brzina kretanja talasa */
  speed?: number;
  /** Broj prolaza — vise = gusce i detaljnije, ali sporije */
  iterations?: number;
  /** Gustina talasa */
  waveFrequency?: number;
  /** Koliko se dubina pomera po prolazu */
  depthStep?: number;
  /** Debljina linija */
  lineThickness?: number;
  /** Koliko talas razvlaci mrezu */
  waveAmplitude?: number;
  /** Boja linija */
  lineColor?: string;
  /** Boja podloge */
  backgroundColor?: string;
  brightness?: number;
  contrast?: number;
  offsetX?: number;
  offsetY?: number;
  /** Zumiranje sare */
  scale?: number;
  opacity?: number;
  /** Dok je false, petlja miruje (zadnji kadar ostaje na platnu) */
  active?: boolean;
}

const VERT = `
attribute vec2 a_position;
varying vec2 vUv;
void main() {
  vUv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

/* Broj prolaza ide kao #define, a ne kao uniform sa `break` u petlji:
   GLSL ES 1.00 svakako odmotava petlju, pa je jeftinije da zna tacan broj. */
const buildFrag = (iterations: number) => `
precision highp float;

#define MAX_ITER ${Math.max(1, Math.min(32, Math.round(iterations)))}

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_speed;
uniform float u_waveFrequency;
uniform float u_depthStep;
uniform float u_lineThickness;
uniform float u_waveAmplitude;
uniform vec3 u_lineColor;
uniform vec3 u_backgroundColor;
uniform float u_brightness;
uniform float u_contrast;
uniform float u_offsetX;
uniform float u_offsetY;
uniform float u_scale;
uniform float u_opacity;

varying vec2 vUv;

void main() {
  float time = u_time * u_speed;
  vec2 resolution = u_resolution;

  vec3 accumulator = vec3(0.0);
  float depth = time;
  float magnitude = 0.0;

  vec2 baseCoord = (vUv - 0.5) * 2.0;
  baseCoord.x *= resolution.x / resolution.y;
  baseCoord *= u_scale;
  baseCoord += vec2(u_offsetX, u_offsetY);

  for (int i = 0; i < MAX_ITER; i++) {
    vec2 coord = baseCoord;
    vec2 waveCoord = coord;

    coord -= waveCoord.x + 0.1;
    coord.x *= resolution.x / resolution.y;

    depth += u_depthStep;
    magnitude = length(coord);

    float phase1 = depth * 0.7;
    float phase2 = depth * 1.3;
    float wave1 = sin(phase1) * 0.5 + cos(phase2) * 0.5 + 1.5;
    float wave2 = sin(magnitude * u_waveFrequency - depth) * 0.7
                + cos(magnitude * u_waveFrequency * 0.5 + depth * 0.3) * 0.3;
    waveCoord += coord / max(magnitude, 0.01) * wave1 * wave2 * u_waveAmplitude;

    vec2 gridPos = mod(waveCoord, 1.0) - 0.5;
    float lineIntensity = u_lineThickness / length(gridPos);

    if (i == 0) accumulator.r = lineIntensity;
    else if (i == 1) accumulator.g = lineIntensity;
    else if (i == 2) accumulator.b = lineIntensity;
    else accumulator += vec3(lineIntensity) * 0.01;
  }

  accumulator = accumulator / max(magnitude, 0.001);
  accumulator = (accumulator - 0.5) * u_contrast + 0.5;
  accumulator *= u_brightness;

  vec3 finalColor = accumulator * u_lineColor;
  float alpha = clamp(length(accumulator) * u_opacity, 0.0, 1.0);
  finalColor = mix(u_backgroundColor, finalColor, alpha);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const raw = hex.replace("#", "").trim();
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return [1, 1, 1];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compile(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, source);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("LiquidLines shader:", String(gl.getShaderInfoLog(sh)));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

type Live = Required<
  Omit<LiquidLinesProps, "className" | "iterations" | "active">
>;

export default function LiquidLines({
  className = "",
  speed = 0.4,
  iterations = 3,
  waveFrequency = 49,
  depthStep = 0.05,
  lineThickness = 0.009,
  waveAmplitude = 0.6,
  lineColor = "#ffffff",
  backgroundColor = "#000000",
  brightness = 2.5,
  contrast = 1.1,
  offsetX = 0,
  offsetY = 0,
  scale = 0.3,
  opacity = 1,
  active = true,
}: LiquidLinesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* Tekuce vrednosti propova citaju se iz refa unutar rAF petlje.
     Da su u zavisnostima efekta, svaki render bi rusio i pravio novi
     WebGL kontekst — na tome smo se vec opekli kod AIBlob-a. */
  const liveRef = useRef<Live>({
    speed,
    waveFrequency,
    depthStep,
    lineThickness,
    waveAmplitude,
    lineColor,
    backgroundColor,
    brightness,
    contrast,
    offsetX,
    offsetY,
    scale,
    opacity,
  });
  const activeRef = useRef(active);
  const ctrlRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  useEffect(() => {
    liveRef.current = {
      speed,
      waveFrequency,
      depthStep,
      lineThickness,
      waveAmplitude,
      lineColor,
      backgroundColor,
      brightness,
      contrast,
      offsetX,
      offsetY,
      scale,
      opacity,
    };
  }, [
    speed,
    waveFrequency,
    depthStep,
    lineThickness,
    waveAmplitude,
    lineColor,
    backgroundColor,
    brightness,
    contrast,
    offsetX,
    offsetY,
    scale,
    opacity,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, buildFrag(iterations));
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("LiquidLines link:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return;
    }
    gl.useProgram(program);

    /* Jedan veliki trougao pokriva ceo ekran — jeftinije od quad-a */
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = (n: string) => gl.getUniformLocation(program, n);
    const U = {
      time: u("u_time"),
      resolution: u("u_resolution"),
      speed: u("u_speed"),
      waveFrequency: u("u_waveFrequency"),
      depthStep: u("u_depthStep"),
      lineThickness: u("u_lineThickness"),
      waveAmplitude: u("u_waveAmplitude"),
      lineColor: u("u_lineColor"),
      backgroundColor: u("u_backgroundColor"),
      brightness: u("u_brightness"),
      contrast: u("u_contrast"),
      offsetX: u("u_offsetX"),
      offsetY: u("u_offsetY"),
      scale: u("u_scale"),
      opacity: u("u_opacity"),
    };

    let raf = 0;
    let elapsed = 0;
    let last = 0;
    let running = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const draw = () => {
      resize();
      const p = liveRef.current;
      const line = hexToRgb(p.lineColor);
      const bg = hexToRgb(p.backgroundColor);
      gl.uniform1f(U.time, elapsed);
      gl.uniform2f(U.resolution, canvas.width, canvas.height);
      gl.uniform1f(U.speed, p.speed);
      gl.uniform1f(U.waveFrequency, p.waveFrequency);
      gl.uniform1f(U.depthStep, p.depthStep);
      gl.uniform1f(U.lineThickness, p.lineThickness);
      gl.uniform1f(U.waveAmplitude, p.waveAmplitude);
      gl.uniform3f(U.lineColor, line[0], line[1], line[2]);
      gl.uniform3f(U.backgroundColor, bg[0], bg[1], bg[2]);
      gl.uniform1f(U.brightness, p.brightness);
      gl.uniform1f(U.contrast, p.contrast);
      gl.uniform1f(U.offsetX, p.offsetX);
      gl.uniform1f(U.offsetY, p.offsetY);
      gl.uniform1f(U.scale, p.scale);
      gl.uniform1f(U.opacity, p.opacity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const frame = (t: number) => {
      if (!last) last = t;
      elapsed += (t - last) / 1000;
      last = t;
      draw();
      raf = requestAnimationFrame(frame);
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const start = () => {
      if (running || reduce) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    ctrlRef.current = { start, stop };
    draw();
    if (activeRef.current) start();

    /* Pri montiranju clientWidth ume da bude 0 (raspored jos nije izracunat),
       pa bi prvi kadar bio 1x1 pa razvucen preko celog panela. Jedan prolaz
       posle rasporeda to ispravlja i kad rAF ne radi (skrivena kartica). */
    const settle = window.setTimeout(() => {
      resize();
      if (!running) draw();
    }, 0);

    const ro = new ResizeObserver(() => {
      resize();
      if (!running) draw();
    });
    ro.observe(canvas);

    return () => {
      stop();
      window.clearTimeout(settle);
      ro.disconnect();
      ctrlRef.current = null;
      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
      /* Bez loseContext() — StrictMode montira dvaput, pa bi drugo montiranje
         dobilo izgubljen kontekst na istom platnu i shader ne bi ni prosao.
         Kontekst svakako nestaje kad React skloni <canvas> iz DOM-a. */
    };
  }, [iterations]);

  useEffect(() => {
    activeRef.current = active;
    if (active) ctrlRef.current?.start();
    else ctrlRef.current?.stop();
  }, [active]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
