/*
 * Vue Bits — CRTWarp (cena)
 * Origem: https://vue-bits.dev (Backgrounds/CRTWarp), de
 * DavidHDev/vue-bits@07c0f76d5567db022c2e3185dd97a2311e056c0c
 * src/content/Backgrounds/CRTWarp/CRTWarp.vue
 * Licença: MIT + Commons Clause — Copyright (c) 2025 David Haz
 * Modificações locais (feature 004, research R1 e R3):
 * - a imagem do tubo é a chuva Matrix (src/lib/matrix-rain.ts) desenhada num canvas 2D e enviada como
 *   textura (`uScreen`): `referencePlasma()`, que com Wave Amount = 0 devolve um valor constante, foi
 *   trocada por `screenAt()` (a textura × as scanlines). Curvatura (`crtCurve`), bloom com raio, RGB
 *   shift, ruído, vinheta e deformação pelo ponteiro são os do original;
 * - o fundo do tubo reproduz os degradês do hero (`background()`), com as cores dos tokens, e a chuva
 *   entra com uma intensidade própria (`uIntensity`): na escala 0,75 e com scanlines fortes, os traços
 *   finos dos glifos somem, então ela é maior que os 35% de opacidade do canvas antigo;
 * - o `three` foi trocado por src/lib/webgl.ts, e o laço virou uma cena sem DOM, que roda num Web
 *   Worker (src/workers/crt.worker.ts) ou na thread principal (src/lib/scene-host.ts).
 * O componente Vue fica em src/components/vendor/vue-bits/CrtWarp.vue.
 */
import { MATRIX_STEP_MS, MatrixRain, type MatrixColors } from '@/lib/matrix-rain'
import { createFullscreenShader } from '@/lib/webgl'
import { frameLoop, type SceneFactory } from './scene'

type Rgb = [number, number, number]

export interface CrtOptions {
  speed: number
  curvature: number
  scanlineStrength: number
  scanlineFrequency: number
  bloom: number
  bloomRadius: number
  noise: number
  vignette: number
  brightness: number
  pixelation: number
  rgbShift: number
  mouseReact: boolean
  mouseStrength: number
  dpr: number
  fps: number
  paused: boolean
  /** Intensidade da chuva sobre o fundo. */
  intensity: number
  /** Fundo do hero: a cor da página e os dois degradês (de 0 a 1). */
  bg: Rgb
  purple: Rgb
  green: Rgb
  /** Cores da chuva (CSS). */
  matrix: MatrixColors
}

const fragmentShader = `
precision highp float;

varying vec2 vUv;
uniform vec2 uResolution;
uniform float uTime;
uniform sampler2D uScreen;
uniform float uIntensity;
uniform vec3 uBg;
uniform vec3 uPurple;
uniform vec3 uGreen;
uniform float uCurvature;
uniform float uScanlineStrength;
uniform float uScanlineFrequency;
uniform float uBloom;
uniform float uBloomRadius;
uniform float uNoise;
uniform float uVignette;
uniform float uBrightness;
uniform float uPixelation;
uniform float uRgbShift;
uniform vec2 uPointer;
uniform float uMouseStrength;
uniform float uMouseReact;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec2 crtCurve(vec2 uv, float radius) {
  vec2 p = (uv - 0.5) * 2.0;
  float safeRadius = max(radius, 1.415);
  float cornerScale = safeRadius / sqrt(max(safeRadius * safeRadius - 2.0, 0.001));
  p = safeRadius * p / sqrt(max(safeRadius * safeRadius - dot(p, p), 0.001));
  p /= cornerScale;
  return p * 0.5 + 0.5;
}

float inside(vec2 uv) {
  return step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
}

// a tela do tubo: a chuva Matrix com as scanlines (no lugar de referencePlasma do original)
vec3 screenAt(vec2 uv) {
  float scanline = 0.5 - 0.5 * cos(uv.y * 3.14159265 * uScanlineFrequency);
  scanline = mix(1.0, scanline, uScanlineStrength);
  return texture2D(uScreen, clamp(uv, 0.0, 1.0)).rgb * scanline * inside(uv);
}

// o fundo do hero (os degradês radiais do CSS), dentro do tubo
vec3 background(vec2 uv) {
  vec2 p = vec2(uv.x, 1.0 - uv.y);
  vec3 col = uBg;
  col = mix(col, uPurple, 0.25 * (1.0 - smoothstep(0.0, 0.55, distance(p, vec2(0.30, 0.20)))));
  col = mix(col, uGreen, 0.18 * (1.0 - smoothstep(0.0, 0.55, distance(p, vec2(0.75, 0.80)))));
  return col;
}

void main() {
  vec2 uv = vUv;
  if (uPixelation > 1.001) {
    vec2 cells = max(uResolution / uPixelation, vec2(1.0));
    uv = (floor(uv * cells) + 0.5) / cells;
  }

  float curveRadius = 1.1 + 0.42 / max(uCurvature, 0.001);
  if (uMouseReact > 0.5) {
    curveRadius *= exp(-uPointer.y * uMouseStrength * 0.4);
  }
  vec2 curvedUv = crtCurve(uv, curveRadius);
  if (uMouseReact > 0.5) {
    curvedUv.x -= uPointer.x * uMouseStrength * 0.035;
  }

  vec3 signal = screenAt(curvedUv);
  float radius = 0.01 * uBloomRadius;
  vec3 glow = signal * 0.2;
  glow += screenAt(curvedUv + vec2(radius, 0.0)) * 0.12;
  glow += screenAt(curvedUv - vec2(radius, 0.0)) * 0.12;
  glow += screenAt(curvedUv + vec2(0.0, radius)) * 0.12;
  glow += screenAt(curvedUv - vec2(0.0, radius)) * 0.12;
  glow += screenAt(curvedUv + vec2(radius)) * 0.08;
  glow += screenAt(curvedUv - vec2(radius)) * 0.08;
  glow += screenAt(curvedUv + vec2(radius, -radius)) * 0.08;
  glow += screenAt(curvedUv + vec2(-radius, radius)) * 0.08;

  float redSignal = screenAt(curvedUv + vec2(uRgbShift, 0.0)).r;
  float blueSignal = screenAt(curvedUv - vec2(uRgbShift, 0.0)).b;
  vec3 light = vec3(redSignal, signal.g, blueSignal) + glow * uBloom * 0.65;
  light *= uBrightness * uIntensity;

  float edge = clamp(1.0 - dot(vUv - 0.5, vUv - 0.5) * 2.0, 0.0, 1.0);
  float edgeFade = mix(1.0, smoothstep(0.0, 1.0, edge), uVignette);
  vec3 color = (background(curvedUv) * inside(curvedUv) + light) * edgeFade;

  float grain = hash21(gl_FragCoord.xy + vec2(fract(uTime) * 173.0));
  color += (grain - 0.5) * uNoise;
  gl_FragColor = vec4(max(color, vec3(0.0)), 1.0);
}
`

