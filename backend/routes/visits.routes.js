const express = require('express');
const router = express.Router();
const controller = require('../controllers/visits.controller');

// UI display APIs
router.get('/', controller.getVisits);
router.get('/:id', controller.getVisitById);

module.exports = router;