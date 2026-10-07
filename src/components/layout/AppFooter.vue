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
    <p>
      <span class="prompt-dollar" aria-hidden="true">$ </span>echo "© {{ year }} Vittorio Perotto — feito com Vue, Tailwind e Vue Bits"
    </p>
    <p class="footer-exit">process finished with <span class="hl-green">exit code 0</span></p>
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

/* sem o opacity: 0.7 anterior, que deixava o texto em 3,1:1 (FR-022) */
.footer-exit { margin-top: calc(var(--spacing) * 2); }
</style>
