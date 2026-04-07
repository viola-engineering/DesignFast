import Stripe from 'stripe';
import { query } from '../db.js';
import { authMiddleware } from '../auth.js';

// Credit packages available for purchase
const CREDIT_PACKAGES = {
  '50': { credits: 50, priceEur: 500 },     // €5
  '100': { credits: 100, priceEur: 1000 },  // €10
  '250': { credits: 250, priceEur: 2200 },  // €22
  '500': { credits: 500, priceEur: 4000 }   // €40
};

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export default async function (app) {
  // Create checkout session for credit purchase
  app.post('/api/billing/checkout', { preHandler: authMiddleware }, async (req, reply) => {
    const stripe = getStripe();
    if (!stripe) {
      return reply.code(501).send({ error: 'Billing not configured' });
    }

    const userId = req.userId;

    const { package: packageId } = req.body;
    const pkg = CREDIT_PACKAGES[packageId];
    if (!pkg) {
      return reply.code(400).send({ error: 'Invalid package' });
    }

    // Get or create Stripe customer
    const { rows } = await query(
      'SELECT email, stripe_customer_id FROM designfast.users WHERE id = $1',
      [userId]
    );
    if (rows.length === 0) {
      return reply.code(404).send({ error: 'User not found' });
    }

    let customerId = rows[0].stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: rows[0].email,
        metadata: { userId }
      });
      customerId = customer.id;
      await query(
        'UPDATE designfast.users SET stripe_customer_id = $1 WHERE id = $2',
        [customerId, userId]
      );
    }

    // Create checkout session
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'eur',
          unit_amount: pkg.priceEur,
          product_data: {
            name: `${pkg.credits} DesignFast Credits`,
            description: `One-time purchase of ${pkg.credits} credits`
          }
        },
        quantity: 1
      }],
      metadata: {
        userId,
        credits: pkg.credits.toString()
      },
      success_url: `${baseUrl}/account?purchase=success`,
      cancel_url: `${baseUrl}/account?purchase=cancelled`
    });

    return reply.send({ url: session.url });
  });

  // Portal not needed for one-time purchases, but keep stub
  app.post('/api/billing/portal', async (req, reply) => {
    return reply.code(501).send({ error: 'Not applicable for credit purchases' });
  });

  // Handle Stripe webhook
  app.post('/api/billing/webhook', {
    config: { rawBody: true }
  }, async (req, reply) => {
    const stripe = getStripe();
    if (!stripe) {
      return reply.code(200).send({ ok: true });
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.log('[billing] webhook secret not configured');
      return reply.code(200).send({ ok: true });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (err) {
      console.error('[billing] webhook signature verification failed:', err.message);
      return reply.code(400).send({ error: 'Invalid signature' });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const credits = parseInt(session.metadata?.credits, 10);

      if (userId && credits > 0) {
        // Add credits and set plan to pro
        await query(
          `UPDATE designfast.users
           SET credits_limit = credits_limit + $1, plan = 'pro'
           WHERE id = $2`,
          [credits, userId]
        );
        console.log(`[billing] added ${credits} credits to user ${userId}`);
      }
    }

    return reply.code(200).send({ ok: true });
  });
}
