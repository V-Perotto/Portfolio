<script setup lang="ts">
import { onMounted, ref } from 'vue'

// o build grava o ano em que rodou; no navegador, corrige para o ano corrente (FR-013)
const year = ref(new Date().getFullYear())
onMounted(() => {
  year.value = new Date().getFullYear()
})
</script>

<template>
  <footer class="footer mono">
    <!-- só o copyright (FR-040 da 004) -->
    <p><span class="prompt-dollar" aria-hidden="true">$ </span>echo "© {{ year }} Vittorio Perotto"</p>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: calc(var(--spacing) * 20);
  padding: calc(var(--spacing) * 8.8) calc(var(--spacing) * 6);
  border-top: 1px solid var(--border);
  text-align: center;
  color: var(--text-dim);
  font-size: 0.82rem;
  background: var(--bg-alt);
}

/* com JS existe a dock no centro de baixo (feature 004): o rodapé ganha o espaço dela, e o texto
   fica inteiro acima da dock ao rolar até o fim (FR-027) */
html.js .footer { padding-bottom: calc(var(--spacing) * 8.8 + var(--dock-space)); }
</style>
