<template>
  <div class="legal-page">
    <div class="legal-container">
      <h1>Terms of Service</h1>
      <p class="last-updated">Last updated: {{ lastUpdated }}</p>

      <section>
        <h2>1. Agreement</h2>
        <p>
          By using DesignFast, you agree to these terms. If you don't agree, please don't use the service.
        </p>
        <p>
          DesignFast is a product by <a href="https://viola.engineering/" target="_blank" rel="noopener">Viola Engineering</a>,
          based in the European Union.
        </p>
      </section>

      <section>
        <h2>2. The Service</h2>
        <p>
          DesignFast is an AI-powered tool that generates website and webapp code based on your prompts.
          The service uses third-party AI models (Claude by Anthropic, Gemini by Google) to generate output.
        </p>
      </section>

      <section>
        <h2>3. Your Account</h2>
        <ul>
          <li>You must provide accurate information when registering</li>
          <li>You are responsible for keeping your password secure</li>
          <li>You are responsible for all activity under your account</li>
          <li>One account per person; accounts cannot be shared</li>
        </ul>
      </section>

      <section>
        <h2>4. Acceptable Use</h2>
        <p>You agree NOT to use DesignFast to:</p>
        <ul>
          <li>Generate illegal, harmful, or abusive content</li>
          <li>Create content that infringes on others' intellectual property</li>
          <li>Generate malware, phishing pages, or deceptive content</li>
          <li>Attempt to abuse, overload, or disrupt the service</li>
          <li>Circumvent usage limits or access controls</li>
          <li>Resell the service without authorization</li>
        </ul>
        <p>
          We reserve the right to suspend or terminate accounts that violate these terms.
        </p>
      </section>

      <section>
        <h2>5. Ownership and Intellectual Property</h2>
        <h3>Your content</h3>
        <p>
          You own the prompts you submit and retain full rights to the generated output.
          You can use generated code for personal or commercial purposes.
        </p>
        <h3>Our service</h3>
        <p>
          DesignFast, including its design, features, and underlying technology, remains our property.
          These terms do not grant you rights to our branding, trademarks, or proprietary systems.
        </p>
        <h3>AI-generated content</h3>
        <p>
          Generated output may resemble existing designs or code patterns, as AI models are trained on
          public data. You are responsible for reviewing output and ensuring it doesn't infringe on
          others' rights.
        </p>
      </section>

      <section>
        <h2>6. Payments and Subscriptions</h2>
        <ul>
          <li>Paid plans are billed in advance on a monthly or annual basis</li>
          <li>Prices may change with 30 days notice</li>
          <li>Refunds are handled on a case-by-case basis; contact us if you're unsatisfied</li>
          <li>Unused credits or generations do not roll over between billing periods</li>
        </ul>
      </section>

      <section>
        <h2>7. Free Tier and Trials</h2>
        <p>
          Free accounts have limited generations. We may modify or discontinue free offerings at any time.
        </p>
      </section>

      <section>
        <h2>8. Service Availability</h2>
        <p>
          We aim for high availability but don't guarantee uninterrupted service. The service depends on
          third-party AI providers which may have their own outages or limitations.
        </p>
        <p>
          We may modify, suspend, or discontinue features with reasonable notice.
        </p>
      </section>

      <section>
        <h2>9. Disclaimer of Warranties</h2>
        <p>
          DesignFast is provided "as is" without warranties of any kind. We do not guarantee that:
        </p>
        <ul>
          <li>Generated output will be error-free, secure, or fit for any particular purpose</li>
          <li>The service will meet all your requirements</li>
          <li>Results will be identical across different generations</li>
        </ul>
        <p>
          <strong>You are responsible for testing and reviewing all generated code before using it
          in production.</strong>
        </p>
      </section>

      <section>
        <h2>10. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, we are not liable for any indirect, incidental,
          special, or consequential damages arising from your use of the service.
        </p>
        <p>
          Our total liability is limited to the amount you paid for the service in the 12 months
          preceding the claim.
        </p>
        <p>
          This limitation does not apply where prohibited by law (e.g., for gross negligence or
          intentional misconduct).
        </p>
      </section>

      <section>
        <h2>11. Indemnification</h2>
        <p>
          You agree to indemnify and hold us harmless from claims arising from your use of the service,
          your content, or your violation of these terms.
        </p>
      </section>

      <section>
        <h2>12. Termination</h2>
        <ul>
          <li>You can delete your account at any time from your account settings</li>
          <li>We may suspend or terminate accounts that violate these terms</li>
          <li>Upon termination, your right to use the service ends immediately</li>
          <li>We may retain certain data as required by law or for legitimate business purposes</li>
        </ul>
      </section>

      <section>
        <h2>13. Changes to Terms</h2>
        <p>
          We may update these terms. Material changes will be communicated via email or website notice
          at least 30 days before taking effect. Continued use after changes constitutes acceptance.
        </p>
      </section>

      <section>
        <h2>14. Governing Law</h2>
        <p>
          These terms are governed by the laws of the European Union and the applicable laws
          of the operator's country of residence.
        </p>
        <p>
          If you are a consumer in the EU, you retain the protection of mandatory consumer laws
          of your country of residence.
        </p>
      </section>

      <section>
        <h2>15. Contact</h2>
        <p>
          Questions about these terms? Contact us at:<br>
          <strong>hello@viola.engineering</strong><br>
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

h3 {
  font-size: 1rem;
  margin: 1rem 0 0.5rem;
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
