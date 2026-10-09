import { defineConfig, devices } from '@playwright/test'

/**
 * Testes que dependem de WebGL (Faulty Terminal atrás da porta de acesso, features 004 e 005; peso com
 * o worker da cena). O Dot Field do hero (005) é canvas 2D e roda no projeto comum. No Chromium headless o WebGL é por software e pesa na CPU: com muitas páginas
 * WebGL em paralelo, os timers de todas atrasam. Esses arquivos rodam num projeto próprio, um teste
 * de cada vez; o resto roda com WebGL desligado, o que também exercita os fundos estáticos de quem
 * não tem WebGL (FR-033, FR-039).
 */
const WEBGL = /(^|[\\/])(boot|motion|weight)\.spec\.ts$/

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  // feature 006: com as janelas de editor e o Letter Glitch, as páginas pesam mais; com ~9 navegadores
  // ao mesmo tempo (metade dos núcleos), o app às vezes monta depois do limite da porta (2055 ms) e os
  // testes de tempo e do axe estouram. Com 4, a suíte inteira passa de forma estável (~7,5 min)
  workers: process.env.CI ? undefined : 4,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173/Portfolio/',
  },
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173/Portfolio/',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: WEBGL,
      use: { ...devices['Desktop Chrome'], launchOptions: { args: ['--disable-webgl'] } },
    },
    {
      name: 'webgl',
      testMatch: WEBGL,
      fullyParallel: false,
      // uma página com WebGL por software de cada vez, em paralelo ao projeto principal
      workers: 1,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
