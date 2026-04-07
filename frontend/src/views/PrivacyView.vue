<template>
  <div class="legal-page">
    <div class="legal-container">
      <h1>Privacy Policy</h1>
      <p class="last-updated">Last updated: {{ lastUpdated }}</p>

      <section>
        <h2>1. Who We Are</h2>
        <p>
          DesignFast is a product by <a href="https://viola.engineering/" target="_blank" rel="noopener">Viola Engineering</a>,
          based in the European Union.
        </p>
        <p>
          For privacy-related inquiries, contact us at: <strong>privacy@viola.engineering</strong>
        </p>
      </section>

      <section>
        <h2>2. Data We Collect</h2>
        <p>We collect and process the following data:</p>
        <ul>
          <li><strong>Account information:</strong> Email address and password (hashed) when you register</li>
          <li><strong>Generation data:</strong> The prompts you submit and the websites we generate for you</li>
          <li><strong>Usage data:</strong> Pages visited, features used, timestamps</li>
          <li><strong>Payment data:</strong> Processed by our payment provider; we do not store card details</li>
        </ul>
      </section>

      <section>
        <h2>3. How We Use Your Data</h2>
        <p>We use your data to:</p>
        <ul>
          <li>Provide and improve the DesignFast service</li>
          <li>Process your generations and store your history</li>
          <li>Send transactional emails (account confirmation, password reset)</li>
          <li>Process payments and manage your subscription</li>
          <li>Respond to support requests</li>
        </ul>
      </section>

      <section>
        <h2>4. Legal Basis (GDPR)</h2>
        <p>We process your data based on:</p>
        <ul>
          <li><strong>Contract performance:</strong> To provide the service you signed up for</li>
          <li><strong>Legitimate interest:</strong> To improve our service and prevent abuse</li>
          <li><strong>Consent:</strong> For optional marketing communications (if applicable)</li>
        </ul>
      </section>

      <section>
        <h2>5. Third-Party Services</h2>
        <p>We share data with the following providers to deliver our service:</p>
        <ul>
          <li>
            <strong>AI Providers:</strong> Your prompts are sent to Anthropic (Claude) and/or Google (Gemini)
            for generation. These providers have their own privacy policies and may process data in the US
            under Standard Contractual Clauses.
          </li>
          <li>
            <strong>Payment processing:</strong> <a href="https://stripe.com/privacy" target="_blank" rel="noopener">Stripe</a> for secure payment handling
          </li>
          <li>
            <strong>Hosting:</strong> Our servers are located in the European Union
          </li>
        </ul>
        <p>
          <strong>Important:</strong> Your prompts are processed by AI providers. We encourage you not to
          include personal or sensitive information in your generation prompts.
        </p>
      </section>

      <section>
        <h2>6. Data Storage and Retention</h2>
        <ul>
          <li>All data is stored on servers located in the European Union</li>
          <li>Account data is retained while your account is active</li>
          <li>Generation history is retained for 12 months, or until you delete it</li>
          <li>After account deletion, we remove your data within 30 days (except where legally required)</li>
        </ul>
      </section>

      <section>
        <h2>7. Your Rights (GDPR)</h2>
        <p>As an EU resident, you have the right to:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of your personal data</li>
          <li><strong>Rectification:</strong> Correct inaccurate data</li>
          <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
          <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
          <li><strong>Object:</strong> Object to certain processing activities</li>
          <li><strong>Withdraw consent:</strong> Where processing is based on consent</li>
        </ul>
        <p>
          To exercise these rights, email us at <strong>[your-email@example.com]</strong>.
          We will respond within 30 days.
        </p>
        <p>
          You also have the right to lodge a complaint with your local data protection authority.
        </p>
      </section>

      <section>
        <h2>8. Cookies</h2>
        <p>We use cookies for:</p>
        <ul>
          <li><strong>Essential cookies:</strong> To keep you logged in and remember your preferences</li>
          <li><strong>Analytics cookies:</strong> To understand how the service is used (optional, with consent)</li>
        </ul>
        <p>You can manage cookie preferences in your browser settings.</p>
      </section>

      <section>
        <h2>9. Security</h2>
        <p>We protect your data through:</p>
        <ul>
          <li>Encrypted connections (HTTPS/TLS)</li>
          <li>Hashed passwords (never stored in plain text)</li>
          <li>Regular security updates</li>
          <li>Access controls and monitoring</li>
        </ul>
      </section>

      <section>
        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. Significant changes will be communicated
          via email or a notice on the website.
        </p>
      </section>

      <section>
        <h2>11. Contact</h2>
        <p>
          For questions about this privacy policy or your data, contact:<br>
          <strong>Viola Engineering</strong><br>
          Email: <strong>privacy@viola.engineering</strong><br>
          Website: <a href="https://viola.engineering/" target="_blank" rel="noopener">viola.engineering</a>
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const lastUpdated = 'April 2026'
</script>

<style scoped>
.legal-page {
  min-height: 100vh;
  background: var(--color-background);
  padding: 2rem 1rem 4rem;
}

.legal-container {
  max-width: 800px;
  margin: 0 auto;
  color: var(--color-text);
}

h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.last-updated {
  color: var(--color-text-muted);
  margin-bottom: 2rem;
}

section {
  margin-bottom: 2rem;
}

h2 {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  color: var(--color-text);
}

p {
  line-height: 1.7;
  margin-bottom: 0.75rem;
}

ul {
  margin-left: 1.5rem;
  margin-bottom: 0.75rem;
}

li {
  line-height: 1.7;
  margin-bottom: 0.5rem;
}

strong {
  color: var(--color-text);
}
</style>
