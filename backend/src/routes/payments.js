const express = require('express');
const router = express.Router();
const { createPaymentIntent } = require('../controllers/paymentController');

// Create a PaymentIntent (called by frontend checkout)
router.post('/create-intent', createPaymentIntent);

module.exports = router;
