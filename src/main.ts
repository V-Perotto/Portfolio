import { ViteSSG } from 'vite-ssg/single-page'
import App from './App.vue'
import { vReveal } from './directives/reveal'
import './styles/main.css'

// vite-ssg pré-renderiza a página no build (Princípio III); no cliente, hidrata o mesmo HTML.
export const createApp = ViteSSG(App, ({ app }) => {
  app.directive('reveal', vReveal)
})
