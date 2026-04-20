const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, default: '' },
  price:       { type: Number, required: true },  // in cents (e.g. 400 = €4.00)
  imageUrl:    { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
});

const stationSchema = new mongoose.Schema({
  name:        { type: String, required: true },  // e.g. "Drinks", "Grill"
  description: { type: String, default: '' },
  isOpen:      { type: Boolean, default: true },
  menuItems:   [menuItemSchema],
});

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    location: { type: String, default: '' },
    date: { type: Date, required: true },
    stations: [stationSchema],
    isActive: { type: Boolean, default: false },
    createdBy: { type: String, default: '' }, // admin identifier
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
