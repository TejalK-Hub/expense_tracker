const express = require('express');
const router = express.Router();
const controller = require('../controllers/expense.admin.controller');

// Admin expense history
router.get('/all', controller.getAllExpenses);

router.put('/:id/status', controller.updateStatus);

module.exports = router;