const Order = require('../models/Order');

// GET /api/orders  (station view – filter by eventId & stationId via query params)
exports.getOrders = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.eventId) filter.eventId = req.query.eventId;
    if (req.query.stationId) filter.stationId = req.query.stationId;
    if (req.query.status) filter.status = req.query.status;

    const orders = await Order.find(filter).sort({ createdAt: 1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/token/:token  (guest view – check own order status)
exports.getOrderByToken = async (req, res, next) => {
  try {
    const order = await Order.findOne({ guestToken: req.params.token });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// POST /api/orders  (guest places order)
exports.createOrder = async (req, res, next) => {
  try {
    const { eventId, stationId, guestName, items } = req.body;
    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const guestToken = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const queueCount = await Order.countDocuments({ eventId, stationId, status: 'pending' });

    const order = await Order.create({
      eventId,
      stationId,
      guestName,
      guestToken,
      items,
      totalAmount,
      queuePosition: queueCount + 1,
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/orders/:id/status  (station updates order status)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};
