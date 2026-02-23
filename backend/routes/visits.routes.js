const express = require('express');
const router = express.Router();
const controller = require('../controllers/visits.controller');
const authMiddleware = require('../middleware/auth');

// UI display APIs
router.get('/', authMiddleware, controller.getVisits);
router.get('/:id', authMiddleware, controller.getVisitById);

module.exports = router;