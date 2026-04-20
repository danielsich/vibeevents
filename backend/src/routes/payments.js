const express = require('express');
const router = express.Router();
const { createPaymentIntent, handleWebhook } = require('../controllers/paymentController');

// Webhook must use raw body – Stripe needs the raw request to verify signature
// This route is mounted BEFORE express.json() in index.js
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Create a PaymentIntent (called by frontend checkout)
router.post('/create-intent', createPaymentIntent);

module.exports = router;