/** Canvas 2D da chuva: `OffscreenCanvas` (worker) ou um canvas fora do DOM (thread principal). */
function screenCanvas(): OffscreenCanvas | HTMLCanvasElement {
  return typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(1, 1) : document.createElement('canvas')
}

export const startCrt: SceneFactory<CrtOptions> = (canvas, o, env) => {
  const screen = screenCanvas()
  const ctx = screen.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null
  if (!ctx) return null
  const shader = createFullscreenShader(canvas, {
    fragment: fragmentShader,
    dpr: o.dpr,
    uniforms: {
      uTime: 0,
      uIntensity: o.intensity,
      uBg: o.bg,
      uPurple: o.purple,
      uGreen: o.green,
      uCurvature: o.curvature,
      uScanlineStrength: o.scanlineStrength,
      uScanlineFrequency: o.scanlineFrequency,
      uBloom: o.bloom,
      uBloomRadius: o.bloomRadius,
      uNoise: o.noise,
      uVignette: o.vignette,
      uBrightness: o.brightness,
      uPixelation: o.pixelation,
      uRgbShift: o.rgbShift,
      uPointer: [0, 0],
      uMouseStrength: o.mouseStrength,
      uMouseReact: o.mouseReact ? 1 : 0,
    },
  })
  if (!shader) return null

  const rain = new MatrixRain(o.matrix)
  const target: [number, number] = [0, 0]
  const current: [number, number] = [0, 0]
  let time = 0
  let lastFrame = 0
  let lastStep = -Infinity
  let sized = false

  const loop = frameLoop(o.fps, env.guard, (t) => {
    if (!sized) return
    const delta = lastFrame ? Math.min((t - lastFrame) / 1000, 0.1) : 0
    lastFrame = t
    if (!o.paused) time += delta * o.speed
    if (t - lastStep >= MATRIX_STEP_MS) {
      lastStep = t
      rain.step(ctx)
      shader.setTexture('uScreen', screen)
    }
    current[0] += (target[0] - current[0]) * 0.08
    current[1] += (target[1] - current[1]) * 0.08
    shader.set('uTime', time)
    shader.set('uPointer', current)
    shader.render()
  })
  loop.start()

  return {
    resize(width, height) {
      const [w, h] = shader.resize(width, height)
      screen.width = w
      screen.height = h
      rain.resize(w, h, o.dpr)
      shader.set('uResolution', [w, h])
      lastStep = -Infinity
      sized = true
    },
    pointer(x, y) {
      target[0] = x
      target[1] = y
    },
    visible(visible) {
      if (visible) {
        lastFrame = 0
        loop.start()
      } else loop.stop()
    },
    dispose() {
      loop.stop()
      shader.dispose()
    },
  }
}
