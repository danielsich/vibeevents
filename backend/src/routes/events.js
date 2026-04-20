const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');

router.route('/').get(getAllEvents).post(createEvent);
router.route('/:id').get(getEventById).put(updateEvent).delete(deleteEvent);

module.exports = router;
