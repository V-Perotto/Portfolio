import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import type {} from 'vite-ssg' // tipos de ssgOptions

// GitHub Pages publica em https://v-perotto.github.io/Portfolio/ — único lugar com o prefixo.
const base = '/Portfolio/'

export default defineConfig({
  base,
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  ssgOptions: {
    formatting: 'minify',
    script: 'async',
    // CSS crítico embutido no HTML (beasties): o resto do CSS deixa de bloquear a renderização
    beastiesOptions: { publicPath: base, preload: 'media', pruneSource: false },
  },
})
