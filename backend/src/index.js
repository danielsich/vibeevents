require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const healthRouter = require('./routes/health');
const eventsRouter = require('./routes/events');
const ordersRouter = require('./routes/orders');
const paymentsRouter = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
// Stripe webhook needs raw body BEFORE express.json() parses it
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/health',   healthRouter);
app.use('/api/events',   eventsRouter);
app.use('/api/orders',   ordersRouter);
app.use('/api/payments', paymentsRouter);

// ── Global Error Handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ── Database & Server Start ───────────────────────────────────────────────────
const startServer = async () => {
  try {
    if (process.env.NODE_ENV !== 'test') {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ MongoDB connected');
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 EventFlow API running on http://localhost:${PORT}`);
    });

    return server;
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app; // exported for testing
