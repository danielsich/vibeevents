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

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Cache the Mongo connection across serverless invocations
let cachedConnection = null;
async function connectDB() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set');
  }
  cachedConnection = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  return cachedConnection;
}

// Connect on each request (cached after first call)
app.use(async (req, res, next) => {
  // Skip DB in test mode and for routes that don't need it
  if (process.env.NODE_ENV === 'test') return next();
  if (req.path === '/api/health') return next();
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ DB connection failed:', err.message);
    res.status(503).json({
      success: false,
      message: 'Database unavailable. Please try again shortly.',
    });
  }
});

app.use('/api/health',   healthRouter);
app.use('/api/events',   eventsRouter);
app.use('/api/orders',   ordersRouter);
app.use('/api/payments', paymentsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Only call listen() locally, not on Vercel
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => console.log(`🚀 VibeEvents API on http://localhost:${PORT}`));
    })
    .catch(err => {
      console.error('❌ Failed to connect to MongoDB:', err.message);
      process.exit(1);
    });
}

module.exports = app;