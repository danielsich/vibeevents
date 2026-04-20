const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrderByToken,
  createOrder,
  updateOrderStatus,
} = require('../controllers/orderController');

router.route('/').get(getOrders).post(createOrder);
router.get('/token/:token', getOrderByToken);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
