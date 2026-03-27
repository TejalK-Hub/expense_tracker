const express = require('express');
const router = express.Router();
const controller = require('../controllers/visits.controller');
const authMiddleware = require('../middleware/auth');

// UI display APIs
router.get('/', authMiddleware, controller.getVisits);

// ACTIVE VISITS DROPDOWN
router.get('/active/self', authMiddleware, controller.getSelfActiveVisits);

router.get('/active/list', authMiddleware, controller.getActiveVisits);

router.get('/:id', authMiddleware, controller.getVisitById);


module.exports = router;