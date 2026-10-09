/**
 * Helper de WebGL para fundos de tela cheia (feature 004, research R1): um triângulo que cobre o
 * canvas e um fragment shader. Substitui o `ogl` do Faulty Terminal (fundo da porta de acesso), que só
 * usava isso da biblioteca. O CRT Warp do hero, que também o usava, saiu na feature 005 (Dot Field,
 * canvas 2D); `tokenRgb` serve também ao Dot Field.
 *
 * Sem WebGL (navegador sem suporte, contexto recusado, shader que não compila), `createFullscreenShader`
 * devolve `null` sem lançar nem escrever no console: quem chama cai no fundo estático (FR-033, FR-039).
 *
 * Funciona com `HTMLCanvasElement` (thread principal) e com `OffscreenCanvas` (Web Worker; ver
 * src/lib/scene-host.ts). `tokenRgb` e `hasWebGL` só valem na thread principal.
 */

export type AnyCanvas = HTMLCanvasElement | OffscreenCanvas

/** Vértice padrão: `position` e `uv` como os do `Triangle` do ogl, para os shaders vendorizados. */
const VERTEX = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

/** Triângulo maior que a tela: cobre o retângulo de clip [-1, 1]² com uma primitiva só. */
const POSITIONS = new Float32Array([-1, -1, 3, -1, -1, 3])
const UVS = new Float32Array([0, 0, 2, 0, 0, 2])

export type UniformValue = number | readonly number[] | Float32Array

export interface FullscreenShaderOptions {
  fragment: string
  uniforms?: Record<string, UniformValue>
  /** Escala de pixels do canvas em relação ao tamanho CSS. */
  dpr: number
}

export interface FullscreenShader {
  readonly gl: WebGLRenderingContext
  /** `true` depois de `webglcontextlost`: `render()` deixa de desenhar. */
  readonly lost: boolean
  set(name: string, value: UniformValue): void
  /** Envia uma imagem (canvas, por exemplo) como textura de um `sampler2D` (unidade 0). */
  setTexture(name: string, source: TexImageSource): void
  /** Ajusta o tamanho em pixels do canvas e o viewport; devolve o tamanho em pixels. */
  resize(cssWidth: number, cssHeight: number): [number, number]
  render(): void
  dispose(): void
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader
  if (import.meta.env.DEV) console.warn(gl.getShaderInfoLog(shader))
  gl.deleteShader(shader)
  return null
}

export function createFullscreenShader(
  canvas: AnyCanvas,
  { fragment, uniforms = {}, dpr }: FullscreenShaderOptions,
): FullscreenShader | null {
  let gl: WebGLRenderingContext | null = null
  try {
    gl = (canvas as HTMLCanvasElement).getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      powerPreference: 'low-power',
    })
  } catch {
    gl = null
  }
  if (!gl) return null

  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX)
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragment)
  const program = gl.createProgram()
  if (!vs || !fs || !program) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    if (import.meta.env.DEV) console.warn(gl.getProgramInfoLog(program))
    return null
  }
  gl.useProgram(program)

  const buffers: WebGLBuffer[] = []
  const attribute = (name: string, data: Float32Array) => {
    const location = gl!.getAttribLocation(program, name)
    if (location < 0) return
    const buffer = gl!.createBuffer()!
    buffers.push(buffer)
    gl!.bindBuffer(gl!.ARRAY_BUFFER, buffer)
    gl!.bufferData(gl!.ARRAY_BUFFER, data, gl!.STATIC_DRAW)
    gl!.enableVertexAttribArray(location)
    gl!.vertexAttribPointer(location, 2, gl!.FLOAT, false, 0, 0)
  }
  attribute('position', POSITIONS)
  attribute('uv', UVS)

  const locations = new Map<string, WebGLUniformLocation | null>()
  const locate = (name: string) => {
    if (!locations.has(name)) locations.set(name, gl!.getUniformLocation(program, name))
    return locations.get(name) ?? null
  }

  let texture: WebGLTexture | null = null
  let lost = false
  const onLost = (e: Event) => {
    e.preventDefault()
    lost = true
  }
  canvas.addEventListener('webglcontextlost', onLost as EventListener)

  const api: FullscreenShader = {
    gl,
    get lost() {
      return lost
    },
    set(name, value) {
      const location = locate(name)
      if (!location || lost) return
      if (typeof value === 'number') gl!.uniform1f(location, value)
      else if (value.length === 2) gl!.uniform2f(location, value[0]!, value[1]!)
      else if (value.length === 3) gl!.uniform3f(location, value[0]!, value[1]!, value[2]!)
      else if (value.length === 4) gl!.uniform4f(location, value[0]!, value[1]!, value[2]!, value[3]!)
    },
    setTexture(name, source) {
      if (lost) return
      if (!texture) {
        texture = gl!.createTexture()
        gl!.activeTexture(gl!.TEXTURE0)
        gl!.bindTexture(gl!.TEXTURE_2D, texture)
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE)
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE)
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR)
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR)
        const location = locate(name)
        if (location) gl!.uniform1i(location, 0)
      }
      // o canvas tem a origem no canto de cima; a textura do WebGL, no de baixo
      gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, true)
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, source)
    },
    resize(cssWidth, cssHeight) {
      const width = Math.max(1, Math.round(cssWidth * dpr))
      const height = Math.max(1, Math.round(cssHeight * dpr))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      gl!.viewport(0, 0, width, height)
      return [width, height]
    },
    render() {
      if (lost) return
      gl!.drawArrays(gl!.TRIANGLES, 0, 3)
    },
    dispose() {
      canvas.removeEventListener('webglcontextlost', onLost as EventListener)
      if (!lost) {
        buffers.forEach((b) => gl!.deleteBuffer(b))
        if (texture) gl!.deleteTexture(texture)
        gl!.deleteProgram(program)
        gl!.deleteShader(vs)
        gl!.deleteShader(fs)
      }
      gl!.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }

  for (const [name, value] of Object.entries(uniforms)) api.set(name, value)
  return api
}

/** Lê um token de cor do tema (`#rrggbb`) e devolve [r, g, b] de 0 a 1 para um uniform `vec3`. */
export function tokenRgb(name: string, fallback: [number, number, number] = [0, 0, 0]): [number, number, number] {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const hex = value.match(/^#([0-9a-f]{6})$/i)?.[1]
  if (!hex) return fallback
  const n = parseInt(hex, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

/** O navegador consegue criar um contexto WebGL? (canvas descartável, contexto liberado em seguida) */
export function hasWebGL(): boolean {
  try {
    const gl = document.createElement('canvas').getContext('webgl')
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return !!gl
  } catch {
    return false
  }
}

/** WebGL num `OffscreenCanvas` (o que o worker de cena precisa) e canvas transferível. */
export function hasOffscreenWebGL(): boolean {
  try {
    if (typeof OffscreenCanvas === 'undefined' || typeof Worker === 'undefined') return false
    // sem WebGL na página (desligado pelo visitante ou pelo navegador), o OffscreenCanvas ainda pode
    // criar um contexto, mas por um caminho de software que trava a composição da página inteira
    // (medido no Chromium com --disable-webgl, feature 005): sem WebGL na página, sem cena no worker
    if (!hasWebGL()) return false
    if (!('transferControlToOffscreen' in HTMLCanvasElement.prototype)) return false
    const gl = new OffscreenCanvas(1, 1).getContext('webgl')
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return !!gl
  } catch {
    return false
  }
}
