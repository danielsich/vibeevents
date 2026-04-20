const express = require('express');
const router = express.Router();

/**
 * GET /api/health
 * Health check endpoint – used by CI/CD and load balancers.
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'eventflow-api',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
