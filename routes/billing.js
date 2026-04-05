export default async function (app) {
  app.post('/api/billing/checkout', async (req, reply) => {
    return reply.code(501).send({ error: 'Billing not configured' });
  });

  app.post('/api/billing/portal', async (req, reply) => {
    return reply.code(501).send({ error: 'Billing not configured' });
  });

  app.post('/api/billing/webhook', async (req, reply) => {
    console.log('[billing] webhook received:', req.body);
    return reply.code(200).send({ ok: true });
  });
}
