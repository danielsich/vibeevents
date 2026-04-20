const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');

/**
 * POST /api/payments/create-intent
 * Creates a Stripe PaymentIntent and returns the clientSecret to the frontend.
 * The frontend uses this to confirm the payment via Stripe Elements.
 */
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency = 'eur', metadata = {} } = req.body;

    if (!amount || amount < 50) {
      return res.status(400).json({ success: false, message: 'Amount must be at least 50 cents.' });
    }

    // Strip null/undefined metadata values to prevent Stripe API crashes
    const safeMetadata = {};
    for (const key in metadata) {
      if (metadata[key] !== null && metadata[key] !== undefined) {
        safeMetadata[key] = String(metadata[key]);
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,        // in cents
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: safeMetadata,
    });

    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/payments/webhook
 * Stripe webhook handler – marks orders as paid when payment succeeds.
 * Requires raw body (not JSON-parsed) – configured in index.js.
 */
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    const orderId = pi.metadata.orderId;

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        stripePaymentIntentId: pi.id,
        status: 'pending', // move to queue after payment confirmed
      });
      console.log(`✅ Payment confirmed for order ${orderId}`);
    }
  }

  res.json({ received: true });
};