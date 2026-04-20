/**
 * Seed Script – populates MongoDB with a demo event, stations, and menu items.
 *
 * Usage:
 *   npm run seed               (uses MONGO_URI from backend/.env)
 *   MONGO_URI=<uri> npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Order = require('../models/Order');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/eventflow';

const demoEvent = {
  name: 'Campus Spring Festival 2025',
  description: 'The biggest student festival of the year at TU München.',
  location: 'TU München – Audimax Plaza',
  date: new Date('2025-05-10T16:00:00Z'),
  isActive: true,
  createdBy: 'admin@tum.de',
  stations: [
    {
      name: 'Drinks Bar 🍺',
      description: 'Cold beers, soft drinks, and cocktails',
      isOpen: true,
      menuItems: [
        { name: 'Cold Beer (0.5L)',     description: 'Crispy Helles vom Fass', price: 450, isAvailable: true },
        { name: 'Radler (0.5L)',        description: 'Beer & Lemon mix',        price: 400, isAvailable: true },
        { name: 'Cola / Fanta / Sprite', description: '0.33L can',              price: 200, isAvailable: true },
        { name: 'Water (still)',        description: '0.5L bottle',             price: 150, isAvailable: true },
        { name: 'Hugo Spritz',         description: 'Elderflower, Prosecco',   price: 550, isAvailable: true },
        { name: 'Classic Club Mate',   description: '0.5L bottle',             price: 250, isAvailable: true },
      ],
    },
    {
      name: 'Grill Station 🔥',
      description: 'Burgers, sausages, and veggie options',
      isOpen: true,
      menuItems: [
        { name: 'Classic Cheeseburger', description: 'Beef patty, cheddar, pickles', price: 950,  isAvailable: true },
        { name: 'Veggie Burger',        description: 'Plant-based, avocado',          price: 900,  isAvailable: true },
        { name: 'Bratwurst + Bun',      description: 'Served with mustard',           price: 650,  isAvailable: true },
        { name: 'Currywurst',           description: 'With fries',                    price: 750,  isAvailable: true },
        { name: 'Pommes (large)',       description: 'Crispy fries',                  price: 350,  isAvailable: true },
        { name: 'Onion Rings',          description: '8 pcs, dipping sauce',          price: 400,  isAvailable: true },
      ],
    },
    {
      name: 'Merch & Snacks 🎽',
      description: 'Festival merch and quick snacks',
      isOpen: true,
      menuItems: [
        { name: 'Festival T-Shirt',  description: 'Sizes S–XXL, limited edition', price: 2500, isAvailable: true },
        { name: 'Tote Bag',          description: 'EventFlow branded',             price: 1200, isAvailable: true },
        { name: 'Pretzel (large)',   description: 'Fresh baked, with butter',      price: 300,  isAvailable: true },
        { name: 'Chips (bag)',       description: 'Paprika flavour',               price: 200,  isAvailable: true },
      ],
    },
  ],
};

async function seed() {
  console.log('🌱 Connecting to MongoDB:', MONGO_URI);
  await mongoose.connect(MONGO_URI);

  // Clear existing demo data
  await Event.deleteMany({ createdBy: 'admin@tum.de' });
  await Order.deleteMany({});
  console.log('🗑  Cleared existing demo data');

  const event = await Event.create(demoEvent);
  console.log(`✅ Created event: "${event.name}" (ID: ${event._id})`);
  event.stations.forEach(s => {
    console.log(`   📍 Station: ${s.name} (ID: ${s._id}) — ${s.menuItems.length} items`);
  });

  console.log('\n🔗 QR Code URLs for each station:');
  event.stations.forEach(s => {
    console.log(`   http://localhost:3000/order?event=${event._id}&station=${s._id}  ← ${s.name}`);
  });

  await mongoose.disconnect();
  console.log('\n✨ Seed complete!');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
