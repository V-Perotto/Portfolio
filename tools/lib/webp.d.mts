// Tipos de tools/lib/webp.mjs, para os testes em TypeScript (feature 010).
export function stripMetadata(webp: Uint8Array): Uint8Array
export function webpChunkIds(webp: Uint8Array): string[]
export function webpSize(webp: Uint8Array): { width: number; height: number }
export function fromDataUrl(url: string): Uint8Array
