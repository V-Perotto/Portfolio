import { ViteSSG } from 'vite-ssg/single-page'
import App from './App.vue'
import { vReveal } from './directives/reveal'
import './styles/main.css'

// vite-ssg pré-renderiza a página no build (Princípio III); no cliente, hidrata o mesmo HTML.
export const createApp = ViteSSG(App, ({ app, isClient }) => {
  app.directive('reveal', vReveal)
  // avisa o script inline do <head> que o JS principal rodou: sem esta classe no fim do boot, ele
  // desliga o movimento (index.html)
  if (isClient) document.documentElement.classList.add('app-loaded')
})
