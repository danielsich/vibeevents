const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },    // in cents
});

const orderSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    stationId: { type: String, required: true },
    guestName: { type: String, required: true, trim: true },
    guestToken: { type: String, required: true }, // unique per guest session
    items: [orderItemSchema],
    totalAmount: { type: Number, default: 0 },   // in cents
    status: {
      type: String,
      enum: ['pending', 'processing', 'ready', 'completed', 'cancelled'],
      default: 'pending',
    },
    queuePosition: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    stripePaymentIntentId: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
