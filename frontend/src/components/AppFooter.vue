<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="footer">
    <span class="footer-wordmark">Design<em>Fast</em></span>
    <div class="footer-links">
      <RouterLink to="/pricing">Pricing</RouterLink>
      <RouterLink to="/styles">Styles</RouterLink>
      <a href="#">Docs</a>
      <a href="#">Privacy</a>
      <a href="#">Terms</a>
    </div>
    <span class="footer-copy">&copy; {{ new Date().getFullYear() }} DesignFast. Build something worth shipping.</span>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--dark);
  color: var(--white);
  padding: 2rem var(--sp-page, clamp(1.5rem, 5vw, 5rem));
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.footer-wordmark {
  font-family: var(--ff-display, 'Playfair Display', Georgia, serif);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.footer-wordmark em {
  color: var(--accent);
  font-style: normal;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.footer-links a {
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(253, 251, 247, 0.5);
  text-decoration: none;
  letter-spacing: 0.04em;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: rgba(253, 251, 247, 0.85);
}

.footer-copy {
  font-size: 0.6875rem;
  color: rgba(253, 251, 247, 0.35);
  letter-spacing: 0.04em;
}

@media (max-width: 768px) {
  .footer {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .footer-links {
    justify-content: center;
  }
}
</style>
